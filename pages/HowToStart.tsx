
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Zap, MessageCircle, Link, LayoutDashboard, ShieldCheck, 
  ArrowRight, CreditCard, Sparkles, Wand2, Star, CheckCircle2,
  Package, LayoutGrid, Heart, Coffee, Palette, Settings2,
  Lock, Unlock, ChevronRight, UserPlus, FileEdit, MonitorDot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HowToStartProps {
  lang: Language;
}

const HowToStart: React.FC<HowToStartProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;

  const plansComparison = [
    {
      title: isRtl ? 'الباقة المجانية (الأساسية)' : 'Free Basic Plan',
      desc: isRtl ? 'تصفح واستخدم كافة القوالب المتاحة. تتيح لك تعديل اسمك ونصوصك وروابطك، ولكن دون إمكانية تغيير الألوان أو التنسيقات البصرية للقالب.' : 'Browse and use all available templates. You can edit your name, bio, and links, but visual styling like colors and layout parameters are fixed.',
      icon: Lock,
      color: 'bg-blue-50 text-blue-600',
      tag: isRtl ? 'للمبتدئين' : 'Starter'
    },
    {
      title: isRtl ? 'الباقة السنوية (المحترفين)' : 'Yearly Pro Plan',
      desc: isRtl ? 'تحكم كامل في مختبر الألوان، الأبعاد، وتعديل إزاحة العناصر. تشمل نظام العضويات والعد التنازلي مع إمكانية طلب قوالب حصرية لحسابك.' : 'Full control over the Color Lab, dimensions, and element displacements. Includes membership systems, countdowns, and the option to request private designs.',
      icon: Unlock,
      color: 'bg-amber-50 text-amber-600',
      tag: isRtl ? 'الأكثر طلباً' : 'Best Value'
    }
  ];

  const steps = [
    {
      title: isRtl ? '1. اختر قالبك المفضل' : '1. Choose Your Template',
      desc: isRtl ? 'ابدأ بتصفح مكتبة القوالب الفاخرة واختر النمط الذي يناسب هويتك المهنية أو مناسبتك.' : 'Start by browsing our premium template library and select the style that fits your professional identity or event.',
      icon: LayoutGrid,
      stepColor: 'border-blue-600 text-blue-600'
    },
    {
      title: isRtl ? '2. التخصيص أو الترقية' : '2. Personalize or Upgrade',
      desc: isRtl ? 'أضف بياناتك مجاناً، أو قم بالترقية للباقة السنوية لفتح "مختبر التصميم" وتغيير كافة تفاصيل المظهر بمرونة.' : 'Add your info for free, or upgrade to the Yearly Plan to unlock the "Design Lab" and customize every visual detail flexibly.',
      icon: Settings2,
      stepColor: 'border-indigo-600 text-indigo-600'
    },
    {
      title: isRtl ? '3. انطلق بلوحة تحكمك' : '3. Launch Your Dashboard',
      desc: isRtl ? 'بمجرد الحفظ، ستمتلك لوحة تحكم ذكية تمكنك من تحديث بياناتك ومتابعة عدد الزيارات لهويتك لحظياً.' : 'Once saved, you\'ll have a smart dashboard where you can update your data and track your identity views in real-time.',
      icon: LayoutDashboard,
      stepColor: 'border-emerald-600 text-emerald-600'
    }
  ];

  return (
    <div className={`min-h-screen bg-[#fcfdfe] dark:bg-[#050810] pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Header Section */}
      <section className="relative py-24 md:py-40 px-6 overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 opacity-100"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
             <Sparkles size={14} className="text-white animate-pulse" />
             <span className="text-[10px] font-black text-blue-50 uppercase tracking-widest">
                {isRtl ? 'دليل الانطلاق' : 'YOUR GETTING STARTED GUIDE'}
             </span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
             {isRtl ? 'كيف تعمل منصة ' : 'How '}
             <span className="text-blue-100">NextID</span>
             {isRtl ? '' : ' Works'}
          </h1>
          
          <p className="text-blue-50 text-lg md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed opacity-90">
             {isRtl 
               ? 'بوابتك السهلة لامتلاك هوية رقمية ذكية. اختر بين البقاء في الوضع الأساسي المجاني أو الانطلاق في مختبر التصميم المتقدم.' 
               : 'Your easy gateway to owning a smart digital identity. Choose between staying in the free basic mode or launching into the advanced design lab.'}
          </p>
        </div>
      </section>

      {/* Plans Comparison Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {plansComparison.map((plan, idx) => (
             <div key={idx} className="bg-white dark:bg-[#0d111b] p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} p-10 opacity-[0.03] group-hover:scale-110 transition-transform`}>
                   <plan.icon size={150} />
                </div>
                <div className="flex justify-between items-start mb-8">
                   <div className={`w-16 h-16 rounded-[1.5rem] ${plan.color} flex items-center justify-center shadow-sm`}>
                      <plan.icon size={32} />
                   </div>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-600 animate-pulse'}`}>
                      {plan.tag}
                   </span>
                </div>
                <h3 className="text-3xl font-black mb-4 dark:text-white leading-none">{plan.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-sm md:text-base">
                   {plan.desc}
                </p>
             </div>
           ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
         <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter">{isRtl ? 'رحلة التحول الرقمي' : 'Digital Journey Steps'}</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{isRtl ? 'ثلاث خطوات بسيطة فقط' : 'Just three simple steps'}</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            <div className="hidden lg:block absolute top-12 left-0 w-full h-px border-t-2 border-dashed border-gray-100 dark:border-white/5 -z-0"></div>
            
            {steps.map((step, idx) => (
               <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-6 animate-fade-in-up" style={{ animationDelay: `${idx * 200}ms` }}>
                  <div className={`w-24 h-24 rounded-[2.5rem] border-[6px] ${step.stepColor} bg-white dark:bg-[#0a0a0c] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 hover:rotate-6`}>
                     <step.icon size={36} />
                  </div>
                  <div className="space-y-4 px-4">
                     <h4 className="text-2xl font-black dark:text-white leading-tight">{step.title}</h4>
                     <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{step.desc}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Call to Action - Special Requests */}
      <section className="max-w-7xl mx-auto px-6 py-12">
         <div className="bg-slate-900 rounded-[4rem] p-10 md:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
            
            <div className="flex-1 space-y-8 relative z-10 text-center lg:text-start">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-[10px] font-black uppercase text-blue-400 border border-blue-500/20">
                  <Star size={12} fill="currentColor" /> {isRtl ? 'طلبات الشركات والجهات' : 'CORPORATE REQUESTS'}
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                  {isRtl ? 'هل تبحث عن تصميم خاص لفريقك؟' : 'Need a Custom Design for Your Team?'}
               </h2>
               <p className="text-lg text-gray-400 font-bold leading-relaxed">
                  {isRtl 
                    ? 'للمشتركين في الباقة السنوية، نقدم خدمة التصميم الخاص (Custom Templates). فريقنا جاهز لبناء قالب حصري يطابق هويتك البصرية بدقة متناهية.' 
                    : 'For Yearly Plan subscribers, we offer Custom Design services. Our team is ready to build an exclusive template that perfectly matches your brand identity.'}
               </p>
               <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={() => navigate(`/${lang}/custom-orders`)}
                    className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-blue-500 transition-all flex items-center gap-3 group"
                  >
                     {isRtl ? 'اطلب تصميمك الآن' : 'Request Your Design'}
                     <ArrowRight size={18} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
                  </button>
                  <button 
                    onClick={() => navigate(`/${lang}/pricing`)}
                    className="px-12 py-5 bg-transparent text-white border border-white/20 rounded-2xl font-black text-sm uppercase hover:bg-white/5 transition-all"
                  >
                     {isRtl ? 'عرض تفاصيل الباقة' : 'View Plan Details'}
                  </button>
               </div>
            </div>

            <div className="flex-1 relative w-full hidden lg:block">
               <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] border border-white/10 shadow-2xl p-10 flex flex-col justify-center gap-6 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Palette size={24}/></div>
                     <div className="space-y-2">
                        <div className="h-2.5 w-40 bg-white/20 rounded-full"></div>
                        <div className="h-2 w-24 bg-white/10 rounded-full"></div>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="h-2 w-full bg-white/5 rounded-full"></div>
                     <div className="h-2 w-full bg-white/5 rounded-full"></div>
                     <div className="h-2 w-2/3 bg-white/5 rounded-full"></div>
                  </div>
                  <div className="flex gap-3">
                     <div className="flex-1 h-12 bg-white/5 rounded-xl border border-white/5"></div>
                     <div className="flex-1 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"></div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Final Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-12">
         <div className="space-y-4">
            <h2 className="text-4xl md:text-7xl font-black dark:text-white tracking-tighter">{isRtl ? 'جاهز للانطلاق؟' : 'Ready to Start?'}</h2>
            <p className="text-gray-400 font-bold text-lg">{isRtl ? 'اختر القالب وابدأ ببناء حضورك الرقمي الآن.' : 'Select a template and start building your digital presence now.'}</p>
         </div>
         <div className="flex items-center justify-center">
            <button 
              onClick={() => navigate(`/${lang}/templates`)}
              className="group relative px-16 py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl shadow-[0_20px_60px_-10px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               <LayoutGrid size={26} className="group-hover:rotate-12 transition-transform" />
               <span>{isRtl ? 'تصفح كافة القوالب' : 'Explore All Templates'}</span>
               <ArrowRight size={24} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </button>
         </div>
      </section>

    </div>
  );
};

export default HowToStart;
