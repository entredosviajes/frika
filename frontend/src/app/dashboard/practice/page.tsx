"use client";

import { useQuery } from "@apollo/client/react";
import { GET_TOPICS } from "@/graphql/queries/curriculum";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default function PracticePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(GET_TOPICS);
  const topics = data?.topics ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Choose a Topic</h1>
      {error ? (
        <p className="text-sm text-red-600">Error: {error.message}</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading topics...</p>
      ) : topics.length === 0 ? (
        <p className="text-sm text-gray-500">No topics available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic: { id: string; name: string; description: string }) => (
            <Link key={topic.id} href={`/dashboard/practice/${topic.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">
                  {topic.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {topic.description || "Start practicing this topic."}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
