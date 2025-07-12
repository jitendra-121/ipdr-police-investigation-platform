import OpenAI from 'openai';

// OpenAI API Configuration (Hardcoded)
const openai = new OpenAI({
  baseURL: "https://api.openai.com/v1",
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Send a message to OpenAI and get a response
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<string>} - The AI response
 */
export const sendMessageToOpenAI = async (message, conversationHistory = []) => {
  try {
    // Check if OpenAI API is configured
    if (!openai.apiKey) {
      return "⚠️ OpenAI API key not configured. Please check the hardcoded configuration.";
    }

    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that provides clear and concise responses."
      },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 401) {
      return "🔐 Authentication failed with OpenAI API. Please check the API key configuration.";
    } else if (error.status === 429) {
      return "⏰ Rate limit exceeded. Please wait a moment before trying again.";
    } else if (error.status === 500) {
      return "🛠️ OpenAI API is experiencing issues. Please try again later.";
    } else {
      return "⚠️ OpenAI API error occurred. Please try again.";
    }
  }
};

/**
 * Analyze uploaded file content with OpenAI
 * @param {string} fileContent - The content of the uploaded file
 * @param {string} fileName - The name of the file
 * @returns {Promise<string>} - Analysis results
 */
export const analyzeFileWithOpenAI = async (fileContent, fileName) => {
  try {
    const analysisPrompt = `Analyze this ${fileName} file for a police investigation. Look for:
1. Suspicious patterns
2. Key contacts or numbers
3. Time-based anomalies
4. Geographic patterns
5. Communication frequency analysis

File content:
${fileContent.substring(0, 2000)}...`; // Limit content to avoid token limits

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a digital forensics expert analyzing evidence for police investigations. Provide detailed, actionable insights."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('File Analysis Error:', error);
    return "Unable to analyze file with AI at this time. Please use manual analysis tools.";
  }
};

export default { sendMessageToOpenAI, analyzeFileWithOpenAI };