import { useState, useCallback, useEffect } from 'react';
import LoginScreen from '@/components/bank/LoginScreen';
import Sidebar from '@/components/bank/Sidebar';
import Dashboard from '@/components/bank/Dashboard';
import QueuePanel from '@/components/bank/QueuePanel';
import CashOperationPage from '@/components/bank/CashOperationPage';
import ClientsPanel from '@/components/bank/ClientsPanel';
import AccountsPanel from '@/components/bank/AccountsPanel';
import HistoryPanel from '@/components/bank/HistoryPanel';
import ReportsPanel from '@/components/bank/ReportsPanel';
import TerminalPanel from '@/components/bank/TerminalPanel';
import CreditsPanel from '@/components/bank/CreditsPanel';
import Icon from '@/components/ui/icon';
import {
  Employee, Client, Account, Transaction, QueueItem, Credit,
} from '@/data/bankData';
import { api } from '@/lib/api';

export default function Index() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, accs, txns, q, crds] = await Promise.all([
        api.getClients(),
        api.getAccounts(),
        api.getTransactions(),
        api.getQueue(),
        api.getCredits(),
      ]);
      setClients(cls);
      setAccounts(accs);
      setTransactions(txns);
      setQueueState(q);
      setCredits(crds);
    } catch (e) {
      console.error('Ошибка загрузки:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (employee) loadAll();
  }, [employee, loadAll]);

  const handleLogin = useCallback((emp: Employee) => {
    setEmployee(emp);
    setCurrentPage('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setEmployee(null);
    setClients([]); setAccounts([]); setTransactions([]); setQueueState([]); setCredits([]);
  }, []);

  const addTransaction = useCallback(async (txn: Transaction) => {
    try { await api.createTransaction(txn); } catch (e) { console.error(e); }
    setTransactions(prev => [...prev, txn]);
  }, []);

  const addClient = useCallback(async (client: Client) => {
    try {
      const res = await api.createClient(client) as { id: string };
      client = { ...client, id: res.id || client.id };
    } catch (e) { console.error(e); }
    setClients(prev => [...prev, client]);
  }, []);

  const updateClient = useCallback(async (client: Client) => {
    try { await api.updateClient(client.id, client); } catch (e) { console.error(e); }
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
  }, []);

  const addAccount = useCallback(async (acc: Account) => {
    try { await api.createAccount(acc); } catch (e) { console.error(e); }
    setAccounts(prev => [...prev, acc]);
  }, []);

  const updateAccount = useCallback(async (acc: Account) => {
    try { await api.updateAccount(acc.id, acc); } catch (e) { console.error(e); }
    setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  }, []);

  const addCredit = useCallback(async (credit: Credit) => {
    try { await api.createCredit(credit); } catch (e) { console.error(e); }
    setCredits(prev => [...prev, credit]);
  }, []);

  const setQueue = useCallback(async (newQueue: QueueItem[]) => {
    const oldQueue = queue;
    setQueueState(newQueue);
    const added = newQueue.filter(nq => !oldQueue.find(oq => oq.id === nq.id));
    const changed = newQueue.filter(nq => {
      const old = oldQueue.find(oq => oq.id === nq.id);
      return old && old.status !== nq.status;
    });
    for (const item of added) {
      try { await api.createQueueItem(item); } catch (e) { console.error(e); }
    }
    for (const item of changed) {
      try { await api.updateQueueItem(item.id, { status: item.status, windowNumber: item.windowNumber }); } catch (e) { console.error(e); }
    }
  }, [queue]);

  if (!employee) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-bg">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center mx-auto mb-4">
            <Icon name="Loader2" size={28} className="text-[var(--neon)] animate-spin" />
          </div>
          <div className="font-mono-bank text-sm text-[var(--neon)] tracking-widest">ЗАГРУЗКА ДАННЫХ...</div>
          <div className="font-mono-bank text-[10px] text-white/25 mt-1 tracking-wider">Синхронизация с базой данных</div>
        </div>
      </div>
    );
  }

  const waitingCount = queue.filter(q => q.status === 'waiting').length;

  const pageTitle: Record<string, string> = {
    dashboard: 'Главная',
    queue: 'Электронная очередь',
    cash_out: 'Выдача наличных',
    cash_in: 'Взнос наличных',
    transfer: 'Перевод со счёта',
    clients: 'Клиентская база',
    accounts: 'Управление счетами',
    credits: 'Кредиты / Рассрочка',
    history: 'История операций',
    reports: 'Отчёты и аналитика',
    terminal: 'Терминал СБОЛ',
    profile: 'Личный кабинет',
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        employee={employee}
        onLogout={handleLogout}
        queueCount={waitingCount}
      />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-[var(--panel-border)] flex items-center justify-between px-6 bg-[rgba(10,18,12,0.8)] backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="ChevronRight" size={12} className="text-white/20" />
            <span className="font-mono-bank text-xs text-white/40 tracking-wider">{pageTitle[currentPage] || currentPage}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadAll} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              <Icon name="RefreshCw" size={11} className="text-[var(--neon)] opacity-50" />
              <span className="font-mono-bank text-[9px] text-white/25 tracking-widest">ОБНОВИТЬ</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="status-dot" style={{ width: 6, height: 6 }} />
              <span className="font-mono-bank text-[9px] text-white/25 tracking-widest">БД ПОДКЛЮЧЕНА</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Shield" size={10} className="text-[var(--neon)] opacity-40" />
              <span className="font-mono-bank text-[9px] text-white/20 tracking-wider">TLS 1.3</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <Dashboard
              employee={employee}
              transactions={transactions}
              queue={queue}
              clients={clients}
              accounts={accounts}
              credits={credits}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'queue' && (
            <QueuePanel
              queue={queue}
              clients={clients}
              accounts={accounts}
              employee={employee}
              onUpdateQueue={setQueue}
              onAddTransaction={addTransaction}
              onCreateAccount={addAccount}
            />
          )}

          {(currentPage === 'cash_out' || currentPage === 'cash_in' || currentPage === 'transfer') && (
            <CashOperationPage
              type={currentPage as 'cash_out' | 'cash_in' | 'transfer'}
              clients={clients}
              accounts={accounts}
              employee={employee}
              onAddTransaction={addTransaction}
              onCreateAccount={addAccount}
              transactions={transactions}
            />
          )}

          {currentPage === 'clients' && (
            <ClientsPanel
              clients={clients}
              accounts={accounts}
              onAddClient={addClient}
              onUpdateClient={updateClient}
              onAddAccount={addAccount}
            />
          )}

          {currentPage === 'accounts' && (
            <AccountsPanel
              accounts={accounts}
              clients={clients}
              onAddAccount={addAccount}
              onUpdateAccount={updateAccount}
            />
          )}

          {currentPage === 'credits' && (
            <CreditsPanel
              credits={credits}
              clients={clients}
              accounts={accounts}
              employee={employee}
              onAddCredit={addCredit}
              onAddTransaction={addTransaction}
              onCreateAccount={addAccount}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPanel transactions={transactions} />
          )}

          {currentPage === 'reports' && (
            <ReportsPanel
              transactions={transactions}
              clients={clients}
              accounts={accounts}
              credits={credits}
            />
          )}

          {currentPage === 'terminal' && <TerminalPanel />}

          {currentPage === 'profile' && (
            <div className="p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-white mb-5">Личный кабинет</h2>
              <div className="glass-panel rounded-xl p-6 max-w-md space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--neon-dim)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center">
                    <Icon name="UserCheck" size={28} className="text-[var(--neon)]" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">{employee.name}</div>
                    <div className="badge-role mt-1">{employee.role}</div>
                    <div className="font-mono-bank text-[10px] text-white/30 mt-1">Окно №{employee.windowNumber}</div>
                  </div>
                </div>
                <div className="space-y-3 pt-3 border-t border-[var(--panel-border)]">
                  {[
                    { label: 'Идентификатор', value: employee.id },
                    { label: 'Должность', value: employee.role },
                    { label: 'Номер окна', value: `Окно №${employee.windowNumber}` },
                    { label: 'Операций сегодня', value: String(transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString() && t.employeeId === employee.id).length) },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between items-center">
                      <span className="font-mono-bank text-[10px] text-white/30 tracking-widest uppercase">{f.label}</span>
                      <span className="font-mono-bank text-xs text-white/60">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}