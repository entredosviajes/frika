interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`text-2xl ${streak > 0 ? "animate-pulse" : "grayscale"}`}
        role="img"
        aria-label="streak"
      >
        {"\uD83D\uDD25"}
      </span>
      <span className="text-xl font-bold text-gray-900">{streak}</span>
      <span className="text-sm text-gray-500">
        day{streak !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
