import neo4j from 'neo4j-driver';

// Neo4j Configuration - Using environment variables
const NEO4J_URI = import.meta.env.NEO4J_URI || "neo4j+s://0d71a2dd.databases.neo4j.io";
const NEO4J_USER = import.meta.env.NEO4J_USER || import.meta.env.NEXT_NEO4J_USERNAME || "neo4j";
const NEO4J_PASS = import.meta.env.NEO4J_PASSWORD || import.meta.env.NEXT_NEO4J_PASSWORD;

let driver = null;
let cachedSchema = null;

// Initialize Neo4j driver
const initializeDriver = () => {
  if (!driver) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
  }
  return driver;
};

// Schema Discovery Service
export const discoverSchema = async () => {
  if (cachedSchema) {
    return cachedSchema;
  }

  const driver = initializeDriver();
  const session = driver.session();

  try {
    console.log('🔍 Discovering database schema...');

    // Discover all node labels
    const labelsResult = await session.run('CALL db.labels()');
    const labels = labelsResult.records.map(record => record.get(0));

    // Discover all relationship types
    const relationshipsResult = await session.run('CALL db.relationshipTypes()');
    const relationships = relationshipsResult.records.map(record => record.get(0));

    // Discover all property keys
    const propertiesResult = await session.run('CALL db.propertyKeys()');
    const properties = propertiesResult.records.map(record => record.get(0));

    // Sample data structure for each label
    const labelSchemas = {};
    for (const label of labels) {
      try {
        const sampleQuery = `MATCH (n:${label}) RETURN keys(n) as props,n`;
        const sampleResult = await session.run(sampleQuery);
        
        const sampleProps = new Set();
        const sampleData = [];
        
        sampleResult.records.forEach(record => {
          const props = record.get('props');
          const node = record.get('n');
          props.forEach(prop => sampleProps.add(prop));
          sampleData.push(node.properties);
        });

        labelSchemas[label] = {
          properties: Array.from(sampleProps),
          sampleData: sampleData.slice(0, 2) // Keep only 2 samples
        };
      } catch (error) {
        console.warn(`Could not sample ${label}:`, error.message);
        labelSchemas[label] = { properties: [], sampleData: [] };
      }
    }

    // Identify phone number patterns
    const phonePatterns = identifyPhonePatterns(labelSchemas, properties);

    cachedSchema = {
      labels,
      relationships,
      properties,
      labelSchemas,
      phonePatterns,
      discoveredAt: new Date().toISOString()
    };

    console.log('✅ Schema discovery complete:', {
      labels: labels.length,
      relationships: relationships.length,
      properties: properties.length,
      phonePatterns: phonePatterns.length
    });

    return cachedSchema;

  } catch (error) {
    console.error('❌ Schema discovery failed:', error);
    throw new Error(`Failed to discover schema: ${error.message}`);
  } finally {
    await session.close();
  }
};

// Identify potential phone number properties
const identifyPhonePatterns = (labelSchemas, allProperties) => {
  const phoneKeywords = ['phone', 'number', 'msisdn', 'calling', 'called', 'caller', 'callee', 'mobile', 'cell'];
  const phonePatterns = [];

  // Check property names for phone-like keywords
  allProperties.forEach(prop => {
    const propLower = prop.toLowerCase();
    if (phoneKeywords.some(keyword => propLower.includes(keyword))) {
      phonePatterns.push({
        property: prop,
        type: 'property_name',
        confidence: 'high'
      });
    }
  });

  // Check sample data for phone-like values
  Object.entries(labelSchemas).forEach(([label, schema]) => {
    schema.properties.forEach(prop => {
      schema.sampleData.forEach(sample => {
        const value = sample[prop];
        if (value && isPhoneLike(value)) {
          phonePatterns.push({
            property: prop,
            label: label,
            type: 'data_pattern',
            confidence: 'medium',
            sampleValue: value
          });
        }
      });
    });
  });

  return phonePatterns;
};

// Check if a value looks like a phone number
const isPhoneLike = (value) => {
  const str = String(value);
  // Phone numbers: 10-15 digits, possibly with country code
  return /^\+?[\d\s\-\(\)]{8,15}$/.test(str) && /\d{8,}/.test(str);
};

// Query Intent Recognition
export const recognizeIntent = (query) => {
  const queryLower = query.toLowerCase();
  
  // Phone number lookup
  const phoneMatch = query.match(/(\+?\d[\d\s\-\(\)]{7,14}\d)/);
  if (phoneMatch) {
    return {
      type: 'phone_lookup',
      phoneNumber: phoneMatch[1].replace(/[\s\-\(\)]/g, ''),
      originalQuery: query
    };
  }

  // Pattern analysis
  if (queryLower.includes('pattern') || queryLower.includes('call') && queryLower.includes('analysis')) {
    return {
      type: 'pattern_analysis',
      originalQuery: query
    };
  }

  // Location queries
  if (queryLower.includes('location') || queryLower.includes('where')) {
    return {
      type: 'location_query',
      originalQuery: query
    };
  }

  // General search
  return {
    type: 'general_search',
    originalQuery: query
  };
};

// Dynamic Query Builder
export const buildDynamicQuery = async (intent, schema) => {
  switch (intent.type) {
    case 'phone_lookup':
      return buildPhoneLookupQuery(intent.phoneNumber, schema);
    
    case 'pattern_analysis':
      return buildPatternAnalysisQuery(intent, schema);
    
    case 'location_query':
      return buildLocationQuery(intent, schema);
    
    default:
      return buildGeneralSearchQuery(intent, schema);
  }
};

// Build phone lookup query
const buildPhoneLookupQuery = (phoneNumber, schema) => {
  const queries = [];
  
  // Primary query: Find the Party node and its relationships
  queries.push({
    cypher: `
      MATCH (p:Party {id: $phoneNumber})
      OPTIONAL MATCH (p)-[r1:CALLED]->(called:Party)
      OPTIONAL MATCH (caller:Party)-[r2:CALLED]->(p)
      RETURN p, 
             collect(DISTINCT called.id) as outgoingCalls,
             collect(DISTINCT caller.id) as incomingCalls,
             count(r1) as callsMade,
             count(r2) as callsReceived
    `,
    params: { phoneNumber },
    type: 'detailed_party_analysis'
  });

  // Secondary query: Find any node containing this phone number
  queries.push({
    cypher: `
      MATCH (n) 
      WHERE toString(n.id) = $phoneNumber OR ANY(prop IN keys(n) WHERE toString(n[prop]) CONTAINS $phoneNumber)
      OPTIONAL MATCH (n)-[r]-(connected)
      RETURN n, labels(n) as nodeLabels, 
             collect(DISTINCT {relType: type(r), connectedNode: connected, connectedLabels: labels(connected)}) as relationships
      LIMIT 5
    `,
    params: { phoneNumber },
    type: 'general_search'
  });

  // Location and device queries
  queries.push({
    cypher: `
      MATCH (p:Party {id: $phoneNumber})
      OPTIONAL MATCH (p)-[:USED_IMEI]->(imei:IMEI)
      OPTIONAL MATCH (p)-[:USED_IMSI]->(imsi:IMSI)
      OPTIONAL MATCH (p)-[:LOCATED_AT]->(loc:Location)
      RETURN p, 
             collect(DISTINCT imei.id) as imeiNumbers,
             collect(DISTINCT imsi.id) as imsiNumbers,
             collect(DISTINCT loc.name) as locations
    `,
    params: { phoneNumber },
    type: 'device_location_info'
  });

  return queries;
};

// Build pattern analysis query
const buildPatternAnalysisQuery = (intent, schema) => {
  const queries = [];
  
  // Look for relationship patterns
  if (schema.relationships.length > 0) {
    queries.push({
      cypher: `MATCH (a)-[r]->(b) RETURN type(r) as relType, count(r) as count ORDER BY count DESC LIMIT 10`,
      params: {}
    });
  }

  return queries;
};

// Build location query
const buildLocationQuery = (intent, schema) => {
  const queries = [];
  const locationProps = schema.properties.filter(prop => 
    prop.toLowerCase().includes('location') || 
    prop.toLowerCase().includes('address') ||
    prop.toLowerCase().includes('city') ||
    prop.toLowerCase().includes('area')
  );

  locationProps.forEach(prop => {
    queries.push({
      cypher: `MATCH (n) WHERE n.${prop} IS NOT NULL RETURN DISTINCT n.${prop} as location, count(n) as count ORDER BY count DESC LIMIT 10`,
      params: {}
    });
  });

  return queries;
};

// Build general search query
const buildGeneralSearchQuery = (intent, schema) => {
  return [{
    cypher: `MATCH (n) RETURN labels(n) as nodeLabels, count(n) as count ORDER BY count DESC LIMIT 10`,
    params: {}
  }];
};

// Execute queries and process results
export const executeQueries = async (queries) => {
  const driver = initializeDriver();
  const session = driver.session();
  const results = [];

  try {
    for (const query of queries) {
      try {
        console.log('🔍 Executing query:', query.cypher.replace(/\s+/g, ' ').trim());
        const result = await session.run(query.cypher, query.params);
        
        if (result.records.length > 0) {
          results.push({
            query: query.cypher,
            records: result.records.map(record => record.toObject()),
            type: query.type || 'general',
            success: true
          });
        } else {
          // Even if no records, include the query type for better handling
          results.push({
            query: query.cypher,
            records: [],
            type: query.type || 'general',
            success: true
          });
        }
      } catch (error) {
        console.warn('Query failed:', query.cypher.replace(/\s+/g, ' ').trim(), error.message);
        results.push({
          query: query.cypher,
          error: error.message,
          type: query.type || 'general',
          success: false
        });
      }
    }

    return results;
  } finally {
    await session.close();
  }
};

// Process results into natural language
export const processResults = (results, intent) => {
  if (!results || results.length === 0) {
    return "No data found in the database for your query.";
  }

  const successfulResults = results.filter(r => r.success && r.records.length > 0);
  
  if (successfulResults.length === 0) {
    return "I searched the database but couldn't find any matching records. The database might be empty or the query parameters might need adjustment.";
  }

  let response = "";

  switch (intent.type) {
    case 'phone_lookup':
      response = formatPhoneLookupResponse(successfulResults, intent);
      break;
    case 'pattern_analysis':
      response = formatPatternAnalysisResponse(successfulResults, intent);
      break;
    case 'location_query':
      response = formatLocationResponse(successfulResults, intent);
      break;
    default:
      response = formatGeneralResponse(successfulResults, intent);
  }

  return response;
};

// Format phone lookup response
const formatPhoneLookupResponse = (results, intent) => {
  let response = `📱 **Analysis for ${intent.phoneNumber}**\n\n`;
  let foundData = false;
  
  results.forEach((result) => {
    if (result.records && result.records.length > 0) {
      foundData = true;
      
      result.records.forEach((record) => {
        // Handle detailed party analysis
        if (result.query.includes('outgoingCalls')) {
          const party = record.p;
          const outgoingCalls = record.outgoingCalls || [];
          const incomingCalls = record.incomingCalls || [];
          const callsMade = record.callsMade || 0;
          const callsReceived = record.callsReceived || 0;
          
          response += `🔍 **Party Information:**\n`;
          response += `• **Phone Number:** ${party.properties.id}\n`;
          response += `• **Total Calls Made:** ${callsMade}\n`;
          response += `• **Total Calls Received:** ${callsReceived}\n\n`;
          
          if (outgoingCalls.length > 0) {
            response += `📞 **Outgoing Calls To:**\n`;
            outgoingCalls.slice(0, 10).forEach(number => {
              if (number) response += `• ${number}\n`;
            });
            if (outgoingCalls.length > 10) {
              response += `... and ${outgoingCalls.length - 10} more numbers\n`;
            }
            response += `\n`;
          }
          
          if (incomingCalls.length > 0) {
            response += `📲 **Incoming Calls From:**\n`;
            incomingCalls.slice(0, 10).forEach(number => {
              if (number) response += `• ${number}\n`;
            });
            if (incomingCalls.length > 10) {
              response += `... and ${incomingCalls.length - 10} more numbers\n`;
            }
            response += `\n`;
          }
        }
        
        // Handle device and location info
        if (result.query.includes('imeiNumbers')) {
          const imeiNumbers = record.imeiNumbers || [];
          const imsiNumbers = record.imsiNumbers || [];
          const locations = record.locations || [];
          
          if (imeiNumbers.length > 0 || imsiNumbers.length > 0 || locations.length > 0) {
            response += `📱 **Device & Location Information:**\n`;
            
            if (imeiNumbers.length > 0) {
              response += `• **IMEI Numbers:** ${imeiNumbers.join(', ')}\n`;
            }
            if (imsiNumbers.length > 0) {
              response += `• **IMSI Numbers:** ${imsiNumbers.join(', ')}\n`;
            }
            if (locations.length > 0) {
              response += `• **Locations:** ${locations.join(', ')}\n`;
            }
            response += `\n`;
          }
        }
        
        // Handle general search results
        if (record.nodeLabels && record.relationships) {
          const nodeLabels = record.nodeLabels || [];
          const nodeData = record.n || record;
          const relationships = record.relationships || [];
          
          response += `🔗 **Additional Information:**\n`;
          response += `• **Node Type:** ${nodeLabels.join(', ')}\n`;
          
          if (relationships.length > 0) {
            response += `• **Connected To:**\n`;
            relationships.slice(0, 5).forEach(rel => {
              if (rel.relType && rel.connectedLabels) {
                response += `  - ${rel.relType} → ${rel.connectedLabels.join(',')}\n`;
              }
            });
          }
          response += `\n`;
        }
      });
    }
  });

  if (!foundData) {
    response += `❌ No data found for phone number ${intent.phoneNumber} in the database.\n\n`;
    response += `💡 **Suggestions:**\n`;
    response += `• Check if the number format is correct\n`;
    response += `• Try searching for partial numbers\n`;
    response += `• The number might not be in the current dataset\n`;
  }

  return response;
};

// Format pattern analysis response
const formatPatternAnalysisResponse = (results, intent) => {
  let response = `📊 **Pattern Analysis**\n\n`;
  
  results.forEach(result => {
    if (result.records.length > 0) {
      response += `**Relationship Patterns:**\n`;
      result.records.forEach(record => {
        response += `• ${record.relType}: ${record.count} occurrences\n`;
      });
    }
  });

  return response;
};

// Format location response
const formatLocationResponse = (results, intent) => {
  let response = `📍 **Location Analysis**\n\n`;
  
  results.forEach(result => {
    if (result.records.length > 0) {
      response += `**Locations Found:**\n`;
      result.records.forEach(record => {
        response += `• ${record.location}: ${record.count} records\n`;
      });
    }
  });

  return response;
};

// Format general response
const formatGeneralResponse = (results, intent) => {
  let response = `🔍 **Database Overview**\n\n`;
  
  results.forEach(result => {
    if (result.records.length > 0) {
      response += `**Data Types:**\n`;
      result.records.forEach(record => {
        const labels = Array.isArray(record.nodeLabels) ? record.nodeLabels.join(', ') : record.nodeLabels;
        response += `• ${labels || 'Unknown'}: ${record.count} records\n`;
      });
    }
  });

  return response;
};

// Main query function for chat integration
export const queryNeo4jDatabase = async (userQuery) => {
  try {
    console.log('🚀 Starting Neo4j query for:', userQuery);
    
    // Step 1: Discover schema
    const schema = await discoverSchema();
    
    // Step 2: Recognize intent
    const intent = recognizeIntent(userQuery);
    console.log('🎯 Recognized intent:', intent.type);
    
    // Step 3: Build dynamic queries
    const queries = await buildDynamicQuery(intent, schema);
    console.log('🔧 Built queries:', queries.length);
    
    // Step 4: Execute queries
    const results = await executeQueries(queries);
    
    // Step 5: Process results into natural language
    const response = processResults(results, intent);
    
    return response;
    
  } catch (error) {
    console.error('❌ Neo4j query failed:', error);
    return `I encountered an error while querying the database: ${error.message}. Please check your database connection and try again.`;
  }
};

// Close driver on app shutdown
export const closeDriver = async () => {
  if (driver) {
    await driver.close();
    driver = null;
  }
};

export default { queryNeo4jDatabase, discoverSchema, closeDriver };