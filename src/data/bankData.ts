export interface Employee {
  id: string;
  name: string;
  role: string;
  roleKey: 'cashier' | 'senior_cashier' | 'manager' | 'admin';
  password: string;
  windowNumber?: number;
}

export interface Client {
  id: string;
  fullName: string;
  passport: string;
  phone: string;
  birthDate: string;
  address: string;
  status: 'active' | 'blocked';
  createdAt: string;
}

export interface Account {
  id: string;
  clientId: string;
  number: string;
  type: 'current' | 'savings' | 'credit' | 'card';
  typeLabel: string;
  balance: number;
  currency: string;
  status: 'active' | 'closed' | 'frozen';
  createdAt: string;
  cardNumber?: string;
  cardExpiry?: string;
}

export interface Transaction {
  id: string;
  type: 'cash_out' | 'cash_in' | 'transfer' | 'credit' | 'card_issue';
  typeLabel: string;
  clientId: string;
  clientName: string;
  accountFrom?: string;
  accountTo?: string;
  amount: number;
  currency: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  okudForm?: string;
  comment?: string;
}

export interface QueueItem {
  id: string;
  clientId?: string;
  clientName: string;
  phone?: string;
  ticketNumber: string;
  requestedOperation: 'cash_out' | 'cash_in' | 'transfer' | 'credit' | 'card_issue' | 'consultation';
  operationLabel: string;
  status: 'waiting' | 'serving' | 'done' | 'cancelled';
  createdAt: string;
  windowNumber?: number;
}

export interface Credit {
  id: string;
  clientId: string;
  clientName: string;
  accountId: string;
  amount: number;
  term: number;
  rate: number;
  type: 'credit' | 'installment';
  status: 'active' | 'closed' | 'overdue';
  startDate: string;
  endDate: string;
  paidAmount: number;
}

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp001',
    name: 'Иванова Мария Петровна',
    role: 'Старший операционист',
    roleKey: 'senior_cashier',
    password: 'op2024',
    windowNumber: 1,
  },
  {
    id: 'emp002',
    name: 'Петров Алексей Сергеевич',
    role: 'Операционист',
    roleKey: 'cashier',
    password: 'cash2024',
    windowNumber: 2,
  },
  {
    id: 'Тима2014',
    name: 'Тима2014',
    role: 'Старший операционист',
    roleKey: 'senior_cashier',
    password: '2014',
    windowNumber: 3,
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli001',
    fullName: 'Смирнова Анна Владимировна',
    passport: '4520 123456',
    phone: '+7 (916) 123-45-67',
    birthDate: '1985-03-15',
    address: 'г. Москва, ул. Ленина, д. 12, кв. 45',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 'cli002',
    fullName: 'Козлов Дмитрий Александрович',
    passport: '4519 654321',
    phone: '+7 (903) 987-65-43',
    birthDate: '1978-11-22',
    address: 'г. Москва, пр. Мира, д. 55, кв. 10',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: 'cli003',
    fullName: 'Новикова Екатерина Игоревна',
    passport: '4521 789012',
    phone: '+7 (925) 456-78-90',
    birthDate: '1992-07-08',
    address: 'г. Москва, ул. Садовая, д. 3',
    status: 'active',
    createdAt: '2024-03-10',
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc001',
    clientId: 'cli001',
    number: '40817810000000001234',
    type: 'current',
    typeLabel: 'Текущий счёт',
    balance: 125000,
    currency: 'RUB',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 'acc002',
    clientId: 'cli001',
    number: '40817810000000005678',
    type: 'savings',
    typeLabel: 'Сберегательный',
    balance: 450000,
    currency: 'RUB',
    status: 'active',
    createdAt: '2024-01-15',
    cardNumber: '4276 1234 5678 9012',
    cardExpiry: '12/27',
  },
  {
    id: 'acc003',
    clientId: 'cli002',
    number: '40817810000000009012',
    type: 'current',
    typeLabel: 'Текущий счёт',
    balance: 78500,
    currency: 'RUB',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: 'acc004',
    clientId: 'cli003',
    number: '40817810000000003456',
    type: 'card',
    typeLabel: 'Карточный счёт',
    balance: 32000,
    currency: 'RUB',
    status: 'active',
    createdAt: '2024-03-10',
    cardNumber: '4276 9876 5432 1098',
    cardExpiry: '08/28',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn001',
    type: 'cash_out',
    typeLabel: 'Выдача наличных',
    clientId: 'cli001',
    clientName: 'Смирнова А.В.',
    accountFrom: '40817810000000001234',
    amount: 50000,
    currency: 'RUB',
    employeeId: 'emp001',
    employeeName: 'Иванова М.П.',
    date: '2026-03-25T10:30:00',
    status: 'completed',
    okudForm: '0402009',
  },
  {
    id: 'txn002',
    type: 'cash_in',
    typeLabel: 'Взнос наличных',
    clientId: 'cli002',
    clientName: 'Козлов Д.А.',
    accountTo: '40817810000000009012',
    amount: 30000,
    currency: 'RUB',
    employeeId: 'emp001',
    employeeName: 'Иванова М.П.',
    date: '2026-03-25T11:15:00',
    status: 'completed',
    okudForm: '0402008',
  },
  {
    id: 'txn003',
    type: 'transfer',
    typeLabel: 'Перевод',
    clientId: 'cli001',
    clientName: 'Смирнова А.В.',
    accountFrom: '40817810000000001234',
    accountTo: '40817810000000009012',
    amount: 15000,
    currency: 'RUB',
    employeeId: 'emp002',
    employeeName: 'Петров А.С.',
    date: '2026-03-25T14:00:00',
    status: 'completed',
  },
  {
    id: 'txn004',
    type: 'cash_out',
    typeLabel: 'Выдача наличных',
    clientId: 'cli003',
    clientName: 'Новикова Е.И.',
    accountFrom: '40817810000000003456',
    amount: 20000,
    currency: 'RUB',
    employeeId: 'emp001',
    employeeName: 'Иванова М.П.',
    date: '2026-03-26T09:00:00',
    status: 'completed',
    okudForm: '0402009',
  },
];

export const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q001',
    clientId: 'cli001',
    clientName: 'Смирнова А.В.',
    phone: '+7 (916) 123-45-67',
    ticketNumber: 'A001',
    requestedOperation: 'cash_out',
    operationLabel: 'Выдача наличных',
    status: 'waiting',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q002',
    clientId: 'cli002',
    clientName: 'Козлов Д.А.',
    phone: '+7 (903) 987-65-43',
    ticketNumber: 'A002',
    requestedOperation: 'cash_in',
    operationLabel: 'Взнос наличных',
    status: 'waiting',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q003',
    clientId: 'cli003',
    clientName: 'Новикова Е.И.',
    phone: '+7 (925) 456-78-90',
    ticketNumber: 'A003',
    requestedOperation: 'credit',
    operationLabel: 'Кредит / Рассрочка',
    status: 'waiting',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q004',
    clientName: 'Клиент',
    ticketNumber: 'A004',
    requestedOperation: 'card_issue',
    operationLabel: 'Выпуск карты',
    status: 'waiting',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CREDITS: Credit[] = [
  {
    id: 'crd001',
    clientId: 'cli002',
    clientName: 'Козлов Д.А.',
    accountId: 'acc003',
    amount: 300000,
    term: 24,
    rate: 14.5,
    type: 'credit',
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2027-01-15',
    paidAmount: 75000,
  },
];

export const formatMoney = (amount: number, currency = 'RUB') =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();
export const generateTicketNumber = (count: number) => `A${String(count).padStart(3, '0')}`;
export const generateAccountNumber = () =>
  '40817810' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
