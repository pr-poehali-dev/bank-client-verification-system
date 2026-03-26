import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Account, Client, formatMoney, generateId, generateAccountNumber } from '@/data/bankData';

interface AccountsPanelProps {
  accounts: Account[];
  clients: Client[];
  onAddAccount: (acc: Account) => void;
  onUpdateAccount: (acc: Account) => void;
}

export default function AccountsPanel({ accounts, clients, onAddAccount, onUpdateAccount }: AccountsPanelProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: '', type: 'current' as Account['type'] });

  const filtered = accounts.filter(a => {
    const client = clients.find(c => c.id === a.clientId);
    const matchSearch = !search ||
      a.number.includes(search) ||
      (client?.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (a.cardNumber || '').includes(search);
    const matchType = filterType === 'all' || a.type === filterType;
    return matchSearch && matchType;
  });

  const totalBalance = filtered.filter(a => a.status === 'active').reduce((s, a) => s + a.balance, 0);

  const handleAdd = () => {
    if (!form.clientId) return;
    const typeLabels: Record<string, string> = { current: 'Текущий счёт', savings: 'Сберегательный', card: 'Карточный счёт', credit: 'Кредитный' };
    const newAcc: Account = {
      id: 'ACC' + generateId(),
      clientId: form.clientId,
      number: generateAccountNumber(),
      type: form.type,
      typeLabel: typeLabels[form.type],
      balance: 0,
      currency: 'RUB',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onAddAccount(newAcc);
    setShowForm(false);
    setForm({ clientId: '', type: 'current' });
  };

  const toggleStatus = (acc: Account) => {
    onUpdateAccount({ ...acc, status: acc.status === 'active' ? 'closed' : 'active' });
  };

  const TYPE_COLORS: Record<string, string> = {
    current: '#00aaff', savings: 'var(--neon)', card: '#aa88ff', credit: '#ff6b6b'
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">Управление счетами</h2>
          <p className="text-white/40 text-sm">{accounts.length} счетов · Общий остаток: <span className="text-[var(--neon)] font-mono-bank">{formatMoney(totalBalance)}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-neon px-4 py-2 rounded-lg flex items-center gap-2">
          <Icon name="Plus" size={15} /> Новый счёт
        </button>
      </div>

      {showForm && (
        <div className="glass-panel rounded-xl p-5 mb-5 border-l-2 border-[var(--neon)] animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="PlusCircle" size={14} className="text-[var(--neon)]" />
            <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Новый счёт</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Клиент</label>
              <select className="input-bank w-full h-10 px-3 rounded-lg text-sm" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                <option value="">— Выберите клиента —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Тип</label>
              <select className="input-bank w-full h-10 px-3 rounded-lg text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Account['type'] })}>
                <option value="current">Текущий</option>
                <option value="savings">Сберегательный</option>
                <option value="card">Карточный</option>
                <option value="credit">Кредитный</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-ghost-neon px-4 py-2 rounded-lg text-xs">Отмена</button>
            <button onClick={handleAdd} className="btn-neon px-6 py-2 rounded-lg text-xs flex items-center gap-2">
              <Icon name="Plus" size={13} /> Создать счёт
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-bank w-full h-9 pl-9 pr-4 rounded-lg text-sm" placeholder="Поиск по номеру, клиенту..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-bank h-9 px-3 rounded-lg text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Все типы</option>
          <option value="current">Текущие</option>
          <option value="savings">Сберегательные</option>
          <option value="card">Карточные</option>
          <option value="credit">Кредитные</option>
        </select>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full table-bank">
          <thead>
            <tr>
              <th className="text-left">Номер счёта</th>
              <th className="text-left">Клиент</th>
              <th className="text-left">Тип</th>
              <th className="text-right">Баланс</th>
              <th className="text-left">Карта</th>
              <th className="text-left">Дата</th>
              <th className="text-left">Статус</th>
              <th className="text-center">Действие</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => {
              const client = clients.find(c => c.id === acc.clientId);
              return (
                <tr key={acc.id}>
                  <td>
                    <span className="font-mono-bank text-xs text-white/60">{acc.number}</span>
                  </td>
                  <td className="text-white/70 text-xs">{client?.fullName || '—'}</td>
                  <td>
                    <span className="font-mono-bank text-[9px] px-2 py-0.5 rounded" style={{ background: `${TYPE_COLORS[acc.type]}15`, color: TYPE_COLORS[acc.type], border: `1px solid ${TYPE_COLORS[acc.type]}30` }}>
                      {acc.typeLabel}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="font-mono-bank font-semibold text-[var(--neon)]">{formatMoney(acc.balance)}</span>
                  </td>
                  <td>
                    {acc.cardNumber ? (
                      <div>
                        <div className="font-mono-bank text-[9px] text-white/50">{acc.cardNumber}</div>
                        <div className="font-mono-bank text-[9px] text-white/25">{acc.cardExpiry}</div>
                      </div>
                    ) : <span className="text-white/15 text-[9px] font-mono-bank">—</span>}
                  </td>
                  <td className="font-mono-bank text-[10px] text-white/30">{acc.createdAt}</td>
                  <td>
                    <span className={`font-mono-bank text-[9px] px-2 py-0.5 rounded tracking-wider ${acc.status === 'active' ? 'bg-[var(--neon-dim)] text-[var(--neon)]' : acc.status === 'frozen' ? 'bg-yellow-950/30 text-yellow-400' : 'bg-[rgba(255,255,255,0.05)] text-white/30'}`}>
                      {acc.status === 'active' ? 'АКТИВЕН' : acc.status === 'frozen' ? 'ЗАМОРОЖЕН' : 'ЗАКРЫТ'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => toggleStatus(acc)}
                      className="font-mono-bank text-[9px] px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] text-white/30 hover:text-white/60 transition-all"
                    >
                      {acc.status === 'active' ? 'Закрыть' : 'Открыть'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <Icon name="CreditCard" size={24} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/25 text-sm">Счета не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
