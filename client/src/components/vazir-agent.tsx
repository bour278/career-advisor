import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, RotateCcw, Users, Download, Share, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { SwotBoard } from './swot-board';
import { apiRequest } from '@/lib/queryClient';
import type { SwotAnalysis } from '@shared/schema';

export function VazirAgent() {
  const [question, setQuestion] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [swotAnalysis, setSwotAnalysis] = useState<SwotAnalysis | null>(null);

  const startAnalysisMutation = useMutation({
    mutationFn: async () => {
      const requestData = {
        question: question.trim() || "General career guidance and SWOT analysis",
        currentRole: currentRole.trim() || "Professional", 
        targetRole: targetRole.trim() || "Advanced Professional"
      };
      
      return apiRequest('POST', '/api/swot-analysis', requestData);
    },
    onSuccess: (data: any) => {
      console.log('API Response:', data);
      // Handle different possible response structures
      if (data.analysis) {
        setSwotAnalysis(data.analysis);
      } else if (data.strengths || data.weaknesses || data.opportunities || data.threats) {
        setSwotAnalysis(data);
      } else {
        console.error('Unexpected response structure:', data);
      }
    },
  });

  const conversationSteps = [
    { name: 'LLM-1: Strengths Analysis' },
    { name: 'LLM-2: Weaknesses Assessment' },
    { name: 'LLM-3: Opportunities Research' },
    { name: 'LLM-4: Threats Analysis' },
  ];

  const getStepStatus = (index: number) => {
    if (startAnalysisMutation.isPending) {
      if (index === 0) return 'active';
      return 'pending';
    }
    if (swotAnalysis) {
      return 'completed';
    }
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
          disabled={startAnalysisMutation.isPending}
          className="bg-primary text-white hover:bg-blue-700"
        >
          <Users className="h-4 w-4 mr-2" />
          {startAnalysisMutation.isPending ? 'Starting...' : 'New Analysis'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
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
                  disabled={startAnalysisMutation.isPending}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {startAnalysisMutation.isPending ? 'Starting Conversation...' : 'Start LLM Conversation'}
                </Button>
              </div>
            </CardContent>
          </Card>

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
                          {status === 'active' ? 'Processing...' : status === 'completed' ? 'Done' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {swotAnalysis && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-primary flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Analysis complete
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <SwotBoard 
            analysis={swotAnalysis} 
            isUpdating={startAnalysisMutation.isPending}
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