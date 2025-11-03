'use client';

import { useMemo } from 'react';

interface TrendChartProps {
  data: Array<{
    date: string;
    stress: number | null;
    sentiment: number | null;
    checkIns: number;
  }>;
  timeRange: string;
}

export default function TrendChart({ data, timeRange }: TrendChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { points: [], maxStress: 100, hasData: false };

    const validPoints = data.filter(d => d.stress !== null);
    const maxStress = Math.max(...validPoints.map(d => d.stress || 0), 50);
    
    return {
      points: data,
      maxStress: Math.max(maxStress, 100),
      hasData: validPoints.length > 0
    };
  }, [data]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStressColor = (stress: number) => {
    if (stress >= 70) return '#dc2626'; // red-600
    if (stress >= 50) return '#d97706'; // amber-600
    return '#16a34a'; // green-600
  };

  const generatePath = () => {
    if (!chartData.hasData) return '';
    
    const validPoints = chartData.points.filter(d => d.stress !== null);
    if (validPoints.length === 0) return '';

    const width = 400;
    const height = 200;
    const padding = 20;
    
    const xStep = (width - 2 * padding) / (chartData.points.length - 1);
    
    let path = '';
    validPoints.forEach((point, index) => {
      const x = padding + (chartData.points.findIndex(p => p.date === point.date) * xStep);
      const y = height - padding - ((point.stress! / chartData.maxStress) * (height - 2 * padding));
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  if (!chartData.hasData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No data available for the selected time range</p>
            <p className="text-sm mt-1">Start conversations to see your stress trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Trends</h3>
      
      <div className="relative">
        <svg viewBox="0 0 400 240" className="w-full h-64">
          {/* Grid lines */}
          {[25, 50, 75].map(value => {
            const y = 220 - ((value / chartData.maxStress) * 180);
            return (
              <g key={value}>
                <line x1="20" y1={y} x2="380" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x="10" y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end">
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* Stress trend line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.points.map((point, index) => {
            if (point.stress === null) return null;
            
            const x = 20 + (index * (360 / (chartData.points.length - 1)));
            const y = 220 - ((point.stress / chartData.maxStress) * 180);
            
            return (
              <g key={point.date}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={getStressColor(point.stress)}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Tooltip area */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="transparent"
                  className="hover:fill-gray-100 hover:fill-opacity-50 cursor-pointer"
                >
                  <title>{`${formatDate(point.date)}: ${point.stress} stress, ${point.checkIns} check-ins`}</title>
                </circle>
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {chartData.points.map((point, index) => {
            if (index % Math.ceil(chartData.points.length / 5) !== 0) return null;
            
            const x = 20 + (index * (360 / (chartData.points.length - 1)));
            return (
              <text
                key={point.date}
                x={x}
                y="235"
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {formatDate(point.date)}
              </text>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Low stress (0-49)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Medium stress (50-69)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">High stress (70+)</span>
          </div>
        </div>
      </div>
    </div>
  );
}