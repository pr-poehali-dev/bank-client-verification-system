import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Transaction, formatMoney, formatDate } from '@/data/bankData';

interface HistoryPanelProps {
  transactions: Transaction[];
}

const TYPE_COLORS: Record<string, string> = {
  cash_out: '#00aaff',
  cash_in: '#00e676',
  transfer: '#ffaa00',
  credit: '#ff6b6b',
  card_issue: '#aa88ff',
};

const TYPE_ICONS: Record<string, string> = {
  cash_out: 'ArrowUpFromLine',
  cash_in: 'ArrowDownToLine',
  transfer: 'ArrowLeftRight',
  credit: 'Banknote',
  card_issue: 'CreditCard',
};

export default function HistoryPanel({ transactions }: HistoryPanelProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = sorted.filter(t => {
    const matchSearch = !search ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.accountFrom || '').includes(search) ||
      (t.accountTo || '').includes(search);
    const matchType = filterType === 'all' || t.type === filterType;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalAmount = filtered.reduce((s, t) => s + t.amount, 0);

  const downloadOkud = (txn: Transaction) => {
    if (!txn.okudForm) return;
    const content = `ФОРМА ПО ОКУД ${txn.okudForm}
${txn.type === 'cash_out' ? 'РАСХОДНЫЙ КАССОВЫЙ ОРДЕР' : 'ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР'}

Дата: ${new Date(txn.date).toLocaleDateString('ru-RU')}
Организация: АС ЕФС СБОЛ.про

Клиент: ${txn.clientName}
Счёт: ${txn.accountFrom || txn.accountTo || '—'}
Сумма: ${txn.amount.toLocaleString('ru-RU')} руб. 00 коп.

Операционист: ${txn.employeeName}
Подпись: _______________
    `.trim();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ОКУД_${txn.okudForm}_${txn.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">История операций</h2>
          <p className="text-white/40 text-sm">{transactions.length} операций в системе</p>
        </div>
        <div className="font-mono-bank text-right">
          <div className="text-xs text-white/30">Оборот по выборке</div>
          <div className="text-[var(--neon)] font-bold">{formatMoney(totalAmount)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input-bank w-full h-9 pl-9 pr-4 rounded-lg text-sm"
            placeholder="Поиск по клиенту, ID, счёту..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-bank h-9 px-3 rounded-lg text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Все типы</option>
          <option value="cash_out">Выдача наличных</option>
          <option value="cash_in">Взнос наличных</option>
          <option value="transfer">Перевод</option>
          <option value="credit">Кредит</option>
          <option value="card_issue">Выпуск карты</option>
        </select>
        <select className="input-bank h-9 px-3 rounded-lg text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Все статусы</option>
          <option value="completed">Проведено</option>
          <option value="pending">Ожидание</option>
          <option value="cancelled">Отменено</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-bank">
            <thead>
              <tr>
                <th className="text-left">ID</th>
                <th className="text-left">Тип</th>
                <th className="text-left">Клиент</th>
                <th className="text-left">Счёт</th>
                <th className="text-right">Сумма</th>
                <th className="text-left">Сотрудник</th>
                <th className="text-left">Дата</th>
                <th className="text-left">Статус</th>
                <th className="text-center">Документ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => (
                <tr key={txn.id}>
                  <td>
                    <span className="font-mono-bank text-[10px] text-white/30">{txn.id}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${TYPE_COLORS[txn.type]}20` }}>
                        <Icon name={TYPE_ICONS[txn.type]} size={11} style={{ color: TYPE_COLORS[txn.type] }} />
                      </div>
                      <span className="text-white/60 text-xs">{txn.typeLabel}</span>
                    </div>
                  </td>
                  <td className="text-white/70">{txn.clientName}</td>
                  <td>
                    <div className="font-mono-bank text-[10px] text-white/30">
                      {txn.accountFrom && <div>→ ...{txn.accountFrom.slice(-6)}</div>}
                      {txn.accountTo && <div>← ...{txn.accountTo.slice(-6)}</div>}
                    </div>
                  </td>
                  <td className="text-right">
                    <span className="font-mono-bank font-semibold" style={{ color: TYPE_COLORS[txn.type] }}>
                      {formatMoney(txn.amount)}
                    </span>
                  </td>
                  <td className="text-white/40 text-xs">{txn.employeeName.split(' ').slice(0,2).join(' ')}</td>
                  <td className="text-white/40 text-xs font-mono-bank">{formatDate(txn.date)}</td>
                  <td>
                    <span className={`font-mono-bank text-[9px] px-2 py-0.5 rounded tracking-wider ${
                      txn.status === 'completed' ? 'bg-[var(--neon-dim)] text-[var(--neon)]' :
                      txn.status === 'pending' ? 'bg-yellow-950/30 text-yellow-400' :
                      'bg-red-950/30 text-red-400'
                    }`}>
                      {txn.status === 'completed' ? 'ПРОВЕДЕНО' : txn.status === 'pending' ? 'ОЖИДАНИЕ' : 'ОТМЕНЕНО'}
                    </span>
                  </td>
                  <td className="text-center">
                    {txn.okudForm ? (
                      <button
                        onClick={() => downloadOkud(txn)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono-bank text-[var(--neon)] border border-[rgba(0,230,118,0.2)] hover:bg-[var(--neon-dim)] transition-all"
                      >
                        <Icon name="Download" size={10} />
                        {txn.okudForm}
                      </button>
                    ) : (
                      <span className="text-white/15 text-[9px] font-mono-bank">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Icon name="SearchX" size={28} className="text-white/15 mx-auto mb-2" />
              <p className="text-white/25 text-sm">Нет операций по выбранным фильтрам</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
