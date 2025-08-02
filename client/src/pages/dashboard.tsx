import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Overview } from '@/components/overview';
import { VazirAgent } from '@/components/vazir-agent';
import { GawiAgent } from '@/components/gawi-agent';
import { ZakiAgent } from '@/components/zaki-agent';
import { useWebSocket } from '@/hooks/use-websocket';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  
  const { send } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createQuestionMutation = useMutation({
    mutationFn: async ({ question, currentRole, targetRole }: {
      question: string;
      currentRole: string;
      targetRole: string;
    }) => {
      const response = await apiRequest('POST', '/api/career-questions', {
        question,
        currentRole,
        targetRole
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentQuestionId(data.id);
      toast({
        title: "Career question created",
        description: "Your question has been submitted. You can now run analysis with the agents.",
      });
      
      // Send WebSocket message to start all analyses
      send({
        type: 'start_analysis',
        questionId: data.id,
        agent: 'all'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create career question",
        variant: "destructive",
      });
    }
  });

  const handleQuestionSubmit = (question: string, currentRole: string, targetRole: string) => {
    createQuestionMutation.mutate({ question, currentRole, targetRole });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onTabChange={setActiveTab} onQuestionSubmit={handleQuestionSubmit} />;
      case 'vazir':
        return <VazirAgent questionId={currentQuestionId} />;
      case 'gawi':
        return <GawiAgent questionId={currentQuestionId} />;
      case 'zaki':
        return <ZakiAgent questionId={currentQuestionId} />;
      default:
        return <Overview onTabChange={setActiveTab} onQuestionSubmit={handleQuestionSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}
