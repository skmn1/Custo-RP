import React from 'react';

export default function OnboardingProgress({ steps }) {
  if (!steps || steps.length === 0) return null;

  const required = steps.filter((s) => s.isRequired);
  const completed = required.filter((s) => s.status === 'completed');
  const total = required.length;
  const done = completed.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percent === 100 ? 'bg-green-500' : percent >= 50 ? 'bg-blue-500' : 'bg-orange-400'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {done}/{total} ({percent}%)
      </span>
    </div>
  );
}
