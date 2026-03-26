import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Credit, Client, Account, Employee, Transaction, generateId, formatMoney } from '@/data/bankData';
import OperationModal from './OperationModal';

interface CreditsPanelProps {
  credits: Credit[];
  clients: Client[];
  accounts: Account[];
  employee: Employee;
  onAddCredit: (credit: Credit) => void;
  onAddTransaction: (txn: Transaction) => void;
  onCreateAccount: (acc: Account) => void;
}

export default function CreditsPanel({ credits, clients, accounts, employee, onAddCredit, onAddTransaction, onCreateAccount }: CreditsPanelProps) {
  const [showModal, setShowModal] = useState(false);

  const activeCredits = credits.filter(c => c.status === 'active');
  const totalDebt = activeCredits.reduce((s, c) => s + (c.amount - c.paidAmount), 0);
  const totalIssued = credits.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Кредиты и рассрочки</h2>
          <p className="text-white/40 text-sm">{credits.length} договоров · Долг: <span className="text-red-400 font-mono-bank">{formatMoney(totalDebt)}</span></p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-neon px-4 py-2 rounded-lg flex items-center gap-2">
          <Icon name="Plus" size={15} /> Новый кредит
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-bank p-4 rounded-xl">
          <div className="font-mono-bank text-lg font-bold text-[var(--neon)]">{credits.length}</div>
          <div className="text-white/40 text-xs mt-1">Всего договоров</div>
        </div>
        <div className="card-bank p-4 rounded-xl">
          <div className="font-mono-bank text-lg font-bold text-[var(--warning)]">{formatMoney(totalDebt)}</div>
          <div className="text-white/40 text-xs mt-1">Общий долг</div>
        </div>
        <div className="card-bank p-4 rounded-xl">
          <div className="font-mono-bank text-lg font-bold text-white">{formatMoney(totalIssued)}</div>
          <div className="text-white/40 text-xs mt-1">Всего выдано</div>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full table-bank">
          <thead>
            <tr>
              <th className="text-left">Клиент</th>
              <th className="text-left">Тип</th>
              <th className="text-right">Сумма</th>
              <th className="text-right">Долг</th>
              <th className="text-left">Срок</th>
              <th className="text-left">Ставка</th>
              <th className="text-left">Дата конца</th>
              <th className="text-left">Статус</th>
              <th className="text-left">Прогресс</th>
            </tr>
          </thead>
          <tbody>
            {credits.map(c => {
              const progress = (c.paidAmount / c.amount) * 100;
              return (
                <tr key={c.id}>
                  <td className="text-white/70">{c.clientName}</td>
                  <td>
                    <span className="font-mono-bank text-[9px] px-2 py-0.5 rounded bg-[rgba(255,170,0,0.1)] text-[var(--warning)] border border-[rgba(255,170,0,0.2)]">
                      {c.type === 'credit' ? 'КРЕДИТ' : 'РАССРОЧКА'}
                    </span>
                  </td>
                  <td className="text-right font-mono-bank text-white/60">{formatMoney(c.amount)}</td>
                  <td className="text-right font-mono-bank text-[var(--danger)]">{formatMoney(c.amount - c.paidAmount)}</td>
                  <td className="font-mono-bank text-white/40">{c.term} мес.</td>
                  <td className="font-mono-bank text-[var(--neon)]">{c.rate}%</td>
                  <td className="font-mono-bank text-white/30 text-xs">{c.endDate}</td>
                  <td>
                    <span className={`font-mono-bank text-[9px] px-2 py-0.5 rounded ${c.status === 'active' ? 'bg-[var(--neon-dim)] text-[var(--neon)]' : c.status === 'overdue' ? 'bg-red-950/30 text-red-400' : 'bg-[rgba(255,255,255,0.05)] text-white/30'}`}>
                      {c.status === 'active' ? 'АКТИВЕН' : c.status === 'overdue' ? 'ПРОСРОЧЕН' : 'ЗАКРЫТ'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
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
        {credits.length === 0 && (
          <div className="text-center py-10">
            <Icon name="Banknote" size={24} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/25 text-sm">Нет кредитных договоров</p>
          </div>
        )}
      </div>

      {showModal && (
        <OperationModal
          type="credit"
          accounts={accounts}
          clients={clients}
          employee={employee}
          onClose={() => setShowModal(false)}
          onSuccess={(txn) => {
            onAddTransaction(txn);
            const credit: Credit = {
              id: 'CRD' + generateId(),
              clientId: txn.clientId,
              clientName: txn.clientName,
              accountId: txn.accountTo || '',
              amount: txn.amount,
              term: 12,
              rate: 14.5,
              type: 'credit',
              status: 'active',
              startDate: new Date().toISOString().slice(0, 10),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              paidAmount: 0,
            };
            onAddCredit(credit);
            setShowModal(false);
          }}
          onCreateAccount={onCreateAccount}
        />
      )}
    </div>
  );
}
