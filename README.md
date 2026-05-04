# 🪄 AI Query Wizard

An intelligent, full-stack database assistant that allows users to interact with their database using natural language (in over 40 languages) and voice commands. 

Built with a clean-room, custom architecture, this application seamlessly translates human language into accurate SQL queries, executes them securely against a local database, and translates the logic back into plain English for non-technical users.

## 🚀 Features

* **Natural Language to SQL**: Uses Google Gemini AI to instantly generate perfectly formatted SQLite queries from plain English prompts.
* **Voice Input (ASR)**: Uses the native browser Web Speech API so users can simply talk to their database instead of typing.
* **Dynamic Schema Awareness**: Automatically fetches and displays the live database schema (tables & columns) so the AI never hallucinates invalid fields.
* **SQL Explainer**: Translates the generated SQL code back into human-readable English so users understand exactly what data is being pulled.
* **Premium Dark Mode UI**: A fully custom, sleek user interface built entirely with Vanilla CSS.

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6)
* **Backend**: Python, FastAPI, Uvicorn
* **Database**: SQLite (Zero-configuration, lightweight)
* **Artificial Intelligence**: Google Gemini LLM (`gemini-2.5-flash`), Web Speech API

## ⚙️ How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/AI-Query-Wizard.git
   cd AI-Query-Wizard
   ```

2. **Add your API Key:**
   - Create a file named `.env` inside the `backend/` folder.
   - Add your Google Gemini API key:
     ```env
     GEMINI_API_KEY=your_actual_key_here
     ```

3. **Start the Application:**
   - On Windows, simply double-click the `start.bat` file!
   
   *(Alternatively, run the backend manually)*:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
   *Then open `frontend/index.html` in your web browser.*

## 📐 Architecture Note
This project was built from scratch without relying on heavy frontend frameworks (like React or Streamlit) to demonstrate a strong understanding of full-stack fundamentals, REST API design, and asynchronous client-server communication.
