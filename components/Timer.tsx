'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
}

export default function Timer({ seconds, onComplete, className = '' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / seconds) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
            className={isLowTime ? 'text-red-400' : 'text-indigo-500'}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xl font-semibold ${
              isLowTime ? 'text-red-500' : 'text-gray-700'
            }`}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}

