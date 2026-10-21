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
    const encryptionKey = Deno.env.get('APP_ENCRYPTION_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { courseId, paymentMethod, couponCode } = await req.json();

    // Get course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, promotional_price')
      .eq('id', courseId)
      .eq('status', 'published')
      .single();

    if (courseError || !course) {
      return new Response(JSON.stringify({ error: 'Curso não encontrado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (existingEnrollment) {
      return new Response(JSON.stringify({ error: 'Você já está matriculado neste curso' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Calculate price
    let price = course.promotional_price || course.price;
    let discount = 0;
    let couponId = null;

    // Apply coupon
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (coupon) {
        if (coupon.discount_type === 'percentage') {
          discount = (price * coupon.discount_value) / 100;
          if (coupon.max_discount_value && discount > coupon.max_discount_value) {
            discount = coupon.max_discount_value;
          }
        } else {
          discount = coupon.discount_value;
        }
        couponId = coupon.id;

        // Increment usage
        await supabase.from('coupons').update({ usage_count: coupon.usage_count + 1 }).eq('id', coupon.id);
      }
    }

    const finalPrice = Math.max(0, price - discount);

    // Get default payment provider
    const { data: provider } = await supabase
      .from('payment_providers')
      .select('id, provider_type')
      .eq('is_default', true)
      .eq('status', 'working')
      .single();

    if (!provider) {
      return new Response(JSON.stringify({ error: 'Nenhum provedor de pagamento configurado' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get provider credentials
    const { data: credentials } = await supabase
      .from('payment_provider_credentials')
      .select('credential_type, encrypted_value')
      .eq('provider_id', provider.id);

    const creds: Record<string, string> = {};
    for (const cred of credentials || []) {
      creds[cred.credential_type] = await decrypt(cred.encrypted_value, encryptionKey);
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        subtotal: price,
        discount_amount: discount,
        total: finalPrice,
        status: 'pending',
        coupon_id: couponId,
        coupon_code: couponCode,
        payment_provider_id: provider.id,
        customer_email: user.email,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order error:', orderError);
      return new Response(JSON.stringify({ error: 'Erro ao criar pedido' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create order item
    await supabase.from('order_items').insert({
      order_id: order.id,
      course_id: courseId,
      price: course.price,
      discount: (course.promotional_price ? course.price - course.promotional_price : 0) + discount,
      final_price: finalPrice,
    });

    // Create payment based on method
    let paymentResult: any = {};

    if (provider.provider_type === 'mercadopago') {
      paymentResult = await createMercadoPagoPayment(creds, order, course, user, paymentMethod, finalPrice);
    } else if (provider.provider_type === 'asaas') {
      paymentResult = await createAsaasPayment(creds, order, course, user, paymentMethod, finalPrice);
    }

    // Save payment record
    await supabase.from('payments').insert({
      order_id: order.id,
      provider_id: provider.id,
      amount: finalPrice,
      payment_method: paymentMethod,
      status: 'pending',
      external_id: paymentResult.externalId,
      pix_qr_code: paymentResult.pixCode,
      boleto_url: paymentResult.boletoUrl,
      boleto_barcode: paymentResult.boletoBarcode,
    });

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      ...paymentResult,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function createMercadoPagoPayment(creds: Record<string, string>, order: any, course: any, user: any, paymentMethod: string, amount: number) {
  const accessToken = creds['access_token'];

  if (paymentMethod === 'pix') {
    const res = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: course.title,
        payment_method_id: 'pix',
        payer: { email: user.email },
        external_reference: order.id,
      }),
    });

    const data = await res.json();
    return {
      externalId: data.id?.toString(),
      pixCode: data.point_of_interaction?.transaction_data?.qr_code,
    };
  }

  if (paymentMethod === 'boleto') {
    const res = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: course.title,
        payment_method_id: 'bolbradesco',
        payer: { email: user.email },
        external_reference: order.id,
      }),
    });

    const data = await res.json();
    return {
      externalId: data.id?.toString(),
      boletoUrl: data.transaction_details?.external_resource_url,
      boletoBarcode: data.barcode?.content,
    };
  }

  // Credit card would require more data (card token from frontend)
  return { error: 'Método de pagamento não implementado' };
}

async function createAsaasPayment(creds: Record<string, string>, order: any, course: any, user: any, paymentMethod: string, amount: number) {
  const apiKey = creds['api_key'];
  const baseUrl = 'https://api.asaas.com/v3';

  // First, create or get customer
  const customerRes = await fetch(`${baseUrl}/customers`, {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: user.email.split('@')[0],
      email: user.email,
      externalReference: user.id,
    }),
  });

  const customer = await customerRes.json();
  const customerId = customer.id || customer.errors?.[0]?.description?.match(/Customer (cus_\w+)/)?.[1];

  if (!customerId) {
    return { error: 'Erro ao criar cliente' };
  }

  const billingType = paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'boleto' ? 'BOLETO' : 'CREDIT_CARD';

  const paymentRes = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer: customerId,
      billingType,
      value: amount,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: course.title,
      externalReference: order.id,
    }),
  });

  const payment = await paymentRes.json();

  if (paymentMethod === 'pix') {
    // Get PIX code
    const pixRes = await fetch(`${baseUrl}/payments/${payment.id}/pixQrCode`, {
      headers: { 'access_token': apiKey },
    });
    const pixData = await pixRes.json();

    return {
      externalId: payment.id,
      pixCode: pixData.payload,
    };
  }

  if (paymentMethod === 'boleto') {
    return {
      externalId: payment.id,
      boletoUrl: payment.bankSlipUrl,
      boletoBarcode: payment.nossoNumero,
    };
  }

  return { externalId: payment.id };
}
