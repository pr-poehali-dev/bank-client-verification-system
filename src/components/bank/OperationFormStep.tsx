import Icon from '@/components/ui/icon';
import { Account, Client } from '@/data/bankData';

interface OperationFormStepProps {
  type: 'cash_out' | 'cash_in' | 'transfer' | 'credit' | 'card_issue';
  client?: Client;
  clients: Client[];
  selectedClientId: string;
  clientAccounts: Account[];
  allActiveAccounts: Account[];
  amount: string;
  accountFrom: string;
  accountTo: string;
  comment: string;
  formError: string;
  creditPassport: string;
  creditFio: string;
  creditTerm: string;
  creditRate: string;
  cardPassport: string;
  cardFio: string;
  cardPhone: string;
  cardNumber: string;
  cardExpiry: string;
  onClientChange: (id: string) => void;
  onAmountChange: (val: string) => void;
  onAccountFromChange: (val: string) => void;
  onAccountToChange: (val: string) => void;
  onCommentChange: (val: string) => void;
  onCreditPassportChange: (val: string) => void;
  onCreditFioChange: (val: string) => void;
  onCreditTermChange: (val: string) => void;
  onCreditRateChange: (val: string) => void;
  onCardPassportChange: (val: string) => void;
  onCardFioChange: (val: string) => void;
  onCardPhoneChange: (val: string) => void;
  onCardExpiryChange: (val: string) => void;
  onCreateAccount: () => void;
  onSubmit: () => void;
}

export default function OperationFormStep({
  type, client, clients, selectedClientId, clientAccounts, allActiveAccounts,
  amount, accountFrom, accountTo, comment, formError,
  creditPassport, creditFio, creditTerm, creditRate,
  cardPassport, cardFio, cardPhone, cardNumber, cardExpiry,
  onClientChange, onAmountChange, onAccountFromChange, onAccountToChange, onCommentChange,
  onCreditPassportChange, onCreditFioChange, onCreditTermChange, onCreditRateChange,
  onCardPassportChange, onCardFioChange, onCardPhoneChange, onCardExpiryChange,
  onCreateAccount, onSubmit
}: OperationFormStepProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {!client && (
        <div className="space-y-1">
          <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Клиент</label>
          <select
            className="input-bank w-full h-11 px-4 rounded-lg text-sm"
            value={selectedClientId}
            onChange={e => onClientChange(e.target.value)}
          >
            <option value="">— Выберите клиента —</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </div>
      )}

      {client && (
        <div className="card-bank p-3 rounded-lg">
          <div className="font-mono-bank text-[10px] text-white/40 tracking-wider mb-1">КЛИЕНТ (ВЕРИФИЦИРОВАН)</div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={14} className="text-[var(--neon)]" />
            <span className="text-white/80 text-sm">{client.fullName}</span>
          </div>
        </div>
      )}

      {(type === 'cash_out' || type === 'cash_in' || type === 'transfer' || type === 'credit') && (
        <>
          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">
              Сумма (₽)
            </label>
            <input
              className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank"
              placeholder="0.00"
              type="number"
              min="1"
              value={amount}
              onChange={e => onAmountChange(e.target.value)}
            />
          </div>

          {(type === 'cash_out' || type === 'transfer') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">
                  {type === 'transfer' ? 'Счёт отправителя' : 'Счёт списания'}
                </label>
                <button onClick={onCreateAccount} className="font-mono-bank text-[9px] text-[var(--neon)] tracking-wider hover:opacity-70">
                  + СОЗДАТЬ СЧЁТ
                </button>
              </div>
              <select
                className="input-bank w-full h-11 px-4 rounded-lg text-xs font-mono-bank"
                value={accountFrom}
                onChange={e => onAccountFromChange(e.target.value)}
              >
                <option value="">— Выберите счёт —</option>
                {(type === 'transfer' ? allActiveAccounts : clientAccounts).map(a => (
                  <option key={a.id} value={a.number}>{a.number.slice(-8)} · {a.typeLabel} · {(a.balance/1000).toFixed(0)}к ₽</option>
                ))}
              </select>
              {clientAccounts.length === 0 && selectedClientId && (
                <div className="text-[var(--warning)] text-xs font-mono-bank flex items-center gap-1">
                  <Icon name="AlertCircle" size={11} /> У клиента нет счетов —
                  <button onClick={onCreateAccount} className="text-[var(--neon)] underline ml-1">Создать счёт</button>
                </div>
              )}
            </div>
          )}

          {(type === 'cash_in' || type === 'transfer' || type === 'credit') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">
                  {type === 'transfer' ? 'Счёт получателя' : 'Счёт зачисления'}
                </label>
                <button onClick={onCreateAccount} className="font-mono-bank text-[9px] text-[var(--neon)] tracking-wider hover:opacity-70">
                  + СОЗДАТЬ СЧЁТ
                </button>
              </div>
              <select
                className="input-bank w-full h-11 px-4 rounded-lg text-xs font-mono-bank"
                value={accountTo}
                onChange={e => onAccountToChange(e.target.value)}
              >
                <option value="">— Выберите счёт —</option>
                {(type === 'transfer' ? allActiveAccounts : clientAccounts).map(a => (
                  <option key={a.id} value={a.number}>{a.number.slice(-8)} · {a.typeLabel} · {(a.balance/1000).toFixed(0)}к ₽</option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {type === 'credit' && (
        <>
          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Паспорт клиента</label>
            <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" placeholder="XXXX XXXXXX" value={creditPassport} onChange={e => onCreditPassportChange(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">ФИО клиента</label>
            <input className="input-bank w-full h-11 px-4 rounded-lg text-sm" placeholder="Иванов Иван Иванович" value={creditFio} onChange={e => onCreditFioChange(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Срок (мес.)</label>
              <select className="input-bank w-full h-11 px-4 rounded-lg text-sm" value={creditTerm} onChange={e => onCreditTermChange(e.target.value)}>
                {[3,6,12,18,24,36,48,60].map(t => <option key={t} value={t}>{t} мес.</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Ставка %</label>
              <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" value={creditRate} onChange={e => onCreditRateChange(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {type === 'card_issue' && (
        <>
          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Паспорт</label>
            <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" placeholder="XXXX XXXXXX" value={cardPassport} onChange={e => onCardPassportChange(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">ФИО</label>
            <input className="input-bank w-full h-11 px-4 rounded-lg text-sm" placeholder="Иванов Иван Иванович" value={cardFio} onChange={e => onCardFioChange(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Телефон</label>
            <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" placeholder="+7 (___) ___-__-__" value={cardPhone} onChange={e => onCardPhoneChange(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Номер карты</label>
              <input className="input-bank w-full h-11 px-4 rounded-lg text-xs font-mono-bank" value={cardNumber} readOnly />
            </div>
            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Срок (ММ/ГГ)</label>
              <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" value={cardExpiry} onChange={e => onCardExpiryChange(e.target.value)} />
            </div>
          </div>
        </>
      )}

      <div className="space-y-1">
        <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Комментарий</label>
        <input className="input-bank w-full h-10 px-4 rounded-lg text-sm" placeholder="Необязательно" value={comment} onChange={e => onCommentChange(e.target.value)} />
      </div>

      {formError && (
        <div className="flex items-center gap-2 text-[var(--danger)] text-xs font-mono-bank bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
          <Icon name="AlertCircle" size={12} /> {formError}
        </div>
      )}

      <button onClick={onSubmit} className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
        <Icon name="CheckCircle" size={16} />
        <span>Продолжить</span>
      </button>
    </div>
  );
}
