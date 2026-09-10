import React from 'react';

export default function Body() {
  const bmi = 24.5; // Stub
  
  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-6">
      <div>
        <h2 className="text-3xl font-black text-textPrimary tracking-tight">Body</h2>
        <p className="text-textMuted">Track your measurements and BMI.</p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated">
        <h3 className="text-lg font-bold text-textPrimary mb-4">BMI Gauge</h3>
        <div className="flex items-center justify-center gap-8">
          <div className="text-5xl font-black text-primary">{bmi}</div>
          <div className="flex-1 max-w-sm">
            <div className="h-4 w-full bg-surfaceElevated rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500 w-1/4"></div>
              <div className="h-full bg-primary w-1/4"></div>
              <div className="h-full bg-yellow-500 w-1/4"></div>
              <div className="h-full bg-red-500 w-1/4"></div>
            </div>
            <div className="flex justify-between text-xs text-textMuted mt-2">
              <span>Under</span>
              <span>Normal</span>
              <span>Over</span>
              <span>Obese</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-textMuted mt-4 text-center">BMI is a simple height-to-weight ratio. It does not measure body fat directly.</p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated">
        <h3 className="text-lg font-bold text-textPrimary mb-4">Measurements</h3>
        <div className="grid grid-cols-2 gap-4">
          {['Neck', 'Shoulders', 'Chest', 'Biceps', 'Waist', 'Hips', 'Legs'].map(part => (
            <div key={part} className="flex justify-between items-center bg-background p-3 rounded-md border border-surfaceElevated">
              <span className="text-sm font-medium text-textMuted">{part}</span>
              <span className="text-textPrimary font-bold">-- cm</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
