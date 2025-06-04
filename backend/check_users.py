import psycopg2

try:
    conn = psycopg2.connect('postgresql://neondb_owner:npg_Odu71XQLEtJr@ep-wild-feather-a1h8usnt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-wild-feather-a1h8usnt')
    cur = conn.cursor()
    cur.execute('SELECT username, password FROM users')
    users = cur.fetchall()
    print('Users in database:')
    for user in users:
        print(f'Username: {user[0]}, Password: {user[1]}')
    conn.close()
except Exception as e:
    print(f'Error: {e}')
