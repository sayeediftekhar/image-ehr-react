import psycopg2

try:
    conn = psycopg2.connect('postgresql://neondb_owner:npg_Odu71XQLEtJr@ep-wild-feather-a1h8usnt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-wild-feather-a1h8usnt')
    cur = conn.cursor()
    
    # Check if clinics table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'clinics'
        )
    """)
    clinics_exists = cur.fetchone()[0]
    print(f'Clinics table exists: {clinics_exists}')
    
    if clinics_exists:
        cur.execute('SELECT * FROM clinics LIMIT 5')
        clinics = cur.fetchall()
        print(f'Sample clinics: {clinics}')
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
