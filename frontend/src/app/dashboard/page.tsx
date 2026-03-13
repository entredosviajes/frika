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

export default function DashboardPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user ? `, ${user.username}` : ""}
        </h1>
        {user?.profile && (
          <p className="text-sm text-gray-500">
            Learning {user.profile.targetLanguage}
          </p>
        )}
      </div>

      {/* Today's Recording */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Today&apos;s Recording
        </h2>
        {todaySub ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Recorded at{" "}
                {new Date(todaySub.recordedAt).toLocaleTimeString()}
              </p>
              <Badge variant={todayStatus === "completed" ? "tone" : "default"}>
                {todayStatus}
              </Badge>
            </div>

            {todayStatus === "completed" && analysis && (
              <div className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Transcript
                  </p>
                  <p className="text-sm text-gray-700">
                    {analysis.rawTranscript}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Feedback
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
                    View full analysis
                  </Link>
                  {exercises.length > 0 && (
                    <Link
                      href={`/dashboard/worksheet/${todaySub.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Open worksheet
                      {pendingExercises.length > 0 &&
                        ` (${pendingExercises.length} pending)`}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {todayStatus === "processing" && (
              <p className="text-sm text-gray-500">
                Your recording is being analyzed...
              </p>
            )}

            {todayStatus === "failed" && (
              <div className="flex items-center gap-3 rounded-md border border-red-100 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  Analysis failed. This is usually a temporary issue.
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
                  {retrying ? "Retrying..." : "Retry"}
                </button>
              </div>
            )}

            {/* Always allow recording again */}
            <Link
              href="/dashboard/record"
              className="inline-block text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Record again
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              You haven&apos;t recorded anything today. Talk about whatever is
              on your mind!
            </p>
            <Link
              href="/dashboard/record"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Record or Upload Audio
            </Link>
          </div>
        )}
      </Card>

      {/* Today's Worksheet */}
      {todayStatus === "completed" && exercises.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Today&apos;s Worksheet
            </h2>
            <Link
              href={`/dashboard/worksheet/${todaySub.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Open
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {pendingExercises.length === 0
              ? "All exercises completed!"
              : `${pendingExercises.length} of ${exercises.length} exercises remaining`}
          </p>
        </Card>
      )}

      {/* Past submissions */}
      {submissions.length > 1 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-600">
            Past recordings ({submissions.length})
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
