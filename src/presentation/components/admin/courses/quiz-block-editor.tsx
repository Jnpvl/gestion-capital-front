"use client";

import type { QuizContent, QuizQuestion } from "@/core/domain/courses/quiz";
import {
  createQuizQuestion,
  parseQuizContent,
  serializeQuizContent,
} from "@/core/domain/courses/quiz";
import { cn } from "@/shared/lib/cn";

interface QuizBlockEditorProps {
  content: string | null;
  onChange: (content: string) => void;
}

export function QuizBlockEditor({ content, onChange }: QuizBlockEditorProps) {
  const quiz = parseQuizContent(content);

  function updateQuiz(patch: Partial<QuizContent>) {
    onChange(serializeQuizContent({ ...quiz, ...patch }));
  }

  function updateQuestion(index: number, patch: Partial<QuizQuestion>) {
    updateQuiz({
      questions: quiz.questions.map((question, i) =>
        i === index ? { ...question, ...patch } : question,
      ),
    });
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const question = quiz.questions[questionIndex];
    if (!question) return;

    const options = [...question.options];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  }

  function addOption(questionIndex: number) {
    const question = quiz.questions[questionIndex];
    if (!question || question.options.length >= 5) return;
    updateQuestion(questionIndex, { options: [...question.options, ""] });
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const question = quiz.questions[questionIndex];
    if (!question || question.options.length <= 2) return;

    const options = question.options.filter((_, i) => i !== optionIndex);
    let correctIndex = question.correctIndex;
    if (correctIndex === optionIndex) correctIndex = 0;
    else if (correctIndex > optionIndex) correctIndex -= 1;

    updateQuestion(questionIndex, { options, correctIndex });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm text-brand-muted">
        <p className="font-medium text-brand-blue">Quiz de opción múltiple</p>
        <p className="mt-1">
          Crea preguntas con varias opciones y marca cuál es la correcta. El alumno podrá verificar sus
          respuestas al terminar. El examen final del curso será una sección aparte.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-brand-muted">
          Instrucciones del quiz
        </label>
        <textarea
          value={quiz.instructions}
          onChange={(e) => updateQuiz({ instructions: e.target.value })}
          rows={2}
          placeholder="Ej. Responde las siguientes preguntas para validar lo aprendido en esta sección."
          className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      {quiz.questions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-brand-line bg-brand-light/40 px-4 py-6 text-center text-sm text-brand-muted">
          Agrega preguntas de opción múltiple para armar el quiz.
        </p>
      ) : (
        <div className="space-y-4">
          {quiz.questions.map((question, questionIndex) => (
            <div
              key={question.id}
              className="rounded-xl border border-brand-line bg-brand-light/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                  Pregunta {questionIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuiz({
                      questions: quiz.questions.filter((_, i) => i !== questionIndex),
                    })
                  }
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>

              <input
                value={question.question}
                onChange={(e) => updateQuestion(questionIndex, { question: e.target.value })}
                placeholder="Escribe la pregunta"
                className="mb-4 w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />

              <p className="mb-2 text-xs font-medium text-brand-muted">
                Opciones de respuesta — selecciona la correcta
              </p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const letter = String.fromCharCode(65 + optionIndex);
                  const isCorrect = question.correctIndex === optionIndex;

                  return (
                    <div
                      key={optionIndex}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2 py-2",
                        isCorrect ? "border-emerald-300 bg-emerald-50/60" : "border-transparent",
                      )}
                    >
                      <span className="w-5 shrink-0 text-center text-xs font-bold text-brand-blue">
                        {letter}
                      </span>
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={isCorrect}
                        onChange={() => updateQuestion(questionIndex, { correctIndex: optionIndex })}
                        className="shrink-0"
                        aria-label={`Marcar opción ${letter} como correcta`}
                      />
                      <input
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        placeholder={`Opción ${letter}`}
                        className="flex-1 rounded-lg border border-brand-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
                      />
                      {isCorrect && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                          Correcta
                        </span>
                      )}
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          className="shrink-0 text-xs text-brand-muted hover:text-red-600"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {question.options.length < 5 && (
                <button
                  type="button"
                  onClick={() => addOption(questionIndex)}
                  className="mt-3 text-xs font-medium text-brand-blue hover:underline"
                >
                  + Agregar opción
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => updateQuiz({ questions: [...quiz.questions, createQuizQuestion()] })}
        className="rounded-lg border border-brand-line bg-white px-4 py-2 text-sm font-medium text-brand-gray hover:bg-brand-light"
      >
        + Agregar pregunta
      </button>
    </div>
  );
}
