interface Weakness {
  id: string;
  tagName: string;
  errorCount: number;
  resolvedAt: string | null;
}

interface WeaknessChartProps {
  weaknesses: Weakness[];
}

export default function WeaknessChart({ weaknesses }: WeaknessChartProps) {
  if (!weaknesses.length) {
    return <p className="text-sm text-gray-500">No weaknesses tracked yet.</p>;
  }

  const maxCount = Math.max(...weaknesses.map((w) => w.errorCount));

  return (
    <div className="space-y-3">
      {weaknesses.map((w) => {
        const width = maxCount > 0 ? (w.errorCount / maxCount) * 100 : 0;
        const resolved = !!w.resolvedAt;

        return (
          <div key={w.id} className={resolved ? "opacity-50" : ""}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="capitalize text-gray-700">
                {w.tagName}
                {resolved && (
                  <span className="ml-2 text-xs text-green-600">resolved</span>
                )}
              </span>
              <span className="font-medium text-gray-900">{w.errorCount}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  resolved ? "bg-green-400" : "bg-indigo-500"
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
