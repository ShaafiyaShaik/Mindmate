interface KPIGridProps {
  avgStressWeek: number;
  checkinsWeek: number;
  alertsSent: number;
}

export default function KPIGrid({ avgStressWeek, checkinsWeek, alertsSent }: KPIGridProps) {
  const getStressColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStressBgColor = (score: number) => {
    if (score < 30) return 'bg-green-50 border-green-200';
    if (score < 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-4">
      {/* Avg Stress */}
      <div className={`bg-white rounded-lg p-4 border ${getStressBgColor(avgStressWeek)} shadow-sm`}>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Stress This Week</h3>
        <p className={`text-2xl font-bold ${getStressColor(avgStressWeek)}`}>
          {avgStressWeek}<span className="text-sm text-gray-400">/100</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {avgStressWeek < 30 ? 'Low stress levels' : avgStressWeek < 60 ? 'Moderate stress' : 'High stress levels'}
        </p>
      </div>

      {/* Check-ins */}
      <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Check-ins This Week</h3>
        <p className="text-2xl font-bold text-blue-600">{checkinsWeek}</p>
        <p className="text-xs text-gray-500 mt-1">Conversations completed</p>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Alerts Sent</h3>
        <p className="text-2xl font-bold text-purple-600">{alertsSent}</p>
        <p className="text-xs text-gray-500 mt-1">To counseling team</p>
      </div>
    </div>
  );
}