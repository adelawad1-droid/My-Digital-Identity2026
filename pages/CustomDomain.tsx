
import React, { useState, useEffect } from 'react';
import { Language, CardData } from '../types';
import { TRANSLATIONS } from '../constants';
import { auth, getUserProfile, saveCardToDB, getUserCards } from '../services/firebase';
import { 
  Globe, ShieldCheck, CheckCircle2, AlertTriangle, 
  Copy, Check, ArrowRight, Info, ExternalLink, 
  Loader2, Zap, Settings, HelpCircle, Server,
  Lock, Smartphone, Monitor, Layout, Search,
  ChevronRight, ArrowLeftRight,
  Clock, Shield, Wand2 as MagicIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomDomainProps {
  lang: Language;
}

const CustomDomain: React.FC<CustomDomainProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userCards, setUserCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [domainInput, setDomainInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      Promise.all([
        getUserProfile(uid),
        getUserCards(uid)
      ]).then(([profile, cards]) => {
        setUserProfile(profile);
        setUserCards(cards);
        if (cards.length > 0) setSelectedCardId(cards[0].id);
        setLoading(false);
      });
    }
  }, []);

  const isPremium = userProfile?.role === 'premium' || userProfile?.role === 'admin' || !!userProfile?.planId;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConnect = async () => {
    if (!domainInput || !selectedCardId) return;
    setIsSaving(true);
    try {
      const card = userCards.find(c => c.id === selectedCardId);
      if (card) {
        const updatedCardData: CardData = { ...card, customDomain: domainInput };
        // Fixed: saveCardToDB expects a single object containing cardData and optional oldId.
        // The error "Expected 1 arguments, but got 2" occurred when passing arguments separately.
        await saveCardToDB({ cardData: updatedCardData, oldId: selectedCardId });
        alert(isRtl ? "تم إرسال طلب ربط الدومين بنجاح" : "Domain connection request sent successfully");
        setActiveStep(3);
      }
    } catch (e) {
      console.error("Error saving domain:", e);
      alert("Error saving domain");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{t("جاري التحميل...", "Loading...")}</p>
    </div>
  );

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center space-y-8 animate-fade-in">
         <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl animate-bounce">
            <Lock size={48} />
         </div>
         <div className="space-y-3">
            <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter">{t('customDomain')}</h1>
            <p className="text-gray-500 font-bold max-w-md mx-auto leading-relaxed">
               {isRtl ? 'عذراً، ميزة ربط الدومين الخاص متاحة فقط لمشتركي الباقات الاحترافية.' : 'Sorry, the Custom Domain feature is only available for Pro subscribers.'}
            </p>
         </div>
         <button onClick={() => navigate(`/${lang}/pricing`)} className="px-12 py-5 bg-amber-500 text-white rounded-[1.5rem] font-black uppercase shadow-xl hover:scale-105 transition-all">
            {t('upgradeToCustomize')}
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fade-in-up pb-40">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-blue-600 text-white rounded-[2.25rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <Globe size={36} />
           </div>
           <div>
              <h1 className="text-3xl md:text-4xl font-black dark:text-white mb-1">{t('customDomain')}</h1>
              <p className="text-gray-400 text-sm font-bold max-w-xl">{t('customDomainDesc')}</p>
           </div>
        </div>
        <div className="hidden lg:flex items-center gap-2">
           {[1, 2, 3].map(step => (
              <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${activeStep >= step ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                 {activeStep > step ? <CheckCircle2 size={16} /> : step}
              </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Connection Area */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Step 1: Input Domain */}
           <div className={`bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-500 ${activeStep !== 1 ? 'opacity-50 grayscale scale-[0.98]' : 'scale-100'}`}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Smartphone size={24} />
                 </div>
                 <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? '1. اختر البطاقة والدومين' : '1. Select Card & Domain'}</h3>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'اختر البطاقة المراد ربطها' : 'Select Card to Link'}</label>
                    <select 
                      value={selectedCardId} 
                      onChange={e => setSelectedCardId(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-100"
                    >
                       {userCards.map(card => <option key={card.id} value={card.id}>{card.name} ({card.id})</option>)}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('enterDomain')}</label>
                    <div className="relative group">
                       <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                       <input 
                         type="text" 
                         value={domainInput}
                         onChange={e => setDomainInput(e.target.value.toLowerCase().trim())}
                         placeholder="cards.yourname.com"
                         className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-black text-lg dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                       />
                    </div>
                 </div>

                 {activeStep === 1 && (
                    <button 
                      onClick={() => domainInput && setActiveStep(2)}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
                    >
                       {isRtl ? 'الخطوة التالية: إعدادات الـ DNS' : 'Next Step: DNS Settings'}
                       <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                 )}
              </div>
           </div>

           {/* Step 2: DNS Records */}
           <div className={`bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-500 ${activeStep !== 2 ? 'opacity-50 grayscale scale-[0.98]' : 'scale-100 ring-4 ring-blue-500/10'}`}>
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center">
                       <Server size={24} />
                    </div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? '2. تحديث سجلات الـ DNS' : '2. Update DNS Records'}</h3>
                 </div>
                 {activeStep === 2 && (
                    <button onClick={() => setActiveStep(1)} className="text-[10px] font-black text-gray-400 uppercase hover:text-red-500 transition-colors">{isRtl ? 'تغيير الدومين' : 'Change Domain'}</button>
                 )}
              </div>

              <div className="space-y-8">
                 <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                    <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
                       {isRtl 
                         ? 'يرجى التوجه إلى لوحة تحكم الدومين الخاص بك وإضافة السجل التالي لكي نستطيع ربط بطاقتك.' 
                         : 'Please go to your domain control panel and add the following record so we can link your card.'}
                    </p>
                 </div>

                 <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800">
                    <table className="w-full">
                       <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-400 border-b">
                          <tr>
                             <td className="px-6 py-4">{isRtl ? 'النوع' : 'Type'}</td>
                             <td className="px-6 py-4">{isRtl ? 'المضيف' : 'Host'}</td>
                             <td className="px-6 py-4">{isRtl ? 'القيمة' : 'Value'}</td>
                             <td className="px-6 py-4"></td>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          <tr>
                             <td className="px-6 py-6 font-black text-blue-600">CNAME</td>
                             <td className="px-6 py-6 font-bold dark:text-white">{domainInput.split('.')[0] || 'cards'}</td>
                             <td className="px-6 py-6 font-mono text-xs dark:text-gray-300">nodes.nextid.my</td>
                             <td className="px-6 py-6 text-right">
                                <button 
                                  onClick={() => handleCopy('nodes.nextid.my', 'dns-val')}
                                  className={`p-2 rounded-xl transition-all ${copied === 'dns-val' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-indigo-600 hover:text-white'}`}
                                >
                                   {copied === 'dns-val' ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
                                </button>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>

                 {activeStep === 2 && (
                    <button 
                      onClick={handleConnect}
                      disabled={isSaving}
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isSaving ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                       {isRtl ? 'لقد قمت بإضافة السجلات، تحقق الآن' : 'I added the records, verify now'}
                    </button>
                 )}
              </div>
           </div>

           {/* Step 3: Verification & SSL */}
           <div className={`bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-500 ${activeStep !== 3 ? 'opacity-50 grayscale scale-[0.98]' : 'scale-100 shadow-emerald-500/5'}`}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                 </div>
                 <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? '3. بانتظار التفعيل العالمي' : '3. Awaiting Propagation'}</h3>
              </div>
              
              <div className="text-center py-10 space-y-6">
                 <div className="relative inline-block">
                    <Globe size={80} className="text-emerald-500 animate-pulse" />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                       <Clock size={16} className="text-amber-500" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black dark:text-white">{isRtl ? 'الدومين قيد التحقق' : 'Domain in Verification'}</h4>
                    <p className="text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                       {isRtl 
                         ? 'تم استلام طلبك. نقوم الآن بالتحقق من سجلات الـ DNS وإصدار شهادة SSL أمنية لاسم النطاق الخاص بك.' 
                         : 'Request received. We are verifying DNS records and issuing a secure SSL certificate for your domain.'}
                    </p>
                 </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl inline-flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-gray-400">{isRtl ? 'الحالة الحالية:' : 'Current Status:'}</span>
                    <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">{t('domainPending')}</span>
                 </div>
              </div>
           </div>

        </div>

        {/* Right Sidebar: Best Practices & Tips */}
        <div className="lg:col-span-4 space-y-8">
           
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-8 animate-fade-in-right">
              <div className="flex items-center gap-3">
                 <MagicIcon className="text-blue-600" size={24} />
                 <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{t('bestPractices')}</h3>
              </div>

              <div className="space-y-6">
                 <div className="flex gap-4 group">
                    <div className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                       <ArrowLeftRight size={18} />
                    </div>
                    <div>
                       <h4 className="text-xs font-black dark:text-white uppercase mb-1">{isRtl ? 'استخدم دومين فرعي' : 'Use a Subdomain'}</h4>
                       <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                          {isRtl 
                            ? 'يفضل استخدام دومين مثل (card.domain.com) بدلاً من الدومين الرئيسي للحفاظ على عمل موقعك الأساسي بشكل منفصل.' 
                            : 'Prefer using (card.domain.com) instead of the main domain to keep your core website working independently.'}
                       </p>
                    </div>
                 </div>

                 <div className="flex gap-4 group">
                    <div className="w-10 h-10 shrink-0 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                       <Shield size={18} />
                    </div>
                    <div>
                       <h4 className="text-xs font-black dark:text-white uppercase mb-1">{isRtl ? 'تفعيل الحماية (SSL)' : 'SSL Security'}</h4>
                       <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                          {isRtl 
                            ? 'نحن نوفر شهادة SSL مجانية وتلقائية. لا تحاول رفع شهادة خاصة بك من لوحة تحكم الدومين لتجنب التعارض.' 
                            : 'We provide a free automatic SSL. Do not try to upload your own cert from domain panel to avoid conflicts.'}
                       </p>
                    </div>
                 </div>

                 <div className="flex gap-4 group">
                    <div className="w-10 h-10 shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                       <Zap size={18} />
                    </div>
                    <div>
                       <h4 className="text-xs font-black dark:text-white uppercase mb-1">{isRtl ? 'قيمة الـ TTL' : 'TTL Value'}</h4>
                       <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                          {isRtl 
                            ? 'عند إضافة السجل، اختر أقل قيمة ممكنة للـ TTL (مثلاً 300 ثانية) لتسريع عملية الربط.' 
                            : 'When adding the record, choose the lowest possible TTL value (e.g., 300s) to speed up connection.'}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                 <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3">
                       <HelpCircle className="text-blue-600" size={18} />
                       <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">{isRtl ? 'هل تحتاج مساعدة؟' : 'Need Help?'}</span>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 leading-relaxed">
                       {isRtl 
                         ? 'إذا لم تكن خبيراً في إعدادات الـ DNS، يمكن لفريقنا القيام بذلك نيابة عنك. تواصل معنا عبر الدعم الفني.' 
                         : 'If you are not an expert in DNS, our team can do it for you. Contact us via technical support.'}
                    </p>
                    <button 
                      onClick={() => navigate(`/${lang}/custom-orders`)}
                      className="w-full py-3 bg-white dark:bg-gray-800 text-blue-600 rounded-xl font-black text-[9px] uppercase shadow-sm border border-blue-100"
                    >
                       {isRtl ? 'طلب مساعدة تقنية' : 'Request Tech Support'}
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[3rem] text-white shadow-xl space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <h4 className="text-xl font-black leading-tight">{isRtl ? 'المظهر النهائي' : 'The End Result'}</h4>
                 <p className="text-blue-100 text-[10px] font-bold leading-relaxed">
                    {isRtl 
                      ? 'عند الانتهاء، ستظهر بطاقتك مباشرة عند طلب الدومين الخاص بك في المتصفح مع قفل الحماية الأخضر.' 
                      : 'When finished, your card will appear directly when requesting your domain in the browser with the green security lock.'}
                 </p>
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Lock size={12} className="text-emerald-400" />
                       <span className="text-[10px] font-mono opacity-80">https://cards.you.com</span>
                    </div>
                    <ExternalLink size={12} className="opacity-40" />
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                 <Monitor size={140} />
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};

export default CustomDomain;
