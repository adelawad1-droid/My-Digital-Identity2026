
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Plus, X, Loader2, Sparkles, Moon, Sun, 
  Mail, Phone, Globe, MessageCircle, Link as LinkIcon, 
  CheckCircle2, AlertCircle, UploadCloud, ImageIcon, 
  Palette, Layout, User as UserIcon, Camera, 
  Pipette, Type as TypographyIcon, Smartphone, Tablet, Monitor, Eye, 
  RefreshCcw, FileText, Calendar, MapPin, PartyPopper, Move, Wind, 
  GlassWater, Link2, Sparkle, LayoutGrid, EyeOff, Ruler, Wand2, Building2, Timer,
  QrCode, Share2, Trash2, LogIn, Shapes, Navigation2, ImagePlus, Check, Search, AlertTriangle, Zap,
  Briefcase, ShieldCheck, Crown, ShoppingCart, Globe2, Star, ChevronRight, ChevronLeft,
  Quote, PhoneCall, MonitorDot, ArrowLeftRight, Box, SlidersHorizontal, Grid, Maximize2, ExternalLink, Lock
} from 'lucide-react';
import CardPreview from '../components/CardPreview';
import SocialIcon, { BRAND_COLORS } from '../components/SocialIcon';
import AuthModal from '../components/AuthModal';
import { BACKGROUND_PRESETS, AVATAR_PRESETS, SAMPLE_DATA, SOCIAL_PLATFORMS, THEME_COLORS, THEME_GRADIENTS, TRANSLATIONS, AVAILABLE_FONTS } from '../constants';
import { isSlugAvailable, auth, getSiteSettings, getUserProfile } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { CardData, CustomTemplate, Language, SpecialLinkItem, ThemeType } from '../types';
import { generateSerialId } from '../utils/share';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData, oldId?: string) => void;
  onCancel: () => void;
  initialData?: CardData;
  isAdminEdit?: boolean;
  templates: CustomTemplate[];
  forcedTemplateId?: string; 
}

type EditorTab = 'identity' | 'contact_numbers' | 'social' | 'links' | 'special_links' | 'membership' | 'event' | 'theme' | 'design';

const Editor: React.FC<EditorProps> = ({ lang, onSave, onCancel, initialData, isAdminEdit, templates, forcedTemplateId }) => {
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const t = (key: string, fallback?: string) => {
    if (fallback && !TRANSLATIONS[key]) return isRtl ? key : fallback;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const bodyBgFileInputRef = useRef<HTMLInputElement>(null);
  const specialLinkInputRef = useRef<HTMLInputElement>(null);
  const originalIdRef = useRef<string | null>(initialData?.id || null);

  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [isSlugVerified, setIsSlugVerified] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isUploadingBodyBg, setIsUploadingBodyBg] = useState(false);
  const [isUploadingSpecialImg, setIsUploadingSpecialImg] = useState(false);
  const [uploadConfig, setUploadConfig] = useState({ storageType: 'database' as const, uploadUrl: '' });
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });
  const [showModeInfo, setShowModeInfo] = useState(true);

  // تحريك المعاينة
  const [mouseYPercentage, setMouseYPercentage] = useState(0);
  const [sidebarMouseYPercentage, setSidebarMouseYPercentage] = useState(0);

  useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings) setUploadConfig({ storageType: (settings.imageStorageType as any) || 'database', uploadUrl: settings.serverUploadUrl || '' });
    });
    if (auth.currentUser) {
      getUserProfile(auth.currentUser.uid).then(profile => { 
        if (profile) setUserProfile(profile); 
      });
    }
  }, []);

  const isPremium = userProfile?.role === 'premium' || userProfile?.role === 'admin' || !!userProfile?.planId || isAdminEdit;

  const tabs: {id: EditorTab, label: string, icon: any, color: string, isPro?: boolean}[] = [
    { id: 'identity', label: t('الهوية', 'Identity'), icon: UserIcon, color: 'text-blue-600' },
    { id: 'links', label: t('الروابط', 'Links'), icon: LinkIcon, color: 'text-purple-600' },
    { id: 'contact_numbers', label: t('contactNumbers'), icon: PhoneCall, color: 'text-indigo-600' },
    { id: 'special_links', label: t('روابط الصور', 'Image Links'), icon: ImagePlus, color: 'text-pink-600' },
    { id: 'social', label: t('شبكات التواصل', 'Social Networks'), icon: Share2, color: 'text-emerald-600' },
    { id: 'membership', label: t('العضوية', 'Membership'), icon: ShieldCheck, color: 'text-amber-600', isPro: true },
    { id: 'event', label: t('المناسبة', 'Event'), icon: Calendar, color: 'text-rose-600', isPro: true },
    { id: 'theme', label: t('الألوان والسمة', 'Theme'), icon: Sparkles, color: 'text-blue-500', isPro: true },
    { id: 'design', label: t('المظهر', 'Design'), icon: Palette, color: 'text-indigo-600', isPro: true },
  ];

  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

  const [formData, setFormData] = useState<CardData>(() => {
    const targetTemplateId = initialData?.templateId || forcedTemplateId || templates[0]?.id || 'classic';
    const selectedTmpl = templates.find(t => t.id === targetTemplateId);
    if (initialData) return { ...initialData, emails: initialData.emails || [], websites: initialData.websites || [], specialLinks: initialData.specialLinks || [], socialIconColumns: initialData.socialIconColumns || 0 };
    const baseData = { ...(SAMPLE_DATA[lang] || SAMPLE_DATA['en']), id: generateSerialId(), templateId: targetTemplateId } as CardData;
    if (selectedTmpl) {
       return {
         ...baseData,
         templateId: targetTemplateId,
         themeType: selectedTmpl.config.defaultThemeType || baseData.themeType,
         themeColor: selectedTmpl.config.defaultThemeColor || baseData.themeColor,
         themeGradient: selectedTmpl.config.defaultThemeGradient || baseData.themeGradient,
         backgroundImage: selectedTmpl.config.defaultBackgroundImage || baseData.backgroundImage,
         isDark: selectedTmpl.config.defaultIsDark ?? baseData.isDark,
         cardBodyColor: selectedTmpl.config.cardBodyColor || '#ffffff',
         cardBodyThemeType: selectedTmpl.config.cardBodyThemeType || 'color',
         specialLinksCols: selectedTmpl.config.specialLinksCols || 2,
         showSpecialLinks: selectedTmpl.config.showSpecialLinksByDefault ?? true,
         specialLinks: selectedTmpl.config.defaultSpecialLinks || [],
         fontFamily: selectedTmpl.config.fontFamily || 'Cairo',
         socialIconColumns: selectedTmpl.config.socialIconColumns || 0
       } as CardData;
    }
    return baseData;
  });

  const handleChange = (field: keyof CardData, value: any) => {
    if (field === 'id') { 
      value = (value || '').toLowerCase().replace(/[^a-z0-9-]/g, ''); 
      setIsSlugVerified(value === originalIdRef.current);
      setSlugStatus('idle');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckSlug = async () => {
    if (!formData.id || formData.id.length < 3) { setSlugStatus('invalid'); setIsSlugVerified(false); return; }
    setIsCheckingSlug(true);
    try {
      const available = await isSlugAvailable(formData.id, auth.currentUser?.uid);
      setSlugStatus(available ? 'available' : 'taken');
      setIsSlugVerified(available);
    } catch (e) { setSlugStatus('idle'); } finally { setIsCheckingSlug(false); }
  };

  const handleNext = () => { if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id); window.scrollTo(0,0); };
  const handlePrev = () => { if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id); window.scrollTo(0,0); };

  const currentTemplate = templates.find(t => t.id === formData.templateId);

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setMouseYPercentage(percentage);
  };

  const handleSidebarPreviewMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setSidebarMouseYPercentage(percentage);
  };

  const VisibilityToggle = ({ field, label }: { field: keyof CardData, label: string }) => {
    const isVisible = formData[field] !== false;
    return (
      <button type="button" onClick={() => handleChange(field, !isVisible)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${isVisible ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-800'}`}>
        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        <span className="text-[9px] font-black uppercase">{label || (isVisible ? t('إظهار', 'Show') : t('إخفاء', 'Hide'))}</span>
      </button>
    );
  };

  const RangeControl = ({ label, value, min, max, onChange, icon: Icon, unit = "px", hint }: any) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Icon size={14} /></div>}
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
              {hint && <span className="text-[7px] text-gray-400 font-bold">{hint}</span>}
           </div>
        </div>
        <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-full px-3 py-0.5 border border-blue-100 dark:border-blue-800/30">
           <span className="text-xs font-black text-blue-600">{value}</span>
           <span className="text-[8px] font-black text-blue-400 ml-1">{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
  );

  const ColorPickerUI = ({ label, field, icon: Icon, onAfterChange }: { label: string, field: keyof CardData, icon?: any, onAfterChange?: (val: string) => void }) => (
    <div className="bg-white dark:bg-gray-950 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">{Icon && <Icon size={16} className="text-gray-400" />}<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span></div>
      <div className="flex items-center gap-3">
         <div className="relative w-8 h-8 rounded-xl overflow-hidden border shadow-sm">
            <input type="color" value={(formData[field] as string) || '#3b82f6'} onChange={(v) => { handleChange(field, v.target.value); if (onAfterChange) onAfterChange(v.target.value); }} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
            <div className="w-full h-full" style={{ backgroundColor: (formData[field] as string) || '#3b82f6' }} />
         </div>
         <input type="text" value={((formData[field] as string) || '').toUpperCase()} onChange={(e) => { handleChange(field, e.target.value); if (onAfterChange) onAfterChange(e.target.value); }} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-2 py-1.5 text-[9px] font-black text-blue-600 w-16 uppercase text-center outline-none" placeholder="#HEX" />
      </div>
    </div>
  );

  const inputClasses = "w-full px-5 py-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all font-bold text-sm shadow-none";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-2";

  const isFullHeaderActive = currentTemplate?.config.desktopLayout === 'full-width-header';
  const cardBodyOffset = currentTemplate?.config.mobileBodyOffsetY ?? 0;
  
  const previewPageBg = currentTemplate?.config.pageBgStrategy === 'mirror-header' 
    ? (formData.themeType === 'color' ? formData.themeColor : '#f8fafc')
    : (currentTemplate?.config.pageBgColor || (formData.isDark ? '#050507' : '#f8fafc'));

  const handleSpecialLinkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSpecialImg(true);
    try {
      const b = await uploadImageToCloud(file, 'avatar', uploadConfig as any);
      if (b) {
        const newItem: SpecialLinkItem = {
          id: Date.now().toString(),
          imageUrl: b,
          linkUrl: '',
          titleAr: '',
          titleEn: ''
        };
        handleChange('specialLinks', [...(formData.specialLinks || []), newItem]);
      }
    } finally {
      setIsUploadingSpecialImg(false);
    }
  };

  const updateSpecialLink = (id: string, field: keyof SpecialLinkItem, value: string) => {
    const updated = (formData.specialLinks || []).map(l => l.id === id ? { ...l, [field]: value } : l);
    handleChange('specialLinks', updated);
  };

  const removeSpecialLink = (id: string) => {
    handleChange('specialLinks', (formData.specialLinks || []).filter(l => l.id !== id));
  };

  const handleSaveDirect = () => {
    if (!auth.currentUser) {
      setShowAuthWarning(true);
      return;
    }
    onSave(formData, originalIdRef.current || undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050507] pb-40">
      
      {/* عرض رسالة نوع المحرر - تظهر فقط للمستخدمين المجانيين (غير المشتركين) */}
      {showModeInfo && !isPremium && (
         <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6">
            <div className={`p-6 rounded-[2.5rem] border bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in`}>
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl bg-blue-600 text-white shadow-lg`}>
                      <UserIcon size={32}/>
                   </div>
                   <div>
                      <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">
                        {t('basicEditorTitle')}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-1">
                        {t('basicEditorDesc')}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => navigate(`/${lang}/pricing`)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
                      {t('upgradeToCustomize')}
                   </button>
                   <button onClick={() => setShowModeInfo(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={20}/></button>
                </div>
            </div>
         </div>
      )}

      {/* زر المعاينة العائم للجوال */}
      <div className="lg:hidden fixed bottom-24 right-6 z-[2000]">
         <button 
           onClick={() => setShowMobilePreview(true)}
           className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
         >
            <Smartphone size={24} />
         </button>
      </div>

      {/* نافذة المعاينة في الجوال */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-2xl animate-fade-in flex flex-col">
            <div className="p-4 flex justify-between items-center bg-black/40 text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Smartphone size={18} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
                </div>
                <button onClick={() => setShowMobilePreview(false)} className="p-2 bg-white/10 rounded-xl hover:bg-red-500 transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                <div 
                  onMouseMove={handlePreviewMouseMove}
                  onMouseLeave={() => setMouseYPercentage(0)}
                  className="relative h-full max-h-[85vh] aspect-[9/19.5] rounded-[3.5rem] border-[12px] border-gray-950 dark:border-gray-900 overflow-hidden bg-white dark:bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col cursor-ns-resize"
                >
                    <div 
                      className="absolute inset-0 z-10 transition-transform duration-500 ease-out origin-top overflow-hidden"
                      style={{ transform: `translateY(-${mouseYPercentage * 0.7}%)` }}
                    >
                        <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} isFullFrame={false} />
                    </div>
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 dark:bg-gray-900 rounded-full z-[60] border border-white/5 shadow-inner"></div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-20 pointer-events-none"></div>
                </div>
            </div>
        </div>
      )}

      {showAuthWarning && <AuthModal lang={lang} onClose={() => setShowAuthWarning(false)} onSuccess={() => { setShowAuthWarning(false); }} />}

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-8">
        
        {/* شريط التبويبات الجانبي لسطح المكتب */}
        <aside className="hidden lg:flex w-64 flex-col gap-2 shrink-0 sticky top-24 h-fit">
           <div className="bg-white dark:bg-gray-900 p-4 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
              {tabs.map((tab) => {
                const isLocked = tab.isPro && !isPremium;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => {
                      if (isLocked) {
                        setActiveTab(tab.id); // ننتقل لها لنعرض رسالة الترقية داخل التبويب
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-3">
                       <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    </div>
                    {isLocked && <Lock size={12} className="text-gray-300" />}
                  </button>
                );
              })}
           </div>
        </aside>

        {/* منطقة المحتوى الرئيسية */}
        <main className="flex-1 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden flex flex-col min-h-[700px]">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    {(() => { const Icon = tabs[currentIndex].icon; return <Icon size={150} />; })()}
                </div>
                
                <div className="p-6 md:p-10 flex-1">
                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-[1.2rem] bg-slate-50 dark:bg-gray-800 ${tabs[currentIndex].color} shadow-sm`}>
                              {React.createElement(tabs[currentIndex].icon, { size: 24 })}
                          </div>
                          <div>
                              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{tabs[currentIndex].label}</h2>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{t('المرحلة', 'Step')} {currentIndex + 1} {t('من', 'of')} {tabs.length}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {tabs.map((_, i) => <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= currentIndex ? 'w-6 bg-blue-600' : 'w-2 bg-gray-100 dark:bg-gray-800'}`} />)}
                        </div>
                    </div>

                    <div className="min-h-[450px]">
                        {/* فحص إذا كان التبويب مخصص للمحترفين والمستخدم مجاني */}
                        {tabs[currentIndex].isPro && !isPremium ? (
                           <div className="flex flex-col items-center justify-center text-center py-20 space-y-8 animate-fade-in">
                              <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-xl animate-bounce">
                                 <Crown size={48} />
                              </div>
                              <div className="space-y-3">
                                 <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'ميزة مخصصة للمشتركين' : 'Exclusive Pro Feature'}</h3>
                                 <p className="text-sm font-bold text-gray-400 max-w-sm mx-auto leading-relaxed">
                                   {isRtl ? 'أنت تستخدم المحرر الأساسي المجاني. تعديل هذا القسم متاح فقط لمشتركي الباقات الاحترافية.' : 'You are using the Basic Free Editor. Customizing this section is only available for Pro subscribers.'}
                                 </p>
                              </div>
                              <button 
                                onClick={() => navigate(`/${lang}/pricing`)}
                                className="px-12 py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                              >
                                 {t('upgradeToCustomize')}
                                 <ChevronRight size={18} className={isRtl ? 'rotate-180' : ''} />
                              </button>
                           </div>
                        ) : (
                          <>
                            {activeTab === 'identity' && (
                              <div className="space-y-8 animate-fade-in">
                                <div className="space-y-3">
                                   <label className={labelClasses}>{t('رابط البطاقة المخصص (URL)', 'Personal URL Path')}</label>
                                   <div className="flex gap-2">
                                      <div className={`flex-1 flex items-center bg-gray-50 dark:bg-gray-950 rounded-[1.5rem] border ${slugStatus === 'available' ? 'border-emerald-500' : slugStatus === 'taken' ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} px-5 py-4`}>
                                         <span className="text-[10px] font-bold text-gray-400">nextid.my/?u=</span>
                                         <input type="text" value={formData.id} onChange={e => handleChange('id', e.target.value)} className="flex-1 bg-transparent border-none outline-none font-black text-sm dark:text-white" />
                                      </div>
                                      <button onClick={handleCheckSlug} disabled={isCheckingSlug} className="px-12 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[9px] uppercase shadow-lg disabled:opacity-50 transition-all hover:bg-emerald-700">
                                         {isCheckingSlug ? <Loader2 size={16} className="animate-spin" /> : t('تحقق', 'Check')}
                                      </button>
                                   </div>
                                   {slugStatus === 'available' && <p className="text-[9px] font-black text-emerald-500 px-4 uppercase">{t('الرابط متاح للاستخدام', 'URL is available!')}</p>}
                                   {slugStatus === 'taken' && <p className="text-[9px] font-black text-red-500 px-4 uppercase">{t('الرابط محجوز مسبقاً', 'URL is already taken')}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="space-y-2"><div className="flex justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('الاسم الكامل', 'Full Name')}</label><VisibilityToggle field="showName" label="" /></div><input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={isRtl ? 'أحمد محمد' : 'John Doe'} /></div>
                                   <div className="space-y-2"><div className="flex justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('jobTitle')}</label><VisibilityToggle field="showTitle" label="" /></div><input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder="Senior Software Engineer" /></div>
                                   <div className="space-y-2 md:col-span-2">
                                      <div className="flex justify-between px-2">
                                        <label className={labelClasses + " !mb-0"}>{t('company')}</label>
                                        <VisibilityToggle field="showCompany" label="" />
                                      </div>
                                      <input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} placeholder={isRtl ? 'اسم الشركة' : 'Company Name'} />
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <div className="flex items-center justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('bio')}</label><VisibilityToggle field="showBio" label="" /></div>
                                   <textarea rows={3} value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className={inputClasses} placeholder="Write something inspiring about yourself..." />
                                </div>

                                <div className="space-y-2">
                                   <label className={labelClasses}>{t('الخط المستخدم', 'Font Family')}</label>
                                   <select 
                                     value={formData.fontFamily || 'Cairo'} 
                                     onChange={e => handleChange('fontFamily', e.target.value)} 
                                     className={inputClasses}
                                   >
                                     {AVAILABLE_FONTS.map(font => (
                                       <option key={font.id} value={font.id}>{isRtl ? font.nameAr : font.name}</option>
                                     ))}
                                   </select>
                                </div>

                                <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                                   <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-3">
                                         <Camera className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('صورتك الشخصية', 'Profile Image')}</h3>
                                      </div>
                                      <VisibilityToggle field="showProfileImage" label="" />
                                   </div>
                                   <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50/50 dark:bg-gray-950 rounded-[2rem] border border-dashed border-gray-100 dark:border-gray-800">
                                      <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-gray-900 shadow-xl border-4 border-white dark:border-gray-700 overflow-hidden flex items-center justify-center relative shrink-0">
                                         {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={32} className="text-gray-200" />}
                                         {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                                      </div>
                                      <div className="flex-1 space-y-4 w-full">
                                         <input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setIsUploading(true); try { const url = await uploadImageToCloud(f, 'avatar', uploadConfig as any); if (url) handleChange('profileImage', url); } finally { setIsUploading(false); } }} className="hidden" accept="image/*" />
                                         <button type="button" onClick={() => { if (!auth.currentUser) setShowAuthWarning(true); else fileInputRef.current?.click(); }} className="w-full py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl font-black text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"><UploadCloud size={16}/> {t('رفع صورة جديدة', 'Upload Image')}</button>
                                         <div className="grid grid-cols-6 gap-2 overflow-x-auto no-scrollbar">
                                            {AVATAR_PRESETS.map((p, idx) => <button key={idx} onClick={() => handleChange('profileImage', p)} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-600 transition-all shrink-0"><img src={p} className="w-full h-full object-cover" /></button>)}
                                         </div>
                                      </div>
                                   </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'links' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-3">
                                        <label className={labelClasses + " !mb-0"}>{t('عناوين البريد الإلكتروني', 'Emails')}</label>
                                        <VisibilityToggle field="showEmail" label="" />
                                      </div>
                                      <button type="button" onClick={() => handleChange('emails', [...(formData.emails || []), ''])} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[9px] font-black uppercase"><Plus size={12}/> {t('إضافة بريد', 'Add Email')}</button>
                                    </div>
                                    {(formData.emails || []).map((email, idx) => (
                                       <div key={idx} className="flex gap-2">
                                          <div className="relative flex-1"><Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} /><input type="email" value={email} onChange={e => { const l = [...(formData.emails || [])]; l[idx] = e.target.value; handleChange('emails', l); }} className={inputClasses} placeholder="mail@example.com" /></div>
                                          <button type="button" onClick={() => { const l = [...(formData.emails || [])]; l.splice(idx, 1); handleChange('emails', l); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={18}/></button>
                                       </div>
                                    ))}
                                 </div>

                                 <div className="space-y-4 pt-6 border-t dark:border-gray-800">
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-3">
                                        <label className={labelClasses + " !mb-0"}>{t('المواقع والروابط', 'Websites')}</label>
                                        <VisibilityToggle field="showWebsite" label="" />
                                      </div>
                                      <button type="button" onClick={() => handleChange('websites', [...(formData.websites || []), ''])} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[9px] font-black uppercase"><Plus size={12}/> {t('إضافة رابط', 'Add Link')}</button>
                                    </div>
                                    {(formData.websites || []).map((web, idx) => (
                                       <div key={idx} className="flex gap-2">
                                          <div className="relative flex-1"><Globe2 className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} /><input type="text" value={web} onChange={e => { const l = [...(formData.websites || [])]; l[idx] = e.target.value; handleChange('websites', l); }} className={inputClasses} placeholder="www.yoursite.com" /></div>
                                          <button type="button" onClick={() => { const l = [...(formData.websites || [])]; l.splice(idx, 1); handleChange('websites', l); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={18}/></button>
                                       </div>
                                    ))}
                                 </div>

                                 <div className="pt-6 border-t dark:border-gray-800 space-y-4">
                                    <div className="flex items-center gap-3 px-2"><MapPin className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('locationSection')}</h3><VisibilityToggle field="showLocation" label="" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div className="space-y-1.5"><label className={labelClasses}>{t('العنوان التفصيلي', 'Address')}</label><input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} className={inputClasses} placeholder={isRtl ? 'الرياض، السعودية' : 'Riyadh, SA'} /></div>
                                       <div className="space-y-1.5"><label className={labelClasses}>{t('رابط قوقل ماب', 'Maps Link')}</label><input type="url" value={formData.locationUrl} onChange={e => handleChange('locationUrl', e.target.value)} className={inputClasses} placeholder="https://maps.google.com/..." /></div>
                                    </div>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'contact_numbers' && (
                              <div className="space-y-8 animate-fade-in">
                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-4">
                                   <div className="p-3 bg-white dark:bg-indigo-900/30 rounded-xl text-indigo-600 shadow-sm"><PhoneCall size={24}/></div>
                                   <div>
                                      <h3 className="font-black dark:text-white uppercase tracking-tighter">{t('أرقام الاتصال والواتساب', 'Contact Numbers')}</h3>
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('تفعيل أزرار الاتصال السريع في البطاقة', 'Enable quick action buttons')}</p>
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="space-y-3">
                                      <div className="flex justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('رقم الهاتف', 'Phone Number')}</label><VisibilityToggle field="showPhone" label="" /></div>
                                      <div className="relative">
                                         <Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                                         <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClasses} placeholder="+966 5..." />
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('رقم الواتساب', 'WhatsApp Number')}</label><VisibilityToggle field="showWhatsapp" label="" /></div>
                                      <div className="relative">
                                         <MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                                         <input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={inputClasses} placeholder="9665..." />
                                      </div>
                                   </div>
                                </div>

                                <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('ألوان الأزرار', 'Button Colors')}</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <ColorPickerUI label={t('زر الهاتف', 'Phone Button')} field="contactPhoneColor" icon={Phone} />
                                      <ColorPickerUI label={t('زر الواتساب', 'WhatsApp Button')} field="contactWhatsappColor" icon={MessageCircle} />
                                   </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'social' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 space-y-6">
                                    <div className="flex items-center gap-3">
                                       <Palette className="text-emerald-600" size={20} />
                                       <h4 className="text-[10px] font-black uppercase tracking-widest dark:text-white">{t('تنسيق الأيقونات', 'Icon Styling')}</h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-gray-800 shadow-sm">
                                          <div className="flex items-center gap-3">
                                             <Zap size={16} className={formData.useSocialBrandColors ? "text-emerald-600" : "text-gray-300"} />
                                             <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">{t('الألوان الأصلية للمنصات', 'Use Brand Colors')}</span>
                                          </div>
                                          <button type="button" onClick={() => handleChange('useSocialBrandColors', !formData.useSocialBrandColors)} className={`w-12 h-6 rounded-full relative transition-all ${formData.useSocialBrandColors ? 'bg-emerald-600 shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.useSocialBrandColors ? 'right-7' : 'right-1') : (formData.useSocialBrandColors ? 'left-7' : 'left-1')}`} />
                                          </button>
                                       </div>

                                       {!formData.useSocialBrandColors && (
                                          <ColorPickerUI label={t('لون أيقونات التواصل', 'Social Icons Color')} field="socialIconsColor" icon={Pipette} />
                                       )}
                                    </div>

                                    {/* الخيار الجديد لعدد الأيقونات في الصف الواحد */}
                                    <div className="grid grid-cols-1 gap-4 pt-2">
                                       <RangeControl 
                                          label={isRtl ? 'عدد الأيقونات في الصف' : 'Icons per row'} 
                                          min={0} max={6} 
                                          value={formData.socialIconColumns || 0} 
                                          onChange={(v: number) => handleChange('socialIconColumns', v)} 
                                          icon={Grid} 
                                          unit="" 
                                          hint={isRtl ? 'اختر 0 للتوزيع التلقائي' : 'Choose 0 for Flex layout'}
                                       />
                                    </div>
                                 </div>

                                 <div className="flex flex-col md:flex-row gap-3 items-end">
                                    <div className="flex-1 w-full space-y-2"><label className={labelClasses}>{t('المنصة', 'Platform')}</label><select value={socialInput.platformId} onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} className={inputClasses}>{SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                                    <div className="flex-[2] w-full space-y-2"><label className={labelClasses}>{t('رابط الحساب', 'Profile URL')}</label><input type="text" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} className={inputClasses} placeholder="https://..." /></div>
                                    <button type="button" onClick={() => { if (!socialInput.url) return; const platform = SOCIAL_PLATFORMS.find(p => p.id === socialInput.platformId); setFormData(prev => ({ ...prev, socialLinks: [...(prev.socialLinks || []), { platform: platform!.name, url: socialInput.url, platformId: platform!.id }] })); setSocialInput({ ...socialInput, url: '' }); }} className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-black transition-all"><Plus size={24} /></button>
                                 </div>

                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {formData.socialLinks.map((link, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 group transition-all">
                                         <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800"><SocialIcon platformId={link.platformId} size={18} /></div>
                                            <div className="min-w-0"><p className="text-[8px] font-black uppercase text-gray-400">{link.platform}</p><p className="text-xs font-bold truncate max-w-[120px] dark:text-white">{link.url}</p></div>
                                         </div>
                                         <button type="button" onClick={() => { const u = [...formData.socialLinks]; u.splice(idx, 1); handleChange('socialLinks', u); }} className="p-2 text-red-400 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16}/></button>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            )}

                            {activeTab === 'special_links' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                         <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-2xl shadow-sm"><ImagePlus size={24} /></div>
                                         <h2 className="text-xl font-black dark:text-white uppercase tracking-widest">{t('specialLinks')}</h2>
                                      </div>
                                      <VisibilityToggle field="showSpecialLinks" label="" />
                                    </div>

                                    <div className="space-y-6">
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <RangeControl label={t('عدد الأعمدة', 'Columns')} min={1} max={3} value={formData.specialLinksCols || 2} onChange={(v: number) => handleChange('specialLinksCols', v)} icon={Grid} unit="" />
                                       </div>

                                       <div className="space-y-4 pt-4 border-t dark:border-white/5">
                                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('نسبة العرض للارتفاع', 'Aspect Ratio Selection')}</label>
                                          <div className="grid grid-cols-3 gap-3">
                                             {[
                                               { id: 'square', label: 'مربع' },
                                               { id: 'video', label: 'بانورامي' },
                                               { id: 'portrait', label: 'طولي' }
                                             ].map(ratio => (
                                                <button 
                                                  key={ratio.id} 
                                                  onClick={() => handleChange('specialLinksAspectRatio', ratio.id)} 
                                                  className={`py-4 rounded-2xl border-2 transition-all font-black text-[9px] uppercase ${formData.specialLinksAspectRatio === ratio.id ? 'bg-pink-600 text-white border-pink-600 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                                                >
                                                   {t(ratio.label, ratio.id.toUpperCase())}
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                    </div>

                                    <div className="pt-8 border-t dark:border-white/10 space-y-6">
                                       <div className="flex items-center justify-between">
                                          <h4 className="text-[12px] font-black dark:text-white uppercase tracking-widest">{t('إدارة الصور والروابط', 'Manage Items')}</h4>
                                          <button 
                                            type="button" 
                                            onClick={() => specialLinkInputRef.current?.click()}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all"
                                          >
                                             <Plus size={14} />
                                             {t('إضافة عنصر', 'Add Item')}
                                          </button>
                                          <input type="file" ref={specialLinkInputRef} className="hidden" onChange={handleSpecialLinkUpload} accept="image/*" />
                                       </div>

                                       <div className="grid grid-cols-1 gap-4">
                                          {(formData.specialLinks || []).map((link) => (
                                             <div key={link.id} className="flex flex-col md:flex-row gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-800 group">
                                                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-gray-900 relative">
                                                   <img src={link.imageUrl} className="w-full h-full object-cover" alt="Item" />
                                                   {isUploadingSpecialImg && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 size={16} className="animate-spin text-white" /></div>}
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                   <div className="space-y-1">
                                                      <label className="text-[8px] font-black text-pink-600 uppercase px-1">{t('رابط الوجهة', 'Link URL')}</label>
                                                      <input type="url" value={link.linkUrl} onChange={e => updateSpecialLink(link.id, 'linkUrl', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-pink-500" />
                                                   </div>
                                                   <div className="space-y-1">
                                                      <label className="text-[8px] font-black text-pink-600 uppercase px-1">{t('العنوان', 'Title')}</label>
                                                      <input type="text" value={isRtl ? link.titleAr : link.titleEn} onChange={e => updateSpecialLink(link.id, isRtl ? 'titleAr' : 'titleEn', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-pink-500" placeholder={t('أدخل العنوان', 'Enter Title')} />
                                                   </div>
                                                </div>
                                                <button onClick={() => removeSpecialLink(link.id)} className="p-3 text-gray-400 hover:text-red-500 rounded-xl transition-all self-center"><Trash2 size={18} /></button>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'membership' && (
                              <div className="space-y-8 animate-fade-in">
                                <div className="space-y-6">
                                   <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-[1.5rem] flex items-center justify-between border border-indigo-100 dark:border-indigo-900/30">
                                      <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-indigo-600" /><p className="font-black dark:text-white text-xs uppercase">{t('تفعيل شريط العضوية', 'Enable Membership Bar')}</p></div>
                                      <button type="button" onClick={() => handleChange('showMembership', !formData.showMembership)} className={`w-12 h-6 rounded-full relative transition-all ${formData.showMembership ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isRtl ? (formData.showMembership ? 'right-6' : 'right-0.5') : (formData.showMembership ? 'left-6' : 'left-0.5')}`} /></button>
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2"><label className={labelClasses}>{t('عنوان العضوية', 'Membership Title')}</label><input type="text" value={formData.membershipTitleAr} onChange={e => handleChange('membershipTitleAr', e.target.value)} className={inputClasses} /></div>
                                      <div className="space-y-2"><label className={labelClasses}>{t('اللون المميز', 'Accent Color')}</label><ColorPickerUI label="" field="membershipAccentColor" icon={Zap} /></div>
                                      <div className="space-y-2"><label className={labelClasses}>{t('تاريخ البدء', 'Start Date')}</label><input type="date" value={formData.membershipStartDate} onChange={e => handleChange('membershipStartDate', e.target.value)} className={inputClasses} /></div>
                                      <div className="space-y-2"><label className={labelClasses}>{t('تاريخ الانتهاء', 'Expiry Date')}</label><input type="date" value={formData.membershipExpiryDate} onChange={e => handleChange('membershipExpiryDate', e.target.value)} className={inputClasses} /></div>
                                   </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'event' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-[1.5rem] flex items-center justify-between border border-rose-100 dark:border-rose-900/30">
                                    <div className="flex items-center gap-3"><PartyPopper size={20} className="text-rose-600" /><p className="font-black dark:text-white text-xs uppercase">{t('عرض المناسبة والعد التنازلي', 'Event & Countdown')}</p></div>
                                    <button type="button" onClick={() => handleChange('showOccasion', !formData.showOccasion)} className={`w-12 h-6 rounded-full relative transition-all ${formData.showOccasion ? 'bg-rose-600' : 'bg-gray-300'}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isRtl ? (formData.showOccasion ? 'right-6' : 'right-0.5') : (formData.showOccasion ? 'left-6' : 'left-0.5')}`} /></button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2"><label className={labelClasses}>{t('عنوان المناسبة', 'Event Title')}</label><input type="text" value={formData.occasionTitleAr} onChange={e => handleChange('occasionTitleAr', e.target.value)} className={inputClasses} /></div>
                                    <div className="space-y-2"><label className={labelClasses}>{t('تاريخ ووقت المناسبة', 'Date & Time')}</label><input type="datetime-local" value={formData.occasionDate} onChange={e => handleChange('occasionDate', e.target.value)} className={inputClasses} /></div>
                                    <div className="space-y-2"><label className={labelClasses}>{t('لون عداد الوقت', 'Timer Color')}</label><ColorPickerUI label="" field="occasionPrimaryColor" icon={Timer} /></div>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'theme' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                                    <div className="flex items-center gap-3"><Palette className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تدرجات الألوان والسمة', 'Gradients & Theme')}</h4></div>
                                    
                                    <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-black/20 p-2 rounded-[2rem]">
                                         {['color', 'gradient', 'image'].map(type => (
                                           <button type="button" key={type} onClick={() => handleChange('themeType', type as ThemeType)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent shadow-sm'}`}>
                                             {type === 'color' ? <Palette size={20}/> : type === 'gradient' ? <Sparkles size={20}/> : <ImageIcon size={20}/>}
                                             <span className="text-[10px] font-black uppercase tracking-widest">{t(type === 'color' ? 'لون ثابت' : type === 'gradient' ? 'تدرج' : 'صورة', type.toUpperCase())}</span>
                                           </button>
                                         ))}
                                    </div>

                                    {formData.themeType === 'color' && (
                                      <div className="space-y-6 animate-fade-in">
                                         <label className="text-[10px] font-black text-gray-400 uppercase">{t('لوحة الألوان السريعة', 'Quick Color Palette')}</label>
                                         <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                                            {THEME_COLORS.map((clr, i) => (
                                              <button type="button" key={i} onClick={() => { handleChange('themeColor', clr); handleChange('themeType', 'color'); }} className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-125 ${formData.themeColor === clr ? 'border-blue-600 scale-125 shadow-lg' : 'border-white dark:border-gray-600'}`} style={{ backgroundColor: clr }} />
                                            ))}
                                         </div>
                                      </div>
                                    )}

                                    {formData.themeType === 'gradient' && (
                                      <div className="space-y-6 animate-fade-in">
                                         <label className="text-[10px] font-black text-gray-400 uppercase">{t('اختر التدرج اللوني المفضل', 'Select Color Gradient')}</label>
                                         <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {THEME_GRADIENTS.map((grad, i) => (
                                              <button type="button" key={i} onClick={() => { handleChange('themeGradient', grad); handleChange('themeType', 'gradient'); }} className={`h-12 rounded-2xl border-2 transition-all ${formData.themeGradient === grad ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-60'}`} style={{ background: grad }} />
                                            ))}
                                         </div>
                                      </div>
                                    )}

                                    {formData.themeType === 'image' && (
                                      <div className="space-y-6 animate-fade-in">
                                         <label className="text-[10px] font-black text-gray-400 uppercase">{t('خلفيات فنية افتراضية', 'Artistic Background Presets')}</label>
                                         <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {BACKGROUND_PRESETS.map((url, i) => (
                                              <button type="button" key={i} onClick={() => { handleChange('backgroundImage', url); handleChange('themeType', 'image'); }} className={`h-24 rounded-2xl border-2 overflow-hidden transition-all ${formData.backgroundImage === url ? 'border-blue-600 scale-105 shadow-xl' : 'border-transparent opacity-60'}`}>
                                                 <img src={url} className="w-full h-full object-cover" alt={`Preset ${i}`} />
                                              </button>
                                            ))}
                                         </div>
                                         <div className="pt-4 border-t dark:border-gray-800">
                                            <input type="file" ref={bgFileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setIsUploadingBg(true); try { const url = await uploadImageToCloud(f, 'background', uploadConfig as any); if (url) { handleChange('backgroundImage', url); handleChange('themeType', 'image'); } } finally { setIsUploadingBg(false); } }} className="hidden" accept="image/*" />
                                            <button type="button" onClick={() => { if (!auth.currentUser) setShowAuthWarning(true); else bgFileInputRef.current?.click(); }} className="w-full py-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-3 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 transition-all">
                                               {isUploadingBg ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                               {t('رفع خلفية خاصة للبطاقة', 'Upload Custom Background')}
                                            </button>
                                         </div>
                                      </div>
                                    )}

                                    <ColorPickerUI label={t('لون السمة الأساسي', 'Base Theme Color')} field="themeColor" icon={Pipette} onAfterChange={() => handleChange('themeType', 'color')} />
                                    
                                    <div className="pt-4 border-t dark:border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3"><Moon className="text-gray-400" size={18} /><span className="text-xs font-black dark:text-white uppercase tracking-widest">{t('الوضع ليلي افتراضياً', 'Default Dark Mode')}</span></div>
                                        <button type="button" onClick={() => handleChange('isDark', !formData.isDark)} className={`w-14 h-7 rounded-full relative transition-all ${formData.isDark ? 'bg-blue-600 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.isDark ? 'right-8' : 'right-1') : (formData.isDark ? 'left-8' : 'left-1')}`} /></button>
                                    </div>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'design' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30">
                                       <div className="flex items-center gap-3"><GlassWater size={18} className="text-indigo-600" /><p className="font-black dark:text-white text-[10px] uppercase">{t('نمط زجاجي', 'Glassy Body')}</p></div>
                                       <button type="button" onClick={() => handleChange('bodyGlassy', !formData.bodyGlassy)} className={`w-12 h-6 rounded-full relative transition-all ${formData.bodyGlassy ? 'bg-indigo-600' : 'bg-gray-700'}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isRtl ? (formData.bodyGlassy ? 'right-6' : 'right-0.5') : (formData.bodyGlassy ? 'left-6' : 'left-0.5')}`} /></button>
                                    </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ColorPickerUI label={t('لون الاسم', 'Name Color')} field="nameColor" icon={TypographyIcon} />
                                    <ColorPickerUI label={t('المسمى الوظيفي', 'Job Color')} field="titleColor" icon={Briefcase} />
                                    <ColorPickerUI label={t('أزرار التواصل', 'Links Color')} field="linksColor" icon={Link2} />
                                    <ColorPickerUI label={t('نصوص النبذة', 'Bio Text Color')} field="bioTextColor" icon={FileText} />
                                 </div>
                                 
                                 <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                                    <div className="flex items-center gap-3 px-2">
                                      <Box className="text-blue-600" size={20}/>
                                      <h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('تنسيق جسم البطاقة', 'Card Body Style')}</h3>
                                    </div>
                                    
                                    <div className="bg-gray-50/50 dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-6 space-y-8">
                                       <div className="grid grid-cols-2 gap-2 bg-white dark:bg-gray-900 p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
                                          <button 
                                            type="button" 
                                            onClick={() => handleChange('cardBodyThemeType', 'color')}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.cardBodyThemeType !== 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                          >
                                            <Palette size={14} /> {t('لون ثابت', 'Solid Color')}
                                          </button>
                                          <button 
                                            type="button" 
                                            onClick={() => handleChange('cardBodyThemeType', 'image')}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.cardBodyThemeType === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                          >
                                            <ImageIcon size={14} /> {t('صورة خلفية', 'Background Image')}
                                          </button>
                                       </div>

                                       {formData.cardBodyThemeType !== 'image' ? (
                                          <div className="space-y-6 animate-fade-in">
                                             <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                                                {THEME_COLORS.slice(0, 20).map((clr, idx) => (
                                                   <button 
                                                     key={idx} 
                                                     type="button"
                                                     onClick={() => { handleChange('cardBodyColor', clr); handleChange('cardBodyThemeType', 'color'); }}
                                                     className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125 ${formData.cardBodyColor === clr ? 'border-blue-600 scale-125 shadow-lg' : 'border-white dark:border-gray-800'}`}
                                                     style={{ backgroundColor: clr }}
                                                   />
                                                ))}
                                             </div>
                                             <ColorPickerUI label={t('لون مخصص', 'Custom Color')} field="cardBodyColor" icon={Pipette} onAfterChange={() => handleChange('cardBodyThemeType', 'color')} />
                                          </div>
                                       ) : (
                                          <div className="space-y-6 animate-fade-in">
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="w-full h-32 rounded-2xl bg-white dark:bg-gray-900 shadow-inner overflow-hidden flex items-center justify-center relative border border-gray-100 dark:border-gray-800">
                                                   {formData.cardBodyBackgroundImage ? <img src={formData.cardBodyBackgroundImage} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-gray-200" />}
                                                   {isUploadingBodyBg && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                                                </div>
                                                <div className="space-y-3">
                                                  <input type="file" ref={bodyBgFileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setIsUploadingBodyBg(true); try { const url = await uploadImageToCloud(f, 'background', uploadConfig as any); if (url) { handleChange('cardBodyBackgroundImage', url); handleChange('cardBodyThemeType', 'image'); } } finally { setIsUploadingBodyBg(false); } }} className="hidden" accept="image/*" />
                                                  <button type="button" onClick={() => bodyBgFileInputRef.current?.click()} className="w-full py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl font-black text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                                                    <UploadCloud size={16}/> {t('رفع صورة جديدة', 'Upload New')}
                                                  </button>
                                                  <button type="button" onClick={() => { handleChange('cardBodyBackgroundImage', ''); handleChange('cardBodyThemeType', 'color'); }} className="w-full py-2 text-red-400 font-bold text-[9px] uppercase hover:underline">{t('إزالة وإلغاء', 'Remove Image')}</button>
                                                </div>
                                             </div>
                                          </div>
                                       )}

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t dark:border-gray-800">
                                          <RangeControl 
                                             label={t('شفافية جسم البطاقة', 'Body Opacity')} 
                                             min={0} max={100} unit="%" 
                                             value={formData.bodyOpacity ?? currentTemplate?.config.bodyOpacity ?? 100} 
                                             onChange={(v: number) => handleChange('bodyOpacity', v)} 
                                             icon={Sun} 
                                          />
                                          <RangeControl 
                                             label={t('انحناء الحواف الجسم', 'Border Radius')} 
                                             min={0} max={120} 
                                             value={formData.bodyBorderRadius ?? currentTemplate?.config.bodyBorderRadius ?? 48} 
                                             onChange={(v: number) => handleChange('bodyBorderRadius', v)} 
                                             icon={Ruler} 
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                            )}
                          </>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-10 border-t dark:border-gray-800">
                        <button type="button" onClick={handlePrev} disabled={currentIndex === 0} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black text-xs uppercase disabled:opacity-30 transition-all flex items-center gap-2">
                           {isRtl ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>} {t('السابق', 'Previous')}
                        </button>
                        {currentIndex < tabs.length - 1 ? (
                          <button type="button" onClick={handleNext} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                             {t('التالي', 'Next')} {isRtl ? <ChevronLeft size={18}/> : <ChevronRight size={18}/>}
                          </button>
                        ) : (
                          <button type="button" onClick={handleSaveDirect} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                             {t('حفظ ومشاركة', 'Save & Share')} <Check size={18}/>
                          </button>
                        )}
                    </div>
                  </div>
                </div>
            </div>
        </main>

        {/* نظام المعاينة الحية */}
        <aside className="hidden lg:flex w-full lg:w-[480px] bg-gray-50/50 dark:bg-black/40 border-r lg:border-r-0 lg:border-l dark:border-gray-800 p-6 flex flex-col items-center relative overflow-y-auto no-scrollbar scroll-smooth sticky top-24 h-[calc(100vh-120px)] rounded-[3rem]">
           <div className="flex flex-col items-center w-full">
              <div className="mb-6 w-full flex items-center justify-between px-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية (جوال)', 'Live Preview (Mobile)')}</span></div>
              </div>
              
              <div 
                   onMouseMove={handleSidebarPreviewMouseMove}
                   onMouseLeave={() => setSidebarMouseYPercentage(0)}
                   className="transition-all duration-500 origin-top rounded-[3.5rem] shadow-2xl overflow-hidden relative border-[12px] border-gray-950 dark:border-gray-900 bg-white dark:bg-black w-[340px] aspect-[9/18.5] cursor-ns-resize isolate" 
                   style={{ 
                     isolation: 'isolate', 
                     backgroundColor: previewPageBg
                   }}>
                
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 dark:bg-gray-900 rounded-full z-[100] border border-white/5 shadow-inner"></div>

                <div className="no-scrollbar h-full scroll-smooth relative z-0" 
                     style={{ 
                       borderRadius: '2.6rem', 
                       overflow: 'hidden',
                       clipPath: 'inset(0 round 2.6rem)' 
                     }}>
                   <div 
                     style={{ 
                        maxWidth: '100%',
                        marginRight: 'auto',
                        marginLeft: 'auto',
                        position: 'relative',
                        zIndex: 10,
                        transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
                        transform: `translateY(-${sidebarMouseYPercentage * 0.7}%)`
                     }}
                   >
                     <CardPreview 
                       data={formData} 
                       lang={lang} 
                       customConfig={currentTemplate?.config} 
                       hideSaveButton={true} 
                       isFullFrame={isFullHeaderActive} 
                       bodyOffsetYOverride={cardBodyOffset}
                     />
                   </div>
                </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
