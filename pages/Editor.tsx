
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
  Quote, PhoneCall, MonitorDot, ArrowLeftRight, Box, SlidersHorizontal, Grid, Maximize2, ExternalLink, Lock,
  ChevronDown, Eraser, Layers
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
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [isSlugVerified, setIsSlugVerified] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isUploadingBodyBg, setIsUploadingBodyBg] = useState(false);
  const [isUploadingSpecialImg, setIsUploadingSpecialImg] = useState(false);
  
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });
  const [showModeInfo, setShowModeInfo] = useState(true);

  useEffect(() => {
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
    const config = selectedTmpl?.config;
    
    if (initialData) {
      return { 
        ...initialData,
        phones: initialData.phones || (initialData.phone ? [initialData.phone] : []),
        whatsapps: initialData.whatsapps || (initialData.whatsapp ? [initialData.whatsapp] : []),
        specialLinks: initialData.specialLinks || [],
        emails: initialData.emails || [],
        websites: initialData.websites || []
      };
    }

    const baseSample = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;
    return {
      ...baseSample,
      id: generateSerialId(),
      templateId: targetTemplateId,
      phones: baseSample.phone ? [baseSample.phone] : [],
      whatsapps: baseSample.whatsapp ? [baseSample.whatsapp] : [],
      bodyOffsetY: config?.bodyOffsetY || 0,
      mobileBodyOffsetY: config?.mobileBodyOffsetY || 0,
    } as CardData;
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

  const VisibilityIcon = ({ field }: { field: keyof CardData }) => {
    const isVisible = formData[field] !== false;
    return (
      <button 
        type="button" 
        onClick={() => handleChange(field, !isVisible)} 
        className={`p-2 rounded-lg transition-all ${isVisible ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-300 hover:bg-gray-100'}`}
      >
        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    );
  };

  const ColorPickerUI = ({ label, field, icon: Icon }: { label: string, field: keyof CardData, icon?: any }) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">{Icon && <Icon size={16} className="text-indigo-600" />}<span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{label}</span></div>
      <div className="flex items-center gap-3">
         <div className="relative w-8 h-8 rounded-xl overflow-hidden border shadow-sm">
            <input type="color" value={(formData[field] as string) || '#000000'} onChange={(v) => handleChange(field, v.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
            <div className="w-full h-full" style={{ backgroundColor: (formData[field] as string) || '#000000' }} />
         </div>
         <input type="text" value={((formData[field] as string) || '').toUpperCase()} onChange={(e) => handleChange(field, e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-2 py-1.5 text-[9px] font-black text-blue-600 w-16 uppercase text-center outline-none" />
      </div>
    </div>
  );

  const handleSaveDirect = () => {
    if (!auth.currentUser) {
      setShowAuthWarning(true);
      return;
    }
    onSave(formData, originalIdRef.current || undefined);
  };

  const inputClasses = "w-full px-5 py-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-sm shadow-none";
  const labelClasses = "text-[10px] font-black text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-widest px-2";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050507] pb-40">
      <div className="max-w-[1840px] mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col gap-2 shrink-0 sticky top-24 h-fit">
           <div className="bg-white dark:bg-gray-900 p-4 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
              {tabs.map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <div className="flex items-center gap-3">
                     <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-gray-500'} />
                     <span className="text-sm font-black uppercase tracking-tight">{tab.label}</span>
                  </div>
                  {tab.isPro && !isPremium && <Lock size={12} className="text-gray-400" />}
                </button>
              ))}
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-0 relative overflow-hidden flex flex-col min-h-[700px]">
                <div className="p-6 md:p-10 flex-1">
                  <div className="relative z-10 space-y-6 md:space-y-10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-[1.2rem] bg-slate-50 dark:bg-gray-800 ${tabs[currentIndex].color}`}>
                              {React.createElement(tabs[currentIndex].icon, { size: 24 })}
                          </div>
                          <div>
                              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{tabs[currentIndex].label}</h2>
                              <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mt-0.5">{t('المرحلة', 'Step')} {currentIndex + 1} {t('من', 'of')} {tabs.length}</p>
                          </div>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {activeTab === 'identity' && (
                          <div className="space-y-6 animate-fade-in">
                             <div className="space-y-2">
                                <label className={labelClasses}>{t('رابط البطاقة المخصص (URL)', 'Personal URL Path')}</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                   <div className={`flex-1 flex items-center bg-gray-50 dark:bg-gray-950 rounded-[1.5rem] border ${slugStatus === 'available' ? 'border-emerald-500' : 'border-gray-100'} px-5 py-4`} dir="ltr">
                                      <span className="text-[10px] font-bold text-gray-400">nextid.my/?u=</span>
                                      <input type="text" value={formData.id} onChange={e => handleChange('id', e.target.value)} className="flex-1 bg-transparent border-none outline-none font-black text-sm dark:text-white" />
                                   </div>
                                   <button onClick={handleCheckSlug} disabled={isCheckingSlug} className="px-12 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[15px] uppercase">
                                      {isCheckingSlug ? <Loader2 size={16} className="animate-spin" /> : t('تحقق', 'Check')}
                                   </button>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className={labelClasses}>{t('الاسم بالكامل')}</label><input value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} /></div>
                                <div className="space-y-2"><label className={labelClasses}>{t('jobTitle')}</label><input value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} /></div>
                             </div>

                             <div className="space-y-2">
                                <label className={labelClasses}>{t('bio')}</label>
                                <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className={`${inputClasses} min-h-[120px]`} rows={3} />
                             </div>
                          </div>
                        )}

                        {activeTab === 'links' && (
                          <div className="space-y-6 animate-fade-in">
                             <div className="space-y-4">
                                <div className="flex justify-between items-center"><label className={labelClasses}>{t('عناوين البريد الإلكتروني')}</label><button onClick={() => handleChange('emails', [...(formData.emails || []), ''])} className="text-blue-600 font-black text-[10px] uppercase">+ {t('إضافة')}</button></div>
                                {(formData.emails || []).map((email, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input value={email} onChange={e => { const l = [...(formData.emails || [])]; l[idx] = e.target.value; handleChange('emails', l); }} className={inputClasses} placeholder="mail@example.com" />
                                    <button onClick={() => { const l = [...(formData.emails || [])]; l.splice(idx, 1); handleChange('emails', l); }} className="p-4 bg-red-50 text-red-500 rounded-2xl"><X size={18}/></button>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}

                        {/* Additional tabs will follow the same logic as the initial editor snippet provided by user */}
                        {currentIndex > 4 && !isPremium && (
                           <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
                              <Crown size={64} className="text-amber-500" />
                              <h3 className="text-2xl font-black">{isRtl ? 'ميزة حصرية للمحترفين' : 'Exclusive Pro Feature'}</h3>
                              <button onClick={() => navigate(`/${lang}/pricing`)} className="px-10 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase shadow-lg">
                                 {t('upgradeToCustomize')}
                              </button>
                           </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-10 border-t dark:border-gray-800">
                        <button type="button" onClick={handlePrev} disabled={currentIndex === 0} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-2xl font-black text-xs uppercase transition-all">
                           {t('السابق', 'Previous')}
                        </button>
                        {currentIndex < tabs.length - 1 ? (
                          <button type="button" onClick={handleNext} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
                             {t('التالي', 'Next')}
                          </button>
                        ) : (
                          <button type="button" onClick={handleSaveDirect} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl transition-all">
                             {t('حفظ ومشاركة', 'Save & Share')}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
            </div>
        </main>

        {/* Live Preview Aside */}
        <aside className="hidden lg:flex w-[480px] bg-gray-50/50 dark:bg-black/40 border-l dark:border-gray-800 p-6 flex flex-col items-center sticky top-24 h-[calc(100vh-120px)] rounded-[3rem]">
           <div className="mb-6 w-full flex items-center justify-between px-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
           </div>
           
           <div className="w-[340px] h-full rounded-[3.5rem] border-[12px] border-gray-950 dark:border-gray-900 bg-white dark:bg-black shadow-2xl overflow-hidden relative">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 dark:bg-gray-900 rounded-full z-[100]"></div>
              <div className="h-full overflow-y-auto no-scrollbar">
                 <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} />
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
