
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Plus, X, Loader2, Sparkles, Moon, Sun, 
  Mail, Phone, Globe, MessageCircle, Link as LinkIcon, 
  CheckCircle2, AlertTriangle, UploadCloud, ImageIcon, 
  Palette, Layout, User as UserIcon, Camera, 
  Pipette, Type as TypographyIcon, Smartphone, Tablet, Monitor, Eye, 
  RefreshCcw, FileText, Calendar, MapPin, PartyPopper, Move, Wind, 
  GlassWater, Link2, Sparkle, LayoutGrid, EyeOff, Ruler, Wand2, Building2, Timer,
  QrCode, Share2, Trash2, LogIn, Shapes, Navigation2, ImagePlus, Check, Search, Zap,
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
  
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });
  const [showModeInfo, setShowModeInfo] = useState(true);

  useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings) {
        setSiteSettings(settings);
      }
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
    const config = selectedTmpl?.config;
    
    const templateName = config?.defaultName;
    const templateTitle = config?.defaultTitle;
    const templateCompany = config?.defaultCompany;
    const templateBio = isRtl ? config?.defaultBioAr : config?.defaultBioEn;
    const templateOffset = config?.bodyOffsetY;
    const templateMobileOffset = config?.mobileBodyOffsetY;

    if (initialData) {
      return { 
        ...initialData, 
        emails: initialData.emails || [], 
        websites: initialData.websites || [], 
        phones: initialData.phones || (initialData.phone ? [initialData.phone] : []),
        whatsapps: initialData.whatsapps || (initialData.whatsapp ? [initialData.whatsapp] : []),
        specialLinks: initialData.specialLinks || [], 
        socialIconColumns: initialData.socialIconColumns || 0,
        specialLinksCols: initialData.specialLinksCols || (config?.specialLinksCols || 2),
        bodyOffsetY: (initialData.bodyOffsetY !== undefined && initialData.bodyOffsetY !== 0) 
           ? initialData.bodyOffsetY 
           : (templateOffset ?? 0),
        mobileBodyOffsetY: (initialData.mobileBodyOffsetY !== undefined && initialData.mobileBodyOffsetY !== 0)
           ? initialData.mobileBodyOffsetY
           : (templateMobileOffset ?? 0),
        
        name: (initialData.name && initialData.name !== '---') ? initialData.name : (templateName || (SAMPLE_DATA[lang]?.name || '')),
        title: initialData.title || templateTitle || '',
        company: initialData.company || templateCompany || '',
        bio: initialData.bio || templateBio || '',
        nameColor: initialData.nameColor || config?.nameColor,
        titleColor: initialData.titleColor || config?.titleColor,
        linksColor: initialData.linksColor || config?.linksColor,
        bioTextColor: initialData.bioTextColor || config?.bioTextColor,
        bioBgColor: initialData.bioBgColor || config?.bioBgColor,
        qrColor: initialData.qrColor || config?.qrColor,
        qrBgColor: initialData.qrBgColor || config?.qrBgColor,
        contactPhoneColor: initialData.contactPhoneColor || config?.contactPhoneColor,
        contactWhatsappColor: initialData.contactWhatsappColor || config?.contactWhatsappColor,
        socialIconsColor: initialData.socialIconsColor || config?.socialIconsColor,
        cardBodyColor: initialData.cardBodyColor || config?.cardBodyColor,
        showName: initialData.showName !== undefined ? initialData.showName : config?.showNameByDefault,
        showTitle: initialData.showTitle !== undefined ? initialData.showTitle : config?.showTitleByDefault,
        showCompany: initialData.showCompany !== undefined ? initialData.showCompany : config?.showCompanyByDefault,
        showBio: initialData.showBio !== undefined ? initialData.showBio : config?.showBioByDefault,
        showEmail: initialData.showEmail !== undefined ? initialData.showEmail : config?.showEmailByDefault,
        showWebsite: initialData.showWebsite !== undefined ? initialData.showWebsite : config?.showWebsiteByDefault,
        showPhone: initialData.showPhone !== undefined ? initialData.showPhone : config?.showPhoneByDefault,
        showWhatsapp: initialData.showWhatsapp !== undefined ? initialData.showWhatsapp : config?.showWhatsappByDefault,
        showSocialLinks: initialData.showSocialLinks !== undefined ? initialData.showSocialLinks : config?.showSocialLinksByDefault,
        showQrCode: initialData.showQrCode !== undefined ? initialData.showQrCode : config?.showQrCodeByDefault,
        showSpecialLinks: initialData.showSpecialLinks !== undefined ? initialData.showSpecialLinks : (config?.showSpecialLinksByDefault ?? true),
        showLocation: initialData.showLocation !== undefined ? initialData.showLocation : config?.showLocationByDefault,
        showMembership: initialData.showMembership !== undefined ? initialData.showMembership : config?.showMembershipByDefault,
        showOccasion: initialData.showOccasion !== undefined ? initialData.showOccasion : config?.showOccasionByDefault,
        bodyBorderRadius: initialData.bodyBorderRadius !== undefined ? initialData.bodyBorderRadius : config?.bodyBorderRadius,
        bodyOpacity: initialData.bodyOpacity !== undefined ? initialData.bodyOpacity : config?.bodyOpacity,
        bodyGlassy: initialData.bodyGlassy !== undefined ? initialData.bodyGlassy : config?.bodyGlassy,
      };
    }

    const baseSample = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;
    const baseData = { ...baseSample, id: generateSerialId(), templateId: targetTemplateId } as CardData;
    
    if (selectedTmpl) {
       return {
         ...baseData,
         templateId: targetTemplateId,
         name: templateName || baseData.name,
         title: templateTitle || baseData.title,
         company: templateCompany || baseData.company,
         bio: templateBio || baseData.bio,
         phones: baseData.phone ? [baseData.phone] : [],
         whatsapps: baseData.whatsapp ? [baseData.whatsapp] : [],
         themeType: selectedTmpl.config.defaultThemeType || baseData.themeType,
         themeColor: selectedTmpl.config.defaultThemeColor || baseData.themeColor,
         themeGradient: selectedTmpl.config.defaultThemeGradient || baseData.themeGradient,
         backgroundImage: selectedTmpl.config.defaultBackgroundImage || baseData.backgroundImage,
         isDark: selectedTmpl.config.defaultIsDark ?? baseData.isDark,
         cardBodyColor: selectedTmpl.config.cardBodyColor || '#ffffff',
         cardBodyThemeType: selectedTmpl.config.cardBodyThemeType || 'color',
         bodyBorderRadius: selectedTmpl.config.bodyBorderRadius,
         bodyOffsetY: templateOffset !== undefined ? templateOffset : 0,
         mobileBodyOffsetY: templateMobileOffset !== undefined ? templateMobileOffset : 0,
         specialLinksCols: selectedTmpl.config.specialLinksCols || 2,
         showSpecialLinks: selectedTmpl.config.showSpecialLinksByDefault ?? true,
         specialLinks: selectedTmpl.config.defaultSpecialLinks || [],
         fontFamily: selectedTmpl.config.fontFamily || 'Cairo',
         socialIconColumns: selectedTmpl.config.socialIconColumns || 0,
         qrColor: selectedTmpl.config.qrColor || baseData.qrColor || '#000000',
         qrBgColor: selectedTmpl.config.qrBgColor || baseData.qrBgColor || 'transparent',
         nameColor: config?.nameColor,
         titleColor: config?.titleColor,
         linksColor: config?.linksColor,
         bioTextColor: config?.bioTextColor,
         bioBgColor: config?.bioBgColor,
         contactPhoneColor: config?.contactPhoneColor,
         contactWhatsappColor: config?.contactWhatsappColor,
         socialIconsColor: config?.socialIconsColor,
         bodyOpacity: config?.bodyOpacity,
         bodyGlassy: config?.bodyGlassy,
         showName: config?.showNameByDefault,
         showTitle: config?.showTitleByDefault,
         showCompany: config?.showCompanyByDefault,
         showBio: config?.showBioByDefault,
         showEmail: config?.showEmailByDefault,
         showWebsite: config?.showWebsiteByDefault,
         showPhone: config?.showPhoneByDefault,
         showWhatsapp: config?.showWhatsappByDefault,
         showSocialLinks: config?.showSocialLinksByDefault,
         showQrCode: config?.showQrCodeByDefault,
         showLocation: config?.showLocationByDefault,
         showMembership: config?.showMembershipByDefault,
         showOccasion: config?.showOccasionByDefault
       } as CardData;
    }
    return { ...baseData, bodyOffsetY: 0, mobileBodyOffsetY: 0, phones: baseData.phone ? [baseData.phone] : [], whatsapps: baseData.whatsapp ? [baseData.whatsapp] : [] }; 
  });

  useEffect(() => {
    if (currentIndex === 0 && !initialData) {
       const selectedTmpl = templates.find(t => t.id === formData.templateId);
       if (selectedTmpl) {
          setFormData(prev => ({
             ...prev,
             bodyOffsetY: selectedTmpl.config.bodyOffsetY ?? prev.bodyOffsetY,
             mobileBodyOffsetY: selectedTmpl.config.mobileBodyOffsetY ?? prev.mobileBodyOffsetY,
             specialLinksCols: prev.specialLinksCols || selectedTmpl.config.specialLinksCols || 2
          }));
       }
    }
  }, [formData.templateId]);

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
        title={isVisible ? t('إخفاء', 'Hide') : t('إظهار', 'Show')}
      >
        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    );
  };

  const RangeControl = ({ label, value, min, max, onChange, icon: Icon, unit = "px", hint }: any) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-0 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Icon size={14} /></div>}
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{label}</span>
              {hint && <span className="text-[7px] text-gray-500 font-bold">{hint}</span>}
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
    <div className="bg-white dark:bg-gray-900 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">{Icon && <Icon size={16} className="text-indigo-600" />}<span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{label}</span></div>
      <div className="flex items-center gap-3">
         <div className="relative w-8 h-8 rounded-xl overflow-hidden border shadow-sm">
            <input type="color" value={(formData[field] as string) || '#000000'} onChange={(v) => { handleChange(field, v.target.value); if (onAfterChange) onAfterChange(v.target.value); }} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
            <div className="w-full h-full" style={{ backgroundColor: (formData[field] as string) || '#000000' }} />
         </div>
         <input type="text" value={((formData[field] as string) || '').toUpperCase()} onChange={(e) => { handleChange(field, e.target.value); if (onAfterChange) onAfterChange(e.target.value); }} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-2 py-1.5 text-[9px] font-black text-blue-600 w-16 uppercase text-center outline-none" placeholder="#HEX" />
      </div>
    </div>
  );

  const inputClasses = "w-full px-5 py-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all font-bold text-sm shadow-none";
  const labelClasses = "hidden md:block text-[10px] font-black text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-widest px-2";

  const CompactInputField = ({ field, label, placeholder, type = "text", visibilityField }: { field: keyof CardData, label: string, placeholder: string, type?: string, visibilityField?: keyof CardData }) => (
    <div className="space-y-1.5">
      <label className={labelClasses}>{label}</label>
      <div className="relative group">
        <input 
          type={type} 
          value={formData[field] as string || ''} 
          onChange={e => handleChange(field, e.target.value)} 
          className={`${inputClasses} ${visibilityField ? (isRtl ? 'pl-12' : 'pr-12') : ''} placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs`}
          placeholder={isRtl ? label : placeholder} 
        />
        {visibilityField && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'}`}>
            <VisibilityIcon field={visibilityField} />
          </div>
        )}
      </div>
    </div>
  );

  const previewPageBg = currentTemplate?.config.pageBgStrategy === 'mirror-header' 
    ? (formData.themeType === 'color' ? formData.themeColor : (formData.isDark ? '#050507' : '#f8fafc'))
    : (currentTemplate?.config.pageBgColor || (formData.isDark ? '#050507' : '#f8fafc'));

  const handleSpecialLinkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingSpecialImg(true);
    try {
      const b = await uploadImageToCloud(file, 'avatar');
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
    const updated = (formData.specialLinks || []).filter(l => l.id !== id);
    handleChange('specialLinks', updated);
  };

  const handleSaveDirect = () => {
    if (!auth.currentUser) {
      setShowAuthWarning(true);
      return;
    }
    const dataToSave = {
      ...formData,
      phone: formData.phones?.[0] || formData.phone || '',
      whatsapp: formData.whatsapps?.[0] || formData.whatsapp || ''
    };
    onSave(dataToSave, originalIdRef.current || undefined);
  };

  const isFullHeaderPreview = currentTemplate?.config.desktopLayout === 'full-width-header' && previewDevice === 'desktop';
  
  const previewBodyOffsetY = (previewDevice === 'mobile' || previewDevice === 'tablet' || !isFullHeaderPreview) 
    ? (formData.mobileBodyOffsetY ?? 0) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050507] pb-40">
      
      {showModeInfo && !isPremium && (
         <div className="hidden md:block max-w-[1440px] mx-auto px-4 md:px-6 pt-6">
            <div className={`p-6 rounded-[2.5rem] border bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in`}>
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl bg-blue-600 text-white shadow-0g`}>
                      <UserIcon size={32} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">
                        {t('basicEditorTitle')}
                      </h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        {t('basicEditorDesc')}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => navigate(`/${lang}/pricing`)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-0 hover:scale-105 transition-all">
                      {t('upgradeToCustomize')}
                   </button>
                   <button onClick={() => setShowModeInfo(false)} className="p-2 text-gray-500 hover:text-red-500"><X size={20}/></button>
                </div>
            </div>
         </div>
      )}

      <div className="lg:hidden fixed bottom-24 right-6 z-[2000]">
         <button 
           onClick={() => setShowMobilePreview(true)}
           className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-0 shadow-blue-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
         >
            <Smartphone size={24} />
         </button>
      </div>

      {showMobilePreview && (
        <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-2xl animate-fade-in flex flex-col overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-black/40 text-white shrink-0 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Smartphone size={18} />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-[0.2em]">{t('معاينة حية', 'Live Preview')}</span>
                </div>
                <button onClick={() => setShowMobilePreview(false)} className="p-2.5 bg-white/10 rounded-xl hover:bg-red-500 transition-colors shadow-lg"><X size={20}/></button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden touch-pan-y">
                <div className="w-full max-w-[350px] h-full max-h-[85vh] rounded-[3.5rem] border-[10px] border-gray-950 dark:border-gray-900 bg-white dark:bg-black shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden relative">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 dark:bg-gray-900 rounded-full z-[100] border border-white/5 shadow-inner"></div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="min-h-full pb-0">
                          <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} isFullFrame={false} bodyOffsetYOverride={previewBodyOffsetY} />
                        </div>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none"></div>
                </div>
                <div className="mt-4 flex flex-col items-center gap-2 opacity-50">
                    <div className="w-6 h-6 border-2 border-white/30 rounded-full flex items-center justify-center animate-bounce">
                        <ChevronDown size={14} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{isRtl ? 'اسحب للأعلى للتمرير' : 'Swipe up to scroll'}</span>
                </div>
            </div>
        </div>
      )}

      {showAuthWarning && <AuthModal lang={lang} onClose={() => setShowAuthWarning(false)} onSuccess={() => { setShowAuthWarning(false); }} />}

      <div className="max-w-[1840px] mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-8">
        
        <aside className="hidden lg:flex w-72 flex-col gap-2 shrink-0 sticky top-24 h-fit">
           <div className="bg-white dark:bg-gray-900 p-4 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
              {tabs.map((tab) => {
                const isLocked = tab.isPro && !isPremium;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => {
                      setActiveTab(tab.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-0 shadow-blue-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-3">
                       <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'} />
                       <span className="text-sm font-black uppercase tracking-tight">{tab.label}</span>
                    </div>
                    {isLocked && <Lock size={12} className="text-gray-400" />}
                  </button>
                );
              })}
           </div>
        </aside>

        <main className="flex-1 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-0 relative overflow-hidden flex flex-col min-h-[700px]">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    {(() => { const Icon = tabs[currentIndex].icon; return <Icon size={150} />; })()}
                </div>
                
                <div className="p-6 md:p-10 flex-1">
                  <div className="relative z-10 space-y-6 md:space-y-10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-[1.2rem] bg-slate-50 dark:bg-gray-800 ${tabs[currentIndex].color} shadow-sm`}>
                              {React.createElement(tabs[currentIndex].icon, { size: 24 })}
                          </div>
                          <div>
                              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{tabs[currentIndex].label}</h2>
                              <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">{t('المرحلة', 'Step')} {currentIndex + 1} {t('من', 'of')} {tabs.length}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {tabs.map((_, i) => <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= currentIndex ? 'w-6 bg-blue-600' : 'w-2 bg-gray-100 dark:border-gray-800'}`} />)}
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {tabs[currentIndex].isPro && !isPremium ? (
                           <div className="flex flex-col items-center justify-center text-center py-20 space-y-8 animate-fade-in">
                              <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-0 animate-bounce">
                                 <Crown size={48} />
                              </div>
                              <div className="space-y-3">
                                 <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'ميزة مخصصة للمشتركين' : 'Exclusive Pro Feature'}</h3>
                                 <p className="text-sm font-bold text-gray-500 max-w-sm mx-auto leading-relaxed">
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
                              <div className="space-y-6 md:space-y-8 animate-fade-in">
                                <div className="space-y-2">
                                   <label className={labelClasses}>{t('رابط البطاقة المخصص (URL)', 'Personal URL Path')}</label>
                                   <div className={`flex flex-col sm:flex-row gap-2 ${isRtl ? 'sm:flex-row' : 'sm:flex-row'}`}>
                                      <div className={`flex-1 flex items-center bg-gray-50 dark:bg-gray-950 rounded-[1.5rem] border ${slugStatus === 'available' ? 'border-emerald-500' : slugStatus === 'taken' ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} px-5 py-4`} dir="ltr">
                                         <span className="text-[10px] font-bold text-gray-400">nextid.my/?u=</span>
                                         <input type="text" value={formData.id} onChange={e => handleChange('id', e.target.value)} className="flex-1 bg-transparent border-none outline-none font-black text-sm dark:text-white" />
                                      </div>
                                      <button onClick={handleCheckSlug} disabled={isCheckingSlug} className="px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-bold text-[15px] uppercase shadow-0 disabled:opacity-50 transition-all hover:bg-emerald-700">
                                         {isCheckingSlug ? <Loader2 size={16} className="animate-spin" /> : t('تحقق من توفر اسمك الخاص', 'Check Availability')}
                                      </button>
                                   </div>
                                   {slugStatus === 'available' && <p className="text-[9px] font-black text-emerald-500 px-4 uppercase">{t('الرابط متاح للاستخدام', 'URL is available!')}</p>}
                                   {slugStatus === 'taken' && <p className="text-[9px] font-black text-red-500 px-4 uppercase">{t('الرابط محجوز مسبقاً', 'URL is already taken')}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                   <CompactInputField field="name" label={t('الاسم الكامل', 'Full Name')} placeholder="John Doe" visibilityField="showName" />
                                   <CompactInputField field="title" label={t('jobTitle')} placeholder="Senior Software Engineer" visibilityField="showTitle" />
                                   <div className="md:col-span-2">
                                      <CompactInputField field="company" label={t('company')} placeholder="Company Name" visibilityField="showCompany" />
                                   </div>
                                </div>

                                <div className="space-y-1.5">
                                   <div className="flex items-center justify-between px-2">
                                      <label className={labelClasses + " !mb-0"}>{t('bio')}</label>
                                   </div>
                                   <div className="relative">
                                      <textarea rows={3} value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className={`${inputClasses} ${isRtl ? 'pl-12' : 'pr-12'} placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs min-h-[100px]`} placeholder={isRtl ? t('bio') : "Write something inspiring..."} />
                                      <div className={`absolute top-4 ${isRtl ? 'left-3' : 'right-3'}`}>
                                         <VisibilityIcon field="showBio" />
                                      </div>
                                   </div>
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

                                <div className="pt-4 border-t dark:border-gray-800 space-y-4">
                                   <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-3">
                                         <Camera className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('صورتك الشخصية', 'Profile Image')}</h3>
                                      </div>
                                      <button onClick={() => handleChange('showProfileImage', !formData.showProfileImage)} className="text-blue-500 font-black text-[10px] uppercase">
                                         {formData.showProfileImage !== false ? t('إخفاء', 'Hide') : t('إظهار', 'Show')}
                                      </button>
                                   </div>
                                   <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50/50 dark:bg-gray-950 rounded-[2rem] border border-dashed border-gray-100 dark:border-gray-800">
                                      <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-gray-900 shadow-0 border-4 border-white dark:border-gray-700 overflow-hidden flex items-center justify-center relative shrink-0">
                                         {formData.profileImage ? (
                                           <>
                                             <img 
                                               src={formData.profileImage} 
                                               className="w-full h-full object-cover" 
                                               style={{
                                                  filter: (formData.profileImageWhiteMode ? 'brightness(0) invert(1)' : undefined),
                                                  mixBlendMode: (formData.profileImageRemoveBg ? 'multiply' : undefined)
                                               }}
                                             />
                                             <button 
                                               type="button" 
                                               onClick={() => handleChange('profileImage', '')}
                                               className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg shadow-xl hover:scale-110 transition-all z-10"
                                             >
                                               <Trash2 size={12} />
                                             </button>
                                           </>
                                         ) : (
                                           <UserIcon size={32} className="text-gray-200" />
                                         )}
                                         {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"><Loader2 className="animate-spin text-white" /></div>}
                                      </div>
                                      <div className="flex-1 space-y-4 w-full">
                                         <input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setIsUploading(true); try { const url = await uploadImageToCloud(f, 'avatar'); if (url) handleChange('profileImage', url); } finally { setIsUploading(false); } }} className="hidden" accept="image/*" />
                                         <button type="button" onClick={() => { if (!auth.currentUser) setShowAuthWarning(true); else fileInputRef.current?.click(); }} className="w-full py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl font-black text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"><UploadCloud size={16}/> {t('رفع صورة جديدة', 'Upload Image')}</button>
                                         <div className="grid grid-cols-6 gap-2 overflow-x-auto no-scrollbar">
                                            {AVATAR_PRESETS.map((p, idx) => <button key={idx} onClick={() => handleChange('profileImage', p)} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-600 transition-all shrink-0"><img src={p} className="w-full h-full object-cover" /></button>)}
                                         </div>
                                         
                                         {formData.profileImage && (
                                           <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                              <button 
                                                onClick={() => handleChange('profileImageWhiteMode', !formData.profileImageWhiteMode)}
                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${formData.profileImageWhiteMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                                              >
                                                <Layers size={14}/> {isRtl ? 'تحويل للأبيض' : 'White Mode'}
                                              </button>
                                              <button 
                                                onClick={() => handleChange('profileImageRemoveBg', !formData.profileImageRemoveBg)}
                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${formData.profileImageRemoveBg ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                                                title={isRtl ? 'مفيد لإخفاء المربعات البيضاء حول الشعارات' : 'Useful for hiding white boxes around logos'}
                                              >
                                                <Eraser size={14}/> {isRtl ? 'حذف الخلفية' : 'Remove BG'}
                                              </button>
                                           </div>
                                         )}
                                      </div>
                                   </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'links' && (
                              <div className="space-y-6 md:space-y-8 animate-fade-in">
                                 <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-3">
                                        <label className={labelClasses + " !mb-0"}>{t('عناوين البريد الإلكتروني', 'Emails')}</label>
                                        <VisibilityIcon field="showEmail" />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => handleChange('emails', [])} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                        <button type="button" onClick={() => handleChange('emails', [...(formData.emails || []), ''])} className="p-2 text-blue-600 hover:text-blue-700 transition-all"><Plus size={18}/></button>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                      {(formData.emails || []).map((email, idx) => (
                                         <div key={idx} className="flex gap-2 animate-zoom-in items-center">
                                            <div className="relative flex-1">
                                               <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={16} />
                                               <input type="email" value={email} onChange={e => { const l = [...(formData.emails || [])]; l[idx] = e.target.value; handleChange('emails', l); }} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} py-3 md:py-4`} placeholder="mail@example.com" />
                                            </div>
                                            <button type="button" onClick={() => { const l = [...(formData.emails || [])]; l.splice(idx, 1); handleChange('emails', l); }} className="p-2 text-gray-400 hover:text-red-500 transition-all shrink-0"><Trash2 size={18}/></button>
                                         </div>
                                      ))}
                                    </div>
                                 </div>

                                 <div className="space-y-3 pt-4 border-t dark:border-gray-800">
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-3">
                                        <label className={labelClasses + " !mb-0"}>{t('المواقع والروابط', 'Websites')}</label>
                                        <VisibilityIcon field="showWebsite" />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => handleChange('websites', [])} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                        <button type="button" onClick={() => handleChange('websites', [...(formData.websites || []), ''])} className="p-2 text-blue-600 hover:text-blue-700 transition-all"><Plus size={18}/></button>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                      {(formData.websites || []).map((web, idx) => (
                                         <div key={idx} className="flex gap-2 animate-zoom-in items-center">
                                            <div className="relative flex-1">
                                               <Globe2 className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={16} />
                                               <input type="text" value={web} onChange={e => { const l = [...(formData.websites || [])]; l[idx] = e.target.value; handleChange('websites', l); }} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} py-3 md:py-4`} placeholder="www.yoursite.com" />
                                            </div>
                                            <button type="button" onClick={() => { const l = [...(formData.websites || [])]; l.splice(idx, 1); handleChange('websites', l); }} className="p-2 text-gray-400 hover:text-red-500 transition-all shrink-0"><Trash2 size={18}/></button>
                                         </div>
                                      ))}
                                    </div>
                                 </div>

                                 <div className="pt-4 border-t dark:border-gray-800 space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-3"><MapPin className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('locationSection')}</h3></div>
                                      <VisibilityIcon field="showLocation" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                       <CompactInputField field="location" label={t('العنوان التفصيلي', 'Address')} placeholder="Riyadh, SA" />
                                       <CompactInputField field="locationUrl" label={t('رابط قوقل ماب', 'Maps Link')} placeholder="https://maps.google.com/..." />
                                    </div>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'contact_numbers' && (
                              <div className="space-y-6 md:space-y-8 animate-fade-in">
                                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-4">
                                   <div className="p-3 bg-white dark:bg-indigo-900/30 rounded-xl text-indigo-600 shadow-sm"><PhoneCall size={20}/></div>
                                   <div>
                                      <h3 className="font-black dark:text-white uppercase tracking-tighter text-sm md:text-base">{t('أرقام الاتصال والواتساب', 'Contact Numbers')}</h3>
                                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{t('تفعيل أزرار الاتصال السريع في البطاقة', 'Enable quick action buttons')}</p>
                                   </div>
                                </div>

                                <div className="space-y-6">
                                   <div className="space-y-3">
                                      <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                          <label className={labelClasses + " !mb-0"}>{t('أرقام الهاتف', 'Phone Numbers')}</label>
                                          <VisibilityIcon field="showPhone" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button type="button" onClick={() => handleChange('phones', [])} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                          <button type="button" onClick={() => handleChange('phones', [...(formData.phones || []), ''])} className="p-2 text-blue-600 hover:text-blue-700 transition-all"><Plus size={18}/></button>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 gap-2">
                                        {(formData.phones || []).map((p, idx) => (
                                           <div key={idx} className="flex gap-2 animate-zoom-in items-center">
                                              <div className="relative flex-1">
                                                 <Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                                                 <input type="tel" value={p} onChange={e => { const l = [...(formData.phones || [])]; l[idx] = e.target.value; handleChange('phones', l); }} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} py-3 md:py-4`} placeholder="+966 5..." />
                                              </div>
                                              <button type="button" onClick={() => { const l = [...(formData.phones || [])]; l.splice(idx, 1); handleChange('phones', l); }} className="p-2 text-gray-400 hover:text-red-500 transition-all shrink-0"><Trash2 size={18}/></button>
                                           </div>
                                        ))}
                                      </div>
                                   </div>

                                   <div className="space-y-3 pt-4 border-t dark:border-gray-800">
                                      <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                          <label className={labelClasses + " !mb-0"}>{t('أرقام الواتساب', 'WhatsApp Numbers')}</label>
                                          <VisibilityIcon field="showWhatsapp" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button type="button" onClick={() => handleChange('whatsapps', [])} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                          <button type="button" onClick={() => handleChange('whatsapps', [...(formData.whatsapps || []), ''])} className="p-2 text-blue-600 hover:text-blue-700 transition-all"><Plus size={18}/></button>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 gap-2">
                                        {(formData.whatsapps || []).map((w, idx) => (
                                           <div key={idx} className="flex gap-2 animate-zoom-in items-center">
                                              <div className="relative flex-1">
                                                 <MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                                                 <input type="tel" value={w} onChange={e => { const l = [...(formData.whatsapps || [])]; l[idx] = e.target.value; handleChange('whatsapps', l); }} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} py-3 md:py-4`} placeholder="9665..." />
                                              </div>
                                              <button type="button" onClick={() => { const l = [...(formData.whatsapps || [])]; l.splice(idx, 1); handleChange('whatsapps', l); }} className="p-2 text-gray-400 hover:text-red-500 transition-all shrink-0"><Trash2 size={18}/></button>
                                           </div>
                                        ))}
                                      </div>
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
                                             <Zap size={16} className={formData.useSocialBrandColors ? "text-emerald-600" : "text-gray-400"} />
                                             <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">{t('ألوان المنصات الأصلية', 'Use Brand Colors')}</span>
                                          </div>
                                          <button type="button" onClick={() => handleChange('useSocialBrandColors', !formData.useSocialBrandColors)} className={`w-12 h-6 rounded-full relative transition-all ${formData.useSocialBrandColors ? 'bg-emerald-600 shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.useSocialBrandColors ? 'right-7' : 'right-1') : (formData.useSocialBrandColors ? 'left-7' : 'left-1')}`} />
                                          </button>
                                       </div>

                                       {!formData.useSocialBrandColors && (
                                          <ColorPickerUI label={t('لون أيقونات التواصل', 'Social Icons Color')} field="socialIconsColor" icon={Pipette} />
                                       )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 pt-2">
                                       <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Grid size={16} /></div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'عدد الأيقونات في الصف' : 'Icons per row'}</span>
                                          </div>
                                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                            {[0, 1, 2, 3, 4, 5, 6].map(num => (
                                              <button
                                                key={num}
                                                type="button"
                                                onClick={() => handleChange('socialIconColumns', num)}
                                                className={`py-3 rounded-2xl border-2 font-black text-xs transition-all ${
                                                  (formData.socialIconColumns || 0) === num
                                                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent hover:bg-gray-100'
                                                }`}
                                              >
                                                {num === 0 ? (isRtl ? 'تلقائي' : 'Auto') : num}
                                              </button>
                                            ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex flex-col md:flex-row gap-3 items-end">
                                    <div className="flex-1 w-full space-y-2"><label className={labelClasses}>{t('المنصة', 'Platform')}</label><select value={socialInput.platformId} onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} className={inputClasses}>{SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                                    <div className="flex-[2] w-full space-y-2"><label className={labelClasses}>{t('رابط الحساب', 'Profile URL')}</label><input type="text" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} className={inputClasses} placeholder="https://..." /></div>
                                    <button type="button" onClick={() => { if (!socialInput.url) return; const platform = SOCIAL_PLATFORMS.find(p => p.id === socialInput.platformId); setFormData(prev => ({ ...prev, socialLinks: [...(prev.socialLinks || []), { platform: platform!.name, url: socialInput.url, platformId: platform!.id }] })); setSocialInput({ ...socialInput, url: '' }); }} className="p-4 bg-blue-600 text-white rounded-2xl shadow-0 hover:bg-black transition-all"><Plus size={24} /></button>
                                 </div>

                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {formData.socialLinks.map((link, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 group transition-all">
                                         <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800"><SocialIcon platformId={link.platformId} size={18} /></div>
                                            <div className="min-w-0"><p className="text-[8px] font-black uppercase text-gray-500">{link.platform}</p><p className="text-xs font-bold truncate max-w-[120px] dark:text-white">{link.url}</p></div>
                                         </div>
                                         <button type="button" onClick={() => { const u = [...formData.socialLinks]; u.splice(idx, 1); handleChange('socialLinks', u); }} className="p-2 text-red-400 hover:text-red-500 rounded-lg transition-all"><Trash2 size={18}/></button>
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
                                      <div className="flex items-center gap-2">
                                        <VisibilityIcon field="showSpecialLinks" />
                                        <div className="flex items-center gap-1 border-r pr-2 ml-2 dark:border-gray-800">
                                          <button type="button" onClick={() => handleChange('specialLinks', [])} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                          <button type="button" onClick={() => specialLinkInputRef.current?.click()} className="p-2 text-blue-600 hover:text-blue-700 transition-all"><Plus size={18}/></button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-6">
                                       <div className="grid grid-cols-1 gap-6">
                                          <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Grid size={16} /></div>
                                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('عدد الأعمدة', 'Columns')}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                              {[1, 2, 3].map(num => (
                                                <button
                                                  key={num}
                                                  type="button"
                                                  onClick={() => handleChange('specialLinksCols', num)}
                                                  className={`py-4 rounded-2xl border-2 font-black text-sm transition-all ${
                                                    (formData.specialLinksCols ?? (currentTemplate?.config.specialLinksCols || 2)) === num
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent hover:bg-gray-100'
                                                  }`}
                                                >
                                                  {num}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                       </div>

                                       <div className="space-y-4 pt-4 border-t dark:border-white/5">
                                          <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{t('نسبة العرض للارتفاع', 'Aspect Ratio Selection')}</label>
                                          <div className="grid grid-cols-3 gap-3">
                                             {[
                                               { id: 'square', label: 'مربع' },
                                               { id: 'video', label: 'بانورامي' },
                                               { id: 'portrait', label: 'طولي' }
                                             ].map(ratio => (
                                                <button 
                                                  key={ratio.id} 
                                                  onClick={() => handleChange('specialLinksAspectRatio', ratio.id)} 
                                                  className={`py-4 rounded-2xl border-2 transition-all font-black text-[9px] uppercase ${formData.specialLinksAspectRatio === ratio.id ? 'bg-pink-600 text-white border-pink-600 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700'}`}
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
                                          <input type="file" ref={specialLinkInputRef} className="hidden" onChange={handleSpecialLinkUpload} accept="image/*" />
                                       </div>

                                       <div className="grid grid-cols-1 gap-4">
                                          {(formData.specialLinks || []).map((link) => (
                                             <div key={link.id} className="flex flex-col md:flex-row gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-800 group items-center">
                                                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-gray-900 relative">
                                                   <img src={link.imageUrl} className="w-full h-full object-cover" alt="Item" />
                                                   {isUploadingSpecialImg && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 size={16} className="animate-spin text-white" /></div>}
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                   <div className="space-y-1">
                                                      <label className="text-[8px] font-black text-pink-600 uppercase px-1">{t('رابط الوجهة', 'Link URL')}</label>
                                                      <input type="url" value={link.linkUrl} onChange={e => updateSpecialLink(link.id, 'linkUrl', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-pink-500" />
                                                   </div>
                                                   <div className="space-y-1">
                                                      <label className="text-[8px] font-black text-pink-600 uppercase px-1">{t('العنوان', 'Title')}</label>
                                                      <input type="text" value={isRtl ? link.titleAr : link.titleEn} onChange={e => updateSpecialLink(link.id, isRtl ? 'titleAr' : 'titleEn', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-pink-500" placeholder={t('أدخل العنوان', 'Enter Title')} />
                                                   </div>
                                                </div>
                                                <button onClick={() => removeSpecialLink(link.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all shrink-0"><Trash2 size={18}/></button>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'membership' && (
                              <div className="space-y-6 animate-fade-in">
                                 <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className="p-3 bg-white dark:bg-amber-900/30 rounded-xl text-amber-600"><ShieldCheck size={24}/></div>
                                       <h3 className="font-black dark:text-white uppercase tracking-tighter">{t('تفعيل قسم العضوية', 'Enable Membership')}</h3>
                                    </div>
                                    <button onClick={() => handleChange('showMembership', !formData.showMembership)} className={`w-12 h-6 rounded-full relative transition-all ${formData.showMembership ? 'bg-amber-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRtl ? (formData.showMembership ? 'right-7' : 'right-1') : (formData.showMembership ? 'left-7' : 'left-1')}`} /></button>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'event' && (
                              <div className="space-y-6 animate-fade-in">
                                 <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className="p-3 bg-white dark:bg-rose-900/30 rounded-xl text-rose-600"><Calendar size={24}/></div>
                                       <h3 className="font-black dark:text-white uppercase tracking-tighter">{t('تفعيل قسم المناسبة', 'Enable Occasion')}</h3>
                                    </div>
                                    <button onClick={() => handleChange('showOccasion', !formData.showOccasion)} className={`w-12 h-6 rounded-full relative transition-all ${formData.showOccasion ? 'bg-rose-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRtl ? (formData.showOccasion ? 'right-7' : 'right-1') : (formData.showOccasion ? 'left-7' : 'left-1')}`} /></button>
                                 </div>
                              </div>
                            )}

                            {activeTab === 'theme' && (
                              <div className="space-y-6 animate-fade-in">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ColorPickerUI label={t('nameColor')} field="nameColor" icon={Pipette} />
                                    <ColorPickerUI label={t('titleColor')} field="titleColor" icon={Pipette} />
                                 </div>
                              </div>
                            )}

                            {activeTab === 'design' && (
                               <div className="space-y-6 animate-fade-in">
                                  <RangeControl label={t('إزاحة منطقة البيانات', 'Overlap Y Offset')} min={-200} max={200} value={formData.bodyOffsetY ?? 0} onChange={(v: number) => handleChange('bodyOffsetY', v)} icon={Move} />
                               </div>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 flex items-center justify-between">
                   <button onClick={handlePrev} disabled={currentIndex === 0} className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-xs uppercase border shadow-sm disabled:opacity-30 flex items-center gap-2">
                      <ChevronLeft size={18} className={isRtl ? 'rotate-180' : ''}/> {t('السابق', 'Back')}
                   </button>
                   <div className="flex gap-3">
                      {currentIndex < tabs.length - 1 ? (
                        <button onClick={handleNext} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                           {t('التالي', 'Next')} <ChevronRight size={18} className={isRtl ? 'rotate-180' : ''}/>
                        </button>
                      ) : (
                        <button onClick={handleSaveDirect} className="px-16 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                           <Save size={18}/> {t('حفظ نهائي', 'Finish & Save')}
                        </button>
                      )}
                   </div>
                </div>
            </div>
        </main>

        <aside className="hidden lg:block w-[400px] shrink-0 sticky top-24 h-[calc(100vh-120px)]">
           <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Monitor size={18} className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('المعاينة المباشرة', 'Real-time Preview')}</span>
                 </div>
                 <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg ${previewDevice === 'mobile' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Smartphone size={16}/></button>
                    <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-lg ${previewDevice === 'tablet' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Tablet size={16}/></button>
                    <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg ${previewDevice === 'desktop' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Monitor size={16}/></button>
                 </div>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-black/20 p-6 overflow-y-auto no-scrollbar">
                 <div 
                   className={`mx-auto transition-all duration-500 relative overflow-hidden ${previewDevice === 'mobile' ? 'rounded-[3rem] border-[8px] border-gray-950 dark:border-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.4)] bg-white dark:bg-black' : 'shadow-2xl rounded-2xl'}`} 
                   style={{ 
                     width: '100%', 
                     maxWidth: previewDevice === 'mobile' ? '320px' : (previewDevice === 'tablet' ? '450px' : '100%') 
                   }}
                 >
                    {previewDevice === 'mobile' && (
                       <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-950 dark:bg-gray-900 rounded-full z-50 border border-white/5 shadow-inner"></div>
                    )}
                    <div className={previewDevice === 'mobile' ? 'max-h-[600px] overflow-y-auto no-scrollbar' : ''}>
                       <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} bodyOffsetYOverride={previewBodyOffsetY} />
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
