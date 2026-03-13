"use client";

import { useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { GENERATE_PRESIGNED_URL, CREATE_SUBMISSION } from "@/graphql/mutations/submissions";
import Button from "@/components/ui/Button";

interface AudioUploaderProps {
  onSubmissionCreated?: (submissionId: string) => void;
}

export default function AudioUploader({
  onSubmissionCreated,
}: AudioUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generateUrl] = useMutation(GENERATE_PRESIGNED_URL);
  const [createSubmission, { loading: submitting }] = useMutation(CREATE_SUBMISSION);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);

    try {
      const { data: urlData } = await generateUrl({
        variables: {
          filename: file.name,
          contentType: file.type,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { url, key } = (urlData as any).generatePresignedUrl;

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const { data } = await createSubmission({
        variables: {
          audioKey: key,
          recordedAt: new Date().toISOString(),
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmissionCreated?.((data as any).createSubmission.submission.id);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        Or upload an audio file
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
      />
      {file && (
        <Button onClick={handleUpload} disabled={submitting} size="sm">
          {submitting ? "Uploading..." : error ? "Retry Upload" : "Upload & Analyze"}
        </Button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
