"use client";

import { useQuery } from "@apollo/client/react";
import { GET_MY_WEAKNESSES, GET_MY_REPORTS } from "@/graphql/queries/progress";
import Card from "@/components/ui/Card";
import WeaknessChart from "@/components/domain/WeaknessChart";

interface Report {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalSubmissions: number;
  totalMistakes: number;
  topWeaknesses: string[];
  streak: number;
  summary: string;
}

export default function ProgressPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: weaknessData } = useQuery<any>(GET_MY_WEAKNESSES);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reportData } = useQuery<any>(GET_MY_REPORTS);

  const weaknesses = weaknessData?.myWeaknesses ?? [];
  const reports: Report[] = reportData?.myReports ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Weakness Tracker
        </h2>
        <WeaknessChart weaknesses={weaknesses} />
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Weekly Reports
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-gray-500">No reports yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {report.weekStart} &mdash; {report.weekEnd}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {report.totalSubmissions} submissions &middot;{" "}
                      {report.totalMistakes} mistakes &middot; {report.streak}{" "}
                      day streak
                    </p>
                  </div>
                </div>
                {report.summary && (
                  <p className="mt-3 text-sm text-gray-600">
                    {report.summary}
                  </p>
                )}
                {report.topWeaknesses.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {report.topWeaknesses.map((w, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
