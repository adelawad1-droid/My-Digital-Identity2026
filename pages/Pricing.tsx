
import React, { useEffect, useState } from 'react';
import { Language, PricingPlan } from '../types';
import { TRANSLATIONS } from '../constants';
import { getAllPricingPlans, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Crown, Star, ShieldCheck, Zap, ArrowRight, 
  Sparkles, Shield, Rocket, CreditCard, Lock, HelpCircle,
  ChevronDown, ArrowLeft, Loader2
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
      setPlans(data.filter(p => p.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    });
  }, []);

  const handleSubscribe = (plan: PricingPlan) => {
    if (!auth.currentUser) {
      // توجيه لصفحة تسجيل الدخول إذا لم يكن مسجلاً
      navigate(`/${lang}/login`); 
      return;
    }

    if (plan.stripeLink) {
      const userId = auth.currentUser.uid;
      const planId = plan.id;
      
      // بناء الرابط مع تمرير المعرفات لسترايب
      // client_reference_id: يستخدمه سترايب لربط العملية بالمستخدم
      // نستخدم URLSearchParams لضمان دقة بناء الرابط
      try {
        const stripeUrl = new URL(plan.stripeLink);
        stripeUrl.searchParams.set('client_reference_id', userId);
        
        // ملاحظة: تأكد من ضبط رابط العودة (Return URL) في إعدادات Stripe Payment Link 
        // ليكون: https://nextid.my/account?payment=success&planId=HERE_USE_PLAN_ID
        
        window.location.href = stripeUrl.toString();
      } catch (e) {
        // Fallback في حال كان الرابط نصياً بسيطاً
        const separator = plan.stripeLink.includes('?') ? '&' : '?';
        window.location.href = `${plan.stripeLink}${separator}client_reference_id=${userId}`;
      }
    }
  };

  const faqs = isRtl ? [
    { q: "كيف يتم تفعيل الباقة؟", a: "يتم التفعيل تلقائياً فور إتمام عملية الدفع والعودة لصفحة حسابك." },
    { q: "هل يمكنني إلغاء الاشتراك؟", a: "نعم، يمكنك إلغاء تجديد الاشتراك في أي وقت من إعدادات حسابك عبر بوابة سترايب." },
    { q: "هل الدفع آمن؟", a: "نعم، يتم الدفع عبر منصة Stripe العالمية، نحن لا نطلع على بيانات بطاقتك أبداً." }
  ] : [
    { q: "How is the plan activated?", a: "Activation is automatic once payment is complete and you return to your account." },
    { q: "Can I cancel my subscription?", a: "Yes, you can manage and cancel your subscription anytime via Stripe portal." },
    { q: "Is payment secure?", a: "Yes, payments are processed by Stripe. We never see or store your card details." }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{isRtl ? 'جاري تحميل الأسعار...' : 'Loading Prices...'}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full border border-blue-100 dark:border-blue-900/30">
          <Zap size={16} />
          <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'بوابتك للاحتراف الرقمي' : 'YOUR GATEWAY TO DIGITAL PRO'}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter">
          {isRtl ? 'باقات مرنة لكل احتياجاتك' : 'Flexible Plans For Your Needs'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed">
          {isRtl 
            ? 'اختر الباقة المناسبة لك وابدأ بتخصيص هويتك الرقمية بأدوات متقدمة وحصرية.' 
            : 'Choose the right plan for you and start customizing your digital identity with advanced, exclusive tools.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative group flex flex-col h-full`}>
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                {isRtl ? 'الأكثر طلباً' : 'Most Popular'}
              </div>
            )}
            <div className={`relative flex-1 bg-white dark:bg-[#0a0a0c] p-8 md:p-10 rounded-[3.5rem] border ${plan.isPopular ? 'border-amber-500/50 shadow-amber-500/5 ring-4 ring-amber-500/5' : 'border-gray-100 dark:border-white/5'} shadow-0 flex flex-col transition-all duration-500 hover:-translate-y-2`}>
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? plan.nameAr : plan.nameEn}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{isRtl ? plan.billingCycleAr : plan.billingCycleEn}</p>
                 </div>
                 <div className={`p-3 rounded-2xl shadow-sm ${plan.isPopular ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'}`}>
                    <Sparkles size={24} />
                 </div>
              </div>

              <div className="flex flex-col gap-1 mb-8">
                 <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black dark:text-white tracking-tighter">${plan.price}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ {isRtl ? plan.billingCycleAr : plan.billingCycleEn}</span>
                 </div>
                 {plan.originalPrice && (
                    <div className="flex items-center gap-2">
                       <span className="text-xl text-gray-300 dark:text-gray-600 line-through font-bold">${plan.originalPrice}</span>
                    </div>
                 )}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                 {(isRtl ? plan.featuresAr : plan.featuresEn).map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                       <div className="mt-1 shrink-0 p-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-md">
                          <Check size={12} strokeWidth={4} />
                       </div>
                       <span className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-tight">{feature}</span>
                    </div>
                 ))}
              </div>

              <button 
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn overflow-hidden relative ${plan.isPopular ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}
              >
                 <span className="relative z-10">{isRtl ? (plan.buttonTextAr || 'اشترك الآن') : (plan.buttonTextEn || 'Subscribe Now')}</span>
                 <ArrowRight size={18} className={`relative z-10 transition-transform ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 bg-gray-50/50 dark:bg-blue-900/5 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
         <div className="p-5 bg-white dark:bg-gray-800 rounded-3xl shadow-sm text-blue-600 shrink-0">
            <ShieldCheck size={40} />
         </div>
         <div className="text-center md:text-start flex-1">
            <h4 className="font-black dark:text-white uppercase tracking-tighter text-xl mb-2">{isRtl ? 'مدفوعات آمنة تماماً' : '100% Secure Payments'}</h4>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              {isRtl 
                ? 'نحن نستخدم Stripe لمعالجة كافة المدفوعات. جميع بياناتك مشفرة ولا يتم تخزين أي معلومات بنكية على خوادمنا نهائياً.' 
                : 'We use Stripe for all payment processing. All your data is encrypted and no banking information is ever stored on our servers.'}
            </p>
         </div>
      </div>

      <div className="mt-32 max-w-4xl mx-auto space-y-12">
         <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto text-gray-400"><HelpCircle size={24}/></div>
            <h2 className="text-3xl md:text-4xl font-black dark:text-white uppercase tracking-tight">{isRtl ? 'الأسئلة الشائعة' : 'Common Questions'}</h2>
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

export default Pricing;
