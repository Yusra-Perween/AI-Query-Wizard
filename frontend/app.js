const API_URL = "http://localhost:8001/api";

// DOM Elements
const schemaContainer = document.getElementById('schema-container');
const chatArea = document.getElementById('chat-area');
const queryInput = document.getElementById('query-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const modal = document.getElementById('result-modal');
const closeBtn = document.querySelector('.close-btn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchSchema();
});

// Fetch and render schema
async function fetchSchema() {
    try {
        const response = await fetch(`${API_URL}/schema`);
        const data = await response.json();
        renderSchema(data.schema);
    } catch (error) {
        schemaContainer.innerHTML = '<div style="color:var(--error); padding:10px;">Failed to load schema. Is the backend running?</div>';
    }
}

function renderSchema(schema) {
    schemaContainer.innerHTML = '';
    
    for (const [tableName, columns] of Object.entries(schema)) {
        const card = document.createElement('div');
        card.className = 'table-card';
        
        let colsHtml = columns.map(col => `
            <div class="column-item">
                <span class="col-name">${col.name}</span>
                <span class="col-type">${col.type}</span>
            </div>
        `).join('');
        
        card.innerHTML = `
            <h4><i class="fa-solid fa-table"></i> ${tableName}</h4>
            <div class="columns-list">
                ${colsHtml}
            </div>
        `;
        
        schemaContainer.appendChild(card);
    }
}

// Chat Functionality
sendBtn.addEventListener('click', handleQuery);
queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleQuery();
});

async function handleQuery() {
    const query = queryInput.value.trim();
    if (!query) return;
    
    // Add user message to UI
    appendMessage(query, 'user-message');
    queryInput.value = '';
    
    // Add loading indicator
    const loadingId = appendMessage('<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing query and generating SQL...', 'bot-message');
    
    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        removeMessage(loadingId);
        
        if (!response.ok) {
            appendMessage(`Error: ${data.detail || 'Failed to process query'}`, 'bot-message');
            return;
        }
        
        // Show result in chat and offer to open modal
        showResultInChat(data);
        
    } catch (error) {
        removeMessage(loadingId);
        appendMessage('Connection error. Make sure the backend is running.', 'bot-message');
    }
}

function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = text;
    
    const id = 'msg-' + Date.now();
    msgDiv.id = id;
    
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function showResultInChat(data) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot-message';
    
    msgDiv.innerHTML = `
        <div><strong>Explanation:</strong> ${data.explanation}</div>
        <pre><code>${data.sql}</code></pre>
        <button class="action-btn" onclick='openModal(${JSON.stringify(data).replace(/'/g, "&apos;")})'>
            <i class="fa-solid fa-table"></i> View Data Results
        </button>
    `;
    
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Voice Recognition
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        voiceBtn.classList.add('recording');
        queryInput.placeholder = "Listening...";
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        queryInput.value = transcript;
        handleQuery();
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        voiceBtn.classList.remove('recording');
        queryInput.placeholder = "e.g. Find the highest paid employee...";
    };
    
    recognition.onend = () => {
        voiceBtn.classList.remove('recording');
        queryInput.placeholder = "e.g. Find the highest paid employee...";
    };
}

voiceBtn.addEventListener('click', () => {
    if (recognition) {
        recognition.start();
    } else {
        alert("Speech recognition is not supported in this browser.");
    }
});

// Modal Logic
closeBtn.addEventListener('click', () => modal.style.display = "none");
window.addEventListener('click', (e) => {
    if (e.target == modal) modal.style.display = "none";
});

window.openModal = function(data) {
    document.getElementById('explanation-text').innerText = data.explanation;
    document.getElementById('sql-text').innerText = data.sql;
    
    const execution = data.execution;
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    if (!execution.success) {
        tbody.innerHTML = `<tr><td style="color:var(--error)">Execution Error: ${execution.error}</td></tr>`;
    } else if (execution.data && execution.data.length > 0) {
        // Headers
        execution.columns.forEach(col => {
            const th = document.createElement('th');
            th.innerText = col;
            thead.appendChild(th);
        });
        
        // Rows
        execution.data.forEach(row => {
            const tr = document.createElement('tr');
            execution.columns.forEach(col => {
                const td = document.createElement('td');
                td.innerText = row[col] !== null ? row[col] : 'NULL';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    } else if (execution.message) {
        tbody.innerHTML = `<tr><td>${execution.message}</td></tr>`;
    } else {
        tbody.innerHTML = `<tr><td>No results found.</td></tr>`;
    }
    
    modal.style.display = "block";
}
