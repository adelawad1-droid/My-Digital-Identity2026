import { Language, CardData, CustomTemplate, TemplateCategory, PricingPlan } from '../types';
import { TRANSLATIONS, SAMPLE_DATA } from '../constants';
import { getAllTemplates, getAllCategories, auth, getUserProfile, getUserCards, getAllPricingPlans } from '../services/firebase';
import CardPreview from '../components/CardPreview';
import { Layout, Palette, Loader2, Plus, FolderOpen, Briefcase, PartyPopper, LayoutGrid, Star, ShieldCheck, Crown, AlertTriangle, Zap } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TemplatesGalleryProps {
  lang: Language;
  onSelect: (templateId: string) => void;
}

const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ lang, onSelect }) => {
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPrivateMode = searchParams.get('mode') === 'private';

  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [maxLimit, setMaxLimit] = useState(5);

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tData, cData, plans] = await Promise.all([
          getAllTemplates(),
          getAllCategories(),
          getAllPricingPlans()
        ]);
        
        const currentUid = auth.currentUser?.uid;
        if (currentUid) {
           const profile = await getUserProfile(currentUid);
           
           let limit = 5; // الافتراضي للمجاني
           if (profile?.planId) {
              const plan = plans.find(p => p.id === profile.planId);
              limit = plan?.maxCards || 10;
           } else if (profile?.role === 'admin') {
              limit = 1000;
           }
           
           setMaxLimit(limit);
           // نعتمد على العداد المسجل في سجل المستخدم لسرعة التحقق
           setIsLimitReached((profile?.cardCount || 0) >= limit);
        }

        let filteredTemplates = (tData as CustomTemplate[]).filter(t => t.isActive);
        
        if (isPrivateMode) {
           filteredTemplates = filteredTemplates.filter(t => t.restrictedUserId === currentUid);
        } else {
           filteredTemplates = filteredTemplates.filter(t => !t.restrictedUserId);
        }

        const activeCats = (cData as TemplateCategory[]).filter(c => c.isActive);
        setCustomTemplates(filteredTemplates);
        setCategories(activeCats);
        
        if (activeCats.length > 0) {
          const firstUsedCatId = activeCats.find(c => filteredTemplates.some(t => t.categoryId === c.id))?.id;
          setActiveCategoryId(firstUsedCatId || activeCats[0].id);
        }
      } catch (err) {
        console.error("Error fetching gallery data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isPrivateMode]);

  const handleSelectTemplate = (id: string) => {
    if (isLimitReached) {
       alert(t('limitReached'));
       navigate(`/${lang}/pricing`);
       return;
    }
    onSelect(id);
  };

  const filteredTemplates = customTemplates.filter(tmpl => tmpl.categoryId === activeCategoryId);

  const getCategoryTheme = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('عمل') || n.includes('business')) return { icon: Briefcase, color: 'bg-blue-600' };
    if (n.includes('مناسبات') || n.includes('occasion')) return { icon: PartyPopper, color: 'bg-indigo-600' };
    return { icon: LayoutGrid, color: 'bg-slate-700' };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-50 dark:border-blue-900/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-xs">{isRtl ? 'جاري تحميل التصاميم...' : 'Loading Designs...'}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fade-in-up space-y-10 md:space-y-16">
      
      {isLimitReached && (
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-shake shadow-xl">
           <div className="flex items-center gap-5">
              <div className="p-4 bg-red-100 text-red-600 rounded-2xl shadow-sm">
                 <AlertTriangle size={32} />
              </div>
              <div>
                 <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">{isRtl ? 'وصلت للحد الأقصى للبطاقات' : 'Card Limit Reached'}</h3>
                 <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">{t('limitReached')}</p>
              </div>
           </div>
           <button 
            onClick={() => navigate(`/${lang}/pricing`)}
            className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"
           >
              <Zap size={16} />
              {isRtl ? 'ترقية الباقة الآن' : 'Upgrade Plan Now'}
           </button>
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/20">
          {isPrivateMode ? <Crown size={12} className="text-amber-500" /> : <Palette size={12} />}
          {isPrivateMode ? (isRtl ? 'معرض التصاميم الخاصة بك' : 'Your Private Designs') : t('templates')}
        </div>
        <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter">
          {isPrivateMode ? (isRtl ? 'تصاميم صممت لك خصيصاً' : 'Designs Crafted For You') : (isRtl ? 'اختر نمط هويتك' : 'Select Your Identity Style')}
        </h1>
        <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-bold opacity-80 leading-relaxed">
          {isPrivateMode 
            ? (isRtl ? 'هنا تجد القوالب الحصرية المخصصة لحسابك فقط من قبل فريق هويتي.' : 'Here you find exclusive templates assigned to your account by the NextID team.')
            : (isRtl ? 'مجموعة من القوالب الاحترافية المصممة بعناية لتناسب كافة احتياجاتك.' : 'A collection of professional templates carefully designed for all your needs.')}
        </p>
      </div>

      <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
        <div className="flex items-center gap-2 md:gap-3 p-2 bg-white dark:bg-gray-900/50 rounded-2xl md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-xl">
          {categories.map(cat => {
            const theme = getCategoryTheme(isRtl ? cat.nameAr : cat.nameEn);
            const Icon = theme.icon;
            const isActive = activeCategoryId === cat.id;

            return (
              <button 
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex items-center gap-2 md:gap-4 px-6 md:px-12 py-3 md:py-5 rounded-xl md:rounded-[2.5rem] transition-all duration-500 whitespace-nowrap group ${isActive ? theme.color + ' text-white shadow-xl scale-[1.02]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div className={`p-1.5 md:p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-white'}`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                </div>
                <span className={`text-sm md:text-xl font-black uppercase tracking-tight ${isRtl ? 'font-cairo' : ''}`}>
                  {isRtl ? cat.nameAr : cat.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 pt-4 max-w-6xl mx-auto">
        {filteredTemplates.map(tmpl => (
          <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onSelect={handleSelectTemplate} sampleData={sampleCardData} isPrivate={isPrivateMode} disabled={isLimitReached} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 animate-fade-in mx-4">
           <FolderOpen className="mx-auto text-gray-200 dark:text-gray-800 mb-6 opacity-30" size={80} />
           <h3 className="text-xl font-black dark:text-white mb-2">{isRtl ? 'لا توجد تصاميم هنا حالياً' : 'No designs here yet'}</h3>
           <p className="text-xs text-gray-400 font-bold">{isPrivateMode ? (isRtl ? 'لم يتم تخصيص أي قوالب حصرية لحسابك بعد.' : 'No exclusive templates assigned to your account yet.') : (isRtl ? 'نعمل حالياً على إضافة المزيد من القوالب لهذا القسم.' : 'We are working on adding more templates to this section.')}</p>
        </div>
      )}
    </div>
  );
};

const TemplateCard = ({ tmpl, lang, onSelect, sampleData, isPrivate, disabled }: any) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const [mouseYPercentage, setMouseYPercentage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setMouseYPercentage(percentage);
  };

  const handleMouseLeave = () => {
    setMouseYPercentage(0);
  };

  return (
    <div className={`group flex flex-col transition-all duration-500 ${disabled ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative aspect-[9/16] w-full bg-white dark:bg-black rounded-[3.8rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.2)] overflow-hidden mb-8 group-hover:shadow-[0_50px_120px_-20px_rgba(0,0,0,0.3)] transition-all duration-700 border-[3px] border-gray-200 dark:border-gray-800 cursor-ns-resize`}
        style={{ isolation: 'isolate' }}
      >
        <div className="absolute inset-0 border-[8px] border-gray-950 dark:border-gray-900 rounded-[3.8rem] pointer-events-none z-50">
           <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 dark:bg-gray-900 rounded-full z-[60] border border-white/5 shadow-inner"></div>
        </div>
        
        {isPrivate ? (
           <div className="absolute top-10 left-10 z-[60] flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full font-black text-[9px] uppercase shadow-0 animate-pulse">
             <ShieldCheck size={12} fill="currentColor" />
             {isRtl ? 'تصميم حصري' : 'Exclusive'}
           </div>
        ) : tmpl.isFeatured && (
          <div className="absolute top-10 left-10 z-[60] flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-black text-[9px] uppercase shadow-0">
            <Star size={12} fill="currentColor" />
            {isRtl ? 'باقة برو' : 'Pro Template'}
          </div>
        )}
        
        <div className="absolute inset-[2px] overflow-hidden pointer-events-none" 
             style={{ 
               borderRadius: '3.6rem', 
               clipPath: 'inset(0 round 3.6rem)', 
               zIndex: 10,
               transform: 'translateZ(0)'
             }}>
           <div 
             className="h-full w-full transition-transform duration-[600ms] ease-out origin-top"
             style={{ 
               transform: `translateY(-${mouseYPercentage * 0.45}%)`,
               willChange: 'transform'
             }}
           >
              <CardPreview 
                data={{ 
                  ...sampleData, 
                  templateId: tmpl.id,
                  name: tmpl.config.defaultName || sampleData.name,
                  title: tmpl.config.defaultTitle || sampleData.title,
                  company: tmpl.config.defaultCompany || sampleData.company,
                  bio: (isRtl ? tmpl.config.defaultBioAr : tmpl.config.defaultBioEn) || sampleData.bio,
                  themeType: tmpl.config.defaultThemeType || sampleData.themeType,
                  themeColor: tmpl.config.defaultThemeColor || sampleData.themeColor,
                  themeGradient: tmpl.config.defaultThemeGradient || sampleData.themeGradient,
                  backgroundImage: tmpl.config.defaultBackgroundImage || sampleData.backgroundImage,
                  profileImage: tmpl.config.defaultProfileImage || sampleData.profileImage || '',
                  isDark: tmpl.config.defaultIsDark ?? sampleData.isDark,
                  showOccasion: tmpl.config.showOccasionByDefault ?? false,
                  specialLinksCols: tmpl.config.specialLinksCols || 2,
                  socialIconColumns: tmpl.config.socialIconColumns || 0,
                  specialLinks: (tmpl.config.defaultSpecialLinks && tmpl.config.defaultSpecialLinks.length > 0) 
                                 ? tmpl.config.defaultSpecialLinks 
                                 : sampleData.specialLinks,
                  // إزالة قيم الظهور القسرية والاعتماد على إعدادات القالب الافتراضية
                  showName: tmpl.config.showNameByDefault, 
                  showTitle: tmpl.config.showTitleByDefault, 
                  showBio: tmpl.config.showBioByDefault, 
                  showQrCode: tmpl.config.showQrCodeByDefault, 
                  showButtons: tmpl.config.showButtonsByDefault, 
                  showSocialLinks: tmpl.config.showSocialLinksByDefault
                }} 
                lang={lang} 
                customConfig={tmpl.config}
                hideSaveButton={true} 
                isFullFrame={true}
                bodyOffsetYOverride={tmpl.config.mobileBodyOffsetY ?? 0}
              />
           </div>
        </div>

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-[70]">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onSelect(tmpl.id);
             }}
             className={`${disabled ? 'bg-red-600' : 'bg-blue-600'} text-white px-12 py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-0 flex items-center justify-center gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer`}
           >
             {disabled ? (isRtl ? 'ترقية الباقة (تم الوصول للحد)' : 'Upgrade (Limit Reached)') : (isPrivate ? (isRtl ? 'تحرير بطاقتي الخاصة' : 'Edit My Private Card') : t('useTemplate'))}
             {disabled ? <Zap size={18} /> : <Plus size={18} />}
           </button>
        </div>
      </div>

      <div className="px-6 text-center sm:text-start flex flex-col gap-2">
         <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPrivate ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : tmpl.isFeatured ? 'bg-amber-50 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-600'}`}></div>
            <h3 className="text-xl md:text-2xl font-black dark:text-white uppercase tracking-tight truncate">
              {isRtl ? tmpl.nameAr : tmpl.nameEn}
            </h3>
         </div>
         <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed uppercase tracking-widest px-1">
           {isRtl ? tmpl.descAr : tmpl.descEn}
         </p>
      </div>
    </div>
  );
};

export default TemplatesGallery;