import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHmac, timingSafeEqual } from 'node:crypto';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get('APP_ENCRYPTION_KEY');
  if (!keyString) throw new Error('APP_ENCRYPTION_KEY not configured');
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(keyString), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: encoder.encode('supabase-credentials-salt'), iterations: 100000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function decrypt(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return decoder.decode(decrypted);
}

function createServiceClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}

function verifyAsaasToken(token: string | null, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  const a = encoder.encode(token);
  const b = encoder.encode(expectedToken);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function verifyMercadoPagoSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !xRequestId || !secret) return false;
  
  // Parse x-signature header: "ts=timestamp,v1=hash"
  const parts: Record<string, string> = {};
  xSignature.split(',').forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) parts[key.trim()] = value.trim();
  });
  
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;
  
  // Build the manifest string as per MercadoPago docs
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  
  // Generate HMAC-SHA256
  const hmac = createHmac('sha256', secret);
  hmac.update(manifest);
  const generatedHash = hmac.digest('hex');
  
  // Timing-safe comparison
  const a = encoder.encode(v1);
  const b = encoder.encode(generatedHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface WebhookEvent {
  provider: string;
  eventId: string;
  eventType: string;
  paymentId?: string;
  status?: string;
  payload: Record<string, unknown>;
}

function parseMercadoPagoEvent(body: Record<string, unknown>): WebhookEvent | null {
  const action = body.action as string;
  const data = body.data as Record<string, unknown>;
  if (!action || !data?.id) return null;
  const statusMap: Record<string, string> = {
    'payment.created': 'pending', 'payment.updated': 'processing', 'payment.approved': 'approved',
    'payment.rejected': 'declined', 'payment.cancelled': 'cancelled', 'payment.refunded': 'refunded'
  };
  return { provider: 'mercadopago', eventId: `${body.id}`, eventType: action, paymentId: `${data.id}`, status: statusMap[action], payload: body };
}

function parseAsaasEvent(body: Record<string, unknown>): WebhookEvent | null {
  const event = body.event as string;
  const payment = body.payment as Record<string, unknown>;
  if (!event) return null;
  const statusMap: Record<string, string> = {
    'PAYMENT_CREATED': 'pending', 'PAYMENT_UPDATED': 'processing', 'PAYMENT_CONFIRMED': 'approved',
    'PAYMENT_RECEIVED': 'approved', 'PAYMENT_DELETED': 'cancelled', 'PAYMENT_REFUNDED': 'refunded'
  };
  return { provider: 'asaas', eventId: payment?.id as string || `${Date.now()}`, eventType: event, paymentId: payment?.id as string, status: statusMap[event], payload: body };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');
  if (!provider) return new Response('Provider not specified', { status: 400 });
  const body = await req.text();
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(body); } catch { return new Response('Invalid JSON', { status: 400 }); }
  const supabase = createServiceClient();
  try {
    const { data: providerConfig } = await supabase.from('payment_providers').select('id, provider_type, environment').eq('provider_type', provider).eq('status', 'working').single();
    if (!providerConfig) return new Response('Provider not configured', { status: 400 });
    const { data: credentials } = await supabase.from('payment_provider_credentials').select('credential_type, encrypted_value').eq('provider_id', providerConfig.id).in('credential_type', ['webhook_secret', 'webhook_token']);
    let webhookSecret = '';
    if (credentials && credentials.length > 0) {
      webhookSecret = await decrypt(credentials[0].encrypted_value);
    }
    
    // SECURITY: Require webhook secret for all providers
    if (!webhookSecret) {
      console.error(`Webhook secret not configured for provider: ${provider}`);
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    let isValid = false;
    
    if (provider === 'mercadopago') {
      const xSignature = req.headers.get('x-signature');
      const xRequestId = req.headers.get('x-request-id');
      const dataId = (payload.data as Record<string, unknown>)?.id as string || '';
      isValid = verifyMercadoPagoSignature(xSignature, xRequestId, dataId, webhookSecret);
    } else if (provider === 'asaas') {
      isValid = verifyAsaasToken(req.headers.get('asaas-access-token'), webhookSecret);
    }
    
    if (!isValid) {
      console.error(`Invalid webhook signature for provider: ${provider}`);
      return new Response('Invalid signature', { status: 401 });
    }
    let event: WebhookEvent | null = null;
    if (provider === 'mercadopago') event = parseMercadoPagoEvent(payload);
    else if (provider === 'asaas') event = parseAsaasEvent(payload);
    if (!event) return new Response('Invalid event format', { status: 400 });
    const { data: existing } = await supabase.from('webhook_events').select('id, status').eq('provider', event.provider).eq('event_id', event.eventId).single();
    if (existing) return new Response(JSON.stringify({ message: 'Event already processed' }), { headers: { 'Content-Type': 'application/json' } });
    const { data: webhookEvent, error: insertError } = await supabase.from('webhook_events').insert({ provider: event.provider, event_id: event.eventId, event_type: event.eventType, status: 'processing', payload: event.payload }).select().single();
    if (insertError?.code === '23505') return new Response(JSON.stringify({ message: 'Event already processed' }), { headers: { 'Content-Type': 'application/json' } });
    if (event.paymentId && event.status) {
      const { data: payment } = await supabase.from('payments').select('id, order_id, status').eq('external_id', event.paymentId).single();
      if (payment) {
        await supabase.from('payments').update({ status: event.status, paid_at: event.status === 'approved' ? new Date().toISOString() : null, gateway_response: event.payload }).eq('id', payment.id);
        if (event.status === 'approved' && payment.status !== 'approved') {
          await supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', payment.order_id);
          const { data: order } = await supabase.from('orders').select('user_id').eq('id', payment.order_id).single();
          const { data: orderItems } = await supabase.from('order_items').select('course_id').eq('order_id', payment.order_id);
          if (order && orderItems) {
            for (const item of orderItems) {
              await supabase.from('enrollments').upsert({ user_id: order.user_id, course_id: item.course_id, order_id: payment.order_id, payment_id: payment.id, is_active: true }, { onConflict: 'user_id,course_id' });
            }
          }
        }
      }
    }
    await supabase.from('webhook_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', webhookEvent?.id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
