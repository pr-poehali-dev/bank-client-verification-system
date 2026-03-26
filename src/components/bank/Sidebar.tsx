import Icon from '@/components/ui/icon';
import { Employee } from '@/data/bankData';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  employee: Employee;
  onLogout: () => void;
  queueCount: number;
}

const navItems = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'queue', label: 'Электронная очередь', icon: 'Users', badge: true },
  { id: 'cash_out', label: 'Выдача наличных', icon: 'ArrowUpFromLine' },
  { id: 'cash_in', label: 'Взнос наличных', icon: 'ArrowDownToLine' },
  { id: 'transfer', label: 'Перевод со счёта', icon: 'ArrowLeftRight' },
  { id: 'clients', label: 'Клиентская база', icon: 'UserSquare' },
  { id: 'accounts', label: 'Управление счетами', icon: 'CreditCard' },
  { id: 'credits', label: 'Кредиты / Рассрочка', icon: 'Banknote' },
  { id: 'history', label: 'История операций', icon: 'ClockIcon' },
  { id: 'reports', label: 'Отчёты и аналитика', icon: 'BarChart3' },
  { id: 'terminal', label: 'Терминал (IP)', icon: 'Monitor' },
  { id: 'profile', label: 'Личный кабинет', icon: 'User' },
];

export default function Sidebar({ currentPage, onNavigate, employee, onLogout, queueCount }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-[rgba(10,18,12,0.95)] border-r border-[var(--panel-border)] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[var(--panel-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center flex-shrink-0">
            <Icon name="Building2" size={18} className="text-[var(--neon)]" />
          </div>
          <div>
            <div className="font-mono-bank font-bold text-sm text-white">АС ЕФС СБОЛ<span className="text-[var(--neon)]">.про</span></div>
            <div className="font-mono-bank text-[9px] text-white/30 tracking-widest">v4.2.1</div>
          </div>
        </div>
      </div>

      {/* Employee info */}
      <div className="px-4 py-3 border-b border-[var(--panel-border)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="UserCheck" size={14} className="text-[var(--neon)]" />
          </div>
          <div className="min-w-0">
            <div className="text-white/80 text-xs font-medium truncate">{employee.name}</div>
            <div className="badge-role mt-1 inline-block">{employee.role}</div>
            {employee.windowNumber && (
              <div className="font-mono-bank text-[9px] text-white/30 mt-1">Окно №{employee.windowNumber}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="status-dot" style={{width: 6, height: 6}} />
          <span className="font-mono-bank text-[9px] text-[var(--neon)] tracking-widest">СЕССИЯ АКТИВНА</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-item w-full text-left ${currentPage === item.id ? 'active' : ''}`}
          >
            <Icon name={item.icon} size={15} className={currentPage === item.id ? 'text-[var(--neon)]' : 'text-white/40'} />
            <span className="flex-1 text-xs">{item.label}</span>
            {item.badge && queueCount > 0 && (
              <span className="font-mono-bank text-[9px] bg-[var(--neon)] text-black px-1.5 py-0.5 rounded font-bold min-w-[18px] text-center">
                {queueCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--panel-border)]">
        <button
          onClick={onLogout}
          className="nav-item w-full text-left text-red-400/60 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/30"
        >
          <Icon name="LogOut" size={15} />
          <span className="text-xs">Выход из системы</span>
        </button>
        <div className="flex items-center gap-2 mt-3 px-2">
          <Icon name="Shield" size={10} className="text-[var(--neon)] opacity-40" />
          <span className="font-mono-bank text-[9px] text-white/20 tracking-wider">ЦБ РФ · ЗАЩИЩЕНО</span>
        </div>
      </div>
    </aside>
  );
}
