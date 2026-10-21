import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function decrypt(encryptedBase64: string, key: string): Promise<string> {
  const keyHash = await crypto.subtle.digest('SHA-256', encoder.encode(key));
  const cryptoKey = await crypto.subtle.importKey('raw', keyHash, { name: 'AES-GCM' }, false, ['decrypt']);
  const data = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
  return decoder.decode(decrypted);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionKey = Deno.env.get('APP_ENCRYPTION_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { to, subject, html, text, replyTo } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: to, subject, html ou text' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get Resend API key from settings (encrypted)
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['email_api_key_encrypted', 'email_from', 'email_from_name', 'email_reply_to']);

    let apiKey = '';
    let fromEmail = 'noreply@example.com';
    let fromName = 'Plataforma';
    let defaultReplyTo = '';

    for (const s of settings || []) {
      if (s.key === 'email_api_key_encrypted' && encryptionKey) {
        try {
          apiKey = await decrypt(s.value as string, encryptionKey);
        } catch (e) {
          console.error('Error decrypting API key:', e);
        }
      }
      if (s.key === 'email_from') fromEmail = s.value as string || fromEmail;
      if (s.key === 'email_from_name') fromName = s.value as string || fromName;
      if (s.key === 'email_reply_to') defaultReplyTo = s.value as string || '';
    }

    // Fallback to environment variable
    if (!apiKey) {
      apiKey = Deno.env.get('RESEND_API_KEY') || '';
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API de e-mail não configurada' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo || defaultReplyTo || undefined,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Resend error:', result);
      return new Response(JSON.stringify({ error: result.message || 'Erro ao enviar e-mail' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
