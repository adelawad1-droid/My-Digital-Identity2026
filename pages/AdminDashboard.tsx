
import React, { useEffect, useState, useRef } from 'react';
import { 
  getAdminStats, ADMIN_EMAIL, deleteUserCard, 
  getDoc, doc, db,
  getSiteSettings, updateSiteSettings, updateUserSecurity,
  saveCustomTemplate, getAllTemplates, deleteTemplate,
  getAllTemplates as getAllCategoriesImport, getAllCategories, saveTemplateCategory, deleteTemplateCategory,
  auth, getAuthErrorMessage, toggleCardStatus, getAllVisualStyles,
  getAllUsersWithStats, updateUserSubscription, toggleUserStatus,
  getAllPricingPlans, savePricingPlan, deletePricingPlan,
  getUserProfile
} from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { Language, CardData, CustomTemplate, TemplateCategory, VisualStyle, PricingPlan } from '../types';
import { generateShareUrl } from '../utils/share';
import CardPreview from '../components/CardPreview';
import TemplateBuilder from '../components/TemplateBuilder';
import StyleManager from '../components/StyleManager';
import { AVAILABLE_FONTS, THEME_GRADIENTS, TRANSLATIONS, THEME_COLORS, SAMPLE_DATA } from '../constants';
import { 
  BarChart3, Users, Clock, Loader2,
  ShieldCheck, Trash2, Edit3, Eye, Settings, 
  Globe, Power, Save, Search, LayoutGrid,
  Lock, CheckCircle2, Image as ImageIcon, UploadCloud, X, Layout, User as UserIcon,
  Plus, Palette, ShieldAlert, Key, Star, Hash, AlertTriangle, Pin, PinOff, ArrowUpAZ,
  MoreVertical, ToggleLeft, ToggleRight, MousePointer2, TrendingUp, Filter, ListFilter, Activity, Type, FolderEdit, Check, FolderOpen, Tag, PlusCircle, Zap, HardDrive, Database, Link as LinkIcon, FolderSync, Server,
  Info, BarChart, Copy, FileJson, Code, Mail, UserCheck, Calendar, Contact2, CreditCard, RefreshCw, Crown, Type as FontIcon, Shield, Activity as AnalyticsIcon, CreditCard as CardIcon, CreditCard as PaymentIcon, Webhook, ExternalLink, Activity as LiveIcon, Beaker as TestIcon, Link2, PhoneCall, Cloud, MonitorDot
} from 'lucide-react';

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded-lg overflow-hidden border shadow-sm">
        <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
        <div className="w-full h-full" style={{ backgroundColor: value || '#ffffff' }} />
      </div>
      <input type="text" value={(value || '').toUpperCase()} onChange={e => onChange(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-20 text-center dark:text-gray-400" placeholder="#HEX" />
    </div>
  </div>
);

interface AdminDashboardProps {
  lang: Language;
  onEditCard: (card: CardData) => void;
  onDeleteRequest: (cardId: string, ownerId: string) => void; 
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onEditCard, onDeleteRequest }) => {
  const isRtl = lang === 'ar';
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'templates' | 'styles' | 'categories' | 'plans' | 'payment' | 'settings' | 'security' | 'builder'>('stats');
  const [stats, setStats] = useState<{ totalCards: number; activeCards: number; totalViews: number; recentCards: any[] } | null>(null);
  const [usersStats, setUsersStats] = useState<any[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | undefined>(undefined);
  
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<{id: string, ownerId: string} | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [subEditUser, setSubEditUser] = useState<any | null>(null);
  
  const [categoryData, setCategoryData] = useState({ id: '', nameAr: '', nameEn: '', order: 0, isActive: true });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  
  const [planData, setPlanData] = useState<Partial<PricingPlan>>({ 
    id: '', nameAr: '', nameEn: '', price: '0', originalPrice: '', billingCycleAr: 'سنوياً', billingCycleEn: 'Yearly', 
    durationMonths: 12, 
    featuresAr: [], featuresEn: [], isPopular: false, isActive: true, order: 0, iconName: 'Shield',
    buttonTextAr: 'اشترك الآن', buttonTextEn: 'Subscribe Now', stripeLink: ''
  });
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isPlanSubmitting, setIsPlanSubmitting] = useState(false);
  
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingSub, setIsSavingSub] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  const [settings, setSettings] = useState({ 
    siteNameAr: '', 
    siteNameEn: '', 
    siteLogo: '', 
    siteIcon: '',
    siteContactEmail: 'info@nextid.my',
    siteContactPhone: '966560817601',
    maintenanceMode: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Cairo',
    imageStorageType: 'firebase' as 'database' | 'server' | 'firebase', 
    serverUploadUrl: '',
    analyticsCode: '',
    stripeLiveMode: false,
    stripeTestPublishableKey: '',
    stripeTestSecretKey: '',
    stripeLivePublishableKey: '',
    stripeLiveSecretKey: '',
    stripeWebhookSecret: ''
  });

  const fetchData = async (quiet = false) => {
    if (!auth.currentUser) return;
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    
    setPermissionError(false);
    try {
      const [sData, uData, stData, tData, cData, vsData, pData] = await Promise.all([
        getAdminStats().catch((err) => { 
          if (err.code === 'permission-denied') setPermissionError(true);
          return { totalCards: 0, activeCards: 0, totalViews: 0, recentCards: [] };
        }),
        getAllUsersWithStats().catch((err) => {
          if (err.code === 'permission-denied') setPermissionError(true);
          return [];
        }),
        getSiteSettings().catch(() => null),
        getAllTemplates().catch(() => []),
        getAllCategories().catch(() => []),
        getAllVisualStyles().catch(() => []),
        getAllPricingPlans().catch(() => [])
      ]);
      setStats(sData as any);
      setUsersStats(uData);
      if (stData) {
        setSettings({
          siteNameAr: stData.siteNameAr || '',
          siteNameEn: stData.siteNameEn || '',
          siteLogo: stData.siteLogo || '',
          siteIcon: stData.siteIcon || '',
          siteContactEmail: stData.siteContactEmail || 'info@nextid.my',
          siteContactPhone: stData.siteContactPhone || '966560817601',
          maintenanceMode: stData.maintenanceMode || false,
          primaryColor: stData.primaryColor || '#3b82f6',
          secondaryColor: stData.secondaryColor || '#8b5cf6',
          fontFamily: stData.fontFamily || 'Cairo',
          imageStorageType: stData.imageStorageType || 'firebase',
          serverUploadUrl: stData.serverUploadUrl || '',
          analyticsCode: stData.analyticsCode || '',
          stripeLiveMode: stData.stripeLiveMode || false,
          stripeTestPublishableKey: stData.stripeTestPublishableKey || '',
          stripeTestSecretKey: stData.stripeTestSecretKey || '',
          stripeLivePublishableKey: stData.stripeLivePublishableKey || '',
          stripeLiveSecretKey: stData.stripeLiveSecretKey || '',
          stripeWebhookSecret: stData.stripeWebhookSecret || ''
        });
      }
      setCustomTemplates(tData as CustomTemplate[]);
      setCategories(cData as TemplateCategory[]);
      setVisualStyles(vsData as VisualStyle[]);
      setPricingPlans(pData);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      await deletePricingPlan(planToDelete);
      setPlanToDelete(null);
      await fetchData(true);
    } catch (e: any) { 
      alert(isRtl ? `فشل حذف الباقة: ${e.message}` : `Error deleting plan: ${e.message}`); 
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planData.nameAr || !planData.nameEn) {
      alert(isRtl ? "يرجى إدخال اسم الباقة" : "Please enter plan name");
      return;
    }
    
    setIsPlanSubmitting(true);
    try {
      await savePricingPlan({ 
        ...planData, 
        id: editingPlanId || undefined
      });
      alert(isRtl ? "تم حفظ الباقة بنجاح" : "Plan saved successfully");
      setEditingPlanId(null);
      setPlanData({ 
        id: '', nameAr: '', nameEn: '', price: '0', originalPrice: '', billingCycleAr: 'سنوياً', billingCycleEn: 'Yearly', 
        durationMonths: 12,
        featuresAr: [], featuresEn: [], isPopular: false, isActive: true, order: 0, iconName: 'Shield',
        buttonTextAr: 'اشترك الآن', buttonTextEn: 'Subscribe Now', stripeLink: ''
      });
      await fetchData(true);
    } catch (e: any) { 
      alert(isRtl ? `حدث خطأ أثناء الحفظ: ${e.message}` : `Error during save: ${e.message}`); 
    } finally { 
      setIsPlanSubmitting(false); 
    }
  };

  const handleTogglePlanActive = async (plan: PricingPlan) => {
    try { await savePricingPlan({ ...plan, isActive: !plan.isActive }); fetchData(true); } catch (e) { alert("Failed to toggle status"); }
  };

  const handleToggleUserStatus = async (user: any) => {
    const newStatus = user.isActive === false;
    try {
      await toggleUserStatus(user.uid, newStatus);
      await fetchData(true);
    } catch (e) {
      alert(isRtl ? "فشل تحديث حالة المستخدم" : "Failed to update user status");
    }
  };

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');

  const t = (arOrKey: string, en?: string) => {
    if (en) return isRtl ? arOrKey : en;
    return TRANSLATIONS[arOrKey] ? (TRANSLATIONS[arOrKey][lang] || TRANSLATIONS[arOrKey]['en']) : arOrKey;
  };

  const TabButton = ({ id, label, icon: Icon, activeColor }: any) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === id ? `${activeColor} text-white shadow-lg` : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-1.5";
  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all shadow-inner";

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try { await updateSiteSettings(settings); alert(isRtl ? "تم الحفظ بنجاح" : "Settings saved"); } 
    catch (e) { alert("Error saving settings"); } 
    finally { setSavingSettings(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'siteLogo' | 'siteIcon') => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const url = await uploadImageToCloud(file, 'logo', { storageType: settings.imageStorageType, uploadUrl: settings.serverUploadUrl });
      if (url) setSettings(prev => ({ ...prev, [field]: url }));
    } catch (e) { alert("Upload failed"); }
  };

  if (loading && !planToDelete && !subEditUser) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('جاري التحميل...', 'Loading...')}</p>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 space-y-10 animate-fade-in-up">
      {activeTab !== 'builder' && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><ShieldCheck size={20} /></div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{t('نظام الإدارة', 'Admin System')}</span>
            </div>
            <div className="flex items-center gap-4">
               <h1 className="text-4xl md:text-5xl font-black dark:text-white">{t('لوحة التحكم', 'Dashboard')}</h1>
               <button onClick={() => fetchData(true)} disabled={isRefreshing} className={`p-3 bg-white dark:bg-gray-900 border rounded-2xl text-blue-600 hover:bg-blue-50 transition-all shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                  <RefreshCw size={20} />
               </button>
            </div>
          </div>
          <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
            <TabButton id="stats" label={t('stats', 'Stats')} icon={BarChart3} activeColor="bg-blue-600" />
            <TabButton id="users" label={t('المسجلين', 'Users')} icon={Users} activeColor="bg-purple-600" />
            <TabButton id="plans" label={t('الباقات', 'Plans')} icon={CardIcon} activeColor="bg-indigo-600" />
            <TabButton id="payment" label={t('payment', 'Payments')} icon={PaymentIcon} activeColor="bg-emerald-600" />
            <TabButton id="templates" label={t('templates', 'Templates')} icon={Layout} activeColor="bg-rose-600" />
            <TabButton id="styles" label={t('styles', 'Styles')} icon={Palette} activeColor="bg-amber-600" />
            <TabButton id="categories" label={t('الأقسام', 'Categories')} icon={FolderEdit} activeColor="bg-cyan-600" />
            <TabButton id="settings" label={t('settings', 'Settings')} icon={Settings} activeColor="bg-slate-700" />
            <TabButton id="security" label={t('security', 'Security')} icon={Lock} activeColor="bg-red-600" />
          </div>
        </div>
      )}

      {permissionError && (
        <div className="p-10 bg-red-50 dark:bg-red-900/10 rounded-[3rem] border border-red-100 dark:border-red-900/30 text-center space-y-4 animate-shake">
           <AlertTriangle size={48} className="text-red-500 mx-auto" />
           <h3 className="text-2xl font-black text-red-600 uppercase">خطأ في الصلاحيات</h3>
           <p className="text-gray-500 dark:text-gray-400 font-bold max-w-md mx-auto leading-relaxed">
             لا تملك صلاحية الوصول إلى هذه البيانات. تأكد من أن بريدك الإلكتروني مسجل كمسؤول في قاعدة البيانات أو اتصل بالمطور الرئيسي.
           </p>
           <button onClick={() => fetchData()} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:brightness-110 transition-all">إعادة المحاولة</button>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'stats' && !permissionError && (
           <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي البطاقات', 'Total Cards')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalCards || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"><TrendingUp size={24} /></div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"><Eye size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المشاهدات', 'Total Views')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalViews || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المسجلين', 'Registered Users')}</p><h4 className="text-2xl font-black dark:text-white">{usersStats.length}</h4></div>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3"><Activity className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('إدارة كافة البطاقات', 'Cards Manager')}</h3></div>
                  <div className="relative w-full md:w-80">
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('ابحث في البطاقات...', 'Search cards...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                         <tr>
                            <td className="px-8 py-5">{t('البطاقة', 'Card')}</td>
                            <td className="px-8 py-5 text-center">{t('المشاهدات', 'Views')}</td>
                            <td className="px-8 py-5 text-center">{t('الحالة', 'Status')}</td>
                            <td className="px-8 py-5">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {(stats?.recentCards || []).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).map((card) => (
                            <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                        {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <UserIcon className="text-gray-300" size={18}/>}
                                     </div>
                                     <div>
                                        <p className="font-black dark:text-white leading-none">{card.name || '---'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{card.ownerEmail}</p>
                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">ID: {card.id}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-center font-black text-indigo-600"><div className="flex items-center justify-center gap-1"><Eye size={12}/>{card.viewCount || 0}</div></td>
                               <td className="px-8 py-6 text-center">
                                  <div className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase ${card.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                     {card.isActive !== false ? t('نشط', 'Active') : t('معطل', 'Disabled')}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex gap-2">
                                     <a 
                                        href={generateShareUrl(card)} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        title={t('عرض البطاقة', 'View Card')}
                                     >
                                        <Eye size={18}/>
                                     </a>
                                     <button 
                                        onClick={async () => {
                                          const newStatus = card.isActive === false;
                                          await toggleCardStatus(card.id, card.ownerId, newStatus);
                                          fetchData(true);
                                        }} 
                                        className={`p-2 rounded-xl transition-all shadow-sm ${card.isActive !== false ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white' : 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white'}`}
                                        title={card.isActive !== false ? t('إيقاف البطاقة', 'Disable Card') : t('تنشيط البطاقة', 'Enable Card')}
                                     >
                                        <Power size={18}/>
                                     </button>
                                     <button 
                                        onClick={() => onEditCard(card)} 
                                        className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title={t('تعديل', 'Edit')}
                                     >
                                        <Edit3 size={18}/>
                                     </button>
                                     <button 
                                        onClick={() => setCardToDelete({id: card.id, ownerId: card.ownerId})} 
                                        className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title={t('حذف', 'Delete')}
                                     >
                                        <Trash2 size={18}/>
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
           </div>
        )}

        {activeTab === 'users' && !permissionError && (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3"><Users className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('قائمة المستخدمين', 'User Registry')}</h3></div>
                  <div className="relative w-full md:w-80">
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                    <input type="text" value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} placeholder={t('ابحث عن مستخدم...', 'Search users...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                         <tr>
                            <td className="px-8 py-5">{t('المستخدم', 'User')}</td>
                            <td className="px-8 py-5">{t('الرتبة / الباقة', 'Role / Plan')}</td>
                            <td className="px-8 py-5">{t('الحالة', 'Status')}</td>
                            <td className="px-8 py-5 text-center">{t('الإحصائيات', 'Stats')}</td>
                            <td className="px-8 py-5">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {usersStats.filter(u => u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())).map((user) => (
                            <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center"><UserIcon size={20}/></div><div><p className="font-black dark:text-white leading-none">{user.email}</p><p className="text-[9px] font-bold text-gray-400 uppercase mt-1">ID: {user.uid.substring(0, 8)}...</p></div></div></td>
                               <td className="px-8 py-6">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : user.role === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                     {user.role === 'admin' ? <ShieldCheck size={10}/> : user.role === 'premium' ? <Crown size={10}/> : <UserIcon size={10}/>}
                                     {user.planId ? pricingPlans.find(p => p.id === user.planId)?.[isRtl ? 'nameAr' : 'nameEn'] || user.role : user.role}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase ${user.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                     {user.isActive !== false ? <CheckCircle2 size={10}/> : <AlertTriangle size={10}/>}
                                     {user.isActive !== false ? t('نشط', 'Active') : t('محظور', 'Banned')}
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-center">
                                  <div className="flex flex-col items-center">
                                     <span className="font-black text-gray-900 dark:text-white text-xs">{user.cardCount || 0} {t('كروت', 'Cards')}</span>
                                     <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold"><Eye size={10}/>{user.totalViews || 0}</div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <button 
                                        onClick={() => setSubEditUser(user)} 
                                        className="p-2.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title={t('تعديل الحساب والباقة', 'Edit Account & Plan')}
                                     >
                                        <Edit3 size={18}/>
                                     </button>
                                     <button 
                                        onClick={() => handleToggleUserStatus(user)} 
                                        className={`p-2.5 rounded-xl transition-all shadow-sm ${user.isActive !== false ? 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white'}`}
                                        title={user.isActive !== false ? t('إيقاف الحساب', 'Disable User') : t('تنشيط الحساب', 'Enable User')}
                                     >
                                        <Power size={18}/>
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="w-full space-y-10 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><CardIcon size={24} /></div>
                   <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{editingPlanId ? t('تعديل باقة', 'Edit Plan') : t('إضافة باقة جديدة', 'New Pricing Plan')}</h2>
                </div>

                <form onSubmit={handleSavePlan} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="md:col-span-2"><label className={labelTextClasses}>{t('الاسم (AR)', 'Name (AR)')}</label><input type="text" required value={planData.nameAr} onChange={e => setPlanData({...planData, nameAr: e.target.value})} className={inputClasses} placeholder="باقة المحترفين" /></div>
                      <div className="md:col-span-2"><label className={labelTextClasses}>{t('الاسم (EN)', 'Name (EN)')}</label><input type="text" required value={planData.nameEn} onChange={e => setPlanData({...planData, nameEn: e.target.value})} className={inputClasses} placeholder="Pro Plan" /></div>
                      <div><label className={labelTextClasses}>{t('الترتيب', 'Order')}</label><input type="number" value={planData.order} onChange={e => setPlanData({...planData, order: parseInt(e.target.value) || 0})} className={inputClasses} /></div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div><label className={labelTextClasses}>{t('السعر الحالي (USD)', 'Current Price')}</label><input type="text" required value={planData.price} onChange={e => setPlanData({...planData, price: e.target.value})} className={inputClasses} placeholder="29" /></div>
                      <div>
                        <label className={labelTextClasses}>{t('السعر الأصلي (للخصم)', 'Original Price (for discount)')}</label>
                        <input type="text" value={planData.originalPrice || ''} onChange={e => setPlanData({...planData, originalPrice: e.target.value})} className={inputClasses} placeholder="49" />
                      </div>
                      <div>
                        <label className={labelTextClasses}>{isRtl ? 'المدة بالأشهر' : 'Duration in Months'}</label>
                        <input type="number" required value={planData.durationMonths} onChange={e => setPlanData({...planData, durationMonths: parseInt(e.target.value) || 12})} className={inputClasses} placeholder="12" />
                        <p className="text-[8px] text-gray-400 mt-1">{isRtl ? "* تستخدم لحساب تاريخ انتهاء الاشتراك آلياً." : "* Used to calculate expiry date automatically."}</p>
                      </div>
                      <div>
                         <label className={labelTextClasses}>{t('icon', 'Icon')}</label>
                         <input type="text" value={planData.iconName} onChange={e => setPlanData({...planData, iconName: e.target.value})} className={inputClasses} placeholder="Crown, Star, Shield" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('features_ar', 'Features AR')}</label>
                         <textarea rows={4} value={planData.featuresAr?.join('\n')} onChange={e => setPlanData({...planData, featuresAr: e.target.value.split('\n').filter(l => l.trim() !== '')})} className={inputClasses + " resize-none"} placeholder="بطاقات غير محدودة&#10;وسام توثيق" />
                      </div>
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('features_en', 'Features EN')}</label>
                         <textarea rows={4} value={planData.featuresEn?.join('\n')} onChange={e => setPlanData({...planData, featuresEn: e.target.value.split('\n').filter(l => l.trim() !== '')})} className={inputClasses + " resize-none"} placeholder="Unlimited Cards&#10;Verified Badge" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className={labelTextClasses}>{t('دورة الفوترة (AR)', 'Billing Cycle AR')}</label><input type="text" value={planData.billingCycleAr} onChange={e => setPlanData({...planData, billingCycleAr: e.target.value})} className={inputClasses} placeholder="سنوياً" /></div>
                      <div><label className={labelTextClasses}>{t('دورة الفوترة (EN)', 'Billing Cycle EN')}</label><input type="text" value={planData.billingCycleEn} onChange={e => setPlanData({...planData, billingCycleEn: e.target.value})} className={inputClasses} placeholder="Yearly" /></div>
                      <div><label className={labelTextClasses}>{t('نص الزر (AR)', 'Button Text AR')}</label><input type="text" value={planData.buttonTextAr} onChange={e => setPlanData({...planData, buttonTextAr: e.target.value})} className={inputClasses} /></div>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 space-y-4">
                         <div className="flex items-center gap-3">
                            <Link2 className="text-blue-600" size={20} />
                            <label className={labelTextClasses + " !mb-0"}>{t('رابط الدفع من Stripe', 'Stripe Payment Link')}</label>
                         </div>
                         <input 
                           type="url" 
                           value={planData.stripeLink || ''} 
                           onChange={e => setPlanData({...planData, stripeLink: e.target.value})} 
                           className={inputClasses + " font-mono text-xs"} 
                           placeholder="https://buy.stripe.com/..." 
                         />
                         <p className="text-[9px] font-bold text-gray-400 italic px-2">
                           {isRtl ? "* سيتم توجيه المستخدم لهذا الرابط مباشرة عند الضغط على زر الاشتراك." : "* User will be redirected to this link when clicking subscribe."}
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="flex items-center gap-4 h-14 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                         <span className="text-[10px] font-black text-gray-400 uppercase">{t('الأكثر طلباً؟', 'Is Popular?')}</span>
                         <button type="button" onClick={() => setPlanData({...planData, isPopular: !planData.isPopular})} className={`w-10 h-6 rounded-full relative transition-all ${planData.isPopular ? 'bg-amber-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (planData.isPopular ? 'left-1' : 'left-5') : (planData.isPopular ? 'right-1' : 'right-5')}`} />
                         </button>
                      </div>
                      <button type="submit" disabled={isPlanSubmitting} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                         {isPlanSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                         {editingPlanId ? t('تحديث الباقة', 'Update Plan') : t('حفظ الباقة', 'Save Plan')}
                      </button>
                   </div>
                </form>
             </div>

             <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead>
                         <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                            <td className="px-10 py-5">{t('الباقة', 'Plan')}</td>
                            <td className="px-10 py-5 text-center">{isRtl ? 'المدة' : 'Duration'}</td>
                            <td className="px-10 py-5 text-center">{t('السعر', 'Price')}</td>
                            <td className="px-10 py-5 text-center">{t('الحالة', 'Status')}</td>
                            <td className="px-10 py-5 text-center">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {pricingPlans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-10 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.isPopular ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <Zap size={20} />
                                     </div>
                                     <div>
                                        <p className="font-black dark:text-white leading-none">{isRtl ? plan.nameAr : plan.nameEn}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                           <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {plan.id}</p>
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <span className="text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                                     {plan.durationMonths || 12} {isRtl ? 'شهر' : 'Months'}
                                  </span>
                               </td>
                               <td className="px-10 py-6 text-center font-black">
                                  <div className="flex flex-col">
                                    <span className="text-xl text-blue-600">${plan.price}</span>
                                    {plan.originalPrice && <span className="text-[10px] text-gray-400 line-through">${plan.originalPrice}</span>}
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <button onClick={() => handleTogglePlanActive(plan)} className={`inline-flex items-center gap-2 px-6 py-2 rounded-2xl text-[9px] font-black uppercase shadow-sm ${plan.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                      {plan.isActive !== false ? t('نشط', 'Active') : t('معطل', 'Disabled')}
                                  </button>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="flex justify-center gap-2">
                                     <button onClick={() => { setEditingPlanId(plan.id); setPlanData(plan); }} className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button>
                                     <button onClick={() => setPlanToDelete(plan.id)} className="p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
        {/* البقية كما هي... */}
      </div>
    </div>
  );
};

export default AdminDashboard;
