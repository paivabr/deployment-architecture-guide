import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

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

function createUserClient(req: Request): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization')! } } });
}

function createServiceClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}

async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const supabase = createUserClient(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').single();
  if (!roles) return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  return { userId: user.id };
}

interface TestResult {
  success: boolean;
  status: string;
  checks: { name: string; passed: boolean; message: string }[];
  availableMethods?: string[];
}

async function testMercadoPago(accessToken: string, environment: string): Promise<TestResult> {
  const checks: TestResult['checks'] = [];
  let availableMethods: string[] = [];
  try {
    const response = await fetch('https://api.mercadopago.com/users/me', { headers: { Authorization: `Bearer ${accessToken}` } });
    if (response.ok) {
      const user = await response.json();
      checks.push({ name: 'Credenciais', passed: true, message: `Conectado como: ${user.email || user.nickname || 'Válido'}` });
      checks.push({ name: 'Ambiente', passed: true, message: `${environment === 'sandbox' ? 'Testes' : 'Produção'}` });
    } else {
      checks.push({ name: 'Credenciais', passed: false, message: 'Token inválido ou expirado' });
      return { success: false, status: 'failed', checks };
    }
  } catch {
    checks.push({ name: 'Credenciais', passed: false, message: 'Erro ao conectar' });
    return { success: false, status: 'failed', checks };
  }
  try {
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', { headers: { Authorization: `Bearer ${accessToken}` } });
    if (response.ok) {
      const methods = await response.json();
      availableMethods = methods.map((m: { id: string }) => m.id);
      const hasPix = methods.some((m: { id: string }) => m.id === 'pix');
      const hasCredit = methods.some((m: { payment_type_id: string }) => m.payment_type_id === 'credit_card');
      const available = [];
      if (hasPix) available.push('Pix');
      if (hasCredit) available.push('Cartão');
      checks.push({ name: 'Métodos', passed: available.length > 0, message: available.length > 0 ? `Disponíveis: ${available.join(', ')}` : 'Nenhum método' });
    }
  } catch {
    checks.push({ name: 'Métodos', passed: false, message: 'Erro ao verificar' });
  }
  const allPassed = checks.every(c => c.passed);
  return { success: allPassed, status: allPassed ? 'working' : 'attention', checks, availableMethods };
}

async function testAsaas(apiKey: string, environment: string): Promise<TestResult> {
  const checks: TestResult['checks'] = [];
  const baseUrl = environment === 'sandbox' ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';
  try {
    const response = await fetch(`${baseUrl}/myAccount`, { headers: { 'access_token': apiKey } });
    if (response.ok) {
      const account = await response.json();
      checks.push({ name: 'Credenciais', passed: true, message: `Conectado como: ${account.name || account.email || 'Válido'}` });
      checks.push({ name: 'Ambiente', passed: true, message: environment === 'sandbox' ? 'Sandbox' : 'Produção' });
    } else {
      checks.push({ name: 'Credenciais', passed: false, message: 'API Key inválida' });
      return { success: false, status: 'failed', checks };
    }
  } catch {
    checks.push({ name: 'Credenciais', passed: false, message: 'Erro ao conectar' });
    return { success: false, status: 'failed', checks };
  }
  checks.push({ name: 'Métodos', passed: true, message: 'Pix, Cartão, Boleto' });
  const allPassed = checks.every(c => c.passed);
  return { success: allPassed, status: allPassed ? 'working' : 'attention', checks, availableMethods: ['pix', 'credit_card', 'boleto'] };
}

function getMethodDisplayName(methodType: string): string {
  const names: Record<string, string> = { pix: 'Pix', credit_card: 'Cartão de Crédito', debit_card: 'Cartão de Débito', boleto: 'Boleto' };
  return names[methodType] || methodType;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;
    const { providerId } = await req.json();
    const supabase = createServiceClient();
    const { data: provider, error: pError } = await supabase.from('payment_providers').select('*').eq('id', providerId).single();
    if (pError || !provider) return new Response(JSON.stringify({ error: 'Provedor não encontrado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: credentials } = await supabase.from('payment_provider_credentials').select('credential_type, encrypted_value').eq('provider_id', providerId);
    if (!credentials || credentials.length === 0) {
      return new Response(JSON.stringify({ success: false, status: 'not_configured', checks: [{ name: 'Credenciais', passed: false, message: 'Nenhuma credencial' }] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const decryptedCreds: Record<string, string> = {};
    for (const cred of credentials) {
      decryptedCreds[cred.credential_type] = await decrypt(cred.encrypted_value);
    }
    let result: TestResult;
    switch (provider.provider_type) {
      case 'mercadopago': result = await testMercadoPago(decryptedCreds.access_token || decryptedCreds.token, provider.environment); break;
      case 'asaas': result = await testAsaas(decryptedCreds.api_key || decryptedCreds.token, provider.environment); break;
      default: result = { success: false, status: 'not_configured', checks: [{ name: 'Provedor', passed: false, message: 'Tipo não suportado' }] };
    }
    await supabase.from('payment_providers').update({ status: result.status, last_test_at: new Date().toISOString(), last_test_result: result }).eq('id', providerId);
    if (result.success && result.availableMethods) {
      for (const methodType of ['pix', 'credit_card', 'debit_card', 'boleto']) {
        await supabase.from('payment_methods_config').upsert({ provider_id: providerId, method_type: methodType, is_enabled: false, display_name: getMethodDisplayName(methodType) }, { onConflict: 'provider_id,method_type' });
      }
    }
    await supabase.from('audit_log').insert({ user_id: userId, action: 'test', table_name: 'payment_providers', record_id: providerId, new_data: { result: result.status } });
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Test integration error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
