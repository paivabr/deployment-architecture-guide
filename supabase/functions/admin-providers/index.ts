import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const encoder = new TextEncoder();

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get('APP_ENCRYPTION_KEY');
  if (!keyString) {
    throw new Error('APP_ENCRYPTION_KEY not configured');
  }
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyString),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('supabase-credentials-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

function createUserClient(req: Request): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );
}

function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const supabase = createUserClient(req);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').single();
  if (!roles) {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  return { userId: user.id };
}

interface ProviderPayload {
  action: 'create' | 'update' | 'delete' | 'list' | 'get' | 'save-email-key' | 'save-panda-key';
  providerId?: string;
  data?: {
    name?: string;
    provider_type?: string;
    description?: string;
    environment?: 'sandbox' | 'production';
    is_default?: boolean;
    config?: Record<string, unknown>;
    credentials?: Record<string, string>;
  };
  apiKey?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;

    const { action, providerId, data, apiKey }: ProviderPayload = await req.json();
    const supabase = createServiceClient();

    if (action === 'list') {
      const { data: providers, error } = await supabase
        .from('payment_providers')
        .select('id, name, provider_type, description, environment, status, is_default, webhook_url, webhook_configured, last_test_at, last_test_result, config, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      for (const provider of providers || []) {
        const { data: creds } = await supabase.from('payment_provider_credentials').select('credential_type').eq('provider_id', provider.id);
        provider.configured_credentials = creds?.map(c => c.credential_type) || [];
      }
      return new Response(JSON.stringify({ providers }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'get' && providerId) {
      const { data: provider, error } = await supabase.from('payment_providers').select('*').eq('id', providerId).single();
      if (error) throw error;
      const { data: creds } = await supabase.from('payment_provider_credentials').select('credential_type').eq('provider_id', providerId);
      provider.configured_credentials = creds?.map(c => c.credential_type) || [];
      const { data: methods } = await supabase.from('payment_methods_config').select('*').eq('provider_id', providerId).order('sort_order');
      provider.payment_methods = methods || [];
      return new Response(JSON.stringify({ provider }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'create' && data) {
      if (data.is_default) {
        await supabase.from('payment_providers').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      }
      const { data: provider, error } = await supabase
        .from('payment_providers')
        .insert({ name: data.name, provider_type: data.provider_type, description: data.description, environment: data.environment || 'sandbox', is_default: data.is_default || false, config: data.config || {}, status: 'not_configured' })
        .select().single();
      if (error) throw error;
      if (data.credentials) {
        for (const [credType, value] of Object.entries(data.credentials)) {
          if (value) {
            const encryptedValue = await encrypt(value);
            await supabase.from('payment_provider_credentials').upsert({ provider_id: provider.id, credential_type: credType, encrypted_value: encryptedValue });
          }
        }
      }
      await supabase.from('audit_log').insert({ user_id: userId, action: 'create', table_name: 'payment_providers', record_id: provider.id, new_data: { name: data.name, provider_type: data.provider_type, environment: data.environment } });
      return new Response(JSON.stringify({ provider, message: 'Provedor criado com sucesso' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'update' && providerId && data) {
      if (data.is_default) {
        await supabase.from('payment_providers').update({ is_default: false }).neq('id', providerId);
      }
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.environment !== undefined) updateData.environment = data.environment;
      if (data.is_default !== undefined) updateData.is_default = data.is_default;
      if (data.config !== undefined) updateData.config = data.config;
      const { data: provider, error } = await supabase.from('payment_providers').update(updateData).eq('id', providerId).select().single();
      if (error) throw error;
      if (data.credentials) {
        for (const [credType, value] of Object.entries(data.credentials)) {
          if (value) {
            const encryptedValue = await encrypt(value);
            await supabase.from('payment_provider_credentials').upsert({ provider_id: providerId, credential_type: credType, encrypted_value: encryptedValue });
          }
        }
      }
      await supabase.from('audit_log').insert({ user_id: userId, action: 'update', table_name: 'payment_providers', record_id: providerId, new_data: { ...updateData, credentials_updated: !!data.credentials } });
      return new Response(JSON.stringify({ provider, message: 'Provedor atualizado com sucesso' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'delete' && providerId) {
      const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_provider_id', providerId);
      if (count && count > 0) {
        return new Response(JSON.stringify({ error: 'Não é possível excluir: existem pedidos associados.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { error } = await supabase.from('payment_providers').delete().eq('id', providerId);
      if (error) throw error;
      await supabase.from('audit_log').insert({ user_id: userId, action: 'delete', table_name: 'payment_providers', record_id: providerId });
      return new Response(JSON.stringify({ message: 'Provedor excluído com sucesso' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Save email API key (Resend)
    if (action === 'save-email-key' && apiKey) {
      const encryptedKey = await encrypt(apiKey);
      await supabase.from('settings').upsert(
        { key: 'email_api_key_encrypted', value: encryptedKey, category: 'email', scope: 'secret' },
        { onConflict: 'key' }
      );
      await supabase.from('settings').upsert(
        { key: 'email_configured', value: true, category: 'email', scope: 'private' },
        { onConflict: 'key' }
      );
      await supabase.from('audit_log').insert({ user_id: userId, action: 'update', table_name: 'settings', record_id: 'email_api_key' });
      return new Response(JSON.stringify({ success: true, message: 'API Key do Resend salva com sucesso' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Save Panda Video API key
    if (action === 'save-panda-key' && apiKey) {
      const encryptedKey = await encrypt(apiKey);
      await supabase.from('settings').upsert(
        { key: 'panda_api_key_encrypted', value: encryptedKey, category: 'video', scope: 'secret' },
        { onConflict: 'key' }
      );
      await supabase.from('settings').upsert(
        { key: 'panda_configured', value: true, category: 'video', scope: 'private' },
        { onConflict: 'key' }
      );
      await supabase.from('audit_log').insert({ user_id: userId, action: 'update', table_name: 'settings', record_id: 'panda_api_key' });
      return new Response(JSON.stringify({ success: true, message: 'API Key do Panda Video salva com sucesso' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Admin providers error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
