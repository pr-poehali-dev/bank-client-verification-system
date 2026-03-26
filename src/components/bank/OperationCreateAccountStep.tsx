import Icon from '@/components/ui/icon';
import { Client } from '@/data/bankData';

interface OperationCreateAccountStepProps {
  clients: Client[];
  newAccClientId: string;
  newAccType: 'current' | 'savings' | 'card';
  newAccNumber: string;
  onClientChange: (id: string) => void;
  onTypeChange: (type: 'current' | 'savings' | 'card') => void;
  onBack: () => void;
  onCreate: () => void;
}

export default function OperationCreateAccountStep({
  clients, newAccClientId, newAccType, newAccNumber,
  onClientChange, onTypeChange, onBack, onCreate
}: OperationCreateAccountStepProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center mb-2">
        <Icon name="PlusCircle" size={28} className="text-[var(--neon)] mx-auto mb-2" />
        <p className="text-white/70 text-sm font-semibold">Создание нового счёта</p>
      </div>

      <div className="space-y-1">
        <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Клиент</label>
        <select className="input-bank w-full h-11 px-4 rounded-lg text-sm" value={newAccClientId} onChange={e => onClientChange(e.target.value)}>
          <option value="">— Выберите клиента —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Тип счёта</label>
        <select className="input-bank w-full h-11 px-4 rounded-lg text-sm" value={newAccType} onChange={e => onTypeChange(e.target.value as 'current' | 'savings' | 'card')}>
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
        <button onClick={onBack} className="btn-ghost-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2">
          ← Назад
        </button>
        <button onClick={onCreate} className="btn-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2">
          <Icon name="Plus" size={16} />
          <span>Создать счёт</span>
        </button>
      </div>
    </div>
  );
}
