import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as {from?: {pathname: string;};})?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error, user: loggedUser, roles } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('E-mail não confirmado. Verifique sua caixa de entrada.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha inválidos.');
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    // Only navigate after confirming user is set
    if (loggedUser) {
      // Redirect admins/moderators to admin panel, others to their destination
      const isAdminUser = roles.includes('admin') || roles.includes('moderator');
      const destination = isAdminUser && from === '/' ? '/admin' : from;
      navigate(destination, { replace: true });
    } else {
      setError('Erro inesperado ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div data-ev-id="ev_7d16477842" className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div data-ev-id="ev_009bca3e89" className="w-full max-w-md">
        <div data-ev-id="ev_1edc490120" className="bg-white rounded-xl shadow-lg p-8">
          <div data-ev-id="ev_cb3f96be79" className="text-center mb-8">
            <h1 data-ev-id="ev_d4de3af979" className="text-2xl font-bold text-gray-900">Entrar</h1>
            <p data-ev-id="ev_c08c32c367" className="text-gray-600 mt-2">Acesse sua conta para continuar</p>
          </div>

          {error &&
          <div data-ev-id="ev_8faa71f41e" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p data-ev-id="ev_034e926572" className="text-sm text-red-700">{error}</p>
            </div>
          }

          <form data-ev-id="ev_28cc9f0eda" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div data-ev-id="ev_c58f65dfba">
              <label data-ev-id="ev_28da06f522" htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input data-ev-id="ev_d55fe6736b"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com" />

            </div>

            <div data-ev-id="ev_98546e4a66">
              <label data-ev-id="ev_0620ef75cf" htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div data-ev-id="ev_8ad2ef7484" className="relative">
                <input data-ev-id="ev_0af31f88c3"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12"
                placeholder="••••••••" />

                <button data-ev-id="ev_9bb45c82f1"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">

                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div data-ev-id="ev_8c16a090b0" className="flex justify-end">
              <Link data-ev-id="ev_7ecb8073bf"
              to="/esqueci-senha"
              className="text-sm text-primary hover:underline">

                Esqueceu a senha?
              </Link>
            </div>

            <button data-ev-id="ev_2c25135cbe"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">

              {isLoading ?
              <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </> :

              'Entrar'
              }
            </button>
          </form>

          <p data-ev-id="ev_b55e33a7d3" className="text-center text-gray-600 mt-6">
            Não tem uma conta?{' '}
            <Link data-ev-id="ev_d293dc07f8" to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>);

}