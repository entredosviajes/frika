"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { GENERATE_PRESIGNED_URL, CREATE_SUBMISSION } from "@/graphql/mutations/submissions";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/I18nProvider";

interface AudioRecorderProps {
  onSubmissionCreated?: (submissionId: string) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function AudioRecorder({
  onSubmissionCreated,
}: AudioRecorderProps) {
  const { t } = useTranslation();
  const {
    state,
    elapsed,
    audioBlob,
    error,
    maxDuration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
    getAnalyserNode,
  } = useAudioRecorder();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [generateUrl] = useMutation(GENERATE_PRESIGNED_URL);
  const [createSubmission, { loading: submitting }] = useMutation(CREATE_SUBMISSION);

  const drawWaveform = useCallback(() => {
    const analyser = getAnalyserNode();
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#4f46e5";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, [getAnalyserNode]);

  useEffect(() => {
    if (state === "recording") {
      drawWaveform();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state, drawWaveform]);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!audioBlob) return;
    setUploadError(null);

    try {
      const { data: urlData } = await generateUrl({
        variables: {
          filename: `recording-${Date.now()}.webm`,
          contentType: audioBlob.type,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { url, key } = (urlData as any).generatePresignedUrl;

      await fetch(url, {
        method: "PUT",
        body: audioBlob,
        headers: { "Content-Type": audioBlob.type },
      });

      const { data } = await createSubmission({
        variables: {
          audioKey: key,
          recordedAt: new Date().toISOString(),
          duration: elapsed,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmissionCreated?.((data as any).createSubmission.submission.id);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(t("recorder.uploadFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full rounded-lg border border-gray-200 bg-gray-50"
      />

      <div className="flex items-center justify-between">
        <span className="text-2xl font-mono tabular-nums text-gray-900">
          {formatTime(elapsed)}
        </span>
        <span className="text-sm text-gray-500">
          / {formatTime(maxDuration)}
        </span>
      </div>

      <div className="flex gap-3">
        {state === "idle" && (
          <Button onClick={startRecording} size="lg">
            {t("recorder.start")}
          </Button>
        )}

        {state === "recording" && (
          <>
            <Button onClick={pauseRecording} variant="secondary">
              {t("recorder.pause")}
            </Button>
            <Button onClick={stopRecording} variant="danger">
              {t("recorder.stop")}
            </Button>
          </>
        )}

        {state === "paused" && (
          <>
            <Button onClick={resumeRecording}>{t("recorder.resume")}</Button>
            <Button onClick={stopRecording} variant="danger">
              {t("recorder.stop")}
            </Button>
          </>
        )}

        {state === "completed" && (
          <>
            <Button onClick={handleUpload} disabled={submitting} size="lg">
              {submitting ? t("recorder.uploading") : uploadError ? t("recorder.retryUpload") : t("recorder.submit")}
            </Button>
            <Button onClick={reset} variant="ghost">
              {t("recorder.recordAgain")}
            </Button>
          </>
        )}

        {state === "error" && (
          <Button onClick={reset} variant="secondary">
            {t("recorder.tryAgain")}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
    </div>
  );
}
