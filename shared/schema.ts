import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const careerQuestions = pgTable("career_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  question: text("question").notNull(),
  currentRole: text("current_role"),
  targetRole: text("target_role"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const swotAnalyses = pgTable("swot_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").references(() => careerQuestions.id),
  strengths: json("strengths").$type<string[]>().default([]),
  weaknesses: json("weaknesses").$type<string[]>().default([]),
  opportunities: json("opportunities").$type<string[]>().default([]),
  threats: json("threats").$type<string[]>().default([]),
  conversationStatus: text("conversation_status").default("pending"), // pending, active, converged
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agentConversations = pgTable("agent_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").references(() => careerQuestions.id),
  agentType: text("agent_type").notNull(), // vazir, gawi, zaki
  messages: json("messages").$type<{role: string, content: string, timestamp: string}[]>().default([]),
  status: text("status").default("pending"), // pending, active, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const careerData = pgTable("career_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").references(() => careerQuestions.id),
  salaryData: json("salary_data").$type<{role: string, years: number[], salaries: number[]}[]>().default([]),
  trajectoryData: json("trajectory_data").$type<{outcome: string, percentage: number, color: string}[]>().default([]),
  marketMetrics: json("market_metrics").$type<{
    avgSalary: number,
    successRate: number,
    timeToSenior: number,
    marketDemand: string
  }>(),
  scenarios: json("scenarios").$type<{
    name: string,
    successProbability: number,
    fiveYearIncome: number,
    riskLevel: string
  }[]>().default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const decisionRecommendations = pgTable("decision_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").references(() => careerQuestions.id),
  objectiveWeights: json("objective_weights").$type<{
    salary: number,
    prestige: number,
    riskTolerance: number,
    growthPotential: number
  }>().notNull(),
  recommendations: json("recommendations").$type<{
    title: string,
    score: number,
    confidence: number,
    strategy: string[],
    outcomes: string[],
    isOptimal: boolean
  }[]>().default([]),
  policyStatus: json("policy_status").$type<{
    trainingEpisodes: number,
    convergence: number,
    lastUpdated: string
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCareerQuestionSchema = createInsertSchema(careerQuestions).pick({
  question: true,
  currentRole: true,
  targetRole: true,
}).extend({
  userId: z.string().optional(),
});

export const insertSwotAnalysisSchema = createInsertSchema(swotAnalyses).omit({
  id: true,
  updatedAt: true,
});

export const insertAgentConversationSchema = createInsertSchema(agentConversations).omit({
  id: true,
  createdAt: true,
});

export const insertCareerDataSchema = createInsertSchema(careerData).omit({
  id: true,
  updatedAt: true,
});

export const insertDecisionRecommendationSchema = createInsertSchema(decisionRecommendations).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCareerQuestion = z.infer<typeof insertCareerQuestionSchema>;
export type CareerQuestion = typeof careerQuestions.$inferSelect;

export type InsertSwotAnalysis = z.infer<typeof insertSwotAnalysisSchema>;
export type SwotAnalysis = typeof swotAnalyses.$inferSelect;

export type InsertAgentConversation = z.infer<typeof insertAgentConversationSchema>;
export type AgentConversation = typeof agentConversations.$inferSelect;

export type InsertCareerData = z.infer<typeof insertCareerDataSchema>;
export type CareerData = typeof careerData.$inferSelect;

export type InsertDecisionRecommendation = z.infer<typeof insertDecisionRecommendationSchema>;
export type DecisionRecommendation = typeof decisionRecommendations.$inferSelect;
