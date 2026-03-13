"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_EXERCISES } from "@/graphql/queries/curriculum";
import { COMPLETE_EXERCISE } from "@/graphql/mutations/curriculum";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading } = useQuery<any>(GET_MY_EXERCISES, {
    variables: { pendingOnly: false },
  });

  const [completeExercise, { loading: completing }] = useMutation(
    COMPLETE_EXERCISE,
    {
      refetchQueries: [{ query: GET_MY_EXERCISES, variables: { pendingOnly: true } }],
    }
  );

  const exercise = data?.myExercises?.find(
    (ex: { id: string }) => ex.id === exerciseId
  );

  if (loading) {
    return <p className="text-sm text-gray-500">Loading exercise...</p>;
  }

  if (!exercise) {
    return <p className="text-sm text-gray-500">Exercise not found.</p>;
  }

  const content = typeof exercise.content === "string"
    ? JSON.parse(exercise.content)
    : exercise.content;

  const handleComplete = async () => {
    await completeExercise({ variables: { exerciseId } });
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize text-gray-900">
          {exercise.type.replace("_", " ")}
        </h1>
        <Badge variant={exercise.isCompleted ? "tone" : "default"}>
          {exercise.isCompleted ? "Done" : "Pending"}
        </Badge>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          Instruction
        </h2>
        <p className="text-gray-700">{content.instruction}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          Prompt
        </h2>
        <p className="text-lg font-medium text-gray-900">{content.prompt}</p>
      </Card>

      {!exercise.isCompleted && (
        <Card>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Your Answer
          </h2>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            placeholder="Type your answer here..."
          />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Correct Answer
          </h2>
          {!showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Reveal
            </button>
          )}
        </div>
        {showAnswer && (
          <p className="mt-3 text-gray-700">{content.answer}</p>
        )}
      </Card>

      {!exercise.isCompleted && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {completing ? "Saving..." : "Mark as Complete"}
        </button>
      )}
    </div>
  );
}
