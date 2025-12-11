'use client';

import { Participant } from '../lib/supabase';

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

  return (
    <div className={`${className}`}>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-700">Leaderboard</h2>
      <div className="space-y-2">
        {displayedParticipants.map((participant, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;
          return (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all ${
                isTopThree
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 shadow-sm'
                  : 'bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className={`text-base sm:text-lg font-semibold w-5 sm:w-6 flex-shrink-0 ${
                  rank === 1 ? 'text-yellow-600' : 
                  rank === 2 ? 'text-gray-400' : 
                  rank === 3 ? 'text-orange-600' : 
                  'text-gray-400'
                }`}>
                  {getRankIcon(rank)}
                </span>
                <span className={`font-medium text-sm sm:text-base truncate ${
                  isTopThree ? 'text-gray-800' : 'text-gray-600'
                }`}>
                  {participant.name}
                </span>
              </div>
              <span className={`font-semibold text-sm sm:text-base flex-shrink-0 ml-2 ${
                isTopThree ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {participant.score}
              </span>
            </div>
          );
        })}
        {displayedParticipants.length === 0 && (
          <div className="text-center text-gray-400 py-8 sm:py-12">
            <div className="text-xs sm:text-sm">No participants yet</div>
          </div>
        )}
        {maxParticipants && sortedParticipants.length > maxParticipants && (
          <div className="text-center text-gray-400 py-2">
            <div className="text-xs sm:text-sm">Showing top {maxParticipants}</div>
          </div>
        )}
      </div>
    </div>
  );
}

