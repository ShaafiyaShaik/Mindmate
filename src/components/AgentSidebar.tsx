'use client';

import { useState, useEffect } from 'react';

interface AgentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'active' | 'processing';
  lastActivity: string;
}

export default function AgentSidebar({ isOpen, onClose }: AgentSidebarProps) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'data-observer',
      name: 'Data Observer',
      description: 'Continuously collects behavioral and interaction data securely',
      status: 'active',
      lastActivity: 'Monitoring student interactions'
    },
    {
      id: 'mood-analyzer',
      name: 'Mood Analyzer', 
      description: 'Uses NLP and pattern detection to derive emotional states',
      status: 'active',
      lastActivity: 'Analyzing conversation sentiment'
    },
    {
      id: 'wellness-planner',
      name: 'Wellness Planner',
      description: 'Suggests personalized interventions and schedule adjustments',
      status: 'idle',
      lastActivity: 'Generated study break suggestion'
    },
    {
      id: 'counselor-interface',
      name: 'Counselor Interface',
      description: 'Aggregates anonymized data and alerts human counselors',
      status: 'idle',
      lastActivity: 'Last alert: 2 hours ago'
    },
    {
      id: 'institutional-insights',
      name: 'Institutional Insights',
      description: 'Builds predictive models for campus stress patterns',
      status: 'processing',
      lastActivity: 'Processing weekly trends'
    }
  ]);

  // Simulate agent activity changes
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        // Randomly change status occasionally
        if (Math.random() < 0.1) {
          const statuses: ('idle' | 'active' | 'processing')[] = ['idle', 'active', 'processing'];
          const currentIndex = statuses.indexOf(agent.status);
          const newStatus = statuses[(currentIndex + 1) % statuses.length];
          
          return {
            ...agent,
            status: newStatus,
            lastActivity: getActivityMessage(agent.name, newStatus)
          };
        }
        return agent;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const getActivityMessage = (agentName: string, status: string) => {
    const messages = {
      'Data Observer': {
        active: 'Collecting interaction patterns',
        processing: 'Analyzing behavioral data',
        idle: 'Standby mode'
      },
      'Mood Analyzer': {
        active: 'Processing language signals',
        processing: 'Deep sentiment analysis',
        idle: 'Waiting for input'
      },
      'Wellness Planner': {
        active: 'Generating recommendations',
        processing: 'Optimizing intervention plan',
        idle: 'Ready to assist'
      },
      'Counselor Interface': {
        active: 'Preparing alert summary',
        processing: 'Anonymizing data',
        idle: 'Monitoring thresholds'
      },
      'Institutional Insights': {
        active: 'Building predictive models',
        processing: 'Analyzing campus trends',
        idle: 'Background processing'
      }
    };
    
    return messages[agentName as keyof typeof messages]?.[status as keyof typeof messages['Data Observer']] || 'Operating normally';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'processing': return 'Processing';
      case 'idle': return 'Idle';
      default: return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-warm-gray-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white/80 backdrop-blur-xl shadow-xl z-50 transform transition-all duration-500 border-l border-sage-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-lavender-500/90 to-soft-blue-500/90 backdrop-blur-sm text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xs"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">AI Agent System</h2>
                  <p className="text-lavender-100 text-sm">Multi-agent wellness intelligence</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Agent List */}
        <div className="p-6 space-y-4 h-full overflow-y-auto">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="card card-hover animate-fade-in"
              style={{ animationDelay: `${agents.indexOf(agent) * 100}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(agent.status)} z-10 relative`}></div>
                  {agent.status === 'active' && (
                    <div className="absolute inset-0 w-4 h-4 bg-success-400 rounded-full animate-ping opacity-25"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-warm-gray-800">{agent.name}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      agent.status === 'active' ? 'bg-success-100 text-success-700' :
                      agent.status === 'processing' ? 'bg-soft-blue-100 text-soft-blue-700' :
                      'bg-warm-gray-100 text-warm-gray-600'
                    }`}>
                      {getStatusText(agent.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-warm-gray-600 mb-3 leading-relaxed">{agent.description}</p>
                  
                  <div className="bg-gradient-to-r from-sage-50 to-soft-blue-50 p-3 rounded-xl border border-sage-200/50">
                    <span className="text-xs font-medium text-warm-gray-500">Current Activity:</span>
                    <div className="text-xs text-warm-gray-700 mt-1">{agent.lastActivity}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* System Status */}
          <div className="card bg-gradient-to-br from-soft-blue-50 to-lavender-50 border-soft-blue-200/50 mt-8">
            <h4 className="font-display font-semibold text-soft-blue-800 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              System Performance
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-soft-blue-700">Active Agents</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-soft-blue-200 rounded-full overflow-hidden">
                    <div className="w-8/12 h-full bg-gradient-to-r from-soft-blue-400 to-soft-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-soft-blue-800">
                    {agents.filter(a => a.status === 'active').length}/5
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-soft-blue-700">Processing Load</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-soft-blue-200 rounded-full overflow-hidden">
                    <div className="w-5/12 h-full bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-soft-blue-800">
                    {agents.filter(a => a.status === 'processing').length}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-soft-blue-700">Response Time</span>
                <span className="text-sm font-medium text-success-700">~1.2s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-soft-blue-700">Uptime</span>
                <span className="text-sm font-medium text-success-700">99.9%</span>
              </div>
            </div>
          </div>

          {/* Demo Note */}
          <div className="card bg-gradient-to-br from-warm-gray-50 to-sage-50 border-warm-gray-200/50">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-warm-gray-300 rounded-full flex items-center justify-center">
                <span className="text-warm-gray-600 text-sm">ℹ️</span>
              </div>
              <div>
                <h4 className="font-medium text-warm-gray-700 mb-2">Demo Environment</h4>
                <p className="text-xs text-warm-gray-600 leading-relaxed">
                  Agent activity is simulated for demonstration. In production, this would 
                  show real-time AI processing, decision-making, and intervention status with 
                  full integration to campus systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}