import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, Search, FolderCog, ChevronRight, CheckCircle, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface OverviewProps {
  onTabChange: (tab: string) => void;
  onQuestionSubmit: (question: string, currentRole: string, targetRole: string) => void;
}

export function Overview({ onTabChange, onQuestionSubmit }: OverviewProps) {
  const [question, setQuestion] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const handleSubmit = () => {
    if (question.trim()) {
      onQuestionSubmit(question, currentRole, targetRole);
    }
  };

  const agentCards = [
    {
      id: 'vazir',
      title: 'Vazir',
      subtitle: 'SWOT Analysis',
      icon: Brain,
      color: 'bg-blue-100 text-primary',
      description: 'Multi-agent framework that creates and updates SWOT analysis through LLM conversations.',
      status: 'Ready',
      statusColor: 'text-success'
    },
    {
      id: 'gawi',
      title: 'Gawi',
      subtitle: 'Data Research',
      icon: Search,
      color: 'bg-green-100 text-secondary',
      description: 'Searches for relevant data: salaries, career trajectories, and predictive simulations.',
      status: 'Ready',
      statusColor: 'text-success'
    },
    {
      id: 'zaki',
      title: 'Zaki',
      subtitle: 'Decision Engine',
      icon: FolderCog,
      color: 'bg-orange-100 text-accent',
      description: 'RL-based agent that recommends optimal decisions based on your goals and objectives.',
      status: 'Needs Input',
      statusColor: 'text-warning'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Career Decision Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Get AI-powered insights to make informed career decisions using our three specialized agents.
        </p>
        
        {/* Agent Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {agentCards.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <Card
                key={agent.id}
                className="agent-card cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => onTabChange(agent.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${agent.color} rounded-lg flex items-center justify-center mr-4`}>
                      <IconComponent className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agent.title}</h3>
                      <p className="text-sm text-gray-500">{agent.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    {agent.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${agent.statusColor} flex items-center`}>
                      {agent.status === 'Ready' ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      {agent.status}
                    </span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                      {agent.id === 'vazir' ? 'Start Analysis' : 
                       agent.id === 'gawi' ? 'Research' : 'Configure'} →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Input Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Start: Ask Your Career Question
          </h2>
          <div className="grid gap-4">
            <Textarea
              placeholder="e.g., Should I switch from software engineering to product management? I'm currently at a mid-level position..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-24 resize-none"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Software Engineer"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Product Manager"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={!question.trim()}
                className="bg-primary text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Analyze All Agents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
