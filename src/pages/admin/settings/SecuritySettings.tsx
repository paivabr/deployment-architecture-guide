import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Shield,
  Key,
  Lock,
  Smartphone,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff } from
'lucide-react';

export default function SecuritySettings() {
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [lockoutDuration, setLockoutDuration] = useState('15');
  const [enable2FA, setEnable2FA] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <AdminLayout>
      <div data-ev-id="ev_226f7bfb20" className="mb-8">
        <h1 data-ev-id="ev_ddaf54360c" className="text-2xl font-bold text-gray-900">Segurança</h1>
        <p data-ev-id="ev_366945280e" className="text-gray-600 mt-1">Configure políticas de segurança da plataforma</p>
      </div>

      <div data-ev-id="ev_6d7bc774c6" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_a62c45ef4c" className="lg:col-span-2 flex flex-col gap-6">
          {/* Password Policy */}
          <div data-ev-id="ev_968ead4b97" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_532e1e7cf8" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Política de Senhas
            </h2>

            <div data-ev-id="ev_a13b6e9aee" className="flex flex-col gap-4">
              <div data-ev-id="ev_6197849c2e">
                <label data-ev-id="ev_9504910fad" className="block text-sm font-medium text-gray-700 mb-1">Tamanho mínimo</label>
                <input data-ev-id="ev_bd9e092bcd"
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
                min="6"
                max="32"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>

              <div data-ev-id="ev_f15846fdad" className="flex flex-col gap-3">
                <label data-ev-id="ev_2f5906f599" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <span data-ev-id="ev_10b84e1575" className="text-sm text-gray-700">Exigir letra maiúscula</span>
                  <input data-ev-id="ev_1a8e8f5552" type="checkbox" checked={requireUppercase} onChange={(e) => setRequireUppercase(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                </label>
                <label data-ev-id="ev_75200ce39d" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <span data-ev-id="ev_5247854a1a" className="text-sm text-gray-700">Exigir número</span>
                  <input data-ev-id="ev_2c8eb6f0de" type="checkbox" checked={requireNumber} onChange={(e) => setRequireNumber(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                </label>
                <label data-ev-id="ev_465b995d04" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <span data-ev-id="ev_356dd789e0" className="text-sm text-gray-700">Exigir caractere especial</span>
                  <input data-ev-id="ev_cb26d0ddec" type="checkbox" checked={requireSpecial} onChange={(e) => setRequireSpecial(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                </label>
              </div>
            </div>
          </div>

          {/* Session */}
          <div data-ev-id="ev_9a029f20f8" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_d6889927f9" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Sessão e Acesso
            </h2>

            <div data-ev-id="ev_a646d2c2ad" className="grid grid-cols-3 gap-4">
              <div data-ev-id="ev_9af88cef22">
                <label data-ev-id="ev_3a69366635" className="block text-sm font-medium text-gray-700 mb-1">Timeout da sessão (dias)</label>
                <input data-ev-id="ev_f842762502"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                min="1"
                max="90"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_40f98572a0">
                <label data-ev-id="ev_9b34a198e4" className="block text-sm font-medium text-gray-700 mb-1">Tentativas de login</label>
                <input data-ev-id="ev_b0d505a9f1"
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                min="3"
                max="10"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_b7f0d5a9d9">
                <label data-ev-id="ev_1a0acca796" className="block text-sm font-medium text-gray-700 mb-1">Bloqueio (minutos)</label>
                <input data-ev-id="ev_3e9dba9abd"
                type="number"
                value={lockoutDuration}
                onChange={(e) => setLockoutDuration(e.target.value)}
                min="5"
                max="60"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
            </div>
          </div>

          {/* 2FA */}
          <div data-ev-id="ev_d33eacd2ab" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_34ecd81cd9" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" /> Autenticação em Duas Etapas
            </h2>

            <label data-ev-id="ev_d40acbf06d" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div data-ev-id="ev_e1dabd7dd0">
                <p data-ev-id="ev_e41947ef80" className="font-medium text-gray-900">Habilitar 2FA</p>
                <p data-ev-id="ev_60ebad0d08" className="text-sm text-gray-500">Exigir código de verificação no login</p>
              </div>
              <input data-ev-id="ev_c662fe2634" type="checkbox" checked={enable2FA} onChange={(e) => setEnable2FA(e.target.checked)} className="w-5 h-5 text-primary rounded" />
            </label>

            {!enable2FA &&
            <div data-ev-id="ev_66c78a9459" className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div data-ev-id="ev_ee1ea9091e">
                  <p data-ev-id="ev_440c368637" className="font-medium text-yellow-900">Recomendado</p>
                  <p data-ev-id="ev_07bbbb2323" className="text-sm text-yellow-700">Ative a autenticação em duas etapas para maior segurança das contas administrativas.</p>
                </div>
              </div>
            }
          </div>

          {/* API Keys */}
          <div data-ev-id="ev_c9859751b8" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_e6bcc6711b" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Chaves de API
            </h2>

            <div data-ev-id="ev_dd54fd9261" className="p-4 bg-gray-50 rounded-lg">
              <div data-ev-id="ev_a2d6707159" className="flex items-center justify-between mb-2">
                <span data-ev-id="ev_7f6118bec4" className="text-sm font-medium text-gray-700">Chave pública (anon)</span>
                <button data-ev-id="ev_81193c9209" onClick={() => setShowApiKey(!showApiKey)} className="text-gray-500 hover:text-gray-700">
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <code data-ev-id="ev_769b260a6e" className="text-xs text-gray-600 break-all">
                {showApiKey ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' : '••••••••••••••••••••••••••••••'}
              </code>
            </div>

            <p data-ev-id="ev_d09ae6fb1a" className="mt-3 text-xs text-gray-500">
              A chave privada (service role) está protegida e não é exibida aqui.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_7ecd0904b6" className="flex flex-col gap-6">
          <div data-ev-id="ev_9ab245d1ac" className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div data-ev-id="ev_183734b2d7" className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 data-ev-id="ev_dcbceb9136" className="font-semibold text-green-900">Status de Segurança</h3>
            </div>
            <ul data-ev-id="ev_864d70c506" className="text-sm text-green-800 flex flex-col gap-2">
              <li data-ev-id="ev_ef51733957">✓ RLS ativado em todas as tabelas</li>
              <li data-ev-id="ev_462e9f2a76">✓ Credenciais criptografadas</li>
              <li data-ev-id="ev_85683dbe42">✓ HTTPS forçado</li>
              <li data-ev-id="ev_1f08f6ed9c">✓ Headers de segurança configurados</li>
            </ul>
          </div>

          <div data-ev-id="ev_c7befc2f0e" className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 data-ev-id="ev_ced6c61bf7" className="font-semibold text-gray-900 mb-3">Boas práticas</h3>
            <ul data-ev-id="ev_49bf1813ea" className="text-sm text-gray-600 flex flex-col gap-2">
              <li data-ev-id="ev_bb471123af">• Use senhas fortes e únicas</li>
              <li data-ev-id="ev_308297d30c">• Ative 2FA para admins</li>
              <li data-ev-id="ev_27e85e47db">• Revise logs regularmente</li>
              <li data-ev-id="ev_194e226c37">• Mantenha backups atualizados</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>);

}