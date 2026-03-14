"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { ME_QUERY } from "@/graphql/queries/auth";
import { GET_MY_EXERCISES } from "@/graphql/queries/curriculum";
import {
  GET_MY_SUBMISSIONS,
  GET_TODAY_SUBMISSION,
  GET_SUBMISSION_ANALYSIS,
} from "@/graphql/queries/submissions";
import { RETRY_SUBMISSION } from "@/graphql/mutations/submissions";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { useTranslation } from "@/i18n/I18nProvider";
import { LANGUAGE_NAMES, type Locale } from "@/i18n/translations";

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: meData } = useQuery<any>(ME_QUERY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: todayData } = useQuery<any>(GET_TODAY_SUBMISSION, {
    fetchPolicy: "network-only",
  });
  const todaySub = todayData?.todaySubmission;
  const todayStatus = todaySub?.status?.toLowerCase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: analysisData } = useQuery<any>(GET_SUBMISSION_ANALYSIS, {
    variables: { submissionId: todaySub?.id },
    skip: !todaySub?.id || todayStatus !== "completed",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exercisesData } = useQuery<any>(GET_MY_EXERCISES, {
    variables: { submissionId: todaySub?.id },
    skip: !todaySub?.id || todayStatus !== "completed",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submissionsData } = useQuery<any>(GET_MY_SUBMISSIONS, {
    fetchPolicy: "network-only",
  });

  const [retrySubmission, { loading: retrying }] = useMutation(
    RETRY_SUBMISSION,
    { refetchQueries: [{ query: GET_TODAY_SUBMISSION }] }
  );

  const user = meData?.me;
  const analysis = analysisData?.submissionAnalysis;
  const exercises = exercisesData?.myExercises ?? [];
  const submissions = submissionsData?.mySubmissions ?? [];
  const pendingExercises = exercises.filter(
    (ex: { isCompleted: boolean }) => !ex.isCompleted
  );

  const targetLangCode = user?.profile?.targetLanguage?.toLowerCase() ?? "";
  const targetLangName = LANGUAGE_NAMES[targetLangCode]?.[locale] ?? targetLangCode;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("dashboard.welcome")}{user ? `, ${user.username}` : ""}
        </h1>
        {user?.profile && (
          <p className="text-sm text-gray-500">
            {t("dashboard.learning", { language: targetLangName })}
          </p>
        )}
      </div>

      {/* Today's Recording */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t("dashboard.todayRecording")}
        </h2>
        {todaySub ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {t("dashboard.recordedAt", {
                  time: new Date(todaySub.recordedAt).toLocaleTimeString(),
                })}
              </p>
              <Badge variant={todayStatus === "completed" ? "tone" : "default"}>
                {todayStatus}
              </Badge>
            </div>

            {todayStatus === "completed" && analysis && (
              <div className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t("dashboard.transcript")}
                  </p>
                  <p className="text-sm text-gray-700">
                    {analysis.rawTranscript}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t("dashboard.feedback")}
                  </p>
                  <p className="text-sm text-gray-700">
                    {analysis.generalFeedback}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/feedback/${todaySub.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {t("dashboard.viewAnalysis")}
                  </Link>
                  {exercises.length > 0 && (
                    <Link
                      href={`/dashboard/worksheet/${todaySub.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {t("dashboard.openWorksheet")}
                      {pendingExercises.length > 0 &&
                        ` (${t("dashboard.pending", { count: pendingExercises.length })})`}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {todayStatus === "processing" && (
              <p className="text-sm text-gray-500">
                {t("dashboard.analyzing")}
              </p>
            )}

            {todayStatus === "failed" && (
              <div className="flex items-center gap-3 rounded-md border border-red-100 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  {t("dashboard.failed")}
                </p>
                <button
                  onClick={() =>
                    retrySubmission({
                      variables: { submissionId: todaySub.id },
                    })
                  }
                  disabled={retrying}
                  className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {retrying ? t("dashboard.retrying") : t("dashboard.retry")}
                </button>
              </div>
            )}

            {/* Always allow recording again */}
            <Link
              href="/dashboard/record"
              className="inline-block text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              {t("dashboard.recordAgain")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {t("dashboard.noRecording")}
            </p>
            <Link
              href="/dashboard/record"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t("dashboard.recordOrUpload")}
            </Link>
          </div>
        )}
      </Card>

      {/* Today's Worksheet */}
      {todayStatus === "completed" && exercises.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.todayWorksheet")}
            </h2>
            <Link
              href={`/dashboard/worksheet/${todaySub.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {t("dashboard.open")}
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {pendingExercises.length === 0
              ? t("dashboard.allCompleted")
              : t("dashboard.exercisesRemaining", {
                  pending: pendingExercises.length,
                  total: exercises.length,
                })}
          </p>
        </Card>
      )}

      {/* Past submissions */}
      {submissions.length > 1 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-600">
            {t("dashboard.pastRecordings", { count: submissions.length })}
          </summary>
          <ul className="mt-3 space-y-1">
            {submissions
              .slice(0, 10)
              .map(
                (sub: {
                  id: string;
                  recordedAt: string;
                  status: string;
                }) => (
                  <li key={sub.id}>
                    <Link
                      href={`/dashboard/feedback/${sub.id}`}
                      className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      <span>
                        {new Date(sub.recordedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs">
                        {sub.status.toLowerCase()}
                      </span>
                    </Link>
                  </li>
                )
              )}
          </ul>
        </details>
      )}
    </div>
  );
}
