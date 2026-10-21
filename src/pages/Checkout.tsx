import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Tag,
  Copy } from
'lucide-react';

interface Course {
  id: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  promotional_price: number | null;
}

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export default function Checkout() {
  const { slug } = useParams<{slug: string;}>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{code: string;discount: number;} | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Payment result
  const [pixCode, setPixCode] = useState('');
  const [boletoUrl, setBoletoUrl] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!supabase || !slug) return;
    try {
      const { data } = await supabase.
      from('courses').
      select('id, title, thumbnail_url, price, promotional_price').
      eq('slug', slug).
      eq('status', 'published').
      single();

      setCourse(data as Course);
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/checkout/${slug}`);
      return;
    }
    fetchCourse();
  }, [user, slug, navigate, fetchCourse]);

  const handleApplyCoupon = async () => {
    if (!supabase || !couponCode) return;
    setIsApplyingCoupon(true);
    setError('');

    try {
      const { data } = await supabase.
      from('coupons').
      select('*').
      eq('code', couponCode.toUpperCase()).
      eq('is_active', true).
      single();

      if (!data) {
        setError('Cupom inválido ou expirado');
        return;
      }

      const price = course?.promotional_price || course?.price || 0;
      let discount = 0;

      if (data.discount_type === 'percentage') {
        discount = price * data.discount_value / 100;
        if (data.max_discount_value && discount > data.max_discount_value) {
          discount = data.max_discount_value;
        }
      } else {
        discount = data.discount_value;
      }

      setCouponApplied({ code: data.code, discount });
    } catch (err) {
      setError('Cupom inválido ou expirado');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !course || !user) return;

    setIsProcessing(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-payment', {
        body: {
          courseId: course.id,
          paymentMethod,
          couponCode: couponApplied?.code
        }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (paymentMethod === 'pix' && data?.pixCode) {
        setPixCode(data.pixCode);
      } else if (paymentMethod === 'boleto' && data?.boletoUrl) {
        setBoletoUrl(data.boletoUrl);
      } else if (paymentMethod === 'credit_card') {
        setPaymentSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoading) {
    return (
      <div data-ev-id="ev_1821c744d3" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  if (!course) {
    return (
      <div data-ev-id="ev_c6bd52707b" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div data-ev-id="ev_4c0f6b5ce0" className="text-center">
          <h2 data-ev-id="ev_c7db9b4f13" className="text-xl font-semibold text-gray-900 mb-2">Curso não encontrado</h2>
          <Link data-ev-id="ev_1560f60be4" to="/cursos" className="text-primary hover:underline">Voltar ao catálogo</Link>
        </div>
      </div>);

  }

  const basePrice = course.promotional_price || course.price;
  const finalPrice = basePrice - (couponApplied?.discount || 0);

  // Payment Success
  if (paymentSuccess) {
    return (
      <div data-ev-id="ev_3c25910400" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div data-ev-id="ev_9a691c97f8" className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div data-ev-id="ev_27448cfcc5" className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 data-ev-id="ev_3e07c5fd7f" className="text-2xl font-bold text-gray-900 mb-2">Pagamento aprovado!</h2>
          <p data-ev-id="ev_d4fa079165" className="text-gray-600 mb-6">Você já pode acessar o curso.</p>
          <Link data-ev-id="ev_b8fd477f2b" to="/meus-cursos" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
            Ir para meus cursos
          </Link>
        </div>
      </div>);

  }

  // PIX Code
  if (pixCode) {
    return (
      <div data-ev-id="ev_a7eb9bd411" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div data-ev-id="ev_bf02aa0ab3" className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div data-ev-id="ev_5991751848" className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h2 data-ev-id="ev_4ae8c53c14" className="text-2xl font-bold text-gray-900 mb-2">Pague com Pix</h2>
          <p data-ev-id="ev_030cc4de10" className="text-gray-600 mb-6">Copie o código abaixo e pague no app do seu banco.</p>
          
          <div data-ev-id="ev_8c177abd0b" className="bg-gray-100 rounded-lg p-4 mb-4">
            <p data-ev-id="ev_426c298546" className="text-sm text-gray-600 font-mono break-all">{pixCode}</p>
          </div>
          
          <button data-ev-id="ev_3d108604d3" onClick={() => copyToClipboard(pixCode)} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 mb-4">
            <Copy className="w-5 h-5" /> Copiar código Pix
          </button>
          
          <p data-ev-id="ev_d9a6344e66" className="text-sm text-gray-500">Após o pagamento, você receberá acesso ao curso automaticamente.</p>
        </div>
      </div>);

  }

  // Boleto URL
  if (boletoUrl) {
    return (
      <div data-ev-id="ev_313c8bc135" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div data-ev-id="ev_2b65ad5db1" className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div data-ev-id="ev_ff87e0d3b2" className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 data-ev-id="ev_c09b5001b2" className="text-2xl font-bold text-gray-900 mb-2">Boleto gerado!</h2>
          <p data-ev-id="ev_f2920936d9" className="text-gray-600 mb-6">Clique abaixo para visualizar e pagar o boleto.</p>
          
          <a data-ev-id="ev_42b52fa04e" href={boletoUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 mb-4">
            Abrir boleto
          </a>
          
          <p data-ev-id="ev_eb55eb820f" className="text-sm text-gray-500">O prazo de compensação é de até 3 dias úteis.</p>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_56f2cf800b" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header data-ev-id="ev_ae923c1f60" className="bg-white border-b border-gray-200">
        <div data-ev-id="ev_5691179a28" className="max-w-4xl mx-auto px-4 py-4">
          <Link data-ev-id="ev_70b3d78537" to={`/curso/${slug}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" /> Voltar ao curso
          </Link>
        </div>
      </header>

      <div data-ev-id="ev_7595c7d9ad" className="max-w-4xl mx-auto px-4 py-8">
        <div data-ev-id="ev_b0a884520e" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div data-ev-id="ev_f6c85d07ce" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_15fdeab357" className="text-xl font-bold text-gray-900 mb-6">Forma de pagamento</h2>

            {error &&
            <div data-ev-id="ev_c2862aa4d1" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            }

            <form data-ev-id="ev_d7b18cd0af" onSubmit={handleSubmit}>
              {/* Payment Methods */}
              <div data-ev-id="ev_fc972d4f84" className="flex flex-col gap-3 mb-6">
                {[
                { id: 'pix' as const, label: 'Pix', icon: QrCode, desc: 'Aprovado na hora' },
                { id: 'credit_card' as const, label: 'Cartão de crédito', icon: CreditCard, desc: 'Até 12x' },
                { id: 'boleto' as const, label: 'Boleto', icon: FileText, desc: 'Vence em 3 dias' }].
                map((method) =>
                <label data-ev-id="ev_ad99fd9a83"
                key={method.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`
                }>

                    <input data-ev-id="ev_87ad28c024"
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="sr-only" />

                    <div data-ev-id="ev_506c5f2917" className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === method.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div data-ev-id="ev_b1a1a43c5a" className="flex-1">
                      <p data-ev-id="ev_9da4465f57" className="font-medium text-gray-900">{method.label}</p>
                      <p data-ev-id="ev_70ce888038" className="text-sm text-gray-500">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && <CheckCircle className="w-5 h-5 text-primary" />}
                  </label>
                )}
              </div>

              {/* Coupon */}
              <div data-ev-id="ev_0cfe1253aa" className="mb-6">
                <label data-ev-id="ev_8287b2a080" className="block text-sm font-medium text-gray-700 mb-2">Cupom de desconto</label>
                <div data-ev-id="ev_13c8343def" className="flex gap-2">
                  <div data-ev-id="ev_6c2ee03767" className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input data-ev-id="ev_265650f72c"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="CODIGO"
                    disabled={!!couponApplied}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono disabled:bg-gray-100" />

                  </div>
                  {couponApplied ?
                  <button data-ev-id="ev_0d1364004f"
                  type="button"
                  onClick={() => {setCouponApplied(null);setCouponCode('');}}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">

                      Remover
                    </button> :

                  <button data-ev-id="ev_62e965d0d9"
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode}
                  className="px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">

                      {isApplyingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aplicar'}
                    </button>
                  }
                </div>
                {couponApplied &&
                <p data-ev-id="ev_faee97796d" className="mt-2 text-sm text-green-600">✓ Cupom {couponApplied.code} aplicado!</p>
                }
              </div>

              <button data-ev-id="ev_32f49afd49"
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">

                {isProcessing ?
                <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> :

                <><Lock className="w-5 h-5" /> Finalizar compra</>
                }
              </button>

              <p data-ev-id="ev_4fdcecbc61" className="mt-4 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Pagamento seguro e criptografado
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div data-ev-id="ev_3c8aa56f7d" className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
            <h2 data-ev-id="ev_aa6e6e0ed9" className="text-xl font-bold text-gray-900 mb-6">Resumo do pedido</h2>

            <div data-ev-id="ev_56cb1f4c95" className="flex gap-4 mb-6">
              {course.thumbnail_url &&
              <img data-ev-id="ev_30a0e48bc7" src={course.thumbnail_url} alt={course.title} className="w-24 h-16 rounded-lg object-cover" />
              }
              <div data-ev-id="ev_29f28e9238">
                <h3 data-ev-id="ev_311c0e00e2" className="font-medium text-gray-900">{course.title}</h3>
                <p data-ev-id="ev_cb68896572" className="text-sm text-gray-500">Acesso vitalício</p>
              </div>
            </div>

            <div data-ev-id="ev_9d2eb925a4" className="border-t border-gray-200 pt-4 flex flex-col gap-2">
              <div data-ev-id="ev_c515d010e3" className="flex justify-between text-gray-600">
                <span data-ev-id="ev_7c1af3ff75">Subtotal</span>
                <span data-ev-id="ev_0a280a338e">{formatCurrency(course.price)}</span>
              </div>
              {course.promotional_price &&
              <div data-ev-id="ev_ddecda8daa" className="flex justify-between text-green-600">
                  <span data-ev-id="ev_dce65a1e35">Desconto promocional</span>
                  <span data-ev-id="ev_03fcb86efc">-{formatCurrency(course.price - course.promotional_price)}</span>
                </div>
              }
              {couponApplied &&
              <div data-ev-id="ev_84714a3a20" className="flex justify-between text-green-600">
                  <span data-ev-id="ev_c670a0ce17">Cupom {couponApplied.code}</span>
                  <span data-ev-id="ev_aa4955e532">-{formatCurrency(couponApplied.discount)}</span>
                </div>
              }
              <div data-ev-id="ev_d82aca175e" className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span data-ev-id="ev_80ded62c1d">Total</span>
                <span data-ev-id="ev_2db3d0364a">{formatCurrency(Math.max(0, finalPrice))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}