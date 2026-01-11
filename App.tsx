
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Language, CardData, CustomTemplate } from './types';
import { TRANSLATIONS, LANGUAGES_CONFIG } from './constants';
import Editor from './pages/Editor';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import UserAccount from './pages/UserAccount';
import Home from './pages/Home';
import HowToStart from './pages/HowToStart';
import MyCards from './pages/MyCards';
import TemplatesGallery from './pages/TemplatesGallery';
import CustomRequest from './pages/CustomRequest';
import Pricing from './pages/Pricing';
import LanguageToggle from './components/LanguageToggle';
import ShareModal from './components/ShareModal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { auth, getCardBySerial, saveCardToDB, ADMIN_EMAIL, getUserCards, getSiteSettings, deleteUserCard, getAllTemplates, syncUserProfile, getUserProfile } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Sun, Moon, Loader2, Plus, User as UserIcon, LogIn, AlertCircle, Home as HomeIcon, LayoutGrid, CreditCard, Mail, Coffee, Heart, Trash2, Briefcase, HelpCircle, ShieldCheck, Menu, X, ChevronRight, MessageSquare, Zap } from 'lucide-react';

const getBrowserLanguage = (): Language => {
  const supportedLanguages = Object.keys(LANGUAGES_CONFIG);
  const browserLang = navigator.language.split('-')[0];
  if (supportedLanguages.includes(browserLang)) return browserLang as Language;
  return 'ar';
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const langParam = params.lang as Language;
  const lang = (Object.keys(LANGUAGES_CONFIG).includes(langParam) 
    ? langParam 
    : (localStorage.getItem('preferred_lang') as Language || getBrowserLanguage())
  ) as Language;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCards, setUserCards] = useState<CardData[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [isCardDeleted, setIsCardDeleted] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingData, setSharingData] = useState<CardData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [siteConfig, setSiteConfig] = useState({ 
    siteNameAr: 'هويتي الرقمية', 
    siteNameEn: 'NextID', 
    siteLogo: '',
    siteIcon: '',
    siteContactEmail: 'info@nextid.my',
    siteContactPhone: '966560817601',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Cairo',
    analyticsCode: ''
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const initFlag = useRef(false);

  const isRtl = LANGUAGES_CONFIG[lang]?.dir === 'rtl';
  const displaySiteName = isRtl ? siteConfig.siteNameAr : siteConfig.siteNameEn;
  
  const t = (key: string, en?: string) => TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : (en || key);

  useEffect(() => {
    if (publicCard) return;
    let title = displaySiteName;
    let description = isRtl 
      ? 'NextID - المنصة المتكاملة لإنشاء بطاقات الأعمال الرقمية الاحترافية والعضويات الذكية.' 
      : 'NextID - The integrated platform for professional digital business cards and smart memberships.';

    const path = location.pathname;
    if (path.includes('/templates')) {
      title = isRtl ? `تصفح القوالب | ${displaySiteName}` : `Browse Templates | ${displaySiteName}`;
    } else if (path.includes('/my-cards')) {
      title = isRtl ? `بطاقاتي | ${displaySiteName}` : `My Cards | ${displaySiteName}`;
    } else if (path.includes('/pricing')) {
      title = isRtl ? `باقات الاشتراك | ${displaySiteName}` : `Pricing Plans | ${displaySiteName}`;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (siteConfig.siteIcon && favicon) {
      favicon.href = siteConfig.siteIcon;
    }
  }, [location.pathname, displaySiteName, isRtl, publicCard, siteConfig.siteIcon]);

  const isEditorActive = location.pathname.includes('/editor');
  const shouldShowFooter = !isEditorActive && !publicCard && !isCardDeleted;
  const shouldShowBottomNav = !publicCard && !isCardDeleted;

  const navigateWithLang = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    navigate(`/${lang}${cleanPath}`);
    setIsSidebarOpen(false);
  };

  const handleCloseShare = () => {
    setShowShareModal(false);
    setSharingData(null);
    navigateWithLang('/my-cards');
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (initFlag.current) return;
      initFlag.current = true;
      const searchParams = new URLSearchParams(window.location.search);
      const slug = searchParams.get('u')?.trim().toLowerCase();
      const [settings, templates] = await Promise.all([
        getSiteSettings().catch(() => null),
        getAllTemplates().catch(() => [])
      ]);
      if (settings) setSiteConfig(prev => ({ ...prev, ...settings }));
      if (templates) setCustomTemplates(templates as CustomTemplate[]);
      if (slug) {
        try {
          const card = await getCardBySerial(slug);
          if (card) { setPublicCard(card as CardData); setIsDarkMode(card.isDark); } 
          else { setIsCardDeleted(true); }
        } catch (e) { setIsCardDeleted(true); }
      }
      onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            await syncUserProfile(user); 
            const profile = await getUserProfile(user.uid);
            setIsAdmin(profile?.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
          } catch (e) {
            setIsAdmin(user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
          }
          if (!slug) {
            try {
              const cards = await getUserCards(user.uid);
              setUserCards(cards as CardData[]);
            } catch (e) {}
          }
        } else {
          setIsAdmin(false);
        }
        setIsInitializing(false);
      });
    };
    initializeApp();
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark'); else root.classList.remove('dark');
    root.dir = LANGUAGES_CONFIG[lang]?.dir || 'rtl';
    root.lang = lang;
    localStorage.setItem('preferred_lang', lang);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    root.style.setProperty('--brand-primary', siteConfig.primaryColor);
    root.style.setProperty('--brand-secondary', siteConfig.secondaryColor);
    root.style.setProperty('--site-font', siteConfig.fontFamily);
  }, [isDarkMode, lang, siteConfig]);

  if (isInitializing) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#050507] z-[9999]">
      <div className="relative"><div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900/20 rounded-full"></div><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div></div>
      <p className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] animate-pulse">{t('appName')}</p>
    </div>
  );

  if (isCardDeleted) return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-[#050507] text-white' : 'bg-slate-50 text-gray-900'}`}>
       <div className="w-32 h-32 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl animate-bounce-in"><Trash2 size={56} /></div>
       <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">{isRtl ? 'هذه البطاقة تم حذفها' : 'Card Deleted'}</h1>
       <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 font-bold leading-relaxed">{isRtl ? 'الرابط الذي تحاول الوصول إليه غير متاح حالياً، ربما قام صاحب البطاقة بحذفها أو تغيير الرابط الخاص بها.' : 'The link you are trying to access is no longer available. The owner might have deleted it or changed the URL.'}</p>
       <a href="/" className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">{isRtl ? 'أنشئ بطاقتك الخاصة الآن' : 'Create Your Own Card'}</a>
    </div>
  );

  if (publicCard) {
    const customTmpl = customTemplates.find(t => t.id === publicCard.templateId);
    return <PublicProfile data={publicCard} lang={lang} customConfig={customTmpl?.config} siteIcon={siteConfig.siteIcon} />;
  }

  const BottomNav = () => {
    if (!shouldShowBottomNav) return null;
    const navItems = [
      { id: 'home', path: '/', icon: HomeIcon, label: t('home') },
      { id: 'templates', path: '/templates', icon: LayoutGrid, label: t('templates') },
      { id: 'my-cards', path: '/my-cards', icon: CreditCard, label: t('myCards'), private: true },
      { id: 'pricing', path: '/pricing', icon: Zap, label: t('pricing') },
      { id: 'account', path: '/account', icon: UserIcon, label: t('account'), private: true },
    ];
    return (
      <div className="xl:hidden fixed bottom-0 left-0 w-full z-[1000] animate-fade-in-up">
        <div className="bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 p-1 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex items-center justify-around relative safe-area-bottom">
          {navItems.map((item) => {
            const isActive = location.pathname.endsWith(`/${lang}${item.path === '/' ? '' : item.path}`) || (item.path === '/' && location.pathname.endsWith(`/${lang}/`));
            if (item.private && !currentUser) {
              return (
                <button key={item.id} onClick={() => setShowAuthModal(true)} className="flex flex-col items-center gap-1.5 py-3 px-2 text-gray-400">
                  <item.icon size={20} />
                  <span className="text-[11px] font-black uppercase tracking-tighter">{item.label}</span>
                </button>
              );
            }
            return (
              <button 
                key={item.id} 
                onClick={() => navigateWithLang(item.path)} 
                className={`flex flex-col items-center gap-1.5 py-3 px-2 transition-all relative ${isActive ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
              >
                {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(37,99,235,0.4)]" />
                )}
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[11px] font-black uppercase tracking-tighter ${isActive ? 'scale-105' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)] bg-white/95 dark:bg-[#0a0a0c]/95" />
      </div>
    );
  };

  const Sidebar = () => (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <div className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-72 bg-white dark:bg-[#0a0a0c] z-[1200] shadow-2xl transition-transform duration-500 ease-out border-l border-gray-100 dark:border-gray-800 flex flex-col ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">ID</div>
             <span className="font-black dark:text-white uppercase tracking-tighter">Menu</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
           <SidebarItem icon={HomeIcon} label={t('home')} onClick={() => navigateWithLang('/')} active={location.pathname.endsWith(`/${lang}`) || location.pathname.endsWith(`/${lang}/`)} />
           <SidebarItem icon={HelpCircle} label={t('howToStart')} onClick={() => navigateWithLang('/how-to-start')} active={location.pathname.includes('/how-to-start')} />
           <SidebarItem icon={LayoutGrid} label={t('templates')} onClick={() => navigateWithLang('/templates')} active={location.pathname.includes('/templates')} />
           <SidebarItem icon={Zap} label={t('pricing')} onClick={() => navigateWithLang('/pricing')} active={location.pathname.includes('/pricing')} color="text-amber-500" />
           <SidebarItem icon={MessageSquare} label={t('customOrders')} onClick={() => navigateWithLang('/custom-orders')} active={location.pathname.includes('/custom-orders')} />
           {currentUser && (
             <>
               <div className="pt-4 pb-2"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-4">My Account</span></div>
               <SidebarItem icon={CreditCard} label={t('myCards')} onClick={() => navigateWithLang('/my-cards')} active={location.pathname.includes('/my-cards')} />
               <SidebarItem icon={UserIcon} label={t('account')} onClick={() => navigateWithLang('/account')} active={location.pathname.includes('/account')} />
               {isAdmin && <SidebarItem icon={ShieldCheck} label={t('admin')} onClick={() => navigateWithLang('/admin')} active={location.pathname.includes('/admin')} color="text-amber-600" />}
             </>
           )}
        </div>
        <div className="p-6 border-t border-gray-50 dark:border-gray-800 space-y-4">
           {!currentUser ? (
              <button onClick={() => { setShowAuthModal(true); setIsSidebarOpen(false); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">{t('login')}</button>
           ) : (
              <button onClick={() => signOut(auth)} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase hover:bg-red-100 transition-all">{t('logout')}</button>
           )}
        </div>
      </div>
    </>
  );

  const SidebarItem = ({ icon: Icon, label, onClick, active, color }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
       <div className="flex items-center gap-4">
          <Icon size={20} className={color || (active ? 'text-blue-600' : 'text-gray-400')} />
          <span className="text-sm font-black uppercase tracking-tight">{label}</span>
       </div>
       <ChevronRight size={16} className={`${isRtl ? 'rotate-180' : ''} opacity-30`} />
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`} style={{ fontFamily: 'var(--site-font), sans-serif' }}>
      <Sidebar />
      <header className="sticky top-0 z-[100] w-full bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="xl:hidden p-2 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 transition-all"><Menu size={22} /></button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateWithLang('/')}>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 group-hover:rotate-6 transition-transform shadow-lg shadow-blue-600/20">ID</div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black dark:text-white">{displaySiteName}</span>
                <span className="hidden sm:block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter mt-1">
                  {isRtl ? 'منصة متكاملة للهويات الرقمية' : 'Integrated Digital Identity Platform'}
                </span>
              </div>
            </div>
            <nav className="hidden xl:flex items-center gap-1 ml-4 mr-4">
              <button onClick={() => navigateWithLang('/')} className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase transition-all ${location.pathname.endsWith(`/${lang}`) || location.pathname.endsWith(`/${lang}/`) ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{t('home')}</button>
              <button onClick={() => navigateWithLang('/how-to-start')} className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase transition-all ${location.pathname.includes('/how-to-start') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{t('howToStart')}</button>
              <button onClick={() => navigateWithLang('/templates')} className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase transition-all ${location.pathname.includes('/templates') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{t('templates')}</button>
              <button onClick={() => navigateWithLang('/pricing')} className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase transition-all ${location.pathname.includes('/pricing') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{t('pricing')}</button>
              <button onClick={() => navigateWithLang('/custom-orders')} className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase transition-all ${location.pathname.includes('/custom-orders') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{t('customOrders')}</button>
              {currentUser && <button onClick={() => navigateWithLang('/my-cards')} className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase transition-all ${location.pathname.includes('/my-cards') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{t('myCards')}</button>}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle currentLang={lang} /><button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:text-blue-500 transition-colors">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <button 
                    onClick={() => navigateWithLang('/admin')} 
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase shadow-sm flex items-center gap-2 transition-all ${location.pathname.includes('/admin') ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                  >
                    <ShieldCheck size={14} />
                    {t('admin')}
                  </button>
                )}
                <button 
                  onClick={() => navigateWithLang('/account')} 
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase shadow-sm flex items-center gap-2 transition-all ${location.pathname.includes('/account') ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                >
                  <UserIcon size={14} />
                  {t('account')}
                </button>
                <button onClick={() => signOut(auth)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase hover:bg-red-100 transition-all">{t('logout')}</button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="hidden md:block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all">{t('login')}</button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Home lang={lang} onStart={() => navigateWithLang('/templates')} />} />
          <Route path="/how-to-start" element={<HowToStart lang={lang} />} />
          <Route path="/pricing" element={<Pricing lang={lang} />} />
          <Route path="/templates" element={<TemplatesGallery lang={lang} onSelect={(id) => { setSelectedTemplateId(id); setEditingCard(null); navigateWithLang('/editor'); }} />} />
          <Route path="/custom-orders" element={<CustomRequest lang={lang} />} />
          <Route path="/my-cards" element={currentUser ? <MyCards lang={lang} cards={userCards} onAdd={() => navigateWithLang('/templates')} onEdit={(c) => { setEditingCard(c); navigateWithLang('/editor'); }} onDelete={(id, uid) => deleteUserCard({ ownerId: uid, cardId: id }).then(() => window.location.reload())} /> : <Navigate to={`/${lang}/`} replace />} />
          <Route path="/editor" element={<Editor lang={lang} onSave={async (d, oldId) => { await saveCardToDB({cardData: d, oldId}); setSharingData(d); setShowShareModal(true); if (currentUser) { const updatedCards = await getUserCards(currentUser.uid); setUserCards(updatedCards as CardData[]); } }} templates={customTemplates} onCancel={() => navigateWithLang('/my-cards')} forcedTemplateId={selectedTemplateId || undefined} initialData={editingCard || undefined} />} />
          <Route path="/account" element={currentUser ? <UserAccount lang={lang} /> : <Navigate to={`/${lang}/`} replace />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard lang={lang} onEditCard={(c) => { setEditingCard(c); navigateWithLang('/editor'); }} onDeleteRequest={(id, uid) => deleteUserCard({ ownerId: uid, cardId: id }).then(() => window.location.reload())} /> : <Navigate to={`/${lang}/`} replace />} />
          <Route path="*" element={<Navigate to={`/${lang}/`} replace />} />
        </Routes>
      </main>
      {shouldShowFooter && <Footer lang={lang} />}
      <BottomNav />
      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); navigateWithLang('/my-cards'); }} />}
      {showShareModal && sharingData && <ShareModal data={sharingData} lang={lang} onClose={handleCloseShare} isNewSave={true} />}
    </div>
  );
};

const App: React.FC = () => {
  const browserLang = getBrowserLanguage();
  return (<HashRouter><Routes><Route path="/:lang/*" element={<AppContent />} /><Route path="/" element={<Navigate to={`/${browserLang}/`} replace />} /></Routes></HashRouter>);
};

export default App;
