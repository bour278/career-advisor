import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, RotateCcw, Users, Download, Share, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { SwotBoard } from './swot-board';
import { useQuestionSubscription } from '@/hooks/use-websocket';
import { apiRequest } from '@/lib/queryClient';
import type { SwotAnalysis, AgentConversation } from '@shared/schema';

interface VazirAgentProps {
  questionId: string | null;
}

export function VazirAgent({ questionId }: VazirAgentProps) {
  const [question, setQuestion] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const queryClient = useQueryClient();
  
  const { subscribe } = useQuestionSubscription(questionId);

  // Query SWOT analysis
  const { data: swotAnalysis, isLoading: swotLoading } = useQuery<SwotAnalysis>({
    queryKey: ['/api/swot-analysis', questionId],
    enabled: !!questionId,
  });

  // Query conversation status
  const { data: conversation } = useQuery<AgentConversation>({
    queryKey: ['/api/conversations', questionId, 'vazir'],
    enabled: !!questionId,
  });

  // Start SWOT analysis mutation
  const startAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!questionId) throw new Error('No question ID');
      return apiRequest('POST', `/api/swot-analysis/${questionId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/swot-analysis', questionId] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', questionId, 'vazir'] });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!questionId) return;

    const unsubscribe = subscribe('analysis_started', (message) => {
      if (message.agent === 'vazir') {
        queryClient.invalidateQueries({ queryKey: ['/api/swot-analysis', questionId] });
      }
    });

    const unsubscribeProgress = subscribe('conversation_progress', (message) => {
      if (message.agent === 'vazir') {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations', questionId, 'vazir'] });
        queryClient.invalidateQueries({ queryKey: ['/api/swot-analysis', questionId] });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeProgress();
    };
  }, [questionId, subscribe, queryClient]);

  const conversationSteps = [
    { name: 'LLM-1: Strengths Analysis', status: 'completed', distance: 0.23 },
    { name: 'LLM-2: Weaknesses Assessment', status: 'completed', distance: 0.31 },
    { name: 'LLM-3: Opportunities Research', status: 'active', distance: null },
    { name: 'LLM-4: Threats Analysis', status: 'pending', distance: null },
  ];

  const getStepStatus = (index: number) => {
    const messages = conversation?.messages || [];
    if (index < messages.length - 1) return 'completed';
    if (index === messages.length - 1) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vazir - SWOT Analysis Agent</h1>
          <p className="text-lg text-gray-600">Multi-LLM conversation framework for comprehensive SWOT analysis</p>
        </div>
        <Button 
          onClick={() => startAnalysisMutation.mutate()}
          disabled={!questionId || startAnalysisMutation.isPending}
          className="bg-primary text-white hover:bg-blue-700"
        >
          <Users className="h-4 w-4 mr-2" />
          {startAnalysisMutation.isPending ? 'Starting...' : 'New Analysis'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Question</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your career situation and the decision you're facing..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-32 resize-none"
                />
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Role
                    </label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Product Manager"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => startAnalysisMutation.mutate()}
                  disabled={!questionId || startAnalysisMutation.isPending}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {startAnalysisMutation.isPending ? 'Starting Conversation...' : 'Start LLM Conversation'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Progress */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Conversation</h3>
              <div className="space-y-3">
                {conversationSteps.map((step, index) => {
                  const status = getStepStatus(index);
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'active' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : status === 'active' ? (
                          <RotateCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          status === 'pending' ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {status === 'completed' && step.distance ? 
                            `Semantic distance: ${step.distance}` :
                            status === 'active' ? 'Processing...' : 'Pending'
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-primary flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Conversation complete
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SWOT Analysis Board */}
        <div className="lg:col-span-2">
          <SwotBoard 
            analysis={swotAnalysis || null} 
            isUpdating={startAnalysisMutation.isPending || swotLoading}
          />
          
          {swotAnalysis && (
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <Button className="bg-secondary text-white hover:bg-green-700">
                <ArrowRight className="h-4 w-4 mr-2" />
                Send to Gawi
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
