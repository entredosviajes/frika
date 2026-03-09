"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_QUESTIONS } from "@/graphql/queries/curriculum";
import Card from "@/components/ui/Card";
import AudioRecorder from "@/components/domain/AudioRecorder";

export default function RecordingStudioPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = Number(params.topicId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading } = useQuery<any>(GET_QUESTIONS, {
    variables: { topicId },
  });

  const questions = data?.questions ?? [];
  const question = questions[0]; // serve the first question for now

  const handleSubmissionCreated = (submissionId: string) => {
    router.push(`/dashboard/feedback/${submissionId}`);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading question...</p>;
  }

  if (!question) {
    return (
      <p className="text-sm text-gray-500">
        No questions available for this topic.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-gray-500">{question.topic.name}</p>
        <h1 className="text-2xl font-bold text-gray-900">Recording Studio</h1>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
          Your Prompt
        </h2>
        <p className="text-lg text-gray-800">{question.text}</p>
      </Card>

      <Card>
        <AudioRecorder
          questionId={Number(question.id)}
          onSubmissionCreated={handleSubmissionCreated}
        />
      </Card>

      <p className="text-center text-xs text-gray-400">
        Speak for up to 5 minutes. Your recording will be analyzed by AI.
      </p>
    </div>
  );
}
