import { Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Sparkles, LogOut, User, Settings } from 'lucide-react';

interface PublicHeaderProps {
  variant?: 'light' | 'transparent';
}

export function PublicHeader({ variant = 'light' }: PublicHeaderProps) {
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const { theme } = useTheme();

  const bgClass = variant === 'transparent' ?
  'bg-transparent' :
  'bg-white border-b border-border';

  return (
    <header data-ev-id="ev_bf5b34cb4c" className={bgClass}>
      <div data-ev-id="ev_8726289967" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div data-ev-id="ev_7c0eb95c45" className="flex items-center justify-between">
          <Link data-ev-id="ev_8fb3db4c5b" to="/" className="flex items-center gap-2">
            {theme.logoUrl ?
            <img data-ev-id="ev_ba2c02fc3f" src={theme.logoUrl} alt="Logo" className="h-10 w-auto" /> :

            <>
                <div data-ev-id="ev_de07708473" className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span data-ev-id="ev_b313e9f51f" className="text-xl font-bold text-secondary">Lara Sathler</span>
              </>
            }
          </Link>
          
          <nav data-ev-id="ev_d824c281f9" className="hidden md:flex items-center gap-8">
            <Link data-ev-id="ev_2474bb759c" to="/cursos" className="text-gray-600 hover:text-secondary transition-colors">Cursos</Link>
            <a data-ev-id="ev_5569e0b397" href="/#sobre" className="text-gray-600 hover:text-secondary transition-colors">Sobre</a>
            <a data-ev-id="ev_66407c335a" href="/#contato" className="text-gray-600 hover:text-secondary transition-colors">Contato</a>
          </nav>
          
          <div data-ev-id="ev_28e77ed8ba" className="flex items-center gap-4">
            {isLoading ?
            <div data-ev-id="ev_99b5bb6603" className="w-20 h-8 bg-gray-200 rounded animate-pulse" /> :
            user ?
            <>
                {isAdmin &&
              <Link data-ev-id="ev_06766b58c4" to="/admin" className="text-gray-600 hover:text-secondary transition-colors flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
              }
                <Link data-ev-id="ev_964a588563" to="/meus-cursos" className="text-gray-600 hover:text-secondary transition-colors flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Meus Cursos
                </Link>
                <button data-ev-id="ev_d759ddc54b"
              onClick={() => signOut()}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">

                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </> :

            <>
                <Link data-ev-id="ev_e936ef608a" to="/login" className="text-gray-600 hover:text-secondary transition-colors">Entrar</Link>
                <Link data-ev-id="ev_539b8debba" to="/cadastro" className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-colors shadow-lg">
                  Criar conta
                </Link>
              </>
            }
          </div>
        </div>
      </div>
    </header>);

}