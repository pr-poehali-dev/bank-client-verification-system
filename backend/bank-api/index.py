"""
Главный API для АС ЕФС СБОЛ.про
Обрабатывает все операции: клиенты, счета, транзакции, очередь, кредиты, авторизация
"""
import json
import os
import psycopg2
from datetime import datetime

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data):
    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS_HEADERS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    raw_path = event.get('path', '/')
    # Strip project-id prefix: /PROJECT_ID/resource → /resource
    segments = raw_path.strip('/').split('/')
    if len(segments) >= 2 and len(segments[0]) > 15:
        path = '/' + '/'.join(segments[1:])
    elif len(segments) == 1 and len(segments[0]) > 15:
        path = '/'
    else:
        path = raw_path
    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    # ── HEALTH CHECK ──────────────────────────────────────────────────
    if path in ('/', '') and method == 'GET':
        return ok({'status': 'ok', 'system': 'АС ЕФС СБОЛ.про', 'version': '4.2.1'})

    # ── AUTH ──────────────────────────────────────────────────────────
    if path == '/auth/login' and method == 'POST':
        emp_id = body.get('id', '').strip()
        password = body.get('password', '').strip()
        if not emp_id or not password:
            return err('Укажите идентификатор и пароль')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, role, role_key, window_number FROM employees WHERE id = %s AND password_hash = %s",
            (emp_id, password)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return err('Неверный идентификатор или пароль', 401)
        return ok({
            'id': row[0], 'name': row[1], 'role': row[2],
            'roleKey': row[3], 'windowNumber': row[4]
        })

    # ── CLIENTS ───────────────────────────────────────────────────────
    if path == '/clients' and method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, full_name, passport, phone, birth_date, address, status, created_at FROM clients ORDER BY created_at DESC")
        rows = cur.fetchall()
        conn.close()
        return ok([{
            'id': r[0], 'fullName': r[1], 'passport': r[2], 'phone': r[3],
            'birthDate': str(r[4]) if r[4] else '', 'address': r[5] or '',
            'status': r[6], 'createdAt': str(r[7])
        } for r in rows])

    if path == '/clients' and method == 'POST':
        conn = get_conn()
        cur = conn.cursor()
        cid = 'CLI' + datetime.now().strftime('%f')
        cur.execute(
            "INSERT INTO clients (id, full_name, passport, phone, birth_date, address, status, created_at) VALUES (%s,%s,%s,%s,%s,%s,'active',CURRENT_DATE) RETURNING id",
            (cid, body.get('fullName'), body.get('passport'), body.get('phone'),
             body.get('birthDate') or None, body.get('address') or None)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id, 'status': 'active'})

    if path.startswith('/clients/') and method == 'PUT':
        cid = path.split('/')[-1]
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "UPDATE clients SET full_name=%s, passport=%s, phone=%s, birth_date=%s, address=%s, status=%s WHERE id=%s",
            (body.get('fullName'), body.get('passport'), body.get('phone'),
             body.get('birthDate') or None, body.get('address'), body.get('status'), cid)
        )
        conn.commit()
        conn.close()
        return ok({'ok': True})

    # ── ACCOUNTS ──────────────────────────────────────────────────────
    if path == '/accounts' and method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        client_id = params.get('clientId')
        if client_id:
            cur.execute(
                "SELECT id, client_id, number, type, type_label, balance, currency, status, card_number, card_expiry, created_at FROM accounts WHERE client_id=%s ORDER BY created_at",
                (client_id,)
            )
        else:
            cur.execute("SELECT id, client_id, number, type, type_label, balance, currency, status, card_number, card_expiry, created_at FROM accounts ORDER BY created_at")
        rows = cur.fetchall()
        conn.close()
        return ok([{
            'id': r[0], 'clientId': r[1], 'number': r[2], 'type': r[3],
            'typeLabel': r[4], 'balance': float(r[5]), 'currency': r[6],
            'status': r[7], 'cardNumber': r[8], 'cardExpiry': r[9],
            'createdAt': str(r[10])
        } for r in rows])

    if path == '/accounts' and method == 'POST':
        conn = get_conn()
        cur = conn.cursor()
        aid = 'ACC' + datetime.now().strftime('%f')
        cur.execute(
            "INSERT INTO accounts (id, client_id, number, type, type_label, balance, currency, status, card_number, card_expiry, created_at) VALUES (%s,%s,%s,%s,%s,0,'RUB','active',%s,%s,CURRENT_DATE) RETURNING id",
            (aid, body.get('clientId'), body.get('number'), body.get('type'),
             body.get('typeLabel'), body.get('cardNumber'), body.get('cardExpiry'))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id})

    if path.startswith('/accounts/') and method == 'PUT':
        aid = path.split('/')[-1]
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "UPDATE accounts SET status=%s WHERE id=%s",
            (body.get('status'), aid)
        )
        conn.commit()
        conn.close()
        return ok({'ok': True})

    # ── TRANSACTIONS ──────────────────────────────────────────────────
    if path == '/transactions' and method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, type, type_label, client_id, client_name, account_from, account_to, amount, currency, employee_id, employee_name, date, status, okud_form, comment FROM transactions ORDER BY date DESC"
        )
        rows = cur.fetchall()
        conn.close()
        return ok([{
            'id': r[0], 'type': r[1], 'typeLabel': r[2], 'clientId': r[3],
            'clientName': r[4], 'accountFrom': r[5], 'accountTo': r[6],
            'amount': float(r[7]), 'currency': r[8], 'employeeId': r[9],
            'employeeName': r[10], 'date': str(r[11]), 'status': r[12],
            'okudForm': r[13], 'comment': r[14]
        } for r in rows])

    if path == '/transactions' and method == 'POST':
        conn = get_conn()
        cur = conn.cursor()
        tid = 'TXN' + datetime.now().strftime('%f')
        cur.execute(
            """INSERT INTO transactions
               (id, type, type_label, client_id, client_name, account_from, account_to,
                amount, currency, employee_id, employee_name, date, status, okud_form, comment)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'RUB',%s,%s,NOW(),%s,%s,%s) RETURNING id""",
            (tid, body.get('type'), body.get('typeLabel'), body.get('clientId'),
             body.get('clientName'), body.get('accountFrom'), body.get('accountTo'),
             body.get('amount'), body.get('employeeId'), body.get('employeeName'),
             body.get('status', 'completed'), body.get('okudForm'), body.get('comment'))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id})

    # ── QUEUE ─────────────────────────────────────────────────────────
    if path == '/queue' and method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, client_id, client_name, phone, ticket_number, requested_operation, operation_label, status, window_number, created_at FROM queue_items WHERE status IN ('waiting','serving') ORDER BY created_at"
        )
        rows = cur.fetchall()
        conn.close()
        return ok([{
            'id': r[0], 'clientId': r[1], 'clientName': r[2], 'phone': r[3],
            'ticketNumber': r[4], 'requestedOperation': r[5], 'operationLabel': r[6],
            'status': r[7], 'windowNumber': r[8], 'createdAt': str(r[9])
        } for r in rows])

    if path == '/queue' and method == 'POST':
        conn = get_conn()
        cur = conn.cursor()
        qid = 'Q' + datetime.now().strftime('%f')
        cur.execute(
            "INSERT INTO queue_items (id, client_id, client_name, phone, ticket_number, requested_operation, operation_label, status) VALUES (%s,%s,%s,%s,%s,%s,%s,'waiting') RETURNING id",
            (qid, body.get('clientId'), body.get('clientName'), body.get('phone'),
             body.get('ticketNumber'), body.get('requestedOperation'), body.get('operationLabel'))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id})

    if path.startswith('/queue/') and method == 'PUT':
        qid = path.split('/')[-1]
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "UPDATE queue_items SET status=%s, window_number=%s WHERE id=%s",
            (body.get('status'), body.get('windowNumber'), qid)
        )
        conn.commit()
        conn.close()
        return ok({'ok': True})

    # ── CREDITS ───────────────────────────────────────────────────────
    if path == '/credits' and method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, client_id, client_name, account_id, amount, term, rate, type, status, start_date, end_date, paid_amount FROM credits ORDER BY start_date DESC"
        )
        rows = cur.fetchall()
        conn.close()
        return ok([{
            'id': r[0], 'clientId': r[1], 'clientName': r[2], 'accountId': r[3],
            'amount': float(r[4]), 'term': r[5], 'rate': float(r[6]), 'type': r[7],
            'status': r[8], 'startDate': str(r[9]), 'endDate': str(r[10]),
            'paidAmount': float(r[11])
        } for r in rows])

    if path == '/credits' and method == 'POST':
        conn = get_conn()
        cur = conn.cursor()
        crid = 'CRD' + datetime.now().strftime('%f')
        cur.execute(
            "INSERT INTO credits (id, client_id, client_name, account_id, amount, term, rate, type, status, start_date, end_date, paid_amount) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'active',CURRENT_DATE,%s,0) RETURNING id",
            (crid, body.get('clientId'), body.get('clientName'), body.get('accountId'),
             body.get('amount'), body.get('term'), body.get('rate'),
             body.get('type', 'credit'), body.get('endDate'))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id})

    # ── STATS ─────────────────────────────────────────────────────────
    if path == '/stats' and method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        today = datetime.now().date()
        cur.execute("SELECT COUNT(*) FROM transactions WHERE date::date = %s", (today,))
        txn_today = cur.fetchone()[0]
        cur.execute("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='cash_out' AND date::date = %s", (today,))
        cash_out_today = float(cur.fetchone()[0])
        cur.execute("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='cash_in' AND date::date = %s", (today,))
        cash_in_today = float(cur.fetchone()[0])
        cur.execute("SELECT COUNT(*) FROM queue_items WHERE status='waiting'")
        queue_waiting = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM clients")
        clients_total = cur.fetchone()[0]
        conn.close()
        return ok({
            'txnToday': txn_today,
            'cashOutToday': cash_out_today,
            'cashInToday': cash_in_today,
            'queueWaiting': queue_waiting,
            'clientsTotal': clients_total,
        })

    return err('Маршрут не найден', 404)