// agenticInvestigator.js - Client for Agentic Investigation Platform

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

// Conversation Memory Management
class ConversationMemory {
  constructor() {
    this.conversations = new Map();
  }

  // Create new conversation
  createConversation(conversationId = null) {
    const id = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const conversation = {
      id,
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    this.conversations.set(id, conversation);
    console.log(`💬 [Memory] Created conversation: ${id}`);
    return conversation;
  }

  // Add message to conversation
  addMessage(conversationId, role, content, metadata = {}) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role, // 'user' | 'assistant' | 'system'
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    conversation.messages.push(message);
    conversation.lastActivity = new Date().toISOString();
    
    console.log(`💬 [Memory] Added ${role} message to ${conversationId}`);
    return message;
  }

  // Get conversation history
  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  // Get recent conversations
  getRecentConversations(limit = 10) {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, limit);
  }

  // Update conversation status
  updateStatus(conversationId, status) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = status;
      conversation.lastActivity = new Date().toISOString();
      console.log(`💬 [Memory] Updated ${conversationId} status to: ${status}`);
    }
  }
}

// Main Agentic Investigator Class
class AgenticInvestigator {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.memory = new ConversationMemory();
    this.currentConversation = null;
    
    console.log('🚀 [AgenticInvestigator] Initialized');
  }

  // ================== PHASE 1: NATURAL FLOW CONVERSER ==================

  async startConversation(query, conversationId = null) {
    console.log(`🧠 [Phase 1] Starting conversation with query: "${query}"`);
    
    try {
      // Create or get conversation
      if (conversationId) {
        this.currentConversation = this.memory.getConversation(conversationId);
      }
      
      if (!this.currentConversation) {
        this.currentConversation = this.memory.createConversation(conversationId);
      }

      // Add user message to memory
      this.memory.addMessage(this.currentConversation.id, 'user', query);

      // Call converser agent
      const response = await this.apiClient.post('/api/converser', {
        query,
        conversation_id: this.currentConversation.id
      });

      const result = response.data;
      
      // Add assistant response to memory
      this.memory.addMessage(this.currentConversation.id, 'assistant', result, {
        phase: 'converser',
        status: result.status
      });

      console.log(`✅ [Phase 1] Converser status: ${result.status}`);
      
      if (result.status === 'awaiting_details') {
        console.log(`🔍 [Phase 1] Follow-up questions:`, result.followups);
        this.memory.updateStatus(this.currentConversation.id, 'awaiting_details');
      } else {
        console.log(`✅ [Phase 1] Refined query: "${result.refined_query}"`);
        this.memory.updateStatus(this.currentConversation.id, 'query_confirmed');
      }

      return result;

    } catch (error) {
      console.error(`❌ [Phase 1] Converser error:`, error.message);
      throw new Error(`Converser agent failed: ${error.message}`);
    }
  }

  // Continue conversation with follow-up answers
  async continueConversation(followupAnswer) {
    if (!this.currentConversation) {
      throw new Error('No active conversation. Start a new conversation first.');
    }

    console.log(`🔄 [Phase 1] Continuing conversation with: "${followupAnswer}"`);
    
    return await this.startConversation(followupAnswer, this.currentConversation.id);
  }

  // ================== PHASE 2: PARALLEL TRANSLATION AGENTS ==================

  async translateQueries(refinedQuery, conversationId) {
    console.log(`⚡ [Phase 2] Starting parallel SQL & Cypher translation`);
    
    try {
      const translationRequest = {
        refined_query: refinedQuery,
        conversation_id: conversationId
      };

      // Execute SQL and Cypher translation in parallel
      console.log(`📊 [Phase 2A] Requesting SQL translation...`);
      console.log(`🕸️ [Phase 2B] Requesting Cypher translation...`);
      
      const [sqlResponse, cypherResponse] = await Promise.all([
        this.apiClient.post('/api/sql-translate', translationRequest),
        this.apiClient.post('/api/cypher-translate', translationRequest)
      ]);

      const sqlResult = sqlResponse.data;
      const cypherResult = cypherResponse.data;

      // Log generated queries
      console.log(`✅ [Phase 2A] Generated ${sqlResult.queries.length} SQL queries:`);
      sqlResult.queries.forEach((query, index) => {
        console.log(`   SQL ${index + 1}: ${query.purpose}`);
        console.log(`   Query: ${query.sql.substring(0, 100)}...`);
      });

      console.log(`✅ [Phase 2B] Generated ${cypherResult.queries.length} Cypher queries:`);
      cypherResult.queries.forEach((query, index) => {
        console.log(`   Cypher ${index + 1}: ${query.purpose}`);
        console.log(`   Query: ${query.cypher.substring(0, 100)}...`);
      });

      // Add translation results to memory
      this.memory.addMessage(conversationId, 'system', {
        sql_queries: sqlResult,
        cypher_queries: cypherResult
      }, { phase: 'translation' });

      return { sqlResult, cypherResult };

    } catch (error) {
      console.error(`❌ [Phase 2] Translation error:`, error.message);
      throw new Error(`Query translation failed: ${error.message}`);
    }
  }

  // ================== MOCK EXECUTION PHASE ==================

  async executeQueries(sqlResult, cypherResult) {
    console.log(`🔍 [Execution] Starting mock query execution`);
    
    try {
      // Execute SQL and Cypher queries in parallel (mock execution)
      console.log(`📊 [Mock SQL] Executing ${sqlResult.queries.length} SQL queries...`);
      console.log(`🕸️ [Mock Cypher] Executing ${cypherResult.queries.length} Cypher queries...`);
      
      const [sqlData, cypherData] = await Promise.all([
        this.apiClient.post('/api/execute-sql', sqlResult),
        this.apiClient.post('/api/execute-cypher', cypherResult)
      ]);

      const sqlExecutionResult = sqlData.data;
      const cypherExecutionResult = cypherData.data;

      // Log execution results
      console.log(`✅ [Mock SQL] Execution complete:`);
      console.log(`   Total rows retrieved: ${sqlExecutionResult.execution_summary.total_rows}`);
      
      console.log(`✅ [Mock Cypher] Execution complete:`);
      console.log(`   Total nodes: ${cypherExecutionResult.execution_summary.total_nodes}`);
      console.log(`   Total relationships: ${cypherExecutionResult.execution_summary.total_relationships}`);

      return { sqlExecutionResult, cypherExecutionResult };

    } catch (error) {
      console.error(`❌ [Execution] Query execution error:`, error.message);
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  // ================== PHASE 3: CONTEXT CONSOLIDATION ==================

  async consolidateContext(sqlData, cypherData, conversationId) {
    console.log(`🔗 [Phase 3] Starting context consolidation`);
    
    try {
      const consolidationRequest = {
        sql_data: sqlData,
        cypher_data: cypherData,
        conversation_id: conversationId
      };

      const response = await this.apiClient.post('/api/consolidate', consolidationRequest);
      const consolidatedContext = response.data;

      console.log(`✅ [Phase 3] Context consolidation complete`);
      console.log(`   Query context: ${consolidatedContext.query_context}`);
      console.log(`   Data quality: ${consolidatedContext.data_quality.confidence_level} confidence`);
      console.log(`   Coverage: ${consolidatedContext.data_quality.coverage_percentage}%`);

      // Log key insights
      if (consolidatedContext.consolidated_data.key_insights) {
        console.log(`🔍 [Phase 3] Key insights:`);
        consolidatedContext.consolidated_data.key_insights.forEach((insight, index) => {
          console.log(`   ${index + 1}. ${insight}`);
        });
      }

      // Add consolidated context to memory
      this.memory.addMessage(conversationId, 'assistant', consolidatedContext, {
        phase: 'consolidation',
        data_quality: consolidatedContext.data_quality
      });

      this.memory.updateStatus(conversationId, 'completed');

      return consolidatedContext;

    } catch (error) {
      console.error(`❌ [Phase 3] Consolidation error:`, error.message);
      throw new Error(`Context consolidation failed: ${error.message}`);
    }
  }

  // ================== FULL PIPELINE ORCHESTRATOR ==================

  async runFullInvestigation(query, conversationId = null) {
    console.log(`🚀 [PIPELINE] Starting full agentic investigation`);
    console.log(`📝 [PIPELINE] Query: "${query}"`);
    
    try {
      // Phase 1: Natural Flow Converser
      const converserResult = await this.startConversation(query, conversationId);
      
      // Check if we need more details
      if (converserResult.status === 'awaiting_details') {
        console.log(`⏸️ [PIPELINE] Investigation paused - awaiting user clarification`);
        return {
          status: 'awaiting_clarification',
          conversation_id: converserResult.conversation_id,
          followup_questions: converserResult.followups,
          message: 'Please provide additional details to continue the investigation'
        };
      }

      const refinedQuery = converserResult.refined_query;
      const convId = converserResult.conversation_id;

      console.log(`✅ [PIPELINE] Query refined: "${refinedQuery}"`);

      // Phase 2: Parallel Translation
      const { sqlResult, cypherResult } = await this.translateQueries(refinedQuery, convId);

      // Mock Execution
      const { sqlExecutionResult, cypherExecutionResult } = await this.executeQueries(sqlResult, cypherResult);

      // Phase 3: Context Consolidation
      const consolidatedContext = await this.consolidateContext(
        sqlExecutionResult,
        cypherExecutionResult,
        convId
      );

      console.log(`🎉 [PIPELINE] Investigation completed successfully!`);

      return {
        status: 'completed',
        conversation_id: convId,
        refined_query: refinedQuery,
        sql_queries: sqlResult.queries,
        cypher_queries: cypherResult.queries,
        consolidated_context: consolidatedContext,
        execution_summary: {
          sql_execution: sqlExecutionResult.execution_summary,
          cypher_execution: cypherExecutionResult.execution_summary
        }
      };

    } catch (error) {
      console.error(`❌ [PIPELINE] Investigation failed:`, error.message);
      
      if (this.currentConversation) {
        this.memory.updateStatus(this.currentConversation.id, 'failed');
        this.memory.addMessage(this.currentConversation.id, 'system', {
          error: error.message,
          timestamp: new Date().toISOString()
        }, { phase: 'error' });
      }

      throw error;
    }
  }

  // ================== UTILITY METHODS ==================

  // Get conversation history
  getConversationHistory(conversationId = null) {
    const convId = conversationId || this.currentConversation?.id;
    if (!convId) return null;
    
    return this.memory.getConversation(convId);
  }

  // Get all conversations
  getAllConversations() {
    return this.memory.getRecentConversations();
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.apiClient.get('/api/health');
      console.log(`✅ [Health] API is healthy:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [Health] API health check failed:`, error.message);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Reset current conversation
  resetConversation() {
    this.currentConversation = null;
    console.log(`🔄 [Memory] Reset current conversation`);
  }
}

// ================== USAGE EXAMPLES ==================

// Example usage function
async function runInvestigationExample() {
  const investigator = new AgenticInvestigator();
  
  try {
    // Check API health
    await investigator.checkHealth();
    
    // Test queries
    const testQueries = [
      "Check the suspect's calls",
      "Analyze phone number 9876543210 for the last month",
      "Find communication patterns for suspect John Doe"
    ];

    for (const query of testQueries) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 [Example] Testing query: "${query}"`);
      console.log(`${'='.repeat(60)}`);
      
      try {
        const result = await investigator.runFullInvestigation(query);
        
        if (result.status === 'awaiting_clarification') {
          console.log(`🔍 [Example] Follow-up needed:`, result.followup_questions);
          
          // Simulate providing more details
          const followupAnswer = "Phone number is 9876543210, analyze calls from January 1-15, 2024, focus on frequency patterns";
          console.log(`📝 [Example] Providing details: "${followupAnswer}"`);
          
          const finalResult = await investigator.continueConversation(followupAnswer);
          console.log(`🎯 [Example] Final result:`, finalResult.status);
          
        } else {
          console.log(`🎯 [Example] Investigation completed:`, result.status);
        }
        
        // Reset for next query
        investigator.resetConversation();
        
      } catch (error) {
        console.error(`❌ [Example] Query failed:`, error.message);
      }
    }
    
    // Show conversation history
    console.log(`\n📚 [Example] Recent conversations:`, investigator.getAllConversations().length);
    
  } catch (error) {
    console.error(`❌ [Example] Example execution failed:`, error.message);
  }
}

// Export for use in other modules
export { AgenticInvestigator, ConversationMemory };

// Export default instance
export default new AgenticInvestigator();

// Run example if this file is executed directly (Node.js only)
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  runInvestigationExample().catch(console.error);
} 