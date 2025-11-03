'use client';

interface EmotionChartProps {
  data: Array<{
    emotion: string;
    count: number;
  }>;
}

export default function EmotionChart({ data }: EmotionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Frequency</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No emotion data available</p>
            <p className="text-sm mt-1">Continue conversations to see emotion patterns</p>
          </div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
  ];

  const getEmotionColor = (emotion: string) => {
    const index = data.findIndex(d => d.emotion === emotion);
    return colors[index % colors.length];
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'anxious':
        return '😰';
      case 'sad':
        return '😢';
      case 'stressed':
        return '😤';
      case 'calm':
        return '😌';
      case 'happy':
        return '😊';
      case 'angry':
        return '😡';
      case 'worried':
        return '😟';
      case 'excited':
        return '😃';
      case 'tired':
        return '😴';
      case 'frustrated':
        return '😖';
      default:
        return '😐';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Frequency</h3>
      
      <div className="space-y-4">
        {data.slice(0, 6).map((item, index) => {
          const percentage = Math.round((item.count / total) * 100);
          
          return (
            <div key={item.emotion} className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 w-20">
                <span className="text-lg">{getEmotionIcon(item.emotion)}</span>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.emotion}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.count} times</span>
                  <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: getEmotionColor(item.emotion),
                      width: `${percentage}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 6 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Show {data.length - 6} more emotions
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          Based on {total} emotional expressions in your conversations
        </div>
      </div>
    </div>
  );
}