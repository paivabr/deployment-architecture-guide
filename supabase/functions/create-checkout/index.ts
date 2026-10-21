import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { createServiceClient, createSupabaseClient } from '../_shared/supabase.ts';
import { requireAuth } from '../_shared/auth.ts';
import { decrypt } from '../_shared/crypto.ts';

interface CheckoutPayload {
  courseIds: string[];
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  couponCode?: string;
  customerData: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  installments?: number;
  cardToken?: string; // For credit card payments
}

interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  pixExpiration?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  boletoExpiration?: string;
  redirectUrl?: string;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function createMercadoPagoPayment(
  accessToken: string,
  payload: {
    amount: number;
    description: string;
    paymentMethod: string;
    email: string;
    cpf: string;
    name: string;
    externalReference: string;
    installments?: number;
    cardToken?: string;
  }
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {
    transaction_amount: payload.amount,
    description: payload.description,
    payment_method_id: payload.paymentMethod === 'pix' ? 'pix' : undefined,
    external_reference: payload.externalReference,
    payer: {
      email: payload.email,
      identification: {
        type: 'CPF',
        number: payload.cpf.replace(/\D/g, ''),
      },
      first_name: payload.name.split(' ')[0],
      last_name: payload.name.split(' ').slice(1).join(' ') || payload.name.split(' ')[0],
    },
  };

  if (payload.paymentMethod === 'credit_card' && payload.cardToken) {
    body.token = payload.cardToken;
    body.installments = payload.installments || 1;
    body.payment_method_id = undefined; // Let MP determine from token
  }

  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': payload.externalReference,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar pagamento no Mercado Pago');
  }

  return response.json();
}

async function createAsaasPayment(
  apiKey: string,
  environment: string,
  payload: {
    amount: number;
    description: string;
    paymentMethod: string;
    email: string;
    cpf: string;
    name: string;
    externalReference: string;
    installments?: number;
  }
): Promise<Record<string, unknown>> {
  const baseUrl = environment === 'sandbox'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/v3';

  // First, find or create customer
  const customersResponse = await fetch(
    `${baseUrl}/customers?cpfCnpj=${payload.cpf.replace(/\D/g, '')}`,
    { headers: { 'access_token': apiKey } }
  );
  const customersData = await customersResponse.json();
  
  let customerId: string;
  if (customersData.data && customersData.data.length > 0) {
    customerId = customersData.data[0].id;
  } else {
    // Create customer
    const createCustomerResponse = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        cpfCnpj: payload.cpf.replace(/\D/g, ''),
      }),
    });
    const customer = await createCustomerResponse.json();
    if (!customer.id) {
      throw new Error(customer.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
    }
    customerId = customer.id;
  }

  // Map payment method
  const billingTypeMap: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'CREDIT_CARD',
    boleto: 'BOLETO',
  };

  // Create payment
  const paymentBody: Record<string, unknown> = {
    customer: customerId,
    billingType: billingTypeMap[payload.paymentMethod],
    value: payload.amount,
    description: payload.description,
    externalReference: payload.externalReference,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
  };

  if (payload.paymentMethod === 'credit_card') {
    paymentBody.installmentCount = payload.installments || 1;
  }

  const response = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentBody),
  });

  const payment = await response.json();
  if (!payment.id) {
    throw new Error(payment.errors?.[0]?.description || 'Erro ao criar pagamento no Asaas');
  }

  // If PIX, get QR code
  if (payload.paymentMethod === 'pix') {
    const pixResponse = await fetch(`${baseUrl}/payments/${payment.id}/pixQrCode`, {
      headers: { 'access_token': apiKey },
    });
    const pixData = await pixResponse.json();
    payment.pixQrCode = pixData.payload;
    payment.pixQrCodeBase64 = pixData.encodedImage;
    payment.pixExpirationDate = pixData.expirationDate;
  }

  return payment;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { userId, email } = authResult;

    const payload: CheckoutPayload = await req.json();
    const supabase = createServiceClient();
    const userSupabase = createSupabaseClient(req);

    // Validate courses exist and get prices
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, price, promotional_price, promotional_ends_at')
      .in('id', payload.courseIds)
      .eq('status', 'published');

    if (coursesError || !courses || courses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cursos não encontrados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already enrolled
    const { data: existingEnrollments } = await userSupabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .in('course_id', payload.courseIds)
      .eq('is_active', true);

    if (existingEnrollments && existingEnrollments.length > 0) {
      const enrolledIds = existingEnrollments.map(e => e.course_id);
      return new Response(
        JSON.stringify({ error: 'Você já está matriculado em um ou mais cursos selecionados', enrolledCourses: enrolledIds }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate prices (server-side!)
    let subtotal = 0;
    const orderItems: { courseId: string; price: number; discount: number; finalPrice: number }[] = [];
    const now = new Date();

    for (const course of courses) {
      let price = parseFloat(course.price);
      let discount = 0;

      // Check promotional price
      if (course.promotional_price && 
          (!course.promotional_ends_at || new Date(course.promotional_ends_at) > now)) {
        discount = price - parseFloat(course.promotional_price);
        price = parseFloat(course.promotional_price);
      }

      subtotal += price;
      orderItems.push({
        courseId: course.id,
        price: parseFloat(course.price),
        discount,
        finalPrice: price,
      });
    }

    // Apply coupon if provided
    let couponDiscount = 0;
    let couponId: string | null = null;

    if (payload.couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', payload.couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (coupon) {
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

        if ((!validFrom || validFrom <= now) && (!validUntil || validUntil > now)) {
          if (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit) {
            if (!coupon.min_purchase_value || subtotal >= parseFloat(coupon.min_purchase_value)) {
              // Calculate discount
              if (coupon.discount_type === 'percentage') {
                couponDiscount = subtotal * (parseFloat(coupon.discount_value) / 100);
              } else {
                couponDiscount = parseFloat(coupon.discount_value);
              }

              // Apply max discount if set
              if (coupon.max_discount_value) {
                couponDiscount = Math.min(couponDiscount, parseFloat(coupon.max_discount_value));
              }

              couponId = coupon.id;
            }
          }
        }
      }
    }

    const total = Math.max(0, subtotal - couponDiscount);

    // Get active payment provider
    const { data: checkoutSettings } = await supabase
      .from('checkout_settings')
      .select('default_provider_id')
      .single();

    let providerId = checkoutSettings?.default_provider_id;

    if (!providerId) {
      const { data: defaultProvider } = await supabase
        .from('payment_providers')
        .select('id')
        .eq('status', 'working')
        .eq('is_default', true)
        .single();
      providerId = defaultProvider?.id;
    }

    if (!providerId) {
      const { data: anyProvider } = await supabase
        .from('payment_providers')
        .select('id')
        .eq('status', 'working')
        .limit(1)
        .single();
      providerId = anyProvider?.id;
    }

    if (!providerId) {
      return new Response(
        JSON.stringify({ error: 'Nenhum provedor de pagamento configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if payment method is enabled
    const { data: methodConfig } = await supabase
      .from('payment_methods_config')
      .select('is_enabled')
      .eq('provider_id', providerId)
      .eq('method_type', payload.paymentMethod)
      .single();

    if (!methodConfig?.is_enabled) {
      return new Response(
        JSON.stringify({ error: 'Método de pagamento não disponível' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get provider details and credentials
    const { data: provider } = await supabase
      .from('payment_providers')
      .select('id, provider_type, environment')
      .eq('id', providerId)
      .single();

    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provedor de pagamento não encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: credentials } = await supabase
      .from('payment_provider_credentials')
      .select('credential_type, encrypted_value')
      .eq('provider_id', providerId);

    const decryptedCreds: Record<string, string> = {};
    for (const cred of credentials || []) {
      decryptedCreds[cred.credential_type] = await decrypt(cred.encrypted_value);
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        discount_amount: couponDiscount,
        total,
        coupon_id: couponId,
        coupon_code: payload.couponCode,
        payment_provider_id: providerId,
        customer_name: payload.customerData.name,
        customer_email: payload.customerData.email || email,
        customer_phone: payload.customerData.phone,
        customer_cpf: payload.customerData.cpf,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    for (const item of orderItems) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        course_id: item.courseId,
        price: item.price,
        discount: item.discount,
        final_price: item.finalPrice,
      });
    }

    // Update coupon usage
    if (couponId) {
      await supabase
        .from('coupons')
        .update({ usage_count: (courses as unknown as { usage_count: number }[]).length + 1 })
        .eq('id', couponId);
    }

    // Create payment with provider
    const courseNames = courses.map(c => c.title).join(', ');
    const description = `Compra: ${courseNames}`.substring(0, 200);

    let paymentResult: Record<string, unknown>;

    switch (provider.provider_type) {
      case 'mercadopago':
        paymentResult = await createMercadoPagoPayment(
          decryptedCreds.access_token || decryptedCreds.token,
          {
            amount: total,
            description,
            paymentMethod: payload.paymentMethod,
            email: payload.customerData.email || email,
            cpf: payload.customerData.cpf,
            name: payload.customerData.name,
            externalReference: order.id,
            installments: payload.installments,
            cardToken: payload.cardToken,
          }
        );
        break;

      case 'asaas':
        paymentResult = await createAsaasPayment(
          decryptedCreds.api_key || decryptedCreds.token,
          provider.environment,
          {
            amount: total,
            description,
            paymentMethod: payload.paymentMethod,
            email: payload.customerData.email || email,
            cpf: payload.customerData.cpf,
            name: payload.customerData.name,
            externalReference: order.id,
            installments: payload.installments,
          }
        );
        break;

      default:
        throw new Error('Provedor não suportado');
    }

    // Save payment record
    const paymentData: Record<string, unknown> = {
      order_id: order.id,
      provider_id: providerId,
      external_id: paymentResult.id as string,
      payment_method: payload.paymentMethod,
      amount: total,
      status: 'pending',
      installments: payload.installments || 1,
      gateway_response: paymentResult,
    };

    // Add PIX data if applicable
    if (payload.paymentMethod === 'pix') {
      if (provider.provider_type === 'mercadopago') {
        const txData = paymentResult.point_of_interaction as Record<string, unknown>;
        const txDetails = txData?.transaction_data as Record<string, unknown>;
        paymentData.pix_qr_code = txDetails?.qr_code;
        paymentData.pix_qr_code_base64 = txDetails?.qr_code_base64;
        paymentData.pix_expiration = paymentResult.date_of_expiration;
      } else if (provider.provider_type === 'asaas') {
        paymentData.pix_qr_code = paymentResult.pixQrCode;
        paymentData.pix_qr_code_base64 = paymentResult.pixQrCodeBase64;
        paymentData.pix_expiration = paymentResult.pixExpirationDate;
      }
    }

    // Add boleto data if applicable
    if (payload.paymentMethod === 'boleto') {
      if (provider.provider_type === 'mercadopago') {
        const txData = paymentResult.transaction_details as Record<string, unknown>;
        paymentData.boleto_url = txData?.external_resource_url;
        paymentData.boleto_barcode = paymentResult.barcode?.content;
      } else if (provider.provider_type === 'asaas') {
        paymentData.boleto_url = paymentResult.bankSlipUrl;
        paymentData.boleto_barcode = paymentResult.nossoNumero;
        paymentData.boleto_expiration = paymentResult.dueDate;
      }
    }

    const { data: payment } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    // Build response
    const response: CheckoutResponse = {
      orderId: order.id,
      orderNumber,
      total,
      paymentMethod: payload.paymentMethod,
    };

    if (payload.paymentMethod === 'pix' && payment) {
      response.pixQrCode = payment.pix_qr_code;
      response.pixQrCodeBase64 = payment.pix_qr_code_base64;
      response.pixExpiration = payment.pix_expiration;
    }

    if (payload.paymentMethod === 'boleto' && payment) {
      response.boletoUrl = payment.boleto_url;
      response.boletoBarcode = payment.boleto_barcode;
      response.boletoExpiration = payment.boleto_expiration;
    }

    if (payload.paymentMethod === 'credit_card') {
      // For credit card, check if already approved
      const mpStatus = paymentResult.status as string;
      if (mpStatus === 'approved') {
        // Auto-approve and create enrollment
        await supabase
          .from('payments')
          .update({ status: 'approved', paid_at: new Date().toISOString() })
          .eq('id', payment?.id);

        await supabase
          .from('orders')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', order.id);

        for (const item of orderItems) {
          await supabase.from('enrollments').upsert({
            user_id: userId,
            course_id: item.courseId,
            order_id: order.id,
            payment_id: payment?.id,
            is_active: true,
          }, { onConflict: 'user_id,course_id' });
        }

        response.redirectUrl = '/meus-cursos';
      }
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao processar pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
