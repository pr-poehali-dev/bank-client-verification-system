import Icon from '@/components/ui/icon';
import { Client } from '@/data/bankData';

interface OperationSmsStepProps {
  client?: Client;
  smsSent: boolean;
  smsInput: string;
  smsError: string;
  onSend: () => void;
  onSmsInputChange: (val: string) => void;
  onVerify: () => void;
}

export default function OperationSmsStep({
  client, smsSent, smsInput, smsError, onSend, onSmsInputChange, onVerify
}: OperationSmsStepProps) {
  return (
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
        <button onClick={onSend} className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
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
              onChange={e => onSmsInputChange(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>
          {smsError && (
            <div className="text-[var(--danger)] text-xs font-mono-bank flex items-center gap-1">
              <Icon name="AlertCircle" size={11} /> {smsError}
            </div>
          )}
          <button onClick={onVerify} className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2">
            <Icon name="CheckCircle" size={16} />
            <span>Подтвердить личность</span>
          </button>
        </div>
      )}
    </div>
  );
}
