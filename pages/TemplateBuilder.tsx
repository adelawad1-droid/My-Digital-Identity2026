
import React, { useState, useRef, useEffect } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData, TemplateCategory, VisualStyle, ThemeType, PageBgStrategy, SpecialLinkItem } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS, BACKGROUND_PRESETS, AVATAR_PRESETS, PATTERN_PRESETS, SVG_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import { getAllCategories, saveTemplateCategory, getAllVisualStyles, auth, getSiteSettings, searchUsersByEmail } from '../services/firebase';
import CardPreview from './CardPreview';
import AuthModal from './AuthModal';
import { 
  Save, Layout, Smartphone, Layers, Move, Check, X, 
  Zap, AlignCenter, Circle, Box, Loader2, Type as TypographyIcon, 
  Ruler, Star, Hash, ArrowLeft, Palette, Sparkles, ImageIcon, 
  UploadCloud, Sun, Moon, Pipette, Settings, FileText, AlignLeft, 
  AlignRight, LayoutTemplate, Info, Maximize2, UserCircle, Mail, 
  Phone, Globe, MessageCircle, Camera, Download, Tablet, Monitor, 
  Eye, QrCode, Wind, GlassWater, ChevronRight, ChevronLeft, 
  Waves, Square, Columns, Minus, ToggleLeft, ToggleRight, Calendar, MapPin, Timer, PartyPopper, Link as LinkIcon, FolderOpen, Plus, Tag, Settings2, SlidersHorizontal, Share2, FileCode, HardDrive, Database,
  CheckCircle2, Grid, RefreshCcw, Shapes, Code2, MousePointer2, AlignJustify, EyeOff, Briefcase, Wand2, RotateCcw, AlertTriangle, Repeat, Sparkle, LogIn, Trophy, Trash2, ImagePlus, Navigation2, Map as MapIcon, ShoppingCart, Quote, User as UserIcon, Image as ImageIconLucide, ArrowLeftRight, ArrowUpDown, MonitorDot, TabletSmartphone, ShieldCheck, UserCheck, Search, Grab, ChevronDown, Sticker
} from 'lucide-react';

// --- المكونات المساعدة ---

type BuilderTab = 
  | 'header' 
  | 'body-style' 
  | 'visuals' 
  | 'avatar' 
  | 'identity-lab' 
  | 'bio-lab' 
  | 'direct-links' 
  | 'membership-lab' 
  | 'contact-lab' 
  | 'special-links' 
  | 'floating-asset-lab'
  | 'occasion-lab'
  | 'location' 
  | 'social-lab' 
  | 'qrcode' 
  | 'special-features' 
  | 'desktop-lab';

const RangeControl = ({ label, value, min, max, onChange, unit = "px", icon: Icon, hint }: any) => {
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d-]/g, '');
    setTempValue(val);
    if (val !== '' && val !== '-') {
      onChange(parseInt(val) || 0);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121215] p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-all hover:border-blue-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
             {Icon && <Icon size={14} />}
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
              {hint && <span className="text-[7px] text-gray-400 font-bold">{hint}</span>}
           </div>
        </div>
        <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-full px-1 py-0.5 border border-blue-100 dark:border-blue-800/30">
           <input 
             type="text"
             inputMode="numeric"
             dir="ltr"
             value={tempValue} 
             onChange={handleInputChange}
             className="w-16 bg-transparent text-center text-xs font-black text-blue-600 outline-none border-none"
           />
           <span className="text-[8px] font-black text-blue-400 pr-2 pointer-events-none">{unit}</span>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={isNaN(parseInt(tempValue)) ? 0 : parseInt(tempValue)} 
        onChange={(e) => onChange(parseInt(e.target.value))} 
        className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
      />
    </div>
  );
};

const ToggleSwitch = ({ label, value, onChange, icon: Icon, color = "bg-blue-600", isRtl }: any) => (
  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#121215] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:bg-gray-50/50">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
        {Icon && <Icon size={20} />}
      </div>
      <span className={`text-xs font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
    </div>
    <button type="button" onClick={() => onChange(!value)} className={`w-14 h-7 rounded-full relative transition-all ${value ? color + ' shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-8' : 'right-1') : (value ? 'left-8' : 'left-1')}`} />
    </button>
  </div>
);

const ColorPicker = ({ label, value, onChange }: any) => (
  <div className={`flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm`}>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-3">
       <div className="relative w-9 h-9 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
          <input type="color" value={value?.startsWith('rgba') || !value?.startsWith('#') ? '#3b82f6' : (value || '#ffffff')} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
          <div className="w-full h-full" style={{ backgroundColor: value || '#ffffff' }} />
       </div>
       <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-3 py-2 text-[10px] font-black text-blue-600 w-24 uppercase text-center outline-none" placeholder="#HEX" />
    </div>
  </div>
);

const NavItem = ({ id, activeTab, setActiveTab, label, icon: Icon, colorClass = "text-gray-500 dark:text-gray-400", activeBg = "bg-blue-600" }: any) => (
  <button 
    type="button" 
    onClick={() => setActiveTab(id)} 
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${activeTab === id ? `${activeBg} text-white shadow-md` : `${colorClass} hover:bg-gray-100 dark:hover:bg-white/5`}`}
  >
    <div className={`p-1.5 rounded-lg ${activeTab === id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'} transition-colors`}>
      <Icon size={14} className={activeTab === id ? 'text-white' : 'text-gray-400'} />
    </div>
    <span className={`text-[11px] font-black uppercase tracking-tight leading-tight text-start flex-1 ${activeTab === id ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
    {activeTab === id && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
  </button>
);

interface TemplateBuilderProps {
  lang: Language;
  onSave: (template: CustomTemplate) => void;
  onCancel?: () => void;
  initialTemplate?: CustomTemplate;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, onSave, onCancel, initialTemplate }) => {
  const isRtl = lang === 'ar';
  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-1.5";
  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all shadow-inner";

  const bgInputRef = useRef<HTMLInputElement>(null);
  const bodyBgInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const specialLinkInputRef = useRef<HTMLInputElement>(null);
  const floatingAssetInputRef = useRef<HTMLInputElement>(null);
  
  const ADMIN_PRESET_COLORS = ['#2563eb', '#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#f43f5e', '#db2777', '#d946ef', '#a855f7', '#7c3aed', '#6366f1', '#4b5563', '#0f172a'];

  const t = (key: string, enVal?: string) => {
    if (enVal) return isRtl ? key : enVal;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };
  
  const [activeTab, setActiveTab] = useState<BuilderTab>('header');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [loading, setLoading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingBodyBg, setUploadingBodyBg] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingSpecialImg, setUploadingSpecialImg] = useState(false);
  const [uploadingFloating, setUploadingFloating] = useState(false);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(initialTemplate?.parentStyleId || '');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);

  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showDirectAuth, setShowDirectAuth] = useState(false);
  
  const [userQuery, setUserQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [uploadConfig, setUploadConfig] = useState({ storageType: 'database', uploadUrl: '' });

  const [template, setTemplate] = useState<CustomTemplate>(initialTemplate || {
    id: `tmpl_${Date.now()}`,
    categoryId: '',
    parentStyleId: '',
    restrictedUserId: '',
    nameAr: 'قالب جديد مخصص',
    nameEn: 'New Custom Template',
    descAr: '',
    descEn: '',
    isActive: true,
    isFeatured: false,
    order: 0,
    createdAt: new Date().toISOString(),
    config: {
      headerType: 'classic',
      headerHeight: 200,
      avatarStyle: 'circle',
      avatarSize: 120,
      avatarOffsetY: 0,
      avatarOffsetX: 0,
      avatarBorderWidth: 4,
      avatarBorderColor: '#ffffff',
      avatarAnimatedBorder: false,
      avatarAnimatedBorderColor1: '#3b82f6',
      avatarAnimatedBorderColor2: '#ffffff',
      avatarAnimatedBorderSpeed: 3,
      avatarAnimatedGlow: false,
      nameOffsetY: 0,
      nameOffsetX: 0,
      titleOffsetY: 0,
      titleOffsetX: 0,
      bioOffsetY: 0,
      bioOffsetX: 0,
      emailOffsetY: 0,
      emailOffsetX: 0,
      websiteOffsetY: 0,
      websiteOffsetX: 0,
      contactButtonsOffsetY: 0,
      contactButtonsOffsetX: 0,
      contactButtonsGap: 12,
      contactButtonsRadius: 16,
      contactButtonsPaddingV: 16,
      contactButtonsGlassy: false,
      socialLinksOffsetY: 0,
      socialLinksOffsetX: 0,
      contentAlign: 'center',
      buttonStyle: 'pill',
      animations: 'none',
      spacing: 'normal',
      nameSize: 26,
      bioSize: 13,
      qrSize: 90,
      qrColor: '#2563eb',
      qrBgColor: 'transparent',
      qrPadding: 0,
      qrOffsetY: 0,
      qrOffsetX: 0,
      qrBorderWidth: 4,
      qrBorderColor: '#f9fafb',
      qrBorderRadius: 0, 
      showQrCodeByDefault: true,
      showBioByDefault: true,
      showNameByDefault: true,
      showTitleByDefault: true,
      showCompanyByDefault: true,
      showEmailByDefault: true,
      showWebsiteByDefault: true,
      showPhoneByDefault: true,
      showWhatsappByDefault: true,
      showSocialLinksByDefault: true,
      showButtonsByDefault: true,
      showOccasionByDefault: false,
      occasionTitleAr: 'مناسبة قادمة',
      occasionTitleEn: 'Upcoming Occasion',
      occasionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      occasionOffsetY: 0,
      occasionOffsetX: 0,
      occasionPrimaryColor: '#3b82f6',
      occasionBgColor: '',
      occasionGlassy: false,
      showSpecialLinksByDefault: true,
      specialLinksCols: 2,
      specialLinksGap: 12,
      specialLinksRadius: 24,
      specialLinksAspectRatio: 'square',
      specialLinksOffsetY: 0,
      specialLinksOffsetX: 0,
      defaultSpecialLinks: [],
      floatingAssetUrl: '',
      floatingAssetSize: 100,
      floatingAssetOffsetX: 0,
      floatingAssetOffsetY: 0,
      floatingAssetOpacity: 100,
      showFloatingAssetByDefault: false,
      showMembershipByDefault: false,
      membershipTitleAr: 'اشتراك مفعل',
      membershipTitleEn: 'Active Subscription',
      membershipStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      membershipExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      membershipOffsetY: 0,
      membershipOffsetX: 0,
      membershipGlassy: false,
      membershipBgColor: '',
      membershipBorderColor: '',
      membershipTextColor: '',
      membershipAccentColor: '',
      showLocationByDefault: true,
      locationOffsetY: 0,
      locationOffsetX: 0,
      locationBgColor: '',
      locationIconColor: '',
      locationTextColor: '',
      locationBorderRadius: 24,
      locationGlassy: false,
      locationPaddingV: 20,
      locationAddressSize: 13,
      linksSectionVariant: 'list',
      linksSectionBgColor: '',
      linksSectionTextColor: '',
      linksSectionIconColor: '',
      linksSectionRadius: 24,
      linksSectionGlassy: false,
      linksSectionOffsetY: 0,
      linksSectionOffsetX: 0,
      linksSectionPadding: 0,
      linksSectionPaddingV: 24,
      linksSectionGap: 12,
      linksShowText: true,
      linksShowBg: true,
      linksWebsiteIconType: 'globe',
      linksItemBgColor: '',
      linksItemRadius: 16,
      showStarsByDefault: false,
      isVerifiedByDefault: false,
      hasGoldenFrameByDefault: false,
      headerGlassy: false,
      headerOpacity: 100,
      bodyGlassy: false,
      bodyOpacity: 100,
      bodyOffsetY: 0,
      bodyOffsetX: 0,
      bodyBorderRadius: 48,
      nameColor: '#111827',
      titleColor: '#2563eb',
      bioTextColor: 'rgba(0,0,0,0.65)',
      bioBgColor: 'rgba(0,0,0,0.03)',
      bioBorderRadius: 32,
      bioBorderWidth: 1,
      bioBorderColor: '',
      bioPaddingV: 20,
      bioPaddingH: 20,
      bioGlassy: false,
      bioOpacity: 100,
      bioMaxWidth: 90,
      bioTextAlign: 'center',
      defaultBioAr: '',
      defaultBioEn: '',
      linksColor: '#3b82f6',
      socialIconsColor: '#3b82f6',
      contactPhoneColor: '#2563eb',
      contactWhatsappColor: '#10b981',
      defaultThemeType: 'gradient',
      defaultThemeColor: '#2563eb',
      defaultThemeGradient: THEME_GRADIENTS[0],
      defaultName: '',
      defaultTitle: '',
      defaultCompany: '',
      defaultIsDark: false,
      cardBodyColor: '#ffffff',
      cardBodyBackgroundImage: '',
      cardBodyThemeType: 'color',
      cardBgColor: '#f1f5f9', 
      pageBgColor: '',
      pageBgStrategy: 'solid',
      desktopLayout: 'centered-card',
      cardMaxWidth: 500,
      desktopBodyOffsetY: -60,
      mobileBodyOffsetY: 0,
      headerPatternId: 'none',
      headerPatternOpacity: 20,
      headerPatternScale: 100,
      showBodyFeatureByDefault: false,
      bodyFeatureTextAr: 'ميزة حصرية',
      bodyFeatureTextEn: 'EXCLUSIVE FEATURE',
      bodyFeatureBgColor: '#3b82f6',
      bodyFeatureTextColor: '#ffffff',
      bodyFeatureHeight: 45,
      bodyFeaturePaddingX: 0,
      bodyFeatureOffsetY: 0,
      bodyFeatureOffsetX: 0,
      bodyFeatureBorderRadius: 16,
      bodyFeatureGlassy: false,
      socialIconStyle: 'rounded',
      socialIconSize: 22,
      socialIconVariant: 'filled',
      socialIconBgColor: '',
      socialIconColor: '',
      socialIconBorderWidth: 1,
      socialIconBorderColor: '',
      socialIconGap: 12,
      socialIconColumns: 0,
      socialIconPadding: 14,
      useSocialBrandColors: false
    }
  });

  const [currentSpecialLinks, setCurrentSpecialLinks] = useState<SpecialLinkItem[]>(initialTemplate?.config.defaultSpecialLinks || (SAMPLE_DATA[lang]?.specialLinks as SpecialLinkItem[]) || []);

  useEffect(() => {
    getAllCategories().then(setCategories);
    getAllVisualStyles().then(setVisualStyles);
    getSiteSettings().then(settings => {
      if (settings) {
        setUploadConfig({
          storageType: settings.imageStorageType || 'database',
          uploadUrl: settings.serverUploadUrl || ''
        });
      }
    });
  }, []);

  useEffect(() => {
    updateConfig('defaultSpecialLinks', currentSpecialLinks);
  }, [currentSpecialLinks]);

  useEffect(() => {
    if (userQuery.length >= 3) {
      setIsSearchingUsers(true);
      const timer = setTimeout(async () => {
        const results = await searchUsersByEmail(userQuery);
        setUserSearchResults(results);
        setIsSearchingUsers(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUserSearchResults([]);
    }
  }, [userQuery]);

  const updateTemplate = (key: keyof CustomTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  };

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setTemplate(prev => {
       const newConfig = { ...prev.config, [key]: value };
       // ضمان مزامنة الإزاحات لمنع التشتت
       if (key === 'bodyOffsetY') newConfig.mobileBodyOffsetY = value;
       if (key === 'mobileBodyOffsetY') newConfig.bodyOffsetY = value;
       
       return { ...prev, config: newConfig };
    });
  };

  const resetOffsets = () => {
    setShowResetConfirm(true);
  };

  const handleActualReset = () => {
    const resetConfig: Partial<TemplateConfig> = {
      avatarOffsetY: 0,
      avatarOffsetX: 0,
      nameOffsetY: 0,
      nameOffsetX: 0,
      titleOffsetY: 0,
      titleOffsetX: 0,
      bioOffsetY: 0,
      bioOffsetX: 0,
      emailOffsetY: 0,
      emailOffsetX: 0,
      websiteOffsetY: 0,
      websiteOffsetX: 0,
      contactButtonsOffsetY: 0,
      contactButtonsOffsetX: 0,
      socialLinksOffsetY: 0,
      socialLinksOffsetX: 0,
      bodyOffsetY: 0,
      bodyOffsetX: 0,
      qrOffsetY: 0,
      qrOffsetX: 0,
      bodyFeatureOffsetY: 0,
      bodyFeatureOffsetX: 0,
      bodyFeaturePaddingX: 0,
      specialLinksOffsetY: 0,
      specialLinksOffsetX: 0,
      floatingAssetOffsetX: 0,
      floatingAssetOffsetY: 0,
      occasionOffsetY: 0,
      occasionOffsetX: 0,
      locationOffsetY: 0,
      locationOffsetX: 0,
      linksSectionOffsetY: 0,
      linksSectionOffsetX: 0,
      membershipOffsetY: 0,
      membershipOffsetX: 0,
      spacing: 'normal',
      contentAlign: 'center',
      mobileBodyOffsetY: 0,
      desktopBodyOffsetY: -60
    };

    setTemplate(prev => ({
      ...prev,
      config: { 
        ...prev.config, 
        ...resetConfig 
      }
    }));
    setShowResetConfirm(false);
  };

  const applyVisualStyle = (style: VisualStyle) => {
    setSelectedStyleId(style.id);
    setTemplate(prev => ({
      ...prev,
      parentStyleId: style.id,
      config: { ...prev.config, ...style.config }
    }));
  };

  const checkAuthAndClick = (ref: React.RefObject<HTMLInputElement>) => {
    if (!auth.currentUser) {
      setShowAuthWarning(true);
      return;
    }
    ref.current?.click();
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const b = await uploadImageToCloud(file, 'background', uploadConfig as any);
      if (b) {
        updateConfig('defaultBackgroundImage', b);
        updateConfig('defaultThemeType', 'image');
      }
    } finally {
      setUploadingBg(false);
    }
  };

  const handleBodyBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBodyBg(true);
    try {
      const b = await uploadImageToCloud(file, 'background', uploadConfig as any);
      if (b) {
        updateConfig('cardBodyBackgroundImage', b);
        updateConfig('cardBodyThemeType', 'image');
      }
    } finally {
      setUploadingBodyBg(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const b = await uploadImageToCloud(file, 'avatar', uploadConfig as any);
      if (b) {
        updateConfig('defaultProfileImage', b);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFloatingAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFloating(true);
    try {
      const b = await uploadImageToCloud(file, 'logo', uploadConfig as any);
      if (b) {
        updateConfig('floatingAssetUrl', b);
        updateConfig('showFloatingAssetByDefault', true);
        setActiveTab('floating-asset-lab');
      }
    } finally {
      setUploadingFloating(false);
    }
  };

  const handleSpecialLinkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSpecialImg(true);
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
        setCurrentSpecialLinks([...currentSpecialLinks, newItem]);
      }
    } finally {
      setUploadingSpecialImg(false);
    }
  };

  const updateSpecialLink = (id: string, field: keyof SpecialLinkItem, value: string) => {
    setCurrentSpecialLinks(currentSpecialLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeSpecialLink = (id: string) => {
    setCurrentSpecialLinks(currentSpecialLinks.filter(l => l.id !== id));
  };

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  const isFullHeaderPreview = template.config.desktopLayout === 'full-width-header' && previewDevice === 'desktop';

  // ضمان أن الإزاحة تتبع أحدث قيمة تم ضبطها في باني القوالب (bodyOffsetY)
  const previewBodyOffsetY = (previewDevice === 'mobile' || previewDevice === 'tablet' || template.config.desktopLayout !== 'full-width-header') 
    ? (template.config.bodyOffsetY ?? 0) 
    : 0;

  const previewDesktopPullUp = (previewDevice === 'desktop')
    ? (template.config.desktopBodyOffsetY ?? 0)
    : 0;

  const getPreviewPageBg = () => {
    if (template.config.pageBgStrategy === 'mirror-header') {
      if (template.config.defaultThemeType === 'gradient') {
        return template.config.defaultThemeGradient;
      }
      return template.config.defaultThemeColor || (template.config.defaultIsDark ? '#050507' : '#f8fafc');
    }
    return template.config.pageBgColor || (template.config.defaultIsDark ? '#050507' : '#f8fafc');
  };

  const previewPageBg = getPreviewPageBg();

  // --- Drag Handling Logic ---
  const [activeDragElement, setActiveDragElement] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragInitialValues = useRef({ ox: 0, oy: 0 });
  const previewScale = previewDevice === 'desktop' ? 0.48 : 1;

  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    if (!isDragMode) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveDragElement(elementId);
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    const config = template.config;
    let ox = 0, oy = 0;
    
    switch(elementId) {
      case 'avatar': ox = config.avatarOffsetX || 0; oy = config.avatarOffsetY || 0; break;
      case 'name': ox = config.nameOffsetX || 0; oy = config.nameOffsetY || 0; break;
      case 'title': ox = config.titleOffsetX || 0; oy = config.titleOffsetY || 0; break;
      case 'bio': ox = config.bioOffsetX || 0; oy = config.bioOffsetY || 0; break;
      case 'bodyFeature': ox = config.bodyFeatureOffsetX || 0; oy = config.bodyFeatureOffsetY || 0; break;
      case 'linksSection': ox = config.linksSectionOffsetX || 0; oy = config.linksSectionOffsetY || 0; break;
      case 'contactButtons': ox = config.contactButtonsOffsetX || 0; oy = config.contactButtonsOffsetY || 0; break;
      case 'membership': ox = config.membershipOffsetX || 0; oy = config.membershipOffsetY || 0; break;
      case 'occasion': ox = config.occasionOffsetX || 0; oy = config.occasionOffsetY || 0; break;
      case 'specialLinks': ox = config.specialLinksOffsetX || 0; oy = config.specialLinksOffsetY || 0; break;
      case 'floatingAsset': ox = config.floatingAssetOffsetX || 0; oy = config.floatingAssetOffsetY || 0; break;
      case 'location': ox = config.locationOffsetX || 0; oy = config.locationOffsetY || 0; break;
      case 'socialLinks': ox = config.socialLinksOffsetX || 0; oy = config.socialLinksOffsetY || 0; break;
      case 'qrCode': ox = config.qrOffsetX || 0; oy = config.qrOffsetY || 0; break;
    }
    
    dragInitialValues.current = { ox, oy };
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!activeDragElement) return;
    
    const dx = (e.clientX - dragStartPos.current.x) / previewScale;
    const dy = (e.clientY - dragStartPos.current.y) / previewScale;
    
    const newX = Math.round(dragInitialValues.current.ox + dx);
    const newY = Math.round(dragInitialValues.current.oy + dy);
    
    switch(activeDragElement) {
      case 'avatar': updateConfig('avatarOffsetX', newX); updateConfig('avatarOffsetY', newY); break;
      case 'name': updateConfig('nameOffsetX', newX); updateConfig('nameOffsetY', newY); break;
      case 'title': updateConfig('titleOffsetX', newX); updateConfig('titleOffsetY', newY); break;
      case 'bio': updateConfig('bioOffsetX', newX); updateConfig('bioOffsetY', newY); break;
      case 'bodyFeature': updateConfig('bodyFeatureOffsetX', newX); updateConfig('bodyFeatureOffsetY', newY); break;
      case 'linksSection': updateConfig('linksSectionOffsetX', newX); updateConfig('linksSectionOffsetY', newY); break;
      case 'contactButtons': updateConfig('contactButtonsOffsetX', newX); updateConfig('contactButtonsOffsetY', newY); break;
      case 'membership': updateConfig('membershipOffsetX', newX); updateConfig('membershipOffsetY', newY); break;
      case 'occasion': updateConfig('occasionOffsetX', newX); updateConfig('occasionOffsetY', newY); break;
      case 'specialLinks': updateConfig('specialLinksOffsetX', newX); updateConfig('specialLinksOffsetY', newY); break;
      case 'floatingAsset': updateConfig('floatingAssetOffsetX', newX); updateConfig('floatingAssetOffsetY', newY); break;
      case 'location': updateConfig('locationOffsetX', newX); updateConfig('locationOffsetY', newY); break;
      case 'socialLinks': updateConfig('socialLinksOffsetX', newX); updateConfig('socialLinksOffsetY', newY); break;
      case 'qrCode': updateConfig('qrOffsetX', newX); updateConfig('qrOffsetY', newY); break;
    }
  };

  const handleDragEnd = () => {
    setActiveDragElement(null);
  };

  useEffect(() => {
    if (activeDragElement) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [activeDragElement]);

  const [mouseYPercentage, setMouseYPercentage] = useState(0);

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setMouseYPercentage(percentage);
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'group1': true, 
    'group2': false,
    'group3': false,
    'group4': false,
    'group5': false
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const newState: Record<string, boolean> = {
        'group1': false, 'group2': false, 'group3': false, 'group4': false, 'group5': false
      };
      newState[groupId] = !prev[groupId];
      return newState;
    });
  };

  useEffect(() => {
    const groups = [
      { id: 'group1', tabs: ['header', 'body-style', 'visuals'] },
      { id: 'group2', tabs: ['avatar', 'identity-lab', 'bio-lab', 'location'] },
      { id: 'group3', tabs: ['contact-lab', 'social-lab', 'direct-links', 'qrcode'] },
      { id: 'group4', tabs: ['special-links', 'floating-asset-lab', 'occasion-lab'] },
      { id: 'group5', tabs: ['special-features', 'membership-lab', 'desktop-lab'] }
    ];
    
    const targetGroup = groups.find(g => g.tabs.includes(activeTab));
    if (targetGroup && !openGroups[targetGroup.id]) {
      setOpenGroups({
        'group1': false, 'group2': false, 'group3': false, 'group4': false, 'group5': false,
        [targetGroup.id]: true
      });
    }
  }, [activeTab]);

  return (
    <div className="bg-white dark:bg-[#0a0a0c] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[calc(100vh-100px)] min-h-[850px] relative">
      
      {showAuthWarning && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-[#121215] w-full max-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-10 text-center space-y-6 animate-zoom-in">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                 <UserCircle size={40} />
              </div>
              <h3 className="text-xl font-black dark:text-white leading-relaxed">
                 {isRtl ? "لرفع صورة خاصة الرجاء التسجيل في الموقع" : "To upload a custom image, please register on the site"}
              </h3>
              <p className="text-xs font-bold text-gray-400 leading-relaxed">
                 {isRtl ? "سجل حسابك الآن لتتمكن من تخصيص القوالب بصورك الافتراضية الخاصة." : "Sign up now to customize templates with your own default photos."}
              </p>
              <div className="flex flex-col gap-3 pt-4">
                 <button 
                   onClick={() => { setShowAuthWarning(false); setShowDirectAuth(true); }}
                   className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                 >
                    <LogIn size={18} />
                    {isRtl ? "تسجيل دخول" : "Login"}
                 </button>
                 <button 
                   onClick={() => setShowAuthWarning(false)}
                   className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl font-black text-[10px] uppercase transition-all"
                 >
                    {isRtl ? "إلغاء" : "Cancel"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {showDirectAuth && (
        <AuthModal 
          lang={lang} 
          onClose={() => setShowDirectAuth(false)} 
          onSuccess={() => { setShowDirectAuth(false); window.location.reload(); }} 
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-5">
          <button type="button" onClick={onCancel} className="p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 dark:border-gray-700 transition-all shadow-sm"><ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} /></button>
          <div>
            <h2 className="text-base font-black dark:text-white leading-none mb-1">{t('تصميم القالب المخصص', 'Custom Template Design')}</h2>
            <div className="flex items-center gap-2">
               <Hash size={10} className="text-blue-500" />
               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{template.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => checkAuthAndClick(floatingAssetInputRef)} 
            className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl font-black text-xs uppercase border border-indigo-100 dark:border-indigo-800/30 transition-all flex items-center gap-2 hover:bg-indigo-600 hover:text-white shadow-sm"
          >
             {uploadingFloating ? <Loader2 size={18} className="animate-spin" /> : <Sticker size={18} />}
             {isRtl ? 'إضافة ملحق خاص' : 'Add Custom Asset'}
          </button>
          <input type="file" ref={floatingAssetInputRef} className="hidden" accept="image/*" onChange={handleFloatingAssetUpload} />

          <button 
            type="button" 
            onClick={() => setIsDragMode(!isDragMode)} 
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 border-2 ${isDragMode ? 'bg-amber-500 text-white border-amber-600 shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
          >
             {isDragMode ? <Grab size={18} /> : <Move size={18} />}
             {isDragMode ? t('إيقاف التحريك الحر', 'Stop Drag Mode') : t('تفعيل التحريك الحر', 'Free Drag Mode')}
          </button>
          <button type="button" onClick={() => setShowSaveModal(true)} disabled={loading} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">{t('حفظ القالب', 'Save Template')}</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l dark:border-gray-800 flex flex-col overflow-y-auto no-scrollbar shrink-0 bg-white dark:bg-[#0a0a0c] p-3 space-y-2">
          
          <div className="overflow-hidden">
             <button 
               onClick={() => toggleGroup('group1')}
               className={`w-full flex items-center justify-between p-3.5 transition-all duration-300 group rounded-2xl ${openGroups['group1'] ? 'bg-blue-600 shadow-lg' : 'bg-blue-50 dark:bg-blue-900/10 hover:brightness-95'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl transition-all duration-300 ${openGroups['group1'] ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-md'}`}>
                      <LayoutTemplate size={18} />
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tighter ${openGroups['group1'] ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>1. {isRtl ? 'الترويسة والانماط' : 'Header & Styles'}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups['group1'] ? 'rotate-180 text-white' : 'text-blue-400'}`} />
             </button>
             {openGroups['group1'] && (
                <div className="px-1 pb-3 pt-2 space-y-1 animate-fade-in bg-blue-50/10 dark:bg-blue-900/5 rounded-b-2xl">
                   <NavItem id="header" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'الترويسة والأنماط' : 'Header & Patterns'} icon={Layout} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="body-style" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'جسم البطاقة' : 'Card Body Style'} icon={Box} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="visuals" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'الألوان والسمة' : 'Colors & Theme'} icon={Palette} colorClass="text-blue-600" activeBg="bg-blue-600" />
                </div>
             )}
          </div>

          <div className="overflow-hidden">
             <button 
               onClick={() => toggleGroup('group2')}
               className={`w-full flex items-center justify-between p-3.5 transition-all duration-300 group rounded-2xl ${openGroups['group2'] ? 'bg-blue-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800/50 hover:brightness-95'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl transition-all duration-300 ${openGroups['group2'] ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-md'}`}>
                      <UserIcon size={18} />
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tighter ${openGroups['group2'] ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>2. {isRtl ? 'بيانات الهوية' : 'Identity Data'}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups['group2'] ? 'rotate-180 text-white' : 'text-gray-400'}`} />
             </button>
             {openGroups['group2'] && (
                <div className="px-1 pb-3 pt-2 space-y-1 animate-fade-in bg-blue-50/10 dark:bg-blue-900/5 rounded-b-2xl">
                   <NavItem id="avatar" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'الصورة الشخصية' : 'Avatar Style'} icon={Circle} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="identity-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'بيانات الهوية' : 'Identity Details'} icon={UserIcon} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="bio-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'النبذة المهنية' : 'Professional Bio'} icon={Quote} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="location" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'الموقع الجغرافي' : 'Geographical Location'} icon={MapIcon} colorClass="text-blue-600" activeBg="bg-blue-600" />
                </div>
             )}
          </div>

          <div className="overflow-hidden">
             <button 
               onClick={() => toggleGroup('group3')}
               className={`w-full flex items-center justify-between p-3.5 transition-all duration-300 group rounded-2xl ${openGroups['group3'] ? 'bg-blue-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800/50 hover:brightness-95'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl transition-all duration-300 ${openGroups['group3'] ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-md'}`}>
                      <Share2 size={18} />
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tighter ${openGroups['group3'] ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>3. {isRtl ? 'التواصل والروابط' : 'Contact & Links'}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups['group3'] ? 'rotate-180 text-white' : 'text-white'}`} />
             </button>
             {openGroups['group3'] && (
                <div className="px-1 pb-3 pt-2 space-y-1 animate-fade-in bg-blue-50/10 dark:bg-blue-900/5 rounded-b-2xl">
                   <NavItem id="contact-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'قسم الاتصال' : 'Contact Section'} icon={Phone} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="social-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'أيقونات التواصل' : 'Social Icons'} icon={Share2} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="direct-links" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'قسم الروابط المباشرة' : 'Direct Links Section'} icon={LinkIcon} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="qrcode" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'رمز الـ QR' : 'QR Code Style'} icon={QrCode} colorClass="text-blue-600" activeBg="bg-blue-600" />
                </div>
             )}
          </div>

          <div className="overflow-hidden">
             <button 
               onClick={() => toggleGroup('group4')}
               className={`w-full flex items-center justify-between p-3.5 transition-all duration-300 group rounded-2xl ${openGroups['group4'] ? 'bg-blue-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800/50 hover:brightness-95'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl transition-all duration-300 ${openGroups['group4'] ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-md'}`}>
                      <Plus size={18} />
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tighter ${openGroups['group4'] ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>4. {isRtl ? 'المحتوى الإضافي' : 'Additional Content'}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups['group4'] ? 'rotate-180 text-white' : 'text-gray-400'}`} />
             </button>
             {openGroups['group4'] && (
                <div className="px-1 pb-3 pt-2 space-y-1 animate-fade-in bg-blue-50/10 dark:bg-blue-900/5 rounded-b-2xl">
                   <NavItem id="special-links" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'روابط صور (عروض/منتجات)' : 'Image Links'} icon={ImagePlus} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="floating-asset-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'إعدادات الملحق المخصص' : 'Floating Asset DNA'} icon={Sticker} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="occasion-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'قسم المناسبات' : 'Occasions'} icon={PartyPopper} colorClass="text-blue-600" activeBg="bg-blue-600" />
                </div>
             )}
          </div>

          <div className="overflow-hidden">
             <button 
               onClick={() => toggleGroup('group5')}
               className={`w-full flex items-center justify-between p-3.5 transition-all duration-500 group rounded-2xl ${openGroups['group5'] ? 'bg-blue-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800/50 hover:brightness-95'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl transition-all duration-300 ${openGroups['group5'] ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-md'}`}>
                      <Settings2 size={18} />
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tighter ${openGroups['group5'] ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>5. {isRtl ? 'المميزات والإعدادات' : 'Features & Settings'}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups['group5'] ? 'rotate-180 text-white' : 'text-gray-400'}`} />
             </button>
             {openGroups['group5'] && (
                <div className="px-1 pb-3 pt-2 space-y-1 animate-fade-in bg-blue-50/10 dark:bg-blue-900/5 rounded-b-2xl">
                   <NavItem id="special-features" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'المميزات الخاصة' : 'Special Features'} icon={Trophy} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="membership-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'العضويات والاشتراكات' : 'Memberships'} icon={ShieldCheck} colorClass="text-blue-600" activeBg="bg-blue-600" />
                   <NavItem id="desktop-lab" activeTab={activeTab} setActiveTab={setActiveTab} label={isRtl ? 'إعدادات العرض (سطح المكتب)' : 'Display Settings'} icon={MonitorDot} colorClass="text-blue-600" activeBg="bg-blue-600" />
                </div>
             )}
          </div>

        </div>

        <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-gray-50/20 dark:bg-transparent">
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-32">
            
            {activeTab === 'header' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-indigo-50 dark:bg-indigo-950/20 p-8 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/30 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Wand2 className="text-indigo-600" size={24} />
                          <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('استيراد ترويسة من المختبر', 'Import Header DNA')}</h4>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {visualStyles.map(style => (
                         <button 
                           key={style.id} 
                           type="button"
                           onClick={() => applyVisualStyle(style)}
                           className={`p-3 bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group hover:scale-105 ${template.parentStyleId === style.id ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-gray-100 dark:border-gray-800'}`}
                         >
                            <div className="w-full h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-500">
                               <LayoutTemplate size={20} />
                            </div>
                            <span className="text-[8px] font-black uppercase text-center truncate w-full">{isRtl ? style.nameAr : style.nameEn}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Shapes className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('هندسة الترويسة', 'Header Geometry')}</h4></div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                         {[
                           {id: 'classic', icon: LayoutTemplate, label: 'كلاسيك'},
                           {id: 'overlay', icon: Layers, label: 'متداخل'},
                           {id: 'side-left', icon: ChevronLeft, label: 'جانبي يسار'},
                           {id: 'side-right', icon: ChevronRight, label: 'جانبي يمين'},
                           {id: 'curved', icon: Wind, label: 'منحني'},
                           {id: 'wave', icon: Waves, label: 'موجي'},
                           {id: 'diagonal', icon: RefreshCcw, label: 'قطري'},
                           {id: 'split-left', icon: AlignLeft, label: 'قطري يسار'},
                           {id: 'split-right', icon: AlignRight, label: 'قطري يمين'},
                           {id: 'floating', icon: Square, label: 'عائم'},
                           {id: 'glass-card', icon: GlassWater, label: 'زجاجي'},
                           {id: 'modern-split', icon: Columns, label: 'حديث'}
                         ].map(item => (
                           <button 
                            key={item.id} 
                            onClick={() => updateConfig('headerType', item.id)} 
                            className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === item.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                           >
                             <item.icon size={20} /> 
                             <span className="text-[7px] font-black uppercase text-center leading-tight">{t(item.label, item.id)}</span>
                           </button>
                         ))}
                    </div>
                    <RangeControl label={t('ارتفاع الترويسة', 'Header Height')} min={40} max={1000} value={template.config.headerHeight} onChange={(v: number) => updateConfig('headerHeight', v)} icon={Maximize2} />
                 </div>
              </div>
            )}

            {activeTab === 'body-style' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                     <div className="flex items-center gap-3"><Box className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تنسيق جسم البطاقة', 'Card Content Area Style')}</h4></div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ToggleSwitch label={t('تفعيل تأثير زجاجي شفاف (Glassmorphism)', 'Premium Glass Body')} value={template.config.bodyGlassy} onChange={(v: boolean) => updateConfig('bodyGlassy', v)} icon={GlassWater} color="bg-indigo-600" isRtl={isRtl} />
                        
                        <div className="md:col-span-2 space-y-4">
                           <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-black/20 p-2 rounded-[2rem]">
                              {['color', 'image'].map(type => (
                                <button type="button" key={type} onClick={() => updateConfig('cardBodyThemeType', type)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${template.config.cardBodyThemeType === type ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent shadow-sm'}`}>
                                  {type === 'color' ? <Palette size={20}/> : <ImageIconLucide size={20}/>}
                                  <span className="text-[10px] font-black uppercase tracking-widest">{t(type === 'color' ? 'لون' : 'صورة خلفية', type.toUpperCase())}</span>
                                </button>
                              ))}
                           </div>

                           {template.config.cardBodyThemeType === 'color' ? (
                             <ColorPicker label={isRtl ? 'لون جسم البطاقة' : 'Card Body Color'} value={template.config.cardBodyColor || ''} onChange={(v: string) => updateConfig('cardBodyColor', v)} />
                           ) : (
                             <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                                <div className="w-full h-32 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4 flex items-center justify-center overflow-hidden relative">
                                   {template.config.cardBodyBackgroundImage ? (
                                     <img src={template.config.cardBodyBackgroundImage} className="w-full h-full object-cover" alt="Body BG" />
                                   ) : (
                                     <ImageIconLucide size={32} className="text-gray-200" />
                                   )}
                                   {uploadingBodyBg && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                                </div>
                                <input type="file" ref={bodyBgInputRef} onChange={handleBodyBgUpload} className="hidden" accept="image/*" />
                                <button type="button" onClick={() => checkAuthAndClick(bodyBgInputRef)} className="w-full py-4 bg-white dark:bg-gray-900 border rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-sm">
                                   <UploadCloud size={16} className="text-blue-500" />
                                   {t('رفع خلفية جسم البطاقة', 'Upload Body BG Image')}
                                </button>
                             </div>
                           )}
                        </div>

                        <RangeControl 
                           label={t('شفافية جسم البطاقة', 'Body Transparency')} 
                           min={0} max={100} unit="%" 
                           value={template.config.bodyOpacity ?? 100} 
                           onChange={(v: number) => updateConfig('bodyOpacity', v)} 
                           icon={Sun} 
                           hint={t('اضبطه على 0 للكتابة مباشرة فوق الصورة', 'Set to 0 to write directly over background')}
                        />
                        
                        <RangeControl label={t('انحناء الحواف العلوي', 'Border Radius')} min={0} max={120} value={template.config.bodyBorderRadius ?? 48} onChange={(v: number) => updateConfig('bodyBorderRadius', v)} icon={Ruler} />
                        
                        <div className="md:col-span-2">
                           <RangeControl label={isRtl ? 'إزاحة جسم البطاقة (الرأسي)' : 'Body Vertical Offset'} min={-2000} max={2000} value={template.config.bodyOffsetY ?? 0} onChange={(v: number) => updateConfig('bodyOffsetY', v)} icon={Move} hint={isRtl ? "يتحكم في تداخل المحتوى مع الترويسة" : "Controls content overlap with header"} />
                        </div>
                     </div>

                     <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                        <div className="flex items-center gap-3"><AlignJustify className="text-indigo-600" size={20} /><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('محاذات المحتوى ونمط التباعد', 'Alignment & Spacing DNA')}</label></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="grid grid-cols-3 gap-2">
                             {['start', 'center', 'end'].map(align => (
                                <button type="button" key={align} onClick={() => updateConfig('contentAlign', align)} className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center ${template.config.contentAlign === align ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                   {align === 'start' ? <AlignLeft size={18}/> : align === 'center' ? <AlignCenter size={18}/> : <AlignRight size={18}/>}
                                </button>
                             ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                             {['compact', 'normal', 'relaxed'].map(s => (
                                <button type="button" key={s} onClick={() => { updateConfig('spacing', s) }} className={`py-3 rounded-xl border-2 transition-all font-black text-[8px] uppercase ${template.config.spacing === s ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                   {t(s === 'compact' ? 'مضغوط' : (s === 'normal' ? 'عادي' : 'مريح'), s.toUpperCase())}
                                </button>
                             ))}
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
            {/* ... Rest of the tabs remain similar, ensure they call updateConfig which now syncs both offsetY fields ... */}
