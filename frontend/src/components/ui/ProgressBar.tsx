"use client";

import * as Progress from "@radix-ui/react-progress";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">{percentage}%</span>
        </div>
      )}
      <Progress.Root
        className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200"
        value={percentage}
      >
        <Progress.Indicator
          className="h-full rounded-full bg-indigo-600 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </Progress.Root>
    </div>
  );
}
