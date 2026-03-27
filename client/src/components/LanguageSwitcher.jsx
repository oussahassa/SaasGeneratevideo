import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setOpen(false);

    // Change document direction for Arabic
    if (langCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = langCode;
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50   dark:bg-yellow-800 hover:bg-gray-50 dark:bg-yellow-50 dark:bg-gray-50 dark:bg-yellow-50 dark:bg-slate-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors"
        title="Change Language"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{currentLanguage?.flag}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-yellow-50    dark:bg-yellow-800 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-yellow-50 dark:bg-yellow-800 dark:bg-yellow-50 dark:bg-yellow-50 dark:bg-yellow-50 dark:bg-slate-700 transition-colors flex items-center gap-2 ${
                i18n.language === lang.code
                  ? 'bg-blue-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
                  : 'text-slate-300'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="ml-auto text-blue-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
