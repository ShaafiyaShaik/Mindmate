'use client';

interface TimeRangeSelectorProps {
  value: '7' | '30' | '90';
  onChange: (value: '7' | '30' | '90') => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const options = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' }
  ] as const;

  return (
    <div className="flex bg-white border border-gray-200 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            value === option.value
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}