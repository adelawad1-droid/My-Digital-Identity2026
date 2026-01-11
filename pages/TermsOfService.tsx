
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, FileText, Scale, UserCheck, AlertTriangle } from 'lucide-react';

interface TermsOfServiceProps {
  lang: Language;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;

  return (
    <div className={`min-h-screen bg-[#fcfdfe] dark:bg-[#050810] pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      <section className="relative py-20 px-6 bg-blue-600 text-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">{t('termsOfService')}</h1>
          <p className="text-blue-100 font-bold opacity-80">{isRtl ? 'اتفاقية الاستخدام والقواعد العامة للمنصة' : 'Usage agreement and platform general rules'}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white dark:bg-[#0d111b] rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-white/5 space-y-12">
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-blue-600">
               <ShieldCheck size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '1. قبول الشروط' : '1. Acceptance of Terms'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'باستخدامك لمنصة "هويتي الرقمية"، فإنك توافق تماماً على الالتزام بهذه الشروط والقوانين المعمول بها. إذا كنت لا توافق على أي جزء منها، يرجى التوقف عن استخدام المنصة.'
                : 'By using the "NextID" platform, you fully agree to be bound by these terms and applicable laws. If you do not agree with any part of them, please stop using the platform.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-indigo-600">
               <UserCheck size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '2. حسابات المستخدمين' : '2. User Accounts'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن كافة الأنشطة التي تحدث تحته. كما تلتزم بتقديم معلومات دقيقة وصحيحة عند التسجيل أو إنشاء بطاقتك الرقمية.'
                : 'You are responsible for maintaining the confidentiality of your account data and for all activities that occur under it. You also commit to providing accurate and correct information when registering or creating your digital card.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-emerald-600">
               <FileText size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '3. المحتوى المسموح به' : '3. Permitted Content'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'يُمنع منعاً باتاً نشر أي محتوى يروج للعنف، التمييز، المحتوى الإباحي، أو أي مواد تخالف الشريعة الإسلامية أو القوانين الدولية والمحلية. يحق للإدارة حذف أي بطاقة أو حساب يخالف هذا البند دون سابق إنذار.'
                : 'It is strictly forbidden to post any content that promotes violence, discrimination, pornography, or any materials that violate Islamic law or international and local laws. The administration reserves the right to delete any card or account that violates this clause without prior notice.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-amber-600">
               <Scale size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '4. الرسوم والاشتراكات' : '4. Fees and Subscriptions'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'تتوفر بعض المميزات مجاناً، بينما تتطلب المميزات المتقدمة اشتراكاً مدفوعاً. الرسوم غير قابلة للاسترداد بعد تفعيل الخدمة إلا في حالات استثنائية تقررها الإدارة خلال أول 14 يوماً.'
                : 'Some features are available for free, while advanced features require a paid subscription. Fees are non-refundable after service activation except in exceptional cases decided by management within the first 14 days.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-red-600">
               <AlertTriangle size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '5. إخلاء المسؤولية' : '5. Limitation of Liability'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'يتم تقديم المنصة "كما هي" دون أي ضمانات. نحن غير مسؤولين عن أي أضرار ناتجة عن استخدام المنصة أو فقدان البيانات أو تعطل الروابط نتيجة سوء الاستخدام.'
                : 'The platform is provided "as is" without any warranties. We are not responsible for any damages resulting from the use of the platform, loss of data, or link failure due to misuse.'}
            </p>
          </div>

          <div className="pt-10 border-t border-gray-100 dark:border-white/5 text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
               {isRtl 
                 ? 'تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت، وسيتم إخطار المستخدمين بأي تغييرات جوهرية.' 
                 : 'The platform reserves the right to modify these terms at any time, and users will be notified of any material changes.'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
