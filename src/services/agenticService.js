// agenticService.js - Service for integrating agentic investigation system

const AGENTIC_API_BASE = 'http://localhost:8001';

class AgenticService {
  constructor() {
    this.conversationId = null;
    this.isHealthy = false;
  }

  // Check if agentic API is available
  async checkHealth() {
    try {
      const response = await fetch(`${AGENTIC_API_BASE}/api/health`);
      this.isHealthy = response.ok;
      return this.isHealthy;
    } catch (error) {
      console.error('Agentic API health check failed:', error);
      this.isHealthy = false;
      return false;
    }
  }

  // Always try agentic investigation - let the LLM decide
  isAgenticQuery(message) {
    console.log('🔍 [AgenticService] Sending query to LLM for decision:', message);
    // Always return true - let the LLM agent decide if it should handle the query or reject it
    return true;
  }

  // Start agentic investigation
  async startInvestigation(query) {
    console.log('🚀 [AgenticService] Starting investigation:', query);
    
    try {
      const response = await fetch(`${AGENTIC_API_BASE}/api/investigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          conversation_id: this.conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update conversation ID
      if (result.conversation_id) {
        this.conversationId = result.conversation_id;
      }

      return result;
    } catch (error) {
      console.error('❌ [AgenticService] Investigation failed:', error);
      throw error;
    }
  }

  // Continue conversation with follow-up answers
  async continueInvestigation(followupAnswers) {
    console.log('🔄 [AgenticService] Continuing investigation with follow-up:', followupAnswers);
    
    return await this.startInvestigation(followupAnswers);
  }

  // Format agentic response for display
  formatAgenticResponse(result) {
    console.log('📋 [AgenticService] Formatting response:', result);
    
    if (result.status === 'awaiting_clarification') {
      return {
        type: 'followup',
        message: 'I need some additional information to provide a thorough analysis:',
        followups: result.converser_response?.followups || [],
        conversationId: result.conversation_id
      };
    }

    if (result.status === 'completed') {
      const context = result.consolidated_context;
      
      let message = `🎉 **Investigation Completed Successfully!**\n\n`;
      
      // Query context
      if (context?.query_context) {
        message += `📋 **Analysis:** ${context.query_context}\n\n`;
      }

      // Key insights
      if (context?.consolidated_data?.key_insights?.length > 0) {
        message += `🔍 **Key Findings:**\n`;
        context.consolidated_data.key_insights.forEach((insight, index) => {
          message += `${index + 1}. ${insight}\n`;
        });
        message += '\n';
      }

      // Subject profile
      if (context?.consolidated_data?.subject_profile) {
        const profile = context.consolidated_data.subject_profile;
        message += `👤 **Subject Profile:**\n`;
        if (profile.phone_number) message += `📱 Phone: ${profile.phone_number}\n`;
        if (profile.total_calls) message += `📞 Total Calls: ${profile.total_calls}\n`;
        if (profile.network_centrality) message += `🕸️ Network Role: ${profile.network_centrality}\n`;
        if (profile.active_period) message += `⏰ Active Period: ${profile.active_period}\n`;
        message += '\n';
      }

      // Communication summary
      if (context?.consolidated_data?.communication_summary) {
        message += `📊 **Communication Patterns:**\n${context.consolidated_data.communication_summary}\n\n`;
      }

      // Location insights
      if (context?.consolidated_data?.location_insights) {
        message += `📍 **Location Analysis:**\n${context.consolidated_data.location_insights}\n\n`;
      }

      // Data quality
      if (context?.data_quality) {
        const quality = context.data_quality;
        message += `📈 **Data Quality:**\n`;
        message += `• Coverage: ${quality.coverage_percentage || 'N/A'}%\n`;
        message += `• Confidence: ${quality.confidence_level || 'N/A'}\n`;
        
        if (quality.missing_elements?.length > 0) {
          message += `• Missing: ${quality.missing_elements.join(', ')}\n`;
        }
        message += '\n';
      }

      // Execution summary
      if (result.execution_summary) {
        message += `🔧 **Technical Details:**\n`;
        message += `• SQL Queries: ${result.sql_queries?.length || 0}\n`;
        message += `• Graph Queries: ${result.cypher_queries?.length || 0}\n`;
        if (result.execution_summary.sql_execution?.total_rows) {
          message += `• Records Analyzed: ${result.execution_summary.sql_execution.total_rows}\n`;
        }
        if (result.execution_summary.cypher_execution?.total_nodes) {
          message += `• Network Nodes: ${result.execution_summary.cypher_execution.total_nodes}\n`;
        }
      }

      return {
        type: 'completed',
        message: message,
        result: result
      };
    }



    if (result.status === 'rejected') {
      return {
        type: 'rejected',
        message: result.message || 'This query is not suitable for investigation analysis. Please ask about phone records, call patterns, or suspect tracking.',
        result: result
      };
    }

    return {
      type: 'error',
      message: `Investigation status: ${result.status}`,
      result: result
    };
  }

  // Get investigation status message
  getStatusMessage(phase) {
    const statusMessages = {
      'converser': '🧠 Analyzing your query and gathering requirements...',
      'translation': '⚡ Generating database queries for comprehensive analysis...',
      'execution': '🔍 Retrieving data from multiple sources...',
      'consolidation': '🔗 Consolidating findings and generating insights...',
      'completed': '🎉 Investigation completed successfully!'
    };

    return statusMessages[phase] || '🔄 Processing your investigation request...';
  }

  // Reset conversation
  resetConversation() {
    this.conversationId = null;
    console.log('🔄 [AgenticService] Conversation reset');
  }
}

// Export singleton instance
const agenticService = new AgenticService();
export default agenticService; 