"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type RecorderState =
  | "idle"
  | "recording"
  | "paused"
  | "processing"
  | "completed"
  | "error";

const MAX_DURATION = 300; // 5 minutes

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }
    mediaRecorder.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      setError("Microphone permission denied");
      setState("error");
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for waveform visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        setState("completed");
        cleanup();
      };

      recorder.start(1000); // collect chunks every second
      setState("recording");
      setElapsed(0);
      setError(null);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            recorder.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("Failed to start recording");
      setState("error");
    }
  }, [cleanup]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setState("paused");
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current?.state === "paused") {
      mediaRecorder.current.resume();
      setState("recording");
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            mediaRecorder.current?.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorder.current &&
      mediaRecorder.current.state !== "inactive"
    ) {
      mediaRecorder.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setState("idle");
    setElapsed(0);
    setAudioBlob(null);
    setError(null);
    audioChunks.current = [];
  }, [cleanup]);

  const getAnalyserNode = useCallback(() => {
    return analyserRef.current;
  }, []);

  return {
    state,
    elapsed,
    audioBlob,
    error,
    maxDuration: MAX_DURATION,
    requestPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
    getAnalyserNode,
  };
}
