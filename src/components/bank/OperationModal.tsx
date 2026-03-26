import { useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Account, Client, Employee, Transaction, QueueItem,
  generateId, generateAccountNumber
} from '@/data/bankData';
import OperationSmsStep from './OperationSmsStep';
import OperationFormStep from './OperationFormStep';
import OperationCreateAccountStep from './OperationCreateAccountStep';
import OperationConfirmSuccessStep from './OperationConfirmSuccessStep';

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
  const [cardNumber] = useState('4276 ' + Array.from({length:3}, () => Math.floor(1000+Math.random()*9000)).join(' '));
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
          {step === 'sms_verify' && (
            <OperationSmsStep
              client={client}
              smsSent={smsSent}
              smsInput={smsInput}
              smsError={smsError}
              onSend={sendSms}
              onSmsInputChange={setSmsInput}
              onVerify={verifySms}
            />
          )}

          {step === 'form' && (
            <OperationFormStep
              type={type}
              client={client}
              clients={clients}
              selectedClientId={selectedClientId}
              clientAccounts={clientAccounts}
              allActiveAccounts={allActiveAccounts}
              amount={amount}
              accountFrom={accountFrom}
              accountTo={accountTo}
              comment={comment}
              formError={formError}
              creditPassport={creditPassport}
              creditFio={creditFio}
              creditTerm={creditTerm}
              creditRate={creditRate}
              cardPassport={cardPassport}
              cardFio={cardFio}
              cardPhone={cardPhone}
              cardNumber={cardNumber}
              cardExpiry={cardExpiry}
              onClientChange={(id) => { setSelectedClientId(id); setAccountFrom(''); setAccountTo(''); }}
              onAmountChange={setAmount}
              onAccountFromChange={setAccountFrom}
              onAccountToChange={setAccountTo}
              onCommentChange={setComment}
              onCreditPassportChange={setCreditPassport}
              onCreditFioChange={setCreditFio}
              onCreditTermChange={setCreditTerm}
              onCreditRateChange={setCreditRate}
              onCardPassportChange={setCardPassport}
              onCardFioChange={setCardFio}
              onCardPhoneChange={setCardPhone}
              onCardExpiryChange={setCardExpiry}
              onCreateAccount={() => setStep('create_account')}
              onSubmit={handleFormSubmit}
            />
          )}

          {step === 'create_account' && (
            <OperationCreateAccountStep
              clients={clients}
              newAccClientId={newAccClientId}
              newAccType={newAccType}
              newAccNumber={newAccNumber}
              onClientChange={setNewAccClientId}
              onTypeChange={setNewAccType}
              onBack={() => setStep('form')}
              onCreate={handleCreateAccount}
            />
          )}

          {(step === 'confirm' || step === 'success') && (
            <OperationConfirmSuccessStep
              step={step}
              type={type}
              selectedClient={selectedClient}
              cardFio={cardFio}
              creditFio={creditFio}
              amount={amount}
              accountFrom={accountFrom}
              accountTo={accountTo}
              employee={employee}
              onBack={() => setStep('form')}
              onConfirm={handleConfirm}
              onDownload={downloadDocument}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
