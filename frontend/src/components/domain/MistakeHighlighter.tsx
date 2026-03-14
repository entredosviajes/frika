"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import Badge from "@/components/ui/Badge";

interface Mistake {
  id: string;
  originalText: string;
  correction: string;
  explanation: string;
  category: "grammar" | "vocabulary" | "pronunciation" | "tone" | "style";
  severity: "minor" | "major";
}

interface MistakeHighlighterProps {
  transcript: string;
  mistakes: Mistake[];
}

const categoryColors: Record<string, string> = {
  grammar: "bg-blue-200/60 border-b-2 border-blue-400",
  vocabulary: "bg-purple-200/60 border-b-2 border-purple-400",
  pronunciation: "bg-orange-200/60 border-b-2 border-orange-400",
  tone: "bg-green-200/60 border-b-2 border-green-400",
  style: "bg-teal-200/60 border-b-2 border-teal-400",
};

export default function MistakeHighlighter({
  transcript,
  mistakes,
}: MistakeHighlighterProps) {
  if (!mistakes.length) {
    return <p className="text-gray-700 leading-relaxed">{transcript}</p>;
  }

  // Build segments: find each mistake in the transcript and split around them
  type Segment = { text: string; mistake?: Mistake };
  const segments: Segment[] = [];
  let remaining = transcript;

  // Sort mistakes by their position in the transcript
  const sortedMistakes = [...mistakes].sort((a, b) => {
    const posA = transcript.indexOf(a.originalText);
    const posB = transcript.indexOf(b.originalText);
    return posA - posB;
  });

  for (const mistake of sortedMistakes) {
    const idx = remaining.indexOf(mistake.originalText);
    if (idx === -1) continue;

    if (idx > 0) {
      segments.push({ text: remaining.slice(0, idx) });
    }
    segments.push({ text: mistake.originalText, mistake });
    remaining = remaining.slice(idx + mistake.originalText.length);
  }

  if (remaining) {
    segments.push({ text: remaining });
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <p className="text-gray-700 leading-relaxed">
        {segments.map((seg, i) =>
          seg.mistake ? (
            <Tooltip.Root key={i}>
              <Tooltip.Trigger asChild>
                <span
                  className={`cursor-pointer rounded px-0.5 ${categoryColors[seg.mistake.category]}`}
                >
                  {seg.text}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 max-w-xs rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
                  sideOffset={5}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={seg.mistake.category}>
                        {seg.mistake.category}
                      </Badge>
                      <Badge variant={seg.mistake.severity}>
                        {seg.mistake.severity}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium text-green-700">
                        {seg.mistake.correction}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {seg.mistake.explanation}
                    </p>
                  </div>
                  <Tooltip.Arrow className="fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>
    </Tooltip.Provider>
  );
}
