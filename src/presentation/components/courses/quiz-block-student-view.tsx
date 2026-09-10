"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getQuizPassingScore,
  isQuizReady,
  parseQuizContent,
} from "@/core/domain/courses/quiz";
import type { QuizQuestion } from "@/core/domain/courses/quiz";
import type { BlockProgressItem } from "@/core/domain/student/progress.types";
import { cn } from "@/shared/lib/cn";

interface QuizBlockStudentViewProps {
  content: string | null;
  variant?: "practice" | "final";
  blockProgress?: BlockProgressItem;
  onProgressChange?: (update: {
    blockId: string;
    answers?: Record<string, number>;
    verified?: boolean;
    passed?: boolean;
    score?: number;
    totalQuestions?: number;
  }) => void;
  blockId?: string;
}

function getChoiceOptions(question: QuizQuestion) {
  return question.options
    .map((option, index) => ({ label: option.trim(), index }))
    .filter((item) => item.label);
}

export function QuizBlockStudentView({
  content,
  variant = "practice",
  blockProgress,
  onProgressChange,
  blockId,
}: QuizBlockStudentViewProps) {
  const quiz = useMemo(() => parseQuizContent(content), [content]);
  const [answers, setAnswers] = useState<Record<string, number>>(
    blockProgress?.answers ?? {},
  );
  const [verified, setVerified] = useState(blockProgress?.verified ?? false);

  useEffect(() => {
    setAnswers(blockProgress?.answers ?? {});
    setVerified(blockProgress?.verified ?? false);
  }, [blockProgress]);

  const readyQuestions = quiz.questions.filter(
    (q) => q.question.trim() && getChoiceOptions(q).length >= 2,
  );
  const passingScore = getQuizPassingScore(quiz, readyQuestions.length);
  const isFinalExam = variant === "final";
  const hasPassed = blockProgress?.passed ?? false;

  const results = useMemo(() => {
    if (!verified) return null;

    return readyQuestions.map((question) => {
      const selected = answers[question.id];
      const isCorrect = selected === question.correctIndex;
      return { question, selected, isCorrect };
    });
  }, [answers, readyQuestions, verified]);

  const score = results?.filter((item) => item.isCorrect).length ?? 0;
  const wrongQuestions = results?.filter((item) => !item.isCorrect) ?? [];

  function persistState(
    nextAnswers: Record<string, number>,
    nextVerified: boolean,
    nextScore?: number,
    nextPassed?: boolean,
  ) {
    if (!onProgressChange || !blockId) return;

    onProgressChange({
      blockId,
      answers: nextAnswers,
      verified: nextVerified,
      passed: nextPassed,
      score: nextVerified ? nextScore : undefined,
      totalQuestions: nextVerified ? readyQuestions.length : undefined,
    });
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const computedScore = readyQuestions.reduce(
      (total, question) => total + (answers[question.id] === question.correctIndex ? 1 : 0),
      0,
    );
    const didPass = computedScore >= passingScore || hasPassed;
    setVerified(true);
    persistState(answers, true, computedScore, didPass);
  }

  function handleAnswerChange(questionId: string, optionIndex: number) {
    const nextAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(nextAnswers);
    if (!verified) {
      persistState(nextAnswers, false);
    }
  }

  function handleRetry() {
    if (hasPassed) return;
    const nextAnswers: Record<string, number> = {};
    setAnswers(nextAnswers);
    setVerified(false);
    persistState(nextAnswers, false, undefined, false);
  }

  const didPassCurrentAttempt = verified && score >= passingScore;
  const showPassedState = hasPassed || didPassCurrentAttempt;

  if (!isQuizReady(quiz)) {
    return (
      <div className="rounded-lg border border-dashed border-brand-line bg-brand-light/40 p-4 text-sm text-brand-muted">
        {quiz.instructions.trim() || "Este quiz aún no tiene preguntas configuradas."}
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      <div
        className={cn(
          "rounded-lg border px-4 py-3",
          isFinalExam ? "border-amber-200 bg-amber-50" : "border-brand-blue/20 bg-brand-blue/5",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isFinalExam ? "text-amber-900" : "text-brand-blue",
          )}
        >
          {isFinalExam ? "Examen final" : "Quiz de práctica"}
        </p>
        <p className="mt-1 text-sm text-brand-muted">
          Necesitas al menos el 80% ({passingScore} de {readyQuestions.length} correctas) para
          aprobar{isFinalExam ? " el examen" : " este quiz"}.
        </p>
      </div>

      {quiz.instructions.trim() && (
        <p className="text-sm leading-relaxed text-brand-muted">{quiz.instructions}</p>
      )}

      <div className="space-y-4">
        {readyQuestions.map((question, index) => {
          const selected = answers[question.id];
          const result = results?.find((item) => item.question.id === question.id);
          const isCorrect = result?.isCorrect;
          const isWrong = verified && result && !result.isCorrect;
          const choices = getChoiceOptions(question);

          return (
            <fieldset
              key={question.id}
              className={cn(
                "rounded-xl border p-4",
                verified && isCorrect && "border-emerald-200 bg-emerald-50/60",
                verified && isWrong && "border-red-200 bg-red-50/60",
                !verified && "border-brand-line bg-white",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <legend className="px-1 text-sm font-semibold text-brand-gray">
                  {index + 1}. {question.question}
                </legend>
                {verified && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800",
                    )}
                  >
                    {isCorrect ? "Correcta" : isFinalExam ? "Está mal" : "Incorrecta"}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2" role="radiogroup" aria-label={`Pregunta ${index + 1}`}>
                {choices.map(({ label, index: optionIndex }, choiceIndex) => {
                  const isSelected = selected === optionIndex;
                  const isCorrectOption = optionIndex === question.correctIndex;
                  const letter = String.fromCharCode(65 + choiceIndex);
                  const revealCorrect = verified && !isFinalExam && isCorrectOption;
                  const markWrongChoice = verified && isSelected && !isCorrectOption;

                  return (
                    <label
                      key={optionIndex}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        !verified && isSelected && "border-brand-blue bg-brand-blue/5",
                        !verified && !isSelected && "border-brand-line hover:bg-brand-light/60",
                        revealCorrect && "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200",
                        markWrongChoice && "border-red-400 bg-red-50 ring-1 ring-red-200",
                        verified && isFinalExam && isSelected && isCorrect && "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200",
                        verified && "cursor-default",
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={optionIndex}
                        checked={isSelected}
                        disabled={verified}
                        onChange={() => handleAnswerChange(question.id, optionIndex)}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="text-brand-gray">
                        <span className="mr-2 font-semibold text-brand-blue">{letter}.</span>
                        {label}
                        {revealCorrect && (
                          <span className="ml-2 text-xs font-medium text-emerald-700">
                            (respuesta correcta)
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              {verified && isWrong && (
                <div className="mt-3 rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-xs text-red-800">
                  {isFinalExam ? (
                    <p>Esta respuesta está mal.</p>
                  ) : (
                    <>
                      <p>
                        Tu respuesta:{" "}
                        <strong>
                          {selected !== undefined
                            ? question.options[selected]?.trim() || "Sin respuesta"
                            : "Sin respuesta"}
                        </strong>
                      </p>
                      <p className="mt-1">
                        La correcta era:{" "}
                        <strong>{question.options[question.correctIndex]?.trim()}</strong>
                      </p>
                    </>
                  )}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {verified ? (
        <div className="space-y-3 rounded-xl border border-brand-line bg-brand-light/50 p-4">
          <p className="text-sm font-semibold text-brand-gray">
            Resultado: {score} de {readyQuestions.length} correctas
          </p>

          <p
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium",
              showPassedState
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800",
            )}
          >
            {showPassedState
              ? isFinalExam
                ? "¡Aprobaste el examen final! Ya puedes finalizar el curso."
                : "Quiz aprobado. Ya puedes continuar."
              : `No alcanzaste el 80% (${passingScore} de ${readyQuestions.length}). Intenta de nuevo.`}
          </p>

          {wrongQuestions.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-800">
              <p className="font-medium">Preguntas incorrectas:</p>
              <ul className="mt-1 list-inside list-disc">
                {wrongQuestions.map(({ question }) => {
                  const questionNumber =
                    readyQuestions.findIndex((item) => item.id === question.id) + 1;
                  return <li key={question.id}>Pregunta {questionNumber}</li>;
                })}
              </ul>
            </div>
          )}

          {!hasPassed && (
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
            >
              {isFinalExam ? "Reintentar examen" : "Intentar de nuevo"}
            </button>
          )}
        </div>
      ) : (
        <button
          type="submit"
          disabled={readyQuestions.some((q) => answers[q.id] === undefined)}
          className={cn(
            "rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50",
            isFinalExam
              ? "bg-amber-700 hover:bg-amber-800"
              : "bg-brand-blue hover:bg-brand-blue/90",
          )}
        >
          {isFinalExam ? "Enviar examen" : "Verificar resultados"}
        </button>
      )}
    </form>
  );
}
