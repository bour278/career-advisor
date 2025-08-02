import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Calculator, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useQuestionSubscription } from '@/hooks/use-websocket';
import { apiRequest } from '@/lib/queryClient';
import type { DecisionRecommendation } from '@shared/schema';

interface ZakiAgentProps {
  questionId: string | null;
}

export function ZakiAgent({ questionId }: ZakiAgentProps) {
  const [objectiveWeights, setObjectiveWeights] = useState({
    salary: 40,
    prestige: 25,
    riskTolerance: 60,
    growthPotential: 35
  });

  const queryClient = useQueryClient();
  const { subscribe } = useQuestionSubscription(questionId);

  // Query recommendations
  const { data: recommendations, isLoading } = useQuery<DecisionRecommendation>({
    queryKey: ['/api/recommendations', questionId],
    enabled: !!questionId,
  });

  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      if (!questionId) throw new Error('No question ID');
      return apiRequest('POST', `/api/recommendations/${questionId}`, { objectiveWeights });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', questionId] });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!questionId) return;

    const unsubscribe = subscribe('analysis_started', (message) => {
      if (message.agent === 'zaki') {
        queryClient.invalidateQueries({ queryKey: ['/api/recommendations', questionId] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [questionId, subscribe, queryClient]);

  const handleWeightChange = (key: string, value: number[]) => {
    setObjectiveWeights(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const policyStatus = recommendations?.policyStatus || {
    trainingEpisodes: 0,
    convergence: 0,
    lastUpdated: ''
  };

  const recommendationsList = recommendations?.recommendations || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zaki - Decision Engine</h1>
          <p className="text-lg text-gray-600">RL-based optimal decision recommendations</p>
        </div>
        <Button 
          onClick={() => generateRecommendationsMutation.mutate()}
          disabled={!questionId || generateRecommendationsMutation.isPending}
          className="bg-accent text-white hover:bg-orange-600"
        >
          <Settings className="h-4 w-4 mr-2" />
          {generateRecommendationsMutation.isPending ? 'Configuring...' : 'Configure Goals'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Objective Function Setup */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Objective Function</h3>
              <p className="text-sm text-gray-600 mb-4">Define what matters most in your career decision</p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Salary Weight</label>
                    <span className="text-sm font-medium text-primary">{objectiveWeights.salary}%</span>
                  </div>
                  <Slider
                    value={[objectiveWeights.salary]}
                    onValueChange={(value) => handleWeightChange('salary', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Prestige Weight</label>
                    <span className="text-sm font-medium text-primary">{objectiveWeights.prestige}%</span>
                  </div>
                  <Slider
                    value={[objectiveWeights.prestige]}
                    onValueChange={(value) => handleWeightChange('prestige', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Risk Tolerance</label>
                    <span className="text-sm font-medium text-primary">{objectiveWeights.riskTolerance}%</span>
                  </div>
                  <Slider
                    value={[objectiveWeights.riskTolerance]}
                    onValueChange={(value) => handleWeightChange('riskTolerance', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Growth Potential</label>
                    <span className="text-sm font-medium text-primary">{objectiveWeights.growthPotential}%</span>
                  </div>
                  <Slider
                    value={[objectiveWeights.growthPotential]}
                    onValueChange={(value) => handleWeightChange('growthPotential', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <Button 
                onClick={() => generateRecommendationsMutation.mutate()}
                disabled={!questionId || generateRecommendationsMutation.isPending}
                className="w-full mt-6 bg-accent text-white hover:bg-orange-600"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {generateRecommendationsMutation.isPending ? 'Calculating...' : 'Calculate Optimal Path'}
              </Button>
            </CardContent>
          </Card>

          {/* Policy Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">RL Policy Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Training Episodes</span>
                  <span className="text-sm font-medium">{policyStatus.trainingEpisodes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Convergence</span>
                  <span className="text-sm font-medium text-green-600">{policyStatus.convergence}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">
                    {policyStatus.lastUpdated ? 
                      new Date(policyStatus.lastUpdated).toLocaleTimeString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decision Recommendations */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Optimal Decision Recommendation</h3>
              
              {recommendationsList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {isLoading ? (
                    'Generating recommendations...'
                  ) : (
                    'No recommendations available. Configure your objective weights and calculate optimal path.'
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Recommendation */}
                  {recommendationsList.find(r => r.isOptimal) && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-lg">
                      {(() => {
                        const optimal = recommendationsList.find(r => r.isOptimal)!;
                        return (
                          <>
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                                  Recommended: {optimal.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">Confidence Score: {optimal.confidence}%</p>
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                Score: {optimal.score.toFixed(1)}
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Optimal Strategy:</h5>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {optimal.strategy.map((item, index) => (
                                    <li key={index}>• {item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Expected Outcomes:</h5>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {optimal.outcomes.map((item, index) => (
                                    <li key={index}>• {item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Alternative Options */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Alternative Options</h4>
                    
                    {recommendationsList.filter(r => !r.isOptimal).map((rec, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-gray-900">{rec.title}</h5>
                            <span className="text-sm font-medium text-blue-600">
                              Score: {rec.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Strategy: </span>
                              {rec.strategy[0]}
                            </div>
                            <div>
                              <span className="font-medium">Key Outcome: </span>
                              {rec.outcomes[0]}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Next Steps */}
                  {recommendationsList.find(r => r.isOptimal) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Next Steps (Based on Optimal Path)</h4>
                      <div className="space-y-2">
                        {recommendationsList.find(r => r.isOptimal)!.strategy.slice(0, 3).map((step, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === 0 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <span className={`text-sm ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
