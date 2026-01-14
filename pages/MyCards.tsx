
import React, { useState, useEffect } from 'react';
import { CardData, Language, PricingPlan } from '../types';
import { TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, ExternalLink, Edit2, User as UserIcon, 
  Share2, AlertTriangle, X, Eye, Calendar, ShieldCheck, 
  Clock, TrendingUp, Sparkles, Crown, Zap, ArrowUpRight,
  Loader2, Save, CheckCircle2,
  CreditCard, Star, CalendarPlus, Search, FolderSearch,
  Layers, Globe
} from 'lucide-react';
import ShareModal from '../components/ShareModal';
import { auth, getUserProfile, saveCardToDB, getAllPricingPlans } from '../services/firebase';

interface MyCardsProps {
  lang: Language;
  cards: CardData[];
  onAdd: () => void;
  onEdit: (card: CardData) => void;
  onDelete: (id: string, ownerId: string) => void;
}

const MyCards: React.FC<MyCardsProps> = ({ lang, cards, onAdd, onEdit, onDelete }) => {
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  
  const [sharingCard, setSharingCard] = useState<CardData | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxCardsLimit, setMaxCardsLimit] = useState(5); // افتراضياً 5 للمجاني
  
  // خاص بإدارة العضوية السريعة
  const [membershipEditingCard, setMembershipEditingCard] = useState<CardData | null>(null);
  const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);
  const [membershipForm, setMembershipForm] = useState({
    showMembership: false,
    titleAr: '',
    titleEn: '',
    startDate: '',
    expiryDate: ''
  });

  useEffect(() => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      Promise.all([
        getUserProfile(uid),
        getAllPricingPlans()
      ]).then(([profile, plans]) => {
        if (profile) {
          setUserProfile(profile);
          if (profile.planId) {
            const currentPlan = plans.find(p => p.id === profile.planId);
            if (currentPlan) {
              setMaxCardsLimit(currentPlan.maxCards || 10);
            }
          } else {
            setMaxCardsLimit(5); // الحد للمجاني
          }
        }
      });
    }
  }, []);

  const isPremium = userProfile?.role === 'premium' || userProfile?.role === 'admin' || !!userProfile?.planId;
  const isLimitReached = cards.length >= maxCardsLimit;

  // منطق الفلترة بناءً على البحث
  const filteredCards = cards.filter(card => 
    (card.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (card.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (cardToDelete) {
      onDelete(cardToDelete.id, cardToDelete.ownerId || '');
      setCardToDelete(null);
    }
  };

  const openMembershipManager = (card: CardData) => {
    setMembershipEditingCard(card);
    setMembershipForm({
      showMembership: card.showMembership || false,
      titleAr: card.membershipTitleAr || (isRtl ? 'اشتراك مفعل' : 'Active Subscription'),
      titleEn: card.membershipTitleEn || 'Active Subscription',
      startDate: card.membershipStartDate || new Date().toISOString().split('T')[0],
      expiryDate: card.membershipExpiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleQuickExtend = (days: number) => {
    const currentExpiry = new Date(membershipForm.expiryDate);
    const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
    setMembershipForm({ ...membershipForm, expiryDate: newExpiry.toISOString().split('T')[0] });
  };

  const saveMembershipUpdates = async () => {
    if (!membershipEditingCard) return;
    setIsUpdatingMembership(true);
    try {
      const updatedCard: CardData = {
        ...membershipEditingCard,
        showMembership: membershipForm.showMembership,
        membershipTitleAr: membershipForm.titleAr,
        membershipTitleEn: membershipForm.titleEn,
        membershipStartDate: membershipForm.startDate,
        membershipExpiryDate: membershipForm.expiryDate
      };
      await saveCardToDB({ cardData: updatedCard });
      // تحديث القائمة محلياً
      const idx = cards.findIndex(c => c.id === updatedCard.id);
      if (idx !== -1) cards[idx] = updatedCard;
      
      setMembershipEditingCard(null);
    } catch (e) {
      alert(isRtl ? "فشل تحديث العضوية" : "Failed to update membership");
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const getMembershipStats = (card: CardData) => {
    if (!card.membershipExpiryDate) return null;
    const now = new Date();
    const start = card.membershipStartDate ? new Date(card.membershipStartDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(card.membershipExpiryDate);
    const total = end.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();
    const progress = Math.max(0, Math.min(100, (remaining / total) * 100));
    const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    let color = 'bg-emerald-500';
    if (daysLeft <= 0) color = 'bg-red-500';
    else if (daysLeft <= 7) color = 'bg-orange-500';
    return { progress, daysLeft, color, start, end };
  };

  const handleCreateMembershipCard = () => {
    if (isLimitReached) {
       alert(t('limitReached'));
       return;
    }
    navigate(`/${lang}/templates?mode=private`);
  };

  const handleAddNewCard = () => {
    if (isLimitReached) {
       alert(t('limitReached'));
       return;
    }
    onAdd();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-12 animate-fade-in-up pb-32">
      
      {/* Premium Upgrade Banner for Basic Users */}
      {!isPremium && cards.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={12} /> {isRtl ? 'عرض خاص لفترة محدودة' : 'Limited Time Offer'}
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black leading-tight">
                    {isRtl ? 'احصل على هويتي الرقمية الموثقة الآن' : 'Get Your Verified Digital Identity Now'}
                 </h2>
                 <p className="text-blue-100 font-bold opacity-90">
                    {isRtl 
                      ? 'قم بترقية حسابك للعضوية المميزة واحصل على وسام التوثيق، قوالب حصرية، وإمكانية تفعيل نظام العضويات والاشتراكات لعملائك.' 
                      : 'Upgrade to Premium and get a verified badge, exclusive templates, and the ability to enable membership systems for your clients.'}
                 </p>
              </div>
              <button 
                onClick={() => navigate(`/${lang}/pricing`)}
                className="shrink-0 px-10 py-5 bg-white text-blue-600 rounded-[1.5rem] font-black text-sm uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                 {isRtl ? 'عرض الباقات والترقية' : 'View Plans & Upgrade'}
                 <ArrowUpRight size={18} />
              </button>
           </div>
           <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Crown size={240} />
           </div>
        </div>
      )}

      {/* Card Limit Status */}
      <div className="bg-white dark:bg-[#0f0f12] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`p-3 rounded-xl ${isLimitReached ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
               <Layers size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('cardUsage')}</p>
               <h4 className="text-lg font-black dark:text-white">{cards.length} / {maxCardsLimit} <span className="text-gray-400 text-xs font-bold">{isRtl ? 'بطاقة' : 'Cards'}</span></h4>
            </div>
         </div>
         <div className="flex-1 w-full max-w-md h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isLimitReached ? 'bg-red-500' : 'bg-blue-600'}`} 
              style={{ width: `${(cards.length / maxCardsLimit) * 100}%` }} 
            />
         </div>
         {!isPremium && isLimitReached && (
            <button 
              onClick={() => navigate(`/${lang}/pricing`)}
              className="px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
            >
               {t('upgradeToAdd')}
            </button>
         )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className={`p-4 rounded-[1.5rem] shadow-lg ${isPremium ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
              {isPremium ? <Crown size={32} /> : <CreditCard size={32} />}
           </div>
           <div>
              <h2 className="text-4xl font-black dark:text-white leading-tight">{t('myCards')}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    {isRtl ? `لديك ${cards.length} بطاقة رقمية مفعلة` : `You have ${cards.length} active digital cards`}
                 </p>
                 {isPremium && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                      <Star size={10} fill="currentColor" /> {isRtl ? 'حساب مميز' : 'Premium Member'}
                   </div>
                 )}
              </div>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            {isPremium && (
               <button 
                onClick={handleCreateMembershipCard} 
                disabled={isLimitReached}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-xl transition-all ${isLimitReached ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 text-white shadow-amber-500/20 hover:scale-105 active:scale-95'}`}
               >
                <ShieldCheck size={20} />
                {isRtl ? 'بطاقة عضوية خاصة' : 'Private Member Card'}
               </button>
            )}
            <button 
              onClick={handleAddNewCard} 
              disabled={isLimitReached}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl transition-all ${isLimitReached ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-500/20 hover:scale-105 active:scale-95'}`}
            >
              <Plus size={20} />
              {isRtl ? 'إنشاء بطاقة جديدة' : 'Create New Card'}
            </button>
        </div>
      </div>

      {/* محرك البحث الداخلي */}
      <div className="w-full max-w-2xl mx-auto">
         <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
               <Search size={20} />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "ابحث عن بطاقة بالاسم أو المعرف..." : "Search for a card by name or ID..."}
              className={`w-full py-5 ${isRtl ? 'pr-14 pl-6' : 'pl-14 pr-6'} bg-white dark:bg-[#0f0f12] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 font-bold text-sm dark:text-white transition-all`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute inset-y-0 ${isRtl ? 'left-4' : 'right-4'} flex items-center text-gray-400 hover:text-red-500 transition-colors`}
              >
                 <X size={18} />
              </button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredCards.map((card) => {
          const mStats = getMembershipStats(card);
          return (
            <div key={card.id} className="bg-white dark:bg-[#0f0f12] rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800/50 flex flex-col overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
              <div className="p-8 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-lg overflow-hidden flex items-center justify-center">
                      {card.profileImage ? (
                        <img src={card.profileImage} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <UserIcon size={24} className="text-gray-300"/>
                      )}
                    </div>
                    {card.isActive !== false && (
                       <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0f0f12] rounded-full"></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white truncate leading-tight">{card.name || '---'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">ID: {card.id}</span>
                       {card.isVerified && <ShieldCheck size={12} className="text-blue-500" />}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                      <Eye size={14} />
                      <span className="text-[11px] font-black">{card.viewCount || 0}</span>
                   </div>
                </div>
              </div>

              <div className="px-8 py-4 relative">
                {card.showMembership && mStats ? (
                  <div className="p-5 bg-gray-50 dark:bg-white/[0.03] rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4 group/membership relative">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className={mStats.daysLeft > 0 ? "text-emerald-500" : "text-red-500"} />
                          <span className="text-[9px] font-black dark:text-white uppercase tracking-widest">
                             {isRtl ? (card.membershipTitleAr || 'حالة العضوية') : (card.membershipTitleEn || 'Membership')}
                          </span>
                       </div>
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${mStats.daysLeft > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {mStats.daysLeft > 0 ? (isRtl ? `${mStats.daysLeft} يوم متبقي` : `${mStats.daysLeft} Days Left`) : (isRtl ? 'منتهي' : 'Expired')}
                       </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${mStats.color}`} style={{ width: `${mStats.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                       <div className="flex items-center gap-1"><Calendar size={10}/> {mStats.start.toLocaleDateString()}</div>
                       <div className="flex items-center gap-1">{mStats.end.toLocaleDateString()} <Clock size={10}/></div>
                    </div>
                    
                    {/* زر الإدارة السريع للمحترفين */}
                    {isPremium && (
                      <button 
                        onClick={() => openMembershipManager(card)}
                        className="absolute inset-0 bg-blue-600/90 text-white rounded-[2rem] flex flex-col items-center justify-center gap-2 opacity-0 group-hover/membership:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                      >
                         <ShieldCheck size={28} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{isRtl ? 'إدارة سريعة للعضوية' : 'Manage Membership'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-[102px] flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] group-hover:border-blue-500/30 transition-colors relative group/membership">
                     <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">{isRtl ? 'العضوية غير مفعلة للبطاقة' : 'Membership not enabled'}</p>
                     {isPremium && (
                      <button 
                        onClick={() => openMembershipManager(card)}
                        className="absolute inset-0 bg-blue-600/90 text-white rounded-[2rem] flex flex-col items-center justify-center gap-2 opacity-0 group-hover/membership:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                      >
                         <ShieldCheck size={28} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{isRtl ? 'تفعيل العضوية الآن' : 'Enable Membership Now'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-auto p-8 pt-2">
                <div className="grid grid-cols-5 gap-2">
                  <button onClick={() => onEdit(card)} className="p-3 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all shadow-sm" title={t('تعديل')}><Edit2 size={16} /></button>
                  <button onClick={() => setSharingCard(card)} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm" title={t('مشاركة')}><Share2 size={16} /></button>
                  <button onClick={() => navigate(`/${lang}/custom-domain`)} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title={t('customDomain')}><Globe size={16} /></button>
                  <a href={`?u=${card.id}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title={t('عرض')}><ExternalLink size={16} /></a>
                  <button onClick={() => setCardToDelete(card)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm" title={t('حذف')}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* عرض رسالة عند عدم وجود نتائج للبحث */}
        {filteredCards.length === 0 && cards.length > 0 && (
           <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-[#0f0f12] rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300">
                 <FolderSearch size={40} />
              </div>
              <div>
                 <h3 className="text-xl font-black dark:text-white">{isRtl ? 'لا توجد نتائج مطابقة' : 'No matching results'}</h3>
                 <p className="text-gray-400 font-bold text-sm mt-2">{isRtl ? `لم نجد أي بطاقة تحتوي على اسم "${searchQuery}"` : `No cards found matching "${searchQuery}"`}</p>
              </div>
              <button onClick={() => setSearchQuery('')} className="px-8 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl font-black text-xs uppercase hover:bg-blue-600 hover:text-white transition-all">
                 {isRtl ? 'عرض كافة البطاقات' : 'Show All Cards'}
              </button>
           </div>
        )}

        {cards.length === 0 && (
          <button onClick={handleAddNewCard} className="flex flex-col items-center justify-center p-12 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/10 transition-all duration-500 group">
            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner mb-6">
              <Plus size={32} />
            </div>
            <span className="text-xs font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">
              {isRtl ? 'إضافة بطاقة جديدة' : 'Add New Card'}
            </span>
          </button>
        )}
      </div>

      {/* Modal: إدارة العضوية السريعة */}
      {membershipEditingCard && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col animate-zoom-in">
              <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                       <ShieldCheck size={28} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter">{isRtl ? 'إدارة عضوية البطاقة' : 'Card Membership Hub'}</h3>
                       <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">{membershipEditingCard.name}</p>
                    </div>
                 </div>
                 <button onClick={() => setMembershipEditingCard(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X size={24}/></button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                 {/* تفعيل العضوية */}
                 <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-4">
                       <Zap size={24} className={membershipForm.showMembership ? "text-blue-600" : "text-gray-400"} />
                       <span className="text-xs font-black uppercase tracking-widest dark:text-white">{isRtl ? 'تفعيل قسم العضوية' : 'Enable Membership Section'}</span>
                    </div>
                    <button 
                      onClick={() => setMembershipForm({ ...membershipForm, showMembership: !membershipForm.showMembership })} 
                      className={`w-14 h-7 rounded-full relative transition-all ${membershipForm.showMembership ? 'bg-blue-600 shadow-lg' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (membershipForm.showMembership ? 'left-1' : 'left-8') : (membershipForm.showMembership ? 'right-1' : 'right-8')}`} />
                    </button>
                 </div>

                 <div className={membershipForm.showMembership ? "space-y-6 opacity-100 transition-all" : "opacity-30 pointer-events-none transition-all"}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'عنوان العضوية (عربي)' : 'Membership Title (AR)'}</label>
                          <input 
                            type="text" 
                            value={membershipForm.titleAr} 
                            onChange={e => setMembershipForm({ ...membershipForm, titleAr: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-100" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'عنوان العضوية (EN)' : 'Membership Title (EN)'}</label>
                          <input 
                            type="text" 
                            value={membershipForm.titleEn} 
                            onChange={e => setMembershipForm({ ...membershipForm, titleEn: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-100" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1"><Clock size={10} className="inline mr-1" /> {isRtl ? 'تاريخ البدء' : 'Start Date'}</label>
                          <input 
                            type="date" 
                            value={membershipForm.startDate} 
                            onChange={e => setMembershipForm({ ...membershipForm, startDate: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-100" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1"><Calendar size={10} className="inline mr-1" /> {isRtl ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                          <input 
                            type="date" 
                            value={membershipForm.expiryDate} 
                            onChange={e => setMembershipForm({ ...membershipForm, expiryDate: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-100" 
                          />
                       </div>
                    </div>

                    {/* أزرار تمديد سريعة */}
                    <div className="pt-4 border-t dark:border-gray-800">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">{isRtl ? 'تمديد سريع لفترة الاشتراك' : 'Quick Expiry Extension'}</label>
                       <div className="grid grid-cols-3 gap-3">
                          <button onClick={() => handleQuickExtend(30)} className="py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-black text-[10px] text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-1">
                             <CalendarPlus size={18} />
                             <span>{isRtl ? '30 يوم' : '30 Days'}</span>
                          </button>
                          <button onClick={() => handleQuickExtend(90)} className="py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-black text-[10px] text-indigo-600 hover:bg-indigo-50 transition-all flex flex-col items-center gap-1">
                             <TrendingUp size={18} />
                             <span>{isRtl ? '90 يوم' : '90 Days'}</span>
                          </button>
                          <button onClick={() => handleQuickExtend(365)} className="py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-black text-[10px] text-amber-600 hover:bg-amber-50 transition-all flex flex-col items-center gap-1">
                             <Star size={18} fill="currentColor" />
                             <span>{isRtl ? 'سنة كاملة' : '1 Year'}</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 pt-0 flex gap-3">
                 <button 
                   onClick={saveMembershipUpdates}
                   disabled={isUpdatingMembership}
                   className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                 >
                    {isUpdatingMembership ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
                 </button>
                 <button onClick={() => setMembershipEditingCard(null)} className="px-10 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-3xl font-black text-xs uppercase hover:bg-gray-200 transition-all">
                    {isRtl ? 'إلغاء' : 'Cancel'}
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {sharingCard && (
        <ShareModal data={sharingCard} lang={lang} onClose={() => setSharingCard(null)} />
      )}

      {cardToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-sm md:max-w-md rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-8 md:p-10 text-center space-y-6 animate-zoom-in">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black dark:text-white leading-relaxed">{isRtl ? "تأكيد حذف البطاقة" : "Confirm Card Deletion"}</h3>
                 <p className="text-xs font-bold text-gray-400 leading-relaxed px-4">
                    {isRtl ? `هل أنت متأكد من حذف البطاقة "${cardToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete "${cardToDelete.name}"? This action cannot be undone.`}
                 </p>
              </div>
              <div className="flex flex-col gap-3 pt-4 items-center">
                 <button onClick={handleDeleteConfirm} className="w-full max-w-[280px] py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <Trash2 size={18} /> {isRtl ? "نعم، حذف البطاقة" : "Yes, Delete Card"}
                 </button>
                 <button onClick={() => setCardToDelete(null)} className="w-full max-w-[280px] py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <X size={16} /> {isRtl ? "تراجع" : "Cancel"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyCards;
