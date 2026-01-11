
import React, { useEffect, useState, useRef } from 'react';
import { 
  getAdminStats, ADMIN_EMAIL, deleteUserCard, 
  getDoc, doc, db,
  getSiteSettings, updateSiteSettings, updateUserSecurity,
  saveCustomTemplate, getAllTemplates, deleteTemplate,
  getAllCategories, saveTemplateCategory, deleteTemplateCategory,
  auth, getAuthErrorMessage, toggleCardStatus, getAllVisualStyles,
  getAllUsersWithStats, updateUserSubscription, toggleUserStatus,
  getAllPricingPlans, savePricingPlan, deletePricingPlan,
  getUserProfile, getAllPayments, PaymentRecord
} from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { Language, CardData, CustomTemplate, TemplateCategory, VisualStyle, PricingPlan } from '../types';
import { generateShareUrl } from '../utils/share';
import CardPreview from '../components/CardPreview';
import TemplateBuilder from '../components/TemplateBuilder';
import StyleManager from '../components/StyleManager';
import { AVAILABLE_FONTS, THEME_GRADIENTS, TRANSLATIONS, THEME_COLORS, SAMPLE_DATA } from '../constants';
import * as LucideIcons from 'lucide-react';
import { 
  BarChart3, Users, Clock, Loader2,
  ShieldCheck, Trash2, Edit3, Eye, Settings, 
  Globe, Power, Save, Search, LayoutGrid,
  Lock, CheckCircle2, Image as ImageIcon, UploadCloud, X, Layout, User as UserIcon,
  Plus, Palette, ShieldAlert, Key, Star, Hash, AlertTriangle, Pin, PinOff, ArrowUpAZ,
  MoreVertical, ToggleLeft, ToggleRight, MousePointer2, TrendingUp, Filter, ListFilter, Activity, Type, FolderEdit, Check, FolderOpen, Tag, PlusCircle, Zap, HardDrive, Database, Link as LinkIcon, FolderSync, Server,
  Info, BarChart, Copy, FileJson, Code, Mail, UserCheck, Calendar, Contact2, CreditCard, RefreshCw, Crown, Type as FontIcon, Shield, Activity as AnalyticsIcon, CreditCard as CardIcon, CreditCard as PaymentIcon, Webhook, ExternalLink, Activity as LiveIcon, Beaker as TestIcon, Link2, PhoneCall, Cloud, MonitorDot, DollarSign
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
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
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
    id: '', nameAr: '', nameEn: '', price: '0', billingCycleAr: 'سنوياً', billingCycleEn: 'Yearly', 
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
      const [sData, uData, stData, tData, cData, vsData, pData, payData] = await Promise.all([
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
        getAllPricingPlans().catch(() => []),
        getAllPayments(100).catch(() => [])
      ]);
      setStats(sData as any);
      setUsersStats(uData);
      setPayments(payData);
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

  const calculateFinancials = () => {
    const total = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const activeSubscribers = usersStats.filter(u => u.role === 'premium' && u.planId).length;
    return { total, activeSubscribers };
  };

  const financials = calculateFinancials();

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanSubmitting(true);
    try {
      await savePricingPlan({ ...planData, id: editingPlanId || undefined });
      setEditingPlanId(null);
      await fetchData(true);
    } finally { setIsPlanSubmitting(false); }
  };

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const t = (arOrKey: string, en?: string) => {
    if (en) return isRtl ? arOrKey : en;
    return TRANSLATIONS[arOrKey] ? (TRANSLATIONS[arOrKey][lang] || TRANSLATIONS[arOrKey]['en']) : arOrKey;
  };

  const TabButton = ({ id, label, icon: Icon, activeColor }: any) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === id ? `${activeColor} text-white shadow-lg` : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try { await updateSiteSettings(settings); alert("Settings saved"); } 
    catch (e) { alert("Error saving settings"); } 
    finally { setSavingSettings(false); }
  };

  if (loading && !planToDelete && !subEditUser) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('appName')}</p>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 space-y-10 animate-fade-in-up pb-20">
      {activeTab !== 'builder' && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><ShieldCheck size={20} /></div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{t('Admin System')}</span>
            </div>
            <div className="flex items-center gap-4">
               <h1 className="text-4xl md:text-5xl font-black dark:text-white">{t('Dashboard')}</h1>
               <button onClick={() => fetchData(true)} className={`p-3 bg-white dark:bg-gray-900 border rounded-2xl text-blue-600 shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={20} /></button>
            </div>
          </div>
          <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
            <TabButton id="stats" label={t('البطاقات', 'Cards')} icon={BarChart3} activeColor="bg-blue-600" />
            <TabButton id="users" label={t('المسجلين', 'Users')} icon={Users} activeColor="bg-purple-600" />
            <TabButton id="payment" label={t('الدفع والفوترة', 'Payments')} icon={PaymentIcon} activeColor="bg-emerald-600" />
            <TabButton id="plans" label={t('الباقات', 'Plans')} icon={Zap} activeColor="bg-indigo-600" />
            <TabButton id="templates" label={t('القوالب', 'Templates')} icon={Layout} activeColor="bg-rose-600" />
            <TabButton id="settings" label={t('settings')} icon={Settings} activeColor="bg-slate-700" />
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'stats' && (
           <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي البطاقات', 'Total Cards')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalCards || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"><DollarSign size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المبيعات', 'Total Revenue')}</p><h4 className="text-2xl font-black dark:text-white">${financials.total}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"><Crown size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('مشتركين نشطين', 'Active Subs')}</p><h4 className="text-2xl font-black dark:text-white">{financials.activeSubscribers}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600"><Eye size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المشاهدات', 'Total Views')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalViews || 0}</h4></div>
                 </div>
              </div>
              {/* Existing cards manager table ... */}
           </div>
        )}

        {activeTab === 'payment' && (
           <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade-in">
              <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl shadow-sm"><PaymentIcon size={24}/></div>
                    <h2 className="text-2xl font-black dark:text-white uppercase">{isRtl ? 'إدارة بوابة الدفع' : 'Gateway Config'}</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToggleSwitch label={isRtl ? 'الوضع المباشر (Stripe Live)' : 'Stripe Live Mode'} value={settings.stripeLiveMode} onChange={(v: boolean) => setSettings({...settings, stripeLiveMode: v})} isRtl={isRtl} color="bg-emerald-600" />
                    <ColorPickerUI label={isRtl ? 'سر الويب هوك' : 'Webhook Secret'} value={settings.stripeWebhookSecret} onChange={(v: string) => setSettings({...settings, stripeWebhookSecret: v})} />
                 </div>
                 <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase shadow-xl flex items-center justify-center gap-3">
                    {savingSettings ? <Loader2 className="animate-spin" /> : <Save />} {t('حفظ الإعدادات', 'Save Gateway')}
                 </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 border-gray-800 shadow-2xl overflow-hidden">
                 <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><TrendingUp size={24}/></div>
                       <h3 className="text-xl font-black dark:text-white uppercase tracking-widest">{isRtl ? 'سجل العمليات المالية الأخير' : 'Recent Transaction Ledger'}</h3>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                       <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase border-b dark:border-gray-800">
                          <tr>
                             <td className="px-8 py-5">{t('المستخدم', 'Customer')}</td>
                             <td className="px-8 py-5">{t('الباقة', 'Plan')}</td>
                             <td className="px-8 py-5 text-center">{t('المبلغ', 'Amount')}</td>
                             <td className="px-8 py-5 text-center">{t('التاريخ', 'Date')}</td>
                             <td className="px-8 py-5 text-center">{t('الحالة', 'Status')}</td>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {payments.map(pay => (
                            <tr key={pay.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6"><p className="text-xs font-black dark:text-white leading-none">{pay.userEmail}</p><p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">UID: {pay.userId.substring(0,8)}</p></td>
                               <td className="px-8 py-6 text-xs font-bold dark:text-white">{pay.planName}</td>
                               <td className="px-8 py-6 text-center font-black text-blue-600">${pay.amount}</td>
                               <td className="px-8 py-6 text-center text-[10px] text-gray-400 font-bold">{new Date(pay.createdAt?.seconds * 1000 || pay.createdAt).toLocaleString()}</td>
                               <td className="px-8 py-6 text-center">
                                  <div className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase">Succeeded</div>
                               </td>
                            </tr>
                          ))}
                          {payments.length === 0 && (
                             <tr><td colSpan={5} className="p-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest">No payments recorded in history</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {/* Existing tabs for templates, plans, settings ... */}
      </div>
    </div>
  );
};

// Added ToggleSwitch component for Admin settings
const ToggleSwitch = ({ label, value, onChange, color = "bg-blue-600", isRtl }: any) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
    <span className={`text-[10px] font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all ${value ? color + ' shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-7' : 'right-1') : (value ? 'left-7' : 'left-1')}`} />
    </button>
  </div>
);

// Simple wrapper for color inputs in dash
const ColorPickerUI = ({ label, value, onChange }: any) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <input type="password" value={value || ''} onChange={e => onChange(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-xs font-black dark:text-white w-40 outline-none" placeholder="••••••••" />
  </div>
);

export default AdminDashboard;
