import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Plus,
  Loader2,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X } from
'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_value: number | null;
  max_discount_value: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      setCoupons(data as Coupon[] || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSaving(true);
    try {
      await supabase.from('coupons').insert({
        code: code.toUpperCase(),
        description: description || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_purchase_value: minPurchase ? parseFloat(minPurchase) : null,
        max_discount_value: maxDiscount ? parseFloat(maxDiscount) : null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        valid_from: validFrom || null,
        valid_until: validUntil || null
      });
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      console.error('Error creating coupon:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    if (!supabase) return;
    await supabase.from('coupons').update({ is_active: !isActive }).eq('id', id);
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Excluir este cupom?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinPurchase('');
    setMaxDiscount('');
    setUsageLimit('');
    setValidFrom('');
    setValidUntil('');
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <AdminLayout>
      <div data-ev-id="ev_fc0d8aa30b" className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-ev-id="ev_834fa0d802">
          <h1 data-ev-id="ev_cdd155c23b" className="text-2xl font-bold text-gray-900">Cupons</h1>
          <p data-ev-id="ev_000914bbc1" className="text-gray-600 mt-1">Gerencie cupons de desconto</p>
        </div>
        <button data-ev-id="ev_614db20568" onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Criar cupom
        </button>
      </div>

      {/* Tabs */}
      <div data-ev-id="ev_aaecac6bfe" className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        <a data-ev-id="ev_0b71afc491" href="/admin/pagamentos" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">Provedores</a>
        <a data-ev-id="ev_1551782d9e" href="/admin/pagamentos/metodos" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">Métodos</a>
        <button data-ev-id="ev_8b2cc2bcfe" className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">Cupons</button>
        <a data-ev-id="ev_ac7b352cb1" href="/admin/pagamentos/webhooks" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">Webhooks</a>
      </div>

      {isLoading ?
      <div data-ev-id="ev_a1af4b2f5e" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
      coupons.length === 0 ?
      <div data-ev-id="ev_d004f7f6d9" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 data-ev-id="ev_ef239c3b64" className="text-lg font-semibold text-gray-900 mb-2">Nenhum cupom</h3>
          <p data-ev-id="ev_6db1de5143" className="text-gray-600 mb-6">Crie cupons de desconto para suas campanhas.</p>
          <button data-ev-id="ev_e669b16e74" onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Criar primeiro cupom
          </button>
        </div> :

      <div data-ev-id="ev_b1e45d0142" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table data-ev-id="ev_df3afeb055" className="w-full">
            <thead data-ev-id="ev_2a74e14ffa" className="bg-gray-50 border-b border-gray-200">
              <tr data-ev-id="ev_66cdccecf9">
                <th data-ev-id="ev_3876e5b643" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th data-ev-id="ev_1a880a6981" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desconto</th>
                <th data-ev-id="ev_4c1bcd3a4d" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uso</th>
                <th data-ev-id="ev_e4c584628b" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validade</th>
                <th data-ev-id="ev_6283d78588" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th data-ev-id="ev_5dfae96dd2" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody data-ev-id="ev_307377b1b8" className="divide-y divide-gray-200">
              {coupons.map((coupon) =>
            <tr data-ev-id="ev_12e91aefd0" key={coupon.id} className="hover:bg-gray-50">
                  <td data-ev-id="ev_f6e9346cc4" className="px-6 py-4">
                    <span data-ev-id="ev_66f83aabe3" className="font-mono font-bold text-gray-900">{coupon.code}</span>
                    {coupon.description && <p data-ev-id="ev_1ab82b0de5" className="text-sm text-gray-500">{coupon.description}</p>}
                  </td>
                  <td data-ev-id="ev_7f2eb53207" className="px-6 py-4">
                    <span data-ev-id="ev_d180a917a2" className="inline-flex items-center gap-1">
                      {coupon.discount_type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)}
                    </span>
                  </td>
                  <td data-ev-id="ev_334ecf3fba" className="px-6 py-4 text-sm text-gray-600">
                    {coupon.usage_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                  </td>
                  <td data-ev-id="ev_26f96e4612" className="px-6 py-4 text-sm text-gray-600">
                    {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString('pt-BR') : 'Sem limite'}
                  </td>
                  <td data-ev-id="ev_d45910cf18" className="px-6 py-4">
                    <button data-ev-id="ev_9624a98a8d" onClick={() => handleToggle(coupon.id, coupon.is_active)}>
                      {coupon.is_active ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </td>
                  <td data-ev-id="ev_d18d2f2ed5" className="px-6 py-4 text-right">
                    <button data-ev-id="ev_d42b7ca8dc" onClick={() => handleDelete(coupon.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_660afe6e7a" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div data-ev-id="ev_7a74a2ebca" className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div data-ev-id="ev_ea59964920" className="flex items-center justify-between p-6 border-b">
              <h2 data-ev-id="ev_d5d7b94ac8" className="text-lg font-semibold">Criar cupom</h2>
              <button data-ev-id="ev_5f4768f990" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form data-ev-id="ev_4e79462f0a" onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_9f251a202c">
                <label data-ev-id="ev_bc05adbd5f" className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input data-ev-id="ev_7c32f57338" type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="DESCONTO10" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono" />
              </div>
              <div data-ev-id="ev_bb8e5bb74b">
                <label data-ev-id="ev_355ef90285" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input data-ev-id="ev_831fce3bc4" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cupom de lançamento" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div data-ev-id="ev_1976d22051" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_78c5047d90">
                  <label data-ev-id="ev_81b4e9faf1" className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select data-ev-id="ev_ef160a540c" value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option data-ev-id="ev_1e193e0b2f" value="percentage">Porcentagem</option>
                    <option data-ev-id="ev_bc3109c9af" value="fixed">Valor fixo</option>
                  </select>
                </div>
                <div data-ev-id="ev_baf2a16ad8">
                  <label data-ev-id="ev_2c3521ad9d" className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                  <input data-ev-id="ev_f71acf33ed" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required step="0.01" min="0" placeholder={discountType === 'percentage' ? '10' : '50.00'} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div data-ev-id="ev_d91f19986a" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_38f589fb70">
                  <label data-ev-id="ev_1a098670f7" className="block text-sm font-medium text-gray-700 mb-1">Compra mínima</label>
                  <input data-ev-id="ev_cb72be1901" type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} step="0.01" min="0" placeholder="100.00" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div data-ev-id="ev_5c07862c72">
                  <label data-ev-id="ev_d239bad8b6" className="block text-sm font-medium text-gray-700 mb-1">Desconto máximo</label>
                  <input data-ev-id="ev_e9b3460cca" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} step="0.01" min="0" placeholder="50.00" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div data-ev-id="ev_f4ee88d04e">
                <label data-ev-id="ev_da1048d071" className="block text-sm font-medium text-gray-700 mb-1">Limite de uso</label>
                <input data-ev-id="ev_e463784fac" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} min="1" placeholder="Ilimitado" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div data-ev-id="ev_29cb9797ca" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_9b29964ebe">
                  <label data-ev-id="ev_d3be1c4b9b" className="block text-sm font-medium text-gray-700 mb-1">Válido de</label>
                  <input data-ev-id="ev_9f89f789a0" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div data-ev-id="ev_0289e9b1cc">
                  <label data-ev-id="ev_ffe16317af" className="block text-sm font-medium text-gray-700 mb-1">Válido até</label>
                  <input data-ev-id="ev_6b4a2aa5e0" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <button data-ev-id="ev_8d87ddc569" type="submit" disabled={isSaving} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : 'Criar cupom'}
              </button>
            </form>
          </div>
        </div>
      }
    </AdminLayout>);

}