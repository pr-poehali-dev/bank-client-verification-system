
-- Сотрудники
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  role_key VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  window_number INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Клиенты
CREATE TABLE clients (
  id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  passport VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  birth_date DATE,
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATE DEFAULT CURRENT_DATE
);

-- Счета
CREATE TABLE accounts (
  id VARCHAR(50) PRIMARY KEY,
  client_id VARCHAR(50) REFERENCES clients(id),
  number VARCHAR(30) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  type_label VARCHAR(50) NOT NULL,
  balance NUMERIC(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'RUB',
  status VARCHAR(20) DEFAULT 'active',
  card_number VARCHAR(30),
  card_expiry VARCHAR(10),
  created_at DATE DEFAULT CURRENT_DATE
);

-- Транзакции
CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  type_label VARCHAR(50) NOT NULL,
  client_id VARCHAR(50),
  client_name VARCHAR(255),
  account_from VARCHAR(30),
  account_to VARCHAR(30),
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  employee_id VARCHAR(50),
  employee_name VARCHAR(255),
  date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed',
  okud_form VARCHAR(10),
  comment TEXT
);

-- Очередь
CREATE TABLE queue_items (
  id VARCHAR(50) PRIMARY KEY,
  client_id VARCHAR(50),
  client_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  ticket_number VARCHAR(10) NOT NULL,
  requested_operation VARCHAR(30) NOT NULL,
  operation_label VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  window_number INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Кредиты
CREATE TABLE credits (
  id VARCHAR(50) PRIMARY KEY,
  client_id VARCHAR(50) REFERENCES clients(id),
  client_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(50),
  amount NUMERIC(15,2) NOT NULL,
  term INT NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  type VARCHAR(20) DEFAULT 'credit',
  status VARCHAR(20) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  paid_amount NUMERIC(15,2) DEFAULT 0
);

-- Начальные данные: сотрудники
INSERT INTO employees (id, name, role, role_key, password_hash, window_number) VALUES
('emp001', 'Иванова Мария Петровна', 'Старший операционист', 'senior_cashier', 'op2024', 1),
('emp002', 'Петров Алексей Сергеевич', 'Операционист', 'cashier', 'cash2024', 2),
('Тима2014', 'Тима2014', 'Старший операционист', 'senior_cashier', '2014', 3);

-- Начальные данные: клиенты
INSERT INTO clients (id, full_name, passport, phone, birth_date, address, status, created_at) VALUES
('cli001', 'Смирнова Анна Владимировна', '4520 123456', '+7 (916) 123-45-67', '1985-03-15', 'г. Москва, ул. Ленина, д. 12, кв. 45', 'active', '2024-01-15'),
('cli002', 'Козлов Дмитрий Александрович', '4519 654321', '+7 (903) 987-65-43', '1978-11-22', 'г. Москва, пр. Мира, д. 55, кв. 10', 'active', '2024-02-20'),
('cli003', 'Новикова Екатерина Игоревна', '4521 789012', '+7 (925) 456-78-90', '1992-07-08', 'г. Москва, ул. Садовая, д. 3', 'active', '2024-03-10');

-- Начальные данные: счета
INSERT INTO accounts (id, client_id, number, type, type_label, balance, currency, status, created_at) VALUES
('acc001', 'cli001', '40817810000000001234', 'current', 'Текущий счёт', 125000, 'RUB', 'active', '2024-01-15'),
('acc002', 'cli001', '40817810000000005678', 'savings', 'Сберегательный', 450000, 'RUB', 'active', '2024-01-15'),
('acc003', 'cli002', '40817810000000009012', 'current', 'Текущий счёт', 78500, 'RUB', 'active', '2024-02-20'),
('acc004', 'cli003', '40817810000000003456', 'card', 'Карточный счёт', 32000, 'RUB', 'active', '2024-03-10');

UPDATE accounts SET card_number='4276 1234 5678 9012', card_expiry='12/27' WHERE id='acc002';
UPDATE accounts SET card_number='4276 9876 5432 1098', card_expiry='08/28' WHERE id='acc004';

-- Начальные данные: транзакции
INSERT INTO transactions (id, type, type_label, client_id, client_name, account_from, amount, currency, employee_id, employee_name, date, status, okud_form) VALUES
('txn001', 'cash_out', 'Выдача наличных', 'cli001', 'Смирнова А.В.', '40817810000000001234', 50000, 'RUB', 'emp001', 'Иванова М.П.', '2026-03-25 10:30:00', 'completed', '0402009'),
('txn002', 'cash_in', 'Взнос наличных', 'cli002', 'Козлов Д.А.', NULL, 30000, 'RUB', 'emp001', 'Иванова М.П.', '2026-03-25 11:15:00', 'completed', '0402008'),
('txn003', 'transfer', 'Перевод', 'cli001', 'Смирнова А.В.', '40817810000000001234', 15000, 'RUB', 'emp002', 'Петров А.С.', '2026-03-25 14:00:00', 'completed', NULL),
('txn004', 'cash_out', 'Выдача наличных', 'cli003', 'Новикова Е.И.', '40817810000000003456', 20000, 'RUB', 'emp001', 'Иванова М.П.', '2026-03-26 09:00:00', 'completed', '0402009');

UPDATE transactions SET account_to='40817810000000009012' WHERE id='txn002';
UPDATE transactions SET account_to='40817810000000009012' WHERE id='txn003';

-- Начальные данные: кредиты
INSERT INTO credits (id, client_id, client_name, account_id, amount, term, rate, type, status, start_date, end_date, paid_amount) VALUES
('crd001', 'cli002', 'Козлов Д.А.', 'acc003', 300000, 24, 14.5, 'credit', 'active', '2025-01-15', '2027-01-15', 75000);

-- Начальные данные: очередь
INSERT INTO queue_items (id, client_id, client_name, phone, ticket_number, requested_operation, operation_label, status) VALUES
('q001', 'cli001', 'Смирнова А.В.', '+7 (916) 123-45-67', 'A001', 'cash_out', 'Выдача наличных', 'waiting'),
('q002', 'cli002', 'Козлов Д.А.', '+7 (903) 987-65-43', 'A002', 'cash_in', 'Взнос наличных', 'waiting'),
('q003', 'cli003', 'Новикова Е.И.', '+7 (925) 456-78-90', 'A003', 'credit', 'Кредит / Рассрочка', 'waiting'),
('q004', NULL, 'Клиент', NULL, 'A004', 'card_issue', 'Выпуск карты', 'waiting');
