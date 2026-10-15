#!/usr/bin/env python
"""
Run OTP notifications migration
"""
import psycopg2

conn = psycopg2.connect(
    host='db.lefsctqcgrgrsumkxyhz.supabase.co',
    database='postgres',
    user='postgres',
    password='rscapstone2027',
    port='5432'
)

cur = conn.cursor()

with open('add_otp_notifications.sql', 'r') as f:
    sql = f.read()

try:
    cur.execute(sql)
    conn.commit()
    print('[OK] OTP notifications table created successfully!')
except Exception as e:
    print(f'[FAIL] Error: {e}')
    conn.rollback()

# Verify
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name = 'otp_notifications';
""")

if cur.fetchone():
    print('[OK] Table verified: otp_notifications exists')
else:
    print('[FAIL] Table not found')

cur.close()
conn.close()
