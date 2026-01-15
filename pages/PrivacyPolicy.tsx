
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Shield, Eye, Lock, Database, Globe, Info } from 'lucide-react';

interface PrivacyPolicyProps {
  lang: Language;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;

  return (
    <div className={`min-h-screen bg-[#fcfdfe] dark:bg-[#050810] pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      <section className="relative py-20 px-6 bg-blue-600 text-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">{t('privacyPolicy')}</h1>
          <p className="text-blue-100 font-bold opacity-80">{isRtl ? 'كيف نحمي ونعالج بياناتك الشخصية' : 'How we protect and process your personal data'}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white dark:bg-[#0d111b] rounded-[3rem] p-8 md:p-12 shadow-0 border border-gray-100 dark:border-white/5 space-y-12">
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-blue-600">
               <Eye size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '1. البيانات التي نجمعها' : '1. Data We Collect'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'نجمع المعلومات التي تقدمها لنا طواعية عند إنشاء بطاقتك، مثل الاسم، البريد الإلكتروني، أرقام التواصل، وروابط التواصل الاجتماعي. كما نجمع بيانات تقنية مثل عدد الزيارات ونوع الجهاز لتحسين تجربة المستخدم.'
                : 'We collect information you voluntarily provide when creating your card, such as name, email, contact numbers, and social media links. We also collect technical data such as view counts and device types to improve user experience.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-indigo-600">
               <Database size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '2. كيف نستخدم بياناتك' : '2. How We Use Your Data'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'تُستخدم بياناتك لإنشاء وعرض بطاقة هويتك الرقمية للجمهور بناءً على اختيارك. لا نقوم ببيع بياناتك لأي طرف ثالث، ونستخدم بريدك الإلكتروني فقط لإرسال تنبيهات الأمان أو تحديثات الخدمة الهامة.'
                : 'Your data is used to create and display your digital identity card to the public based on your choice. We do not sell your data to any third party, and we only use your email to send security alerts or important service updates.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-emerald-600">
               <Lock size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '3. حماية البيانات' : '3. Data Security'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'نحن نستخدم تقنيات تشفير متقدمة وخدمات Firebase السحابية الآمنة لضمان حماية بياناتك من الوصول غير المصرح به. ومع ذلك، يرجى تذكر أن أي معلومات تضعها في بطاقتك "العامة" ستكون متاحة لمن يملك الرابط.'
                : 'We use advanced encryption technologies and secure Firebase cloud services to ensure your data is protected from unauthorized access. However, please remember that any information you place on your "Public" card will be accessible to anyone with the link.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-amber-600">
               <Globe size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '4. ملفات تعريف الارتباط' : '4. Cookies'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'نستخدم ملفات تعريف الارتباط (Cookies) لحفظ تفضيلاتك (مثل اللغة والمظهر الداكن) وللحفاظ على تسجيل دخولك. يمكنك تعطيلها من إعدادات متصفحك ولكن قد يؤثر ذلك على بعض وظائف الموقع.'
                : 'We use cookies to save your preferences (such as language and dark mode) and to keep you logged in. You can disable them from your browser settings, but this may affect some site functionalities.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-blue-500">
               <Shield size={28} />
               <h2 className="text-2xl font-black">{isRtl ? '5. حقوقك' : '5. Your Rights'}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              {isRtl 
                ? 'لديك الحق الكامل في تعديل بياناتك أو حذف بطاقاتك أو حتى إغلاق حسابك نهائياً في أي وقت من خلال لوحة التحكم. عند حذف الحساب، نقوم بمسح كافة البيانات المرتبطة به من خوادمنا فوراً.'
                : 'You have the full right to edit your data, delete your cards, or even permanently close your account at any time through the dashboard. Upon account deletion, we immediately wipe all associated data from our servers.'}
            </p>
          </div>

          <div className="pt-10 border-t border-gray-100 dark:border-white/5 text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
               {isRtl 
                 ? 'آخر تحديث: مايو 2025' 
                 : 'Last Updated: May 2025'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
