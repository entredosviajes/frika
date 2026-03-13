"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_SUBMISSION_ANALYSIS } from "@/graphql/queries/submissions";
import { GET_MY_EXERCISES } from "@/graphql/queries/curriculum";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import MistakeHighlighter from "@/components/domain/MistakeHighlighter";
import Link from "next/link";

export default function FeedbackPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading } = useQuery<any>(GET_SUBMISSION_ANALYSIS, {
    variables: { submissionId },
    pollInterval: 5000, // poll while processing
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exercisesData } = useQuery<any>(GET_MY_EXERCISES, {
    variables: { submissionId },
    skip: !data?.submissionAnalysis,
  });

  const analysis = data?.submissionAnalysis;
  const exercises = exercisesData?.myExercises ?? [];

  if (loading && !analysis) {
    return <p className="text-sm text-gray-500">Loading analysis...</p>;
  }

  if (!analysis) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="mb-2 text-2xl">&#9881;&#65039;</div>
          <p className="text-gray-600">
            Your recording is being analyzed. This usually takes a minute.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            This page will update automatically.
          </p>
        </div>
      </Card>
    );
  }

  const mistakes = analysis.mistakes ?? [];
  const mistakesByCategory: Record<string, typeof mistakes> = {};
  for (const m of mistakes) {
    if (!mistakesByCategory[m.category]) mistakesByCategory[m.category] = [];
    mistakesByCategory[m.category].push(m);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Feedback</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Your Transcript
          </h2>
          <MistakeHighlighter
            transcript={analysis.rawTranscript}
            mistakes={mistakes}
          />
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Improved Version
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {analysis.rewrittenVersion}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          General Feedback
        </h2>
        <p className="text-gray-700">{analysis.generalFeedback}</p>
      </Card>

      {Object.keys(mistakesByCategory).length > 0 && (
        <Card>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
            Mistakes Breakdown
          </h2>
          <div className="space-y-4">
            {Object.entries(mistakesByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Badge
                    variant={
                      category as
                        | "grammar"
                        | "vocabulary"
                        | "pronunciation"
                        | "tone"
                    }
                  >
                    {category}
                  </Badge>
                  <span className="text-gray-400">
                    ({items.length} issue{items.length !== 1 ? "s" : ""})
                  </span>
                </h3>
                <ul className="space-y-2">
                  {items.map(
                    (m: {
                      id: string;
                      originalText: string;
                      correction: string;
                      explanation: string;
                      severity: string;
                    }) => (
                      <li
                        key={m.id}
                        className="rounded-md border border-gray-100 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm text-red-600 line-through">
                              {m.originalText}
                            </span>
                            <span className="mx-2 text-gray-400">&rarr;</span>
                            <span className="text-sm font-medium text-green-700">
                              {m.correction}
                            </span>
                          </div>
                          <Badge
                            variant={
                              m.severity === "major" ? "major" : "minor"
                            }
                          >
                            {m.severity}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {m.explanation}
                        </p>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {exercises.length > 0 && (
        <div className="text-center">
          <Link
            href={`/dashboard/worksheet/${submissionId}`}
            className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Open Worksheet
            {exercises.filter((ex: { isCompleted: boolean }) => !ex.isCompleted)
              .length > 0 &&
              ` (${exercises.filter((ex: { isCompleted: boolean }) => !ex.isCompleted).length} pending)`}
          </Link>
        </div>
      )}
    </div>
  );
}
