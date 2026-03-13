"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_CONVERSATION_STARTERS } from "@/graphql/queries/submissions";
import Card from "@/components/ui/Card";
import AudioRecorder from "@/components/domain/AudioRecorder";
import AudioUploader from "@/components/domain/AudioUploader";

export default function RecordPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = useQuery<any>(GET_CONVERSATION_STARTERS);
  const starters = data?.conversationStarters ?? [];

  const handleSubmissionCreated = (submissionId: string) => {
    router.push(`/dashboard/feedback/${submissionId}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Record Yourself</h1>
        <p className="mt-1 text-sm text-gray-500">
          Talk about anything in your target language. Your recording will be
          analyzed by AI.
        </p>
      </div>

      {starters.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Need inspiration?
          </h2>
          <ul className="space-y-2">
            {starters.map((s: string, i: number) => (
              <li
                key={i}
                className="rounded-md border border-gray-100 px-3 py-2 text-sm text-gray-700"
              >
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <AudioRecorder onSubmissionCreated={handleSubmissionCreated} />
      </Card>

      <Card>
        <AudioUploader onSubmissionCreated={handleSubmissionCreated} />
      </Card>

      <p className="text-center text-xs text-gray-400">
        Speak for up to 5 minutes, or upload an existing audio file.
      </p>
    </div>
  );
}
