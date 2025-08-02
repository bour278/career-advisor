import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, DollarSign, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CareerChart } from './career-chart';
import { useQuestionSubscription } from '@/hooks/use-websocket';
import { apiRequest } from '@/lib/queryClient';
import type { CareerData } from '@shared/schema';

interface GawiAgentProps {
  questionId: string | null;
}

export function GawiAgent({ questionId }: GawiAgentProps) {
  const queryClient = useQueryClient();
  const { subscribe } = useQuestionSubscription(questionId);

  // Query career data
  const { data: careerData, isLoading } = useQuery<CareerData>({
    queryKey: ['/api/career-data', questionId],
    enabled: !!questionId,
  });

  // Start research mutation
  const startResearchMutation = useMutation({
    mutationFn: async () => {
      if (!questionId) throw new Error('No question ID');
      return apiRequest('POST', `/api/career-data/${questionId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-data', questionId] });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!questionId) return;

    const unsubscribe = subscribe('analysis_started', (message) => {
      if (message.agent === 'gawi') {
        queryClient.invalidateQueries({ queryKey: ['/api/career-data', questionId] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [questionId, subscribe, queryClient]);

  const metrics = careerData?.marketMetrics || {
    avgSalary: 0,
    successRate: 0,
    timeToSenior: 0,
    marketDemand: 'Unknown'
  };

  const metricCards = [
    {
      title: 'Avg PM Salary',
      value: `$${(metrics.avgSalary / 1000).toFixed(0)}K`,
      change: '+8% vs SWE',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate}%`,
      change: 'SWE → PM transitions',
      icon: TrendingUp,
      color: 'text-blue-500'
    },
    {
      title: 'Time to Senior',
      value: `${metrics.timeToSenior} yrs`,
      change: 'Avg promotion time',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      title: 'Market Demand',
      value: metrics.marketDemand,
      change: '+15% job growth',
      icon: BarChart3,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gawi - Data Research Agent</h1>
          <p className="text-lg text-gray-600">Comprehensive career data analysis and trajectory predictions</p>
        </div>
        <Button 
          onClick={() => startResearchMutation.mutate()}
          disabled={!questionId || startResearchMutation.isPending}
          className="bg-secondary text-white hover:bg-green-700"
        >
          <Search className="h-4 w-4 mr-2" />
          {startResearchMutation.isPending ? 'Researching...' : 'New Research'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                  <IconComponent className={`h-5 w-5 ${metric.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className={`text-sm ${metric.color}`}>{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Career Trajectory Visualization */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Career Trajectory Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">Where people with similar profiles ended up after 5 years:</p>
            
            {careerData?.trajectoryData ? (
              <div className="space-y-4">
                {careerData.trajectoryData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.outcome}</span>
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: item.color,
                          width: `${item.percentage}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isLoading ? 'Loading trajectory data...' : 'No data available. Start research to generate insights.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Progression Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Salary Progression Comparison</h3>
            {careerData?.salaryData && careerData.salaryData.length > 0 ? (
              <CareerChart salaryData={careerData.salaryData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                {isLoading ? 'Loading salary data...' : 'No salary data available. Start research to generate insights.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stochastic Path Prediction */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Stochastic Path Prediction</h3>
          <p className="text-gray-600 mb-4">Probability simulation of career paths based on current market conditions and historical data</p>
          
          {careerData?.scenarios ? (
            <div className="grid md:grid-cols-3 gap-6">
              {careerData.scenarios.map((scenario, index) => (
                <div key={index} className="space-y-4">
                  <h4 className="font-medium text-gray-900">Scenario: {scenario.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Probability</span>
                      <span className="font-medium text-green-600">{scenario.successProbability}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>5-Year Income</span>
                      <span className="font-medium">${(scenario.fiveYearIncome / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Level</span>
                      <span className={`font-medium ${
                        scenario.riskLevel === 'Low' || scenario.riskLevel === 'Very Low' ? 'text-green-600' :
                        scenario.riskLevel === 'Medium' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {scenario.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading scenario predictions...' : 'No scenario data available. Start research to generate predictions.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
