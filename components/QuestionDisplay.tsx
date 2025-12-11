'use client';

import { Question } from '../lib/constants/questions';
import Timer from './Timer';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timerSeconds: number;
  onAnswerSelect?: (answer: string) => void;
  selectedAnswer?: string | null;
  disabled?: boolean;
  onTimerComplete?: () => void;
  showTimer?: boolean;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  timerSeconds,
  onAnswerSelect,
  selectedAnswer,
  disabled = false,
  onTimerComplete,
  showTimer = true,
}: QuestionDisplayProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
        Question {questionNumber} of {totalQuestions}
      </div>

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8 text-gray-800 leading-tight">
        {question.question}
      </h2>

      <div className={showTimer ? "mb-6 sm:mb-8 flex justify-center" : "hidden"}>
        <Timer
          seconds={timerSeconds}
          onComplete={() => {
            onTimerComplete?.();
          }}
        />
      </div>

      <div className="space-y-2 sm:space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={index}
              onClick={() => !disabled && onAnswerSelect?.(option)}
              disabled={disabled}
              className={`w-full p-3 sm:p-4 lg:p-5 text-left rounded-lg sm:rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-indigo-500 text-white shadow-md transform scale-[1.01] sm:scale-[1.02]'
                  : 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50'
              } ${
                disabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <span className="font-medium text-base sm:text-lg">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

