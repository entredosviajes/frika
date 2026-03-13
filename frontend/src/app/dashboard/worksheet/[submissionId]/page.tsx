"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_SUBMISSION_ANALYSIS } from "@/graphql/queries/submissions";
import { GET_MY_EXERCISES } from "@/graphql/queries/curriculum";
import { SUBMIT_EXERCISE_ANSWER } from "@/graphql/mutations/curriculum";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

export default function WorksheetPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: analysisData, loading: analysisLoading } = useQuery<any>(
    GET_SUBMISSION_ANALYSIS,
    { variables: { submissionId } }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exercisesData, loading: exercisesLoading } = useQuery<any>(
    GET_MY_EXERCISES,
    { variables: { submissionId } }
  );

  const [submitAnswer, { loading: submitting }] = useMutation(
    SUBMIT_EXERCISE_ANSWER,
    {
      refetchQueries: [
        { query: GET_MY_EXERCISES, variables: { submissionId } },
      ],
    }
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const analysis = analysisData?.submissionAnalysis;
  const exercises = exercisesData?.myExercises ?? [];
  const mistakes = analysis?.mistakes ?? [];

  if (analysisLoading || exercisesLoading) {
    return <p className="text-sm text-gray-500">Loading worksheet...</p>;
  }

  if (!analysis) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">
          Analysis is still processing. This page will show your worksheet once ready.
        </p>
      </Card>
    );
  }

  const handleSubmit = async (exerciseId: string) => {
    const answer = answers[exerciseId]?.trim();
    if (!answer) return;
    await submitAnswer({ variables: { exerciseId, answer } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Today&apos;s Worksheet
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review your mistakes, then practice with the exercises below.
        </p>
      </div>

      {/* Mistakes summary */}
      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
          Mistakes from your recording
        </h2>
        {mistakes.length === 0 ? (
          <p className="text-sm text-gray-500">No mistakes found!</p>
        ) : (
          <div className="space-y-3">
            {mistakes.map(
              (m: {
                id: string;
                originalText: string;
                correction: string;
                explanation: string;
                category: string;
                severity: string;
              }) => (
                <div
                  key={m.id}
                  className="rounded-md border border-gray-100 px-4 py-3"
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
                        m.category as
                          | "grammar"
                          | "vocabulary"
                          | "pronunciation"
                          | "tone"
                      }
                    >
                      {m.category}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{m.explanation}</p>
                </div>
              )
            )}
          </div>
        )}
      </Card>

      {/* Exercises */}
      {exercises.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Exercises</h2>
          {exercises.map(
            (ex: {
              id: string;
              type: string;
              content: any;
              userAnswer: string;
              feedback: string;
              isCompleted: boolean;
            }) => {
              const content =
                typeof ex.content === "string"
                  ? JSON.parse(ex.content)
                  : ex.content;

              return (
                <Card key={ex.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-400">
                        {ex.type.replace("_", " ")}
                      </span>
                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {content.instruction}
                      </p>
                    </div>
                    {ex.isCompleted && (
                      <Badge variant="tone">Done</Badge>
                    )}
                  </div>

                  <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900">
                    {content.prompt}
                  </p>

                  {!ex.isCompleted ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={answers[ex.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [ex.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        rows={2}
                        placeholder="Type your answer..."
                      />
                      <button
                        onClick={() => handleSubmit(ex.id)}
                        disabled={submitting || !answers[ex.id]?.trim()}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {submitting ? "Checking..." : "Submit"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                        <p className="text-xs font-medium text-gray-400">
                          Your answer
                        </p>
                        <p className="text-sm text-gray-700">
                          {ex.userAnswer}
                        </p>
                      </div>
                      <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2">
                        <p className="text-xs font-medium text-indigo-400">
                          Feedback
                        </p>
                        <p className="text-sm text-gray-700">{ex.feedback}</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
