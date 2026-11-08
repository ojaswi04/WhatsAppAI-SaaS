import React from 'react';
import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../ThemeContext';

export default function Header({ title }) {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2.5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          aria-label="Notifications"
          className="p-2.5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <Bell size={20} />
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 ml-1"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </header>
  );
}
