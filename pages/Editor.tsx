
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
  Type, Briefcase, ShieldCheck, Crown, ShoppingCart, Globe2, Star, ChevronRight, ChevronLeft,
  Quote, PhoneCall
} from 'lucide-react';
import CardPreview from '../components/CardPreview';
import SocialIcon, { BRAND_COLORS } from '../components/SocialIcon';
import AuthModal from '../components/AuthModal';
import { BACKGROUND_PRESETS, AVATAR_PRESETS, SAMPLE_DATA, SOCIAL_PLATFORMS, THEME_COLORS, THEME_GRADIENTS, TRANSLATIONS } from '../constants';
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

type EditorTab = 'identity' | 'contact_numbers' | 'social' | 'links' | 'membership' | 'event' | 'design';

const Editor: React.FC<EditorProps> = ({ lang, onSave, onCancel, initialData, isAdminEdit, templates, forcedTemplateId }) => {
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const t = (key: string, fallback?: string) => {
    if (fallback && !TRANSLATIONS[key]) return isRtl ? key : fallback;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const originalIdRef = useRef<string | null>(initialData?.id || null);

  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'premium' | 'admin'>('user');
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [isSlugVerified, setIsSlugVerified] = useState(true);
  const [showValidationError, setShowValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [uploadConfig, setUploadConfig] = useState({ storageType: 'database' as const, uploadUrl: '' });
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });

  // تحريك المعاينة
  const [mouseYPercentage, setMouseYPercentage] = useState(0);

  const tabs: {id: EditorTab, label: string, icon: any, color: string}[] = [
    { id: 'identity', label: t('الهوية', 'Identity'), icon: UserIcon, color: 'text-blue-600' },
    { id: 'contact_numbers', label: t('contactNumbers'), icon: PhoneCall, color: 'text-indigo-600' },
    { id: 'social', label: t('التواصل', 'Social'), icon: Share2, color: 'text-emerald-600' },
    { id: 'links', label: t('الروابط', 'Links'), icon: LinkIcon, color: 'text-purple-600' },
    { id: 'membership', label: t('العضوية', 'Membership'), icon: ShieldCheck, color: 'text-amber-600' },
    { id: 'event', label: t('المناسبة', 'Event'), icon: Calendar, color: 'text-rose-600' },
    { id: 'design', label: t('المظهر', 'Design'), icon: Palette, color: 'text-indigo-600' },
  ];

  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

  useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings) setUploadConfig({ storageType: (settings.imageStorageType as any) || 'database', uploadUrl: settings.serverUploadUrl || '' });
    });
    if (auth.currentUser) {
      getUserProfile(auth.currentUser.uid).then(profile => { if (profile) setUserRole(profile.role); });
    }
  }, []);

  const isPremium = userRole === 'premium' || userRole === 'admin' || isAdminEdit;

  const [formData, setFormData] = useState<CardData>(() => {
    const targetTemplateId = initialData?.templateId || forcedTemplateId || templates[0]?.id || 'classic';
    const selectedTmpl = templates.find(t => t.id === targetTemplateId);
    if (initialData) return { ...initialData, emails: initialData.emails || [], websites: initialData.websites || [], specialLinks: initialData.specialLinks || [] };
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

  const VisibilityToggle = ({ field, label }: { field: keyof CardData, label: string }) => {
    const isVisible = formData[field] !== false;
    return (
      <button type="button" onClick={() => handleChange(field, !isVisible)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${isVisible ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-800'}`}>
        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        <span className="text-[9px] font-black uppercase">{label || (isVisible ? t('إظهار', 'Show') : t('إخفاء', 'Hide'))}</span>
      </button>
    );
  };

  const ColorPickerUI = ({ label, field, icon: Icon }: { label: string, field: keyof CardData, icon?: any }) => (
    <div className="bg-white dark:bg-gray-950 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">{Icon && <Icon size={16} className="text-gray-400" />}<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span></div>
      <div className="flex items-center gap-3">
         <div className="relative w-8 h-8 rounded-xl overflow-hidden border shadow-sm">
            <input type="color" value={(formData[field] as string) || '#3b82f6'} onChange={(v) => handleChange(field, v.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
            <div className="w-full h-full" style={{ backgroundColor: (formData[field] as string) || '#3b82f6' }} />
         </div>
         <input type="text" value={((formData[field] as string) || '').toUpperCase()} onChange={(e) => handleChange(field, e.target.value)} className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-2 py-1.5 text-[9px] font-black text-blue-600 w-16 uppercase text-center outline-none" placeholder="#HEX" />
      </div>
    </div>
  );

  const inputClasses = "w-full px-5 py-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all font-bold text-sm shadow-none";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-2";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050507] pb-40 md:pb-56">
      {/* نافذة المعاينة في الجوال المحسنة */}
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
                      className="absolute inset-0 z-10 transition-transform duration-500 ease-out origin-top"
                      style={{ transform: `translateY(-${mouseYPercentage * 0.7}%)` }}
                    >
                        <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} isFullFrame={true} />
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-20 pointer-events-none"></div>
                </div>
            </div>
        </div>
      )}

      {showAuthWarning && <AuthModal lang={lang} onClose={() => setShowAuthWarning(false)} onSuccess={() => { setShowAuthWarning(false); window.location.reload(); }} />}

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:flex w-64 flex-col gap-2 shrink-0 sticky top-24 h-fit">
           <div className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
              {tabs.map((tab) => (
                <button 
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
           </div>
        </aside>

        <main className="flex-1 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    {(() => { const Icon = tabs[currentIndex].icon; return <Icon size={150} />; })()}
                </div>
                
                <div className="p-6 md:p-10 flex-1">
                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3.5 rounded-[1.2rem] bg-slate-50 dark:bg-gray-800 ${tabs[currentIndex].color} shadow-sm`}>
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

                    <div className="min-h-[350px]">
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
                            </div>

                            <div className="space-y-2">
                               <div className="flex items-center justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('bio')}</label><VisibilityToggle field="showBio" label="" /></div>
                               <textarea rows={3} value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className={inputClasses + " resize-none"} placeholder="Write something inspiring about yourself..." />
                            </div>

                            <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                               <div className="flex items-center gap-3"><Camera className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('صورتك الشخصية', 'Profile Image')}</h3></div>
                               <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50/50 dark:bg-gray-950 rounded-[2rem] border border-dashed border-gray-100 dark:border-gray-800">
                                  <div className="w-24 h-24 rounded-[1.5rem] bg-white dark:bg-gray-900 shadow-xl border-4 border-white dark:border-gray-700 overflow-hidden flex items-center justify-center relative shrink-0">
                                     {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={32} className="text-gray-200" />}
                                     {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                                  </div>
                                  <div className="flex-1 space-y-4 w-full">
                                     <input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setIsUploading(true); try { const url = await uploadImageToCloud(f, 'avatar', uploadConfig as any); if (url) handleChange('profileImage', url); } finally { setIsUploading(false); } }} className="hidden" accept="image/*" />
                                     <button type="button" onClick={() => { if (!auth.currentUser) setShowAuthWarning(true); else fileInputRef.current?.click(); }} className="w-full py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl font-black text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"><UploadCloud size={16}/> {t('رفع صورة جديدة', 'Upload Image')}</button>
                                     <div className="grid grid-cols-6 gap-2 overflow-x-auto no-scrollbar">
                                        {AVATAR_PRESETS.map((p, idx) => <button key={idx} onClick={() => handleChange('profileImage', p)} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-600 transition-all shrink-0"><img src={p} className="w-full h-full object-cover" /></button>)}
                                     </div>
                                  </div>
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
                                     <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClasses + (isRtl ? " pr-12" : " pl-12")} placeholder="+966 5..." />
                                  </div>
                               </div>
                               <div className="space-y-3">
                                  <div className="flex justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('رقم الواتساب', 'WhatsApp Number')}</label><VisibilityToggle field="showWhatsapp" label="" /></div>
                                  <div className="relative">
                                     <MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                                     <input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={inputClasses + (isRtl ? " pr-12" : " pl-12")} placeholder="9665..." />
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

                        {activeTab === 'links' && (
                          <div className="space-y-8 animate-fade-in">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('عناوين البريد الإلكتروني', 'Emails')}</label><button type="button" onClick={() => handleChange('emails', [...(formData.emails || []), ''])} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[9px] font-black uppercase"><Plus size={12}/> {t('إضافة بريد', 'Add Email')}</button></div>
                                {(formData.emails || []).map((email, idx) => (
                                   <div key={idx} className="flex gap-2">
                                      <div className="relative flex-1"><Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} /><input type="email" value={email} onChange={e => { const l = [...(formData.emails || [])]; l[idx] = e.target.value; handleChange('emails', l); }} className={inputClasses + (isRtl ? " pr-12" : " pl-12")} placeholder="mail@example.com" /></div>
                                      <button type="button" onClick={() => { const l = [...(formData.emails || [])]; l.splice(idx, 1); handleChange('emails', l); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={18}/></button>
                                   </div>
                                ))}
                             </div>

                             <div className="space-y-4 pt-6 border-t dark:border-gray-800">
                                <div className="flex items-center justify-between px-2"><label className={labelClasses + " !mb-0"}>{t('المواقع والروابط', 'Websites')}</label><button type="button" onClick={() => handleChange('websites', [...(formData.websites || []), ''])} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[9px] font-black uppercase"><Plus size={12}/> {t('إضافة رابط', 'Add Link')}</button></div>
                                {(formData.websites || []).map((web, idx) => (
                                   <div key={idx} className="flex gap-2">
                                      <div className="relative flex-1"><Globe2 className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} /><input type="text" value={web} onChange={e => { const l = [...(formData.websites || [])]; l[idx] = e.target.value; handleChange('websites', l); }} className={inputClasses + (isRtl ? " pr-12" : " pl-12")} placeholder="www.yoursite.com" /></div>
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

                        {activeTab === 'membership' && (
                          <div className="space-y-8 animate-fade-in">
                             {!isPremium && (
                                <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 text-center space-y-4">
                                   <Crown size={40} className="text-amber-500 mx-auto" />
                                   <h3 className="text-xl font-black dark:text-white uppercase">{t('ميزة مخصصة للمحترفين', 'Pro Feature')}</h3>
                                   <p className="text-xs font-bold text-gray-400 max-w-sm mx-auto leading-relaxed">{t('نظام العضوية مخصص للحسابات المميزة فقط.', 'Membership system is for Premium accounts only.')}</p>
                                   <button type="button" onClick={() => navigate(`/${lang}/custom-orders`)} className="px-8 py-3.5 bg-amber-500 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">{t('اطلب الترقية الآن', 'Upgrade')}</button>
                                </div>
                             )}
                             {isPremium && (
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
                             )}
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

                        {activeTab === 'design' && (
                          <div className="space-y-8 animate-fade-in">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-[1.5rem] border border-gray-800">
                                   <div className="flex items-center gap-3"><Moon size={18} className="text-blue-400" /><p className="font-black text-white text-[10px] uppercase">{t('الوضع الليلي', 'Dark Mode')}</p></div>
                                   <button type="button" onClick={() => handleChange('isDark', !formData.isDark)} className={`w-12 h-6 rounded-full relative transition-all ${formData.isDark ? 'bg-blue-600' : 'bg-gray-700'}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isRtl ? (formData.isDark ? 'right-6' : 'right-0.5') : (formData.isDark ? 'left-6' : 'left-0.5')}`} /></button>
                                </div>
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
                                <div className="flex items-center gap-3 px-2"><ImageIcon className="text-indigo-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('خلفية الصفحة والسمة', 'Page Background')}</h3></div>
                                <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-950 p-1.5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                                   {['color', 'gradient', 'image'].map(type => (
                                     <button type="button" key={type} onClick={() => handleChange('themeType', type as ThemeType)} className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 flex-1 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-400 border-transparent shadow-sm'}`}>
                                       {type === 'color' ? <Palette size={16}/> : type === 'gradient' ? <Sparkles size={16}/> : <ImageIcon size={16}/>}
                                       <span className="text-[8px] font-black uppercase tracking-widest">{t(type === 'color' ? 'لون' : type === 'gradient' ? 'تدرج' : 'صورة', type.toUpperCase())}</span>
                                     </button>
                                   ))}
                                </div>

                                {formData.themeType === 'color' && (
                                  <div className="space-y-6 animate-fade-in">
                                     <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                        {THEME_COLORS.map((clr, i) => (
                                          <button 
                                            key={i} 
                                            type="button"
                                            onClick={() => handleChange('themeColor', clr)} 
                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125 ${formData.themeColor === clr ? 'border-blue-600 scale-125 shadow-lg' : 'border-white dark:border-gray-700'}`} 
                                            style={{ backgroundColor: clr }} 
                                          />
                                        ))}
                                     </div>
                                     <ColorPickerUI label={t('لون مخصص', 'Custom Color')} field="themeColor" icon={Pipette} />
                                  </div>
                                )}

                                {formData.themeType === 'gradient' && <div className="grid grid-cols-6 gap-2 animate-fade-in">{THEME_GRADIENTS.map((g, i) => <button type="button" key={i} onClick={() => handleChange('themeGradient', g)} className={`h-10 rounded-xl border-2 transition-all ${formData.themeGradient === g ? 'border-blue-600 scale-105 shadow-xl' : 'border-transparent opacity-60'}`} style={{ background: g }} />)}</div>}
                                {formData.themeType === 'image' && (
                                  <div className="space-y-4 animate-fade-in">
                                     <div className="grid grid-cols-5 gap-2">{BACKGROUND_PRESETS.map((url, i) => <button type="button" key={i} onClick={() => handleChange('backgroundImage', url)} className={`aspect-video rounded-xl border-2 overflow-hidden transition-all ${formData.backgroundImage === url ? 'border-blue-600 scale-105' : 'border-transparent opacity-60'}`}><img src={url} className="w-full h-full object-cover" /></button>)}</div>
                                     <input type="file" ref={bgFileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setIsUploadingBg(true); try { const url = await uploadImageToCloud(f, 'background', uploadConfig as any); if (url) { handleChange('backgroundImage', url); handleChange('themeType', 'image'); } } finally { setIsUploadingBg(false); } }} className="hidden" accept="image/*" />
                                     <button type="button" onClick={() => { if (!auth.currentUser) setShowAuthWarning(true); else bgFileInputRef.current?.click(); }} disabled={isUploadingBg} className="w-full py-4 bg-white dark:bg-gray-950 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl font-black text-[9px] uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">{isUploadingBg ? <Loader2 className="animate-spin" /> : <UploadCloud size={16}/>} {t('رفع خلفية فنية', 'Upload BG')}</button>
                                  </div>
                                )}
                             </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Integrated Navigation Bar inside the frame */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-950/20 flex items-center justify-between">
                    <button 
                      type="button"
                      onClick={handlePrev} 
                      disabled={currentIndex === 0}
                      className={`p-4 bg-white dark:bg-gray-800 text-gray-400 rounded-2xl border dark:border-gray-700 shadow-sm transition-all ${currentIndex === 0 ? 'opacity-20' : 'hover:bg-gray-50'}`}
                    >
                      <ChevronLeft size={20} className={isRtl ? 'rotate-180' : ''} />
                    </button>

                    <div className="flex items-center gap-3">
                      <button 
                          type="button"
                          onClick={() => setShowMobilePreview(true)}
                          className="lg:hidden flex items-center gap-2 px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl font-black text-[10px] uppercase shadow-sm"
                      >
                          <Eye size={18} />
                          <span>{t('معاينة', 'Preview')}</span>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => { if (!auth.currentUser) setShowAuthWarning(true); else if (!isSlugVerified) setShowValidationError(isRtl ? "رابط البطاقة غير متوفر" : "URL is unavailable"); else onSave(formData, originalIdRef.current || undefined); }}
                        className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                          <Save size={20} />
                          <span className="hidden sm:inline">{currentIndex === tabs.length - 1 ? t('نشر البطاقة', 'Publish Card') : t('حفظ و نشر', 'Save & Publish')}</span>
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={handleNext}
                      disabled={currentIndex === tabs.length - 1}
                      className={`p-4 rounded-2xl border dark:border-gray-700 shadow-sm transition-all ${currentIndex === tabs.length - 1 ? 'bg-white dark:bg-gray-800 text-gray-400 opacity-20' : 'bg-white dark:bg-gray-800 text-blue-600 hover:border-blue-200'}`}
                    >
                      <ChevronRight size={20} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                </div>
            </div>
        </main>

        <aside className="hidden lg:block w-[380px] shrink-0">
           <div className="sticky top-24 space-y-4">
              <div 
                onMouseMove={handlePreviewMouseMove}
                onMouseLeave={() => setMouseYPercentage(0)}
                className="bg-white dark:bg-gray-900 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden relative border-[12px] border-gray-950 dark:border-gray-800 aspect-[9/19.5] w-full cursor-ns-resize"
              >
                  <div 
                    className="absolute inset-0 z-10 transition-transform duration-500 ease-out origin-top"
                    style={{ transform: `translateY(-${mouseYPercentage * 0.5}%)` }}
                  >
                    <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} isFullFrame={true} />
                  </div>
                  {/* Notch mockup */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 dark:bg-gray-900 rounded-full z-[60] border border-white/5 shadow-inner"></div>
                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full z-20"></div>
              </div>
              <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">{t('معاينة حية للمتصفح', 'Real-time Preview')}</p>
           </div>
        </aside>
      </div>

      {showValidationError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[3000] w-[80%] max-w-sm p-4 bg-red-600 text-white rounded-2xl shadow-2xl animate-shake flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-[9px] font-black uppercase tracking-widest flex-1">{showValidationError}</p>
          <button onClick={() => setShowValidationError(null)} className="p-1 hover:bg-white/20 rounded-full"><X size={14}/></button>
        </div>
      )}
    </div>
  );
};

export default Editor;
