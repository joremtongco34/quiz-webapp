'use client';

import { Question } from '../lib/constants/questions';
import Timer from './Timer';
import { useTheme } from '../lib/contexts/ThemeContext';
import { themeClasses } from '../lib/utils/theme';

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
  const theme = useTheme();
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`mb-4 sm:mb-6 text-xs sm:text-sm font-medium uppercase tracking-wide ${
        theme === 'flat' ? 'text-gray-500' : 'text-slate-500'
      }`}>
        Question {questionNumber} of {totalQuestions}
      </div>

      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8 leading-tight ${
        theme === 'flat' ? 'text-gray-800' : 'text-slate-800'
      }`}>
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
              className={`w-full p-3 sm:p-4 lg:p-5 text-left ${themeClasses.rounded(theme)} transition-all duration-200 ${
                isSelected
                  ? theme === 'flat'
                    ? 'bg-blue-600 text-white shadow-md transform scale-[1.01] sm:scale-[1.02]'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-[1.01] sm:scale-[1.02]'
                  : theme === 'flat'
                    ? 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50'
                    : 'bg-white text-slate-700 shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 border-2 border-transparent hover:border-indigo-200'
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

