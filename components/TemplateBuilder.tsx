
import React, { useState, useRef, useEffect } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData, TemplateCategory, VisualStyle, ThemeType, PageBgStrategy, SpecialLinkItem } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS, BACKGROUND_PRESETS, AVATAR_PRESETS, PATTERN_PRESETS, SVG_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import { getAllCategories, saveTemplateCategory, getAllVisualStyles, auth, getSiteSettings, searchUsersByEmail } from '../services/firebase';
import CardPreview from './CardPreview';
import { 
  Save, Layout, Smartphone, Layers, Move, Check, X, 
  Zap, AlignCenter, Circle, Box, Loader2, Type as TypographyIcon, 
  Ruler, Star, Hash, ArrowLeft, Palette, Sparkles, ImageIcon, 
  UploadCloud, Sun, Moon, Pipette, Settings, FileText, AlignLeft, 
  AlignRight, LayoutTemplate, LayoutGrid, Info, Maximize2, UserCircle, Mail, 
  Phone, Globe, MessageCircle, Camera, Download, Tablet, Monitor, 
  Eye, QrCode, Wind, GlassWater, ChevronRight, ChevronLeft, 
  Waves, Square, Columns, Minus, ToggleLeft, ToggleRight, Calendar, MapPin, Timer, PartyPopper, Link as LinkIcon, FolderOpen, Plus, Tag, Settings2, SlidersHorizontal, Share2, FileCode, HardDrive, Database,
  CheckCircle2, Grid, RefreshCcw, Shapes, Code2, MousePointer2, AlignJustify, EyeOff, Briefcase, Wand2 as MagicIcon, RotateCcw, AlertTriangle, Repeat, Sparkle, LogIn, Trophy, Trash2, ImagePlus, Navigation2, Map as MapIcon, ShoppingCart, Quote, User as UserIcon, Image as ImageIconLucide, ArrowLeftRight, ArrowUpDown, MonitorDot, TabletSmartphone, ShieldCheck, UserCheck, Search, Grab, ChevronDown, Sticker, Scaling, RotateCw, Aperture
} from 'lucide-react';

// --- Helper Components ---

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
              <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{label}</span>
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
  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#121215] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:bg-gray-50/50">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
        {Icon && <Icon size={20} />}
      </div>
      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all ${value ? color : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-7' : 'right-1') : (value ? 'left-7' : 'left-1')}`} />
    </button>
  </div>
);

interface TemplateBuilderProps {
  lang: Language;
  initialTemplate?: CustomTemplate;
  onSave: (template: CustomTemplate) => void;
  onCancel: () => void;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, initialTemplate, onSave, onCancel }) => {
  const isRtl = lang === 'ar';
  const specialLinkInputRef = useRef<HTMLInputElement>(null);
  const t = (ar: string, en?: string) => {
    if (en) return isRtl ? ar : en;
    return TRANSLATIONS[ar] ? (TRANSLATIONS[ar][lang] || TRANSLATIONS[ar]['en']) : ar;
  };

  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-1.5";

  const [tmpl, setTmpl] = useState<Partial<CustomTemplate>>(initialTemplate || {
    nameAr: '', nameEn: '', descAr: '', descEn: '', isActive: true, isFeatured: false, order: 0,
    config: {
      headerType: 'classic', headerHeight: 180, avatarStyle: 'circle', avatarSize: 120, avatarOffsetY: 0, avatarOffsetX: 0,
      nameOffsetY: 0, bioOffsetY: 0, emailOffsetY: 0, websiteOffsetY: 0, contactButtonsOffsetY: 0, socialLinksOffsetY: 0,
      contentAlign: 'center', buttonStyle: 'pill', animations: 'none', spacing: 'normal', nameSize: 24, bioSize: 14,
      defaultThemeType: 'gradient', defaultThemeColor: '#3b82f6', defaultThemeGradient: THEME_GRADIENTS[0],
      showNameByDefault: true, showTitleByDefault: true, showBioByDefault: true, showButtonsByDefault: true, showSocialLinksByDefault: true, showQrCodeByDefault: true
    }
  });

  const [isUploadingSpecialImg, setIsUploadingSpecialImg] = useState(false);

  const currentSpecialLinks = tmpl.config?.defaultSpecialLinks || [];

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
        const updatedLinks = [...currentSpecialLinks, newItem];
        setTmpl({ ...tmpl, config: { ...tmpl.config!, defaultSpecialLinks: updatedLinks } });
      }
    } finally {
      setIsUploadingSpecialImg(false);
    }
  };

  const updateSpecialLink = (id: string, field: keyof SpecialLinkItem, value: string) => {
    const updated = currentSpecialLinks.map(l => l.id === id ? { ...l, [field]: value } : l);
    setTmpl({ ...tmpl, config: { ...tmpl.config!, defaultSpecialLinks: updated } });
  };

  const removeSpecialLink = (id: string) => {
    const updated = currentSpecialLinks.filter(l => l.id !== id);
    setTmpl({ ...tmpl, config: { ...tmpl.config!, defaultSpecialLinks: updated } });
  };

  const updateConfig = (key: keyof TemplateConfig | string, value: any) => {
    setTmpl(prev => ({
      ...prev,
      config: { ...prev.config!, [key]: value }
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <button onClick={onCancel} className="p-3 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm"><ChevronLeft size={24} className={isRtl ? 'rotate-180' : ''}/></button>
           <h2 className="text-2xl font-black dark:text-white uppercase">{t('باني القوالب', 'Template Builder')}</h2>
        </div>
        <button onClick={() => onSave(tmpl as CustomTemplate)} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3">
           <Save size={18} /> {t('حفظ القالب', 'Save Template')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          {/* Main sections for TemplateBuilder UI */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            <h3 className="text-xl font-black dark:text-white uppercase tracking-widest">{t('إدارة العينات الافتراضية', 'Manage Template Samples')}</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black dark:text-white leading-none mb-1">{t('إدارة العينات الافتراضية', 'Manage Template Samples')}</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('حدد الصور والروابط التي ستظهر لمستخدمي هذا القالب', 'Set default content for this template')}</p>
              </div>
              <button 
                type="button" 
                onClick={() => specialLinkInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase shadow-xl hover:scale-105 transition-all"
              >
                 <Plus size={14} />
                 {t('إضافة صورة', 'Add Image')}
              </button>
              <input type="file" ref={specialLinkInputRef} className="hidden" onChange={handleSpecialLinkUpload} accept="image/*" />
           </div>

           <div className="grid grid-cols-1 gap-5">
              {currentSpecialLinks.map((link) => (
                 <div key={link.id} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 group">
                    <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-gray-800 relative">
                       <img src={link.imageUrl} className="w-full h-full object-cover" alt="Sample" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon size={20} className="text-white" />
                       </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-blue-600 uppercase px-1">{t('رابط الوجهة', 'Link URL')}</label>
                          <input 
                            type="url" 
                            value={link.linkUrl} 
                            onChange={e => updateSpecialLink(link.id, 'linkUrl', e.target.value)} 
                            placeholder="https://..." 
                            className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className={labelTextClasses}>{t('العنوان الافتراضى (AR)', 'Default Title (AR)')}</label>
                          <input 
                            type="text" 
                            value={link.titleAr || ''} 
                            onChange={e => updateSpecialLink(link.id, 'titleAr', e.target.value)} 
                            className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                            placeholder={isRtl ? 'أدخل اسم العرض' : 'Display Title'}
                          />
                       </div>
                    </div>
                    <button onClick={() => removeSpecialLink(link.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all self-center"><Trash2 size={18} /></button>
                 </div>
              ))}
           </div>
          </div>
        </div>

        <div className="lg:col-span-5">
           {/* Preview logic here */}
           <div className="sticky top-24 border rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-black">
              <CardPreview data={{...SAMPLE_DATA[lang], templateId: 'builder-preview'} as any} lang={lang} customConfig={tmpl.config as TemplateConfig} hideSaveButton={true} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
