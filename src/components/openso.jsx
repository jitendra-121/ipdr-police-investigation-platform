'use client';
import React, { useState } from 'react';
import { OpenAI } from 'openai';

import driver from './../lib/neo4j'

function extractCypher(raw) {  // Keep only Cypher-looking lines
  const cypherLines = raw
    .split('\n')
    .filter(
      (line) =>
        line.trim().startsWith('MATCH') ||
        line.trim().startsWith('RETURN') ||
        line.trim().startsWith('WITH') ||
        line.trim().startsWith('CALL') ||
        line.trim().startsWith('MERGE') ||
        line.trim().startsWith('UNWIND') ||
        line.trim().startsWith('CREATE')
    );

  return cypherLines.join('\n');
}

const OpenChat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [cypherQuery, setCypherQuery] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Use OpenAI API with environment variable
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      const baseUrl = "https://api.openai.com"
      
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [...messages, { role: 'user', content: userMessage }],
          max_tokens: 500,
        }),
      });

      if (!res.ok) {
        throw new Error(`GitHub Models API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const aiResponse = data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from GitHub Models API');
      }

      console.log('✅ GitHub Models API Response:', aiResponse);
      setResponse(aiResponse);

      // Step 2: Extract Cypher query
      console.log('🔍 Step 2: Extracting Cypher query...');
      const cleaned = extractCypher(aiResponse);
      
      if (!cleaned.trim()) {
        throw new Error('No valid Cypher query found in GitHub Models API response');
      }

      console.log('✅ Extracted Cypher:', cleaned);
      setCypherQuery(cleaned);

      // Step 3: Execute Cypher query on Neo4j
      console.log('🕸️ Step 3: Executing Cypher query on Neo4j...');
      
      // Check if Neo4j driver is available
      if (!driver) {
        throw new Error('Neo4j driver not initialized properly');
      }
      
      const session = driver.session();
      try {
        console.log('🔗 Connecting to Neo4j database...');
      const resp = await session.run(cleaned);
        console.log('✅ Neo4j Response:', resp);
        
      const output = resp.records.map((record) => record.toObject());
        console.log('✅ Processed Results:', output);
        
      setResult(output);
        
        if (output.length === 0) {
          setError('Query executed successfully but returned no results. The database might be empty or the query conditions are too restrictive.');
        } else {
          console.log(`🎉 Successfully retrieved ${output.length} records from Neo4j`);
        }
        
      } catch (dbError) {
        console.error('❌ Neo4j Database Error:', dbError);
        throw new Error(`Database query failed: ${dbError.message}`);
      } finally {
        await session.close();
        console.log('🔒 Neo4j session closed');
      }

    } catch (err) {
      console.error('❌ Error:', err);
      setError(`Error: ${err.message}`);
      setResponse('Error occurred while processing your query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h2 className="text-xl font-bold">CDR Investigation Chat</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <textarea
          rows={4}
          className="w-full border p-2 rounded-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me something about CDR data... (e.g., 'Find phone numbers called by multiple people', 'Who is 9876543210?')"
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer disabled:bg-gray-400" 
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Processing...' : 'Submit Query'}
        </button>
      </form>

      {/* Loading indicator */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processing your query...</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded">
          <strong className="text-red-800">Error:</strong>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="bg-green-50 border border-green-200 p-3 rounded">
          <strong className="text-green-800">AI Generated Response:</strong>
          <pre className="text-green-700 text-sm mt-2 whitespace-pre-wrap">{response}</pre>
        </div>
      )}

      {/* Generated Cypher Query */}
      {cypherQuery && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
          <strong className="text-yellow-800">Generated Cypher Query:</strong>
          <pre className="text-yellow-700 text-sm mt-2 bg-gray-100 p-2 rounded">{cypherQuery}</pre>
        </div>
      )}

      {/* Results from Database */}
      {result.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <strong className="text-blue-800">Database Results ({result.length} records):</strong>
          <div className="max-h-96 overflow-y-auto mt-2">
            <pre className="text-blue-700 text-sm bg-white p-2 rounded border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenChat;