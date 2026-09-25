import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: string;
  showLabel?: boolean;
  labelPosition?: 'right' | 'top' | 'inside';
  className?: string;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 'h-3.5',
  showLabel = true,
  labelPosition = 'right',
  className = '',
  animate = true,
}) => {
  const safePercent = Math.min(100, Math.max(0, Math.round(percentage)));

  // Color dynamic based on progress
  let barColor = 'bg-blue-600';
  let textColor = 'text-blue-700';

  if (safePercent >= 100) {
    barColor = 'bg-emerald-600';
    textColor = 'text-emerald-700';
  } else if (safePercent >= 75) {
    barColor = 'bg-blue-600';
    textColor = 'text-blue-700';
  } else if (safePercent >= 40) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  } else {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-700';
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold">
          <span className="text-slate-600">Progres Dokumen Wajib</span>
          <span className={textColor}>{safePercent}%</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex-1 bg-slate-200 rounded-full overflow-hidden ${height} shadow-inner`}>
          <div
            className={`${height} ${barColor} rounded-full ${
              animate ? 'transition-all duration-700 ease-out' : ''
            }`}
            style={{ width: `${safePercent}%` }}
          />
        </div>

        {showLabel && labelPosition === 'right' && (
          <span className={`text-sm font-bold min-w-[3.5rem] text-right ${textColor}`}>
            {safePercent}%
          </span>
        )}
      </div>
    </div>
  );
};
