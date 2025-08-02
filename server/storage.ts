import { 
  type User, type InsertUser,
  type CareerQuestion, type InsertCareerQuestion,
  type SwotAnalysis, type InsertSwotAnalysis,
  type AgentConversation, type InsertAgentConversation,
  type CareerData, type InsertCareerData,
  type DecisionRecommendation, type InsertDecisionRecommendation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Career Question methods
  createCareerQuestion(question: InsertCareerQuestion): Promise<CareerQuestion>;
  getCareerQuestion(id: string): Promise<CareerQuestion | undefined>;
  getCareerQuestionsByUser(userId: string): Promise<CareerQuestion[]>;

  // SWOT Analysis methods
  createSwotAnalysis(analysis: InsertSwotAnalysis): Promise<SwotAnalysis>;
  getSwotAnalysis(questionId: string): Promise<SwotAnalysis | undefined>;
  updateSwotAnalysis(questionId: string, updates: Partial<SwotAnalysis>): Promise<SwotAnalysis | undefined>;

  // Agent Conversation methods
  createAgentConversation(conversation: InsertAgentConversation): Promise<AgentConversation>;
  getAgentConversation(questionId: string, agentType: string): Promise<AgentConversation | undefined>;
  updateAgentConversation(id: string, updates: Partial<AgentConversation>): Promise<AgentConversation | undefined>;

  // Career Data methods
  createCareerData(data: InsertCareerData): Promise<CareerData>;
  getCareerData(questionId: string): Promise<CareerData | undefined>;
  updateCareerData(questionId: string, updates: Partial<CareerData>): Promise<CareerData | undefined>;

  // Decision Recommendation methods
  createDecisionRecommendation(recommendation: InsertDecisionRecommendation): Promise<DecisionRecommendation>;
  getDecisionRecommendation(questionId: string): Promise<DecisionRecommendation | undefined>;
  updateDecisionRecommendation(questionId: string, updates: Partial<DecisionRecommendation>): Promise<DecisionRecommendation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private careerQuestions: Map<string, CareerQuestion>;
  private swotAnalyses: Map<string, SwotAnalysis>;
  private agentConversations: Map<string, AgentConversation>;
  private careerData: Map<string, CareerData>;
  private decisionRecommendations: Map<string, DecisionRecommendation>;

  constructor() {
    this.users = new Map();
    this.careerQuestions = new Map();
    this.swotAnalyses = new Map();
    this.agentConversations = new Map();
    this.careerData = new Map();
    this.decisionRecommendations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCareerQuestion(insertQuestion: InsertCareerQuestion): Promise<CareerQuestion> {
    const id = randomUUID();
    const question: CareerQuestion = {
      ...insertQuestion,
      id,
      userId: insertQuestion.userId || null,
      createdAt: new Date(),
    };
    this.careerQuestions.set(id, question);
    return question;
  }

  async getCareerQuestion(id: string): Promise<CareerQuestion | undefined> {
    return this.careerQuestions.get(id);
  }

  async getCareerQuestionsByUser(userId: string): Promise<CareerQuestion[]> {
    return Array.from(this.careerQuestions.values()).filter(q => q.userId === userId);
  }

  async createSwotAnalysis(insertAnalysis: InsertSwotAnalysis): Promise<SwotAnalysis> {
    const id = randomUUID();
    const analysis: SwotAnalysis = {
      ...insertAnalysis,
      id,
      updatedAt: new Date(),
    };
    this.swotAnalyses.set(id, analysis);
    return analysis;
  }

  async getSwotAnalysis(questionId: string): Promise<SwotAnalysis | undefined> {
    return Array.from(this.swotAnalyses.values()).find(a => a.questionId === questionId);
  }

  async updateSwotAnalysis(questionId: string, updates: Partial<SwotAnalysis>): Promise<SwotAnalysis | undefined> {
    const existing = await this.getSwotAnalysis(questionId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.swotAnalyses.set(existing.id, updated);
    return updated;
  }

  async createAgentConversation(insertConversation: InsertAgentConversation): Promise<AgentConversation> {
    const id = randomUUID();
    const conversation: AgentConversation = {
      ...insertConversation,
      id,
      createdAt: new Date(),
    };
    this.agentConversations.set(id, conversation);
    return conversation;
  }

  async getAgentConversation(questionId: string, agentType: string): Promise<AgentConversation | undefined> {
    return Array.from(this.agentConversations.values()).find(
      c => c.questionId === questionId && c.agentType === agentType
    );
  }

  async updateAgentConversation(id: string, updates: Partial<AgentConversation>): Promise<AgentConversation | undefined> {
    const existing = this.agentConversations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.agentConversations.set(id, updated);
    return updated;
  }

  async createCareerData(insertData: InsertCareerData): Promise<CareerData> {
    const id = randomUUID();
    const data: CareerData = {
      ...insertData,
      id,
      updatedAt: new Date(),
    };
    this.careerData.set(id, data);
    return data;
  }

  async getCareerData(questionId: string): Promise<CareerData | undefined> {
    return Array.from(this.careerData.values()).find(d => d.questionId === questionId);
  }

  async updateCareerData(questionId: string, updates: Partial<CareerData>): Promise<CareerData | undefined> {
    const existing = await this.getCareerData(questionId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.careerData.set(existing.id, updated);
    return updated;
  }

  async createDecisionRecommendation(insertRecommendation: InsertDecisionRecommendation): Promise<DecisionRecommendation> {
    const id = randomUUID();
    const recommendation: DecisionRecommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date(),
    };
    this.decisionRecommendations.set(id, recommendation);
    return recommendation;
  }

  async getDecisionRecommendation(questionId: string): Promise<DecisionRecommendation | undefined> {
    return Array.from(this.decisionRecommendations.values()).find(r => r.questionId === questionId);
  }

  async updateDecisionRecommendation(questionId: string, updates: Partial<DecisionRecommendation>): Promise<DecisionRecommendation | undefined> {
    const existing = await this.getDecisionRecommendation(questionId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.decisionRecommendations.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
