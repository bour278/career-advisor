import { storage } from '../storage';
import { generateSwotAnalysis, generateConversationResponse } from './anthropic';
import type { CareerQuestion, SwotAnalysis, AgentConversation } from '@shared/schema';

export class VazirAgent {
  async startSwotAnalysis(questionId: string): Promise<SwotAnalysis> {
    const question = await storage.getCareerQuestion(questionId);
    if (!question) {
      throw new Error('Career question not found');
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
