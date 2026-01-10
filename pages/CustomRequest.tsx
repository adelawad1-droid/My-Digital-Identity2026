
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { getSiteSettings } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { 
  Send, Building2, Palette, LayoutGrid, CheckCircle2, 
  Loader2, MessageSquare, Phone, AlertCircle, Tag,
  Globe, Share2, ImagePlus, X, Mail
} from 'lucide-react';

interface CustomRequestProps {
  lang: Language;
}

const CustomRequest: React.FC<CustomRequestProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    count: '',
    message: '',
    website: '',
    social: '',
    logoFile: null as File | null,
    logoPreview: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [uploadConfig, setUploadConfig] = useState({ storageType: 'firebase', uploadUrl: '' });
  const [contactInfo, setContactInfo] = useState({
    email: 'info@nextid.my',
    phone: '966560817601'
  });

  useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings) {
        setContactInfo({
          email: settings.siteContactEmail || 'info@nextid.my',
          phone: settings.siteContactPhone || '966560817601'
        });
        setUploadConfig({
          storageType: (settings.imageStorageType as any) || 'firebase',
          uploadUrl: settings.serverUploadUrl || ''
        });
      }
    });
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ 
        ...formData, 
        logoFile: file, 
        logoPreview: URL.createObjectURL(file) 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let finalLogoUrl = '';

      if (formData.logoFile) {
        const uploadedUrl = await uploadImageToCloud(formData.logoFile, 'logo', uploadConfig as any);
        if (uploadedUrl) finalLogoUrl = uploadedUrl;
      }

      const payload = {
        fullName: formData.name,
        companyName: formData.company,
        email: formData.email,
        phone: formData.phone,
        staffCount: formData.count,
        website: formData.website,
        socialMedia: formData.social,
        logoUrl: finalLogoUrl,
        details: formData.message
      };

      // استخدام مسار مباشر لملف PHP
      const response = await fetch('contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setSubmitted(true);
        setFormData({ 
          name: '', company: '', email: '', phone: '', count: '', 
          message: '', website: '', social: '', logoFile: null, logoPreview: '' 
        });
      } else {
        throw new Error(result.message || 'فشل الخادم في إرسال البريد');
      }
    } catch (err: any) {
      setError(isRtl ? `خطأ: تأكد من وجود ملف contact.php على السيرفر (${err.message})` : `Error: (${err.message})`);
    } finally {
      setLoading(false);
    }
  };

  const inputGroupClasses = "p-6 bg-gray-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-gray-100 dark:border-white/5 space-y-6";
  const inputLabelClasses = "text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block mb-2";
  const inputFieldClasses = "w-full px-6 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm";

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050507] pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      <section className="relative overflow-hidden bg-blue-600 dark:bg-blue-900 py-24 md:py-32 px-6">
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">{t('corporateTitle')}</h1>
          <p className="text-blue-100 text-lg md:text-xl font-bold max-w-2xl mx-auto opacity-90">{t('corporateDesc')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800">
            {submitted ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                <h3 className="text-2xl font-black dark:text-white mb-4">{t('requestSuccess')}</h3>
                <button onClick={() => setSubmitted(false)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">{isRtl ? 'إرسال طلب آخر' : 'Send Another'}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                    <AlertCircle className="text-red-500" size={20} /><p className="text-xs font-bold text-red-600">{error}</p>
                  </div>
                )}
                
                <div className={inputGroupClasses}>
                  <div className="flex items-center gap-2 mb-2 text-blue-600"><Building2 size={16} /><span className="text-[10px] font-black uppercase">{isRtl ? 'بيانات الجهة' : 'Org Details'}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className={inputLabelClasses}>{t('fullName')}</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputFieldClasses} /></div>
                    <div className="space-y-1"><label className={inputLabelClasses}>{t('companyName')}</label><input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className={inputFieldClasses} /></div>
                  </div>
                </div>

                <div className={inputGroupClasses}>
                  <div className="flex items-center gap-2 mb-2 text-indigo-600"><Mail size={16} /><span className="text-[10px] font-black uppercase">{isRtl ? 'بيانات التواصل' : 'Contact'}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className={inputLabelClasses}>{t('email')}</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputFieldClasses} /></div>
                    <div className="space-y-1"><label className={inputLabelClasses}>{t('phone')}</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputFieldClasses} /></div>
                  </div>
                </div>

                <div className={inputGroupClasses}>
                  <div className="flex items-center gap-2 mb-2 text-emerald-600"><Globe size={16} /><span className="text-[10px] font-black uppercase">{isRtl ? 'الحضور الرقمي' : 'Presence'}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className={inputLabelClasses}>{t('websiteLink')}</label><input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className={inputFieldClasses} placeholder="https://..." /></div>
                    <div className="space-y-1"><label className={inputLabelClasses}>{t('socialLink')}</label><input type="text" value={formData.social} onChange={e => setFormData({...formData, social: e.target.value})} className={inputFieldClasses} placeholder="@username" /></div>
                  </div>
                </div>

                <div className={inputGroupClasses}>
                  <div className="flex items-center gap-2 mb-2 text-purple-600"><Tag size={16} /><span className="text-[10px] font-black uppercase">{isRtl ? 'تفاصيل إضافية' : 'Details'}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className={inputLabelClasses}>{t('staffCount')}</label><input type="number" required value={formData.count} onChange={e => setFormData({...formData, count: e.target.value})} className={inputFieldClasses} /></div>
                    <div className="space-y-1">
                      <label className={inputLabelClasses}>{t('logoLabel')}</label>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-gray-400"><ImagePlus size={18} /> {formData.logoFile ? formData.logoFile.name : t('uploadAction')}</button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </div>
                  </div>
                  <textarea rows={4} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className={`${inputFieldClasses} resize-none`} placeholder={isRtl ? 'أخبرنا المزيد...' : 'Details...'} />
                </div>

                <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}{t('submitRequest')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRequest;
