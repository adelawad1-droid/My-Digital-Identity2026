
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
  Clock, Shield, Wand2 as MagicIcon,
  CheckCircle, XCircle,
  RefreshCcw, MessageCircle,
  Network, LockKeyhole
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomDomainProps {
  lang: Language;
}

const CustomDomain: React.FC<CustomDomainProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const t = (key: string, en?: string) => TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : (en || key);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userCards, setUserCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [domainInput, setDomainInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const MASTER_NODE_URL = "nodes.nextid.my";

  useEffect(() => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      Promise.all([
        getUserProfile(uid),
        getUserCards(uid)
      ]).then(([profile, cards]) => {
        setUserProfile(profile);
        setUserCards(cards);
        if (cards.length > 0) {
           const cardWithDomain = cards.find(c => c.customDomain);
           setSelectedCardId(cardWithDomain ? cardWithDomain.id : cards[0].id);
           if (cardWithDomain?.customDomain) {
             setDomainInput(cardWithDomain.customDomain);
             if (cardWithDomain.domainStatus === 'active') setActiveStep(3);
             else setActiveStep(2);
           }
        }
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

    let cleanedDomain = domainInput
      .toLowerCase()
      .trim()
      .replace(/^(https?:\/\/)/i, '')
      .replace(/\/+$/, '');

    setDomainInput(cleanedDomain);

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(cleanedDomain)) {
       alert(isRtl ? "يرجى إدخال اسم دومين صحيح" : "Please enter a valid domain name");
       return;
    }

    setIsSaving(true);
    try {
      const card = userCards.find(c => c.id === selectedCardId);
      if (card) {
        const updatedCardData: CardData = { 
          ...card, 
          customDomain: cleanedDomain,
          domainStatus: 'pending' 
        };
        await saveCardToDB({ cardData: updatedCardData, oldId: selectedCardId });
        setActiveStep(2);
      }
    } catch (e) {
      alert("Error saving domain");
    } finally {
      setIsSaving(false);
    }
  };

  const getHostValue = () => {
    if (!domainInput) return '@';
    const parts = domainInput.split('.');
    if (parts.length > 2) return parts[0]; 
    return '@';
  };

  const hostValue = getHostValue();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{t("Loading...")}</p>
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
            <p className="text-gray-500 font-bold max-md mx-auto leading-relaxed">
               {isRtl ? 'عذراً، ميزة ربط الدومين الخاص متاحة فقط لمشتركي الباقات الاحترافية.' : 'Sorry, the Custom Domain feature is only available for Pro subscribers.'}
            </p>
         </div>
         <button onClick={() => navigate(`/${lang}/pricing`)} className="px-12 py-5 bg-amber-500 text-white rounded-[1.5rem] font-black uppercase shadow-0 hover:scale-105 transition-all">
            {t('upgradeToCustomize')}
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fade-in-up pb-40">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-blue-600 text-white rounded-[2.25rem] flex items-center justify-center shadow-0 shadow-blue-500/20">
              <Globe size={36} />
           </div>
           <div>
              <h1 className="text-3xl md:text-4xl font-black dark:text-white mb-1">{t('customDomain')}</h1>
              <p className="text-gray-400 text-sm font-bold max-w-xl">{t('customDomainDesc')}</p>
           </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border">
           {[1, 2, 3].map(step => (
              <div key={step} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${activeStep === step ? 'bg-blue-600 text-white shadow-lg' : activeStep > step ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}>
                 {activeStep > step ? <CheckCircle size={18} /> : step}
              </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           
           <div className={`bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-0 transition-all duration-500 ${activeStep !== 1 ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : 'scale-100'}`}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Smartphone size={24} />
                 </div>
                 <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? '1. إدخال النطاق' : '1. Domain Setup'}</h3>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'البطاقة المراد ربطها' : 'Card to Link'}</label>
                       <select value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-100">
                          {userCards.map(card => <option key={card.id} value={card.id}>{card.name} ({card.id})</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'اسم النطاق الخاص بك' : 'Your Domain Name'}</label>
                       <div className="relative group">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                          <input 
                            type="text" 
                            value={domainInput} 
                            onChange={e => setDomainInput(e.target.value)} 
                            placeholder="cards.yourname.com" 
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                          />
                       </div>
                    </div>
                 </div>
                 <button onClick={handleConnect} disabled={isSaving || !domainInput} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />}
                    {isRtl ? 'متابعة لإعدادات الـ DNS' : 'Continue to DNS Settings'}
                 </button>
              </div>
           </div>

           <div className={`bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-500 ${activeStep !== 2 ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : 'scale-100 ring-4 ring-blue-500/10'}`}>
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center">
                       <Server size={24} />
                    </div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? '2. إعدادات الـ DNS' : '2. DNS Configuration'}</h3>
                 </div>
                 <button onClick={() => setActiveStep(1)} className="text-[10px] font-black text-blue-600 uppercase hover:underline">{isRtl ? 'تعديل الدومين' : 'Edit Domain'}</button>
              </div>
              <div className="space-y-8">
                 <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20 space-y-4">
                    <div className="flex gap-4">
                       <Info className="text-blue-500 shrink-0" size={24} />
                       <p className="text-xs font-bold text-blue-800 dark:text-blue-400 leading-relaxed">
                          {isRtl 
                            ? `يجب عليك إضافة سجل CNAME في لوحة تحكم نطاقك لربط بطاقتك بنظامنا. شهادة الـ SSL ستصدر تلقائياً بعد الربط:` 
                            : `You must add a CNAME record in your domain control panel. SSL certificate will be issued automatically after linking:`}
                       </p>
                    </div>
                 </div>

                 <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/30">
                    <table className="w-full text-sm">
                       <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-400 border-b">
                          <tr>
                             <td className="px-6 py-4">{isRtl ? 'النوع (Type)' : 'Type'}</td>
                             <td className="px-6 py-4">{isRtl ? 'المضيف (Host)' : 'Host'}</td>
                             <td className="px-6 py-4">{isRtl ? 'القيمة (Value)' : 'Value'}</td>
                             <td className="px-6 py-4"></td>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          <tr className="group">
                             <td className="px-6 py-8 font-black text-indigo-600">CNAME</td>
                             <td className="px-6 py-8 font-bold dark:text-white">
                                <span className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border text-xs font-mono">{hostValue}</span>
                             </td>
                             <td className="px-6 py-8 font-mono text-xs dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                   <span className="text-blue-600 font-black text-sm">{MASTER_NODE_URL}</span>
                                </div>
                             </td>
                             <td className="px-6 py-8 text-right">
                                <button onClick={() => handleCopy(MASTER_NODE_URL, 'dns-val')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${copied === 'dns-val' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-800 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white'}`}>
                                   {copied === 'dns-val' ? <Check size={14}/> : <Copy size={14}/>} {copied === 'dns-val' ? t('تم النسخ') : t('نسخ الرابط')}
                                </button>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>

                 <div className="flex flex-col gap-4">
                    <button onClick={() => setActiveStep(3)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                       <CheckCircle size={20} /> {isRtl ? 'لقد أضفت سجل CNAME، اطلب التفعيل' : 'CNAME Added, Request Activation'}
                    </button>
                 </div>
              </div>
           </div>

           <div className={`bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-500 ${activeStep !== 3 ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : 'scale-100'}`}>
              <div className="text-center py-10 space-y-8">
                 <div className="relative inline-block">
                    <div className="w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center animate-pulse">
                       <Network size={64} className="text-emerald-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 p-2 rounded-full shadow-lg border">
                       <ShieldCheck size={24} className="text-blue-500" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'تفعيل الحماية والربط' : 'Activating Security & Link'}</h3>
                    <p className="text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">{isRtl ? 'بمجرد رصد سجل CNAME، سيقوم خادمنا بإصدار شهادة SSL مشفرة وتفعيل الرابط تلقائياً.' : 'Once CNAME is detected, our server will issue an encrypted SSL certificate and activate the link automatically.'}</p>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center gap-3 border">
                       <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('domainPending')}</span>
                    </div>
                    <button onClick={() => window.location.reload()} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                       <RefreshCcw size={20} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* SSL Security Info Box */}
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <LockKeyhole size={24} className="text-white" />
                 </div>
                 <h4 className="text-xl font-black leading-tight">{isRtl ? 'حماية HTTPS مجانية' : 'Free HTTPS Protection'}</h4>
                 <p className="text-blue-100 text-[11px] font-bold leading-relaxed">
                    {isRtl 
                      ? 'لا تقلق بشأن الأمان. خوادمنا تدعم إصدار شهادات SSL تلقائية لكل دومين خاص يتم ربطه، مما يضمن ظهور قفل الحماية الأخضر لعملائك.' 
                      : 'Security is on us. Our servers automatically issue SSL certificates for every custom domain linked, ensuring the green lock appears for your clients.'}
                 </p>
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-black/20 p-2 rounded-xl w-fit">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    {isRtl ? 'تشفير AES-256 مفعل' : 'AES-256 Encryption Active'}
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Shield size={180} />
              </div>
           </div>

           <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-8 animate-fade-in-right">
              <div className="flex items-center gap-3">
                 <MagicIcon className="text-blue-600" size={24} />
                 <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'أهمية الربط' : 'Linking Benefits'}</h3>
              </div>
              <div className="space-y-6">
                 {[
                   { icon: ArrowLeftRight, title: isRtl ? 'احترافية كاملة' : 'Full Professionalism', desc: isRtl ? 'يظهر دومينك الخاص بدلاً من رابط الموقع الأساسي.' : 'Your own domain appears instead of the main site link.' },
                   { icon: Shield, title: isRtl ? 'حماية SSL متكاملة' : 'Integrated SSL', desc: isRtl ? 'تشفير كامل للبيانات فور تفعيل الربط.' : 'Full data encryption as soon as linking is active.' },
                   { icon: Zap, title: isRtl ? 'سرعة الوصول' : 'Fast Access', desc: isRtl ? 'توجيه لحظي لبطاقتك عبر خوادمنا العالمية.' : 'Instant routing to your card via our global servers.' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                         <item.icon size={18} />
                      </div>
                      <div>
                         <h4 className="text-xs font-black dark:text-white uppercase mb-1">{item.title}</h4>
                         <p className="text-[10px] font-bold text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                 <a href={`https://wa.me/966560817601`} target="_blank" className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-blue-600 rounded-2xl font-black text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                    <MessageCircle size={16} /> {isRtl ? 'مساعدة في إعدادات الـ DNS' : 'Help with DNS Settings'}
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDomain;
