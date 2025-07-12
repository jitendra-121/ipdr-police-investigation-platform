# 🚔 IPDR Police Investigation Platform - Project Walkthrough

> **Complete technical documentation and walkthrough for the AI-powered police investigation platform**

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture & Technology Stack](#-architecture--technology-stack)
3. [Directory Structure Deep Dive](#-directory-structure-deep-dive)
4. [Backend Components](#-backend-components)
5. [Frontend Components](#-frontend-components)
6. [Database Architecture](#-database-architecture)
7. [AI & Agentic System](#-ai--agentic-system)
8. [Data Processing Pipeline](#-data-processing-pipeline)
9. [API Endpoints](#-api-endpoints)
10. [Configuration & Environment](#-configuration--environment)
11. [Development Workflow](#-development-workflow)
12. [Deployment Guide](#-deployment-guide)
13. [Project Execution Walkthrough](#-project-execution-walkthrough)

---

## 🌟 Project Overview

The **IPDR Police Investigation Platform** is a sophisticated, AI-powered investigation tool designed specifically for law enforcement agencies. It provides comprehensive analysis capabilities for telecommunications data, financial records, and various document formats through an intuitive web interface.

### 🎯 Core Capabilities

- **📞 Telecommunications Analysis**: CDR, IPDR, SMS data processing
- **💰 Financial Investigation**: Bank transaction analysis
- **📄 Document Processing**: PDF, Excel, Word document analysis
- **🤖 AI-Powered Insights**: Natural language query processing
- **🕸️ Relationship Mapping**: Graph-based network analysis
- **📊 Interactive Dashboards**: Real-time analytics and visualization

---

## 🏗️ Architecture & Technology Stack

### Frontend Stack
```
React 18 + Vite
├── 🎨 UI Library: Radix UI + TailwindCSS
├── 🛣️ Routing: React Router v6
├── 🌓 Theming: next-themes
├── 📊 Data Fetching: TanStack Query
├── 🎭 Animations: Framer Motion
└── 📱 Responsive Design: Mobile-first approach
```

### Backend Stack
```
Python + FastAPI
├── 🤖 AI Engine: OpenAI GPT-4
├── 🗄️ Databases: PostgreSQL + Neo4j
├── ☁️ Cloud Services: Supabase
├── 📄 Document Processing: PyPDF2, python-docx
├── 📊 Data Processing: Pandas, openpyxl
└── 🔧 API Framework: FastAPI + Uvicorn
```

### Data Architecture
```
Multi-Database Setup
├── 📊 Relational Data: PostgreSQL (via Supabase)
├── 🕸️ Graph Data: Neo4j (relationship mapping)
├── 🔍 Schema Detection: Automatic table recognition
└── 🔄 Data Sync: Real-time synchronization
```

---

## 📂 Directory Structure Deep Dive

### Root Directory Layout
```
police-investigation-platform/
├── 📁 src/                     # Frontend React application
├── 📁 public/                  # Static assets
├── 📁 __pycache__/             # Python bytecode cache
├── 🐍 *.py                     # Backend Python modules
├── ⚛️ *.jsx                    # React components (root level)
├── ⚙️ *.config.js              # Configuration files
├── 📄 *.json                   # Package & data files
├── 📝 *.md                     # Documentation
└── 📋 requirements.txt         # Python dependencies
```

### 🌐 Frontend Structure (`src/`)

#### Core Application Files
```
src/
├── main.jsx                    # Application entry point
├── App.jsx                     # Main router & theme provider
└── App.css                     # Global styles
```

#### Component Architecture
```
src/components/
├── Layout.jsx                  # Main application layout
├── Sidebar.jsx                 # Navigation sidebar
├── AgenticChatInterface.jsx    # AI chat interface
├── dropdown-menu.jsx           # Dropdown components
├── openso.jsx                  # Additional chat component
└── ui/                         # Reusable UI components
    ├── Analysis.jsx            # Analysis UI components
    ├── App.jsx                 # App-specific UI
    ├── avatar.jsx              # User avatar component
    ├── badge.jsx               # Status badges
    ├── button.jsx              # Button variations
    ├── card.jsx                # Card layouts
    ├── ChatPage.jsx            # Chat page UI
    ├── Dashboard.jsx           # Dashboard UI
    ├── input.jsx               # Form inputs
    ├── label.jsx               # Form labels
    ├── progress.jsx            # Progress indicators
    ├── Reports.jsx             # Reports UI
    ├── scroll-area.jsx         # Scrollable areas
    ├── select.jsx              # Select dropdowns
    ├── separator.jsx           # Visual separators
    ├── Settings.jsx            # Settings UI
    ├── Sidebar.jsx             # Sidebar UI
    ├── slider.jsx              # Range sliders
    ├── switch.jsx              # Toggle switches
    ├── tabs.jsx                # Tabbed interfaces
    └── textarea.jsx            # Text areas
```

#### Page Components
```
src/pages/
├── Analysis.jsx                # Data analysis interface
├── ChatPage.jsx                # Main chat interface
├── ChatPageBackup.jsx          # Backup chat implementation
├── Dashboard.jsx               # Analytics dashboard
├── Files.jsx                   # File management
├── Reports.jsx                 # Investigation reports
└── Settings.jsx                # Application settings
```

#### Service Layer
```
src/services/
├── agenticInvestigator.js      # Investigation automation
├── agenticService.js           # AI agent communication
├── fileUploadService.js        # File processing service
└── investigationAgents.js      # Agent orchestration
```

#### Utility Libraries
```
src/lib/
├── neo4j.js                    # Graph database client
└── utils.js                    # Common utilities

src/utils/
├── neo4j-backup.js            # Neo4j backup utilities
├── neo4j.js                   # Neo4j operations
└── openai.js                  # OpenAI API client
```

---

## 🐍 Backend Components

### Core API Modules

#### 1. **main_api.py** - Primary API Server
```python
# Main FastAPI application (Port 8000)
# Handles: File processing, data upload, schema detection
# Key Features:
# - Multi-format file processing
# - Database integration
# - Schema auto-detection
# - CORS configuration
```

#### 2. **agentic_api.py** - AI Agent System
```python
# Agentic investigation system (Port 8002)
# Handles: AI-powered investigations, pattern analysis
# Key Features:
# - OpenAI GPT-4 integration
# - Autonomous investigation agents
# - Neo4j graph queries
# - Natural language processing
```

#### 3. **api_server.py** - File Processing API
```python
# Specialized file processing server
# Handles: Document analysis, data extraction
# Supports: PDF, Excel, CSV, Word documents
```

### Data Processing Modules

#### 4. **schema_mapper.py** - Database Schema Management
```python
class SchemaMapper:
    # Automatic schema detection
    # Data type inference
    # Table structure mapping
    # Column validation
```

#### 5. **supabase_handler.py** - Database Operations
```python
class SupabaseHandler:
    # PostgreSQL connection management
    # CRUD operations
    # Data validation
    # Error handling
```

#### 6. **files.py** - File Processing Utilities
```python
# File type detection
# Data extraction
# Format conversion
# Validation logic
```

#### 7. **pdf_chat.py** - PDF Analysis Chatbot
```python
class PDFChatBot:
    # PDF text extraction
    # AI-powered Q&A
    # Document analysis
    # Interactive chat interface
```

### Configuration & Setup

#### 8. **config.py** - Configuration Management
```python
# Environment variables
# Database connections
# API keys management
# Table schema definitions
```

#### 9. **start_servers.py** & **start_agentic_servers.py**
```python
# Server orchestration
# Multi-process management
# Service coordination
# Health checks
```

---

## 🗄️ Database Architecture

### PostgreSQL Schema (via Supabase)

#### Supported Data Tables
```sql
-- CDR (Call Detail Records)
CREATE TABLE cdr_data (
    calling_number VARCHAR,
    called_number VARCHAR,
    call_date TIMESTAMP,
    call_duration INTEGER,
    tower_id VARCHAR,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION
);

-- IPDR (Internet Protocol Detail Records)
CREATE TABLE ipdr_data (
    username VARCHAR,
    ip_address TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    bytes_uploaded BIGINT,
    bytes_downloaded BIGINT,
    protocol VARCHAR
);

-- Bank Transaction Records
CREATE TABLE bank_details (
    account_no INTEGER,
    tran_date DATE,
    tran_amt NUMERIC,
    tran_type VARCHAR,
    balance NUMERIC,
    remarks TEXT
);

-- SMS Records
CREATE TABLE sms_data (
    sender_number VARCHAR,
    receiver_number VARCHAR,
    message_text TEXT,
    timestamp TIMESTAMP,
    tower_id VARCHAR
);
```

### Neo4j Graph Database

#### Relationship Mapping
```cypher
// Person nodes
CREATE (p:Person {phone: "1234567890", name: "John Doe"})

// Location nodes
CREATE (l:Location {tower_id: "TOWER001", lat: 12.34, lng: 56.78})

// Relationship patterns
CREATE (p1:Person)-[:CALLED]->(p2:Person)
CREATE (p:Person)-[:LOCATED_AT]->(l:Location)
CREATE (p:Person)-[:TRANSACTED]->(a:Account)
```

---

## 🤖 AI & Agentic System

### OpenAI Integration

#### Core AI Features
```javascript
// Natural language to Cypher query conversion
const queryResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {
            role: "system",
            content: "Convert natural language to Cypher queries for Neo4j"
        },
        {
            role: "user", 
            content: userQuery
        }
    ]
});
```

### Agentic Investigation System

#### Agent Types
1. **Data Analysis Agent**: Pattern recognition and anomaly detection
2. **Relationship Mapping Agent**: Network analysis and connection discovery
3. **Timeline Agent**: Chronological event reconstruction
4. **Financial Investigation Agent**: Transaction pattern analysis
5. **Communication Analysis Agent**: Call/SMS pattern analysis

#### Agent Workflow
```python
class InvestigationAgent:
    async def investigate(self, query: str) -> InvestigationResult:
        # 1. Query understanding
        intent = await self.parse_intent(query)
        
        # 2. Data retrieval
        data = await self.fetch_relevant_data(intent)
        
        # 3. AI analysis
        insights = await self.analyze_with_ai(data)
        
        # 4. Result compilation
        return self.compile_results(insights)
```

---

## 🔄 Data Processing Pipeline

### File Upload Workflow

```mermaid
graph TD
    A[File Upload] --> B[File Type Detection]
    B --> C[Data Extraction]
    C --> D[Schema Detection]
    D --> E[Data Validation]
    E --> F[Database Storage]
    F --> G[Graph Relationship Creation]
    G --> H[AI Analysis]
    H --> I[Results Dashboard]
```

### Processing Steps

#### 1. **File Detection & Extraction**
```python
# Supported formats
supported_formats = {
    '.pdf': PDFProcessor,
    '.xlsx': ExcelProcessor, 
    '.csv': CSVProcessor,
    '.docx': WordProcessor
}
```

#### 2. **Schema Auto-Detection**
```python
def detect_schema(data):
    # Analyze column patterns
    # Infer data types
    # Match against known schemas
    # Generate table structure
```

#### 3. **Data Validation & Cleaning**
```python
def validate_data(data, schema):
    # Type checking
    # Format validation
    # Null value handling
    # Duplicate detection
```

#### 4. **Multi-Database Storage**
```python
async def store_data(data, schema):
    # PostgreSQL for structured data
    await store_relational_data(data)
    
    # Neo4j for relationships
    await create_graph_relationships(data)
```

---

## 🔌 API Endpoints

### Main API Server (Port 8000)

#### File Processing Endpoints
```python
POST /upload-file          # Upload and process files
GET  /health              # Health check
POST /analyze-data        # Analyze uploaded data
GET  /table-schemas       # Get available schemas
```

### Agentic API Server (Port 8002)

#### Investigation Endpoints
```python
POST /api/investigate     # Start investigation
POST /api/chat           # Chat with AI agents
GET  /api/health         # Health check
POST /api/analyze        # Data analysis
GET  /api/agents         # Available agents
```

#### Example API Usage
```javascript
// Investigation request
const response = await fetch('/api/investigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: "Find all connections between phone number 1234567890",
        data_types: ["cdr", "sms"],
        time_range: "last_30_days"
    })
});
```

---

## ⚙️ Configuration & Environment

### Environment Variables
```bash
# .env file
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxx
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
```

### Database Configuration
```python
# config.py
POSTGRES_URL = "postgresql://postgres:password@host:5432/database"
SUPABASE_URL = "https://project.supabase.co"
NEO4J_CONFIG = {
    "uri": "bolt://localhost:7687",
    "auth": ("neo4j", "password")
}
```

### Frontend Configuration
```javascript
// vite.config.js
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:8000'
        }
    }
});
```

---

## 🚀 Development Workflow

### 1. **Environment Setup**
```bash
# Backend setup
pip install -r requirements.txt
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Frontend setup
npm install
```

### 2. **Database Setup**
```bash
# PostgreSQL (via Supabase)
# Create tables using provided schema

# Neo4j setup
# Install Neo4j Desktop or use cloud instance
# Configure connection in config.py
```

### 3. **Development Servers**
```bash
# Start all servers
python start_servers.py

# Or start individually:
# Main API (Port 8000)
uvicorn main_api:app --reload --port 8000

# Agentic API (Port 8002)
uvicorn agentic_api:app --reload --port 8002

# Frontend (Port 5173)
npm run dev
```

### 4. **Testing Workflow**
```bash
# Upload test data
# Access http://localhost:5173
# Navigate to Files page
# Upload sample CDR/IPDR files
# Test AI chat interface
# Verify database storage
```

---

## 📦 Deployment Guide

### Production Deployment

#### 1. **Frontend Build**
```bash
npm run build
# Deploy dist/ folder to web server
```

#### 2. **Backend Deployment**
```bash
# Docker deployment
FROM python:3.11
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["uvicorn", "main_api:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 3. **Database Setup**
```sql
-- Production PostgreSQL
-- Import schema from schema_mapper.py
-- Configure Supabase production instance
-- Setup Neo4j cloud instance
```

#### 4. **Environment Configuration**
```bash
# Production environment variables
VITE_OPENAI_API_KEY=production_key
SUPABASE_URL=production_url
POSTGRES_URL=production_postgresql_url
NEO4J_URI=production_neo4j_uri
```

---

## 🚀 Project Execution Walkthrough

### 📋 **Complete Startup Sequence**

This section provides a step-by-step walkthrough of how the project starts up and which files are executed in order.

---

## 🔄 **Application Startup Flow**

### **1. Initial Project Setup & Dependencies**

#### **Backend Dependencies Loading** (First)
```bash
# When you run: pip install -r requirements.txt
requirements.txt → Installs all Python packages
├── openai>=1.3.0
├── PyPDF2>=3.0.0
├── pandas>=1.5.0
├── fastapi>=0.104.0
├── uvicorn>=0.24.0
├── neo4j>=5.0.0
└── python-dotenv>=1.0.0
```

#### **Frontend Dependencies Loading**
```bash
# When you run: npm install
package.json → Installs all Node.js packages
├── react@18+
├── vite (build tool)
├── @radix-ui/* (UI components)
├── tailwindcss
└── 40+ other dependencies
```

---

## 🏗️ **Development Server Startup Sequence**

### **Option 1: Automated Startup (Recommended)**

#### **Step 1: Master Server Orchestrator**
```python
# File: start_servers.py (Main orchestrator)
python start_servers.py

# Execution order:
1. Loads config.py
2. Checks environment variables
3. Starts main_api.py on port 8000
4. Starts agentic_api.py on port 8002
5. Health checks all services
```

#### **Step 2: Agentic System Startup**
```python
# File: start_agentic_servers.py (AI system orchestrator)
python start_agentic_servers.py

# Execution order:
1. Initializes OpenAI client
2. Sets up Neo4j connections
3. Loads investigation agents
4. Starts background processes
```

### **Option 2: Manual Startup (Step-by-step)**

#### **Backend Startup Sequence**

##### **1. Configuration Loading** (Always First)
```python
# File: config.py
# Loaded by ALL backend services
1. load_dotenv() → Reads .env file
2. OPENAI_API_KEY = os.getenv('VITE_OPENAI_API_KEY')
3. SUPABASE_URL = "https://whqrjyospvdjsjpujkfd.supabase.co"
4. POSTGRES_URL = "postgresql://..."
5. TABLE_SCHEMAS = {...} → Database schema definitions
```

##### **2. Main API Server** (Port 8000)
```bash
# Command: uvicorn main_api:app --reload --port 8000
# File: main_api.py

Startup sequence:
1. Import FastAPI and dependencies
2. Load config.py (environment variables)
3. Initialize CORS middleware
4. Import schema_mapper.py
5. Import supabase_handler.py
6. Import files.py
7. Setup file upload endpoints
8. Start server on localhost:8000
```

**File Dependencies for main_api.py:**
```python
main_api.py
├── config.py (configuration)
├── schema_mapper.py (database schemas)
├── supabase_handler.py (database operations)
├── files.py (file processing)
└── analyze_data.py (data analysis)
```

##### **3. Agentic API Server** (Port 8002)
```bash
# Command: uvicorn agentic_api:app --reload --port 8002
# File: agentic_api.py

Startup sequence:
1. Import FastAPI and OpenAI
2. Load environment variables
3. Initialize OpenAI client
4. Setup Neo4j connection (if available)
5. Load investigation agents
6. Setup CORS middleware
7. Initialize conversation handlers
8. Start server on localhost:8002
```

**File Dependencies for agentic_api.py:**
```python
agentic_api.py
├── openai (API client)
├── neo4j (graph database)
├── config.py (configuration)
└── Investigation agents (internal classes)
```

#### **Frontend Startup Sequence**

##### **1. Development Server Start**
```bash
# Command: npm run dev
# Uses: vite.config.js configuration

Startup sequence:
1. Vite reads vite.config.js
2. Loads React plugin
3. Sets proxy for API calls
4. Starts dev server on localhost:5173
```

##### **2. React Application Bootstrap**
```javascript
// File: src/main.jsx (Entry Point)
1. Import React and ReactDOM
2. Import App.jsx
3. Import './App.css'
4. Render App component to DOM
```

##### **3. Main App Component Loading**
```javascript
// File: src/App.jsx (Main Router)
1. Import BrowserRouter from react-router-dom
2. Import ThemeProvider from next-themes
3. Import all page components:
   ├── ChatPage.jsx
   ├── Dashboard.jsx
   ├── Files.jsx
   ├── Analysis.jsx
   ├── Reports.jsx
   └── Settings.jsx
4. Import Layout.jsx
5. Setup routing configuration
6. Wrap in ThemeProvider
```

##### **4. Layout Component Loading**
```javascript
// File: src/components/Layout.jsx
1. Import Sidebar.jsx
2. Setup main layout structure
3. Handle responsive design
4. Initialize theme switching
```

##### **5. Service Layer Initialization**
```javascript
// Files in src/services/ (Loaded on demand)
├── agenticService.js → API communication with port 8002
├── fileUploadService.js → File processing API calls
├── agenticInvestigator.js → Investigation automation
└── investigationAgents.js → Agent orchestration
```

---

## 🔄 **Runtime Execution Flow**

### **User Interaction Flow**

#### **1. File Upload Process**
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant MainAPI
    participant SchemaMapper
    participant Database
    
    User->>Frontend: Upload file (Files.jsx)
    Frontend->>MainAPI: POST /upload-file (port 8000)
    MainAPI->>files.py: detect_file_type()
    files.py->>MainAPI: file_type result
    MainAPI->>SchemaMapper: analyze_data_structure()
    SchemaMapper->>MainAPI: schema detected
    MainAPI->>Database: store data
    Database->>MainAPI: success response
    MainAPI->>Frontend: upload complete
    Frontend->>User: show success message
```

#### **2. AI Chat Process**
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AgenticAPI
    participant OpenAI
    participant Neo4j
    
    User->>Frontend: Ask question (ChatPage.jsx)
    Frontend->>AgenticAPI: POST /api/investigate (port 8002)
    AgenticAPI->>OpenAI: process natural language
    OpenAI->>AgenticAPI: structured query
    AgenticAPI->>Neo4j: execute graph query
    Neo4j->>AgenticAPI: relationship data
    AgenticAPI->>OpenAI: analyze results
    OpenAI->>AgenticAPI: insights
    AgenticAPI->>Frontend: investigation results
    Frontend->>User: display insights
```

#### **3. Data Analysis Flow**
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant MainAPI
    participant AnalyzeData
    participant Database
    
    User->>Frontend: Request analysis (Analysis.jsx)
    Frontend->>MainAPI: POST /analyze-data
    MainAPI->>AnalyzeData: process_analysis()
    AnalyzeData->>Database: query data
    Database->>AnalyzeData: raw data
    AnalyzeData->>AnalyzeData: apply algorithms
    AnalyzeData->>MainAPI: analysis results
    MainAPI->>Frontend: formatted results
    Frontend->>User: visualization
```

---

## 📁 **File Execution Priority & Dependencies**

### **Critical Path Files (Must Run First)**

#### **Tier 1: Foundation** (Highest Priority)
```
1. config.py → ALL backend services depend on this
2. .env file → Environment variables for config.py
3. requirements.txt → Python dependencies
4. package.json → Node.js dependencies
```

#### **Tier 2: Core Backend Services**
```
5. schema_mapper.py → Database schema definitions
6. supabase_handler.py → Database connection handler
7. files.py → File processing utilities
8. main_api.py → Primary API server (Port 8000)
```

#### **Tier 3: AI & Advanced Features**
```
9. agentic_api.py → AI investigation system (Port 8002)
10. pdf_chat.py → PDF analysis chatbot
11. analyze_data.py → Data analysis engine
```

#### **Tier 4: Frontend Application**
```
12. vite.config.js → Build configuration
13. src/main.jsx → React entry point
14. src/App.jsx → Main application router
15. src/components/Layout.jsx → Application layout
```

#### **Tier 5: Feature Components** (Loaded on demand)
```
16. Page components (ChatPage, Dashboard, etc.)
17. Service layer (agenticService.js, etc.)
18. UI components (buttons, cards, etc.)
```

---

## 🚦 **Startup Verification Checklist**

### **Backend Health Checks**

#### **1. Configuration Verification**
```bash
# Check if config.py loads properly
python -c "import config; print('✅ Config loaded')"

# Verify environment variables
python -c "import config; print(f'OpenAI Key: {config.OPENAI_API_KEY[:10]}...')"
```

#### **2. Database Connections**
```bash
# Test PostgreSQL connection
python -c "from supabase_handler import SupabaseHandler; h = SupabaseHandler(); print('✅ DB connected')"

# Test Neo4j connection (if available)
python -c "from neo4j import GraphDatabase; print('✅ Neo4j available')"
```

#### **3. API Server Status**
```bash
# Main API health check
curl http://localhost:8000/health

# Agentic API health check  
curl http://localhost:8002/api/health
```

### **Frontend Health Checks**

#### **1. Development Server**
```bash
# Check if Vite server is running
curl http://localhost:5173

# Verify API proxy
curl http://localhost:5173/api/health
```

#### **2. Component Loading**
```javascript
// Check in browser console
console.log('✅ React app loaded');
console.log('✅ Router active');
console.log('✅ Theme provider ready');
```

---

## 🔧 **Debugging Startup Issues**

### **Common Startup Problems & Solutions**

#### **1. Backend Won't Start**
```bash
# Check Python environment
python --version  # Should be 3.8+

# Check dependencies
pip list | grep fastapi
pip list | grep openai

# Check port conflicts
lsof -i :8000  # Main API port
lsof -i :8002  # Agentic API port
```

#### **2. Frontend Won't Start**
```bash
# Check Node.js version
node --version  # Should be 16+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port conflict
lsof -i :5173  # Vite dev server port
```

#### **3. Database Connection Issues**
```python
# Test individual connections
python -c "
import config
print('Supabase URL:', config.SUPABASE_URL)
print('Postgres URL:', config.POSTGRES_URL[:30] + '...')
"
```

#### **4. Environment Variable Issues**
```bash
# Create .env file if missing
echo 'VITE_OPENAI_API_KEY=your_key_here' > .env
echo 'SUPABASE_ANON_KEY=your_key_here' >> .env

# Check .env loading
python -c "from dotenv import load_dotenv; load_dotenv(); print('✅ .env loaded')"
```

---

## 📊 **Performance Monitoring During Startup**

### **Backend Performance**
```python
# Monitor startup time
import time
start_time = time.time()
# ... app initialization ...
print(f"Startup time: {time.time() - start_time:.2f}s")
```

### **Frontend Performance**
```javascript
// Monitor initial render time
console.time('App Render');
// ... app initialization ...
console.timeEnd('App Render');
```

### **Database Performance**
```python
# Monitor connection time
import time
start = time.time()
# ... database connection ...
print(f"DB connection time: {time.time() - start:.2f}s")
```

---

This walkthrough provides a complete understanding of how your police investigation platform starts up and executes, making it easier to debug issues and understand the system flow.

---
