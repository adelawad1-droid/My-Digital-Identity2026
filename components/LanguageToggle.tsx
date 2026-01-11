
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { LANGUAGES_CONFIG } from '../constants';

interface LanguageToggleProps {
  currentLang: Language;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // تحديد اللغة البديلة (إذا كان عربي يختار إنجليزي والعكس)
  const targetLang: Language = currentLang === 'ar' ? 'en' : 'ar';
  const config = LANGUAGES_CONFIG[targetLang];

  const handleLanguageChange = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      segments[0] = targetLang;
      navigate('/' + segments.join('/') + location.search);
    } else {
      navigate(`/${targetLang}/`);
    }
  };

  return (
    <button 
      onClick={handleLanguageChange}
      className="group flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-gray-100 dark:border-gray-700 transition-all shadow-sm active:scale-95"
      title={currentLang === 'ar' ? 'Switch to English' : 'التغيير إلى العربية'}
    >
      <span className="text-base leading-none group-hover:scale-110 transition-transform">
        {config?.flag}
      </span>
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
        {targetLang === 'ar' ? 'AR' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;
