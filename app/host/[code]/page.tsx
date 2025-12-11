'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useQuizRealtime } from '../../../lib/hooks/useQuizRealtime';
import { useParticipantsRealtime } from '../../../lib/hooks/useParticipantsRealtime';
import { startQuiz, nextQuestion, completeQuiz, getRankings, getQuizQuestions } from '../../../lib/services/quizService';
import RankingsDisplay from '../../../components/RankingsDisplay';
import QuestionDisplay from '../../../components/QuestionDisplay';

export default function HostQuizPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const { quiz, loading: quizLoading } = useQuizRealtime(code);
  const { participants, loading: participantsLoading } = useParticipantsRealtime(
    quiz?.id || null
  );

  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [overallTimeRemaining, setOverallTimeRemaining] = useState<number>(0);

  const quizQuestions = quiz ? getQuizQuestions(quiz) : [];
  
  // Calculate overall quiz time (timer_seconds is the total quiz duration)
  const totalQuizTime = quiz ? (quiz.timer_seconds || 30) : 0;
  
  // Update overall time remaining
  useEffect(() => {
    if (!quiz || !quiz.started_at || quiz.status !== 'in_progress') {
      setOverallTimeRemaining(totalQuizTime);
      return;
    }

    const updateTime = () => {
      const startTime = new Date(quiz.started_at).getTime();
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalQuizTime - elapsedSeconds);
      setOverallTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [quiz?.started_at, quiz?.status, totalQuizTime]);
  
  const participantUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/participant/${code}`
    : '';

  const handleCopyUrl = async () => {
    if (!participantUrl) return;
    
    try {
      await navigator.clipboard.writeText(participantUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = participantUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };
  const currentQuestion =
    quiz && quiz.current_question_index < quizQuestions.length
      ? quizQuestions[quiz.current_question_index]
      : null;

  const isLastQuestion =
    quiz && quiz.current_question_index === quizQuestions.length - 1;

  const handleStartQuiz = async () => {
    if (!quiz || participants.length === 0) return;

    setActionLoading(true);
    try {
      await startQuiz(code);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start quiz');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!quiz) {
      alert('Quiz data not available. Please refresh the page.');
      return;
    }

    if (!code) {
      alert('Quiz code is missing. Please refresh the page.');
      return;
    }

    setActionLoading(true);
    try {
      if (isLastQuestion) {
        await completeQuiz(code);
      } else {
        // Pass current index directly to avoid race conditions
        await nextQuestion(code, quiz.current_question_index);
      }
    } catch (error) {
      console.error('Error moving to next question:', error);
      console.error('Quiz code:', code);
      console.error('Current quiz state:', quiz);
      const errorMessage = error instanceof Error ? error.message : 'Failed to move to next question';
      alert(errorMessage + '\n\nIf this persists, please refresh the page.');
    } finally {
      setActionLoading(false);
    }
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Quiz: {code}</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Host: {quiz.host_name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="inline-block px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium">
                {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              </div>
              <button
                onClick={handleCopyUrl}
                className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Copy participant URL"
              >
                {copied ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Copied!</span>
                    <span className="sm:hidden">✓</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Copy URL</span>
                    <span className="sm:hidden">Copy</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {quiz.status === 'in_progress' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content - Leaderboard */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 lg:p-10">
                <RankingsDisplay participants={participants} />
              </div>
            </div>

            {/* Sidebar - Timer */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 sticky top-2 sm:top-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 uppercase tracking-wide">Overall Quiz Time</p>
                  <span className="text-2xl sm:text-3xl font-semibold text-gray-700">
                    {Math.floor(overallTimeRemaining / 60)}:{(overallTimeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {quiz.status === 'waiting' && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10 text-center">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">Waiting for Participants</h2>
                
                {/* Quiz Code */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Quiz Code:</p>
                  <div className="inline-block px-4 sm:px-6 py-3 sm:py-4 bg-indigo-50 rounded-lg sm:rounded-xl">
                    <span className="font-mono font-semibold text-2xl sm:text-3xl text-indigo-600">{code}</span>
                  </div>
                </div>

                {/* Share Section */}
                <div className="mb-6 sm:mb-8">
                  {/* QR Code */}
                  {participantUrl && (
                    <div className="flex flex-col items-center mb-4 sm:mb-6">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Scan this QR code to join:</p>
                      <div className="p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl inline-block">
                        <div className="scale-80 sm:scale-100">
                          <QRCodeSVG
                            value={participantUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Copy URL Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleCopyUrl}
                      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                      }`}
                    >
                      {copied ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy URL
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleStartQuiz}
                  disabled={actionLoading || participants.length === 0}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-green-500 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {actionLoading ? 'Starting...' : 'Start Quiz'}
                </button>
              </div>
            )}

            {quiz.status === 'completed' && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center text-gray-800">Quiz Completed!</h2>
                <RankingsDisplay participants={participants} />
              </div>
            )}
          </div>

          {/* Sidebar - Rankings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 sticky top-2 sm:top-4">
              <RankingsDisplay participants={participants} />
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

