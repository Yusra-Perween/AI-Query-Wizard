import sqlite3
import json

DB_FILE = "company.db"

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create sample tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            department_id INTEGER,
            salary REAL,
            hire_date DATE,
            FOREIGN KEY(department_id) REFERENCES departments(id)
        )
    ''')
    
    # Check if we need to insert dummy data
    cursor.execute('SELECT COUNT(*) FROM departments')
    if cursor.fetchone()[0] == 0:
        cursor.executemany('INSERT INTO departments (name, location) VALUES (?, ?)', [
            ('Engineering', 'New York'),
            ('Sales', 'San Francisco'),
            ('HR', 'Chicago')
        ])
        cursor.executemany('INSERT INTO employees (name, department_id, salary, hire_date) VALUES (?, ?, ?, ?)', [
            ('Alice Smith', 1, 120000, '2022-01-15'),
            ('Bob Jones', 1, 110000, '2023-03-10'),
            ('Charlie Brown', 2, 85000, '2021-07-22'),
            ('Diana Prince', 3, 90000, '2020-11-05')
        ])
        conn.commit()
    conn.close()

def execute_query(query: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        if query.strip().upper().startswith("SELECT"):
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            result = [dict(zip(columns, row)) for row in rows]
            return {"success": True, "data": result, "columns": columns}
        else:
            conn.commit()
            return {"success": True, "message": f"Query executed successfully. Rows affected: {cursor.rowcount}"}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

def get_schema():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    schema = {}
    for table in tables:
        table_name = table[0]
        # Ignore internal sqlite tables
        if table_name.startswith("sqlite_"):
            continue
            
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        schema[table_name] = [{"name": col['name'], "type": col['type']} for col in columns]
        
    conn.close()
    return schema
