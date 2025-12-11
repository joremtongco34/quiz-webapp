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
import { useTheme } from '../../../lib/contexts/ThemeContext';
import { themeClasses } from '../../../lib/utils/theme';

export default function ParticipantQuizPage() {
  const theme = useTheme();
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
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      }`}>
        <div className={theme === 'flat' ? 'text-gray-600' : 'text-slate-600'}>Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      }`}>
        <div className="text-red-500">Quiz not found</div>
      </div>
    );
  }

  // Join screen
  if (!participantId) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      }`}>
        <div className={`max-w-md w-full ${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-8`}>
          <h1 className={`text-3xl font-semibold text-center mb-2 ${
            theme === 'flat' ? 'text-gray-800' : 'text-slate-800'
          }`}>Join Quiz</h1>
          <p className={`text-center mb-8 ${
            theme === 'flat' ? 'text-gray-500' : 'text-slate-500'
          }`}>Code: <span className={`font-mono font-semibold ${
            theme === 'flat' ? 'text-blue-600' : 'text-indigo-600'
          }`}>{code}</span></p>

          {quiz.status !== 'waiting' && (
            <div className={`p-4 rounded-xl text-sm mb-6 ${
              theme === 'flat' 
                ? 'bg-red-50 border border-red-100 text-red-600' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700'
            }`}>
              This quiz has already started. You cannot join.
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label
                htmlFor="participantName"
                className={`block text-sm font-medium mb-2 ${
                  theme === 'flat' ? 'text-gray-700' : 'text-slate-700'
                }`}
              >
                Your Name
              </label>
              <input
                id="participantName"
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 border ${themeClasses.input(theme)} ${themeClasses.rounded(theme)} transition-all focus:bg-white`}
                disabled={joining || quiz.status !== 'waiting'}
              />
            </div>

            {joinError && (
              <div className={`p-4 rounded-xl text-sm ${
                theme === 'flat' 
                  ? 'bg-red-50 border border-red-100 text-red-600' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700'
              }`}>
                {joinError}
              </div>
            )}

            <button
              type="submit"
              disabled={joining || quiz.status !== 'waiting'}
              className={`w-full py-3 px-6 ${themeClasses.btnPrimary(theme)} ${themeClasses.rounded(theme)} font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                theme === 'flat' ? 'shadow-sm hover:shadow-md' : 'shadow-lg hover:shadow-xl'
              }`}
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
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      }`}>
        <div className={`max-w-md w-full ${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-10 text-center`}>
          <h1 className={`text-2xl font-semibold mb-4 ${
            theme === 'flat' ? 'text-gray-800' : 'text-slate-800'
          }`}>Waiting for Quiz to Start</h1>
          <p className={`mb-6 ${
            theme === 'flat' ? 'text-gray-600' : 'text-slate-600'
          }`}>
            You've joined as: <span className={`font-semibold ${
              theme === 'flat' ? 'text-blue-600' : 'text-indigo-600'
            }`}>{participantName}</span>
          </p>
          <p className={theme === 'flat' ? 'text-gray-500' : 'text-slate-500'}>The host will start the quiz soon...</p>
        </div>
      </div>
    );
  }

  // Quiz in progress
  if (quiz.status === 'in_progress') {
    // Show leaderboard only when timer expires
    if (timerExpired) {
      return (
        <div className={`min-h-screen p-4 ${
          theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
        }`}>
          <div className="max-w-4xl mx-auto">
            <div className={`${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-10`}>
              <div className="text-center mb-8">
                <div className={`inline-block px-6 py-3 rounded-xl mb-4 ${
                  theme === 'flat' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
                }`}>
                  <p className={`font-semibold text-lg ${
                    theme === 'flat' ? 'text-red-700' : 'text-red-600'
                  }`}>⏰ Time's Up!</p>
                </div>
                <p className={theme === 'flat' ? 'text-gray-600' : 'text-slate-600'}>
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
        <div className={`min-h-screen p-4 ${
          theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
        }`}>
          <div className="max-w-4xl mx-auto">
            <div className={`${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-10`}>
              <h2 className={`text-2xl font-semibold mb-8 text-center ${
                theme === 'flat' ? 'text-gray-800' : 'text-slate-800'
              }`}>Quiz Completed!</h2>
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
        <div className={`min-h-screen flex items-center justify-center ${
          theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
        }`}>
          <div className={theme === 'flat' ? 'text-gray-600' : 'text-slate-600'}>Loading question...</div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen p-2 sm:p-4 ${
        theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          {/* Overall Quiz Timer at Top */}
          <div className={`${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-4 sm:p-6 mb-4 sm:mb-6`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className={`text-xl sm:text-2xl font-semibold mb-1 ${
                  theme === 'flat' ? 'text-gray-800' : 'text-slate-800'
                }`}>Quiz: {code}</h1>
                <p className={`text-xs sm:text-sm ${
                  theme === 'flat' ? 'text-gray-600' : 'text-slate-600'
                }`}>Participant: {participantName}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="text-center w-full sm:w-auto">
                  <p className={`text-xs mb-2 uppercase tracking-wide ${
                    theme === 'flat' ? 'text-gray-500' : 'text-slate-500'
                  }`}>Overall Quiz Time</p>
                  <span className={`text-xl sm:text-2xl font-semibold ${
                    theme === 'flat' ? 'text-gray-700' : 'text-slate-700'
                  }`}>
                    {Math.floor(overallTimeRemaining / 60)}:{(overallTimeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className={`inline-block px-3 sm:px-4 py-2 ${themeClasses.badge(theme)} ${themeClasses.rounded(theme)} text-xs sm:text-sm font-medium`}>
                    Score: {participants.find((p) => p.id === participantId)?.score || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className={`${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-4 sm:p-6 lg:p-8`}>
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
                    <p className={`text-xs sm:text-sm mb-4 ${
                      theme === 'flat' ? 'text-gray-500' : 'text-slate-500'
                    }`}>
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
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 ${
                          theme === 'flat' 
                            ? 'bg-gray-500 hover:bg-gray-600' 
                            : 'bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600'
                        } text-white ${themeClasses.rounded(theme)} font-medium text-sm sm:text-base transition-all duration-200 ${
                          theme === 'flat' ? 'shadow-sm hover:shadow-md' : 'shadow-md hover:shadow-lg'
                        }`}
                      >
                        ← Previous
                      </button>
                    )}
                    {!isLastQuestion && (
                      <button
                        onClick={handleNextQuestion}
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 ${themeClasses.btnPrimary(theme)} ${themeClasses.rounded(theme)} font-medium text-sm sm:text-base transition-all duration-200 ${
                          theme === 'flat' ? 'shadow-sm hover:shadow-md' : 'shadow-lg hover:shadow-xl'
                        }`}
                      >
                        Next Question →
                      </button>
                    )}
                    {isLastQuestion && answeredQuestions.has(participantQuestionIndex) && (
                      <div className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 ${
                        theme === 'flat' ? 'bg-gray-100 text-gray-600' : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'
                      } ${themeClasses.rounded(theme)} font-medium text-sm sm:text-base text-center`}>
                        All Questions Answered
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Leaderboard */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className={`${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-4 sm:p-6 sticky top-2 sm:top-4`}>
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
    <div className={`min-h-screen p-4 ${
      theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-10`}>
          {quiz.status === 'completed' ? (
            <h2 className={`text-2xl font-semibold mb-8 text-center ${
              theme === 'flat' ? 'text-gray-800' : 'text-slate-800'
            }`}>Quiz Completed!</h2>
          ) : (
            <h2 className={`text-2xl font-semibold mb-8 text-center ${
              theme === 'flat' ? 'text-gray-800' : 'text-slate-800'
            }`}>Current Rankings</h2>
          )}
          <RankingsDisplay 
            participants={participants} 
            maxParticipants={participants.length > 3 ? 3 : undefined}
          />
          {quiz.status === 'completed' && (
            <div className="mt-8 text-center">
              <p className={`text-lg ${
                theme === 'flat' ? 'text-gray-600' : 'text-slate-600'
              }`}>
                🎉 Congratulations to the winners! 🎉
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

