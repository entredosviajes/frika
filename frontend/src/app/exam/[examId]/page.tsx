"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_EXAM } from "@/graphql/queries/curriculum";
import { SUBMIT_EXAM_ANSWER } from "@/graphql/mutations/curriculum";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface ExamQuestion {
  id: string;
  question: { text: string };
  userAnswer: string;
  score: number | null;
  order: number;
}

export default function ExamPage() {
  const params = useParams();
  const examId = Number(params.examId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading } = useQuery<any>(GET_EXAM, { variables: { examId } });
  const [submitAnswer, { loading: submitting }] =
    useMutation(SUBMIT_EXAM_ANSWER);

  const exam = data?.exam;
  const questions: ExamQuestion[] = exam?.examquestionSet
    ? [...exam.examquestionSet].sort(
        (a: ExamQuestion, b: ExamQuestion) => a.order - b.order
      )
    : [];

  const currentQ = questions[currentIndex];
  const allAnswered = questions.every((q) => q.userAnswer);

  const handleSubmit = async () => {
    if (!currentQ || !answer.trim()) return;
    await submitAnswer({
      variables: { examQuestionId: Number(currentQ.id), answer: answer.trim() },
      refetchQueries: [{ query: GET_EXAM, variables: { examId } }],
    });
    setAnswer("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading exam...</p>;
  if (!exam) return <p className="text-sm text-gray-500">Exam not found.</p>;

  if (allAnswered) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Exam Complete</h1>
        <Card>
          <p className="text-center text-4xl font-bold text-indigo-600">
            {exam.score !== null ? `${Math.round(exam.score)}%` : "Submitted"}
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            {questions.length} questions answered
          </p>
        </Card>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {i + 1}. {q.question.text}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Your answer: {q.userAnswer}
                  </p>
                </div>
                {q.score !== null && (
                  <Badge variant={q.score >= 0.7 ? "tone" : "major"}>
                    {Math.round(q.score * 100)}%
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Exam</h1>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {currentQ && (
        <Card>
          <p className="mb-4 text-lg text-gray-800">
            {currentQ.question.text}
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="mt-4 flex justify-between">
            <Button
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              Previous
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !answer.trim()}>
              {submitting
                ? "Submitting..."
                : currentIndex === questions.length - 1
                  ? "Finish"
                  : "Next"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
