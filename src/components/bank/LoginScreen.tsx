import { useState } from 'react';
import { EMPLOYEES, Employee } from '@/data/bankData';
import Icon from '@/components/ui/icon';

interface LoginScreenProps {
  onLogin: (employee: Employee) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [smsStep, setSmsStep] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsInput, setSmsInput] = useState('');
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [smsTimer, setSmsTimer] = useState(60);
  const [showPass, setShowPass] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = () => {
    setError('');
    const emp = EMPLOYEES.find(
      e => e.id.toLowerCase() === identifier.trim().toLowerCase() && e.password === password.trim()
    );
    if (!emp) {
      setError('Неверный идентификатор или пароль');
      triggerShake();
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const code = String(Math.floor(1000 + Math.random() * 9000));
      setSmsCode(code);
      setPendingEmployee(emp);
      setSmsStep(true);
      let t = 60;
      const timer = setInterval(() => {
        t--;
        setSmsTimer(t);
        if (t <= 0) clearInterval(timer);
      }, 1000);
      alert(`[ДЕМО] SMS-код для ${emp.name}: ${code}`);
    }, 1200);
  };

  const handleSmsVerify = () => {
    if (smsInput.trim() !== smsCode) {
      setError('Неверный код подтверждения');
      triggerShake();
      return;
    }
    if (pendingEmployee) {
      onLogin(pendingEmployee);
    }
  };

  const now = new Date().toLocaleString('ru-RU');

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent opacity-30" />
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[var(--neon)] opacity-5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-blue-500 opacity-5 blur-3xl" />
      </div>

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 border-b border-[var(--panel-border)]">
        <div className="flex items-center gap-2">
          <span className="status-dot" />
          <span className="font-mono-bank text-[10px] text-[var(--neon)] tracking-widest uppercase">Система онлайн</span>
        </div>
        <span className="font-mono-bank text-[10px] text-white/30 tracking-wider">{now}</span>
        <div className="flex items-center gap-2">
          <Icon name="Shield" size={12} className="text-[var(--neon)]" />
          <span className="font-mono-bank text-[10px] text-white/30 tracking-wider">TLS 1.3 / AES-256</span>
        </div>
      </div>

      {/* Ticker */}
      <div className="absolute top-12 left-0 right-0 h-8 bg-[rgba(0,230,118,0.05)] border-b border-[rgba(0,230,118,0.1)] flex items-center overflow-hidden">
        <div className="ticker-wrap flex-1">
          <div className="ticker-content font-mono-bank text-[10px] text-[var(--neon)] opacity-50 tracking-wider">
            {Array.from({length: 4}).map((_, i) => (
              <span key={i}>
                &nbsp;&nbsp;●&nbsp;&nbsp;АС ЕФС СБОЛ.про v4.2.1&nbsp;&nbsp;●&nbsp;&nbsp;ЗАЩИЩЁННОЕ СОЕДИНЕНИЕ&nbsp;&nbsp;●&nbsp;&nbsp;ДВУХФАКТОРНАЯ АУТЕНТИФИКАЦИЯ&nbsp;&nbsp;●&nbsp;&nbsp;ЦБ РФ ЛИЦЕНЗИЯ №1000&nbsp;&nbsp;●&nbsp;&nbsp;ОКУД 0402009 / 0402008&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main login card */}
      <div className={`relative z-10 w-full max-w-md animate-slide-up ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
        style={shake ? {animation: 'shake 0.5s ease'} : {}}>

        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] mb-4">
            <Icon name="Building2" size={32} className="text-[var(--neon)]" />
          </div>
          <h1 className="font-mono-bank text-2xl font-bold text-white tracking-wider">АС ЕФС СБОЛ<span className="text-[var(--neon)]">.про</span></h1>
          <p className="text-white/40 text-xs mt-1 tracking-widest uppercase font-mono-bank">Автоматизированная система</p>
          <p className="text-white/25 text-[10px] mt-0.5 tracking-wider font-mono-bank">Единая Финансовая Система</p>
        </div>

        {!smsStep ? (
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Lock" size={14} className="text-[var(--neon)]" />
              <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Авторизация сотрудника</span>
            </div>

            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Идентификатор</label>
              <input
                className="input-bank w-full h-11 px-4 rounded-lg text-sm"
                placeholder="Введите ID сотрудника"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Пароль</label>
              <div className="relative">
                <input
                  className="input-bank w-full h-11 px-4 pr-12 rounded-lg text-sm"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[var(--danger)] text-xs font-mono-bank bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
                <Icon name="AlertCircle" size={12} />
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span>Проверка...</span>
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={16} />
                  <span>Войти в систему</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center pt-1">
              <Icon name="Shield" size={10} className="text-[var(--neon)] opacity-50" />
              <span className="font-mono-bank text-[9px] text-white/25 tracking-wider">ЗАЩИЩЕНО ДВУХФАКТОРНОЙ АУТЕНТИФИКАЦИЕЙ</span>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-6 space-y-4 animate-fade-in">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] mb-3">
                <Icon name="MessageSquare" size={22} className="text-[var(--neon)]" />
              </div>
              <p className="font-mono-bank text-xs text-white/60 tracking-wider">SMS-КОД ПОДТВЕРЖДЕНИЯ</p>
              <p className="text-white/40 text-xs mt-1">Отправлен на телефон сотрудника</p>
            </div>

            <div className="space-y-1">
              <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Введите код из SMS</label>
              <input
                className="input-bank w-full h-14 px-4 rounded-lg text-2xl text-center tracking-[0.5em] font-mono-bank"
                placeholder="----"
                maxLength={4}
                value={smsInput}
                onChange={e => setSmsInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleSmsVerify()}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[var(--danger)] text-xs font-mono-bank bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
                <Icon name="AlertCircle" size={12} />
                {error}
              </div>
            )}

            <button
              onClick={handleSmsVerify}
              className="btn-neon w-full h-11 rounded-lg flex items-center justify-center gap-2"
            >
              <Icon name="CheckCircle" size={16} />
              <span>Подтвердить</span>
            </button>

            <div className="flex justify-between items-center">
              <button onClick={() => { setSmsStep(false); setError(''); }} className="font-mono-bank text-[10px] text-white/30 hover:text-white/60 transition-colors tracking-wider">
                ← НАЗАД
              </button>
              <span className="font-mono-bank text-[10px] text-white/30 tracking-wider">
                {smsTimer > 0 ? `ПОВТОРНАЯ ОТПРАВКА: ${smsTimer}с` : 'ОТПРАВИТЬ ПОВТОРНО'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="font-mono-bank text-[9px] text-white/15 tracking-widest">
          АС ЕФС СБОЛ.про © 2026 · Версия 4.2.1 · ЦБ РФ
        </span>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
