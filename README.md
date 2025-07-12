# 🚔 IPDR Police Investigation Platform

> **A comprehensive AI-powered investigation platform for law enforcement agencies to analyze Call Detail Records (CDR), Internet Protocol Detail Records (IPDR), and other telecommunications data with advanced graph database integration and intelligent agentic query processing.**



## 🌟 Overview

The IPDR Police Investigation Platform is a cutting-edge solution designed specifically for law enforcement agencies to conduct sophisticated telecommunications data analysis. It combines the power of AI, graph databases, and modern web technologies to provide investigators with unprecedented insights into communication patterns, network relationships, and suspicious activities. The platform now features an advanced **Agentic Investigation System** that acts as an intelligent investigative assistant.

### 🎯 Key Features

- 🤖 **Agentic Investigation System**: Advanced AI agents that act as intelligent investigative assistants
  - **Detective Sarah Chen**: Natural language converser for query refinement
  - **Analyst Mike Rodriguez**: SQL database expert for structured data analysis
  - **Graph Expert Lisa Wang**: Neo4j specialist for relationship mapping
  - **Context Fusion Agent**: Intelligent data consolidation and insight generation
- 🧠 **AI-Powered Analysis**: GPT-4 integration for intelligent query processing and pattern recognition
- 🕸️ **Graph Database Integration**: Neo4j for complex relationship mapping and network analysis
- 📊 **Multi-Format Data Support**: Process CDR, IPDR, SMS, tower dumps, bank records, and more
- 🔍 **Natural Language Interface**: Convert plain English queries to database operations
- 📈 **Real-time Analytics**: Interactive dashboards and visualization tools
- 🔐 **Secure Architecture**: Environment-based configuration and secure API handling
- 📱 **Modern React UI**: Responsive interface with intuitive navigation (React 19 + Vite)
- 🗄️ **Dual Database System**: PostgreSQL (Supabase) for structured data + Neo4j for relationships
- 📋 **Comprehensive File Processing**: Advanced schema mapping and data extraction
- 🎨 **Modern Design**: Tailwind CSS with dark/light theme support

## 🏗️ Architecture

```
🌐 Frontend (React 19 + Vite)
    ├── 📱 Chat Interface (Natural Language Queries)
    ├── 🧠 Agentic Investigation System
    ├── 📊 Dashboard (Analytics & Visualizations)
    ├── 📁 File Management (Upload & Processing)
    ├── 📋 Reports (Investigation Summaries)
    └── ⚙️ Settings (Configuration)
            ↓
🔗 Dual API Layer (FastAPI)
    ├── 🤖 Agentic API (Port 8001)
    │   ├── Detective Sarah Chen (Query Refinement)
    │   ├── Analyst Mike Rodriguez (SQL Translation)
    │   ├── Graph Expert Lisa Wang (Cypher Translation)
    │   ├── Context Fusion Agent (Data Consolidation)
    │   └── Full Investigation Pipeline (/api/investigate)
    │
    └── 📊 Main API (Port 8000)
        ├── 📄 PDF Chat (Document Analysis)
        ├── 📊 File Processing (Data Extraction)
        ├── 🗄️ Database Operations
        └── 📋 Health Check & Monitoring
            ↓
💾 Dual Database Layer
    ├── 🗄️ PostgreSQL (Supabase - Structured Data)
    │   ├── CDR/IPDR Tables
    │   ├── Tower Dumps
    │   ├── Bank Records
    │   └── SMS Data
    │
    ├── 🕸️ Neo4j (Graph Database - Relationships)
    │   ├── Person Nodes
    │   ├── Phone Nodes
    │   ├── Location Nodes
    │   └── Communication Relationships
    │
    └── 🤖 OpenAI (GPT-4 - AI Processing)
```

### 🧠 Agentic Investigation Pipeline

The platform features a sophisticated 3-phase agentic investigation system:

**Phase 1: Query Refinement**
- Detective Sarah Chen analyzes user queries
- Refines ambiguous requests into precise investigation tasks
- Asks clarifying questions when needed

**Phase 2: Parallel Data Translation**
- Analyst Mike Rodriguez: Converts queries to SQL for structured data
- Graph Expert Lisa Wang: Converts queries to Cypher for relationship analysis
- Simultaneous execution for optimal performance

**Phase 3: Intelligent Data Fusion**
- Context Fusion Agent consolidates results from both databases
- Generates comprehensive investigation insights
- Provides actionable recommendations

## 🆕 Recent Updates

### 🎯 Major Enhancements
- **🤖 Complete Agentic Investigation Pipeline**: Full end-to-end AI-powered investigation system
- **⚡ Real Database Execution**: Direct integration with PostgreSQL and Neo4j for live data analysis
- **🧠 Enhanced Conversation Memory**: Intelligent conversation tracking and context preservation
- **📊 Advanced Query Translation**: Sophisticated SQL and Cypher query generation with error handling
- **🔄 Parallel Processing**: Simultaneous database operations for optimal performance

### 🏗️ Infrastructure Improvements
- **🚀 Dual API Architecture**: Specialized APIs for different functionalities (Ports 8000/8001)
- **📱 React 19 + Vite Upgrade**: Modern frontend with enhanced performance and features
- **🔧 Enhanced Startup Scripts**: Automated server management with dependency checking
- **📈 Improved Monitoring**: Comprehensive health checks and performance tracking

### 🔍 Investigation Capabilities
- **🎯 Full Investigation Pipeline**: `/api/investigate` endpoint for complete case analysis
- **💬 Natural Language Processing**: Advanced query understanding and refinement
- **🕸️ Network Analysis**: Deep relationship mapping and pattern recognition
- **📊 Real-time Insights**: Live investigation results and recommendations

*For complete details, see [CHANGELOG.md](./CHANGELOG.md)*

## 🔮 Upcoming Enhancements 

### 🚧 **In Development**

#### **1. Server Architecture Restructuring**
- **📁 Centralized Server Organization**: Moving graph database logic to dedicated `/server` folder
- **🏠 Enhanced Local Development**: Simplified local Neo4j setup with Docker integration
- **🔧 Better Code Organization**: Improved maintainability and debugging capabilities

#### **2. GitHub Copilot API Integration**
- **🤖 AI Provider Upgrade**: Custom wrapper class replacing OpenAI dependency
- **💡 Enhanced Investigation Capabilities**: Leveraging Copilot's code-aware AI for better analysis
- **⚡ Improved Performance**: More accurate query generation and pattern recognition

#### **3. Advanced Memory & Visualization**
- **🧠 Persistent Chat Memory**: Cross-session investigation continuity with intelligent context management
- **📊 Rich Interactive Visualizations**: 3D network graphs, timeline analysis, and geospatial mapping
- **🎨 Enhanced User Experience**: Interactive evidence correlation and communication flow diagrams


*See [FUTURE_ENHANCEMENTS.md](./FUTURE_ENHANCEMENTS.md) for complete roadmap*

## 🚀 Quick Start

### 📋 Prerequisites

- 🐍 Python 3.8 or higher
- 📦 Node.js 18 or higher
- 🔑 OpenAI API key
- 🗄️ Supabase account (optional but recommended)
- 🕸️ Neo4j database (optional but recommended)

### ⚡ Installation

1. **📥 Clone the Repository**
```bash
git clone <repository-url>
cd ContentMissingorUnspecified-1
```

2. **🔧 Environment Setup**
```bash
# Create environment file
touch .env

# Add your API keys to .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env
echo "VITE_OPENAI_API_KEY=your_openai_api_key_here" >> .env
echo "NEO4J_URI=your_neo4j_uri" >> .env
echo "NEO4J_USER=neo4j" >> .env
echo "NEO4J_PASSWORD=your_neo4j_password" >> .env
echo "SUPABASE_URL=your_supabase_url" >> .env
echo "SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
```

3. **🐍 Python Dependencies**
```bash
pip install -r requirements.txt
```

4. **📦 Node.js Dependencies**
```bash
npm install
```

5. **🚀 Start the Application**

**Option A: Complete Agentic System (Recommended)**
```bash
# Start all servers with agentic investigation system
python start_agentic_servers.py
```

**Option B: Basic System**
```bash
# Start basic servers
python start_servers.py
```

**Option C: Manual Start**
```bash
# Terminal 1: Start Agentic API
python -m uvicorn agentic_api:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Start Main API
python api_server.py

# Terminal 3: Start Frontend
npm run dev
```

### 🌍 Access Points

After starting the servers, access the application at:

- **🌐 Frontend Application**: `http://localhost:3000` or `http://localhost:5173`
- **🤖 Agentic API**: `http://localhost:8001`
- **📊 Main API**: `http://localhost:8000`
- **📖 API Documentation**: `http://localhost:8001/docs` and `http://localhost:8000/docs`
- **🔍 Health Checks**: 
  - Agentic API: `http://localhost:8001/api/health`
  - Main API: `http://localhost:8000/health`

## 🔧 Configuration

### 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# 🤖 OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# 🕸️ Neo4j Configuration
NEO4J_URI=neo4j+s://your-neo4j-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
NEXT_NEO4J_USERNAME=neo4j
NEXT_NEO4J_PASSWORD=your_neo4j_password

# 🗃️ Supabase Configuration (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# 📊 Database Configuration
POSTGRES_URL=postgresql://username:password@host:port/database
```

### 🔑 API Keys Setup

#### OpenAI API Key
1. 🌐 Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. 🔐 Create a new API key
3. 💰 Ensure your account has sufficient credits
4. 📝 Add the key to your `.env` file

#### Neo4j Database
1. 🌐 Visit [Neo4j AuraDB](https://neo4j.com/cloud/aura/)
2. 🆕 Create a new database instance
3. 📝 Note the connection URI and credentials
4. 🔧 Update your `.env` file

#### Supabase Database
1. 🌐 Visit [Supabase](https://supabase.com)
2. 🆕 Create a new project
3. 🔑 Get your project URL and anon key
4. 📝 Update your `.env` file

## 💼 Usage

### 🎯 Agentic Investigation Interface

1. **🚀 Start the Application**
```bash
python start_agentic_servers.py
```

2. **🌐 Open Your Browser**
   - Navigate to `http://localhost:3000` or `http://localhost:5173`
   - Access the investigation dashboard

3. **💬 Natural Language Queries**
   - **Basic Examples:**
     - "Show me all calls between these numbers"
     - "Analyze network connections for this IMEI"
     - "Find suspicious activity patterns"
   
   - **Advanced Investigation Queries:**
     - "Investigate phone number 9876543210 for suspicious activity"
     - "Track internet usage for user ID 12345 last week"
     - "Find movement patterns between Mumbai and Delhi"
     - "Analyze communication patterns for IMEI 123456789012345"

4. **🤖 Agentic Assistant Interaction**
   - The system will automatically route your queries to appropriate agents
   - Detective Sarah Chen will ask clarifying questions if needed
   - You'll receive comprehensive analysis from multiple data sources

### 📊 File Processing

The platform supports comprehensive file processing with intelligent schema mapping:

**Supported Formats:**
- 📄 **PDF**: Document analysis and text extraction
- 📊 **Excel/CSV**: CDR, IPDR, tower dumps, bank records
- 📝 **Word Documents**: Case files and reports

**Processing Features:**
- 🔍 **Intelligent Schema Detection**: Automatically identifies data types
- 🗄️ **Database Integration**: Direct insertion into PostgreSQL tables
- 📋 **Data Validation**: Ensures data integrity and consistency
- 📈 **Progress Tracking**: Real-time upload and processing status

#### 📁 Supported Data Types

- 📞 **CDR Files**: Call Detail Records (.csv, .xlsx)
- 🌐 **IPDR Files**: Internet Protocol Detail Records (.json, .csv)
- 💬 **SMS Data**: SMS header and content files
- 🏦 **Bank Records**: Transaction data (.csv, .xlsx)
- 🗼 **Tower Dumps**: Cell tower data (.csv)
- 📄 **PDF Documents**: Interactive chat with GPT-4
- 📝 **Word Documents**: Table extraction and analysis

#### 🔄 Processing Workflow

```
📁 File Upload
```
    ↓
    🔍 Schema Detection & Mapping
            ↓
    🗄️ Database Integration
            ↓
    📊 Real-time Processing Status
            ↓
    ✅ Analysis Ready
```

### 🔧 API Endpoints

#### Agentic Investigation API (Port 8001)
- `POST /api/investigate` - Complete investigation pipeline
- `POST /api/converser` - Query refinement with Detective Sarah Chen
- `POST /api/sql-translate` - SQL translation by Analyst Mike Rodriguez
- `POST /api/cypher-translate` - Cypher translation by Graph Expert Lisa Wang
- `POST /api/consolidate` - Data consolidation by Context Fusion Agent
- `POST /api/execute-sql` - Real SQL execution against Supabase
- `POST /api/execute-cypher` - Real Cypher execution against Neo4j
- `GET /api/health` - Health check

#### Main API (Port 8000)
- `POST /upload-files/` - Multiple file upload
- `POST /upload-single-file/` - Single file upload
- `GET /supported-formats/` - Get supported file formats
- `GET /health` - Health check
- `POST /upload-single-file/` - Single file upload
- `GET /supported-formats/` - Get supported file formats
- `GET /health` - Health check

### 🗄️ Supported Database Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| 📞 `crd` | Call Detail Records | a_party, b_party, date, duration |
| 🌐 `ipdr` | Internet Protocol Records | user_id, ip_address, timestamp |
| 💬 `sms_header` | SMS Header Information | sender, receiver, timestamp |
| 🏦 `bank_details` | Bank Transaction Data | ac_no, tran_date, amount |
| 🗼 `tower_dumps` | Cell Tower Data | cell_id, location, timestamp |
| 📱 `true_caller` | True Caller Database | phone_number, name, location |

### 🕸️ Graph Database Schema

Neo4j stores relationships between:
- 📱 Phone numbers and their connections
- 🌐 IP addresses and user activities
- 🗼 Cell towers and device locations
- 🏦 Financial transactions and accounts

## 🔍 Advanced Features

### 🧠 AI-Powered Query Processing

```python
# Natural language input
"Find all calls longer than 30 minutes between Mumbai and Delhi"

# Automatically converts to Cypher
MATCH (a:Phone)-[c:CALLED]->(b:Phone)
WHERE c.duration > 1800 
AND a.location = 'Mumbai' 
AND b.location = 'Delhi'
RETURN a, c, b
```

### 📈 Real-time Analytics

- 📊 **Communication Frequency**: Call/SMS patterns over time
- 🌍 **Geographic Analysis**: Location-based activity mapping
- 🕰️ **Temporal Patterns**: Time-based behavior analysis
- 🔗 **Network Analysis**: Relationship strength and centrality

### 🔐 Security Features

- 🔒 **Environment-based Configuration**: No hardcoded credentials
- 🛡️ **API Key Rotation**: Support for key management
- 🔐 **Secure Database Connections**: Encrypted connections to all databases
- 📝 **Audit Logging**: Complete investigation trail

## 🛠️ Development

### 📁 Project Structure

```
📦 IPDR Police Investigation Platform
├── 🐍 Backend (Python)
│   ├── 🚀 api_server.py          # Main API server (Port 8000)
│   ├── 🤖 agentic_api.py         # AI investigation agents (Port 8001)
│   ├── 📄 pdf_chat.py            # PDF document analysis
│   ├── 📊 files.py               # File processing & schema mapping
│   ├── 🗄️ supabase_handler.py    # Database operations
│   ├── 🔧 config.py              # Configuration & table schemas
│   ├── 🗂️ schema_mapper.py       # Intelligent schema detection
│   ├── 📝 analyze_data.py        # Data analysis utilities
│   ├── 🔍 debug_schema.py        # Schema debugging tools
│   └── 📋 requirements.txt       # Python dependencies
├── 🌐 Frontend (React 19 + Vite)
│   ├── 📱 src/pages/             # Application pages
│   │   ├── 💬 ChatPage.jsx       # Agentic chat interface
│   │   ├── 📊 Dashboard.jsx      # Analytics dashboard
│   │   ├── 📁 Files.jsx          # File management
│   │   ├── 📈 Analysis.jsx       # Data analysis
│   │   └── 📋 Reports.jsx        # Investigation reports
│   ├── 🧩 src/components/        # Reusable components
│   │   ├── 🤖 AgenticChatInterface.jsx
│   │   ├── 🎨 ui/                # UI components
│   │   └── 📐 Layout.jsx         # Main layout
│   ├── 🔧 src/services/          # API services
│   │   ├── 🤖 agenticService.js  # Agentic API integration
│   │   ├── 📊 fileUploadService.js
│   │   └── 🔍 investigationAgents.js
│   ├── 🛠️ src/utils/             # Utility functions
│   │   ├── 🕸️ neo4j.js           # Neo4j integration
│   │   └── 🤖 openai.js          # OpenAI integration
│   └── 📦 package.json           # Node.js dependencies
├── 🔧 Configuration
│   ├── 🌍 .env                   # Environment variables
│   ├── ⚙️ vite.config.js         # Vite configuration
│   └── 🎨 tailwind.config.js     # Tailwind CSS config
├── 🚀 Startup Scripts
│   ├── 🤖 start_agentic_servers.py  # Start agentic system
│   ├── 🔧 start_servers.py          # Start basic system
│   └── � start_servers_simple.py   # Simplified startup
└── �📚 Documentation
    ├── 📖 README.md              # This file
    ├── � CHANGELOG.md           # Change log
    └── 📋 FUTURE_ENHANCEMENTS.md # Planned features
```

### 🔧 Adding New Features

#### 📊 Adding New Data Types

1. **Update Schema Configuration**
```python
# In config.py
TABLE_SCHEMAS["new_table"] = {
    "required_columns": ["col1", "col2"],
    "column_types": {"col1": "text", "col2": "integer"},
    "keywords": ["keyword1", "keyword2"]
}
```

2. **Add Processing Logic**
```python
# In files.py
def process_new_data_type(file_path):
    # Custom processing logic
```

#### 🤖 Adding New Agentic Agents

1. **Create Agent Function**
```python
# In agentic_api.py
@app.post("/api/new-agent")
async def new_agent(request: UserQuery):
    # Agent implementation
    return response
```

2. **Update Frontend Service**
```javascript
// In agenticService.js
async callNewAgent(query) {
    // Frontend integration
}
```
    pass
```

#### 🤖 Creating New Investigation Agents

```python
# In src/services/investigationAgents.js
export const newAnalysisAgent = async (data) => {
    const prompt = "Analyze this data for...";
    return await callOpenAI(prompt, data);
};
```

## 🚨 Troubleshooting

### ❌ Common Issues

#### 🔑 API Key Issues
```bash
❌ OpenAI API Error: Invalid API key
✅ Solution: Check your .env file and ensure VITE_OPENAI_API_KEY is set
```

#### 🗄️ Database Connection Issues
```bash
❌ Neo4j Connection Failed
✅ Solution: Verify NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD in .env
```

#### 📦 Module Import Errors
```bash
❌ ModuleNotFoundError: No module named 'openai'
✅ Solution: Run 'pip install -r requirements.txt'
```

### 🔧 Debug Mode

```bash
# Enable debug logging
export DEBUG=true
python api_server.py
```

## 📈 Performance Optimization

### 🚀 Recommended Settings

- **🧠 Memory**: Minimum 8GB RAM for large datasets
- **💾 Storage**: SSD recommended for database operations
- **🌐 Network**: Stable internet for AI API calls
- **🔧 Batch Size**: Adjust batch processing size based on available memory

### 📊 Monitoring

- 📈 **API Response Times**: Monitor OpenAI API latency
- 🗄️ **Database Performance**: Track Neo4j and Supabase query times
- 💾 **Memory Usage**: Monitor Python process memory consumption
- 🌐 **Network Usage**: Track API call frequency and data transfer

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🤖 **OpenAI** for GPT-4 API
- 🕸️ **Neo4j** for graph database technology
- 🗃️ **Supabase** for PostgreSQL hosting
- ⚛️ **React Team** for the frontend framework
- 🚀 **FastAPI** for the backend framework

## 📞 Support


---

**⚠️ Important Notice**: This platform is designed for legitimate law enforcement use only. Ensure compliance with local laws and regulations regarding data privacy and surveillance.

**🔐 Security**: Always use environment variables for sensitive configuration. Never commit API keys or credentials to version control.

**📊 Data Privacy**: Implement proper data handling procedures and ensure compliance with relevant privacy regulations in your jurisdiction.

---

*Made with ❤️ for law enforcement professionals worldwide* 🌍
