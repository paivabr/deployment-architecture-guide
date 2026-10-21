import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      navigate('/', { replace: true });
      return;
    }

    // Parse the hash fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const type = params.get('type');
    const errorCode = params.get('error_code');

    // Supabase JS will automatically handle the session from the URL
    supabase.auth.getSession().then(() => {
      if (errorCode) {
        // Handle error - redirect to reset password with error
        navigate('/auth/redefinir-senha#error_code=' + errorCode, { replace: true });
      } else if (type === 'recovery') {
        // Password recovery - redirect to reset password page
        navigate('/auth/redefinir-senha' + window.location.hash, { replace: true });
      } else {
        // Email confirmation or other - redirect to home
        navigate('/', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div data-ev-id="ev_cc8a160a5e" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div data-ev-id="ev_3e7d5fa002" className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p data-ev-id="ev_1d49c4a20c" className="text-gray-600">Processando...</p>
      </div>
    </div>);

}