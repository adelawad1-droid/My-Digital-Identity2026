
import React, { useEffect, useState } from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import CardPreview from '../components/CardPreview';
import { TRANSLATIONS, PATTERN_PRESETS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { Plus, UserPlus, Share2, AlertCircle, Coffee, Loader2, PowerOff } from 'lucide-react';
import { generateShareUrl } from '../utils/share';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
  siteIcon?: string;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang, customConfig, siteIcon }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const [isCapturing, setIsCapturing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getColors = () => {
    const primary = data.themeColor || '#3b82f6';
    let secondary = primary;
    if (data.themeType === 'gradient' && data.themeGradient) {
      const match = data.themeGradient.match(/#[a-fA-F0-9]{3,6}/g);
      if (match && match.length > 1) secondary = match[match.length - 1];
    }
    return { primary, secondary };
  };

  useEffect(() => {
    if (!data || data.isActive === false) return;

    const { primary, secondary } = getColors();
    const root = document.documentElement;

    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-secondary', secondary);
    
    const customPageBg = data.pageBgColor || customConfig?.pageBgColor;
    const baseBg = customPageBg || (data.isDark ? '#050507' : '#f8fafc');
    
    const styleId = 'dynamic-card-bg';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
      .mesh-bg { 
        background-color: ${baseBg} !important;
        background-image: none !important;
      }
    `;

    // Advanced SEO for Card
    const clientName = data.name || 'Digital ID';
    const clientTitle = data.title || (isRtl ? 'بطاقة شخصية ذكية' : 'Digital Business Card');
    const fullTitle = `${clientName} | ${clientTitle} | NextID`;
    document.title = fullTitle;

    const metaDesc = isRtl 
      ? `تواصل مع ${clientName} (${clientTitle}) عبر بطاقته الرقمية الذكية. شارك جهات الاتصال بلمسة واحدة.`
      : `Connect with ${clientName} (${clientTitle}) via their professional digital card. Smart contact sharing in one tap.`;
    
    const updateTag = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    updateTag('meta[name="description"]', 'content', metaDesc);
    updateTag('meta[property="og:title"]', 'content', fullTitle);
    updateTag('meta[property="og:description"]', 'content', metaDesc);
    updateTag('meta[property="og:image"]', 'content', data.profileImage || '');
    updateTag('meta[name="twitter:title"]', 'content', fullTitle);
    updateTag('meta[name="twitter:description"]', 'content', metaDesc);
    
    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (data.profileImage && favicon) favicon.href = data.profileImage;

    return () => { 
      if (styleEl) styleEl.innerHTML = ''; 
    };
  }, [data, isRtl, customConfig]);

  const handleShare = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    const url = generateShareUrl(data);
    const professionalText = isRtl 
      ? `*${data.name}*\nتواصل معي عبر بطاقتي الرقمية:\n${url}`
      : `*${data.name}*\nConnect with me via my digital card:\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: data.name, text: professionalText, url: url });
      } else {
        navigator.clipboard.writeText(url);
        alert(isRtl ? "تم نسخ الرابط" : "Link copied");
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (data.isActive === false) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${data.isDark ? 'bg-[#050507] text-white' : 'bg-slate-50 text-gray-900'}`}>
         <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
            <PowerOff size={48} />
         </div>
         <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">{isRtl ? 'البطاقة معطلة حالياً' : 'Card Disabled'}</h1>
         <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 font-bold leading-relaxed">{t('The link you are trying to access is no longer available.')}</p>
         <a href="/" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">{isRtl ? 'العودة للرئيسية' : 'Back Home'}</a>
      </div>
    );
  }

  const { primary } = getColors();
  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return { r, g, b, string: `${r}, ${g}, ${b}` };
  };
  const rgb = hexToRgb(primary);
  
  const isDesktop = windowWidth >= 1024;
  const isFullHeaderEnabled = customConfig?.desktopLayout === 'full-width-header' && isDesktop;
  const cardBodyOffset = isDesktop ? 0 : (customConfig?.mobileBodyOffsetY ?? 0);
  const containerMarginTop = isFullHeaderEnabled ? (customConfig?.desktopBodyOffsetY ?? -60) : 0;

  return (
    <article className={`min-h-screen flex flex-col items-center relative transition-colors duration-1000 ${data.isDark ? 'dark' : ''}`}>
      {isFullHeaderEnabled && (
        <div className="w-full overflow-hidden relative shrink-0" style={{ height: `${customConfig?.headerHeight}px` }}>
           <div className="absolute inset-0 z-0">
              {data.themeType === 'image' && data.backgroundImage && <img src={data.backgroundImage} className="w-full h-full object-cover" alt="Header" />}
              {data.themeType === 'gradient' && <div className="w-full h-full" style={{ background: data.themeGradient }} />}
              {data.themeType === 'color' && <div className="w-full h-full" style={{ backgroundColor: data.themeColor }} />}
           </div>
        </div>
      )}

      <main className="w-full z-10 animate-fade-in-up pb-32 transition-all duration-700 mx-auto flex justify-center" 
        style={{ maxWidth: isFullHeaderEnabled ? '100%' : `${customConfig?.cardMaxWidth || 500}px`, marginTop: `${containerMarginTop}px` }}>
        <div className="w-full" style={{ maxWidth: `${customConfig?.cardMaxWidth || 500}px` }}>
           <CardPreview data={data} lang={lang} customConfig={customConfig} hideSaveButton={true} hideHeader={isFullHeaderEnabled} bodyOffsetYOverride={cardBodyOffset} />
           <div className="mt-12 text-center flex flex-col items-center gap-8 px-6">
              <nav><a href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all border group">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform" style={{ backgroundColor: primary }}><Plus size={18} /></div>
                  {isRtl ? 'أنشئ بطاقتك الرقمية الآن' : 'Create Your Digital Card Now'}
              </a></nav>
            </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] animate-bounce-in">
         <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-[2.5rem] p-3 shadow-[0_25px_50_px_-12px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <button onClick={() => downloadVCard(data)} className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-lg"
              style={{ backgroundColor: primary, boxShadow: `0 10px 25px -5px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` }}>
               <UserPlus size={18} /><span>{t('saveContact')}</span>
            </button>
            <button onClick={handleShare} disabled={isCapturing} className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-3xl hover:bg-gray-200 transition-colors">
               {isCapturing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
            </button>
         </div>
      </div>
    </article>
  );
};

export default PublicProfile;
