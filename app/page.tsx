'use client';

import Link from 'next/link';
import { useTheme } from '../lib/contexts/ThemeContext';
import { themeClasses } from '../lib/utils/theme';

export default function Home() {
  const theme = useTheme();
  
  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-8 ${
      theme === 'flat' 
        ? 'bg-gray-100' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-semibold mb-4 ${
            theme === 'flat' ? 'text-gray-900' : 'text-slate-800'
          }`}>
            Quiz App
          </h1>
          <p className={`text-lg ${
            theme === 'flat' ? 'text-gray-600' : 'text-slate-600'
          }`}>
            Create or join a real-time quiz session
          </p>
        </div>
        
        <div className={`${themeClasses.bgPrimary(theme)} ${themeClasses.roundedLarge(theme)} ${themeClasses.cardShadow(theme)} p-8`}>
          <div className="space-y-4">
            <Link
              href="/host"
              className={`block w-full px-8 py-4 ${themeClasses.btnPrimary(theme)} ${themeClasses.rounded(theme)} font-medium transition-all duration-200 text-center ${
                theme === 'flat' ? 'shadow-sm hover:shadow-md' : 'shadow-lg hover:shadow-xl'
              }`}
            >
              Create Quiz
            </Link>
            <div className={`text-center text-sm py-2 ${
              theme === 'flat' ? 'text-gray-500' : 'text-slate-500'
            }`}>
              or join as participant with a quiz code
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

