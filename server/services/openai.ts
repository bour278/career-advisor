import OpenAI from 'openai';
import { config } from "dotenv";

// Ensure environment variables are loaded
config({ path: "keys.env" });

const DEFAULT_MODEL_STR = "gpt-4";

const apiKey = process.env.OPENAI_API_KEY || "default_key";

// Debug logging for API key
console.log('🔍 Environment check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('  Keys from env:', Object.keys(process.env).filter(k => k.includes('OPENAI')));

// Log API key status with colors
if (apiKey === "default_key") {
  console.log(`\x1b[31m🔑 WARNING: No OpenAI API key found! Using default key.\x1b[0m`);
  console.log(`\x1b[33m   Set OPENAI_API_KEY in your keys.env file\x1b[0m`);
} else {
  console.log(`\x1b[32m🔑 OpenAI API key loaded: ${apiKey.substring(0, 8)}...\x1b[0m`);
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function generateSwotAnalysis(question: string, currentRole?: string, targetRole?: string): Promise<{
  strengths: string[],
  weaknesses: string[],
  opportunities: string[],
  threats: string[]
}> {
  console.log(`\x1b[34m🤖 Generating SWOT analysis with OpenAI GPT...\x1b[0m`);
  console.log(`\x1b[36m   Question: ${question}\x1b[0m`);
  console.log(`\x1b[36m   Current Role: ${currentRole || 'Not specified'}\x1b[0m`);
  console.log(`\x1b[36m   Target Role: ${targetRole || 'Not specified'}\x1b[0m`);

  const prompt = `
Analyze the following career decision and provide a comprehensive SWOT analysis.

Career Question: ${question}
Current Role: ${currentRole || 'Not specified'}
Target Role: ${targetRole || 'Not specified'}

Please provide a detailed SWOT analysis in JSON format with the following structure:
{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...],
  "threats": ["threat 1", "threat 2", ...]
}

Focus on:
- Professional skills and experience
- Market conditions and trends
- Personal factors and circumstances
- Industry-specific considerations
- Transition risks and benefits
`;

  try {
    console.log(`\x1b[34m📡 Making API call to OpenAI...\x1b[0m`);
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });
    
    console.log(`\x1b[32m✅ Received response from OpenAI API\x1b[0m`);
    const content = response.choices[0].message.content || '';
    console.log(`\x1b[35m📄 Response content: ${content.substring(0, 200)}...\x1b[0m`);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      console.log(`\x1b[32m✅ Successfully parsed SWOT analysis JSON\x1b[0m`);
      return result;
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.log(`\x1b[31m❌ OpenAI API error: ${error.message}\x1b[0m`);
    throw new Error(`Failed to generate SWOT analysis: ${error.message}`);
  }
}

export async function generateConversationResponse(
  agentType: 'vazir' | 'gawi' | 'zaki',
  context: string,
  previousMessages: {role: string, content: string}[],
  swotSection?: 'strengths' | 'weaknesses' | 'opportunities' | 'threats'
): Promise<{
  content: string,
}> {
  let systemPrompt = '';
  
  switch (agentType) {
    case 'vazir':
      systemPrompt = `You are Vazir, a specialized SWOT analysis agent. Your role is to analyze career decisions through collaborative conversation with other LLM agents. 
      ${swotSection ? `Focus specifically on ${swotSection} analysis.` : ''}
      Provide detailed, actionable insights based on the career context provided.
      Be concise but thorough in your analysis.`;
      break;
    case 'gawi':
      systemPrompt = `You are Gawi, a data research agent specializing in career market analysis. 
      Provide insights about salary data, career trajectories, market trends, and quantitative analysis.
      Focus on data-driven insights and statistical trends.`;
      break;
    case 'zaki':
      systemPrompt = `You are Zaki, a decision optimization agent using reinforcement learning principles.
      Analyze the provided information and suggest optimal decision paths based on risk-reward analysis.
      Consider multiple scenarios and their probability outcomes.`;
      break;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Context: ${context}\n\nPrevious conversation:\n${previousMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nProvide your analysis and insights.` }
  ];

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL_STR,
    max_tokens: 1024,
    messages,
  });

  return {
    content: response.choices[0].message.content || '',
  };
}
