import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  Users,
  Search,
  Shield,
  GraduationCap,
  UserCog,
  Crown,
  MoreVertical,
  Mail,
  Ban,
  CheckCircle } from
'lucide-react';

type UserRole = 'admin' | 'moderator' | 'teacher' | 'student';

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: UserRole[];
}

const roleConfig: Record<UserRole, {label: string;icon: typeof Crown;color: string;}> = {
  admin: { label: 'Admin', icon: Crown, color: 'text-red-600 bg-red-50' },
  moderator: { label: 'Moderador', icon: Shield, color: 'text-purple-600 bg-purple-50' },
  teacher: { label: 'Professor', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
  student: { label: 'Aluno', icon: Users, color: 'text-gray-600 bg-gray-50' }
};

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: profiles } = await supabase.
      from('profiles').
      select('id, email, full_name, avatar_url, created_at').
      order('created_at', { ascending: false });

      const { data: userRoles } = await supabase.
      from('user_roles').
      select('user_id, role');

      const rolesMap: Record<string, UserRole[]> = {};
      userRoles?.forEach((ur) => {
        if (!rolesMap[ur.user_id]) rolesMap[ur.user_id] = [];
        rolesMap[ur.user_id].push(ur.role as UserRole);
      });

      setUsers((profiles || []).map((p) => ({
        ...p,
        roles: rolesMap[p.id] || ['student']
      })));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddRole = async (userId: string, role: UserRole) => {
    if (!supabase) return;
    await supabase.from('user_roles').insert({ user_id: userId, role });
    setRoleModalUser(null);
    fetchUsers();
  };

  const handleRemoveRole = async (userId: string, role: UserRole) => {
    if (!supabase) return;
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
    fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
    user.full_name?.toLowerCase().includes(search.toLowerCase()) || false ||
    user.email?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter as UserRole);
    return matchesSearch && matchesRole;
  });

  const getHighestRole = (roles: UserRole[]): UserRole => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('moderator')) return 'moderator';
    if (roles.includes('teacher')) return 'teacher';
    return 'student';
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_eee88abba5" className="mb-8">
        <h1 data-ev-id="ev_70b4d6ff09" className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p data-ev-id="ev_93f37b688a" className="text-gray-600 mt-1">Gerencie usuários e permissões</p>
      </div>

      {/* Filters */}
      <div data-ev-id="ev_905cc58110" className="flex flex-col sm:flex-row gap-4 mb-6">
        <div data-ev-id="ev_aadbecd2a6" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input data-ev-id="ev_4be202feb1"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

        </div>
        <select data-ev-id="ev_f556008feb"
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

          <option data-ev-id="ev_bdc4571127" value="all">Todos os papéis</option>
          <option data-ev-id="ev_60e3168e1d" value="admin">Administradores</option>
          <option data-ev-id="ev_d3ada58010" value="moderator">Moderadores</option>
          <option data-ev-id="ev_8e68da124d" value="teacher">Professores</option>
          <option data-ev-id="ev_cbd3b7ea38" value="student">Alunos</option>
        </select>
      </div>

      {/* Stats */}
      <div data-ev-id="ev_f34cdf9a9f" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(['admin', 'moderator', 'teacher', 'student'] as UserRole[]).map((role) => {
          const config = roleConfig[role];
          const count = users.filter((u) => u.roles.includes(role)).length;
          const Icon = config.icon;
          return (
            <div data-ev-id="ev_a9876ecac9" key={role} className="bg-white rounded-xl border border-gray-200 p-4">
              <div data-ev-id="ev_0372925a30" className="flex items-center gap-3">
                <div data-ev-id="ev_cf904794da" className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div data-ev-id="ev_f053378a05">
                  <p data-ev-id="ev_6eeefd3fe5" className="text-2xl font-bold text-gray-900">{count}</p>
                  <p data-ev-id="ev_ef3a493b5b" className="text-sm text-gray-500">{config.label}s</p>
                </div>
              </div>
            </div>);

        })}
      </div>

      {isLoading ?
      <div data-ev-id="ev_4e8ade0acd" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
      filteredUsers.length === 0 ?
      <div data-ev-id="ev_08dd64dcf7" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 data-ev-id="ev_14d75d2bbb" className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p data-ev-id="ev_341d081565" className="text-gray-600">Ajuste os filtros ou aguarde novos cadastros.</p>
        </div> :

      <div data-ev-id="ev_a029cef581" className="bg-white rounded-xl border border-gray-200 overflow-visible">
          <table data-ev-id="ev_ff477a9b92" className="w-full">
            <thead data-ev-id="ev_b8245fbba9" className="bg-gray-50 border-b border-gray-200">
              <tr data-ev-id="ev_db723b3bcb">
                <th data-ev-id="ev_e5e6e97299" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th data-ev-id="ev_8bff34f1d4" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Papéis</th>
                <th data-ev-id="ev_523e9a7c94" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                <th data-ev-id="ev_06004203dd" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody data-ev-id="ev_e883fa5e4b" className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
              const highestRole = getHighestRole(user.roles);
              const config = roleConfig[highestRole];
              return (
                <tr data-ev-id="ev_bb5d30a159" key={user.id} className="hover:bg-gray-50">
                    <td data-ev-id="ev_7b6f852c30" className="px-6 py-4">
                      <div data-ev-id="ev_4c60561899" className="flex items-center gap-3">
                        {user.avatar_url ?
                      <img data-ev-id="ev_59163fcfa2" src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> :

                      <div data-ev-id="ev_bfcf826331" className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                            <span data-ev-id="ev_3b52e3913f" className="text-sm font-medium">{(user.full_name || user.email || '?').charAt(0).toUpperCase()}</span>
                          </div>
                      }
                        <div data-ev-id="ev_425735d1ed">
                          <p data-ev-id="ev_d67e938062" className="font-medium text-gray-900">{user.full_name || 'Sem nome'}</p>
                          <p data-ev-id="ev_ee236c347d" className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td data-ev-id="ev_d99239029f" className="px-6 py-4">
                      <div data-ev-id="ev_c6c5a06341" className="flex flex-wrap gap-1">
                        {user.roles.map((role) => {
                        const rc = roleConfig[role];
                        return (
                          <span data-ev-id="ev_e421a90c97" key={role} className={`px-2 py-0.5 rounded-full text-xs font-medium ${rc.color}`}>
                              {rc.label}
                            </span>);

                      })}
                      </div>
                    </td>
                    <td data-ev-id="ev_8586a35014" className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td data-ev-id="ev_690f2de66c" className="px-6 py-4">
                      <div data-ev-id="ev_2a2cf87110" className="flex items-center justify-end gap-2 relative">
                        <button data-ev-id="ev_2598a21cbc" onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === user.id &&
                      <div data-ev-id="ev_153bf7fe39" className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                            <button data-ev-id="ev_423ec36997" onClick={() => {setRoleModalUser(user);setMenuOpen(null);}} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <UserCog className="w-4 h-4" /> Gerenciar papéis
                            </button>
                            <button data-ev-id="ev_f53f9309f8" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Mail className="w-4 h-4" /> Enviar e-mail
                            </button>
                          </div>
                      }
                      </div>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }

      {/* Role Modal */}
      {roleModalUser &&
      <div data-ev-id="ev_75fac0399b" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div data-ev-id="ev_bd3b2d77ed" className="bg-white rounded-xl w-full max-w-md">
            <div data-ev-id="ev_189f30beda" className="p-6 border-b">
              <h2 data-ev-id="ev_54127cf9f3" className="text-lg font-semibold">Gerenciar papéis</h2>
              <p data-ev-id="ev_0e381407a5" className="text-sm text-gray-500">{roleModalUser.full_name || roleModalUser.email}</p>
            </div>
            <div data-ev-id="ev_2fb90c3880" className="p-6 flex flex-col gap-3">
              {(['admin', 'moderator', 'teacher'] as UserRole[]).map((role) => {
              const config = roleConfig[role];
              const hasRole = roleModalUser.roles.includes(role);
              const Icon = config.icon;
              return (
                <button data-ev-id="ev_90e76b484e"
                key={role}
                onClick={() => hasRole ? handleRemoveRole(roleModalUser.id, role) : handleAddRole(roleModalUser.id, role)}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                hasRole ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`
                }>

                    <div data-ev-id="ev_ac18548cd4" className="flex items-center gap-3">
                      <div data-ev-id="ev_4558608584" className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div data-ev-id="ev_d8fdfbf94b" className="text-left">
                        <p data-ev-id="ev_1f45b31347" className="font-medium text-gray-900">{config.label}</p>
                        <p data-ev-id="ev_9be2b0b870" className="text-xs text-gray-500">
                          {role === 'admin' && 'Acesso total ao sistema'}
                          {role === 'moderator' && 'Gerencia conteúdo e usuários'}
                          {role === 'teacher' && 'Cria e gerencia cursos'}
                        </p>
                      </div>
                    </div>
                    {hasRole ? <CheckCircle className="w-5 h-5 text-primary" /> : <div data-ev-id="ev_32f4da9e18" className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                  </button>);

            })}
            </div>
            <div data-ev-id="ev_1c98921a8e" className="p-6 border-t bg-gray-50 rounded-b-xl">
              <button data-ev-id="ev_7cdfc8afd1" onClick={() => setRoleModalUser(null)} className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                Fechar
              </button>
            </div>
          </div>
        </div>
      }
    </AdminLayout>);

}