import Icon from '@/components/ui/icon';
import { Transaction, Client, Account, Credit, formatMoney } from '@/data/bankData';

interface ReportsPanelProps {
  transactions: Transaction[];
  clients: Client[];
  accounts: Account[];
  credits: Credit[];
}

export default function ReportsPanel({ transactions, clients, accounts, credits }: ReportsPanelProps) {
  const today = new Date().toDateString();
  const todayTxns = transactions.filter(t => new Date(t.date).toDateString() === today);
  const cashOut = transactions.filter(t => t.type === 'cash_out');
  const cashIn = transactions.filter(t => t.type === 'cash_in');
  const transfers = transactions.filter(t => t.type === 'transfer');

  const totalCashOut = cashOut.reduce((s, t) => s + t.amount, 0);
  const totalCashIn = cashIn.reduce((s, t) => s + t.amount, 0);
  const totalTransfer = transfers.reduce((s, t) => s + t.amount, 0);
  const totalBalance = accounts.filter(a => a.status === 'active').reduce((s, a) => s + a.balance, 0);
  const totalCreditDebt = credits.filter(c => c.status === 'active').reduce((s, c) => s + (c.amount - c.paidAmount), 0);

  const byType = [
    { label: 'Выдача наличных', count: cashOut.length, total: totalCashOut, color: '#00aaff', icon: 'ArrowUpFromLine' },
    { label: 'Взнос наличных', count: cashIn.length, total: totalCashIn, color: 'var(--neon)', icon: 'ArrowDownToLine' },
    { label: 'Переводы', count: transfers.length, total: totalTransfer, color: '#ffaa00', icon: 'ArrowLeftRight' },
    { label: 'Кредиты', count: credits.length, total: totalCreditDebt, color: '#ff6b6b', icon: 'Banknote' },
  ];

  const maxVal = Math.max(...byType.map(t => t.total), 1);

  // Employee stats
  const empStats: Record<string, { name: string, count: number, total: number }> = {};
  transactions.forEach(t => {
    if (!empStats[t.employeeId]) empStats[t.employeeId] = { name: t.employeeName, count: 0, total: 0 };
    empStats[t.employeeId].count++;
    empStats[t.employeeId].total += t.amount;
  });
  const empList = Object.values(empStats).sort((a, b) => b.count - a.count);

  const kpiCards = [
    { label: 'Операций за сегодня', value: todayTxns.length, sub: 'транзакций', color: 'var(--neon)' },
    { label: 'Оборот: выдача', value: formatMoney(totalCashOut), sub: 'за всё время', color: '#00aaff' },
    { label: 'Оборот: взнос', value: formatMoney(totalCashIn), sub: 'за всё время', color: 'var(--neon)' },
    { label: 'Остаток на счетах', value: formatMoney(totalBalance), sub: 'активных счетов', color: '#ffaa00' },
    { label: 'Долг по кредитам', value: formatMoney(totalCreditDebt), sub: 'к погашению', color: '#ff6b6b' },
    { label: 'Клиентов в базе', value: clients.length, sub: 'зарегистрировано', color: 'var(--neon)' },
    { label: 'Активных счетов', value: accounts.filter(a => a.status === 'active').length, sub: 'счетов', color: '#00aaff' },
    { label: 'Всего операций', value: transactions.length, sub: 'в системе', color: '#aaa' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-white">Отчёты и аналитика</h2>
        <p className="text-white/40 text-sm">Сводная статистика по операциям</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {kpiCards.map((k, i) => (
          <div key={i} className="card-bank p-4 rounded-xl">
            <div className="font-mono-bank text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-white/50 text-xs mt-1">{k.label}</div>
            <div className="font-mono-bank text-[9px] text-white/20 mt-0.5 tracking-wider uppercase">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Operations by type bar chart */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="BarChart3" size={14} className="text-[var(--neon)]" />
            <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Операции по типам</span>
          </div>
          <div className="space-y-4">
            {byType.map(type => (
              <div key={type.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon name={type.icon} size={12} style={{ color: type.color }} />
                    <span className="text-white/60 text-xs">{type.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-bank text-xs font-semibold" style={{ color: type.color }}>{type.count} оп.</span>
                  </div>
                </div>
                <div className="h-2 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(type.total / maxVal) * 100}%`,
                      background: `linear-gradient(90deg, ${type.color}80, ${type.color})`,
                    }}
                  />
                </div>
                <div className="font-mono-bank text-[9px] text-white/25 mt-1">{formatMoney(type.total)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee stats */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icon name="Users" size={14} className="text-[var(--neon)]" />
            <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Сотрудники</span>
          </div>
          {empList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/25 text-sm">Нет данных</p>
            </div>
          ) : (
            <div className="space-y-3">
              {empList.map((emp, i) => (
                <div key={emp.name} className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono-bank font-bold text-[10px] flex-shrink-0 ${i === 0 ? 'bg-[var(--neon-dim)] text-[var(--neon)] border border-[rgba(0,230,118,0.3)]' : 'bg-[rgba(255,255,255,0.05)] text-white/40'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 text-xs truncate">{emp.name}</div>
                    <div className="font-mono-bank text-[9px] text-white/30">{emp.count} операций</div>
                  </div>
                  <div className="font-mono-bank text-xs font-semibold text-[var(--neon)]">
                    {formatMoney(emp.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credits overview */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Banknote" size={14} className="text-[var(--neon)]" />
          <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Кредитный портфель</span>
        </div>
        {credits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white/25 text-sm">Нет кредитов</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-bank">
              <thead>
                <tr>
                  <th className="text-left">Клиент</th>
                  <th className="text-right">Сумма</th>
                  <th className="text-right">Долг</th>
                  <th className="text-left">Срок</th>
                  <th className="text-left">Ставка</th>
                  <th className="text-left">Статус</th>
                  <th className="text-left">Прогресс</th>
                </tr>
              </thead>
              <tbody>
                {credits.map(c => {
                  const progress = (c.paidAmount / c.amount) * 100;
                  return (
                    <tr key={c.id}>
                      <td>{c.clientName}</td>
                      <td className="text-right font-mono-bank">{formatMoney(c.amount)}</td>
                      <td className="text-right font-mono-bank text-[var(--danger)]">{formatMoney(c.amount - c.paidAmount)}</td>
                      <td className="font-mono-bank text-white/40">{c.term} мес.</td>
                      <td className="font-mono-bank text-[var(--neon)]">{c.rate}%</td>
                      <td>
                        <span className={`font-mono-bank text-[9px] px-2 py-0.5 rounded ${c.status === 'active' ? 'bg-[var(--neon-dim)] text-[var(--neon)]' : c.status === 'overdue' ? 'bg-red-950/30 text-red-400' : 'bg-[rgba(255,255,255,0.05)] text-white/30'}`}>
                          {c.status === 'active' ? 'АКТИВЕН' : c.status === 'overdue' ? 'ПРОСРОЧЕН' : 'ЗАКРЫТ'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--neon)]" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="font-mono-bank text-[9px] text-white/30">{Math.round(progress)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
