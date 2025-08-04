import BlurdLogo from './ui/logo';
import { useState } from 'react';
import { Brain, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', subtitle: '' },
    { id: 'vazir', label: 'Vazir', subtitle: '(SWOT)' },
    { id: 'gawi', label: 'Gawi', subtitle: '(Research)' },
    { id: 'zaki', label: 'Zaki', subtitle: '(Decide)' },
  ];

  return (
    <header className="glass-effect shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-primary flex items-center">
              <BlurdLogo />
            </div>
          </div>
          
          {/* Tab Navigation */}
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'tab-active text-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {tab.label}{' '}
                {tab.subtitle && (
                  <span className="text-xs text-gray-400">{tab.subtitle}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
          </div>
        </div>
      </div>
    </header>
  );
}