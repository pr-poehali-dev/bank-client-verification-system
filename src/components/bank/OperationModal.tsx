import { useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Account, Client, Employee, Transaction, QueueItem,
  formatMoney, generateId, generateAccountNumber
} from '@/data/bankData';

interface OperationModalProps {
  type: 'cash_out' | 'cash_in' | 'transfer' | 'credit' | 'card_issue';
  client?: Client;
  accounts: Account[];
  clients: Client[];
  employee: Employee;
  onClose: () => void;
  onSuccess: (txn: Transaction) => void;
  onCreateAccount: (acc: Account) => void;
  queueItem?: QueueItem;
}

type Step = 'sms_verify' | 'form' | 'confirm' | 'success' | 'create_account';

const OP_LABELS: Record<string, string> = {
  cash_out: 'Выдача наличных',
  cash_in: 'Взнос наличных',
  transfer: 'Перевод со счёта на счёт',
  credit: 'Выдача кредита / рассрочки',
  card_issue: 'Выпуск карты',
};

export default function OperationModal({
  type, client, accounts, clients, employee, onClose, onSuccess, onCreateAccount, queueItem
}: OperationModalProps) {
  const [step, setStep] = useState<Step>('sms_verify');

  // SMS verification
  const [smsCode] = useState(String(Math.floor(1000 + Math.random() * 9000)));
  const [smsInput, setSmsInput] = useState('');
  const [smsError, setSmsError] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  // Common form fields
  const [selectedClientId, setSelectedClientId] = useState(client?.id || '');
  const [amount, setAmount] = useState('');
  const [accountFrom, setAccountFrom] = useState('');
  const [accountTo, setAccountTo] = useState('');
  const [comment, setComment] = useState('');

  // Credit fields
  const [creditPassport, setCreditPassport] = useState('');
  const [creditFio, setCreditFio] = useState('');
  const [creditTerm, setCreditTerm] = useState('12');
  const [creditRate, setCreditRate] = useState('14.5');

  // Card issue fields
  const [cardPassport, setCardPassport] = useState('');
  const [cardFio, setCardFio] = useState('');
  const [cardPhone, setCardPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('4276 ' + Array.from({length:3}, () => Math.floor(1000+Math.random()*9000)).join(' '));
  const [cardExpiry, setCardExpiry] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 4);
    return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(2)}`;
  });

  // Create account
  const [newAccType, setNewAccType] = useState<'current'|'savings'|'card'>('current');
  const [newAccClientId, setNewAccClientId] = useState(client?.id || '');
  const [newAccNumber] = useState(generateAccountNumber());

  const [formError, setFormError] = useState('');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientAccounts = accounts.filter(a => a.clientId === selectedClientId && a.status === 'active');
  const allActiveAccounts = accounts.filter(a => a.status === 'active');

  const sendSms = () => {
    setSmsSent(true);
    const phone = client?.phone || selectedClient?.phone || 'клиента';
    alert(`[ДЕМО] SMS-код верификации клиента (${phone}): ${smsCode}`);
  };

  const verifySms = () => {
    if (smsInput.trim() !== smsCode) {
      setSmsError('Неверный код. Попробуйте снова.');
      return;
    }
    setSmsError('');
    setStep('form');
  };

  const validateForm = () => {
    if (!selectedClientId) return 'Выберите клиента';
    if (type === 'cash_out' || type === 'cash_in') {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 'Введите корректную сумму';
      if (type === 'cash_out' && !accountFrom) return 'Выберите счёт списания';
      if (type === 'cash_in' && !accountTo) return 'Выберите счёт пополнения';
    }
    if (type === 'transfer') {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 'Введите корректную сумму';
      if (!accountFrom) return 'Выберите счёт отправителя';
      if (!accountTo) return 'Выберите счёт получателя';
      if (accountFrom === accountTo) return 'Счета отправителя и получателя не могут совпадать';
    }
    if (type === 'credit') {
      if (!creditPassport) return 'Введите номер паспорта';
      if (!creditFio) return 'Введите ФИО клиента';
      if (!accountTo) return 'Выберите счёт для зачисления';
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 'Введите сумму кредита';
    }
    if (type === 'card_issue') {
      if (!cardPassport) return 'Введите паспортные данные';
      if (!cardFio) return 'Введите ФИО клиента';
      if (!cardPhone) return 'Введите номер телефона';
    }
    return null;
  };

  const handleFormSubmit = () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError('');
    setStep('confirm');
  };

  const handleConfirm = () => {
    const txn: Transaction = {
      id: 'TXN' + generateId(),
      type,
      typeLabel: OP_LABELS[type],
      clientId: selectedClientId,
      clientName: selectedClient?.fullName || cardFio || creditFio || 'Клиент',
      accountFrom: accountFrom || undefined,
      accountTo: accountTo || undefined,
      amount: Number(amount) || 0,
      currency: 'RUB',
      employeeId: employee.id,
      employeeName: employee.name,
      date: new Date().toISOString(),
      status: 'completed',
      okudForm: type === 'cash_out' ? '0402009' : type === 'cash_in' ? '0402008' : undefined,
      comment,
    };
    onSuccess(txn);
    setStep('success');
  };

  const downloadDocument = () => {
    const form = type === 'cash_out' ? '0402009' : '0402008';
    const operationName = type === 'cash_out' ? 'РАСХОДНЫЙ КАССОВЫЙ ОРДЕР' : 'ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР';
    const acc = type === 'cash_out'
      ? accounts.find(a => a.number === accountFrom)
      : accounts.find(a => a.number === accountTo);

    const content = `
ФОРМА ПО ОКУД ${form}
${operationName}

Дата: ${new Date().toLocaleDateString('ru-RU')}
Организация: АС ЕФС СБОЛ.про
ОКПО: 12345678

КЛИЕНТ: ${selectedClient?.fullName || 'Клиент'}
Паспорт: ${selectedClient?.passport || '—'}
Телефон: ${selectedClient?.phone || '—'}

СЧЁТ: ${acc?.number || (type === 'cash_out' ? accountFrom : accountTo) || '—'}
СУММА: ${Number(amount).toLocaleString('ru-RU')} руб. ${Number(amount) % 1 === 0 ? '00 коп.' : ''}

СУММА ПРОПИСЬЮ: ${amountToWords(Number(amount))} рублей 00 копеек

${type === 'cash_out' ? 'ОСНОВАНИЕ ВЫДАЧИ: По заявлению клиента' : 'ОСНОВАНИЕ ПРИЁМА: По заявлению клиента'}
Комментарий: ${comment || '—'}

Операционист: ${employee.name}
Подпись: _______________

Кассир: _______________
Подпись: _______________

${type === 'cash_in' ? 'Квитанция к приходному кассовому ордеру:\nПринято от: ' + (selectedClient?.fullName || 'Клиент') + '\nСумма: ' + Number(amount).toLocaleString('ru-RU') + ' руб.\nДата: ' + new Date().toLocaleDateString('ru-RU') : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ОКУД_${form}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function amountToWords(n: number): string {
    if (n >= 1000000) return `${Math.floor(n/1000000)} миллион${n >= 2000000 && n < 5000000 ? 'а' : n >= 5000000 ? 'ов' : ''} ${Math.floor((n%1000000)/1000)} тысяч`;
    if (n >= 1000) return `${Math.floor(n/1000)} тысяч ${n%1000 > 0 ? n%1000 : ''}`;
    return String(n);
  }

  const handleCreateAccount = () => {
    if (!newAccClientId) return;
    const cl = clients.find(c => c.id === newAccClientId);
    const typeLabels: Record<string, string> = { current: 'Текущий счёт', savings: 'Сберегательный', card: 'Карточный счёт' };
    const newAcc: Account = {
      id: 'ACC' + generateId(),
      clientId: newAccClientId,
      number: newAccNumber,
      type: newAccType,
      typeLabel: typeLabels[newAccType],
      balance: 0,
      currency: 'RUB',
      status: 'active',
      createdAt: new Date().toISOString().slice(0,10),
    };
    onCreateAccount(newAcc);
    setSelectedClientId(newAccClientId);
    if (type === 'cash_out') setAccountFrom(newAcc.number);
    if (type === 'cash_in' || type === 'transfer' || type === 'credit') setAccountTo(newAcc.number);
    setStep('form');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel rounded-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--panel-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center">
              <Icon name={type === 'cash_out' ? 'ArrowUpFromLine' : type === 'cash_in' ? 'ArrowDownToLine' : type === 'transfer' ? 'ArrowLeftRight' : type === 'credit' ? 'Banknote' : 'CreditCard'} size={14} className="text-[var(--neon)]" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{OP_LABELS[type]}</div>
              {queueItem && <div className="font-mono-bank text-[9px] text-white/30">Талон {queueItem.ticketNumber}</div>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Step: SMS Verify */}
          {step === 'sms_verify' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center mx-auto mb-3">
                  <Icon name="ShieldCheck" size={22} className="text-[var(--neon)]" />
                </div>
                <p className="text-white/70 text-sm">Верификация личности клиента</p>
                <p className="text-white/40 text-xs mt-1">Для подтверждения операции необходимо верифицировать клиента по SMS</p>
              </div>

              {client && (
                <div className="card-bank p-3 rounded-lg">
                  <div className="font-mono-bank text-[10px] text-white/40 tracking-wider mb-1">КЛИЕНТ</div>
                  <div className="text-white/80 text-sm">{client.fullName}</div>
                  <div className="font-mono-bank text-xs text-white/40 mt-0.5">{client.phone}</div>
                </div>
              )}

              {!smsSent ? (
                <button onClick={sendSms} className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
                  <Icon name="MessageSquare" size={16} />
                  <span>Отправить SMS-код клиенту</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">SMS-код клиента</label>
                    <input
                      className="input-bank w-full h-14 px-4 rounded-lg text-2xl text-center tracking-[0.5em] font-mono-bank"
                      placeholder="----"
                      maxLength={4}
                      value={smsInput}
                      onChange={e => setSmsInput(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                    />
                  </div>
                  {smsError && (
                    <div className="text-[var(--danger)] text-xs font-mono-bank flex items-center gap-1">
                      <Icon name="AlertCircle" size={11} /> {smsError}
                    </div>
                  )}
                  <button onClick={verifySms} className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
                    <Icon name="CheckCircle" size={16} />
                    <span>Подтвердить личность</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <div className="space-y-4 animate-fade-in">
              {/* Client select */}
              {!client && (
                <div className="space-y-1">
                  <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Клиент</label>
                  <select
                    className="input-bank w-full h-11 px-4 rounded-lg text-sm"
                    value={selectedClientId}
                    onChange={e => { setSelectedClientId(e.target.value); setAccountFrom(''); setAccountTo(''); }}
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
                      onChange={e => setAmount(e.target.value)}
                    />
                  </div>

                  {(type === 'cash_out' || type === 'transfer') && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">
                          {type === 'transfer' ? 'Счёт отправителя' : 'Счёт списания'}
                        </label>
                        <button onClick={() => setStep('create_account')} className="font-mono-bank text-[9px] text-[var(--neon)] tracking-wider hover:opacity-70">
                          + СОЗДАТЬ СЧЁТ
                        </button>
                      </div>
                      <select
                        className="input-bank w-full h-11 px-4 rounded-lg text-xs font-mono-bank"
                        value={accountFrom}
                        onChange={e => setAccountFrom(e.target.value)}
                      >
                        <option value="">— Выберите счёт —</option>
                        {(type === 'transfer' ? allActiveAccounts : clientAccounts).map(a => (
                          <option key={a.id} value={a.number}>{a.number.slice(-8)} · {a.typeLabel} · {(a.balance/1000).toFixed(0)}к ₽</option>
                        ))}
                      </select>
                      {clientAccounts.length === 0 && selectedClientId && (
                        <div className="text-[var(--warning)] text-xs font-mono-bank flex items-center gap-1">
                          <Icon name="AlertCircle" size={11} /> У клиента нет счетов —
                          <button onClick={() => setStep('create_account')} className="text-[var(--neon)] underline ml-1">Создать счёт</button>
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
                        <button onClick={() => setStep('create_account')} className="font-mono-bank text-[9px] text-[var(--neon)] tracking-wider hover:opacity-70">
                          + СОЗДАТЬ СЧЁТ
                        </button>
                      </div>
                      <select
                        className="input-bank w-full h-11 px-4 rounded-lg text-xs font-mono-bank"
                        value={accountTo}
                        onChange={e => setAccountTo(e.target.value)}
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
                    <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" placeholder="XXXX XXXXXX" value={creditPassport} onChange={e => setCreditPassport(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">ФИО клиента</label>
                    <input className="input-bank w-full h-11 px-4 rounded-lg text-sm" placeholder="Иванов Иван Иванович" value={creditFio} onChange={e => setCreditFio(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Срок (мес.)</label>
                      <select className="input-bank w-full h-11 px-4 rounded-lg text-sm" value={creditTerm} onChange={e => setCreditTerm(e.target.value)}>
                        {[3,6,12,18,24,36,48,60].map(t => <option key={t} value={t}>{t} мес.</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Ставка %</label>
                      <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" value={creditRate} onChange={e => setCreditRate(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {type === 'card_issue' && (
                <>
                  <div className="space-y-1">
                    <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Паспорт</label>
                    <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" placeholder="XXXX XXXXXX" value={cardPassport} onChange={e => setCardPassport(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">ФИО</label>
                    <input className="input-bank w-full h-11 px-4 rounded-lg text-sm" placeholder="Иванов Иван Иванович" value={cardFio} onChange={e => setCardFio(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Телефон</label>
                    <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" placeholder="+7 (___) ___-__-__" value={cardPhone} onChange={e => setCardPhone(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Номер карты</label>
                      <input className="input-bank w-full h-11 px-4 rounded-lg text-xs font-mono-bank" value={cardNumber} readOnly />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Срок (ММ/ГГ)</label>
                      <input className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Комментарий</label>
                <input className="input-bank w-full h-10 px-4 rounded-lg text-sm" placeholder="Необязательно" value={comment} onChange={e => setComment(e.target.value)} />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-[var(--danger)] text-xs font-mono-bank bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
                  <Icon name="AlertCircle" size={12} /> {formError}
                </div>
              )}

              <button onClick={handleFormSubmit} className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
                <Icon name="CheckCircle" size={16} />
                <span>Продолжить</span>
              </button>
            </div>
          )}

          {/* Step: Create Account */}
          {step === 'create_account' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-2">
                <Icon name="PlusCircle" size={28} className="text-[var(--neon)] mx-auto mb-2" />
                <p className="text-white/70 text-sm font-semibold">Создание нового счёта</p>
              </div>

              <div className="space-y-1">
                <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Клиент</label>
                <select className="input-bank w-full h-11 px-4 rounded-lg text-sm" value={newAccClientId} onChange={e => setNewAccClientId(e.target.value)}>
                  <option value="">— Выберите клиента —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Тип счёта</label>
                <select className="input-bank w-full h-11 px-4 rounded-lg text-sm" value={newAccType} onChange={e => setNewAccType(e.target.value as 'current'|'savings'|'card')}>
                  <option value="current">Текущий счёт</option>
                  <option value="savings">Сберегательный</option>
                  <option value="card">Карточный счёт</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Номер счёта</label>
                <input className="input-bank w-full h-11 px-4 rounded-lg text-xs font-mono-bank" value={newAccNumber} readOnly />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('form')} className="btn-ghost-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2">
                  ← Назад
                </button>
                <button onClick={handleCreateAccount} className="btn-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2">
                  <Icon name="Plus" size={16} />
                  <span>Создать счёт</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-2">
                <Icon name="AlertCircle" size={28} className="text-[var(--warning)] mx-auto mb-2" />
                <p className="text-white/70 text-sm font-semibold">Подтверждение операции</p>
              </div>

              <div className="card-bank p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">Тип операции</span>
                  <span className="text-white/80 text-xs font-semibold">{OP_LABELS[type]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">Клиент</span>
                  <span className="text-white/80 text-xs">{selectedClient?.fullName || cardFio || creditFio}</span>
                </div>
                {amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs">Сумма</span>
                    <span className="font-mono-bank text-[var(--neon)] text-sm font-bold">{formatMoney(Number(amount))}</span>
                  </div>
                )}
                {accountFrom && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs">Счёт (от)</span>
                    <span className="font-mono-bank text-white/60 text-xs">...{accountFrom.slice(-8)}</span>
                  </div>
                )}
                {accountTo && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs">Счёт (на)</span>
                    <span className="font-mono-bank text-white/60 text-xs">...{accountTo.slice(-8)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[var(--panel-border)]">
                  <span className="text-white/40 text-xs">Операционист</span>
                  <span className="text-white/60 text-xs">{employee.name}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('form')} className="btn-ghost-neon flex-1 h-11 rounded-lg">Изменить</button>
                <button onClick={handleConfirm} className="btn-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2">
                  <Icon name="CheckCircle" size={16} />
                  <span>Провести</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center mx-auto">
                <Icon name="CheckCircle" size={32} className="text-[var(--neon)]" />
              </div>
              <div>
                <p className="text-[var(--neon)] font-semibold text-lg">Операция проведена!</p>
                <p className="text-white/40 text-sm mt-1">{OP_LABELS[type]}</p>
                {amount && <p className="font-mono-bank text-white text-xl font-bold mt-2">{formatMoney(Number(amount))}</p>}
              </div>

              {(type === 'cash_out' || type === 'cash_in') && (
                <button onClick={downloadDocument} className="btn-ghost-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
                  <Icon name="Download" size={16} />
                  <span>Скачать ОКУД {type === 'cash_out' ? '0402009' : '0402008'}</span>
                </button>
              )}

              <button onClick={onClose} className="btn-neon w-full h-11 rounded-lg">
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
