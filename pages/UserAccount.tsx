
import React, { useState, useEffect } from 'react';
import { auth, updateUserSecurity, getAuthErrorMessage, getUserProfile, getAllPricingPlans, updateUserSubscription } from '../services/firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { Language, PricingPlan } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Lock, Mail, ShieldCheck, Key, Loader2, 
  AlertTriangle, CheckCircle2, UserCircle, LogOut, Trash2, X,
  Crown, Star, Sparkles, Zap, ArrowUpRight, Calendar, Clock, Check, Shield,
  ExternalLink, CreditCard, PartyPopper
} from 'lucide-react';

interface UserAccountProps {
  lang: Language;
}

const UserAccount: React.FC<UserAccountProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const user = auth.currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<PricingPlan | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newEmail: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

  const t = (ar: string, en: string) => isRtl ? ar : en;

  // منطق التحقق من الدفع القادم من URL
  // يتم استدعاء هذا الجزء عند العودة من سترايب بنجاح
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment');
    const planIdFromUrl = queryParams.get('planId');

    if (paymentStatus === 'success' && user && userProfile) {
      // إذا لم يكن المستخدم برو بالفعل، نقوم بترقيته
      if (userProfile.role !== 'premium' && userProfile.role !== 'admin') {
        handleAutoUpgrade(planIdFromUrl);
      }
    }
  }, [location.search, user, userProfile]);

  const handleAutoUpgrade = async (planId: string | null) => {
    if (!user) return;
    setLoading(true);
    try {
      // تحديد تاريخ الانتهاء (سنة من الآن كافتراضي، يمكن تعديله حسب نوع الباقة)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      const targetPlanId = planId || 'pro_plan_yearly'; // قيمة افتراضية في حال لم يرسل سترايب المعرف

      // تحديث قاعدة البيانات فوراً
      await updateUserSubscription(
        user.uid, 
        'premium', 
        targetPlanId, 
        expiryDate.toISOString()
      );
      
      // تحديث الحالة المحلية للمعاينة الفورية
      const updatedProfile = await getUserProfile(user.uid);
      setUserProfile(updatedProfile);
      
      // جلب بيانات الباقة لعرضها في الاحتفال
      const allPlans = await getAllPricingPlans();
      const planInfo = allPlans.find(p => p.id === targetPlanId);
      if (planInfo) setActivePlan(planInfo);

      setShowCelebration(true);
      
      // تنظيف الرابط من معاملات الدفع لعدم تكرار التفعيل عند التحديث
      navigate(`/${lang}/account`, { replace: true });
    } catch (e) {
      console.error("Auto upgrade error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const [profile, plans] = await Promise.all([
            getUserProfile(user.uid),
            getAllPricingPlans()
          ]);
          setUserProfile(profile);
          if (profile?.planId) {
            const plan = plans.find(p => p.id === profile.planId);
            if (plan) setActivePlan(plan);
          }
        } catch (e) {
          console.error("Error loading account data:", e);
        } finally {
          setFetchingProfile(false);
        }
      }
    };
    loadData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await deleteUser(user);
      window.location.reload();
    } catch (error: any) {
      setStatus({ 
        type: 'error', 
        message: error.code === 'auth/requires-recent-login' 
          ? t("يجب تسجيل الدخول مرة أخرى قبل حذف الحساب لدواعي الأمان.", "Please re-login before deleting your account for security.")
          : getAuthErrorMessage(error.code, isRtl ? 'ar' : 'en') 
      });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      setStatus({ 
        type: 'error', 
        message: t("كلمات المرور الجديدة غير متطابقة", "New passwords do not match") 
      });
      return;
    }

    setLoading(true);
    try {
      await updateUserSecurity(
        securityData.currentPassword,
        securityData.newEmail,
        securityData.newPassword || undefined
      );
      
      const isEmailChanging = securityData.newEmail !== user?.email;
      
      setStatus({ 
        type: 'success', 
        message: isEmailChanging 
          ? t("تم إرسال رابط تأكيد إلى البريد الجديد. يرجى تفعيله لإتمام التغيير.", "A confirmation link has been sent to your new email. Please verify it to complete the change.")
          : t("تم تحديث بيانات حسابك بنجاح", "Account details updated successfully") 
      });
      setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      setStatus({ 
        type: 'error', 
        message: getAuthErrorMessage(error.code, isRtl ? 'ar' : 'en') 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-1";

  if (fetchingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{t("جاري تحميل بيانات الحساب...", "Loading account data...")}</p>
      </div>
    );
  }

  const isPremium = userProfile?.role === 'premium' || userProfile?.role === 'admin' || !!userProfile?.planId;
  const roleName = userProfile?.role === 'admin' ? t('مسؤول النظام', 'System Admin') : (isPremium ? t('عضو احترافي (برو)', 'Premium Pro Member') : t('مستخدم عادي (مجاني)', 'Standard Free Member'));

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-60 relative z-10">
      
      {/* نافذة الاحتفال بالترقية */}
      {showCelebration && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-blue-600/90 backdrop-blur-xl animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3.5rem] p-10 text-center shadow-2xl space-y-6 animate-zoom-in">
              <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <PartyPopper size={48} />
              </div>
              <h2 className="text-3xl font-black dark:text-white">{t('مبروك! تم تفعيل اشتراكك', 'Congrats! Pro Activated')}</h2>
              <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                 {t('أهلاً بك في عالم المحترفين. يمكنك الآن تخصيص بطاقاتك بشكل كامل واستخدام كافة الأدوات المتقدمة والحصرية.', 'Welcome to the Pro world. You can now fully customize your cards and use all advanced and exclusive tools.')}
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('الباقة الحالية', 'Current Plan')}</p>
                 <p className="text-lg font-black dark:text-white mt-1">{activePlan ? (isRtl ? activePlan.nameAr : activePlan.nameEn) : 'Premium'}</p>
              </div>
              <button 
                onClick={() => setShowCelebration(false)}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-sm uppercase shadow-xl hover:scale-105 transition-all"
              >
                {t('ابدأ رحلة التميز', 'Start Your Journey')}
              </button>
           </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div className="flex items-center gap-6">
           <div className={`w-20 h-20 rounded-[2.25rem] flex items-center justify-center text-white shadow-2xl ${isPremium ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
              {userProfile?.role === 'admin' ? <ShieldCheck size={36} /> : isPremium ? <Crown size={36} /> : <UserCircle size={36} />}
           </div>
           <div>
              <h1 className="text-3xl md:text-4xl font-black dark:text-white leading-tight mb-1">{t('إعدادات الحساب', 'Account Center')}</h1>
              <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isPremium ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{roleName}</span>
                 {userProfile?.role === 'admin' && <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Admin</span>}
              </div>
           </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase shadow-sm hover:bg-red-600 hover:text-white transition-all w-full md:w-auto"
        >
          <LogOut size={18} />
          {t('تسجيل الخروج', 'Logout')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar Section */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Card 1: Subscription Info */}
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-8 animate-fade-in">
              <div className="flex items-start justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[1.5rem] shadow-sm">
                       <Zap size={28} />
                    </div>
                    <div className="text-right rtl:text-right ltr:text-left">
                       <h3 className="text-2xl font-black dark:text-white leading-none">{t('حالة الاشتراك', 'Sub Status')}</h3>
                       <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {activePlan ? (isRtl ? activePlan.nameAr : activePlan.nameEn) : t('باقة مجانية', 'Free Plan')}
                       </p>
                    </div>
                 </div>
              </div>

              {isPremium && userProfile?.premiumUntil && (
                 <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                       <div className="flex items-center gap-2"><Calendar size={12}/> {t('صالح حتى', 'Valid Until')}</div>
                       <span className="text-gray-900 dark:text-white">{new Date(userProfile.premiumUntil).toLocaleDateString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600" style={{ width: '100%' }}></div>
                    </div>
                 </div>
              )}

              {isPremium ? (
                 <button 
                   onClick={() => window.open('https://billing.stripe.com/p/login/28E7sMdXhgoE6E80dQ4c800', '_blank')}
                   className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                 >
                    <span className="relative z-10">{t('إدارة الفواتير والاشتراك', 'Manage Billing & Subscription')}</span>
                    <ExternalLink size={18} className="group-hover:translate-x-1 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                 </button>
              ) : (
                 <button 
                   onClick={() => navigate(`/${lang}/pricing`)}
                   className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                 >
                    <span className="relative z-10">{t('ترقية الحساب الآن', 'Upgrade Account Now')}</span>
                    <ArrowUpRight size={18} className="group-hover:translate-x-1 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                 </button>
              )}
           </div>

           {/* Card 2: Membership Features */}
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg"><CheckCircle2 size={18} /></div>
                 <h3 className="font-black text-xs uppercase tracking-widest dark:text-white">{t('مميزات العضوية', 'Plan Benefits')}</h3>
              </div>
              
              <ul className="space-y-4">
                 {(isPremium ? 
                    (isRtl ? ["وصول للمحرر المتقدم", "نظام العضويات", "وسام التوثيق", "قوالب حصرية", "دعم أولوية"] : 
                             ["Advanced Editor", "Member Systems", "Verified Badge", "Pro Templates", "Priority Support"]) : 
                    (isRtl ? ["تعديل بيانات أساسية", "قوالب مجانية", "مشاركة برابط", "إحصائيات بسيطة"] : 
                             ["Basic Editing", "Free Templates", "Link Sharing", "Basic Stats"])
                 ).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                       <div className={`p-1 rounded-md ${isPremium ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          <Check size={12} strokeWidth={4} />
                       </div>
                       <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{feat}</span>
                    </li>
                 ))}
              </ul>
           </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-8">
           <form onSubmit={handleUpdate} className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
              
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl shadow-sm"><Lock size={24} /></div>
                 <h2 className="text-2xl font-black dark:text-white uppercase leading-none">{t('أمان الحساب والبيانات', 'Security & Privacy')}</h2>
              </div>

              {status && (
                <div className={`p-5 rounded-2xl flex items-center gap-4 animate-fade-in ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  <span className="text-sm font-bold">{status.message}</span>
                </div>
              )}

              <div className="space-y-8">
                 <div>
                    <label className={labelClasses}>{t('كلمة المرور الحالية (مطلوب للتعديل)', 'Current Password')}</label>
                    <div className="relative">
                       <Key className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                       <input 
                         type="password" required
                         value={securityData.currentPassword}
                         onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})}
                         className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`}
                         placeholder="••••••••"
                       />
                    </div>
                 </div>

                 <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-8">
                    <div>
                       <label className={labelClasses}>{t('البريد الإلكتروني الجديد', 'New Email Address')}</label>
                       <div className="relative">
                          <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                          <input 
                            type="email" required
                            value={securityData.newEmail}
                            onChange={e => setSecurityData({...securityData, newEmail: e.target.value})}
                            className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <label className={labelClasses}>{t('كلمة سر جديدة', 'New Password')}</label>
                          <input 
                            type="password"
                            value={securityData.newPassword}
                            onChange={e => setSecurityData({...securityData, newPassword: e.target.value})}
                            className={inputClasses}
                            placeholder={t('6 أحرف على الأقل', 'Min 6 chars')}
                          />
                       </div>
                       <div>
                          <label className={labelClasses}>{t('تأكيد كلمة السر', 'Confirm Password')}</label>
                          <input 
                            type="password"
                            value={securityData.confirmPassword}
                            onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})}
                            className={inputClasses}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                {t('تحديث بيانات الحساب', 'Update My Account')}
              </button>
           </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-20">
         <div className="bg-red-50/50 dark:bg-red-900/5 p-8 md:p-12 rounded-[3rem] border border-red-100 dark:border-red-900/20 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm relative">
            <div className="flex items-center gap-6 text-center md:text-start flex-col md:flex-row">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-[1.5rem] flex items-center justify-center shrink-0">
                  <AlertTriangle size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-red-600 uppercase tracking-tight">{t('منطقة الخطر', 'Danger Zone')}</h3>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                    {t('سيتم حذف حسابك وكافة بطاقاتك الرقمية بشكل نهائي ولا يمكن استعادتها.', 'Permanently delete your account and all associated data. This cannot be undone.')}
                  </p>
               </div>
            </div>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full md:w-auto px-10 py-5 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-900/30 rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm shrink-0"
            >
              {t('حذف الحساب نهائياً', 'Delete Account')}
            </button>
         </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3.5rem] p-10 text-center shadow-2xl border border-red-100 dark:border-red-900/20">
             <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
             </div>
             <h3 className="text-2xl font-black dark:text-white mb-4">{t('تأكيد الحذف النهائي', 'Confirm Delete')}</h3>
             <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {t('هل أنت متأكد؟ لا يمكن التراجع عن هذه الخطوة وسيتم مسح كافة بياناتك فوراً.', 'Are you sure? This action is permanent and all your data will be wiped immediately.')}
             </p>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  {t('نعم، احذف حسابي', 'Yes, Delete My Account')}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-3xl font-black text-sm uppercase transition-all"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccount;
