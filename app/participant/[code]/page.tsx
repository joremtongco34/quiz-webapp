'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizRealtime } from '../../../lib/hooks/useQuizRealtime';
import { useParticipantsRealtime } from '../../../lib/hooks/useParticipantsRealtime';
import { joinQuiz } from '../../../lib/services/participantService';
import { submitAnswer } from '../../../lib/services/answerService';
import { getQuizQuestions } from '../../../lib/services/quizService';
import QuestionDisplay from '../../../components/QuestionDisplay';
import RankingsDisplay from '../../../components/RankingsDisplay';
import Timer from '../../../components/Timer';

export default function ParticipantQuizPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const { quiz, loading: quizLoading } = useQuizRealtime(code);
  const { participants, loading: participantsLoading } = useParticipantsRealtime(
    quiz?.id || null
  );

  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [participantQuestionIndex, setParticipantQuestionIndex] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
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

  // Initialize participant question index when quiz starts
  useEffect(() => {
    if (quiz && quiz.status === 'in_progress' && participantQuestionIndex === 0) {
      setParticipantQuestionIndex(0);
    }
  }, [quiz?.status]);

  // Set question start time when participant moves to a new question
  useEffect(() => {
    if (quiz && quiz.status === 'in_progress' && participantQuestionIndex < quizQuestions.length) {
      setQuestionStartTime(Date.now());
      setAnswerSubmitted(answeredQuestions.has(participantQuestionIndex));
      setSelectedAnswer(null);
      setTimerExpired(false);
    }
  }, [participantQuestionIndex, quiz?.status, quizQuestions.length, answeredQuestions]);

  const handleTimerComplete = async () => {
    setTimerExpired(true);
    
    // Auto-submit if they have an answer selected but not submitted
    if (selectedAnswer && !answerSubmitted && participantId && quiz) {
      const responseTimeMs = questionStartTime ? Date.now() - questionStartTime : 0;
      try {
        await submitAnswer(
          code,
          participantId,
          participantQuestionIndex,
          selectedAnswer,
          responseTimeMs
        );
        setAnswerSubmitted(true);
        setAnsweredQuestions(new Set([...answeredQuestions, participantQuestionIndex]));
      } catch (error) {
        // Answer might already be submitted or quiz moved on
        console.error('Auto-submit failed:', error);
      }
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      setJoinError('Please enter your name');
      return;
    }

    setJoining(true);
    setJoinError(null);

    try {
      const participant = await joinQuiz(code, participantName.trim());
      setParticipantId(participant.id);
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'Failed to join quiz');
      setJoining(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (answerSubmitted || !participantId) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !participantId || !quiz || answerSubmitted) return;

    const responseTimeMs = questionStartTime ? Date.now() - questionStartTime : 0;

    try {
      await submitAnswer(
        code,
        participantId,
        participantQuestionIndex,
        selectedAnswer,
        responseTimeMs
      );
      setAnswerSubmitted(true);
      setAnsweredQuestions(new Set([...answeredQuestions, participantQuestionIndex]));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit answer');
    }
  };

  const handleNextQuestion = async () => {
    // Auto-submit answer if one is selected but not yet submitted
    if (selectedAnswer && !answerSubmitted && participantId && quiz && questionStartTime) {
      const responseTimeMs = Date.now() - questionStartTime;
      try {
        await submitAnswer(
          code,
          participantId,
          participantQuestionIndex,
          selectedAnswer,
          responseTimeMs
        );
        setAnswerSubmitted(true);
        setAnsweredQuestions(new Set([...answeredQuestions, participantQuestionIndex]));
        
        // Small delay to ensure score updates before moving
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Auto-submit failed:', error);
        alert(error instanceof Error ? error.message : 'Failed to submit answer');
        return; // Don't move to next question if submit failed
      }
    }

    // Move to next question
    if (participantQuestionIndex < quizQuestions.length - 1) {
      setParticipantQuestionIndex(participantQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (participantQuestionIndex > 0) {
      setParticipantQuestionIndex(participantQuestionIndex - 1);
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

  // Join screen
  if (!participantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-semibold text-center mb-2 text-gray-800">Join Quiz</h1>
          <p className="text-center text-gray-500 mb-8">Code: <span className="font-mono font-semibold text-indigo-600">{code}</span></p>

          {quiz.status !== 'waiting' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-6">
              This quiz has already started. You cannot join.
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label
                htmlFor="participantName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name
              </label>
              <input
                id="participantName"
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                disabled={joining || quiz.status !== 'waiting'}
              />
            </div>

            {joinError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {joinError}
              </div>
            )}

            <button
              type="submit"
              disabled={joining || quiz.status !== 'waiting'}
              className="w-full py-3 px-6 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {joining ? 'Joining...' : 'Join Quiz'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentQuestion =
    quiz.status === 'in_progress' && participantQuestionIndex < quizQuestions.length
      ? quizQuestions[participantQuestionIndex]
      : null;
  
  const isLastQuestion = participantQuestionIndex === quizQuestions.length - 1;
  const isFirstQuestion = participantQuestionIndex === 0;

  // Waiting screen
  if (quiz.status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Waiting for Quiz to Start</h1>
          <p className="text-gray-600 mb-6">
            You've joined as: <span className="font-semibold text-indigo-600">{participantName}</span>
          </p>
          <p className="text-gray-500">The host will start the quiz soon...</p>
        </div>
      </div>
    );
  }

  // Quiz in progress
  if (quiz.status === 'in_progress') {
    // Show leaderboard only when timer expires
    if (timerExpired) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-10">
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <p className="text-red-700 font-semibold text-lg">⏰ Time's Up!</p>
                </div>
                <p className="text-gray-600">
                  Question {participantQuestionIndex + 1} of {quizQuestions.length}
                </p>
              </div>
              <RankingsDisplay 
                participants={participants} 
                maxParticipants={participants.length > 3 ? 3 : undefined}
              />
            </div>
          </div>
        </div>
      );
    }

    // All questions completed
    if (participantQuestionIndex >= quizQuestions.length) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-10">
              <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">Quiz Completed!</h2>
              <RankingsDisplay 
                participants={participants} 
                maxParticipants={participants.length > 3 ? 3 : undefined}
              />
            </div>
          </div>
        </div>
      );
    }

    if (!currentQuestion) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-600">Loading question...</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-6xl mx-auto">
          {/* Overall Quiz Timer at Top */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Quiz: {code}</h1>
                <p className="text-gray-600 text-xs sm:text-sm">Participant: {participantName}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="text-center w-full sm:w-auto">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Overall Quiz Time</p>
                  <span className="text-xl sm:text-2xl font-semibold text-gray-700">
                    {Math.floor(overallTimeRemaining / 60)}:{(overallTimeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="inline-block px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium">
                    Score: {participants.find((p) => p.id === participantId)?.score || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
                <QuestionDisplay
                  question={currentQuestion}
                  questionNumber={participantQuestionIndex + 1}
                  totalQuestions={quizQuestions.length}
                  timerSeconds={quiz.timer_seconds || 30}
                  onAnswerSelect={handleAnswerSelect}
                  selectedAnswer={selectedAnswer}
                  disabled={answerSubmitted || timerExpired}
                  onTimerComplete={handleTimerComplete}
                  showTimer={false}
                />

                {selectedAnswer && !answerSubmitted && !timerExpired && (
                  <div className="mt-6 sm:mt-8 text-center">
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">
                      Answer selected. Click "Next Question" to submit and continue.
                    </p>
                  </div>
                )}

                {/* Navigation buttons - only visible when timer hasn't expired */}
                {!timerExpired && (
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    {!isFirstQuestion && (
                      <button
                        onClick={handlePreviousQuestion}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        ← Previous
                      </button>
                    )}
                    {!isLastQuestion && (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-indigo-500 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Next Question →
                      </button>
                    )}
                    {isLastQuestion && answeredQuestions.has(participantQuestionIndex) && (
                      <div className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-600 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-center">
                        All Questions Answered
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Leaderboard */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 sticky top-2 sm:top-4">
                <RankingsDisplay 
                  participants={participants} 
                  maxParticipants={participants.length > 3 ? 3 : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Between questions or completed - show rankings
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-10">
          {quiz.status === 'completed' ? (
            <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">Quiz Completed!</h2>
          ) : (
            <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">Current Rankings</h2>
          )}
          <RankingsDisplay 
            participants={participants} 
            maxParticipants={participants.length > 3 ? 3 : undefined}
          />
          {quiz.status === 'completed' && (
            <div className="mt-8 text-center">
              <p className="text-lg text-gray-600">
                🎉 Congratulations to the winners! 🎉
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

