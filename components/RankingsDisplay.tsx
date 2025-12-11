'use client';

import { Participant } from '../lib/supabase';
import { useTheme } from '../lib/contexts/ThemeContext';
import { themeClasses } from '../lib/utils/theme';

interface RankingsDisplayProps {
  participants: Participant[];
  className?: string;
  maxParticipants?: number;
}

export default function RankingsDisplay({
  participants,
  className = '',
  maxParticipants,
}: RankingsDisplayProps) {
  const theme = useTheme();
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const displayedParticipants = maxParticipants 
    ? sortedParticipants.slice(0, maxParticipants)
    : sortedParticipants;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  const getRankingClasses = (rank: number) => {
    if (rank === 1) return themeClasses.rankingTop1(theme);
    if (rank === 2) return themeClasses.rankingTop2(theme);
    if (rank === 3) return themeClasses.rankingTop3(theme);
    return theme === 'flat' ? 'bg-white border-l-4 border-gray-200' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-300';
  };

  return (
    <div className={`${className}`}>
      <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${
        theme === 'flat' ? 'text-gray-700' : 'text-slate-700'
      }`}>Leaderboard</h2>
      <div className="space-y-2">
        {displayedParticipants.map((participant, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;
          return (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-3 sm:p-4 ${themeClasses.rounded(theme)} transition-all ${
                theme === 'flat' ? 'shadow-sm' : 'shadow-md'
              } ${getRankingClasses(rank)}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className={`text-base sm:text-lg font-semibold w-5 sm:w-6 flex-shrink-0 ${
                  rank === 1 ? (theme === 'flat' ? 'text-gray-600' : 'text-yellow-600') : 
                  rank === 2 ? (theme === 'flat' ? 'text-gray-400' : 'text-gray-500') : 
                  rank === 3 ? (theme === 'flat' ? 'text-gray-500' : 'text-orange-600') : 
                  (theme === 'flat' ? 'text-gray-400' : 'text-slate-400')
                }`}>
                  {getRankIcon(rank)}
                </span>
                <span className={`font-medium text-sm sm:text-base truncate ${
                  isTopThree ? (theme === 'flat' ? 'text-gray-800' : 'text-slate-800') : (theme === 'flat' ? 'text-gray-600' : 'text-slate-600')
                }`}>
                  {participant.name}
                </span>
              </div>
              <span className={`font-semibold text-sm sm:text-base flex-shrink-0 ml-2 ${
                isTopThree ? (theme === 'flat' ? 'text-blue-600' : 'text-indigo-600') : (theme === 'flat' ? 'text-gray-500' : 'text-slate-500')
              }`}>
                {participant.score}
              </span>
            </div>
          );
        })}
        {displayedParticipants.length === 0 && (
          <div className={`text-center py-8 sm:py-12 ${
            theme === 'flat' ? 'text-gray-400' : 'text-slate-400'
          }`}>
            <div className="text-xs sm:text-sm">No participants yet</div>
          </div>
        )}
        {maxParticipants && sortedParticipants.length > maxParticipants && (
          <div className={`text-center py-2 ${
            theme === 'flat' ? 'text-gray-400' : 'text-slate-400'
          }`}>
            <div className="text-xs sm:text-sm">Showing top {maxParticipants}</div>
          </div>
        )}
      </div>
    </div>
  );
}

