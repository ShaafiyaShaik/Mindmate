'use client';

interface StoryLineCardProps {
  insight: string;
  index: number;
}

export default function StoryLineCard({ insight, index }: StoryLineCardProps) {
  const getInsightIcon = (insight: string) => {
    if (insight.toLowerCase().includes('stress') || insight.toLowerCase().includes('high')) {
      return (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (insight.toLowerCase().includes('sleep') || insight.toLowerCase().includes('night')) {
      return (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    }
    
    if (insight.toLowerCase().includes('exam') || insight.toLowerCase().includes('academic')) {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
    
    if (insight.toLowerCase().includes('low') || insight.toLowerCase().includes('great') || insight.toLowerCase().includes('good')) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    // Default insight icon
    return (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getCardColor = (insight: string) => {
    if (insight.toLowerCase().includes('stress') || insight.toLowerCase().includes('high')) {
      return 'border-amber-200 bg-amber-50';
    }
    
    if (insight.toLowerCase().includes('sleep') || insight.toLowerCase().includes('night')) {
      return 'border-indigo-200 bg-indigo-50';
    }
    
    if (insight.toLowerCase().includes('exam') || insight.toLowerCase().includes('academic')) {
      return 'border-blue-200 bg-blue-50';
    }
    
    if (insight.toLowerCase().includes('low') || insight.toLowerCase().includes('great') || insight.toLowerCase().includes('good')) {
      return 'border-green-200 bg-green-50';
    }
    
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div className={`rounded-lg border-2 ${getCardColor(insight)} p-4 transition-all duration-200 hover:shadow-md cursor-pointer`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getInsightIcon(insight)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-relaxed">
            {insight}
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
              Pattern #{index + 1}
            </span>
            <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
              Show evidence →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}