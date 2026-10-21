import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);

    const { error, needsConfirmation: needs } = await signUp(email, password, fullName);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este e-mail já está cadastrado.');
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    if (needs) {
      setNeedsConfirmation(true);
    } else {
      navigate('/', { replace: true });
    }

    setIsLoading(false);
  };

  if (needsConfirmation) {
    return (
      <div data-ev-id="ev_6c0c55bf77" className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div data-ev-id="ev_ee64542ab8" className="w-full max-w-md">
          <div data-ev-id="ev_d02a42ee91" className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div data-ev-id="ev_647f42ab5e" className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 data-ev-id="ev_6948dc84ca" className="text-2xl font-bold text-gray-900 mb-2">Verifique seu e-mail</h1>
            <p data-ev-id="ev_f4c8a166e2" className="text-gray-600 mb-6">
              Enviamos um link de confirmação para <strong data-ev-id="ev_90fffd6ec3">{email}</strong>. 
              Clique no link para ativar sua conta.
            </p>
            <Link data-ev-id="ev_fe4c99083c"
            to="/login"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all">

              Ir para o login
            </Link>
          </div>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_5eea6b9128" className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div data-ev-id="ev_1aa8b5d3d6" className="w-full max-w-md">
        <div data-ev-id="ev_e51d2a4010" className="bg-white rounded-xl shadow-lg p-8">
          <div data-ev-id="ev_a7482994a1" className="text-center mb-8">
            <h1 data-ev-id="ev_8049abc4c5" className="text-2xl font-bold text-gray-900">Criar conta</h1>
            <p data-ev-id="ev_54ba9bfefd" className="text-gray-600 mt-2">Preencha os dados para se cadastrar</p>
          </div>

          {error &&
          <div data-ev-id="ev_77bcaceb96" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p data-ev-id="ev_9ae78d913e" className="text-sm text-red-700">{error}</p>
            </div>
          }

          <form data-ev-id="ev_69f69cd0c4" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div data-ev-id="ev_23dec64ad7">
              <label data-ev-id="ev_24f683d467" htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input data-ev-id="ev_f6d149d456"
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Seu nome" />

            </div>

            <div data-ev-id="ev_b6821da853">
              <label data-ev-id="ev_38e58a9d9c" htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input data-ev-id="ev_fddbc93bfd"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com" />

            </div>

            <div data-ev-id="ev_d0aff4902f">
              <label data-ev-id="ev_2e8f3fb440" htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div data-ev-id="ev_ad897e3d5a" className="relative">
                <input data-ev-id="ev_7ea56e1660"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12"
                placeholder="Mínimo 8 caracteres" />

                <button data-ev-id="ev_2ab7b3aa74"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">

                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div data-ev-id="ev_3586a57c03">
              <label data-ev-id="ev_d6e18dde97" htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <input data-ev-id="ev_7182b74292"
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Repita a senha" />

            </div>

            <button data-ev-id="ev_d6a89d3e2b"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2">

              {isLoading ?
              <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </> :

              'Criar conta'
              }
            </button>
          </form>

          <p data-ev-id="ev_92109ef093" className="text-center text-gray-600 mt-6">
            Já tem uma conta?{' '}
            <Link data-ev-id="ev_ebd5dadd55" to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>);

}