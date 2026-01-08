
import React, { useState, useRef, useEffect } from 'react';
import { VisualStyle, Language, TemplateConfig, ThemeType, PageBgStrategy } from '../types';
import { getAllVisualStyles, saveVisualStyle, deleteVisualStyle, auth, ADMIN_EMAIL, getSiteSettings } from '../services/firebase';
import { THEME_GRADIENTS, THEME_COLORS, BACKGROUND_PRESETS, PATTERN_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from './CardPreview';
import { 
  Palette, Plus, Save, Trash2, Edit3, X, Loader2, Sparkles, 
  Sun, Moon, ImageIcon, UploadCloud, 
  Search, GlassWater, Box, LayoutTemplate, Layers, ChevronLeft, 
  ChevronRight, Monitor, Zap, Wind, Waves, Square, AlignLeft, 
  AlignRight, Columns, Maximize2, Move, RefreshCcw, Grid, Shapes,
  Tag, Ruler, Pipette, Repeat, SlidersHorizontal, Sparkle, Link as LinkIcon
} from 'lucide-react';

interface StyleManagerProps {
  lang: Language;
}

const StyleManager: React.FC<StyleManagerProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const bgInputRef = useRef<HTMLInputElement>(null);
  
  const [styles, setStyles] = useState<VisualStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStyle, setEditingStyle] = useState<Partial<VisualStyle> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [searchTerm, setSearching] = useState('');
  const [styleToDelete, setStyleToDelete] = useState<string | null>(null);
  
  const [uploadConfig, setUploadConfig] = useState({ storageType: 'database', uploadUrl: '' });

  const t = (ar: string, en: string) => isRtl ? ar : en;

  useEffect(() => {
    if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
      fetchStyles();
      getSiteSettings().then(settings => {
        if (settings) {
          setUploadConfig({
            storageType: settings.imageStorageType || 'database',
            uploadUrl: settings.serverUploadUrl || ''
          });
        }
      });
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

  const handleCreate = () => {
    setEditingStyle({
      nameAr: t('نمط مبتكر جديد', 'New Innovative Style'),
      nameEn: 'New Innovative Style',
      isActive: true,
      config: {
        headerType: 'classic',
        headerHeight: 180,
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
        headerPatternOpacity: 20,
        headerPatternScale: 100,
        bodyBorderRadius: 48,
        bodyOffsetY: 0,
        showBodyFeatureByDefault: false,
        bodyFeatureBgColor: '#3b82f6',
        bodyFeatureTextColor: '#ffffff',
        bodyFeatureHeight: 45,
        bodyFeaturePaddingX: 0,
        bodyFeatureOffsetY: 0,
        bodyFeatureBorderRadius: 16,
        bodyFeatureGlassy: false
      }
    });
  };

  const handleSave = async () => {
    if (!editingStyle?.nameAr || !editingStyle?.nameEn) {
      alert(isRtl ? "يرجى إدخال اسم النمط" : "Please enter style name");
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

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setEditingStyle(prev => ({
      ...prev,
      config: { ...prev?.config, [key]: value }
    }));
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const b = await uploadImageToCloud(file, 'background', uploadConfig as any);
      if (b) {
        updateConfig('defaultBackgroundImage', b);
      }
    } finally {
      setUploadingBg(false);
    }
  };

  const RangeControl = ({ label, value, min, max, onChange, icon: Icon, unit = "px" }: any) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <Icon size={14} className="text-indigo-600" />}
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 rounded-full px-1 py-0.5 border border-indigo-100 dark:border-indigo-800/30">
           <input 
             type="number" 
             value={value} 
             onChange={(e) => onChange(parseInt(e.target.value) || 0)}
             className="w-12 bg-transparent text-center text-[10px] font-black text-indigo-600 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
           />
           <span className="text-[8px] font-black text-indigo-400 pr-2 pointer-events-none">{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
    </div>
  );

  const ColorInput = ({ label, value, onChange }: any) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border shadow-sm">
          <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
          <div className="w-full h-full" style={{ backgroundColor: value || '#ffffff' }} />
        </div>
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-20 text-center dark:text-gray-400" placeholder="#HEX" />
      </div>
    </div>
  );

  const ToggleSwitch = ({ label, value, onChange, icon: Icon, color = "bg-indigo-600" }: any) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={16} className={value ? "text-indigo-600" : "text-gray-300"} />}
        <span className={`text-[10px] font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
      </div>
      <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all ${value ? color + ' shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-7' : 'right-1') : (value ? 'left-7' : 'left-1')}`} />
      </button>
    </div>
  );

  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all shadow-inner";

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
                <h2 className="text-2xl font-black dark:text-white leading-none mb-1">{t('مختبر الترويسات والأنماط', 'Header & Style Lab')}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('ابتكر أشكال ترويسات هندسية فريدة للمنصة', 'Create unique geometric header shapes')}</p>
              </div>
            </div>
            <button 
              onClick={handleCreate}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} /> {t('ابتكار نمط جديد', 'Design New Style')}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Search className="text-indigo-600" size={20} />
                <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('مكتبة الأنماط المبتكرة', 'Innovative Styles Library')}</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {styles.filter(s => (isRtl ? s.nameAr : s.nameEn).toLowerCase().includes(searchTerm.toLowerCase())).map(style => (
                <div key={style.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 group hover:shadow-xl transition-all">
                  <div className="relative h-44 w-full rounded-3xl mb-6 shadow-inner border-4 border-white dark:border-gray-700 overflow-hidden bg-white dark:bg-black">
                     <div className="absolute inset-0 scale-[0.6] origin-top">
                        <CardPreview 
                          data={{ 
                            name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '', isDark: style.config.defaultIsDark || false, socialLinks: [],
                            themeType: style.config.defaultThemeType || 'gradient',
                            themeColor: style.config.defaultThemeColor || '#2563eb',
                            themeGradient: style.config.defaultThemeGradient || THEME_GRADIENTS[0],
                            backgroundImage: style.config.defaultBackgroundImage || '',
                            showBodyFeature: style.config.showBodyFeatureByDefault,
                            templateId: 'preview'
                          } as any} 
                          lang={lang} 
                          customConfig={style.config as TemplateConfig} 
                          hideSaveButton={true} 
                        />
                     </div>
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
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-[1440px] mx-auto space-y-8 animate-fade-in">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setEditingStyle(null)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20}/></button>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white leading-none mb-1">{t('مختبر هندسة الأنماط المتقدم', 'Advanced Style Geometry Lab')}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{editingStyle.id || 'Draft'}</p>
                 </div>
              </div>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="px-12 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} {t('اعتماد النمط في المختبر', 'Authorize Style')}
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-8">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Shapes className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('محرك هندسة الترويسات', 'Structural Shape Engine')}</h3></div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                            className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${editingStyle.config?.headerType === item.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                           >
                             <item.icon size={20} /> 
                             <span className="text-[7px] font-black uppercase text-center leading-tight">{t(item.label, item.id)}</span>
                           </button>
                         ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <RangeControl label={t('ارتفاع الترويسة', 'Header Depth')} min={40} max={1000} value={editingStyle.config?.headerHeight || 180} onChange={(v: number) => updateConfig('headerHeight', v)} icon={Maximize2} />
                      <ToggleSwitch label={t('ترويسة زجاجية', 'Glassy Header')} value={editingStyle.config?.headerGlassy} onChange={(v: boolean) => updateConfig('headerGlassy', v)} icon={GlassWater} />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Box className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('هندسة إطار البيانات', 'Body Geometry & Effects')}</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <ToggleSwitch label={t('تأثير زجاجي فاخر للجسم', 'Glassmorphism Body')} value={editingStyle.config?.bodyGlassy} onChange={(v: boolean) => updateConfig('bodyGlassy', v)} icon={GlassWater} />
                       <RangeControl label={t('درجة شفافية الجسم', 'Body Transparency')} min={0} max={100} unit="%" value={editingStyle.config?.bodyOpacity ?? 100} onChange={(v: number) => updateConfig('bodyOpacity', v)} icon={Sun} />
                       <RangeControl label={t('إزاحة منطقة البيانات', 'Overlap Y Offset')} min={-2000} max={2000} value={editingStyle.config?.bodyOffsetY || 0} onChange={(v: number) => updateConfig('bodyOffsetY', v)} icon={Move} />
                       <RangeControl label={t('انحناء زوايا الجسم', 'Border Radius')} min={0} max={120} value={editingStyle.config?.bodyBorderRadius ?? 48} onChange={(v: number) => updateConfig('bodyBorderRadius', v)} icon={Ruler} />
                    </div>

                    <div className="pt-10 border-t dark:border-gray-800 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Sparkle className="text-indigo-600" size={22} />
                              <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('ميزة جسم البطاقة الخاصة (DNA)', 'Special Body Feature DNA')}</h4>
                           </div>
                           <ToggleSwitch label={t('تفعيل الميزة', 'Enable')} value={editingStyle.config?.showBodyFeatureByDefault} onChange={(v: boolean) => updateConfig('showBodyFeatureByDefault', v)} color="bg-emerald-600" />
                        </div>

                        {editingStyle.config?.showBodyFeatureByDefault && (
                           <div className="grid grid-cols-1 gap-6 animate-fade-in p-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/20">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <RangeControl 
                                    label={t('توسعة الميزة جانبياً', 'Side Expansion')} 
                                    min={0} max={60} 
                                    value={editingStyle.config?.bodyFeaturePaddingX ?? 0} 
                                    onChange={(v: number) => updateConfig('bodyFeaturePaddingX', v)} 
                                    icon={SlidersHorizontal} 
                                 />
                                 <RangeControl 
                                    label={t('إزاحة الميزة رأسياً', 'Vertical Offset')} 
                                    min={-2000} max={2000} 
                                    value={editingStyle.config?.bodyFeatureOffsetY ?? 0} 
                                    onChange={(v: number) => updateConfig('bodyFeatureOffsetY', v)} 
                                    icon={Move} 
                                 />
                              </div>
                           </div>
                        )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StyleManager;
