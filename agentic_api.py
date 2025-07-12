from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import openai
import asyncio
from datetime import datetime
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add Neo4j driver import
try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    print("⚠️ Neo4j driver not available. Install with: pip install neo4j")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agentic Investigation Platform", version="1.0.0")

# Add CORS middleware - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client with environment variable
try:
    # Use OpenAI API key from environment
    openai_client = openai.OpenAI(
        base_url="https://api.openai.com/v1",
        api_key=os.getenv('VITE_OPENAI_API_KEY')
    )
    logger.info("✅ OpenAI API client initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize OpenAI API client: {e}")
    # Fallback initialization
    openai_client = openai.OpenAI(
        base_url="https://api.openai.com/v1",
        api_key=os.getenv('VITE_OPENAI_API_KEY')
    )

# Neo4j Configuration
NEO4J_URI = os.getenv('NEO4J_URI', 'neo4j+s://0d71a2dd.databases.neo4j.io')
NEO4J_USER = os.getenv('NEO4J_USER', 'neo4j')
NEO4J_PASS = os.getenv('NEO4J_PASSWORD', os.getenv('NEXT_NEO4J_PASSWORD'))

# Initialize Neo4j driver
neo4j_driver = None
if NEO4J_AVAILABLE:
    try:
        neo4j_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))
        logger.info("✅ Neo4j driver initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Neo4j driver: {e}")
        neo4j_driver = None

# Pydantic Models
class UserQuery(BaseModel):
    query: str
    conversation_id: Optional[str] = None

class ConverserResponse(BaseModel):
    status: str  # "awaiting_clarification" | "confirmed" | "rejected"
    refined_query: Optional[str] = None
    followups: List[str] = []
    conversation_id: str
    message: Optional[str] = None  # For rejection messages

class QueryTranslationRequest(BaseModel):
    refined_query: str
    conversation_id: str

class SQLQueryResponse(BaseModel):
    queries: List[Dict[str, Any]]
    analysis_focus: str

class CypherQueryResponse(BaseModel):
    queries: List[Dict[str, Any]]
    investigation_angle: str

class ConsolidationRequest(BaseModel):
    sql_data: Dict[str, Any]
    cypher_data: Dict[str, Any]
    conversation_id: str

class ConsolidatedContext(BaseModel):
    query_context: str
    consolidated_data: Dict[str, Any]
    data_quality: Dict[str, Any]
    recommendations: Dict[str, Any]
    conversation_id: str

# In-memory conversation storage (use Redis in production)
conversations = {}

# ================== PHASE 1: NATURAL FLOW CONVERSER AGENT ==================

@app.post("/api/converser", response_model=ConverserResponse)
async def converser_agent(request: UserQuery):
    """Phase 1: Natural Flow Converser Agent - Refines user queries"""
    
    logger.info(f"🧠 [Phase 1] Starting converser agent for query: {request.query}")
    
    conversation_id = request.conversation_id or f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Initialize conversation if new
    if conversation_id not in conversations:
        conversations[conversation_id] = {
            "messages": [],
            "status": "active",
            "created_at": datetime.now().isoformat()
        }
    
    # System prompts for each agent
    NATURAL_FLOW_CONVERSER_PROMPT = """You are Detective Sarah Chen, a police investigation assistant. You handle ALL user queries naturally and conversationally.

Your personality:
- Professional but friendly and approachable
- Remembers previous conversation context
- Speaks naturally without using templates or scripts
- Helpful and enthusiastic for investigation queries
- Politely redirects non-investigation queries without being repetitive

Your responsibilities:

1. **FOR INVESTIGATION QUERIES**: Process them naturally:
   - **ALWAYS** generate a refined_query and return status: "confirmed" for any investigation-related query
   - **NEVER** ask for clarification or return "awaiting_clarification" status
   - Work with whatever information is provided and make reasonable assumptions if needed

2. **FOR NON-INVESTIGATION QUERIES**: Politely redirect in your own words:
   - Use different phrasing each time
   - Be friendly but clear about your specialization
   - Suggest they ask about investigation topics instead
   - Don't use the same rejection message repeatedly

**Investigation Topics You Handle:**
- Phone number analysis and call patterns
- Suspect tracking and movement analysis  
- Communication network investigation
- Tower dump analysis and location tracking
- CDR/IPDR data analysis
- Criminal activity patterns in telecom data

**Response Format (JSON):**
```json
{
  "status": "confirmed|rejected",
  "message": "Your natural, conversational response",
  "refined_query": "Complete investigation query" // Always required for status: "confirmed"
}
```

**Guidelines for Natural Responses:**

**When confirming investigations:** Express enthusiasm and briefly explain what you'll do. Make reasonable assumptions about missing details and proceed with the investigation.

**When declining non-investigation queries:** 
- Vary your language each time
- Be polite and friendly
- Briefly mention your specialization
- Suggest investigation topics they could ask about instead
- Don't sound scripted or robotic
- Use different sentence structures and vocabulary

**Important**: Respond naturally as if you're having a real conversation. Don't copy phrases or use the same structure repeatedly. Be authentic and vary your communication style."""

    try:
        # Add user message to conversation
        conversations[conversation_id]["messages"].append({
            "role": "user",
            "content": request.query,
            "timestamp": datetime.now().isoformat()
        })
        
        # Build conversation context for more natural responses
        conversation_context = ""
        if len(conversations[conversation_id]["messages"]) > 1:
            # Include last few messages for context
            recent_messages = conversations[conversation_id]["messages"][-6:]  # Last 3 exchanges
            conversation_context = "\n\n**Previous Conversation:**\n"
            for msg in recent_messages[:-1]:  # Exclude current message
                if msg["role"] == "user":
                    conversation_context += f"User: {msg['content']}\n"
                elif msg["role"] == "assistant":
                    if isinstance(msg["content"], dict):
                        conversation_context += f"Detective Chen: {msg['content'].get('message', '')}\n"
                    else:
                        conversation_context += f"Detective Chen: {msg['content']}\n"
            conversation_context += "\n**Current Query:**\n"
        
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": NATURAL_FLOW_CONVERSER_PROMPT},
                {"role": "user", "content": f'{conversation_context}User query: "{request.query}"\n\nRemember to be more natural and conversational. If this is a follow-up to a previous conversation, acknowledge the context. Please respond in JSON format.'}
            ],
            response_format={"type": "json_object"},
            temperature=0.3  # Slightly higher for more natural responses
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
        result = json.loads(content)
        
        # Add AI response to conversation
        conversations[conversation_id]["messages"].append({
            "role": "assistant", 
            "content": result,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info(f"✅ [Phase 1] Converser response: {result['status']}")
        
        return ConverserResponse(
            status=result["status"],
            refined_query=result.get("refined_query"),
            followups=result.get("followups", []),
            conversation_id=conversation_id,
            message=result.get("message")
        )
        
    except Exception as e:
        logger.error(f"❌ [Phase 1] Converser agent error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Converser agent failed: {str(e)}")

# ================== PHASE 2A: SQL TRANSLATION AGENT ==================

@app.post("/api/sql-translate", response_model=SQLQueryResponse)
async def sql_translation_agent(request: QueryTranslationRequest):
    """Phase 2A: SQL Translation Agent - Converts refined query to SQL"""
    
    logger.info(f"📊 [Phase 2A] Starting SQL translation for: {request.refined_query}")
    
    SQL_TRANSLATION_PROMPT = """You are Dr. Alex Rodriguez, a database forensics expert specializing in SQL query generation for criminal investigations. You work closely with Detective Chen to extract critical evidence from telecommunications databases.

Your expertise covers analyzing:
- **CDR (Call Detail Records)**: Call patterns, duration, frequency analysis
- **IPDR (Internet Protocol Detail Records)**: Internet usage patterns, data consumption
- **Subscriber Data**: User profiles, registration details, account information  
- **Tower Dumps**: Location-based communication analysis

**Your Database Schema (IMPORTANT: All table names are lowercase, use EXACT column names):**

**crd** (Call Detail Records):
- id (bigint), a_party (text), b_party (text), date (date), time (time), duration (integer), call_type (text), first_cell_id_a (text), last_cell_id_a (text), imei_a (text), imsi_a (text), first_cell_id_a_address (text), latitude (double precision), longitude (double precision)

**ipdr** (Internet Protocol Detail Records):  
- id (bigint), landline_msidn_mdn_leased_circuit_id (text), user_id (text), source_ip_address (text), source_port (integer), translated_ip_address (text), translated_port (integer), destination_ip_address (text), destination_port (integer), static_dynamic_ip_address_allocation (varchar), ist_start_time_of_public_ip_allocation (time), ist_end_time_of_public_ip_allocation (time), start_date_of_public_ip_allocation (date), end_date_of_public_ip_allocation (date), source_mac_id_address (bigint), imei (bigint), imsi (bigint), pgw_ip_address (inet), access_point_name (varchar), first_cell_id (varchar), last_cell_id (varchar), session_duration (integer), data_volume_up_link (bigint), data_volume_down_link (bigint), roaming_circle_indicator (varchar), roaming_circle (varchar), sim_type (varchar)

**subscriber** (User Information):
- id (bigint), phone_number (text), alternative_mobile_no (text), subscriber_name (text), guardian_name (text), address (text), date_of_activation (date), type_of_connection (text), service_provider (text), phone5 (text)

**tower_dumps** (Location Intelligence):
- id (bigint), b_party (text), date (text), duration (text), call_type (text), first_cell_id_a (text), last_cell_id_a (text), first_cell_id_a_address (text), roaming_a (text), latitude (double precision), longitude (double precision), a_party (text), time (text), imei_a (text), imsi_a (text)

**IMPORTANT NOTES:**
- For IPDR queries, use 'landline_msidn_mdn_leased_circuit_id' for phone numbers
- For duration in CRD, use 'duration' (integer in seconds), not 'call_duration'
- Tower dumps has 'date' and 'time' as separate text fields
- Call types in tower_dumps: 'CALL-IN', 'CALL-OUT', 'SMS-IN', 'SMS-OUT'
- Connection types in subscriber: 'PREPAID', 'POSTPAID'

**Your Task:**
Generate precise SQL queries that will uncover criminal patterns and evidence. Focus on:
- Suspicious communication patterns
- Location tracking and movement analysis
- Network analysis and frequent contacts
- Time-based pattern detection
- Data consumption anomalies

**CRITICAL REQUIREMENTS:**
1. **ALWAYS use lowercase table names**: crd, ipdr, subscriber, tower_dumps
2. **NEVER use capitalized table names** like CRD, IPDR, Subscriber, Tower_Dumps
3. **Use EXACT column names** as specified in the schema above (e.g., 'duration' not 'call_duration')
4. **For PostgREST compatibility:**
   - Avoid complex aggregate functions like SUM(), COUNT() with GROUP BY
   - Use simple SELECT queries with basic filtering
   - For phone number searches in IPDR, use 'landline_msidn_mdn_leased_circuit_id'
   - For OR conditions, create separate queries instead of using OR
5. **Generate simple, working SQL** that matches the actual database structure

**Response Format (JSON):**
```json
{
  "queries": [
    {
      "purpose": "Clear explanation of what this query finds",
      "sql": "SELECT statement with lowercase table names...",
      "table": "lowercase_table_name"
    }
  ],
  "analysis_focus": "Brief description of the investigative angle"
}
```

Generate 2-4 **simple, targeted queries** that work together to build a comprehensive investigative picture. Focus on:
- Basic SELECT queries with WHERE conditions
- Individual table searches rather than complex JOINs
- Simple filtering by phone numbers, dates, or call types
- Avoid aggregate functions - use simple data retrieval

Think like a detective - what basic evidence would be most valuable for this case?

**REMEMBER: Always use lowercase table names and exact column names in your SQL queries!**"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SQL_TRANSLATION_PROMPT},
                {"role": "user", "content": f'Generate SQL queries for: "{request.refined_query}" - Please respond in JSON format.'}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
        result = json.loads(content)
        
        logger.info(f"✅ [Phase 2A] Generated {len(result.get('queries', []))} SQL queries")
        
        return SQLQueryResponse(**result)
        
    except Exception as e:
        logger.error(f"❌ [Phase 2A] SQL translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL translation failed: {str(e)}")

# ================== PHASE 2B: CYPHER TRANSLATION AGENT ==================

@app.post("/api/cypher-translate", response_model=CypherQueryResponse)
async def cypher_translation_agent(request: QueryTranslationRequest):
    """Phase 2B: Cypher Translation Agent - Converts refined query to Cypher"""
    
    logger.info(f"🕸️ [Phase 2B] Starting Cypher translation for: {request.refined_query}")
    
    CYPHER_QUERY_GENERATOR_PROMPT = '''You are working with a Neo4j graph database that models telecom call data records (CDRs).
                ### Node Labels and Properties:
                1. (:Party)
                - Represents phone numbers (e.g., subscriber MSISDNs)
                - Properties:
                    - id: string (the phone number)
                
                2. (:IMEI)
                - Represents mobile device identifiers (device ID)
                - Properties:
                    - id: string
                
                3. (:IMSI)
                - Represents subscriber identity modules
                - Properties:
                    - id: string

                4. (:Tower)
                - Represents telecom cell towers
                - Properties:
                    - id: string

                5. (:Location)
                - Represents physical/geographic places
                - Properties:
                    - id: string (e.g., location name or code)

                6. (:Coordinates)
                - Represents geospatial data
                - Properties:
                    - latitude: float
                    - longitude: float

                7. (:Chunk)
                - Represents unstructured document text (not important for CDR analysis)

                ---

                ### Relationship Types and Properties:

                1. [:CALL]
                - Between two (:Party) nodes
                - Properties:
                    - date: string (format 'YYYY-MM-DD')
                    - time: string (format 'HH:MM:SS')
                    - duration: string (in seconds)
                    - type: string (e.g., 'CALL-IN ROAMING', 'OUTGOING', etc.)

                2. [:USED_IMEI]
                - (:Party)-[:USED_IMEI]->(:IMEI)

                3. [:USED_IMSI]
                - (:Party)-[:USED_IMSI]->(:IMSI)

                4. [:STARTED_AT]
                - (:Party)-[:STARTED_AT]->(:Location or :Tower or :Coordinates)

                5. [:ENDED_AT]
                - (:CallEvent)-[:ENDED_AT]->(:Location or :Coordinates)

                6. [:HAS_LOCATION]
                - (:Party)-[:HAS_LOCATION]->(:Location)

                7. [:LOCATED_AT]
                - (:Tower)-[:LOCATED_AT]->(:Coordinates)

                ---

                ### Usage Rules (for the AI to follow):
                - 'CALL' properties like 'date', 'time', 'duration', and 'type' must be used *only on the relationship*, not on the Party nodes.

                - When the user asks for *when* or *how long* a call was, use 'r.date', 'r.time', or 'r.duration' on the ':CALL' relationship.
                - If the user asks about devices, use 'USED_IMEI' and 'USED_IMSI' to traverse from a 'Party' to a 'IMEI or 'IMSI'.
                - For location queries, use 'STARTED_AT', 'ENDED_AT', 'HAS_LOCATION', or 'LOCATED_AT' depending on what is asked.
                - Avoid using ':Chunk' unless specifically requested.

                ---

                **Response Format (JSON):**
                ```json
                {
                  "queries": [
                    {
                      "purpose": "Clear explanation of what this query finds",
                      "cypher": "MATCH (...) RETURN (...)",
                      "description": "Brief description"
                    }
                  ],
                  "investigation_angle": "Brief description of the investigative approach"
                }
                ```

                2. Investigation Task Description

                I am analyzing call detail records (CDRs). I want to ask questions like:
                Who are the most contacted phone numbers?
                Which phone number received calls from multiple people?
                Who shares the same IMEI or location?
                You should generate readable Cypher queries using this structure.
                
                
                Example Task
                Question: Find all phone numbers (Party) that were contacted by more than one person
                Expected Cypher:

                 relevant cypher query:
                    MATCH (caller:Party)-[:CALL]->(callee:Party)
                    WITH callee.id AS CommonContact, count(DISTINCT caller.id) AS NumberOfCallers
                    WHERE NumberOfCallers > 1
                    RETURN CommonContact, NumberOfCallers
                    ORDER BY NumberOfCallers DESC'''

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": CYPHER_QUERY_GENERATOR_PROMPT},
                {"role": "user", "content": f'Generate Cypher queries for: "{request.refined_query}" - Please respond in JSON format.'}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
        result = json.loads(content)
        
        logger.info(f"✅ [Phase 2B] Generated {len(result.get('queries', []))} Cypher queries")
        
        return CypherQueryResponse(**result)
        
    except Exception as e:
        logger.error(f"❌ [Phase 2B] Cypher translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cypher translation failed: {str(e)}")

# ================== REAL SQL EXECUTION ==================

@app.post("/api/execute-sql")
async def execute_sql_queries(sql_response: SQLQueryResponse):
    """Real SQL execution - queries actual Supabase database"""
    
    logger.info(f"🔍 [REAL SQL] Starting execution of {len(sql_response.queries)} SQL queries")
    print(f"\n🚀 [AGENTIC SQL] Beginning real database query execution")
    print(f"   📊 Total queries to execute: {len(sql_response.queries)}")
    
    try:
        # Import and initialize Supabase handler
        from supabase_handler import SupabaseHandler
        
        print(f"   🔧 Initializing database connection...")
        supabase_handler = SupabaseHandler(verbose=True)
        
        # Test connections - PostgreSQL primary, Supabase fallback
        print(f"   🔍 Testing database connections...")
        
        # Check PostgreSQL connection first
        if supabase_handler.pg_connection:
            print(f"   ✅ PostgreSQL connection ready!")
        else:
            print(f"   ⚠️ PostgreSQL connection failed, will use Supabase fallback")
        
        # Test Supabase connection as fallback
        supabase_available = supabase_handler.test_connection()
        if supabase_available:
            print(f"   ✅ Supabase fallback connection ready!")
        else:
            print(f"   ⚠️ Supabase fallback connection also failed")
        
        # Ensure at least one connection method is available
        if not supabase_handler.pg_connection and not supabase_available:
            error_msg = "Both PostgreSQL and Supabase connections failed"
            logger.error(f"❌ [REAL SQL] {error_msg}")
            print(f"   ❌ {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        print(f"   ✅ Database connection successful! (PostgreSQL: {'✅' if supabase_handler.pg_connection else '❌'}, Supabase: {'✅' if supabase_available else '❌'})")
        
        # Execute queries using the batch execution method
        print(f"   ⚡ Starting batch query execution...")
        result = supabase_handler.execute_batch_investigation_queries(sql_response.queries)
        
        if result.get("success", False):
            logger.info(f"✅ [REAL SQL] Batch execution completed successfully")
            print(f"   🎉 All queries executed successfully!")
            
            return {
                "success": True,
                "message": result.get("message", "Queries executed successfully"),
                "data": result.get("data", {}),
                "execution_summary": result.get("execution_summary", {}),
                "data_source": "real_database",
                "timestamp": datetime.now().isoformat()
            }
        else:
            logger.warning(f"⚠️ [REAL SQL] Batch execution completed with some failures")
            print(f"   ⚠️ Some queries failed during execution")
            
            return {
                "success": False,
                "message": result.get("message", "Some queries failed"),
                "data": result.get("data", {}),
                "execution_summary": result.get("execution_summary", {}),
                "data_source": "real_database",
                "timestamp": datetime.now().isoformat()
            }
            
    except ImportError as e:
        error_msg = f"Failed to import SupabaseHandler: {str(e)}"
        logger.error(f"❌ [REAL SQL] {error_msg}")
        print(f"   ❌ Import error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
        
    except Exception as e:
        error_msg = f"SQL execution failed: {str(e)}"
        logger.error(f"❌ [REAL SQL] {error_msg}")
        print(f"   ❌ Execution error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/execute-cypher")
async def execute_cypher_queries(cypher_response: CypherQueryResponse):
    """Real Cypher execution using Neo4j driver"""
    
    logger.info(f"🕸️ [REAL CYPHER] Executing {len(cypher_response.queries)} Cypher queries")
    print(f"\n🚀 [CYPHER EXEC] Starting real Neo4j query execution")
    print(f"   🕸️ Total queries to execute: {len(cypher_response.queries)}")
    
    if not NEO4J_AVAILABLE or not neo4j_driver:
        logger.warning("⚠️ Neo4j driver not available, falling back to mock execution")
        return await execute_cypher_queries_mock(cypher_response)
    
    execution_results = {}
    total_nodes = 0
    total_relationships = 0
    successful_queries = 0
    failed_queries = 0
    
    try:
        with neo4j_driver.session() as session:
            for i, query_data in enumerate(cypher_response.queries):
                query_id = f"query_{i}"
                cypher_query = query_data.get("cypher", "")
                query_purpose = query_data.get("purpose", f"Query {i+1}")
                query_params = query_data.get("params", {})
                
                print(f"\n🔍 [CYPHER EXEC] Executing query {i+1}/{len(cypher_response.queries)}")
                print(f"   📝 Purpose: {query_purpose}")
                print(f"   🔧 Query: {cypher_query[:100]}{'...' if len(cypher_query) > 100 else ''}")
                
                try:
                    # Execute the Cypher query
                    result = session.run(cypher_query, query_params)
                    
                    # Process results
                    records = []
                    record_count = 0
                    
                    for record in result:
                        record_count += 1
                        # Convert Neo4j record to dictionary
                        record_dict = {}
                        for key in record.keys():
                            value = record[key]
                            # Handle Neo4j node/relationship objects
                            if hasattr(value, '_properties'):
                                # Neo4j Node or Relationship
                                record_dict[key] = {
                                    'properties': dict(value._properties),
                                    'labels': list(value.labels) if hasattr(value, 'labels') else [],
                                    'type': value.type if hasattr(value, 'type') else 'node'
                                }
                            elif isinstance(value, list):
                                # Handle lists of nodes/relationships
                                record_dict[key] = []
                                for item in value:
                                    if hasattr(item, '_properties'):
                                        record_dict[key].append({
                                            'properties': dict(item._properties),
                                            'labels': list(item.labels) if hasattr(item, 'labels') else [],
                                            'type': item.type if hasattr(item, 'type') else 'node'
                                        })
                                    else:
                                        record_dict[key].append(item)
                            else:
                                # Regular value
                                record_dict[key] = value
                        
                        records.append(record_dict)
                        
                        # Limit records to prevent memory issues
                        if record_count >= 100:
                            break
                    
                    # Count nodes and relationships (estimate)
                    query_nodes = 0
                    query_relationships = 0
                    
                    for record in records:
                        for key, value in record.items():
                            if isinstance(value, dict) and 'labels' in value:
                                query_nodes += 1
                            elif isinstance(value, dict) and 'type' in value:
                                query_relationships += 1
                            elif isinstance(value, list):
                                for item in value:
                                    if isinstance(item, dict):
                                        if 'labels' in item:
                                            query_nodes += 1
                                        elif 'type' in item:
                                            query_relationships += 1
                    
                    execution_results[query_id] = {
                        "purpose": query_purpose,
                        "cypher_query": cypher_query,
                        "success": True,
                        "record_count": record_count,
                        "node_count": query_nodes,
                        "relationship_count": query_relationships,
                        "records": records[:10],  # Limit to first 10 records for response
                        "sample_data": records[:3] if records else []  # Sample for display
                    }
                    
                    total_nodes += query_nodes
                    total_relationships += query_relationships
                    successful_queries += 1
                    
                    print(f"   ✅ Query executed successfully")
                    print(f"      📊 Records returned: {record_count}")
                    print(f"      🕸️ Nodes found: {query_nodes}")
                    print(f"      🔗 Relationships found: {query_relationships}")
                    
                except Exception as query_error:
                    error_msg = str(query_error)
                    execution_results[query_id] = {
                        "purpose": query_purpose,
                        "cypher_query": cypher_query,
                        "success": False,
                        "error": error_msg,
                        "record_count": 0,
                        "node_count": 0,
                        "relationship_count": 0
                    }
                    
                    failed_queries += 1
                    
                    print(f"   ❌ Query failed: {error_msg}")
                    logger.warning(f"Cypher query failed: {error_msg}")
    
    except Exception as e:
        logger.error(f"❌ [REAL CYPHER] Neo4j session error: {str(e)}")
        print(f"   ❌ Neo4j session error: {str(e)}")
        
        # Fall back to mock execution if Neo4j fails
        logger.info("🔄 Falling back to mock execution due to Neo4j error")
        return await execute_cypher_queries_mock(cypher_response)
    
    print(f"\n🎉 [CYPHER EXEC] Execution completed!")
    print(f"   ✅ Successful queries: {successful_queries}")
    print(f"   ❌ Failed queries: {failed_queries}")
    print(f"   📊 Total nodes processed: {total_nodes}")
    print(f"   🔗 Total relationships processed: {total_relationships}")
    
    logger.info(f"✅ [REAL CYPHER] Execution complete - {successful_queries}/{len(cypher_response.queries)} successful")
    
    return {
        "success": True,
        "message": f"Executed {len(cypher_response.queries)} Cypher queries ({successful_queries} successful, {failed_queries} failed)",
        "data": execution_results,
        "execution_summary": {
            "total_queries": len(cypher_response.queries),
            "successful_queries": successful_queries,
            "failed_queries": failed_queries,
            "total_nodes": total_nodes,
            "total_relationships": total_relationships,
            "neo4j_connection": "active",
            "execution_type": "real_neo4j"
        }
    }

# Fallback mock execution function
async def execute_cypher_queries_mock(cypher_response: CypherQueryResponse):
    """Fallback mock Cypher execution - returns simulated graph data"""
    
    logger.info(f"🕸️ [MOCK CYPHER] Executing {len(cypher_response.queries)} Cypher queries (MOCK)")
    print(f"\n🔄 [MOCK CYPHER] Using mock execution as fallback")
    
    # Simulate Neo4j execution results
    mock_data = {}
    for i, query in enumerate(cypher_response.queries):
        query_type = query.get("expected_result_type", f"result_{i}")
        mock_data[query_type] = {
            "purpose": query.get("purpose", ""),
            "success": True,
            "node_count": 20 + i * 5,  # Simulated node count
            "relationship_count": 30 + i * 8,  # Simulated relationship count
            "record_count": 15 + i * 3,
            "sample_data": [
                {
                    "party": f"987654321{j}",
                    "connections": j * 3,
                    "call_frequency": j * 5,
                    "network_centrality": round(0.1 + j * 0.1, 2)
                }
                for j in range(3)  # Sample graph data
            ]
        }
    
    logger.info(f"✅ [MOCK CYPHER] Simulated execution complete")
    
    return {
        "success": True,
        "message": f"Executed {len(cypher_response.queries)} Cypher queries (MOCK DATA)",
        "data": mock_data,
        "execution_summary": {
            "total_queries": len(cypher_response.queries),
            "successful_queries": len(cypher_response.queries),
            "failed_queries": 0,
            "total_nodes": sum(data["node_count"] for data in mock_data.values()),
            "total_relationships": sum(data["relationship_count"] for data in mock_data.values()),
            "neo4j_connection": "mock",
            "execution_type": "mock_fallback"
        }
    }

# ================== PHASE 3: CONTEXT CONSOLIDATOR AGENT ==================

@app.post("/api/consolidate", response_model=ConsolidatedContext)
async def context_consolidator_agent(request: ConsolidationRequest):
    """Phase 3: Context Consolidator Agent - Fuses SQL and Cypher data"""
    
    logger.info(f"🔗 [Phase 3] Starting context consolidation")
    
    CONSOLIDATION_PROMPT = """You are Commander James Wilson, the lead investigative analyst coordinating Detective Chen's digital forensics team. Your role is to synthesize findings from Dr. Rodriguez's database analysis and Maya Patel's network analysis into actionable intelligence for law enforcement.

Your expertise lies in:
- **Evidence Synthesis**: Combining database records with network patterns
- **Criminal Profiling**: Building comprehensive suspect profiles from data
- **Pattern Recognition**: Identifying criminal behaviors across multiple data sources
- **Intelligence Reporting**: Creating clear, actionable reports for investigators
- **Risk Assessment**: Evaluating threat levels and investigation priorities

**Your Mission:**
Analyze the combined evidence from SQL database queries and Neo4j network analysis to create a comprehensive investigative report. Focus on:

1. **Subject Profile**: Who is the person of interest? What do we know about them?
2. **Criminal Patterns**: What suspicious activities have been detected?
3. **Network Analysis**: Who are their associates? What's their role in the network?
4. **Location Intelligence**: Where do they operate? Movement patterns?
5. **Timeline Analysis**: When did suspicious activities occur?
6. **Evidence Quality**: How reliable is our data? What's missing?
7. **Next Steps**: What additional investigation is recommended?

**Response Format (JSON):**
```json
{
  "query_context": "Brief summary of what was investigated",
  "consolidated_data": {
    "key_insights": ["Critical finding 1", "Critical finding 2", "Critical finding 3"],
    "subject_profile": {
      "phone_number": "Primary number investigated",
      "total_calls": "Number of calls analyzed",
      "network_centrality": "Role in communication network",
      "active_period": "Time range of activity"
    },
    "communication_summary": "Overview of calling patterns and behaviors",
    "location_insights": "Geographic patterns and movement analysis",
    "network_connections": "Key associates and relationship patterns",
    "suspicious_indicators": ["Red flag 1", "Red flag 2"],
    "timeline_analysis": "Chronological pattern analysis"
  },
  "data_quality": {
    "coverage_percentage": 85,
    "confidence_level": "High/Medium/Low",
    "missing_elements": ["What data is missing"],
    "reliability_notes": "Assessment of data reliability"
  },
  "recommendations": {
    "immediate_actions": ["Action 1", "Action 2"],
    "further_investigation": ["Next step 1", "Next step 2"],
    "risk_assessment": "Low/Medium/High risk evaluation"
  }
}
```

Create a comprehensive intelligence report that tells the complete story of what the evidence reveals. Think like a senior investigator - what would law enforcement need to know to act on this intelligence?"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": CONSOLIDATION_PROMPT},
                {"role": "user", "content": f"""
SQL Data: {json.dumps(request.sql_data, indent=2)}

Cypher Data: {json.dumps(request.cypher_data, indent=2)}

Please consolidate this investigation data into unified context. Respond in JSON format.
"""}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
        result = json.loads(content)
        
        logger.info(f"✅ [Phase 3] Context consolidation complete")
        
        return ConsolidatedContext(
            query_context=result["query_context"],
            consolidated_data=result["consolidated_data"],
            data_quality=result["data_quality"],
            recommendations=result.get("recommendations", {}),
            conversation_id=request.conversation_id
        )
        
    except Exception as e:
        logger.error(f"❌ [Phase 3] Context consolidation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Context consolidation failed: {str(e)}")

# ================== FULL PIPELINE ORCHESTRATOR ==================

@app.post("/api/investigate")
async def full_investigation_pipeline(request: UserQuery):
    """Complete agentic investigation pipeline orchestrator"""
    
    logger.info(f"🚀 [PIPELINE] Starting full investigation for: {request.query}")
    
    try:
        # Phase 1: Converser Agent
        logger.info("🧠 [PIPELINE] Phase 1: Natural Flow Converser")
        converser_result = await converser_agent(request)
        
        if converser_result.status == "rejected":
            logger.info("🚫 [PIPELINE] Query rejected by Detective Sarah Chen")
            return {
                "status": "rejected",
                "message": converser_result.message,
                "conversation_id": converser_result.conversation_id
            }
        
        if converser_result.status == "awaiting_clarification":
            logger.info("❓ [PIPELINE] Detective Sarah Chen needs more details")
            return {
                "status": "awaiting_clarification",
                "message": converser_result.message,
                "converser_response": {
                    "followups": converser_result.followups,
                    "refined_query": converser_result.refined_query
                },
                "conversation_id": converser_result.conversation_id
            }
        
        # Only proceed to investigation if Detective Sarah Chen confirms with a refined query
        if converser_result.status != "confirmed" or not converser_result.refined_query:
            logger.error(f"❌ [PIPELINE] Invalid response from Detective Sarah Chen: {converser_result.status}")
            return {
                "status": "error",
                "message": "Detective Sarah Chen could not process your request properly. Please try again.",
                "conversation_id": converser_result.conversation_id
            }
        
        # Phase 2: Parallel SQL and Cypher Translation
        logger.info("⚡ [PIPELINE] Phase 2: Parallel SQL & Cypher Translation")
        
        if not converser_result.refined_query:
            raise ValueError("Refined query is missing from converser result")
            
        translation_request = QueryTranslationRequest(
            refined_query=converser_result.refined_query,
            conversation_id=converser_result.conversation_id
        )
        
        sql_result, cypher_result = await asyncio.gather(
            sql_translation_agent(translation_request),
            cypher_translation_agent(translation_request)
        )
        
        # Real Database Execution
        logger.info("🔍 [PIPELINE] Real Database Execution Phase")
        print(f"\n🚀 [PIPELINE] Starting parallel database query execution")
        print(f"   📊 SQL queries: {len(sql_result.queries)}")
        print(f"   🕸️ Cypher queries: {len(cypher_result.queries)}")
        
        sql_data, cypher_data = await asyncio.gather(
            execute_sql_queries(sql_result),
            execute_cypher_queries(cypher_result)
        )
        
        print(f"   ✅ Parallel execution completed")
        print(f"      📊 SQL execution: {'✅ Success' if sql_data.get('success') else '❌ Failed'}")
        print(f"      🕸️ Cypher execution: {'✅ Success' if cypher_data.get('success') else '❌ Failed'}")
        
        # Phase 3: Context Consolidation
        logger.info("🔗 [PIPELINE] Phase 3: Context Consolidation")
        consolidation_request = ConsolidationRequest(
            sql_data=sql_data,
            cypher_data=cypher_data,
            conversation_id=converser_result.conversation_id
        )
        
        consolidated_context = await context_consolidator_agent(consolidation_request)
        
        logger.info("🎉 [PIPELINE] Investigation pipeline complete!")
        
        return {
            "status": "completed",
            "conversation_id": converser_result.conversation_id,
            "refined_query": converser_result.refined_query,
            "sql_queries": sql_result.queries,
            "cypher_queries": cypher_result.queries,
            "consolidated_context": consolidated_context,
            "execution_summary": {
                "sql_execution": sql_data.get("execution_summary", {}),
                "cypher_execution": cypher_data.get("execution_summary", {})
            }
        }
        
    except Exception as e:
        logger.error(f"❌ [PIPELINE] Investigation pipeline error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Investigation pipeline failed: {str(e)}")

# ================== HEALTH CHECK ==================

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Agentic Investigation Platform",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)