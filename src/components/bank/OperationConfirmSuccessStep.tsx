import Icon from '@/components/ui/icon';
import { Client, Employee, formatMoney } from '@/data/bankData';

const OP_LABELS: Record<string, string> = {
  cash_out: 'Выдача наличных',
  cash_in: 'Взнос наличных',
  transfer: 'Перевод со счёта на счёт',
  credit: 'Выдача кредита / рассрочки',
  card_issue: 'Выпуск карты',
};

interface OperationConfirmStepProps {
  step: 'confirm' | 'success';
  type: 'cash_out' | 'cash_in' | 'transfer' | 'credit' | 'card_issue';
  selectedClient?: Client;
  cardFio: string;
  creditFio: string;
  amount: string;
  accountFrom: string;
  accountTo: string;
  employee: Employee;
  onBack: () => void;
  onConfirm: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export default function OperationConfirmSuccessStep({
  step, type, selectedClient, cardFio, creditFio,
  amount, accountFrom, accountTo, employee,
  onBack, onConfirm, onDownload, onClose
}: OperationConfirmStepProps) {
  if (step === 'confirm') {
    return (
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
          <button onClick={onBack} className="btn-ghost-neon flex-1 h-11 rounded-lg">Изменить</button>
          <button onClick={onConfirm} className="btn-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2">
            <Icon name="CheckCircle" size={16} />
            <span>Провести</span>
          </button>
        </div>
      </div>
    );
  }

  return (
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
        <button onClick={onDownload} className="btn-ghost-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
          <Icon name="Download" size={16} />
          <span>Скачать ОКУД {type === 'cash_out' ? '0402009' : '0402008'}</span>
        </button>
      )}

      <button onClick={onClose} className="btn-neon w-full h-11 rounded-lg">
        Закрыть
      </button>
    </div>
  );
}
