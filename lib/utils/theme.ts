// Theme utility functions
export const getTheme = (): 'flat' | 'colorful' => {
  if (typeof window !== 'undefined') {
    const html = document.documentElement;
    return (html.getAttribute('data-theme') as 'flat' | 'colorful') || 'flat';
  }
  return (process.env.NEXT_PUBLIC_DESIGN_THEME as 'flat' | 'colorful') || 'flat';
};

// Theme-aware class generators
export const themeClasses = {
  // Backgrounds
  bgPrimary: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-white' : 'bg-white',
  bgSecondary: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
  bgGradient: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-gray-50' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
  
  // Buttons
  btnPrimary: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white',
  btnSecondary: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white',
  btnSuccess: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white',
  
  // Cards
  card: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-white border border-gray-200' : 'bg-white border-2 border-indigo-200',
  cardShadow: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'shadow-sm' : 'shadow-lg shadow-indigo-200/50',
  
  // Borders
  rounded: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'rounded-md' : 'rounded-2xl',
  roundedLarge: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'rounded-lg' : 'rounded-3xl',
  
  // Text
  textPrimary: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'text-gray-900' : 'text-slate-800',
  textSecondary: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'text-gray-600' : 'text-slate-600',
  
  // Inputs
  input: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' : 'border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-gradient-to-r from-purple-50 to-pink-50',
  
  // Rankings
  rankingTop1: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-gray-100 border-l-4 border-gray-400' : 'bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-200 border-l-4 border-yellow-500',
  rankingTop2: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-gray-50 border-l-4 border-gray-300' : 'bg-gradient-to-r from-gray-200 via-gray-300 to-slate-200 border-l-4 border-gray-400',
  rankingTop3: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-gray-50 border-l-4 border-gray-300' : 'bg-gradient-to-r from-orange-200 via-orange-300 to-amber-200 border-l-4 border-orange-500',
  
  // Badges
  badge: (theme: 'flat' | 'colorful') => 
    theme === 'flat' ? 'bg-gray-100 text-gray-700' : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700',
};
