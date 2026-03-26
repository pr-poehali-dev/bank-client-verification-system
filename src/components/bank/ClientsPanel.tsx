import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Client, Account, generateId, formatMoney, generateAccountNumber } from '@/data/bankData';

interface ClientsPanelProps {
  clients: Client[];
  accounts: Account[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onAddAccount: (account: Account) => void;
}

export default function ClientsPanel({ clients, accounts, onAddClient, onUpdateClient, onAddAccount }: ClientsPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Add client form
  const [form, setForm] = useState({ fullName: '', passport: '', phone: '', birthDate: '', address: '' });
  const [accType, setAccType] = useState<'current'|'savings'|'card'>('current');
  const [formError, setFormError] = useState('');

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.passport.includes(search) ||
    c.phone.includes(search)
  );

  const clientAccounts = selectedClient ? accounts.filter(a => a.clientId === selectedClient.id) : [];

  const handleAddClient = () => {
    if (!form.fullName || !form.passport || !form.phone) {
      setFormError('Заполните обязательные поля: ФИО, Паспорт, Телефон');
      return;
    }
    const newClient: Client = {
      id: 'CLI' + generateId(),
      ...form,
      status: 'active',
      createdAt: new Date().toISOString().slice(0,10),
    };
    onAddClient(newClient);
    setForm({ fullName: '', passport: '', phone: '', birthDate: '', address: '' });
    setShowAddClient(false);
    setFormError('');
    setSelectedClient(newClient);
  };

  const handleAddAccount = () => {
    if (!selectedClient) return;
    const typeLabels: Record<string, string> = { current: 'Текущий счёт', savings: 'Сберегательный', card: 'Карточный счёт' };
    const newAcc: Account = {
      id: 'ACC' + generateId(),
      clientId: selectedClient.id,
      number: generateAccountNumber(),
      type: accType,
      typeLabel: typeLabels[accType],
      balance: 0,
      currency: 'RUB',
      status: 'active',
      createdAt: new Date().toISOString().slice(0,10),
    };
    onAddAccount(newAcc);
    setShowAddAccount(false);
  };

  const toggleStatus = (client: Client) => {
    onUpdateClient({ ...client, status: client.status === 'active' ? 'blocked' : 'active' });
    if (selectedClient?.id === client.id) {
      setSelectedClient({ ...client, status: client.status === 'active' ? 'blocked' : 'active' });
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">Клиентская база</h2>
          <p className="text-white/40 text-sm">{clients.length} клиентов в системе</p>
        </div>
        <button onClick={() => { setShowAddClient(true); setSelectedClient(null); }} className="btn-neon px-4 py-2 rounded-lg flex items-center gap-2">
          <Icon name="UserPlus" size={15} />
          <span>Новый клиент</span>
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)]">
        {/* Clients list */}
        <div className="col-span-2 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[var(--panel-border)]">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="input-bank w-full h-9 pl-9 pr-4 rounded-lg text-sm"
                placeholder="Поиск по имени, паспорту, телефону..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map(client => (
              <div
                key={client.id}
                onClick={() => { setSelectedClient(client); setShowAddClient(false); }}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedClient?.id === client.id
                    ? 'bg-[var(--neon-dim)] border-[rgba(0,230,118,0.3)]'
                    : 'border-transparent hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.06)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-white/80 text-sm font-medium truncate">{client.fullName}</div>
                    <div className="font-mono-bank text-[10px] text-white/35 mt-0.5">{client.passport}</div>
                    <div className="font-mono-bank text-[10px] text-white/35">{client.phone}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-block w-2 h-2 rounded-full mt-1 ${client.status === 'active' ? 'bg-[var(--neon)]' : 'bg-[var(--danger)]'}`}
                      style={{ boxShadow: `0 0 6px ${client.status === 'active' ? 'var(--neon)' : 'var(--danger)'}` }} />
                  </div>
                </div>
                <div className="font-mono-bank text-[9px] text-white/20 mt-1">
                  {accounts.filter(a => a.clientId === client.id).length} счетов · с {client.createdAt}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10">
                <Icon name="Search" size={24} className="text-white/15 mx-auto mb-2" />
                <p className="text-white/25 text-sm">Клиент не найден</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail / Add form */}
        <div className="col-span-3">
          {showAddClient ? (
            <div className="glass-panel rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="UserPlus" size={15} className="text-[var(--neon)]" />
                <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Новый клиент</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">ФИО *</label>
                  <input className="input-bank w-full h-10 px-4 rounded-lg text-sm" placeholder="Иванов Иван Иванович" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Паспорт *</label>
                  <input className="input-bank w-full h-10 px-4 rounded-lg text-sm font-mono-bank" placeholder="XXXX XXXXXX" value={form.passport} onChange={e => setForm({...form, passport: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Телефон *</label>
                  <input className="input-bank w-full h-10 px-4 rounded-lg text-sm font-mono-bank" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Дата рождения</label>
                  <input className="input-bank w-full h-10 px-4 rounded-lg text-sm" type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Адрес</label>
                  <input className="input-bank w-full h-10 px-4 rounded-lg text-sm" placeholder="г. Москва..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>
              {formError && (
                <div className="text-[var(--danger)] text-xs font-mono-bank flex items-center gap-1">
                  <Icon name="AlertCircle" size=  {11} /> {formError}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setShowAddClient(false); setFormError(''); }} className="btn-ghost-neon px-4 py-2 rounded-lg text-xs">Отмена</button>
                <button onClick={handleAddClient} className="btn-neon px-6 py-2 rounded-lg text-xs flex items-center gap-2">
                  <Icon name="UserPlus" size={13} /> Добавить клиента
                </button>
              </div>
            </div>
          ) : selectedClient ? (
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={18} className="text-[var(--neon)]" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{selectedClient.fullName}</div>
                      <div className="font-mono-bank text-xs text-white/40 mt-0.5">ID: {selectedClient.id}</div>
                      <div className={`badge-role mt-1 inline-block ${selectedClient.status === 'blocked' ? 'text-red-400 border-red-900/40 bg-red-950/20' : ''}`}>
                        {selectedClient.status === 'active' ? 'Активен' : 'Заблокирован'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleStatus(selectedClient)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-bank border transition-all ${
                      selectedClient.status === 'active'
                        ? 'border-red-900/30 text-red-400/60 hover:bg-red-950/20 hover:text-red-400'
                        : 'border-[rgba(0,230,118,0.3)] text-[var(--neon)] hover:bg-[var(--neon-dim)]'
                    }`}
                  >
                    {selectedClient.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Паспорт', value: selectedClient.passport },
                    { label: 'Телефон', value: selectedClient.phone },
                    { label: 'Дата рождения', value: selectedClient.birthDate || '—' },
                    { label: 'Дата регистрации', value: selectedClient.createdAt },
                    { label: 'Адрес', value: selectedClient.address || '—' },
                  ].map(f => (
                    <div key={f.label} className="space-y-0.5">
                      <div className="font-mono-bank text-[9px] text-white/30 tracking-widest uppercase">{f.label}</div>
                      <div className="text-white/70 text-xs font-mono-bank">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accounts */}
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="CreditCard" size={14} className="text-[var(--neon)]" />
                    <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Счета ({clientAccounts.length})</span>
                  </div>
                  <button onClick={() => setShowAddAccount(!showAddAccount)} className="btn-ghost-neon px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                    <Icon name="Plus" size={11} /> Новый счёт
                  </button>
                </div>

                {showAddAccount && (
                  <div className="mb-4 p-3 rounded-lg bg-[rgba(0,230,118,0.04)] border border-[rgba(0,230,118,0.15)] space-y-3">
                    <div className="space-y-1">
                      <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Тип счёта</label>
                      <select className="input-bank w-full h-9 px-3 rounded-lg text-xs" value={accType} onChange={e => setAccType(e.target.value as typeof accType)}>
                        <option value="current">Текущий счёт</option>
                        <option value="savings">Сберегательный</option>
                        <option value="card">Карточный счёт</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddAccount(false)} className="text-xs text-white/30 hover:text-white/50 px-3">Отмена</button>
                      <button onClick={handleAddAccount} className="btn-neon px-4 py-1.5 rounded-lg text-xs flex items-center gap-1">
                        <Icon name="Plus" size={11} /> Создать
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {clientAccounts.map(acc => (
                    <div key={acc.id} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono-bank text-xs text-white/60">{acc.number}</div>
                          <div className="text-white/40 text-[10px] mt-0.5">{acc.typeLabel}</div>
                          {acc.cardNumber && <div className="font-mono-bank text-[9px] text-white/30 mt-0.5">Карта: {acc.cardNumber} · {acc.cardExpiry}</div>}
                        </div>
                        <div className="text-right">
                          <div className="font-mono-bank font-bold text-sm text-[var(--neon)]">{formatMoney(acc.balance)}</div>
                          <div className={`font-mono-bank text-[9px] mt-0.5 ${acc.status === 'active' ? 'text-[var(--neon)]' : 'text-red-400'}`}>
                            {acc.status === 'active' ? 'АКТИВЕН' : 'ЗАКРЫТ'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {clientAccounts.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-white/25 text-xs">Нет счетов</p>
                      <button onClick={() => setShowAddAccount(true)} className="font-mono-bank text-[10px] text-[var(--neon)] mt-2 hover:opacity-70 transition-opacity">
                        + ДОБАВИТЬ СЧЁТ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl h-full flex items-center justify-center">
              <div className="text-center">
                <Icon name="UserSquare" size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">Выберите клиента из списка</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
