"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_SUBMISSION_ANALYSIS } from "@/graphql/queries/submissions";
import { GET_MY_EXERCISES } from "@/graphql/queries/curriculum";
import { SUBMIT_EXERCISE_ANSWER } from "@/graphql/mutations/curriculum";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useState } from "react";
import { useTranslation } from "@/i18n/I18nProvider";

export default function WorksheetPage() {
  const { t } = useTranslation();
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
    return <p className="text-sm text-gray-500">{t("worksheet.loading")}</p>;
  }

  if (!analysis) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">
          {t("worksheet.processing")}
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
          {t("worksheet.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("worksheet.subtitle")}
        </p>
      </div>

      {/* Mistakes summary */}
      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
          {t("worksheet.mistakes")}
        </h2>
        {mistakes.length === 0 ? (
          <p className="text-sm text-gray-500">{t("worksheet.noMistakes")}</p>
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
                          | "style"
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
          <h2 className="text-lg font-semibold text-gray-900">{t("worksheet.exercises")}</h2>
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
                      <Badge variant="tone">{t("worksheet.done")}</Badge>
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
                        placeholder={t("worksheet.placeholder")}
                      />
                      <button
                        onClick={() => handleSubmit(ex.id)}
                        disabled={submitting || !answers[ex.id]?.trim()}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {submitting ? t("worksheet.checking") : t("worksheet.submit")}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                        <p className="text-xs font-medium text-gray-400">
                          {t("worksheet.yourAnswer")}
                        </p>
                        <p className="text-sm text-gray-700">
                          {ex.userAnswer}
                        </p>
                      </div>
                      <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2">
                        <p className="text-xs font-medium text-indigo-400">
                          {t("worksheet.feedback")}
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
