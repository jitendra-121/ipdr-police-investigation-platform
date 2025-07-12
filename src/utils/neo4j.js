// Browser compatibility check
const isBrowser = typeof window !== 'undefined';

let neo4j = null;
let driver = null;
let cachedSchema = null;

// Neo4j Configuration - Using environment variables
const NEO4J_URI = import.meta.env.NEO4J_URI || "neo4j+s://0d71a2dd.databases.neo4j.io";
const NEO4J_USER = import.meta.env.NEO4J_USER || import.meta.env.NEXT_NEO4J_USERNAME || "neo4j";
const NEO4J_PASS = import.meta.env.NEO4J_PASSWORD || import.meta.env.NEXT_NEO4J_PASSWORD;

// Initialize Neo4j driver with browser compatibility
const initializeDriver = async () => {
  if (isBrowser) {
    console.warn('Neo4j driver not available in browser environment');
    return null;
  }
  
  if (!neo4j) {
    try {
      neo4j = await import('neo4j-driver');
    } catch (error) {
      console.error('Failed to import neo4j-driver:', error);
      return null;
    }
  }
  
  if (!driver && neo4j) {
    driver = neo4j.default.driver(NEO4J_URI, neo4j.default.auth.basic(NEO4J_USER, NEO4J_PASS));
  }
  return driver;
};

// Schema Discovery Service
export const discoverSchema = async () => {
  if (cachedSchema) {
    return cachedSchema;
  }

  if (isBrowser) {
    // Return mock schema for browser environment
    cachedSchema = {
      labels: ['Party', 'Tower', 'Location', 'IMEI', 'IMSI', 'Coordinates', 'Chunk'],
      relationships: ['CALLED', 'LOCATED_AT', 'USED_IMEI', 'USED_IMSI', 'STARTED_AT', 'ENDED_AT', 'HAS_LOCATION', 'BEEN_CALLED'],
      properties: ['id', 'name', 'timestamp', 'latitude', 'longitude'],
      discoveredAt: new Date().toISOString(),
      browserMode: true
    };
    return cachedSchema;
  }

  const driver = await initializeDriver();
  if (!driver) {
    throw new Error('Failed to initialize Neo4j driver');
  }
  
  const session = driver.session();

  try {
    console.log('Discovering database schema...');

    // Discover all node labels
    const labelsResult = await session.run('CALL db.labels()');
    const labels = labelsResult.records.map(record => record.get(0));

    // Discover all relationship types
    const relationshipsResult = await session.run('CALL db.relationshipTypes()');
    const relationships = relationshipsResult.records.map(record => record.get(0));

    // Discover all property keys
    const propertiesResult = await session.run('CALL db.propertyKeys()');
    const properties = propertiesResult.records.map(record => record.get(0));

    cachedSchema = {
      labels,
      relationships,
      properties,
      discoveredAt: new Date().toISOString()
    };

    console.log('Schema discovery complete:', {
      labels: labels.length,
      relationships: relationships.length,
      properties: properties.length
    });

    return cachedSchema;

  } catch (error) {
    console.error('Schema discovery failed:', error);
    throw new Error(`Failed to discover schema: ${error.message}`);
  } finally {
    await session.close();
  }
};

// Query Intent Recognition
export const recognizeIntent = (query) => {
  const queryLower = query.toLowerCase();
  const phoneMatch = query.match(/(\d{8,15})/);
  
  // Location/Tower queries - enhanced detection
  if (queryLower.includes('tower') || queryLower.includes('signal') || queryLower.includes('located') || queryLower.includes('location') || queryLower.includes('where')) {
    return { 
      type: 'location_tower_query', 
      phoneNumber: phoneMatch ? phoneMatch[1] : null, 
      originalQuery: query 
    };
  }
  
  if (phoneMatch || queryLower.includes('who is') || queryLower.includes('who did') || queryLower.includes('call')) {
    return { type: 'phone_lookup', phoneNumber: phoneMatch ? phoneMatch[1] : null, originalQuery: query };
  }
  if (queryLower.includes('pattern') || queryLower.includes('analysis')) {
    return { type: 'pattern_analysis', originalQuery: query };
  }
  return { type: 'general_search', originalQuery: query };
};

// Build comprehensive phone lookup queries - NO LIMITS
const buildPhoneLookupQuery = (phoneNumber, schema) => {
  const queries = [];
  
  if (!phoneNumber) {
    // If no specific phone number, extract from query or search broadly
    queries.push({
      cypher: `
        MATCH (p:Party)
        OPTIONAL MATCH (p)-[:CALLED]->(called:Party)
        OPTIONAL MATCH (caller:Party)-[:CALLED]->(p)
        OPTIONAL MATCH (p)-[r]-(connected)
        RETURN p.id as phoneNumber,
               collect(DISTINCT called.id) as outgoingCalls,
               collect(DISTINCT caller.id) as incomingCalls,
               count(DISTINCT called) as totalOutgoing,
               count(DISTINCT caller) as totalIncoming,
               collect(DISTINCT {type: type(r), node: connected, labels: labels(connected)}) as allConnections
        ORDER BY totalOutgoing + totalIncoming DESC
      `,
      params: {},
      type: 'comprehensive_party_analysis'
    });
    return queries;
  }

  // Comprehensive Party Analysis - Get EVERYTHING
  queries.push({
    cypher: `
      MATCH (p:Party)
      WHERE p.id = $phoneNumber OR p.id CONTAINS $phoneNumber
      OPTIONAL MATCH (p)-[:CALLED]->(called:Party)
      OPTIONAL MATCH (caller:Party)-[:CALLED]->(p)
      OPTIONAL MATCH (p)-[r]-(connected)
      RETURN p,
             collect(DISTINCT called.id) as outgoingCalls,
             collect(DISTINCT caller.id) as incomingCalls,
             count(DISTINCT called) as totalOutgoing,
             count(DISTINCT caller) as totalIncoming,
             collect(DISTINCT {type: type(r), node: connected, labels: labels(connected), properties: connected}) as allConnections
    `,
    params: { phoneNumber },
    type: 'comprehensive_party_analysis'
  });

  // Device and Technical Information - UNLIMITED
  queries.push({
    cypher: `
      MATCH (p:Party)
      WHERE p.id = $phoneNumber OR p.id CONTAINS $phoneNumber
      OPTIONAL MATCH (p)-[:USED_IMEI]->(imei:IMEI)
      OPTIONAL MATCH (p)-[:USED_IMSI]->(imsi:IMSI)
      OPTIONAL MATCH (p)-[:LOCATED_AT|:STARTED_AT|:ENDED_AT|:HAS_LOCATION]->(loc)
      OPTIONAL MATCH (p)-[tower_rel]-(tower:Tower)
      RETURN p,
             collect(DISTINCT {id: imei.id, properties: imei}) as imeiDevices,
             collect(DISTINCT {id: imsi.id, properties: imsi}) as imsiIdentifiers,
             collect(DISTINCT {name: loc.name, properties: loc, labels: labels(loc)}) as allLocations,
             collect(DISTINCT {id: tower.id, relation: type(tower_rel), properties: tower}) as towerConnections
    `,
    params: { phoneNumber },
    type: 'technical_details'
  });

  // Broader search for any mention of the phone number
  queries.push({
    cypher: `
      MATCH (n)
      WHERE ANY(prop IN keys(n) WHERE toString(n[prop]) CONTAINS $phoneNumber)
      OPTIONAL MATCH (n)-[r]-(connected)
      RETURN n, labels(n) as nodeLabels, keys(n) as properties,
             collect(DISTINCT {type: type(r), node: connected, labels: labels(connected), properties: connected}) as relationships
    `,
    params: { phoneNumber },
    type: 'broad_search'
  });

  return queries;
};

// Build pattern analysis queries - UNLIMITED
const buildPatternAnalysisQuery = (intent, schema) => {
  const queries = [];
  
  // Comprehensive relationship analysis
  queries.push({
    cypher: `
      MATCH (a)-[r]->(b)
      RETURN type(r) as relationshipType, 
             labels(a) as sourceLabels, 
             labels(b) as targetLabels,
             count(r) as frequency
      ORDER BY frequency DESC
    `,
    params: {},
    type: 'relationship_patterns'
  });

  // Call frequency patterns
  queries.push({
    cypher: `
      MATCH (caller:Party)-[:CALLED]->(called:Party)
      WITH caller, called, count(*) as callCount
      RETURN caller.id as callerNumber, 
             called.id as calledNumber, 
             callCount
      ORDER BY callCount DESC
    `,
    params: {},
    type: 'call_frequency'
  });

  // Network analysis
  queries.push({
    cypher: `
      MATCH (p:Party)
      OPTIONAL MATCH (p)-[:CALLED]->(out:Party)
      OPTIONAL MATCH (in:Party)-[:CALLED]->(p)
      RETURN p.id as phoneNumber,
             count(DISTINCT out) as outgoingConnections,
             count(DISTINCT in) as incomingConnections,
             count(DISTINCT out) + count(DISTINCT in) as totalConnections
      ORDER BY totalConnections DESC
    `,
    params: {},
    type: 'network_analysis'
  });

  return queries;
};

// Build location queries - UNLIMITED
const buildLocationQuery = (intent, schema) => {
  const queries = [];
  
  // All locations with connections
  queries.push({
    cypher: `
      MATCH (loc:Location)
      OPTIONAL MATCH (loc)-[r]-(connected)
      RETURN loc, keys(loc) as properties,
             collect(DISTINCT {type: type(r), node: connected, labels: labels(connected)}) as connections
    `,
    params: {},
    type: 'location_analysis'
  });

  // Tower analysis
  queries.push({
    cypher: `
      MATCH (tower:Tower)
      OPTIONAL MATCH (tower)-[r]-(connected)
      RETURN tower, keys(tower) as properties,
             collect(DISTINCT {type: type(r), node: connected, labels: labels(connected)}) as connections
    `,
    params: {},
    type: 'tower_analysis'
  });

  // Coordinates analysis
  queries.push({
    cypher: `
      MATCH (coord:Coordinates)
      OPTIONAL MATCH (coord)-[r]-(connected)
      RETURN coord, keys(coord) as properties,
             collect(DISTINCT {type: type(r), node: connected, labels: labels(connected)}) as connections
    `,
    params: {},
    type: 'coordinates_analysis'
  });

  return queries;
};

// Build general search queries - UNLIMITED
const buildGeneralSearchQuery = (intent, schema) => {
  return [
    {
      cypher: `
        MATCH (n)
        RETURN labels(n) as nodeLabels, count(n) as count, 
               collect(DISTINCT keys(n)) as allProperties
        ORDER BY count DESC
      `,
      params: {},
      type: 'database_overview'
    },
    {
      cypher: `
        MATCH (a)-[r]->(b)
        RETURN type(r) as relationshipType, count(r) as count
        ORDER BY count DESC
      `,
      params: {},
      type: 'relationship_overview'
    }
  ];
};

// Build location/tower query
const buildLocationTowerQuery = (phoneNumber, schema) => {
  const queries = [];
  
  if (!phoneNumber) {
    // General tower/location query
    queries.push({
      cypher: `
        MATCH (tower:Tower)
        OPTIONAL MATCH (tower)-[r]-(connected)
        RETURN tower, keys(tower) as properties,
               collect(DISTINCT {type: type(r), node: connected, labels: labels(connected)}) as connections
      `,
      params: {},
      type: 'all_towers'
    });
    return queries;
  }

  // Comprehensive location/tower analysis for specific party
  queries.push({
    cypher: `
      MATCH (p:Party {id: $phoneNumber})
      OPTIONAL MATCH (p)-[r1:LOCATED_AT|:STARTED_AT|:ENDED_AT|:HAS_LOCATION]-(location)
      OPTIONAL MATCH (p)-[r2]-(tower:Tower)
      RETURN p,
             collect(DISTINCT {location: location, relation: type(r1), labels: labels(location), properties: location}) as allLocations,
             collect(DISTINCT {tower: tower, relation: type(r2), properties: tower}) as towerConnections
    `,
    params: { phoneNumber },
    type: 'party_location_analysis'
  });

  // Search for any tower connections
  queries.push({
    cypher: `
      MATCH (tower:Tower)
      OPTIONAL MATCH (tower)-[r]-(party:Party {id: $phoneNumber})
      WHERE party IS NOT NULL
      RETURN tower, type(r) as relationshipType, party,
             keys(tower) as towerProperties
    `,
    params: { phoneNumber },
    type: 'tower_party_connections'
  });

  // Broader search for location data
  queries.push({
    cypher: `
      MATCH (n)
      WHERE ANY(prop IN keys(n) WHERE toString(n[prop]) CONTAINS $phoneNumber)
      OPTIONAL MATCH (n)-[r]-(loc)
      WHERE 'Location' IN labels(loc) OR 'Tower' IN labels(loc) OR 'Coordinates' IN labels(loc)
      RETURN n, labels(n) as nodeLabels,
             collect(DISTINCT {location: loc, relation: type(r), labels: labels(loc), properties: loc}) as locationData
    `,
    params: { phoneNumber },
    type: 'broad_location_search'
  });

  return queries;
};

// Dynamic Query Builder
export const buildDynamicQuery = async (intent, schema) => {
  switch (intent.type) {
    case 'phone_lookup':
      return buildPhoneLookupQuery(intent.phoneNumber, schema);
    case 'location_tower_query':
      return buildLocationTowerQuery(intent.phoneNumber, schema);
    case 'pattern_analysis':
      return buildPatternAnalysisQuery(intent, schema);
    case 'location_query':
      return buildLocationQuery(intent, schema);
    default:
      return [{
        cypher: `MATCH (n) RETURN labels(n) as nodeLabels, count(n) as count ORDER BY count DESC`,
        params: {},
        type: 'database_overview'
      }];
  }
};

// Execute queries and process results
export const executeQueries = async (queries) => {
  if (isBrowser) {
    // Return mock results for browser environment
    console.log('🌐 Browser mode: Returning mock database results');
    return queries.map(query => ({
      query: query.cypher,
      records: generateMockResults(query),
      type: query.type || 'general',
      success: true,
      recordCount: 1,
      browserMode: true
    }));
  }

  const driver = await initializeDriver();
  if (!driver) {
    throw new Error('Failed to initialize Neo4j driver');
  }
  
  const session = driver.session();
  const results = [];

  try {
    for (const query of queries) {
      try {
        console.log('Executing query:', query.cypher.replace(/\s+/g, ' ').trim());
        const result = await session.run(query.cypher, query.params);
        
        results.push({
          query: query.cypher,
          records: result.records.map(record => record.toObject()),
          type: query.type || 'general',
          success: true,
          recordCount: result.records.length
        });
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

// Generate mock results for browser testing
const generateMockResults = (query) => {
  const phoneNumber = query.params?.phoneNumber || '9030463463';
  
  if (query.type === 'comprehensive_party_analysis') {
    return [{
      p: { properties: { id: phoneNumber } },
      outgoingCalls: ['9309347633', '8035062212', '9573580571'],
      incomingCalls: ['9309347633', '8035062212'],
      totalOutgoing: 3,
      totalIncoming: 2,
      allConnections: [
        { type: 'CALLED', labels: ['Party'], node: { properties: { id: '9309347633' } } },
        { type: 'LOCATED_AT', labels: ['Tower'], node: { properties: { id: '405-854-0658D25' } } }
      ]
    }];
  }
  
  if (query.type === 'party_location_analysis') {
    return [{
      p: { properties: { id: phoneNumber } },
      allLocations: [
        { location: { properties: { id: 'Location_001', name: 'Cell Tower Area' } }, labels: ['Location'], relation: 'LOCATED_AT' }
      ],
      towerConnections: [
        { tower: { properties: { id: '405-854-0658D25' } }, relation: 'STARTED_AT' },
        { tower: { properties: { id: '405-854-072B523' } }, relation: 'ENDED_AT' }
      ]
    }];
  }
  
  if (query.type === 'tower_party_connections') {
    return [{
      tower: { properties: { id: '405-854-0658D25' } },
      relationshipType: 'STARTED_AT',
      towerProperties: ['id']
    }];
  }
  
  return [{ message: 'Mock data for browser testing', query: query.type }];
};

// Professional formatting without emojis
const formatPhoneLookupResponse = (results, intent) => {
  let response = `**Analysis for ${intent.phoneNumber || 'Phone Query'}**\n\n`;
  let foundData = false;

  results.forEach((result) => {
    if (result.success && result.records && result.records.length > 0) {
      foundData = true;

      result.records.forEach((record) => {
        // Comprehensive Party Analysis
        if (result.type === 'comprehensive_party_analysis') {
          const party = record.p;
          const outgoingCalls = record.outgoingCalls || [];
          const incomingCalls = record.incomingCalls || [];
          const totalOutgoing = record.totalOutgoing || 0;
          const totalIncoming = record.totalIncoming || 0;
          const allConnections = record.allConnections || [];

          response += `**Party Information**\n`;
          response += `Phone Number: ${party.properties.id}\n`;
          response += `Total Outgoing Calls: ${totalOutgoing}\n`;
          response += `Total Incoming Calls: ${totalIncoming}\n`;
          response += `Total Unique Connections: ${allConnections.length}\n\n`;

          if (outgoingCalls.length > 0) {
            response += `**Outgoing Calls (${outgoingCalls.length} numbers)**\n`;
            outgoingCalls.forEach((number, index) => {
              if (number) response += `${index + 1}. ${number}\n`;
            });
            response += `\n`;
          }

          if (incomingCalls.length > 0) {
            response += `**Incoming Calls (${incomingCalls.length} numbers)**\n`;
            incomingCalls.forEach((number, index) => {
              if (number) response += `${index + 1}. ${number}\n`;
            });
            response += `\n`;
          }

          if (allConnections.length > 0) {
            response += `**All Connections**\n`;
            allConnections.forEach((conn, index) => {
              if (conn.type && conn.labels) {
                response += `${index + 1}. ${conn.type} -> ${conn.labels.join(', ')}\n`;
                if (conn.node && conn.node.properties) {
                  Object.entries(conn.node.properties).forEach(([key, value]) => {
                    if (value && String(value).length < 100) {
                      response += `   ${key}: ${value}\n`;
                    }
                  });
                }
              }
            });
            response += `\n`;
          }
        }

        // Technical Details
        if (result.type === 'technical_details') {
          const imeiDevices = record.imeiDevices || [];
          const imsiIdentifiers = record.imsiIdentifiers || [];
          const allLocations = record.allLocations || [];
          const towerConnections = record.towerConnections || [];

          if (imeiDevices.length > 0 || imsiIdentifiers.length > 0 || allLocations.length > 0 || towerConnections.length > 0) {
            response += `**Technical Information**\n`;

            if (imeiDevices.length > 0) {
              response += `IMEI Devices (${imeiDevices.length}):\n`;
              imeiDevices.forEach((device, index) => {
                response += `${index + 1}. ${device.id}\n`;
              });
              response += `\n`;
            }

            if (imsiIdentifiers.length > 0) {
              response += `IMSI Identifiers (${imsiIdentifiers.length}):\n`;
              imsiIdentifiers.forEach((imsi, index) => {
                response += `${index + 1}. ${imsi.id}\n`;
              });
              response += `\n`;
            }

            if (allLocations.length > 0) {
              response += `Locations (${allLocations.length}):\n`;
              allLocations.forEach((location, index) => {
                response += `${index + 1}. ${location.name || 'Unnamed'} (${location.labels.join(', ')})\n`;
              });
              response += `\n`;
            }

            if (towerConnections.length > 0) {
              response += `Tower Connections (${towerConnections.length}):\n`;
              towerConnections.forEach((tower, index) => {
                response += `${index + 1}. Tower ${tower.id} - ${tower.relation}\n`;
              });
              response += `\n`;
            }
          }
        }

        // Communication Patterns
        if (result.type === 'communication_patterns') {
          const outgoingPattern = record.outgoingPattern || [];
          const incomingPattern = record.incomingPattern || [];

          if (outgoingPattern.length > 0 || incomingPattern.length > 0) {
            response += `**Communication Patterns**\n`;

            if (outgoingPattern.length > 0) {
              response += `Frequent Outgoing Calls:\n`;
              outgoingPattern
                .filter(p => p.number && p.count > 0)
                .sort((a, b) => b.count - a.count)
                .forEach((pattern, index) => {
                  response += `${index + 1}. ${pattern.number} (${pattern.count} calls)\n`;
                });
              response += `\n`;
            }

            if (incomingPattern.length > 0) {
              response += `Frequent Incoming Calls:\n`;
              incomingPattern
                .filter(p => p.number && p.count > 0)
                .sort((a, b) => b.count - a.count)
                .forEach((pattern, index) => {
                  response += `${index + 1}. ${pattern.number} (${pattern.count} calls)\n`;
                });
              response += `\n`;
            }
          }
        }

        // Broad Search Results
        if (result.type === 'broad_search') {
          const nodeLabels = record.nodeLabels || [];
          const nodeProperties = record.properties || [];
          const relationships = record.relationships || [];

          response += `**Additional Data Found**\n`;
          response += `Node Type: ${nodeLabels.join(', ')}\n`;
          response += `Properties: ${nodeProperties.join(', ')}\n`;

          if (record.n && record.n.properties) {
            response += `Data:\n`;
            Object.entries(record.n.properties).forEach(([key, value]) => {
              if (value && String(value).length < 200) {
                response += `  ${key}: ${value}\n`;
              }
            });
          }

          if (relationships.length > 0) {
            response += `Connected to ${relationships.length} other entities\n`;
          }
          response += `\n`;
        }
      });
    }
  });

  if (!foundData) {
    response += `No data found for the specified query in the database.\n\n`;
    response += `**Suggestions:**\n`;
    response += `- Verify the phone number format\n`;
    response += `- Try searching with partial numbers\n`;
    response += `- Check if the data exists in the current dataset\n`;
    response += `- Use broader search terms\n`;
  }

  return response;
};

// Format other response types professionally
const formatPatternAnalysisResponse = (results, intent) => {
  let response = `**Pattern Analysis Results**\n\n`;

  results.forEach(result => {
    if (result.success && result.records.length > 0) {
      if (result.type === 'relationship_patterns') {
        response += `**Relationship Patterns**\n`;
        result.records.forEach(record => {
          response += `${record.relationshipType}: ${record.frequency} occurrences\n`;
          response += `  From: ${record.sourceLabels.join(', ')}\n`;
          response += `  To: ${record.targetLabels.join(', ')}\n\n`;
        });
      }

      if (result.type === 'call_frequency') {
        response += `**Call Frequency Analysis**\n`;
        result.records.slice(0, 20).forEach((record, index) => {
          response += `${index + 1}. ${record.callerNumber} -> ${record.calledNumber} (${record.callCount} calls)\n`;
        });
        response += `\n`;
      }

      if (result.type === 'network_analysis') {
        response += `**Network Analysis - Most Connected Numbers**\n`;
        result.records.slice(0, 15).forEach((record, index) => {
          response += `${index + 1}. ${record.phoneNumber}: ${record.totalConnections} total connections\n`;
          response += `   Outgoing: ${record.outgoingConnections}, Incoming: ${record.incomingConnections}\n`;
        });
        response += `\n`;
      }
    }
  });

  return response;
};

const formatLocationResponse = (results, intent) => {
  let response = `**Location Analysis Results**\n\n`;

  results.forEach(result => {
    if (result.success && result.records.length > 0) {
      if (result.type === 'location_analysis') {
        response += `**Location Data (${result.records.length} locations)**\n`;
        result.records.forEach((record, index) => {
          response += `${index + 1}. Location Properties: ${record.properties.join(', ')}\n`;
          if (record.connections.length > 0) {
            response += `   Connected to: ${record.connections.length} entities\n`;
          }
        });
        response += `\n`;
      }

      if (result.type === 'tower_analysis') {
        response += `**Tower Data (${result.records.length} towers)**\n`;
        result.records.forEach((record, index) => {
          response += `${index + 1}. Tower Properties: ${record.properties.join(', ')}\n`;
          if (record.tower && record.tower.properties) {
            Object.entries(record.tower.properties).forEach(([key, value]) => {
              response += `   ${key}: ${value}\n`;
            });
          }
        });
        response += `\n`;
      }
    }
  });

  return response;
};

const formatGeneralResponse = (results, intent) => {
  let response = `**Database Overview**\n\n`;

  results.forEach(result => {
    if (result.success && result.records.length > 0) {
      if (result.type === 'database_overview') {
        response += `**Data Types in Database**\n`;
        result.records.forEach(record => {
          const labels = Array.isArray(record.nodeLabels) ? record.nodeLabels.join(', ') : record.nodeLabels;
          response += `${labels || 'Unknown'}: ${record.count} records\n`;
          if (record.allProperties && record.allProperties.length > 0) {
            response += `  Properties: ${record.allProperties.flat().join(', ')}\n`;
          }
        });
        response += `\n`;
      }

      if (result.type === 'relationship_overview') {
        response += `**Relationship Types**\n`;
        result.records.forEach(record => {
          response += `${record.relationshipType}: ${record.count} connections\n`;
        });
      }
    }
  });

  return response;
};

const formatLocationTowerResponse = (results, intent) => {
  let response = `**Location and Tower Analysis for ${intent.phoneNumber || 'Query'}**\n\n`;
  let foundData = false;

  results.forEach((result) => {
    if (result.success && result.records && result.records.length > 0) {
      foundData = true;

      result.records.forEach((record) => {
        // Party Location Analysis
        if (result.type === 'party_location_analysis') {
          const party = record.p;
          const allLocations = record.allLocations || [];
          const towerConnections = record.towerConnections || [];

          response += `**Party Information**\n`;
          response += `Phone Number: ${party.properties.id}\n\n`;

          if (allLocations.length > 0) {
            response += `**Location Data (${allLocations.length} locations)**\n`;
            allLocations.forEach((loc, index) => {
              if (loc.location && loc.location.properties) {
                response += `${index + 1}. Location Type: ${loc.labels.join(', ')}\n`;
                response += `   Relationship: ${loc.relation}\n`;
                Object.entries(loc.location.properties).forEach(([key, value]) => {
                  if (value && String(value).length < 200) {
                    response += `   ${key}: ${value}\n`;
                  }
                });
                response += `\n`;
              }
            });
          }

          if (towerConnections.length > 0) {
            response += `**Tower Connections (${towerConnections.length} towers)**\n`;
            towerConnections.forEach((tower, index) => {
              if (tower.tower && tower.tower.properties) {
                response += `${index + 1}. Tower Relationship: ${tower.relation}\n`;
                Object.entries(tower.tower.properties).forEach(([key, value]) => {
                  if (value && String(value).length < 200) {
                    response += `   ${key}: ${value}\n`;
                  }
                });
                response += `\n`;
              }
            });
          }

          if (allLocations.length === 0 && towerConnections.length === 0) {
            response += `No direct location or tower data found for this party.\n\n`;
          }
        }

        // Tower Party Connections
        if (result.type === 'tower_party_connections') {
          const tower = record.tower;
          const relationshipType = record.relationshipType;
          const towerProperties = record.towerProperties || [];

          if (tower && tower.properties) {
            response += `**Tower Connection Found**\n`;
            response += `Relationship Type: ${relationshipType}\n`;
            response += `Tower Properties: ${towerProperties.join(', ')}\n`;
            Object.entries(tower.properties).forEach(([key, value]) => {
              if (value && String(value).length < 200) {
                response += `${key}: ${value}\n`;
              }
            });
            response += `\n`;
          }
        }

        // Broad Location Search
        if (result.type === 'broad_location_search') {
          const nodeLabels = record.nodeLabels || [];
          const locationData = record.locationData || [];

          if (locationData.length > 0) {
            response += `**Additional Location Data Found**\n`;
            response += `Node Type: ${nodeLabels.join(', ')}\n`;
            locationData.forEach((loc, index) => {
              if (loc.location && loc.location.properties) {
                response += `${index + 1}. ${loc.labels.join(', ')} - ${loc.relation}\n`;
                Object.entries(loc.location.properties).forEach(([key, value]) => {
                  if (value && String(value).length < 200) {
                    response += `   ${key}: ${value}\n`;
                  }
                });
              }
            });
            response += `\n`;
          }
        }

        // All Towers
        if (result.type === 'all_towers') {
          const tower = record.tower;
          const properties = record.properties || [];
          const connections = record.connections || [];

          if (tower && tower.properties) {
            response += `**Tower Information**\n`;
            response += `Properties: ${properties.join(', ')}\n`;
            Object.entries(tower.properties).forEach(([key, value]) => {
              if (value && String(value).length < 200) {
                response += `${key}: ${value}\n`;
              }
            });
            if (connections.length > 0) {
              response += `Connected to ${connections.length} entities\n`;
            }
            response += `\n`;
          }
        }
      });
    }
  });

  if (!foundData) {
    response += `No location or tower data found for the specified query.\n\n`;
    response += `**Suggestions:**\n`;
    response += `- Verify the phone number format\n`;
    response += `- Check if location data exists in the current dataset\n`;
    response += `- Try broader search terms\n`;
    response += `- The party might not have location/tower associations\n`;
  }

  return response;
};

// Process results into natural language
export const processResults = (results, intent) => {
  if (!results || results.length === 0) {
    return "No data found in the database for your query.";
  }

  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    return "I searched the database but encountered errors with all queries. Please check the database connection and try again.";
  }

  let response = "";

  switch (intent.type) {
    case 'phone_lookup':
      response = formatPhoneLookupResponse(successfulResults, intent);
      break;
    case 'location_tower_query':
      response = formatLocationTowerResponse(successfulResults, intent);
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

// Main query function for chat integration
export const queryNeo4jDatabase = async (userQuery) => {
  try {
    console.log('Starting Neo4j query for:', userQuery);
    
    // Step 1: Discover schema
    const schema = await discoverSchema();
    
    // Step 2: Recognize intent
    const intent = recognizeIntent(userQuery);
    console.log('Recognized intent:', intent.type);
    
    // Step 3: Build dynamic queries
    const queries = await buildDynamicQuery(intent, schema);
    console.log('Built queries:', queries.length);
    
    // Step 4: Execute queries
    const results = await executeQueries(queries);
    
    // Step 5: Process results into natural language
    const response = processResults(results, intent);
    
    return response;
    
  } catch (error) {
    console.error('Neo4j query failed:', error);
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