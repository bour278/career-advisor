import { Plus, Minus, Lightbulb, TriangleAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { SwotAnalysis } from '@shared/schema';

interface SwotBoardProps {
  analysis: SwotAnalysis | null;
  isUpdating?: boolean;
}

export function SwotBoard({ analysis, isUpdating = false }: SwotBoardProps) {
  const swotSections = [
    {
      title: 'Strengths',
      icon: Plus,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      items: analysis?.strengths || []
    },
    {
      title: 'Weaknesses',
      icon: Minus,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      items: analysis?.weaknesses || []
    },
    {
      title: 'Opportunities',
      icon: Lightbulb,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      items: analysis?.opportunities || []
    },
    {
      title: 'Threats',
      icon: TriangleAlert,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      items: analysis?.threats || []
    }
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">SWOT Analysis Board</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {analysis ? `Last updated: ${new Date(analysis.updatedAt!).toLocaleTimeString()}` : 'No analysis yet'}
          </span>
          {isUpdating && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
        {swotSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card
              key={section.title}
              className={`${section.color} border-2 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <IconComponent className={`mr-3 h-6 w-6 ${section.iconColor}`} />
                  <h4 className={`text-lg font-semibold ${section.textColor}`}>
                    {section.title}
                  </h4>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {section.items.length === 0 ? (
                    <div className="text-sm text-gray-500 italic flex items-center justify-center h-full">
                      {isUpdating ? 'Analyzing...' : 'No items yet'}
                    </div>
                  ) : (
                    <ul className={`space-y-3 text-sm ${section.textColor}`}>
                      {section.items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {analysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-700 flex items-center">
            <TriangleAlert className="h-4 w-4 mr-2 text-gray-500" />
            Status: <span className="ml-1 font-medium capitalize">{analysis.conversationStatus}</span>
          </p>
        </div>
      )}
    </div>
  );
}
