
import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Share2, ShieldCheck, 
  ArrowRight, Globe, QrCode,
  Instagram, MessageCircle,
  Wand2, Sparkles, Sparkle, Check, Crown, Star,
  CalendarDays, Percent, CreditCard, Mail, Phone, UserPlus,
  MapPin, ShoppingCart, HelpCircle,
  LayoutGrid, Coffee, Camera, Search, Palette, Heart
} from 'lucide-react';

interface HomeProps {
  lang: Language;
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, onStart }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const isRtl = lang === 'ar';
  const navigate = useNavigate();

  const phrases = isRtl 
    ? ["بطاقات عمل احترافية", "عضويات رقمية ذكية", "دعوات مناسبات فاخرة", "بطاقات خصم وتوفير"]
    : ["Pro Business Cards", "Smart Digital Membership", "Luxury Event Invites", "Discount & Savings Cards"];
  
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleType = () => {
      const fullPhrase = phrases[currentPhraseIdx];
      if (!isDeleting) {
        setDisplayText(fullPhrase.substring(0, displayText.length + 1));
        setTypingSpeed(100);
        if (displayText === fullPhrase) { setTimeout(() => setIsDeleting(true), 2000); }
      } else {
        setDisplayText(fullPhrase.substring(0, displayText.length - 1));
        setTypingSpeed(50);
        if (displayText === '') {
          setIsDeleting(false);
          setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
        }
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentPhraseIdx]);

  const floatingIcons = [
    { Icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', size: 48, delay: '0s', pos: 'top-0 left-10', glow: 'shadow-emerald-500/20' },
    { Icon: QrCode, color: 'text-blue-500', bg: 'bg-blue-500/10', size: 64, delay: '1.2s', pos: 'top-10 right-20', glow: 'shadow-blue-500/20' },
    { Icon: Phone, color: 'text-indigo-500', bg: 'bg-indigo-500/10', size: 36, delay: '0.5s', pos: 'bottom-10 left-10', glow: 'shadow-indigo-500/20' },
    { Icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-500/10', size: 52, delay: '2s', pos: 'bottom-5 right-24', glow: 'shadow-purple-500/20' },
    { Icon: Percent, color: 'text-orange-500', bg: 'bg-orange-500/10', size: 42, delay: '1.5s', pos: 'top-1/2 -left-10', glow: 'shadow-orange-500/20' },
    { Icon: Mail, color: 'text-red-500', bg: 'bg-red-500/10', size: 32, delay: '0.8s', pos: '-top-10 right-1/2', glow: 'shadow-red-500/20' },
    { Icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-500/10', size: 56, delay: '2.5s', pos: 'bottom-1/2 -right-12', glow: 'shadow-teal-500/20' },
    { Icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-500/10', size: 38, delay: '1.7s', pos: 'top-32 left-1/4', glow: 'shadow-rose-500/20' },
    { Icon: ShoppingCart, color: 'text-cyan-500', bg: 'bg-cyan-500/10', size: 40, delay: '3s', pos: 'bottom-24 right-1/4', glow: 'shadow-cyan-500/20' },
    { Icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10', size: 34, delay: '1.1s', pos: 'top-20 left-1/2', glow: 'shadow-pink-500/20' },
    { Icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', size: 30, delay: '2.2s', pos: 'bottom-40 left-0', glow: 'shadow-blue-400/20' },
    { Icon: Camera, color: 'text-amber-500', bg: 'bg-amber-500/10', size: 28, delay: '0.3s', pos: 'top-40 right-5', glow: 'shadow-amber-500/20' },
  ];

  const cardTypes = [
    {
      title: isRtl ? 'هوية الأعمال' : 'Business Identity',
      desc: isRtl ? 'بطاقة رقمية تختصر سيرتك الذاتية وروابطك المهنية بلمسة واحدة.' : 'A digital card that condenses your resume and professional links in one tap.',
      icon: CreditCard,
      color: 'from-blue-600 to-indigo-600',
      badge: isRtl ? 'الأكثر استخداماً' : 'Most Used'
    },
    {
      title: isRtl ? 'عضويات واشتراكات' : 'Memberships & Subs',
      desc: isRtl ? 'نظام متكامل لإدارة العضويات مع تاريخ انتهاء وتوثيق رسمي للحساب.' : 'Complete membership system with expiry dates and official account verification.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: isRtl ? 'ميزة VIP' : 'VIP Feature'
    },
    {
      title: isRtl ? 'دعوات ومناسبات' : 'Events & Invitations',
      desc: isRtl ? 'حول دعوتك الورقية لبطاقة رقمية تفاعلية مع خريطة وعد تنازلي.' : 'Turn your paper invites into interactive digital cards with maps and countdowns.',
      icon: CalendarDays,
      color: 'from-purple-600 to-pink-600',
      badge: isRtl ? 'أناقة' : 'Elegant'
    },
    {
      title: isRtl ? 'خصومات وعروض' : 'Discounts & Offers',
      desc: isRtl ? 'شارك أكواد الخصم وعروضك الخاصة بأسلوب بصري جذاب يزيد المبيعات.' : 'Share discount codes and special offers in a visual style that boosts sales.',
      icon: Percent,
      color: 'from-orange-500 to-red-600',
      badge: isRtl ? 'تجاري' : 'Business'
    }
  ];

  const seoTagsAr = [
    "بطاقات أعمال رقمية", "هوية رقمية احترافية", "كرت شخصي ذكي", "كروت NFC", "تصميم بطاقة عضوية", 
    "دعوات إلكترونية فاخرة", "بطاقة تواصل ذكية", "إنشاء هوية مهنية", "كرت عمل إلكتروني", "منصة بطاقات ذكية", 
    "QR code كرت", "توثيق حسابات", "عضويات نوادي رقمية", "دعوات زواج رقمية", "كروت خصم ذكية", 
    "بطاقات ولاء العملاء", "هوية تجارية رقمية", "حلول تواصل ذكي", "ربط لينكد إن بالكرت", "بطاقة أعمال واتساب", 
    "مشاركة جهات اتصال بلمسة", "كرت شخصي عصري", "منصة هويتي الرقمية", "تكنولوجيا NFC للشركات", "كروت عمل QR"
  ];

  const seoTagsEn = [
    "Digital business cards", "professional digital identity", "smart personal card", "NFC business cards", 
    "membership card design", "luxury electronic invitations", "smart contact card", "professional identity builder", 
    "electronic work card", "smart card platform", "QR code card", "account verification", "digital club membership", 
    "digital wedding invites", "smart discount cards", "customer loyalty cards", "digital brand identity", 
    "smart networking solutions", "LinkedIn card integration", "WhatsApp business card", "one-tap contact sharing", 
    "modern personal card", "NextID platform", "NFC technology for business", "QR business cards"
  ];

  return (
    <div className={`relative min-h-screen bg-[#fcfdfe] dark:bg-[#050810] text-slate-900 dark:text-white transition-colors duration-700 overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* WhatsApp Floating Contact Button - Only on Home Page */}
      <a 
        href="https://wa.me/966556797515" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`fixed bottom-24 ${isRtl ? 'left-6' : 'right-6'} z-[100] group flex items-center gap-3`}
      >
        <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-2xl animate-ping opacity-20 group-hover:opacity-40"></div>
          <MessageCircle size={28} className="relative z-10" />
        </div>
        <div className={`hidden md:block bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300`}>
           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
             {isRtl ? 'تواصل معنا' : 'Contact Us'}
           </span>
        </div>
      </a>

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-100/40 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-indigo-50/40 dark:bg-purple-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="flex-1 text-center lg:text-start space-y-10 order-2 lg:order-1">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/30 animate-fade-in">
               <Sparkles size={14} className="text-blue-600 animate-pulse" />
               <p className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                  {isRtl ? 'منصة متكاملة للهويات الرقمية' : 'ALL-IN-ONE DIGITAL IDENTITY PLATFORM'}
               </p>
            </div>
            <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tighter">
              {isRtl ? 'ليست مجرد بطاقة' : 'Not Just a Card'}
              <span className="block text-blue-600 dark:text-blue-500 min-h-[1.2em]">
                {displayText}
                <span className="w-[3px] h-[0.8em] bg-blue-600 ml-2 inline-block animate-pulse"></span>
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {isRtl 
                ? 'أنشئ هويتك المهنية، بطاقات عضويتك، أو دعواتك الخاصة بلمسة عصرية تليق بك في عصر التحول الرقمي.' 
                : 'Create your professional identity, membership cards, or special invitations with a modern touch that fits you in the digital transformation era.'}
            </p>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-6">
            <button onClick={onStart} className="group relative px-16 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_50_px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span>{isRtl ? 'أنشئ بطاقتك الآن مجاناً' : 'Create Your Card for Free'}</span>
              <ArrowRight size={22} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </button>
            <div className="flex items-center gap-4 text-slate-400">
               <div className="flex -space-x-3 rtl:space-x-reverse">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-[#050810] bg-gray-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="avatar" /></div>)}
               </div>
               <p className="text-xs font-bold">{isRtl ? '+10,000 مستخدم يثقون بنا' : 'Trusted by +10,000 users'}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Glowing Icon Cloud */}
        <div className="flex-1 relative w-full h-[450px] md:h-[650px] order-1 lg:order-2 flex items-center justify-center">
            {/* Center Anchor Point - The Card Core */}
            <div className="relative z-20 w-40 h-40 md:w-48 md:h-48 bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(37,99,235,0.3)] border border-slate-100 dark:border-white/10 flex items-center justify-center animate-bounce-slow">
                <div className="absolute inset-0 bg-blue-600/10 blur-[40px] rounded-full animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <UserPlus size={40} />
                   </div>
                   <div className="h-1.5 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-full"></div>
                </div>
            </div>

            {/* Orbiting Icons Cloud with Glassmorphism */}
            {floatingIcons.map((item, idx) => (
                <div 
                    key={idx}
                    className={`absolute ${item.pos} z-10 animate-float p-5 md:p-7 rounded-[2rem] bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-0 transition-all duration-700 hover:scale-125 hover:z-30 cursor-default group hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] ${item.glow}`}
                    style={{ animationDelay: item.delay }}
                >
                    <div className={`absolute inset-0 ${item.bg} opacity-20 group-hover:opacity-40 transition-opacity rounded-[inherit]`}></div>
                    <item.Icon size={item.size} className={`${item.color} transition-all duration-500 group-hover:rotate-12 group-hover:drop-shadow-[0_0_15px_currentColor]`} />
                </div>
            ))}

            {/* Orbiting Decorative Circular Guides */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-dashed border-blue-200/20 rounded-full animate-spin-slow opacity-40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] border border-dashed border-indigo-200/10 rounded-full animate-spin-reverse opacity-30"></div>
                
                {/* Random Glowing Dots */}
                <div className="absolute top-10 left-1/2 w-3 h-3 bg-blue-500 rounded-full blur-sm animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-2 h-2 bg-purple-500 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-emerald-500 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
      </section>

      {/* Card Types Grid - Bento Style */}
      <section className="relative z-10 py-24 px-6 bg-slate-50/50 dark:bg-white/[0.02] border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black">{isRtl ? 'صمم ما يحتاجه نشاطك' : 'Design What You Need'}</h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold max-w-2xl mx-auto">
              {isRtl ? 'أنماط متعددة تدعم كافة الاستخدامات من الهويات المهنية وحتى بطاقات الخصم والدعوات.' : 'Multiple styles supporting everything from professional IDs to discount cards and invites.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cardTypes.map((type, idx) => (
              <div key={idx} className="group relative bg-white dark:bg-[#0d111b] p-8 rounded-[3rem] border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-0 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:scale-150 transition-transform duration-1000 pointer-events-none`}>
                  <type.icon size={120} />
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
                  <type.icon size={28} />
                </div>
                <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400 mb-3">
                   {type.badge}
                </div>
                <h3 className="text-xl font-black mb-3">{type.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section className="relative z-10 py-24 px-6 overflow-hidden">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <h2 className="text-3xl md:text-5xl font-black leading-tight">
                  {isRtl ? 'أدوات ذكية متكاملة' : 'Integrated Smart Tools'}
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center"><CalendarDays size={24}/></div>
                     <h4 className="font-black text-lg">{isRtl ? 'إدارة الفعاليات' : 'Event Management'}</h4>
                     <p className="text-sm text-slate-400 font-bold">{isRtl ? 'أضف عداداً تنازلياً وروابط الخرائط لضيوفك.' : 'Add countdowns and map links for your guests.'}</p>
                  </div>
                  <div className="space-y-3">
                     <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center"><ShieldCheck size={24}/></div>
                     <h4 className="font-black text-lg">{isRtl ? 'تراخيص وعضويات' : 'Licenses & Subs'}</h4>
                     <p className="text-sm text-slate-400 font-bold">{isRtl ? 'نظام صلاحية يعرض حالة الاشتراك لحظياً.' : 'Validity system displaying sub status in real-time.'}</p>
                  </div>
                  <div className="space-y-3">
                     <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center"><Percent size={24}/></div>
                     <h4 className="font-black text-lg">{isRtl ? 'عروض ترويجية' : 'Promotions'}</h4>
                     <p className="text-sm text-slate-400 font-bold">{isRtl ? 'قسم مخصص للروابط المباشرة وكوبونات الخصم.' : 'Dedicated section for direct links and coupons.'}</p>
                  </div>
                  <div className="space-y-3">
                     <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl flex items-center justify-center"><Wand2 size={24}/></div>
                     <h4 className="font-black text-lg">{isRtl ? 'ذكاء اصطناعي' : 'AI Bio Generation'}</h4>
                     <p className="text-sm text-slate-400 font-bold">{isRtl ? 'اصنع نبذتك المهنية بلمسة زر عبر Gemini.' : 'Craft your bio with one click via Gemini.'}</p>
                  </div>
               </div>
               <button onClick={onStart} className="flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
                  {isRtl ? 'اكتشف كافة القوالب' : 'Explore All Templates'}
                  <ArrowRight size={18} />
               </button>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full"></div>
               <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-12">
                     <div className="h-64 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl p-6 flex flex-col justify-between">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg"></div>
                        <div className="space-y-2">
                           <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                           <div className="h-2 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                        </div>
                     </div>
                     <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-600 rounded-[2.5rem] shadow-xl p-6">
                        <Star className="text-white/30" size={32} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2.5rem] shadow-xl p-6">
                        <Check className="text-white/30" size={32} />
                     </div>
                     <div className="h-64 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl p-6 flex flex-col items-center justify-center gap-4">
                        <QrCode className="text-slate-300 dark:text-slate-700" size={80} />
                        <div className="h-2 w-20 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Support Section - Redesigned to be horizontal like the provided image */}
      <section className="relative z-10 py-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-[#0d111b] rounded-[2.5rem] p-6 md:p-10 border border-orange-100 dark:border-white/5 shadow-0 flex flex-col md:flex-row items-center justify-between gap-8 group transition-all duration-500 hover:shadow-orange-500/10">
             {/* Decorative Background */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-900/5 pointer-events-none"></div>
             
             {/* Button Side (Left in screenshot) */}
             <div className="relative z-10 order-2 md:order-1 shrink-0">
                <a 
                   href="https://buymeacoffee.com/guidai" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="group/btn relative px-8 md:px-12 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-[2rem] font-black text-xl md:text-2xl shadow-[0_15px_40px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.5)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 overflow-hidden"
                >
                   <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors"></div>
                   <span>{t('buyMeCoffee')}</span>
                   <Coffee size={24} className="group-hover/btn:rotate-12 transition-transform" />
                </a>
             </div>

             {/* Text Side (Right in screenshot) */}
             <div className="relative z-10 flex-1 text-center md:text-start space-y-3 order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100/50">
                   <Sparkle size={10} className="animate-pulse" />
                   {isRtl ? 'دعم استمرار المنصة' : 'Support Platform Continuity'}
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">
                   {isRtl ? 'ساعدنا ليبقى الموقع مجانياً!' : 'Help us keep the site free!'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-bold leading-relaxed">
                   {isRtl 
                     ? 'تبرع بسيط يساعدنا على تغطية تكاليف السيرفرات وإضافة مميزات جديدة.' 
                     : 'A small donation helps us cover server costs and add new features.'}
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* SEO Keywords Section - Hidden from regular eye but readable by crawlers */}
      <section className="py-10 px-6 border-t border-gray-100 dark:border-gray-800/50 opacity-30 select-none pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-x-4 gap-y-2 text-center">
          <div className="flex items-center gap-2 mb-2 w-full justify-center opacity-40">
             <Search size={10} />
             <span className="text-[9px] font-black uppercase tracking-widest">{isRtl ? 'الكلمات الأكثر بحثاً' : 'Top Search Queries'}</span>
          </div>
          {(isRtl ? seoTagsAr : seoTagsEn).map((tag, i) => (
            <span key={i} className="text-[10px] font-medium text-slate-400 dark:text-slate-600 lowercase whitespace-nowrap">
              {tag} {i !== (isRtl ? seoTagsAr : seoTagsEn).length - 1 && "•"}
            </span>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 25s linear infinite; }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse { animation: spin-reverse 30s linear infinite; }
      `}</style>
    </div>
  );
};

export default Home;
