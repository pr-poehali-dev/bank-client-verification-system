import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Client, Account, Employee, Transaction, formatMoney } from '@/data/bankData';
import OperationModal from './OperationModal';

interface CashOperationPageProps {
  type: 'cash_out' | 'cash_in' | 'transfer';
  clients: Client[];
  accounts: Account[];
  employee: Employee;
  onAddTransaction: (txn: Transaction) => void;
  onCreateAccount: (acc: Account) => void;
  transactions: Transaction[];
}

export default function CashOperationPage({ type, clients, accounts, employee, onAddTransaction, onCreateAccount, transactions }: CashOperationPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');

  const opConfig = {
    cash_out: { title: 'Выдача наличных', icon: 'ArrowUpFromLine', color: '#00aaff', okud: '0402009', desc: 'Расходный кассовый ордер (ОКУД 0402009)' },
    cash_in: { title: 'Взнос наличных', icon: 'ArrowDownToLine', color: 'var(--neon)', okud: '0402008', desc: 'Приходный кассовый ордер (ОКУД 0402008)' },
    transfer: { title: 'Перевод со счёта на счёт', icon: 'ArrowLeftRight', color: '#ffaa00', okud: null, desc: 'Межсчётный перевод внутри системы' },
  }[type];

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.passport.includes(search) ||
    c.phone.includes(search)
  );

  const todayTxns = transactions.filter(t => t.type === type && new Date(t.date).toDateString() === new Date().toDateString());
  const todayTotal = todayTxns.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${opConfig.color}15`, border: `1px solid ${opConfig.color}30` }}>
            <Icon name={opConfig.icon} size={22} style={{ color: opConfig.color }} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{opConfig.title}</h2>
            <p className="text-white/40 text-sm mt-0.5">{opConfig.desc}</p>
            {opConfig.okud && (
              <div className="flex items-center gap-1.5 mt-1">
                <Icon name="FileText" size={11} className="text-white/30" />
                <span className="font-mono-bank text-[10px] text-white/30 tracking-wider">Форма ОКУД {opConfig.okud}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right glass-panel px-4 py-3 rounded-xl">
          <div className="font-mono-bank text-[10px] text-white/30 tracking-widest uppercase">Сегодня</div>
          <div className="font-mono-bank font-bold text-lg" style={{ color: opConfig.color }}>{formatMoney(todayTotal)}</div>
          <div className="font-mono-bank text-[9px] text-white/20">{todayTxns.length} операций</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Client selection */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="UserSquare" size={14} className="text-[var(--neon)]" />
            <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Выбор клиента</span>
          </div>

          <div className="relative mb-3">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="input-bank w-full h-9 pl-9 pr-4 rounded-lg text-sm"
              placeholder="Поиск клиента..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filtered.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedClient?.id === client.id
                    ? 'bg-[var(--neon-dim)] border-[rgba(0,230,118,0.3)]'
                    : 'border-transparent bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedClient?.id === client.id && <Icon name="CheckCircle" size={13} className="text-[var(--neon)] flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-white/80 text-xs font-medium truncate">{client.fullName}</div>
                    <div className="font-mono-bank text-[9px] text-white/30 mt-0.5">{client.passport} · {client.phone}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedClient && (
            <div className="mt-4 pt-4 border-t border-[var(--panel-border)]">
              <div className="font-mono-bank text-[10px] text-white/30 tracking-widest uppercase mb-2">Счета клиента</div>
              {accounts.filter(a => a.clientId === selectedClient.id && a.status === 'active').map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-2 rounded bg-[rgba(255,255,255,0.02)] mb-1">
                  <div>
                    <div className="font-mono-bank text-[10px] text-white/50">{acc.number.slice(-8)}</div>
                    <div className="font-mono-bank text-[9px] text-white/25">{acc.typeLabel}</div>
                  </div>
                  <div className="font-mono-bank text-xs font-semibold text-[var(--neon)]">{formatMoney(acc.balance)}</div>
                </div>
              ))}
              {accounts.filter(a => a.clientId === selectedClient.id).length === 0 && (
                <div className="text-white/25 text-[10px] font-mono-bank">Нет активных счетов</div>
              )}
            </div>
          )}
        </div>

        {/* Action area */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Zap" size={14} className="text-[var(--neon)]" />
              <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Действие</span>
            </div>

            {selectedClient ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.2)]">
                  <Icon name="CheckCircle" size={16} className="text-[var(--neon)]" />
                  <div>
                    <div className="text-[var(--neon)] text-sm font-medium">{selectedClient.fullName}</div>
                    <div className="font-mono-bank text-[9px] text-[rgba(0,230,118,0.6)] mt-0.5">Клиент выбран</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-neon w-full h-12 rounded-xl flex items-center justify-center gap-3 text-sm"
                >
                  <Icon name={opConfig.icon} size={18} />
                  <span>{opConfig.title}</span>
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="btn-ghost-neon w-full h-10 rounded-lg text-xs"
                >
                  Выбрать другого клиента
                </button>
              </div>
            ) : (
              <div className="text-center py-10">
                <Icon name="UserSquare" size={28} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Выберите клиента слева</p>
                <p className="text-white/20 text-xs mt-1">для проведения операции</p>
              </div>
            )}
          </div>

          {/* Recent ops */}
          <div className="glass-panel rounded-xl p-4">
            <div className="font-mono-bank text-[10px] text-white/30 tracking-widest uppercase mb-3">Последние операции сегодня</div>
            <div className="space-y-2">
              {todayTxns.slice(-4).reverse().map(txn => (
                <div key={txn.id} className="flex items-center justify-between">
                  <span className="text-white/50 text-xs truncate flex-1">{txn.clientName}</span>
                  <span className="font-mono-bank text-xs font-semibold ml-3" style={{ color: opConfig.color }}>{formatMoney(txn.amount)}</span>
                </div>
              ))}
              {todayTxns.length === 0 && <p className="text-white/20 text-xs font-mono-bank">Нет операций сегодня</p>}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedClient && (
        <OperationModal
          type={type}
          client={selectedClient}
          accounts={accounts}
          clients={clients}
          employee={employee}
          onClose={() => setShowModal(false)}
          onSuccess={(txn) => {
            onAddTransaction(txn);
            setShowModal(false);
          }}
          onCreateAccount={onCreateAccount}
        />
      )}
    </div>
  );
}
