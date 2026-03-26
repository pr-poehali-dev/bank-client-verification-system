import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { QueueItem, Client, Employee, generateId, generateTicketNumber } from '@/data/bankData';
import OperationModal from './OperationModal';
import { Account, Transaction } from '@/data/bankData';

interface QueuePanelProps {
  queue: QueueItem[];
  clients: Client[];
  accounts: Account[];
  employee: Employee;
  onUpdateQueue: (queue: QueueItem[]) => void;
  onAddTransaction: (txn: Transaction) => void;
  onCreateAccount: (acc: Account) => void;
}

const OPERATION_TYPES = [
  { value: 'cash_out', label: 'Выдача наличных', icon: 'ArrowUpFromLine', color: '#00aaff' },
  { value: 'cash_in', label: 'Взнос наличных', icon: 'ArrowDownToLine', color: 'var(--neon)' },
  { value: 'transfer', label: 'Перевод', icon: 'ArrowLeftRight', color: '#ffaa00' },
  { value: 'credit', label: 'Кредит / Рассрочка', icon: 'Banknote', color: '#ff6b6b' },
  { value: 'card_issue', label: 'Выпуск карты', icon: 'CreditCard', color: '#aa88ff' },
  { value: 'consultation', label: 'Консультация', icon: 'MessageCircle', color: '#aaaaaa' },
] as const;

export default function QueuePanel({ queue, clients, accounts, employee, onUpdateQueue, onAddTransaction, onCreateAccount }: QueuePanelProps) {
  const [servingItem, setServingItem] = useState<QueueItem | null>(null);
  const [modalOp, setModalOp] = useState<'cash_out' | 'cash_in' | 'transfer' | 'credit' | 'card_issue' | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOp, setNewOp] = useState<typeof OPERATION_TYPES[number]['value']>('cash_out');

  const waiting = queue.filter(q => q.status === 'waiting');
  const serving = queue.filter(q => q.status === 'serving');
  const done = queue.filter(q => q.status === 'done').slice(-5);

  const takeNext = () => {
    const next = waiting[0];
    if (!next) return;
    const updated = queue.map(q =>
      q.id === next.id ? { ...q, status: 'serving' as const, windowNumber: employee.windowNumber } : q
    );
    onUpdateQueue(updated);
    setServingItem({ ...next, status: 'serving', windowNumber: employee.windowNumber });
  };

  const finishServing = (itemId: string) => {
    const updated = queue.map(q => q.id === itemId ? { ...q, status: 'done' as const } : q);
    onUpdateQueue(updated);
    setServingItem(null);
    setModalOp(null);
  };

  const cancelItem = (itemId: string) => {
    const updated = queue.map(q => q.id === itemId ? { ...q, status: 'cancelled' as const } : q);
    onUpdateQueue(updated);
    if (servingItem?.id === itemId) { setServingItem(null); setModalOp(null); }
  };

  const addToQueue = () => {
    const opLabel = OPERATION_TYPES.find(o => o.value === newOp)?.label || newOp;
    const cl = clients.find(c => c.id === newClientId);
    const item: QueueItem = {
      id: 'Q' + generateId(),
      clientId: newClientId || undefined,
      clientName: cl ? cl.fullName : (newClientName || 'Клиент'),
      phone: newPhone || cl?.phone,
      ticketNumber: generateTicketNumber(queue.length + 1),
      requestedOperation: newOp as QueueItem['requestedOperation'],
      operationLabel: opLabel,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    onUpdateQueue([...queue, item]);
    setShowAddForm(false);
    setNewClientId(''); setNewClientName(''); setNewPhone('');
  };

  const currentServingClient = servingItem ? clients.find(c => c.id === servingItem.clientId) : undefined;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Электронная очередь</h2>
          <p className="text-white/40 text-sm">Окно №{employee.windowNumber} · {employee.name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-ghost-neon px-4 py-2 rounded-lg flex items-center gap-2">
            <Icon name="UserPlus" size={14} />
            <span>Добавить в очередь</span>
          </button>
          {waiting.length > 0 && !serving.length && (
            <button onClick={takeNext} className="btn-neon px-5 py-2 rounded-lg flex items-center gap-2">
              <Icon name="ChevronRight" size={16} />
              <span>Взять следующего</span>
            </button>
          )}
        </div>
      </div>

      {/* Add to queue form */}
      {showAddForm && (
        <div className="glass-panel rounded-xl p-5 space-y-4 border-l-2 border-[var(--neon)] animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="UserPlus" size={14} className="text-[var(--neon)]" />
            <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Добавить клиента в очередь</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Клиент из базы</label>
              <select className="input-bank w-full h-10 px-3 rounded-lg text-sm" value={newClientId} onChange={e => setNewClientId(e.target.value)}>
                <option value="">— Выбрать —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Или имя вручную</label>
              <input className="input-bank w-full h-10 px-3 rounded-lg text-sm" placeholder="Имя клиента" value={newClientName} onChange={e => setNewClientName(e.target.value)} disabled={!!newClientId} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Телефон</label>
              <input className="input-bank w-full h-10 px-3 rounded-lg text-sm font-mono-bank" placeholder="+7..." value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Операция</label>
              <select className="input-bank w-full h-10 px-3 rounded-lg text-sm" value={newOp} onChange={e => setNewOp(e.target.value as typeof newOp)}>
                {OPERATION_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddForm(false)} className="btn-ghost-neon px-4 py-2 rounded-lg text-xs">Отмена</button>
            <button onClick={addToQueue} className="btn-neon px-6 py-2 rounded-lg text-xs flex items-center gap-2">
              <Icon name="Plus" size={13} /> Добавить
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Now Serving */}
        <div className="col-span-1">
          <div className="glass-panel rounded-xl p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="status-dot status-dot-yellow" />
              <span className="font-mono-bank text-xs text-[var(--warning)] tracking-widest uppercase">Обслуживается</span>
            </div>

            {servingItem ? (
              <div className="space-y-4">
                <div className="card-bank p-4 rounded-xl">
                  <div className="font-mono-bank text-2xl font-bold text-[var(--neon)] mb-1">{servingItem.ticketNumber}</div>
                  <div className="text-white/80 font-medium text-sm">{servingItem.clientName}</div>
                  {servingItem.phone && <div className="font-mono-bank text-xs text-white/40 mt-1">{servingItem.phone}</div>}
                  <div className="mt-3 pt-3 border-t border-[var(--panel-border)]">
                    <div className="font-mono-bank text-[9px] text-white/30 tracking-wider uppercase mb-1">Запрошенная операция</div>
                    <div className="text-[var(--warning)] text-xs font-medium">{servingItem.operationLabel}</div>
                  </div>
                </div>

                <div>
                  <div className="font-mono-bank text-[10px] text-white/30 tracking-wider uppercase mb-2">Выполнить операцию</div>
                  <div className="space-y-1.5">
                    {OPERATION_TYPES.filter(o => o.value !== 'consultation').map(op => (
                      <button
                        key={op.value}
                        onClick={() => setModalOp(op.value as typeof modalOp)}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-xs transition-all border
                          ${servingItem.requestedOperation === op.value
                            ? 'bg-[var(--neon-dim)] border-[rgba(0,230,118,0.4)] text-[var(--neon)]'
                            : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-white/40 hover:text-white/70 hover:bg-[rgba(255,255,255,0.04)]'
                          }`}
                      >
                        <Icon name={op.icon} size={13} style={{ color: servingItem.requestedOperation === op.value ? 'var(--neon)' : op.color }} />
                        <span>{op.label}</span>
                        {servingItem.requestedOperation === op.value && (
                          <span className="ml-auto font-mono-bank text-[8px] tracking-widest">РЕКОМЕНДУЕТСЯ</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => finishServing(servingItem.id)} className="btn-neon flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1">
                    <Icon name="CheckCircle" size={13} /> Завершить
                  </button>
                  <button onClick={() => cancelItem(servingItem.id)} className="py-2 px-3 rounded-lg text-xs border border-red-900/30 text-red-400/60 hover:text-red-400 hover:bg-red-950/20 transition-all">
                    <Icon name="X" size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="Users" size={28} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Нет активных клиентов</p>
                {waiting.length > 0 && (
                  <button onClick={takeNext} className="btn-neon mt-4 px-4 py-2 rounded-lg text-xs">
                    Взять следующего
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Waiting */}
        <div className="col-span-1">
          <div className="glass-panel rounded-xl p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="status-dot" />
                <span className="font-mono-bank text-xs text-[var(--neon)] tracking-widest uppercase">Ожидают</span>
              </div>
              <span className="font-mono-bank text-sm font-bold text-white">{waiting.length}</span>
            </div>
            <div className="space-y-2">
              {waiting.map((item, i) => (
                <div key={item.id} className={`p-3 rounded-lg border transition-all ${i === 0 ? 'border-[rgba(0,230,118,0.2)] bg-[var(--neon-dim)]' : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono-bank font-bold ${i === 0 ? 'text-[var(--neon)]' : 'text-white/50'}`}>{item.ticketNumber}</span>
                    <button onClick={() => cancelItem(item.id)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                  <div className="text-white/70 text-xs mt-1 truncate">{item.clientName}</div>
                  <div className="font-mono-bank text-[9px] text-white/30 mt-0.5">{item.operationLabel}</div>
                  {i === 0 && <div className="font-mono-bank text-[8px] text-[var(--neon)] mt-1 tracking-widest">СЛЕДУЮЩИЙ</div>}
                </div>
              ))}
              {waiting.length === 0 && (
                <div className="text-center py-6">
                  <Icon name="CheckCircle" size={24} className="text-[var(--neon)] mx-auto mb-2 opacity-40" />
                  <p className="text-white/25 text-xs">Очередь пуста</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Done */}
        <div className="col-span-1">
          <div className="glass-panel rounded-xl p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="CheckCircle" size={13} className="text-white/30" />
              <span className="font-mono-bank text-xs text-white/30 tracking-widest uppercase">Обслужены</span>
            </div>
            <div className="space-y-2">
              {done.map(item => (
                <div key={item.id} className="p-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] opacity-50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-bank text-xs text-white/30">{item.ticketNumber}</span>
                    <Icon name="CheckCircle" size={11} className="text-[var(--neon)] opacity-50" />
                  </div>
                  <div className="text-white/30 text-xs mt-0.5 truncate">{item.clientName}</div>
                </div>
              ))}
              {done.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-white/20 text-xs">Нет обслуженных</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Operation Modal */}
      {modalOp && modalOp !== 'consultation' && (
        <OperationModal
          type={modalOp}
          client={currentServingClient}
          accounts={accounts}
          clients={clients}
          employee={employee}
          onClose={() => setModalOp(null)}
          onSuccess={(txn) => {
            onAddTransaction(txn);
            setModalOp(null);
          }}
          onCreateAccount={onCreateAccount}
          queueItem={servingItem || undefined}
        />
      )}
    </div>
  );
}
