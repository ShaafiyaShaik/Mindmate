'use client';

interface FilterTag {
  key: string;
  label: string;
  icon?: string;
  count?: number;
}

interface FilterTagsProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
  availableTags?: FilterTag[];
}

const DEFAULT_TAGS: FilterTag[] = [
  { key: 'all', label: 'All', icon: '📚' },
  { key: 'exam', label: 'Exam', icon: '📝' },
  { key: 'sleep', label: 'Sleep', icon: '😴' },
  { key: 'focus', label: 'Focus', icon: '🎯' },
  { key: 'stress', label: 'Stress', icon: '😰' },
  { key: 'counseling', label: 'Counseling', icon: '🗣️' },
  { key: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
  { key: 'time_management', label: 'Time Management', icon: '⏰' },
  { key: 'crisis', label: 'Crisis', icon: '🆘' },
  { key: 'anxiety', label: 'Anxiety', icon: '😟' }
];

export default function FilterTags({ 
  selectedTags, 
  onToggle, 
  availableTags = DEFAULT_TAGS 
}: FilterTagsProps) {
  
  const handleTagClick = (tagKey: string) => {
    if (tagKey === 'all') {
      // Clear all selections
      onToggle('all');
    } else {
      onToggle(tagKey);
    }
  };

  const isSelected = (tagKey: string) => {
    if (tagKey === 'all') {
      return selectedTags.length === 0;
    }
    return selectedTags.includes(tagKey);
  };

  return (
    <div className="flex flex-wrap gap-2 p-1">
      {availableTags.map((tag) => {
        const selected = isSelected(tag.key);
        
        return (
          <button
            key={tag.key}
            onClick={() => handleTagClick(tag.key)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-all duration-200 hover:scale-105
              ${selected
                ? 'bg-soft-blue-500 text-white shadow-medium'
                : 'bg-white/90 text-warm-gray-700 border border-sage-200 hover:border-soft-blue-300 hover:bg-soft-blue-50'
              }
            `}
            aria-pressed={selected}
          >
            {tag.icon && (
              <span className="text-base" role="img" aria-hidden="true">
                {tag.icon}
              </span>
            )}
            <span>{tag.label}</span>
            {tag.count !== undefined && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${selected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-sage-100 text-warm-gray-500'
                }
              `}>
                {tag.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}