from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import uvicorn

from database import init_db, execute_query, get_schema
from ai_service import generate_sql, explain_sql

app = FastAPI(title="Custom Query Wizard Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def on_startup():
    init_db()

class QueryRequest(BaseModel):
    query: str

@app.get("/api/schema")
def fetch_schema():
    return {"schema": get_schema()}

@app.post("/api/ask")
def ask_question(req: QueryRequest):
    natural_query = req.query
    schema = get_schema()
    
    # 1. Generate SQL
    sql_query = generate_sql(natural_query, json.dumps(schema))
    
    if sql_query.startswith("ERROR"):
        raise HTTPException(status_code=400, detail=sql_query)
        
    # 2. Get Explanation
    explanation = explain_sql(sql_query)
    
    # 3. Execute Query
    execution_result = execute_query(sql_query)
    
    return {
        "sql": sql_query,
        "explanation": explanation,
        "execution": execution_result
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
