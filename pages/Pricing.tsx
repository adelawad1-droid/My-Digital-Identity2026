
import React, { useEffect, useState } from 'react';
import { Language, PricingPlan } from '../types';
import { TRANSLATIONS } from '../constants';
import { getAllPricingPlans, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Crown, Star, ShieldCheck, Zap, ArrowRight, 
  Sparkles, Shield, Rocket, CreditCard, Lock, HelpCircle,
  ChevronDown, ArrowLeft
} from 'lucide-react';

interface PricingProps {
  lang: Language;
}

const Pricing: React.FC<PricingProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPricingPlans().then(data => {
      setPlans(data.filter(p => p.isActive));
      setLoading(false);
    });
  }, []);

  const handleSubscribe = (plan: PricingPlan) => {
    if (!auth.currentUser) {
      navigate(`/${lang}/login`); 
      return;
    }

    if (plan.stripeLink) {
      const userId = auth.currentUser.uid;
      const checkoutUrl = `${plan.stripeLink}?client_reference_id=${userId}`;
      window.open(checkoutUrl, '_blank');
    }
  };

  const faqs = isRtl ? [
    { q: "كيف يتم تفعيل الباقة؟", a: "يتم التفعيل تلقائياً فور إتمام عملية الدفع عبر Stripe." },
    { q: "هل يمكنني إلغاء الاشتراك؟", a: "نعم، يمكنك إلغاء تجديد الاشتراك في أي وقت من إعدادات حسابك." },
    { q: "هل السعر شامل ضريبة القيمة المضافة؟", a: "نعم، السعر الظاهر هو السعر النهائي للاشتراك السنوي." }
  ] : [
    { q: "How is the plan activated?", a: "Activation is automatic immediately after completing the payment via Stripe." },
    { q: "Can I cancel my subscription?", a: "Yes, you can cancel the subscription renewal at any time from your account settings." },
    { q: "Is the price inclusive of VAT?", a: "Yes, the displayed price is the final price for the annual subscription." }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{isRtl ? 'جاري تحميل الأسعار...' : 'Loading Prices...'}</p>
    </div>
  );

  // نستخدم أول باقة نشطة كباقة رئيسية لعرضها بشكل مميز
  const mainPlan = plans[0];
  const activeFeatures = isRtl ? mainPlan?.featuresAr : mainPlan?.featuresEn;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full border border-blue-100 dark:border-blue-900/30">
          <Zap size={16} />
          <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'استمر في هويتك الرقمية' : 'CONTINUE YOUR DIGITAL JOURNEY'}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter">
          {isRtl ? 'باقة واحدة، مميزات لا محدودة' : 'One Plan, Unlimited Possibilities'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed">
          {isRtl 
            ? 'باقة واحدة، اشتراك سنوي واحد، ومميزات لا محدودة لتجعل حضورك الرقمي استثنائياً.' 
            : 'One plan, one annual subscription, and unlimited features to make your digital presence exceptional.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
        
        {/* Left Section: Features List */}
        <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeFeatures || []).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 bg-white dark:bg-[#0d111b] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm group hover:border-blue-500 transition-all duration-300">
                <div className="mt-1 p-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Check size={14} strokeWidth={4} />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[3rem] border border-blue-100 dark:border-blue-900/20 flex flex-col md:flex-row items-center gap-6">
             <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-blue-600 shrink-0">
                <ShieldCheck size={32} />
             </div>
             <div className="text-center md:text-start">
                <h4 className="font-black dark:text-white uppercase tracking-tighter text-lg">{isRtl ? 'دفع آمن ومضمون' : 'Safe & Secure Payment'}</h4>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                  {isRtl ? 'نستخدم تقنيات Stripe العالمية لضمان حماية بياناتك البنكية بالكامل.' : 'We use global Stripe technology to ensure your banking data is fully protected.'}
                </p>
             </div>
          </div>
        </div>

        {/* Right Section: Price Card */}
        <div className="lg:col-span-5 order-1 lg:order-2 sticky top-32">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 rounded-[4rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-[#0a0a0c] p-10 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-white/5 shadow-2xl flex flex-col">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? mainPlan?.nameAr : mainPlan?.nameEn}</h3>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">{isRtl ? mainPlan?.billingCycleAr : mainPlan?.billingCycleEn}</p>
                 </div>
                 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-3xl shadow-sm">
                    <Sparkles size={28} />
                 </div>
              </div>

              <div className="flex flex-col gap-2 mb-12">
                 <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'سنوياً' : 'YEARLY'} /</span>
                    <span className="text-7xl font-black dark:text-white tracking-tighter">${mainPlan?.price}</span>
                 </div>
                 {mainPlan?.originalPrice && (
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg text-[9px] font-black uppercase">{isRtl ? 'خصم خاص' : 'SPECIAL DISCOUNT'}</span>
                       <span className="text-2xl text-gray-300 dark:text-gray-600 line-through font-bold">${mainPlan.originalPrice}</span>
                    </div>
                 )}
              </div>

              <button 
                onClick={() => mainPlan ? handleSubscribe(mainPlan) : null}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_50px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 group/btn overflow-hidden relative"
              >
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                 <span className="relative z-10">{isRtl ? (mainPlan?.buttonTextAr || 'اشترك الآن وفعل حسابك') : (mainPlan?.buttonTextEn || 'Subscribe & Activate')}</span>
                 <ArrowRight size={22} className={`relative z-10 transition-transform ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-2' : 'group-hover/btn:translate-x-2'}`} />
              </button>

              <div className="mt-10 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                 <CreditCard size={24} />
                 <Lock size={24} />
                 <Shield size={24} />
              </div>
              
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8">
                {isRtl ? 'ضمان استعادة الأموال خلال 14 يوم' : '14-Day Money Back Guarantee'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-32 max-w-4xl mx-auto space-y-12">
         <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto text-gray-400"><HelpCircle size={24}/></div>
            <h2 className="text-3xl md:text-4xl font-black dark:text-white uppercase tracking-tight">{isRtl ? 'الأسئلة الشائعة' : 'Common Questions'}</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{isRtl ? 'كل ما تحتاج لمعرفته حول الاشتراك' : 'Everything you need to know about sub'}</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-10 bg-white dark:bg-[#0d111b] rounded-[3rem] border border-gray-100 dark:border-white/5 space-y-4 shadow-sm hover:shadow-xl transition-all duration-500">
                 <h4 className="font-black dark:text-white text-xl leading-tight">{faq.q}</h4>
                 <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Pricing;
