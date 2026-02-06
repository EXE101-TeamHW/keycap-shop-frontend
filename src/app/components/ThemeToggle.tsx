// src/app/components/ThemeToggle.tsx
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Chế độ sáng';
      case 'dark':
        return 'Chế độ tối';
      default:
        return 'Theo hệ thống';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all"
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
}

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative group">
      <button className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all">
        {theme === 'light' ? (
          <Sun className="w-5 h-5" />
        ) : theme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5" />
        )}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 animate-in fade-in slide-in-from-top-2">
        <div className="p-2">
          <button
            onClick={() => setTheme('light')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors ${
              theme === 'light' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : ''
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>Chế độ sáng</span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors ${
              theme === 'dark' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : ''
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>Chế độ tối</span>
          </button>
          
          <button
            onClick={() => setTheme('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors ${
              theme === 'system' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : ''
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span>Theo hệ thống</span>
          </button>
        </div>
      </div>
    </div>
  );
}