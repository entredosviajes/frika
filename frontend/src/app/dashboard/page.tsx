"use client";

import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/graphql/queries/auth";
import { GET_MY_EXERCISES } from "@/graphql/queries/curriculum";
import { GET_MY_SUBMISSIONS } from "@/graphql/queries/submissions";
import { GET_MY_WEAKNESSES } from "@/graphql/queries/progress";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StreakCounter from "@/components/domain/StreakCounter";
import WeaknessChart from "@/components/domain/WeaknessChart";
import Link from "next/link";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: meData } = useQuery<any>(ME_QUERY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exercisesData } = useQuery<any>(GET_MY_EXERCISES, {
    variables: { dueDate: new Date().toISOString().split("T")[0] },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submissionsData } = useQuery<any>(GET_MY_SUBMISSIONS, {
    fetchPolicy: "network-only",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: weaknessesData } = useQuery<any>(GET_MY_WEAKNESSES);

  const user = meData?.me;
  const exercises = exercisesData?.myExercises ?? [];
  const submissions = submissionsData?.mySubmissions ?? [];
  const weaknesses = weaknessesData?.myWeaknesses ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user ? `, ${user.username}` : ""}
          </h1>
          {user?.profile && (
            <p className="text-sm text-gray-500">
              Learning {user.profile.targetLanguage} &middot;{" "}
              {user.profile.proficiencyLevel}
            </p>
          )}
        </div>
        {user?.profile && (
          <StreakCounter streak={user.profile.dailyStreak} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Today&apos;s Exercises
          </h2>
          {exercises.length === 0 ? (
            <p className="text-sm text-gray-500">No exercises for today.</p>
          ) : (
            <ul className="space-y-2">
              {exercises.map((ex: { id: string; type: string; isCompleted: boolean }) => (
                <li
                  key={ex.id}
                  className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                >
                  <span className="text-sm capitalize text-gray-700">
                    {ex.type.replace("_", " ")}
                  </span>
                  <Badge variant={ex.isCompleted ? "tone" : "default"}>
                    {ex.isCompleted ? "Done" : "Pending"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Submissions
          </h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-gray-500">No submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {submissions
                .slice(0, 5)
                .map(
                  (sub: {
                    id: string;
                    question: { topic: { name: string } };
                    status: string;
                  }) => (
                    <li key={sub.id}>
                      <Link
                        href={`/dashboard/feedback/${sub.id}`}
                        className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">
                          {sub.question.topic.name}
                        </span>
                        <Badge
                          variant={
                            sub.status === "completed" ? "tone" : "default"
                          }
                        >
                          {sub.status}
                        </Badge>
                      </Link>
                    </li>
                  )
                )}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Top Weaknesses
        </h2>
        <WeaknessChart weaknesses={weaknesses.slice(0, 5)} />
      </Card>

      <div className="flex gap-4">
        <Link
          href="/dashboard/practice"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Start Practicing
        </Link>
      </div>
    </div>
  );
}
