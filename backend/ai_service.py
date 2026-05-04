import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_sql(natural_query: str, schema_json: str) -> str:
    if not api_key:
        return "ERROR: GEMINI_API_KEY not configured in .env file. Please add your API key."
        
    prompt = f"""
    You are an expert SQL assistant. Your job is to translate natural language into a valid SQLite query.
    
    Here is the database schema in JSON format:
    {schema_json}
    
    User request: "{natural_query}"
    
    IMPORTANT RULES:
    1. Output ONLY the raw SQL query. Do not include markdown formatting (like ```sql).
    2. Ensure the query is valid for SQLite.
    3. If the request cannot be answered using the given schema, output a query that will simply return an error string or an empty SELECT statement like: SELECT 'Cannot answer this based on schema' as Error;
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        sql = response.text.replace('```sql', '').replace('```', '').strip()
        return sql
    except Exception as e:
        return f"ERROR: Failed to generate SQL. {str(e)}"

def explain_sql(sql_query: str) -> str:
    if not api_key:
        return "Please configure GEMINI_API_KEY to get explanations."
        
    prompt = f"""
    Explain the following SQL query in simple, non-technical English. 
    Keep the explanation under 3 sentences.
    
    SQL Query:
    {sql_query}
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating explanation: {str(e)}"
