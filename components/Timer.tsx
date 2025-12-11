'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../lib/contexts/ThemeContext';

interface TimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
}

export default function Timer({ seconds, onComplete, className = '' }: TimerProps) {
  const theme = useTheme();
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
            className={theme === 'flat' ? 'text-gray-200' : 'text-indigo-100'}
          />
          {theme === 'colorful' && !isLowTime && (
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          )}
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke={theme === 'colorful' && !isLowTime ? 'url(#gradient)' : 'currentColor'}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
            className={
              isLowTime 
                ? 'text-red-500' 
                : theme === 'flat' 
                  ? 'text-blue-600' 
                  : ''
            }
            style={{ 
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xl font-semibold ${
              isLowTime 
                ? 'text-red-500' 
                : theme === 'flat' 
                  ? 'text-gray-700' 
                  : 'text-slate-700'
            }`}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}

