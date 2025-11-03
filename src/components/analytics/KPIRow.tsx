'use client';

interface KPIRowProps {
  data: {
    avgStress: number;
    totalCheckIns: number;
    improvementPercent: number;
    range: number;
  };
}

export default function KPIRow({ data }: KPIRowProps) {
  const getStressColor = (stress: number) => {
    if (stress >= 70) return 'text-red-600 bg-red-50';
    if (stress >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600 bg-green-50';
    if (improvement < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getImprovementText = (improvement: number) => {
    if (improvement > 0) return `${improvement}% better`;
    if (improvement < 0) return `${Math.abs(improvement)}% higher stress`;
    return 'No change';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Average Stress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Stress ({data.range}d)</p>
            <p className={`text-3xl font-bold mt-2 ${getStressColor(data.avgStress).split(' ')[0]}`}>
              {data.avgStress}
            </p>
            <p className="text-xs text-gray-500 mt-1">out of 100</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStressColor(data.avgStress)}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Check-ins Count */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Check-ins</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{data.totalCheckIns}</p>
            <p className="text-xs text-gray-500 mt-1">conversations</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Week-over-week Improvement */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Week-over-Week</p>
            <p className={`text-xl font-bold mt-2 ${getImprovementColor(data.improvementPercent).split(' ')[0]}`}>
              {getImprovementText(data.improvementPercent)}
            </p>
            <p className="text-xs text-gray-500 mt-1">stress change</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getImprovementColor(data.improvementPercent)}`}>
            {data.improvementPercent > 0 ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : data.improvementPercent < 0 ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}