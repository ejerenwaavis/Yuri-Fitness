import React from 'react';

interface CircularProgressRingProps {
  percentage: number;
  label?: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgressRing({
  percentage = 72,
  label = 'Weekly Progress',
  sublabel = '4 of 5 sessions',
  size = 140,
  strokeWidth = 10
}: CircularProgressRingProps) {
  const clampedPercent = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="bg-surface p-5 rounded-2xl border border-surfaceElevated shadow-lg flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-surfaceElevated"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-primary transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(124, 255, 61, 0.4))'
            }}
          />
        </svg>

        {/* Centered Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-textPrimary tracking-tight">
            {clampedPercent}%
          </span>
        </div>
      </div>

      {/* Label and Sublabel below ring */}
      <div className="mt-3 space-y-0.5">
        <h4 className="text-sm font-bold text-textPrimary tracking-tight">
          {label}
        </h4>
        {sublabel && (
          <p className="text-xs text-textMuted font-medium">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
