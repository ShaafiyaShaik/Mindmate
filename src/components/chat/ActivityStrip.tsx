import { useState, useEffect } from 'react';

interface ActivityStripProps {
  isTyping: boolean;
}

interface Agent {
  name: string;
  status: 'idle' | 'analyzing' | 'working' | 'complete';
  task: string;
  icon: string;
}

export default function ActivityStrip({ isTyping }: ActivityStripProps) {
  const [agents, setAgents] = useState<Agent[]>([
    { name: 'Sentiment Analyzer', status: 'idle', task: 'Emotion detection', icon: '🎭' },
    { name: 'Stress Monitor', status: 'idle', task: 'Stress assessment', icon: '📊' },
    { name: 'Resource Agent', status: 'idle', task: 'Resource matching', icon: '📚' },
    { name: 'Crisis Detector', status: 'idle', task: 'Safety monitoring', icon: '🛡️' },
  ]);

  useEffect(() => {
    if (isTyping) {
      // Simulate agent activity
      const sequence = [
        { agentIndex: 0, status: 'analyzing' as const, delay: 100 },
        { agentIndex: 1, status: 'analyzing' as const, delay: 300 },
        { agentIndex: 0, status: 'working' as const, delay: 800 },
        { agentIndex: 2, status: 'analyzing' as const, delay: 1200 },
        { agentIndex: 3, status: 'analyzing' as const, delay: 1400 },
        { agentIndex: 1, status: 'complete' as const, delay: 1600 },
        { agentIndex: 0, status: 'complete' as const, delay: 1800 },
        { agentIndex: 2, status: 'working' as const, delay: 2000 },
        { agentIndex: 3, status: 'complete' as const, delay: 2200 },
        { agentIndex: 2, status: 'complete' as const, delay: 2400 },
      ];

      sequence.forEach(({ agentIndex, status, delay }) => {
        setTimeout(() => {
          setAgents(prev => prev.map((agent, index) => 
            index === agentIndex ? { ...agent, status } : agent
          ));
        }, delay);
      });

      // Reset after typing is done
      setTimeout(() => {
        setAgents(prev => prev.map(agent => ({ ...agent, status: 'idle' })));
      }, 3000);
    }
  }, [isTyping]);

  if (!isTyping) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'bg-yellow-400';
      case 'working': return 'bg-blue-400';
      case 'complete': return 'bg-green-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'analyzing': return 'Analyzing...';
      case 'working': return 'Processing...';
      case 'complete': return 'Complete';
      default: return 'Idle';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 font-medium">MindMate is thinking...</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {agents.map((agent, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm">{agent.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-700">{agent.name}</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(agent.status)} ${
                    agent.status === 'analyzing' || agent.status === 'working' ? 'animate-pulse' : ''
                  }`}></div>
                  <span className="text-xs text-gray-500">{getStatusText(agent.status)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}