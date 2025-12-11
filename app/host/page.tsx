'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuiz } from '../../lib/services/quizService';

export default function CreateQuizPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-800">Create Quiz</h1>
        <p className="text-center text-sm text-gray-500 mb-8">Enter your name to get started</p>
        <form onSubmit={handleCreateQuiz} className="space-y-5">
          <div>
            <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="hostName"
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="timerSeconds" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Enter any positive number of seconds</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}

