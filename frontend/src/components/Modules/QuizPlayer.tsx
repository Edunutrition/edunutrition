import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizData {
  id: string;
  questions: QuizQuestion[];
}

interface SubmitResult {
  score: number;
  correct: number;
  total: number;
}

export function QuizPlayer({
  moduleId,
  lessonId,
  onCompleted,
}: {
  moduleId: string;
  lessonId: string;
  onCompleted: () => void;
}) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);

  const { data: quiz, isLoading } = useQuery<QuizData>({
    queryKey: ['quiz', moduleId, lessonId],
    queryFn: () => apiFetch(`/api/modules/${moduleId}/lessons/${lessonId}/quiz`),
    retry: false,
  });

  const submit = useMutation({
    mutationFn: () =>
      apiFetch(`/api/modules/${moduleId}/lessons/${lessonId}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: quiz!.questions.map((_, i) => answers[i]) }),
      }),
    onSuccess: (data: SubmitResult) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      onCompleted();
    },
  });

  if (isLoading) return <div className="mt-4 h-32 animate-pulse rounded-xl bg-secondary" />;
  if (!quiz) return null;

  const allAnswered = quiz.questions.every((_, i) => answers[i] !== undefined);

  if (result) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-card p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 font-display text-lg font-semibold text-foreground">
          {result.correct} / {result.total} bonnes réponses
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Score : {result.score}%</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5 rounded-xl border border-border bg-card p-5">
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex}>
          <p className="text-sm font-medium text-foreground">{q.question}</p>
          <div className="mt-2 space-y-1.5">
            {q.options.map((option, oIndex) => (
              <label
                key={oIndex}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-secondary"
              >
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                  className="h-3.5 w-3.5"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => submit.mutate()}
        disabled={!allAnswered || submit.isPending}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {submit.isPending ? 'Envoi…' : 'Valider mes réponses'}
      </button>
    </div>
  );
}
