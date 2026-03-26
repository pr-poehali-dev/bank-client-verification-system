import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function TerminalPanel() {
  const [ip, setIp] = useState('192.168.1.100');
  const [port, setPort] = useState('4820');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('ru-RU');
    setLog(prev => [...prev, `[${time}] ${msg}`]);
  };

  const connect = () => {
    setStatus('connecting');
    addLog(`Попытка подключения к ${ip}:${port}...`);
    setTimeout(() => {
      addLog(`Установка TCP соединения...`);
      setTimeout(() => {
        addLog(`Обмен сертификатами безопасности...`);
        setTimeout(() => {
          const success = ip.startsWith('192.168') || ip.startsWith('10.') || ip === 'localhost';
          if (success) {
            setStatus('connected');
            addLog(`✓ Терминал СБОЛ подключён успешно`);
            addLog(`✓ Версия прошивки: 3.12.4`);
            addLog(`✓ Статус: ГОТОВ К РАБОТЕ`);
          } else {
            setStatus('error');
            addLog(`✗ Ошибка подключения: хост недоступен`);
            addLog(`✗ Проверьте IP-адрес и сетевое подключение`);
          }
        }, 800);
      }, 600);
    }, 700);
  };

  const disconnect = () => {
    setStatus('idle');
    addLog(`Соединение разорвано`);
  };

  const testPayment = () => {
    if (status !== 'connected') return;
    addLog(`Тестовый платёж 1.00 ₽...`);
    setTimeout(() => addLog(`✓ Тестовый платёж успешен`), 1000);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-white">Терминал СБОЛ</h2>
        <p className="text-white/40 text-sm">Подключение терминала по IP-адресу</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Connection settings */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Monitor" size={14} className="text-[var(--neon)]" />
            <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Настройки подключения</span>
          </div>

          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">IP-адрес терминала</label>
            <input
              className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank"
              placeholder="192.168.1.100"
              value={ip}
              onChange={e => setIp(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono-bank text-[10px] text-white/40 tracking-widest uppercase">Порт</label>
            <input
              className="input-bank w-full h-11 px-4 rounded-lg text-sm font-mono-bank"
              placeholder="4820"
              value={port}
              onChange={e => setPort(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
            <span className={`status-dot ${status === 'connected' ? '' : status === 'connecting' ? 'status-dot-yellow' : 'status-dot-red'}`} />
            <span className="font-mono-bank text-xs text-white/50 tracking-wider">
              {status === 'idle' ? 'НЕ ПОДКЛЮЧЁН' :
               status === 'connecting' ? 'ПОДКЛЮЧЕНИЕ...' :
               status === 'connected' ? 'ПОДКЛЮЧЁН' : 'ОШИБКА'}
            </span>
          </div>

          <div className="flex gap-2">
            {status !== 'connected' ? (
              <button
                onClick={connect}
                disabled={status === 'connecting'}
                className="btn-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2"
              >
                {status === 'connecting' ? (
                  <><Icon name="Loader2" size={15} className="animate-spin" /><span>Подключение...</span></>
                ) : (
                  <><Icon name="Plug" size={15} /><span>Подключить</span></>
                )}
              </button>
            ) : (
              <>
                <button onClick={testPayment} className="btn-ghost-neon flex-1 h-11 rounded-lg flex items-center justify-center gap-2 text-xs">
                  <Icon name="Zap" size={14} /> Тест
                </button>
                <button onClick={disconnect} className="h-11 px-4 rounded-lg border border-red-900/30 text-red-400/60 hover:text-red-400 hover:bg-red-950/20 transition-all text-xs">
                  Отключить
                </button>
              </>
            )}
          </div>

          {status === 'connected' && (
            <div className="space-y-3 pt-2 border-t border-[var(--panel-border)]">
              <div className="font-mono-bank text-[10px] text-white/30 tracking-widest uppercase">Информация о терминале</div>
              {[
                ['Модель', 'СБОЛ PAX S800'],
                ['Прошивка', '3.12.4'],
                ['Адрес', `${ip}:${port}`],
                ['Статус', 'ГОТОВ К РАБОТЕ'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-white/30 text-xs">{k}</span>
                  <span className="font-mono-bank text-xs text-white/60">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log */}
        <div className="glass-panel rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Terminal" size={14} className="text-[var(--neon)]" />
              <span className="font-mono-bank text-xs text-white/50 tracking-widest uppercase">Лог подключения</span>
            </div>
            <button onClick={() => setLog([])} className="font-mono-bank text-[9px] text-white/25 hover:text-white/50 tracking-wider">ОЧИСТИТЬ</button>
          </div>
          <div className="flex-1 bg-black/40 rounded-lg p-3 overflow-y-auto min-h-[300px] max-h-[400px]">
            {log.length === 0 ? (
              <div className="text-white/15 font-mono-bank text-xs text-center mt-8">Лог пуст</div>
            ) : (
              <div className="space-y-1">
                {log.map((line, i) => (
                  <div key={i} className={`font-mono-bank text-[10px] ${line.includes('✓') ? 'text-[var(--neon)]' : line.includes('✗') ? 'text-[var(--danger)]' : 'text-white/40'}`}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
