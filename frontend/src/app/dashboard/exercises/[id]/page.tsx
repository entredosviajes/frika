"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_EXERCISES } from "@/graphql/queries/curriculum";
import { SUBMIT_EXERCISE_ANSWER } from "@/graphql/mutations/curriculum";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

export default function ExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;
  const [userAnswer, setUserAnswer] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading } = useQuery<any>(GET_MY_EXERCISES, {
    variables: { pendingOnly: false },
  });

  const [submitAnswer, { loading: submitting }] = useMutation(
    SUBMIT_EXERCISE_ANSWER,
    {
      refetchQueries: [
        { query: GET_MY_EXERCISES, variables: { pendingOnly: true } },
        { query: GET_MY_EXERCISES, variables: { pendingOnly: false } },
      ],
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

  const content =
    typeof exercise.content === "string"
      ? JSON.parse(exercise.content)
      : exercise.content;

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    await submitAnswer({ variables: { exerciseId, answer: userAnswer } });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize text-gray-900">
            {exercise.type.replace("_", " ")}
          </h1>
          {exercise.weaknessTag && (
            <p className="mt-1 text-sm text-gray-500">
              Targeting: <span className="font-medium">{exercise.weaknessTag}</span>
            </p>
          )}
        </div>
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

      {!exercise.isCompleted ? (
        <>
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

          <button
            onClick={handleSubmit}
            disabled={submitting || !userAnswer.trim()}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Answer"}
          </button>
        </>
      ) : (
        <>
          <Card>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
              Your Answer
            </h2>
            <p className="text-gray-700">{exercise.userAnswer}</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
              Correct Answer
            </h2>
            <p className="text-gray-700">{content.answer}</p>
          </Card>
        </>
      )}
    </div>
  );
}
