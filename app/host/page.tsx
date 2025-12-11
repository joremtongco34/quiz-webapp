'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuiz } from '../../lib/services/quizService';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { themeClasses } from '../../lib/utils/theme';

export default function CreateQuizPage() {
  const theme = useTheme();
  const [hostName, setHostName] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!timerSeconds || timerSeconds <= 0) {
      setError('Please enter a valid timer duration (must be greater than 0)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { code } = await createQuiz(hostName.trim(), timerSeconds);
      router.push(`/host/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'flat' 
        ? 'bg-gray-100' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      <div className={`max-w-md w-full ${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-8`}>
        <h1 className={`text-3xl font-semibold text-center mb-2 ${
          theme === 'flat' ? 'text-gray-900' : 'text-slate-800'
        }`}>Create Quiz</h1>
        <p className={`text-center text-sm mb-8 ${
          theme === 'flat' ? 'text-gray-500' : 'text-slate-500'
        }`}>Enter your name to get started</p>
        <form onSubmit={handleCreateQuiz} className="space-y-5">
          <div>
            <label htmlFor="hostName" className={`block text-sm font-medium mb-2 ${
              theme === 'flat' ? 'text-gray-700' : 'text-slate-700'
            }`}>
              Your Name
            </label>
            <input
              id="hostName"
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 border ${themeClasses.input(theme)} ${themeClasses.rounded(theme)} transition-all focus:bg-white`}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="timerSeconds" className={`block text-sm font-medium mb-2 ${
              theme === 'flat' ? 'text-gray-700' : 'text-slate-700'
            }`}>
              Timer per Question (seconds)
            </label>
            <input
              id="timerSeconds"
              type="text"
              value={timerSeconds}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty input while typing
                if (value === '') {
                  setTimerSeconds(0);
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue > 0) {
                    setTimerSeconds(numValue);
                  }
                }
              }}
              placeholder="Enter seconds (e.g., 30)"
              className={`w-full px-4 py-3 border ${themeClasses.input(theme)} ${themeClasses.rounded(theme)} transition-all focus:bg-white`}
              disabled={loading}
            />
            <p className={`text-xs mt-1 ${
              theme === 'flat' ? 'text-gray-500' : 'text-slate-500'
            }`}>Enter any positive number of seconds</p>
          </div>

          {error && (
            <div className={`p-4 rounded-xl text-sm ${
              theme === 'flat' 
                ? 'bg-red-50 border border-red-100 text-red-600' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 ${themeClasses.btnPrimary(theme)} ${themeClasses.rounded(theme)} font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              theme === 'flat' ? 'shadow-sm hover:shadow-md' : 'shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}

