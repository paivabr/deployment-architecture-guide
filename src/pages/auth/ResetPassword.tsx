import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse hash params to check if this is a valid recovery link
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const type = params.get('type');
    const errorCode = params.get('error_code');

    if (errorCode) {
      setIsValidLink(false);
    } else if (accessToken && type === 'recovery') {
      setIsValidLink(true);
    } else {
      // Check if user is already in a recovery session
      setIsValidLink(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/login', { replace: true }), 3000);
  };

  if (isValidLink === false) {
    return (
      <div data-ev-id="ev_4ee5f766fe" className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div data-ev-id="ev_b59bb4d071" className="w-full max-w-md">
          <div data-ev-id="ev_dfd8403415" className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div data-ev-id="ev_61f37b8a2e" className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 data-ev-id="ev_cdef17ac40" className="text-2xl font-bold text-gray-900 mb-2">Link expirado</h1>
            <p data-ev-id="ev_2cc7f61502" className="text-gray-600 mb-6">
              Este link de recuperação de senha expirou ou já foi utilizado.
            </p>
            <Link data-ev-id="ev_8f0a3ef92f"
            to="/esqueci-senha"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all">

              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>);

  }

  if (success) {
    return (
      <div data-ev-id="ev_3535694c69" className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div data-ev-id="ev_91c29ce4e0" className="w-full max-w-md">
          <div data-ev-id="ev_84c43b7d72" className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div data-ev-id="ev_be5971a486" className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 data-ev-id="ev_b604ae3c5b" className="text-2xl font-bold text-gray-900 mb-2">Senha alterada!</h1>
            <p data-ev-id="ev_bab5607930" className="text-gray-600 mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para o login...
            </p>
            <Link data-ev-id="ev_328cb56638"
            to="/login"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all">

              Ir para o login
            </Link>
          </div>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_7b069ee916" className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div data-ev-id="ev_f348e52bd1" className="w-full max-w-md">
        <div data-ev-id="ev_a79fbf1b51" className="bg-white rounded-xl shadow-lg p-8">
          <div data-ev-id="ev_59304c5e7d" className="text-center mb-8">
            <h1 data-ev-id="ev_272d98fd4d" className="text-2xl font-bold text-gray-900">Nova senha</h1>
            <p data-ev-id="ev_a080d3cd2c" className="text-gray-600 mt-2">Digite sua nova senha</p>
          </div>

          {error &&
          <div data-ev-id="ev_f95fb5d848" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p data-ev-id="ev_93026959a4" className="text-sm text-red-700">{error}</p>
            </div>
          }

          <form data-ev-id="ev_2edf49a514" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div data-ev-id="ev_2b9e5197bc">
              <label data-ev-id="ev_2c839bd647" htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha
              </label>
              <div data-ev-id="ev_9d6c864a16" className="relative">
                <input data-ev-id="ev_26f04b036a"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12"
                placeholder="Mínimo 6 caracteres" />

                <button data-ev-id="ev_039c5ab012"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">

                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div data-ev-id="ev_eb910ef76b">
              <label data-ev-id="ev_958207e1af" htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nova senha
              </label>
              <input data-ev-id="ev_bf4b12fe7c"
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Repita a nova senha" />

            </div>

            <button data-ev-id="ev_75ffa3a9f8"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2">

              {isLoading ?
              <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Alterando...
                </> :

              'Alterar senha'
              }
            </button>
          </form>
        </div>
      </div>
    </div>);

}