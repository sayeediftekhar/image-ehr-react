import psycopg2

try:
    conn = psycopg2.connect('postgresql://neondb_owner:npg_Odu71XQLEtJr@ep-wild-feather-a1h8usnt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-wild-feather-a1h8usnt')
    cur = conn.cursor()
    
    # Check table structure
    cur.execute("""
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
    """)
    columns = cur.fetchall()
    print('Users table structure:')
    for col in columns:
        print(f'  {col[0]}: {col[1]} (nullable: {col[2]})')
    
    # Check admin user details
    cur.execute('SELECT * FROM users WHERE username = %s', ('admin',))
    admin = cur.fetchone()
    print(f'\nAdmin user data: {admin}')
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
