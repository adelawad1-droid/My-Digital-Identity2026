
import React, { useState, useRef, useEffect } from 'react';
import { VisualStyle, Language, TemplateConfig, ThemeType, PageBgStrategy, CardData } from '../types';
import { getAllVisualStyles, saveVisualStyle, deleteVisualStyle, auth, ADMIN_EMAIL, getSiteSettings } from '../services/firebase';
import { THEME_GRADIENTS, THEME_COLORS, BACKGROUND_PRESETS, PATTERN_PRESETS, SAMPLE_DATA } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from './CardPreview';
import { 
  Palette, Plus, Save, Trash2, Edit3, X, Loader2, Sparkles, 
  Sun, Moon, ImageIcon, UploadCloud, 
  Search, GlassWater, Box, LayoutTemplate, Layers, ChevronLeft, 
  ChevronRight, Monitor, Zap, Wind, Waves, Square, AlignLeft, 
  AlignRight, Columns, Maximize2, Move, RefreshCcw, Grid, Shapes,
  Tag, Ruler, Pipette, Repeat, SlidersHorizontal, Sparkle, Link as LinkIcon, Smartphone, Tablet, ArrowUpDown, ArrowLeftRight, Code2, FileCode, Wand2 as MagicIcon,
  Info, FileUp, Terminal, RotateCw, Scaling, Aperture,
  ChevronDown
} from 'lucide-react';

// --- المكونات المساعدة الخارجية ---

const RangeControl = ({ label, value, min, max, onChange, icon: Icon, unit = "px", hint }: any) => {
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
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <Icon size={14} className="text-indigo-600" />}
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
              {hint && <span className="text-[7px] text-gray-400 font-bold leading-none">{hint}</span>}
           </div>
        </div>
        <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 rounded-full px-1 py-0.5 border border-indigo-100 dark:border-indigo-800/30">
           <input 
             type="text"
             inputMode="numeric"
             dir="ltr"
             value={tempValue} 
             onChange={handleInputChange}
             className="w-12 bg-transparent text-center text-[10px] font-black text-indigo-600 outline-none border-none"
           />
           <span className="text-[7px] font-black text-indigo-400 pr-1 pointer-events-none">{unit}</span>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={isNaN(parseInt(tempValue)) ? 0 : parseInt(tempValue)} 
        onChange={(e) => onChange(parseInt(e.target.value))} 
        className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
      />
    </div>
  );
};

const ColorInput = ({ label, value, onChange, icon: Icon }: any) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} className="text-indigo-600" />}
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative w-7 h-7 rounded-lg overflow-hidden border shadow-sm shrink-0">
        <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
        <div className="w-full h-full" style={{ backgroundColor: value || '#ffffff' }} />
      </div>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[9px] font-black w-16 text-center dark:text-gray-500" placeholder="#HEX" />
    </div>
  </div>
);

const ToggleSwitch = ({ label, value, onChange, icon: Icon, color = "bg-indigo-600", isRtl }: any) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={16} className={value ? "text-indigo-600" : "text-gray-300"} />}
      <span className={`text-[10px] font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
    </div>
    <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full relative transition-all ${value ? color + ' shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-5' : 'right-0.5') : (value ? 'left-5' : 'left-0.5')}`} />
    </button>
  </div>
);

interface StyleManagerProps {
  lang: Language;
}

const StyleManager: React.FC<StyleManagerProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const svgFileInputRef = useRef<HTMLInputElement>(null);
  const mainImportInputRef = useRef<HTMLInputElement>(null);
  
  const [styles, setStyles] = useState<VisualStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStyle, setEditingStyle] = useState<Partial<VisualStyle> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [styleToDelete, setStyleToDelete] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [mouseYPercentage, setMouseYPercentage] = useState(0);

  const t = (ar: string, en: string) => isRtl ? ar : en;

  useEffect(() => {
    if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
      fetchStyles();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStyles = async () => {
    setLoading(true);
    try {
      const data = await getAllVisualStyles();
      setStyles(data);
    } catch (e) {
      console.error("Style fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (initialSvg?: string) => {
    setEditingStyle({
      nameAr: t('نمط ترويسة مبتكر', 'Innovative Header Style'),
      nameEn: 'Innovative Header Style',
      isActive: true,
      config: {
        headerType: initialSvg ? 'custom-asset' : 'classic',
        headerHeight: 220,
        defaultThemeType: 'gradient',
        defaultThemeColor: '#2563eb',
        defaultThemeGradient: THEME_GRADIENTS[0],
        nameColor: '#111827',
        titleColor: '#2563eb',
        linksColor: '#3b82f6',
        socialIconsColor: '#3b82f6',
        bioTextColor: 'rgba(0,0,0,0.6)',
        bioBgColor: 'rgba(0,0,0,0.03)',
        defaultIsDark: false,
        cardBgColor: '',
        pageBgColor: '',
        pageBgStrategy: 'solid',
        headerGlassy: false,
        bodyGlassy: false,
        headerOpacity: 100,
        bodyOpacity: 100,
        contentAlign: 'center',
        avatarStyle: 'circle',
        avatarSize: 120,
        headerPatternId: 'none',
        headerPatternOpacity: 100, 
        headerPatternScale: 100,   
        bodyBorderRadius: 48,
        bodyOffsetY: -60,
        headerSvgRaw: initialSvg || '',
        // @ts-ignore
        headerSvgColor: '#2563eb',
        // @ts-ignore
        headerSvgRotation: 0
      }
    });
  };

  const handleSave = async () => {
    if (!editingStyle?.nameAr || !editingStyle?.nameEn) {
      alert(isRtl ? "يرجى إدخل اسم النمط" : "Please enter style name");
      return;
    }
    setIsSaving(true);
    try {
      await saveVisualStyle(editingStyle);
      setEditingStyle(null);
      await fetchStyles();
    } catch (e) {
      alert("Error saving style");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!styleToDelete) return;
    setLoading(true);
    try {
      await deleteVisualStyle(styleToDelete);
      setStyleToDelete(null);
      await fetchStyles();
    } catch (e) {
      alert("Error deleting style");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key: keyof TemplateConfig | string, value: any) => {
    setEditingStyle(prev => ({
      ...prev,
      config: { ...prev?.config, [key]: value }
    }));
  };

  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isDirectImport: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content.includes('<svg')) {
        if (isDirectImport) {
          handleCreate(content);
        } else {
          updateConfig('headerSvgRaw', content);
          updateConfig('headerType', 'custom-asset');
        }
      } else {
        alert(isRtl ? "ملف غير صالح، يرجى رفع ملف SVG حقيقي." : "Invalid file, please upload a real SVG file.");
      }
    };
    reader.readAsText(file);
  };

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setMouseYPercentage(percentage);
  };

  const previewPageBg = editingStyle?.config?.pageBgStrategy === 'mirror-header' 
    ? (editingStyle?.config?.defaultThemeType === 'color' ? editingStyle?.config?.defaultThemeColor : (editingStyle?.config?.defaultIsDark ? '#050507' : '#f8fafc'))
    : (editingStyle?.config?.pageBgColor || (editingStyle?.config?.defaultIsDark ? '#050507' : '#f8fafc'));

  if (loading && !editingStyle && !styleToDelete) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('جاري تحميل الأنماط...', 'Loading Styles...')}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-32">
      {!editingStyle ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <LayoutTemplate size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black dark:text-white leading-none mb-1">{t('مختبر هندسة الأصول الرقمية', 'Asset Geometry Lab')}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('ابتكر ترويسات هندسية بصرية وتفاعلية كاملة', 'Create interactive and geometric header assets')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input type="file" ref={mainImportInputRef} className="hidden" accept=".svg" onChange={(e) => handleSvgFileUpload(e, true)} />
              <button 
                onClick={() => mainImportInputRef.current?.click()}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 rounded-2xl font-black text-xs uppercase shadow-sm border border-indigo-100 flex items-center gap-3 hover:bg-indigo-50 transition-all"
              >
                <FileUp size={18} /> {t('استيراد SVG سريع', 'Quick SVG Import')}
              </button>
              <button 
                onClick={() => handleCreate()}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={18} /> {t('ابتكار نمط جديد', 'Design New Style')}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Search className="text-indigo-600" size={20} />
                <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('مكتبة الأنماط المبتكرة', 'Innovative Styles Library')}</h4>
              </div>
              <div className="relative w-full md:w-80">
                <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('بحث في الأنماط...', 'Search styles...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {styles.filter(s => (isRtl ? s.nameAr : s.nameEn).toLowerCase().includes(searchTerm.toLowerCase())).map(style => (
                <div key={style.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 group hover:shadow-xl transition-all">
                  <div className="relative h-44 w-full rounded-3xl mb-6 shadow-inner border-4 border-white dark:border-gray-700 overflow-hidden bg-white dark:bg-black">
                     <div className="absolute inset-0 scale-[0.6] origin-top">
                        <CardPreview 
                          data={{ 
                            ...sampleCardData,
                            isDark: style.config.defaultIsDark || false,
                            themeType: style.config.defaultThemeType || 'gradient',
                            themeColor: style.config.defaultThemeColor || '#2563eb',
                            themeGradient: style.config.defaultThemeGradient || THEME_GRADIENTS[0],
                            backgroundImage: style.config.defaultBackgroundImage || '',
                            templateId: 'preview'
                          } as any} 
                          lang={lang} 
                          customConfig={style.config as TemplateConfig} 
                          hideSaveButton={true} 
                        />
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Style Name</p>
                        <h4 className="font-black dark:text-white truncate">{isRtl ? style.nameAr : style.nameEn}</h4>
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => setEditingStyle(style)}
                         className="flex-1 py-3 bg-white dark:bg-gray-900 text-blue-600 rounded-2xl font-black text-[10px] uppercase border shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                       >
                         <Edit3 size={14} /> {t('تعديل النمط', 'Edit Design')}
                       </button>
                       <button 
                         onClick={() => setStyleToDelete(style.id)}
                         className="p-3 bg-white dark:bg-gray-900 text-red-500 rounded-2xl border shadow-sm hover:bg-red-50 hover:text-red-500 hover:text-white transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-[1550px] mx-auto space-y-8 animate-fade-in">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border">
              <div className="flex items-center gap-4">
                 <button onClick={() => setEditingStyle(null)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20}/></button>
                 <div>
                    <h2 className="text-xl font-black dark:text-white leading-none mb-1">{t('مختبر الهندسة البصرية المتقدم', 'Advanced Visual DNA Lab')}</h2>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{editingStyle.id || 'Live Workspace'}</p>
                    </div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                 >
                   {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} {t('اعتماد وحفظ النمط', 'Authorize & Save DNA')}
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-8 h-auto pr-1">
                 
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b dark:border-gray-800 pb-6 mb-6">
                       <Tag className="text-indigo-600" size={24}/>
                       <h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('البيانات التعريفية للنمط', 'Style Metadata')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">{t('الاسم (AR)', 'Name (AR)')}</label><input type="text" value={editingStyle.nameAr} onChange={e => setEditingStyle({...editingStyle, nameAr: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                       <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">{t('الاسم (EN)', 'Name (EN)')}</label><input type="text" value={editingStyle.nameEn} onChange={e => setEditingStyle({...editingStyle, nameEn: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Shapes className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('محرك هندسة الترويسات', 'Structural Shape Engine')}</h3></div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                         {[
                           {id: 'classic', icon: LayoutTemplate, label: 'كلاسيك'},
                           {id: 'overlay', icon: Layers, label: 'متداخل'},
                           {id: 'side-left', icon: ChevronLeft, label: 'جانبي يسار'},
                           {id: 'side-right', icon: ChevronRight, label: 'جانبي يمين'},
                           {id: 'curved', icon: Wind, label: 'منحني'},
                           {id: 'wave', icon: Waves, label: 'موجي'},
                           {id: 'diagonal', icon: RefreshCcw, label: 'قطري'},
                           {id: 'custom-asset', icon: Code2, label: 'SVG مخصص', pulse: true},
                           {id: 'floating', icon: Square, label: 'عائم'},
                           {id: 'glass-card', icon: GlassWater, label: 'زجاجي'},
                           {id: 'modern-split', icon: Columns, label: 'حديث'}
                         ].map(item => (
                           <button 
                            key={item.id} 
                            onClick={() => updateConfig('headerType', item.id)} 
                            className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative ${editingStyle.config?.headerType === item.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                           >
                             {item.pulse && !editingStyle.config?.headerSvgRaw && (
                               <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                             )}
                             <item.icon size={20} /> 
                             <span className="text-[7px] font-black uppercase text-center leading-tight">{t(item.label, item.id)}</span>
                           </button>
                         ))}
                    </div>

                    {editingStyle.config?.headerType === 'custom-asset' && (
                       <div className="space-y-6 animate-fade-in">
                          <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl space-y-8 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                                <Aperture size={180} />
                             </div>
                             
                             <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                   <MagicIcon size={24} />
                                </div>
                                <div>
                                   <h4 className="text-xl font-black uppercase tracking-tight">{t('محرر الأصول البصري الذكي', 'Smart Visual Asset Editor')}</h4>
                                   <p className="text-[9px] font-bold text-indigo-100 uppercase tracking-widest">{t('تحكم في الألوان والأبعاد بدون كود', 'Control colors & dimensions without code')}</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <div className="bg-white/10 backdrop-blur-lg p-4 rounded-3xl border border-white/10">
                                   <ColorInput 
                                      label={t('لون هندسة الـ SVG', 'SVG Primary Color')} 
                                      value={editingStyle.config?.headerSvgColor || '#2563eb'} 
                                      onChange={(v: string) => updateConfig('headerSvgColor', v)} 
                                      icon={Pipette}
                                   />
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg p-4 rounded-3xl border border-white/10">
                                   <RangeControl 
                                      label={t('توسعة الحجم (Scale)', 'Asset Scale')} 
                                      min={10} max={400} unit="%" 
                                      value={editingStyle.config?.headerPatternScale ?? 100} 
                                      onChange={(v: number) => updateConfig('headerPatternScale', v)} 
                                      icon={Scaling} 
                                   />
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg p-4 rounded-3xl border border-white/10">
                                   <RangeControl 
                                      label={t('درجة التدوير (Rotate)', 'Asset Rotation')} 
                                      min={0} max={360} unit="°" 
                                      value={editingStyle.config?.headerSvgRotation ?? 0} 
                                      onChange={(v: number) => updateConfig('headerSvgRotation', v)} 
                                      icon={RotateCw} 
                                   />
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg p-4 rounded-3xl border border-white/10">
                                   <RangeControl 
                                      label={t('درجة شفافية الـ SVG', 'Asset Opacity')} 
                                      min={0} max={100} unit="%" 
                                      value={editingStyle.config?.headerPatternOpacity ?? 100} 
                                      onChange={(v: number) => updateConfig('headerPatternOpacity', v)} 
                                      icon={Sun} 
                                   />
                                </div>
                             </div>

                             <div className="flex gap-2 relative z-10">
                                <input type="file" ref={svgFileInputRef} onChange={(e) => handleSvgFileUpload(e, false)} accept=".svg" className="hidden" />
                                <button onClick={() => svgFileInputRef.current?.click()} className="flex-1 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-50 transition-all">
                                   <UploadCloud size={16} /> {t('استيراد ملف جديد', 'Import New Asset')}
                                </button>
                             </div>
                          </div>

                          <details className="group bg-gray-50 dark:bg-gray-800/50 rounded-2xl border overflow-hidden">
                             <summary className="p-4 cursor-pointer flex items-center justify-between list-none">
                                <div className="flex items-center gap-2">
                                   <FileCode size={16} className="text-indigo-600" />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('عرض كود XML الهيكلي', 'Show Structural XML Code')}</span>
                                </div>
                                <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
                             </summary>
                             <div className="p-4 pt-0">
                                <textarea 
                                  value={editingStyle.config?.headerSvgRaw || ''} 
                                  onChange={e => updateConfig('headerSvgRaw', e.target.value)}
                                  placeholder="<svg ...> ... </svg>"
                                  className="w-full h-44 p-5 rounded-2xl bg-black/80 text-emerald-400 font-mono text-[10px] border-none outline-none focus:ring-0 transition-all shadow-inner resize-none"
                                />
                             </div>
                          </details>
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <RangeControl label={t('ارتفاع الترويسة الكلي', 'Header Depth')} min={40} max={1000} value={editingStyle.config?.headerHeight || 180} onChange={(v: number) => updateConfig('headerHeight', v)} icon={Maximize2} />
                      <ToggleSwitch label={t('تأثير زجاجي (Glassy)', 'Glassy Header')} value={editingStyle.config?.headerGlassy} onChange={(v: boolean) => updateConfig('headerGlassy', v)} icon={GlassWater} isRtl={isRtl} />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Box className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('هندسة إطار البيانات', 'Body Geometry & Effects')}</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <ToggleSwitch label={t('تأثير زجاجي فاخر للجسم', 'Glassmorphism Body')} value={editingStyle.config?.bodyGlassy} onChange={(v: boolean) => updateConfig('bodyGlassy', v)} icon={GlassWater} isRtl={isRtl} />
                       <RangeControl label={t('درجة شفافية الجسم', 'Body Transparency')} min={0} max={100} unit="%" value={editingStyle.config?.bodyOpacity ?? 100} onChange={(v: number) => updateConfig('bodyOpacity', v)} icon={Sun} />
                       <RangeControl label={t('إزاحة منطقة البيانات', 'Overlap Y Offset')} min={-2000} max={2000} value={editingStyle.config?.bodyOffsetY || 0} onChange={(v: number) => updateConfig('bodyOffsetY', v)} icon={Move} />
                       <RangeControl label={t('انحناء زوايا الجسم', 'Border Radius')} min={0} max={120} value={editingStyle.config?.bodyBorderRadius ?? 48} onChange={(v: number) => updateConfig('bodyBorderRadius', v)} icon={Ruler} />
                    </div>
                 </div>
              </div>

              {/* Live Preview Sidebar */}
              <div className="lg:col-span-5 space-y-6 flex flex-col items-center">
                 <div className="w-full flex items-center justify-between px-4 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border sticky top-24 z-50">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('معاينة حية للمختبر', 'Lab Live Reality')}</span>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                       <button type="button" onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}><Smartphone size={16}/></button>
                       <button type="button" onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-lg transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}><Tablet size={16}/></button>
                       <button type="button" onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}><Monitor size={18}/></button>
                    </div>
                 </div>

                 <div 
                   onMouseMove={handlePreviewMouseMove}
                   onMouseLeave={() => setMouseYPercentage(0)}
                   className={`transition-all duration-500 origin-top rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden relative border-[12px] border-gray-950 dark:border-gray-900 bg-white dark:bg-black cursor-ns-resize isolate sticky top-44`} 
                   style={{ 
                     isolation: 'isolate', 
                     width: previewDevice === 'mobile' ? '360px' : (previewDevice === 'tablet' ? '480px' : '100%'),
                     aspectRatio: previewDevice === 'desktop' ? '16/9' : '9/18.8',
                     transform: previewDevice === 'desktop' ? 'scale(0.8)' : 'none',
                     backgroundColor: previewPageBg
                   }}>
                    
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-950 dark:bg-gray-900 rounded-full z-[100] border border-white/5 shadow-inner"></div>

                    <div className="no-scrollbar h-full scroll-smooth relative z-0" 
                         style={{ 
                           borderRadius: '3rem', 
                           overflow: 'hidden',
                           clipPath: 'inset(0 round 3rem)' 
                         }}>
                       <div 
                         style={{ 
                            maxWidth: '100%',
                            marginRight: 'auto',
                            marginLeft: 'auto',
                            position: 'relative',
                            zIndex: 10,
                            transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
                            transform: `translateY(-${mouseYPercentage * 0.7}%)`
                         }}
                       >
                         <CardPreview 
                           data={{
                              ...sampleCardData,
                              name: isRtl ? 'هندسة بصرية متقدمة' : 'Advanced Reality DNA',
                              title: isRtl ? 'مهندس برمجيات أول - مطور واجهات' : 'Senior Front-end Architect',
                              isDark: editingStyle.config?.defaultIsDark,
                              themeType: editingStyle.config?.defaultThemeType, 
                              themeColor: editingStyle.config?.defaultThemeColor, 
                              themeGradient: editingStyle.config?.defaultThemeGradient,
                              showBodyFeature: editingStyle.config?.showBodyFeatureByDefault,
                              templateId: 'admin-preview'
                           } as any} 
                           lang={lang} 
                           customConfig={editingStyle.config as TemplateConfig} 
                           hideSaveButton={true} 
                           isFullFrame={false} 
                         />
                       </div>
                    </div>
                 </div>
                 
                 <div className="w-full p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 text-center sticky top-[80vh]">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">{t('تلميح من مختبر الأصول', 'Asset Lab Intelligence')}</p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                       {isRtl ? "استخدم محرر الأصول البصري في الأعلى للتحكم في حجم ولون الـ SVG. سيتم حقن الألوان تلقائياً في التصميم." : "Use the Visual Asset Editor above to control SVG scale and color. Colors are automatically injected into the DNA."}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {styleToDelete && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-red-100 dark:border-red-900/20">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
              <h3 className="text-2xl font-black dark:text-white mb-4">{t('تدمير النمط؟', 'Destroy Style?')}</h3>
              <p className="text-sm font-bold text-gray-500 mb-8">{t('هل أنت متأكد من حذف هذا النمط الهندسي من المختبر؟ لا يمكن التراجع.', 'Are you sure you want to delete this geometry from the lab? No undo.')}</p>
              <div className="flex flex-col gap-3">
                 <button onClick={handleDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">نعم، تدمير</button>
                 <button onClick={() => setStyleToDelete(null)} className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl font-black text-[10px] uppercase">إلغاء</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StyleManager;
