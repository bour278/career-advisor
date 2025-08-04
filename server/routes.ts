import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { vazirAgent } from "./services/agents";
import { insertCareerQuestionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Career Questions API
  app.post("/api/career-questions", async (req, res) => {
    try {
      const data = insertCareerQuestionSchema.parse(req.body);
      const question = await storage.createCareerQuestion(data);
      res.json(question);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/career-questions/:id", async (req, res) => {
    try {
      const question = await storage.getCareerQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // SWOT Analysis API
  app.post("/api/swot-analysis/:questionId?", async (req, res) => {
    try {
      const { questionId } = req.params;
      const customData = req.body; // Get custom question data from request body
      
      console.log(`\x1b[36m🚀 Starting SWOT analysis${questionId ? ` for question: ${questionId}` : ' with custom question'}\x1b[0m`);
      if (customData?.question) {
        console.log(`\x1b[35m📝 Custom question: ${customData.question}\x1b[0m`);
      }
      
      const analysis = await vazirAgent.startSwotAnalysis(questionId, customData);
      console.log(`\x1b[32m✅ SWOT analysis completed successfully\x1b[0m`);
      
      res.json(analysis);
    } catch (error) {
      console.log(`\x1b[31m❌ SWOT analysis failed:\x1b[0m`);
      console.log(`\x1b[31m   Error: ${error.message}\x1b[0m`);
      console.log(`\x1b[33m   Stack: ${error.stack}\x1b[0m`);
      res.status(400).json({ error: error.message });
    }
  });

  // Add route for starting analysis without question ID
  app.post("/api/swot-analysis", async (req, res) => {
    try {
      const customData = req.body; // Get custom question data from request body
      
      console.log(`\x1b[36m🚀 Starting SWOT analysis with custom question\x1b[0m`);
      if (customData?.question) {
        console.log(`\x1b[35m📝 Custom question: ${customData.question}\x1b[0m`);
      }
      
      const analysis = await vazirAgent.startSwotAnalysis(undefined, customData);
      console.log(`\x1b[32m✅ SWOT analysis completed successfully\x1b[0m`);
      
      res.json(analysis);
    } catch (error) {
      console.log(`\x1b[31m❌ SWOT analysis failed:\x1b[0m`);
      console.log(`\x1b[31m   Error: ${error.message}\x1b[0m`);
      console.log(`\x1b[33m   Stack: ${error.stack}\x1b[0m`);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/swot-analysis/:questionId", async (req, res) => {
    try {
      const analysis = await storage.getSwotAnalysis(req.params.questionId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Career Data API
  app.post("/api/career-data/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      // Simplified response - Gawi agent temporarily disabled
      const mockData = {
        questionId,
        salaryData: [],
        trajectoryData: [],
        marketMetrics: {
          avgSalary: 0,
          successRate: 0,
          timeToSenior: 0,
          marketDemand: 'Coming Soon'
        },
        scenarios: []
      };
      res.json(mockData);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/career-data/:questionId", async (req, res) => {
    try {
      const data = await storage.getCareerData(req.params.questionId);
      if (!data) {
        return res.status(404).json({ error: "Career data not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Decision Recommendations API
  app.post("/api/recommendations/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      const { objectiveWeights } = req.body;
      
      // Simplified response - Zaki agent temporarily disabled
      const mockRecommendations = {
        questionId,
        objectiveWeights: objectiveWeights || {},
        recommendations: [{
          title: 'Analysis Coming Soon',
          score: 0,
          confidence: 0,
          strategy: ['Zaki agent is being updated'],
          outcomes: ['Please use Vazir agent for now'],
          isOptimal: false
        }],
        policyStatus: {
          trainingEpisodes: 0,
          convergence: 0,
          lastUpdated: new Date().toISOString()
        }
      };
      res.json(mockRecommendations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/recommendations/:questionId", async (req, res) => {
    try {
      const recommendations = await storage.getDecisionRecommendation(req.params.questionId);
      if (!recommendations) {
        return res.status(404).json({ error: "Recommendations not found" });
      }
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Agent Conversation API
  app.get("/api/conversations/:questionId/:agentType", async (req, res) => {
    try {
      const { questionId, agentType } = req.params;
      const conversation = await storage.getAgentConversation(questionId, agentType);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different WebSocket message types
        switch (data.type) {
          case 'subscribe':
            // Subscribe to updates for a specific question
            ws.questionId = data.questionId;
            break;
            
          case 'start_analysis':
            // Broadcast analysis start
            broadcastToSubscribers(data.questionId, {
              type: 'analysis_started',
              agent: data.agent,
              timestamp: new Date().toISOString()
            });
            break;
            
          case 'conversation_update':
            // Broadcast conversation updates
            broadcastToSubscribers(data.questionId, {
              type: 'conversation_progress',
              agent: data.agent,
              message: data.message,
              semanticDistance: data.semanticDistance,
              timestamp: new Date().toISOString()
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  function broadcastToSubscribers(questionId: string, message: any) {
    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN && client.questionId === questionId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
