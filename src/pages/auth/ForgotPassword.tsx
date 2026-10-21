import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div data-ev-id="ev_a1d0b43e1c" className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div data-ev-id="ev_81c672215a" className="w-full max-w-md">
          <div data-ev-id="ev_7389d29d8f" className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div data-ev-id="ev_3b4a9abfaa" className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 data-ev-id="ev_dd7a7d7d86" className="text-2xl font-bold text-gray-900 mb-2">E-mail enviado!</h1>
            <p data-ev-id="ev_829a45c33e" className="text-gray-600 mb-6">
              Enviamos um link de recuperação para <strong data-ev-id="ev_8a2c1701d8">{email}</strong>. 
              Verifique sua caixa de entrada e spam.
            </p>
            <Link data-ev-id="ev_3fcdc3e18e"
            to="/login"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all">

              Voltar ao login
            </Link>
          </div>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_75b5b85935" className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div data-ev-id="ev_52e895a97e" className="w-full max-w-md">
        <div data-ev-id="ev_4eba5efb1f" className="bg-white rounded-xl shadow-lg p-8">
          <Link data-ev-id="ev_e2fe42de84"
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">

            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>

          <div data-ev-id="ev_871b7458e4" className="mb-8">
            <h1 data-ev-id="ev_6c7b4832e7" className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
            <p data-ev-id="ev_eb1b3db1ab" className="text-gray-600 mt-2">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          {error &&
          <div data-ev-id="ev_37b1ae5957" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p data-ev-id="ev_0688b03aee" className="text-sm text-red-700">{error}</p>
            </div>
          }

          <form data-ev-id="ev_1fad011248" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div data-ev-id="ev_049f28484a">
              <label data-ev-id="ev_e484ee8976" htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input data-ev-id="ev_91d577c686"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com" />

            </div>

            <button data-ev-id="ev_58061305f1"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">

              {isLoading ?
              <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </> :

              'Enviar link de recuperação'
              }
            </button>
          </form>
        </div>
      </div>
    </div>);

}