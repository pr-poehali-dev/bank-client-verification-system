import Icon from '@/components/ui/icon';
import { Employee, Transaction, QueueItem, Client, Account, Credit, formatMoney, formatDate } from '@/data/bankData';

interface DashboardProps {
  employee: Employee;
  transactions: Transaction[];
  queue: QueueItem[];
  clients: Client[];
  accounts: Account[];
  credits: Credit[];
  onNavigate: (page: string) => void;
}

export default function Dashboard({ employee, transactions, queue, clients, accounts, credits, onNavigate }: DashboardProps) {
  const today = new Date().toDateString();
  const todayTxns = transactions.filter(t => new Date(t.date).toDateString() === today);
  const totalCashOut = todayTxns.filter(t => t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);
  const totalCashIn = todayTxns.filter(t => t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);
  const waitingQueue = queue.filter(q => q.status === 'waiting').length;
  const activeCredits = credits.filter(c => c.status === 'active').length;

  const stats = [
    { label: 'Операций сегодня', value: todayTxns.length, icon: 'Activity', color: 'var(--neon)', sub: 'транзакций' },
    { label: 'Выдано наличных', value: formatMoney(totalCashOut), icon: 'ArrowUpFromLine', color: '#00aaff', sub: 'сегодня' },
    { label: 'Принято наличных', value: formatMoney(totalCashIn), icon: 'ArrowDownToLine', color: '#ffaa00', sub: 'сегодня' },
    { label: 'В очереди', value: waitingQueue, icon: 'Users', color: '#ff6b6b', sub: 'клиентов' },
    { label: 'Клиентов', value: clients.length, icon: 'UserSquare', color: 'var(--neon)', sub: 'в базе' },
    { label: 'Активных счетов', value: accounts.filter(a => a.status === 'active').length, icon: 'CreditCard', color: '#00aaff', sub: 'счетов' },
    { label: 'Кредитов', value: activeCredits, icon: 'Banknote', color: '#ffaa00', sub: 'активных' },
    { label: 'Всего операций', value: transactions.length, icon: 'ClockIcon', color: '#aaa', sub: 'в системе' },
  ];

  const quickActions = [
    { label: 'Выдача наличных', icon: 'ArrowUpFromLine', page: 'cash_out', color: '#00aaff' },
    { label: 'Взнос наличных', icon: 'ArrowDownToLine', page: 'cash_in', color: 'var(--neon)' },
    { label: 'Перевод', icon: 'ArrowLeftRight', page: 'transfer', color: '#ffaa00' },
    { label: 'Очередь', icon: 'Users', page: 'queue', color: '#ff6b6b' },
    { label: 'Новый клиент', icon: 'UserPlus', page: 'clients', color: 'var(--neon)' },
    { label: 'Кредит', icon: 'Banknote', page: 'credits', color: '#ffaa00' },
  ];

  const recentTxns = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Добро пожаловать, <span className="text-[var(--neon)]">{employee.name.split(' ')[0]}</span></h1>
          <p className="text-white/40 text-sm mt-0.5 font-mono-bank">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-lg">
          <span className="status-dot" />
          <span className="font-mono-bank text-xs text-[var(--neon)]">Окно №{employee.windowNumber}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="card-bank p-4 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
              </div>
            </div>
            <div className="font-mono-bank text-xl font-bold text-white">{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
            <div className="font-mono-bank text-[9px] text-white/20 mt-1 tracking-wider uppercase">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="col-span-1">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Zap" size={14} className="text-[var(--neon)]" />
              <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Быстрые операции</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(a.page)}
                  className="card-bank p-3 rounded-lg text-center hover:scale-[1.02] transition-all"
                  style={{ '--hover-border': a.color } as React.CSSProperties}
                >
                  <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${a.color}20` }}>
                    <Icon name={a.icon} size={16} style={{ color: a.color }} />
                  </div>
                  <div className="text-white/60 text-[10px] leading-tight">{a.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-2">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="ClockIcon" size={14} className="text-[var(--neon)]" />
                <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Последние операции</span>
              </div>
              <button onClick={() => onNavigate('history')} className="font-mono-bank text-[9px] text-[var(--neon)] tracking-wider hover:opacity-70 transition-opacity">
                ВСЕ →
              </button>
            </div>
            <div className="space-y-2">
              {recentTxns.map(txn => (
                <div key={txn.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    txn.type === 'cash_out' ? 'bg-blue-500/10' :
                    txn.type === 'cash_in' ? 'bg-[var(--neon-dim)]' :
                    'bg-yellow-500/10'
                  }`}>
                    <Icon name={
                      txn.type === 'cash_out' ? 'ArrowUpFromLine' :
                      txn.type === 'cash_in' ? 'ArrowDownToLine' :
                      txn.type === 'transfer' ? 'ArrowLeftRight' : 'Banknote'
                    } size={12} className={
                      txn.type === 'cash_out' ? 'text-blue-400' :
                      txn.type === 'cash_in' ? 'text-[var(--neon)]' : 'text-yellow-400'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 text-xs truncate">{txn.clientName}</div>
                    <div className="font-mono-bank text-[9px] text-white/30">{txn.typeLabel}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono-bank text-sm font-semibold ${
                      txn.type === 'cash_out' ? 'text-blue-400' : 'text-[var(--neon)]'
                    }`}>
                      {txn.type === 'cash_out' ? '-' : '+'}{(txn.amount / 1000).toFixed(0)}к ₽
                    </div>
                    <div className="font-mono-bank text-[9px] text-white/25">{formatDate(txn.date).split(',')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Queue Preview */}
      {waitingQueue > 0 && (
        <div className="glass-panel rounded-xl p-4 border-l-2 border-[var(--neon)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--neon-dim)] flex items-center justify-center">
                <Icon name="Users" size={16} className="text-[var(--neon)]" />
              </div>
              <div>
                <div className="text-white/80 text-sm font-medium">В очереди {waitingQueue} {waitingQueue === 1 ? 'клиент' : waitingQueue < 5 ? 'клиента' : 'клиентов'}</div>
                <div className="text-white/40 text-xs">Следующий: {queue.find(q => q.status === 'waiting')?.ticketNumber} — {queue.find(q => q.status === 'waiting')?.clientName}</div>
              </div>
            </div>
            <button onClick={() => onNavigate('queue')} className="btn-neon px-4 py-2 rounded-lg text-xs">
              Перейти к очереди →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
