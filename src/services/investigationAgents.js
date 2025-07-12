// Investigation Agents - Specialized AI agents for CDR/IPDR analysis
// Replaces simple formatter functions with intelligent analysis

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com";

// Utility function to call OpenAI API
const callOpenAIAPI = async (systemPrompt, userPrompt, maxTokens = 800) => {
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Analysis unavailable';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return `Analysis Error: ${error.message}`;
  }
};

// 1. Communication Pattern Agent
export const communicationPatternAgent = async (data, originalQuery) => {
  const systemPrompt = `You are a Communication Pattern Analysis Agent for police investigations. You specialize in analyzing CDR (Call Detail Records) data to identify suspicious communication behaviors, patterns, and anomalies.

Your expertise includes:
- Call frequency analysis and timing patterns
- Communication network mapping
- Suspicious calling behaviors detection
- Peak activity periods identification
- Relationship strength assessment
- Covert communication indicators

Analyze the provided data and generate insights about:
1. Communication frequency patterns
2. Unusual timing behaviors
3. Network centrality and influence
4. Suspicious communication indicators
5. Behavioral anomalies
6. Investigation recommendations

Format your response as a professional investigation report with clear findings and actionable insights.`;

  const userPrompt = `Original Query: "${originalQuery}"

CDR Data Analysis:
${JSON.stringify(data, null, 2)}

Please analyze this communication data and provide detailed insights about patterns, anomalies, and investigative leads.`;

  return await callOpenAIAPI(systemPrompt, userPrompt, 1000);
};

// 2. Geospatial Agent
export const geospatialAgent = async (data, originalQuery) => {
  const systemPrompt = `You are a Geospatial Intelligence Agent for police investigations. You specialize in analyzing location data, tower information, and movement patterns from CDR/IPDR records.

Your expertise includes:
- Movement pattern analysis
- Location hotspot identification
- Tower coverage analysis
- Geographic anomaly detection
- Route prediction and tracking
- Surveillance zone identification

Analyze the provided data and generate insights about:
1. Movement patterns and routes
2. Frequently visited locations
3. Unusual geographic behaviors
4. Tower switching patterns
5. Potential meeting points or hideouts
6. Geographic investigation recommendations

Format your response as a professional geospatial intelligence report with clear findings and actionable insights.`;

  const userPrompt = `Original Query: "${originalQuery}"

Location/Tower Data Analysis:
${JSON.stringify(data, null, 2)}

Please analyze this geospatial data and provide detailed insights about movement patterns, location significance, and investigative leads.`;

  return await callOpenAIAPI(systemPrompt, userPrompt, 1000);
};

// 3. Device Identity Agent
export const deviceIdentityAgent = async (data, originalQuery) => {
  const systemPrompt = `You are a Device Identity Analysis Agent for police investigations. You specialize in analyzing IMEI, IMSI, and device-related data to identify device usage patterns, sharing, and anomalies.

Your expertise includes:
- Device fingerprinting and identification
- IMEI/IMSI correlation analysis
- Device sharing detection
- SIM swapping identification
- Device theft indicators
- Multi-device usage patterns

Analyze the provided data and generate insights about:
1. Device usage patterns
2. IMEI/IMSI relationships
3. Device sharing indicators
4. SIM card switching behaviors
5. Potential device theft or cloning
6. Device-based investigation recommendations

Format your response as a professional device intelligence report with clear findings and actionable insights.`;

  const userPrompt = `Original Query: "${originalQuery}"

Device Identity Data Analysis:
${JSON.stringify(data, null, 2)}

Please analyze this device data and provide detailed insights about device usage patterns, sharing behaviors, and investigative leads.`;

  return await callOpenAIAPI(systemPrompt, userPrompt, 1000);
};

// 4. IPDR Session Agent
export const ipdrSessionAgent = async (data, originalQuery) => {
  const systemPrompt = `You are an IPDR Session Analysis Agent for police investigations. You specialize in analyzing Internet Protocol Detail Records to identify online activity patterns, data usage anomalies, and digital behavior indicators.

Your expertise includes:
- Internet session pattern analysis
- Data consumption behavior
- IP address correlation
- Port and protocol analysis
- Suspicious online activity detection
- Digital footprint mapping

Analyze the provided data and generate insights about:
1. Internet usage patterns and timing
2. Data consumption anomalies
3. Session duration and frequency
4. IP address and port analysis
5. Suspicious online behaviors
6. Digital investigation recommendations

Format your response as a professional digital intelligence report with clear findings and actionable insights.`;

  const userPrompt = `Original Query: "${originalQuery}"

IPDR Session Data Analysis:
${JSON.stringify(data, null, 2)}

Please analyze this IPDR data and provide detailed insights about internet usage patterns, digital behaviors, and investigative leads.`;

  return await callOpenAIAPI(systemPrompt, userPrompt, 1000);
};

// 5. Master Summary Builder
export const masterSummaryBuilder = async (agentResults, originalQuery, rawData) => {
  const systemPrompt = `You are a Master Intelligence Summary Builder for police investigations. You consolidate findings from multiple specialized agents into comprehensive investigation reports.

Your role is to:
- Synthesize insights from Communication, Geospatial, Device, and IPDR agents
- Cross-correlate findings across different data types
- Identify key patterns and connections
- Generate actionable investigation priorities
- Provide risk assessments and recommendations
- Create executive summaries for law enforcement

Create a comprehensive investigation report with:
1. Executive Summary
2. Key Findings (prioritized by importance)
3. Cross-Agent Correlations
4. Risk Assessment
5. Investigation Recommendations
6. Next Steps and Priorities

Format as a professional police intelligence report suitable for investigators and command staff.`;

  const availableAnalyses = Object.keys(agentResults).join(', ');
  const userPrompt = `Original Investigation Query: "${originalQuery}"

Available Agent Analyses: ${availableAnalyses}

Agent Results:
${JSON.stringify(agentResults, null, 2)}

Please consolidate these specialized analyses into a comprehensive master intelligence report with clear priorities and actionable recommendations.`;

  return await callOpenAIAPI(systemPrompt, userPrompt, 1500);
};

// Main Agent Orchestrator
export const analyzeWithAgents = async (data, originalQuery) => {
  console.log('🤖 Starting specialized agent analysis...');
  
  if (!data || data.length === 0) {
    return {
      type: 'no_data',
      content: '📋 No data available for analysis. Please ensure your query returns results from the database.'
    };
  }

  try {
    const agentResults = {};
    const queryLower = originalQuery.toLowerCase();
    
    // Determine which agents to activate based on query content and data structure
    const hasCallData = data.some(record => 
      record.hasOwnProperty('callee') || 
      record.hasOwnProperty('caller') || 
      record.hasOwnProperty('CommonContact') ||
      record.hasOwnProperty('NumberOfCallers')
    );
    
    const hasLocationData = data.some(record => 
      record.hasOwnProperty('location') || 
      record.hasOwnProperty('tower') || 
      record.hasOwnProperty('latitude') ||
      record.hasOwnProperty('longitude')
    );
    
    const hasDeviceData = data.some(record => 
      record.hasOwnProperty('imei') || 
      record.hasOwnProperty('imsi') || 
      record.hasOwnProperty('device')
    );
    
    const hasIPDRData = data.some(record => 
      record.hasOwnProperty('ip') || 
      record.hasOwnProperty('session') || 
      record.hasOwnProperty('data_volume') ||
      record.hasOwnProperty('port')
    );

    // Activate appropriate agents based on data content
    const agentPromises = [];

    if (hasCallData || queryLower.includes('call') || queryLower.includes('communication')) {
      console.log('🔍 Activating Communication Pattern Agent...');
      agentPromises.push(
        communicationPatternAgent(data, originalQuery).then(result => {
          agentResults.communication = result;
        })
      );
    }

    if (hasLocationData || queryLower.includes('location') || queryLower.includes('tower')) {
      console.log('🗺️ Activating Geospatial Agent...');
      agentPromises.push(
        geospatialAgent(data, originalQuery).then(result => {
          agentResults.geospatial = result;
        })
      );
    }

    if (hasDeviceData || queryLower.includes('imei') || queryLower.includes('device')) {
      console.log('📱 Activating Device Identity Agent...');
      agentPromises.push(
        deviceIdentityAgent(data, originalQuery).then(result => {
          agentResults.device = result;
        })
      );
    }

    if (hasIPDRData || queryLower.includes('ipdr') || queryLower.includes('internet')) {
      console.log('🌐 Activating IPDR Session Agent...');
      agentPromises.push(
        ipdrSessionAgent(data, originalQuery).then(result => {
          agentResults.ipdr = result;
        })
      );
    }

    // If no specific agents match, activate Communication Pattern Agent as default
    if (agentPromises.length === 0) {
      console.log('🔍 Activating default Communication Pattern Agent...');
      agentPromises.push(
        communicationPatternAgent(data, originalQuery).then(result => {
          agentResults.communication = result;
        })
      );
    }

    // Wait for all agents to complete
    await Promise.all(agentPromises);

    console.log('🔗 Activating Master Summary Builder...');
    // Generate master summary
    const masterSummary = await masterSummaryBuilder(agentResults, originalQuery, data);

    return {
      type: 'agent_analysis',
      content: masterSummary,
      agentResults: agentResults,
      rawData: data
    };

  } catch (error) {
    console.error('❌ Agent analysis error:', error);
    return {
      type: 'error',
      content: `🚨 Investigation Analysis Error: ${error.message}\n\nFalling back to basic data display.`
    };
  }
};