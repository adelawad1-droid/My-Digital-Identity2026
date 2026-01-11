
import React, { useState, useEffect } from 'react';
import { auth, updateUserSecurity, getAuthErrorMessage, getUserProfile, getAllPricingPlans } from '../services/firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { Language, PricingPlan } from '../types';
import { 
  User, Lock, Mail, ShieldCheck, Key, Loader2, 
  AlertTriangle, CheckCircle2, UserCircle, LogOut, Trash2, X,
  Crown, CreditCard, Calendar, ArrowUpRight, Zap, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../constants';

interface UserAccountProps {
  lang: Language;
}

const UserAccount: React.FC<UserAccountProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const user = auth.currentUser;
  const navigate = useNavigate();
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newEmail: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const [profile, plans] = await Promise.all([
          getUserProfile(user.uid),
          getAllPricingPlans()
        ]);
        setUserProfile(profile);
        setAvailablePlans(plans);
        setIsProfileLoading(false);
      }
    };
    fetchData();
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
      console.error("Delete Error:", error);
      setStatus({ 
        type: 'error', 
        message: error.code === 'auth/requires-recent-login' 
          ? (isRtl ? "يجب تسجيل الدخول مرة أخرى قبل حذف الحساب لدواعي الأمان." : "Please re-login before deleting your account for security.")
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
        message: isRtl ? "كلمات المرور الجديدة غير متطابقة" : "New passwords do not match" 
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
          ? (isRtl ? "تم إرسال رابط تأكيد إلى البريد الجديد. يرجى تفعيله لإتمام التغيير." : "A confirmation link has been sent to your new email. Please verify it to complete the change.")
          : (isRtl ? "تم تحديث بيانات حسابك بنجاح" : "Account details updated successfully") 
      });
      setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error("Update Error:", error);
      setStatus({ 
        type: 'error', 
        message: getAuthErrorMessage(error.code, isRtl ? 'ar' : 'en') 
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubProgress = () => {
    if (!userProfile?.premiumUntil) return 0;
    const expiry = new Date(userProfile.premiumUntil);
    const now = new Date();
    const start = new Date(expiry.getTime() - 365 * 24 * 60 * 60 * 1000); // نفترض سنة كاملة
    const total = expiry.getTime() - start.getTime();
    const remaining = expiry.getTime() - now.getTime();
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  const currentPlan = userProfile?.planId ? availablePlans.find(p => p.id === userProfile.planId) : null;
  const isPremium = userProfile?.role === 'premium' || userProfile?.role === 'admin';

  const inputClasses = "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-1";

  if (isProfileLoading) return (
    <div className="flex flex-col items-center justify-center py-40">
       <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
       <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{t('appName')}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div className="flex items-center gap-5">
           <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
              <UserCircle size={40} />
           </div>
           <div>
              <h1 className="text-3xl font-black dark:text-white">{t('account')}</h1>
              <p className="text-sm font-bold text-gray-400 mt-1">{user?.email}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-red-600 hover:text-white transition-all"
            >
              <LogOut size={16} />
              {t('logout')}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Billing & Subscription Section */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Crown size={200} />
              </div>

              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${isPremium ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'} shadow-sm`}>
                       {isPremium ? <Crown size={28} /> : <CreditCard size={28} />}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{t('billingTitle')}</h2>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('manageBilling')}</p>
                    </div>
                 </div>
                 {isPremium ? (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck size={14} /> {t('statusActive')}
                    </div>
                 ) : (
                    <div className="px-4 py-2 bg-gray-100 text-gray-400 rounded-full font-black text-[10px] uppercase tracking-widest">
                       {t('statusInactive')}
                    </div>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="p-8 bg-gray-50 dark:bg-white/[0.03] rounded-[2.5rem] border border-gray-100 dark:border-white/5 space-y-6">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('currentPlan')}</span>
                       <h3 className="text-3xl font-black dark:text-white">{currentPlan ? (isRtl ? currentPlan.nameAr : currentPlan.nameEn) : (isRtl ? 'الباقة المجانية' : 'Free Basic Plan')}</h3>
                    </div>
                    
                    {isPremium && userProfile?.premiumUntil && (
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <div className="flex items-center gap-2 text-amber-600">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase">{t('activeUntil')}</span>
                             </div>
                             <span className="text-xs font-black dark:text-white">{new Date(userProfile.premiumUntil).toLocaleDateString()}</span>
                          </div>
                          <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                             <div 
                               className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out rounded-full shadow-lg"
                               style={{ width: `${getSubProgress()}%` }}
                             />
                          </div>
                       </div>
                    )}

                    <button 
                      onClick={() => navigate(`/${lang}/pricing`)}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       <Zap size={16} />
                       {isPremium ? t('upgradePlan') : t('upgradeToCustomize')}
                    </button>
                 </div>

                 <div className="p-8 bg-gray-50 dark:bg-white/[0.03] rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <CreditCard size={14} /> {t('billingHistory')}
                       </h4>
                       <div className="space-y-3">
                          {isPremium ? (
                             <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                      <CheckCircle2 size={16} />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black dark:text-white uppercase leading-none">Subscription Payment</p>
                                      <p className="text-[8px] font-bold text-gray-400 mt-1">{new Date().toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <span className="text-xs font-black text-blue-600">${currentPlan?.price || '--'}</span>
                             </div>
                          ) : (
                             <div className="text-center py-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'لا توجد فواتير سابقة' : 'No billing history'}</p>
                             </div>
                          )}
                       </div>
                    </div>
                    
                    <a 
                      href="https://billing.stripe.com" 
                      target="_blank" 
                      className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest group"
                    >
                       {isRtl ? 'إدارة الفواتير عبر Stripe' : 'Manage Invoices via Stripe'}
                       <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                 </div>
              </div>
           </div>

           {/* Security Settings Form */}
           <form onSubmit={handleUpdate} className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
              <div className="flex items-center gap-4">
                 <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                    <Lock size={28} />
                 </div>
                 <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'إعدادات الأمان' : 'Security Settings'}</h3>
              </div>

              {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  <span className="text-xs font-bold">{status.message}</span>
                </div>
              )}

              <div className="space-y-6">
                 <div>
                    <label className={labelClasses}>{isRtl ? 'كلمة المرور الحالية (مطلوب للتغيير)' : 'Current Password (Required for changes)'}</label>
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

                 <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                    <div>
                       <label className={labelClasses}>{isRtl ? 'البريد الإلكتروني الجديد' : 'New Email Address'}</label>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className={labelClasses}>{isRtl ? 'كلمة سر جديدة' : 'New Password'}</label>
                          <input 
                            type="password"
                            value={securityData.newPassword}
                            onChange={e => setSecurityData({...securityData, newPassword: e.target.value})}
                            className={inputClasses}
                            placeholder={isRtl ? '6 أحرف على الأقل' : 'Min 6 characters'}
                          />
                       </div>
                       <div>
                          <label className={labelClasses}>{isRtl ? 'تأكيد كلمة السر' : 'Confirm Password'}</label>
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
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {t('saveChanges')}
              </button>
           </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
              <h3 className="font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest text-xs">{isRtl ? 'معلومات الدخول' : 'Access Info'}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
                {isRtl ? 'تستخدم هذه البيانات للوصول إلى لوحة التحكم الخاصة بك وإدارة بطاقاتك الرقمية وفواتيرك.' : 'Use these credentials to access your dashboard, manage digital cards, and invoices.'}
              </p>
           </div>
           
           <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex gap-4">
              <ShieldCheck className="text-blue-600 shrink-0" size={20} />
              <p className="text-[10px] font-bold text-blue-800 dark:text-blue-400 leading-relaxed">
                {isRtl ? 'حسابك محمي بتقنية Firebase Auth. يتم تشفير كافة البيانات لضمان أقصى درجات الخصوصية.' : 'Your account is secured by Firebase Auth. All data is encrypted to ensure maximum privacy.'}
              </p>
           </div>

           {/* Danger Zone */}
           <div className="bg-red-50/50 dark:bg-red-900/5 p-8 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 space-y-4">
              <h3 className="font-black text-red-600 text-[10px] uppercase tracking-widest">{isRtl ? 'منطقة الخطر' : 'Danger Zone'}</h3>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                {isRtl ? 'سيتم حذف حسابك وكافة بطاقاتك الرقمية وسجل اشتراكاتك بشكل نهائي ولا يمكن استعادتها.' : 'This will permanently delete your account, all digital cards, and subscription history.'}
              </p>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 bg-white dark:bg-gray-800 text-red-600 border border-red-100 dark:border-red-900/30 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                {isRtl ? 'حذف الحساب نهائياً' : 'Delete Account'}
              </button>
           </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-red-100 dark:border-red-900/20">
             <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
             </div>
             <h3 className="text-2xl font-black dark:text-white mb-4">{isRtl ? 'تأكيد الحذف النهائي' : 'Confirm Deletion'}</h3>
             <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {isRtl ? 'هل أنت متأكد من رغبتك في حذف حسابك؟ لا يمكن التراجع عن هذه الخطوة وسيتم مسح كافة بياناتك فوراً.' : 'Are you sure? This action is permanent and all your data will be wiped immediately.'}
             </p>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  {isRtl ? 'نعم، احذف حسابي' : 'Yes, Delete My Account'}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-3xl font-black text-sm uppercase transition-all"
                >
                  {t('cancel')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccount;
