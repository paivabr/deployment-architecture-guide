import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';

export default function Setup() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    checkExistingAdmin();
  }, []);

  const checkExistingAdmin = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase.
      from('user_roles').
      select('id').
      eq('role', 'admin').
      limit(1);

      if (data && data.length > 0) {
        setHasAdmin(true);
      }
    } catch (err) {
      console.error('Error checking admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // 2. Update profile with name
      await supabase.
      from('profiles').
      update({ full_name: name }).
      eq('id', authData.user.id);

      // 3. Add admin role using bootstrap function (bypasses RLS for first admin)
      const { error: roleError } = await supabase.rpc('bootstrap_first_admin', {
        target_user_id: authData.user.id
      });
      
      if (roleError) throw roleError;

      setSuccess(true);

      // Redirect to admin after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err) {
      console.error('Setup error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar administrador');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div data-ev-id="ev_9d6b4f8cff" className="min-h-screen bg-gradient-to-br from-secondary via-secondary to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  if (hasAdmin) {
    return (
      <div data-ev-id="ev_846b743f83" className="min-h-screen bg-gradient-to-br from-secondary via-secondary to-gray-900 flex items-center justify-center p-4">
        <div data-ev-id="ev_2895131b21" className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div data-ev-id="ev_8ab597dd5f" className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 data-ev-id="ev_64764905fe" className="text-2xl font-bold text-gray-900 mb-2">Configuração já realizada</h1>
          <p data-ev-id="ev_48320c4737" className="text-gray-600 mb-6">
            Já existe um administrador configurado no sistema.
          </p>
          <a data-ev-id="ev_d168dd4bd3"
          href="/login"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-colors">

            Ir para o login
          </a>
        </div>
      </div>);

  }

  if (success) {
    return (
      <div data-ev-id="ev_b50e6df33f" className="min-h-screen bg-gradient-to-br from-secondary via-secondary to-gray-900 flex items-center justify-center p-4">
        <div data-ev-id="ev_b5588347d4" className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div data-ev-id="ev_e2bd5d1ebb" className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 data-ev-id="ev_5520b6677b" className="text-2xl font-bold text-gray-900 mb-2">Administrador criado!</h1>
          <p data-ev-id="ev_17da149fc8" className="text-gray-600 mb-4">
            Sua conta de administrador foi criada com sucesso.
          </p>
          <p data-ev-id="ev_6e1c33bccd" className="text-sm text-gray-500">
            Redirecionando para o painel...
          </p>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_ca4647843f" className="min-h-screen bg-gradient-to-br from-secondary via-secondary to-gray-900 flex items-center justify-center p-4">
      <div data-ev-id="ev_031e814f58" className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div data-ev-id="ev_380d255d89" className="text-center mb-8">
          <div data-ev-id="ev_5a768b891c" className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 data-ev-id="ev_8acb6a0051" className="text-2xl font-bold text-gray-900 mb-2">Configuração Inicial</h1>
          <p data-ev-id="ev_2e1271f8e5" className="text-gray-600">
            Crie a conta do administrador para gerenciar a plataforma
          </p>
        </div>

        {error &&
        <div data-ev-id="ev_64f51cf315" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span data-ev-id="ev_3f9f852f45" className="text-sm">{error}</span>
          </div>
        }

        <form data-ev-id="ev_f7de6fe010" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div data-ev-id="ev_4707113e09">
            <label data-ev-id="ev_1cfbe9b643" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input data-ev-id="ev_b8a3aa5aac"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Lara Sathler"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />

          </div>
          
          <div data-ev-id="ev_71d19b340e">
            <label data-ev-id="ev_88ca0dd4a1" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input data-ev-id="ev_c37e70b7e3"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@exemplo.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />

          </div>
          
          <div data-ev-id="ev_5cb1235d96">
            <label data-ev-id="ev_79b514aa79" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input data-ev-id="ev_b9dc8cae32"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />

          </div>
          
          <div data-ev-id="ev_a610217f1d">
            <label data-ev-id="ev_d1dbaf8322" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <input data-ev-id="ev_b887e61d8e"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Digite a senha novamente"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />

          </div>

          <button data-ev-id="ev_daf0bd310c"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">

            {isSubmitting ?
            <><Loader2 className="w-5 h-5 animate-spin" /> Criando...</> :

            'Criar conta de administrador'
            }
          </button>
        </form>

        <p data-ev-id="ev_73fc479532" className="text-center text-sm text-gray-500 mt-6">
          Esta página só aparece uma vez, antes de haver um administrador.
        </p>
      </div>
    </div>);

}