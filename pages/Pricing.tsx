
import React, { useEffect, useState } from 'react';
import { Language, PricingPlan } from '../types';
import { TRANSLATIONS } from '../constants';
import { getAllPricingPlans } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Crown, Star, ShieldCheck, Zap, ArrowRight, 
  Sparkles, Shield, Rocket, CreditCard, Lock, HelpCircle,
  ChevronDown
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
      // نأخذ أول باقة مفعلة فقط لأن المستخدم طلب باقة واحدة سنوية
      setPlans(data.filter(p => p.isActive));
      setLoading(false);
    });
  }, []);

  const features = isRtl ? [
    "وصول كامل للمحرر المتقدم (ألوان، تدرجات، أنماط زجاجية)",
    "نظام العضويات والاشتراكات الذكي",
    "قسم المناسبات مع عد تنازلي تفاعلي",
    "وسام التوثيق الرسمي (Verified Badge)",
    "نجوم التميز تحت الاسم",
    "روابط الصور المتقدمة للعروض والمنتجات",
    "إطار ذهبي ملكي للبطاقة",
    "دعم فني ذو أولوية 24/7"
  ] : [
    "Full Advanced Editor Access (Colors, Gradients, Glassy)",
    "Smart Membership & Subscription System",
    "Occasions Section with Interactive Countdown",
    "Official Verified Badge",
    "Excellence Stars under name",
    "Advanced Image Links for Products/Offers",
    "Royal Golden Card Frame",
    "24/7 Priority Support"
  ];

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  const mainPlan = plans[0]; // نفترض أن الباقة الأولى هي السنوية المقصودة

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full border border-amber-100 dark:border-amber-800/30">
          <Crown size={16} />
          <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'باقة الاحتراف الموحدة' : 'Unified Pro Plan'}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter">
          {isRtl ? 'استثمر في هويتك الرقمية' : 'Invest in Your Digital Identity'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed">
          {isRtl 
            ? 'باقة واحدة، اشتراك سنوي واحد، ومميزات لا محدودة لتجعل حضورك الرقمي استثنائياً.' 
            : 'One plan, one annual subscription, and unlimited features to make your digital presence exceptional.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* مميزات الباقة */}
        <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-blue-500 transition-colors">
                <div className="mt-1 p-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Check size={14} strokeWidth={4} />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[3rem] border border-blue-100 dark:border-blue-800/30 flex items-center gap-6">
             <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-blue-600">
                <ShieldCheck size={32} />
             </div>
             <div>
                <h4 className="font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'دفع آمن ومضمون' : 'Safe & Secure Payment'}</h4>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                  {isRtl ? 'نستخدم تقنيات Stripe العالمية لضمان حماية بياناتك البنكية بالكامل.' : 'We use global Stripe technology to ensure your banking data is fully protected.'}
                </p>
             </div>
          </div>
        </div>

        {/* بطاقة الاشتراك */}
        <div className="lg:col-span-5 order-1 lg:order-2 sticky top-32">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-amber-500 to-indigo-600 rounded-[3.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-[#0a0a0c] p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-3xl font-black dark:text-white">{isRtl ? mainPlan?.nameAr : mainPlan?.nameEn}</h3>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">{isRtl ? 'اشتراك سنوي' : 'Annual Subscription'}</p>
                 </div>
                 <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                    <Sparkles size={24} />
                 </div>
              </div>

              <div className="flex items-baseline gap-2 mb-10">
                 <span className="text-6xl font-black dark:text-white tracking-tighter">${mainPlan?.price || '29'}</span>
                 <span className="text-gray-400 font-black uppercase text-xs">/ {isRtl ? 'سنوياً' : 'YEARLY'}</span>
              </div>

              <button 
                onClick={() => mainPlan?.stripeLink ? window.open(mainPlan.stripeLink, '_blank') : null}
                className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-lg uppercase shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group/btn overflow-hidden relative"
              >
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                 <span className="relative z-10">{isRtl ? 'اشترك الآن وفعل حسابك' : 'Subscribe & Activate'}</span>
                 <ArrowRight size={20} className={`relative z-10 transition-transform ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-2' : 'group-hover/btn:translate-x-2'}`} />
              </button>

              <div className="mt-8 flex items-center justify-center gap-4 grayscale opacity-40">
                 <CreditCard size={20} />
                 <Lock size={20} />
                 <Shield size={20} />
              </div>
              
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">
                {isRtl ? 'ضمان استعادة الأموال خلال 14 يوم' : '14-Day Money Back Guarantee'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mt-32 max-w-4xl mx-auto space-y-10">
         <div className="text-center space-y-3">
            <h2 className="text-3xl font-black dark:text-white">{isRtl ? 'الأسئلة الشائعة' : 'Common Questions'}</h2>
            <p className="text-gray-400 font-bold">{isRtl ? 'كل ما تحتاج لمعرفته حول الاشتراك' : 'Everything you need to know about sub'}</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-8 bg-gray-50 dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-3">
                 <h4 className="font-black dark:text-white text-lg leading-tight">{faq.q}</h4>
                 <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Pricing;
