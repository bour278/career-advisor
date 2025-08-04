import { storage } from '../storage';
import { generateSwotAnalysis, generateConversationResponse } from './openai';
import type { CareerQuestion, SwotAnalysis, AgentConversation } from '@shared/schema';

export class VazirAgent {
  async startSwotAnalysis(questionId?: string, customData?: { question?: string, currentRole?: string, targetRole?: string }): Promise<SwotAnalysis> {
    let question;
    
    if (questionId) {
      question = await storage.getCareerQuestion(questionId);
      if (!question) {
        throw new Error('Career question not found');
      }
    } else {
      // Create a question using custom data or defaults
      const questionData = {
        question: customData?.question || "General career guidance and SWOT analysis",
        currentRole: customData?.currentRole || "Professional",
        targetRole: customData?.targetRole || "Advanced Professional"
      };
      
      console.log(`\x1b[34m📋 Creating new question with custom data:\x1b[0m`);
      console.log(`\x1b[34m   Question: ${questionData.question}\x1b[0m`);
      console.log(`\x1b[34m   Current Role: ${questionData.currentRole}\x1b[0m`);
      console.log(`\x1b[34m   Target Role: ${questionData.targetRole}\x1b[0m`);
      
      question = await storage.createCareerQuestion(questionData);
      questionId = question.id;
    }

    // Generate initial SWOT analysis
    const swotResult = await generateSwotAnalysis(
      question.question,
      question.currentRole || undefined,
      question.targetRole || undefined
    );

    // Create or update SWOT analysis
    let swotAnalysis = await storage.getSwotAnalysis(questionId);
    if (swotAnalysis) {
      swotAnalysis = await storage.updateSwotAnalysis(questionId, {
        ...swotResult,
        conversationStatus: 'active'
      });
    } else {
      swotAnalysis = await storage.createSwotAnalysis({
        questionId,
        ...swotResult,
        conversationStatus: 'active'
      });
    }

    // Start LLM conversation
    await this.startLLMConversation(questionId, question);

    return swotAnalysis!;
  }

  private async startLLMConversation(questionId: string, question: CareerQuestion): Promise<void> {
    const conversation = await storage.createAgentConversation({
      questionId,
      agentType: 'vazir',
      messages: [{
        role: 'system',
        content: 'Starting multi-LLM SWOT analysis conversation',
        timestamp: new Date().toISOString()
      }],
      status: 'active'
    });

    // Simulate LLM conversation rounds
    const swotSections: Array<'strengths' | 'weaknesses' | 'opportunities' | 'threats'> = 
      ['strengths', 'weaknesses', 'opportunities', 'threats'];

    let callCount = 0;
    const maxCalls = 10;

    for (const section of swotSections) {
      if (callCount >= maxCalls) {
        await storage.updateSwotAnalysis(questionId, {
          conversationStatus: 'converged'
        });
        break;
      }

      const response = await generateConversationResponse(
        'vazir',
        `Question: ${question.question}\nCurrent Role: ${question.currentRole}\nTarget Role: ${question.targetRole}`,
        conversation.messages || [],
        section
      );

      callCount++;

      const newMessage = {
        role: `LLM-${section}`,
        content: response.content,
        timestamp: new Date().toISOString()
      };

      await storage.updateAgentConversation(conversation.id, {
        messages: [...(conversation.messages || []), newMessage]
      });
    }
  }

  async getConversationStatus(questionId: string): Promise<AgentConversation | undefined> {
    return storage.getAgentConversation(questionId, 'vazir');
  }
}

// Export agent instances
export const vazirAgent = new VazirAgent();
