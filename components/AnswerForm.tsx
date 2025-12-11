'use client';

import { useState } from 'react';

interface AnswerFormProps {
  onSubmit: (answer: string) => Promise<void>;
  options: string[];
  disabled?: boolean;
}

export default function AnswerForm({
  onSubmit,
  options,
  disabled = false,
}: AnswerFormProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAnswer || submitting || disabled) return;

    setSubmitting(true);
    try {
      await onSubmit(selectedAnswer);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !disabled && setSelectedAnswer(option)}
            disabled={disabled}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedAnswer === option
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedAnswer || submitting || disabled}
        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Answer'}
      </button>
    </div>
  );
}

