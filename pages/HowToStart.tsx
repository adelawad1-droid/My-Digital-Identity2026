
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Zap, MessageCircle, Link, LayoutDashboard, ShieldCheck, 
  ArrowRight, CreditCard, Sparkles, Wand2, Star, CheckCircle2,
  Package, LayoutGrid, Heart, Coffee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HowToStartProps {
  lang: Language;
}

const HowToStart: React.FC<HowToStartProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;

  const cardTypes = [
    {
      title: isRtl ? 'بطاقات عامة مجانية' : 'Free General Cards',
      desc: isRtl ? 'قوالب أساسية متاحة للجميع بدون تكلفة، مثالية للبدء في عصر الرقمنة.' : 'Basic templates available for everyone at no cost, perfect for starting your digital journey.',
      icon: LayoutGrid,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: isRtl ? 'عضويات ومناسبات' : 'Memberships & Events',
      desc: isRtl ? 'بطاقات متقدمة بأسعار رمزية تشمل نظام اشتراك، خرائط، وعد تنازلي.' : 'Advanced cards at symbolic prices including subscription systems, maps, and countdowns.',
      icon: Package,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const steps = [
    {
      title: isRtl ? '1. تواصل معنا للتصميم' : '1. Contact for Design',
      desc: isRtl ? 'أخبرنا عن نوع بطاقتك المفضلة وسيقوم فريقنا بتجهيز تصميم خاص بك.' : 'Tell us your preferred card type and our team will prepare a custom design for you.',
      icon: MessageCircle,
      stepColor: 'border-blue-600 text-blue-600'
    },
    {
      title: isRtl ? '2. استلام رابط الباقة' : '2. Receive Package Link',
      desc: isRtl ? 'بعد الاعتماد، سنرسل لك رابطاً يضم كافة مميزات الباقة المختارة لتفعيلها.' : 'After approval, we\'ll send you a link containing all the features of your selected package.',
      icon: Link,
      stepColor: 'border-indigo-600 text-indigo-600'
    },
    {
      title: isRtl ? '3. لوحة التحكم الأنيقة' : '3. Elegant Dashboard',
      desc: isRtl ? 'ستحصل على حساب خاص بلوحة تحكم متطورة لإدارة وتحديث بياناتك في أي وقت.' : 'Get a private account with a sophisticated dashboard to manage and update your data anytime.',
      icon: LayoutDashboard,
      stepColor: 'border-emerald-600 text-emerald-600'
    }
  ];

  return (
    <div className={`min-h-screen bg-[#fcfdfe] dark:bg-[#050810] pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Header Section - Background matches Logo Color */}
      <section className="relative py-24 md:py-40 px-6 overflow-hidden bg-blue-600">
        {/* Decorative background effects for aesthetics */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 opacity-100"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
             <Sparkles size={14} className="text-white animate-pulse" />
             <span className="text-[10px] font-black text-blue-50 uppercase tracking-widest">
                {isRtl ? 'دليلك للبدء' : 'YOUR STARTING GUIDE'}
             </span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
             {isRtl ? 'كيف تبدأ مع ' : 'How to Start with '}
             <span className="text-blue-100">NextID</span>
          </h1>
          
          <p className="text-blue-50 text-lg md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed opacity-90">
             {isRtl 
               ? 'تعرف على عالم الهوية الرقمية المتكامل، من البطاقات المجانية وحتى الحلول المخصصة للأعمال والمناسبات.' 
               : 'Explore the world of integrated digital identity, from free cards to custom business and event solutions.'}
          </p>
        </div>
      </section>

      {/* Card Types Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {cardTypes.map((type, idx) => (
             <div key={idx} className="bg-white dark:bg-[#0d111b] p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-500 group">
                <div className={`w-16 h-16 rounded-[1.5rem] ${type.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                   <type.icon size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 dark:text-white">{type.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{type.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
         <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-black dark:text-white">{isRtl ? 'طريقة العمل' : 'How It Works'}</h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto mt-6"></div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Connector lines for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px border-t-2 border-dashed border-gray-100 dark:border-white/5 -z-0"></div>
            
            {steps.map((step, idx) => (
               <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-6 animate-fade-in-up" style={{ animationDelay: `${idx * 200}ms` }}>
                  <div className={`w-24 h-24 rounded-full border-[6px] ${step.stepColor} bg-white dark:bg-gray-900 flex items-center justify-center shadow-2xl transition-transform hover:scale-110`}>
                     <step.icon size={40} />
                  </div>
                  <div className="space-y-3 px-4">
                     <h4 className="text-xl font-black dark:text-white">{step.title}</h4>
                     <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{step.desc}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Dashboard Feature Focus */}
      <section className="max-w-7xl mx-auto px-6 py-12">
         <div className="bg-slate-900 rounded-[4rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
            
            <div className="flex-1 space-y-8 relative z-10 text-center lg:text-start">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase text-blue-400 border border-white/5">
                  <Wand2 size={12} /> {isRtl ? 'مميزات الحساب' : 'ACCOUNT FEATURES'}
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  {isRtl ? 'لوحة تحكم ذكية وإدارة مرنة' : 'Smart Dashboard & Flexible Management'}
               </h2>
               <ul className="space-y-4">
                  {[
                    isRtl ? 'إحصائيات فورية لعدد الزيارات' : 'Real-time visit statistics',
                    isRtl ? 'تحديث البيانات بلمسة واحدة' : 'One-tap data updates',
                    isRtl ? 'تغيير القوالب والألوان بسهولة' : 'Easy template and color switching',
                    isRtl ? 'إدارة روابط التواصل والمحتوى' : 'Manage social links and content'
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-400 font-bold justify-center lg:justify-start">
                       <CheckCircle2 size={18} className="text-emerald-500" />
                       {feat}
                    </li>
                  ))}
               </ul>
            </div>

            <div className="flex-1 relative w-full max-w-lg aspect-square lg:aspect-auto h-[400px]">
               <div className="absolute inset-0 bg-blue-500/20 rounded-[3rem] blur-3xl animate-pulse"></div>
               <div className="relative h-full w-full bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 shadow-2xl p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-xl"></div>
                     <div className="space-y-2">
                        <div className="h-2 w-32 bg-white/20 rounded-full"></div>
                        <div className="h-2 w-20 bg-white/10 rounded-full"></div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
                     <div className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
                  </div>
                  <div className="h-24 bg-blue-600/20 rounded-2xl border border-blue-500/20"></div>
               </div>
            </div>
         </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-12">
         <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black dark:text-white">{isRtl ? 'ابدأ هويتك الرقمية اليوم' : 'Launch Your Identity Today'}</h2>
            <p className="text-gray-400 font-bold">{isRtl ? 'فريقنا جاهز لمساعدتك في كل خطوة.' : 'Our team is ready to help you every step of the way.'}</p>
         </div>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate(`/${lang}/custom-orders`)}
              className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
               {isRtl ? 'اطلب بطاقتك الآن' : 'Order Your Card'}
               <ArrowRight size={22} className={isRtl ? 'rotate-180' : ''} />
            </button>
            <a 
              href="mailto:info@nextid.my" 
              className="px-12 py-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-[2.5rem] font-black text-lg hover:bg-gray-200 transition-all"
            >
               {isRtl ? 'تحدث معنا' : 'Chat with Us'}
            </a>
         </div>
         <div className="flex items-center justify-center gap-8 opacity-40 grayscale">
            <div className="flex items-center gap-2"><CreditCard size={20}/> <span className="font-black text-xs uppercase">Pay Smart</span></div>
            <div className="flex items-center gap-2"><ShieldCheck size={20}/> <span className="font-black text-xs uppercase">Verified</span></div>
            <div className="flex items-center gap-2"><Heart size={20}/> <span className="font-black text-xs uppercase">Premium</span></div>
         </div>
      </section>

    </div>
  );
};

export default HowToStart;
