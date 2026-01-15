
import React, { useState, useEffect } from 'react';
import { Language, CardData, TemplateConfig, CustomTemplate } from '../types';
import { generateShareUrl } from '../utils/share';
import { Copy, Check, Download, X, Send, Hash, ImageIcon, Loader2, UserPlus, Smartphone, ArrowUpRight, Compass, MessageSquare, QrCode as QrIcon, Share2 as ShareIcon, CheckCircle } from 'lucide-react';
import CardPreview from './CardPreview';
import { getAllTemplates } from '../services/firebase';
import { downloadVCard } from '../utils/vcard';
import { TRANSLATIONS } from '../constants';

interface ShareModalProps {
  data: CardData;
  lang: Language;
  onClose: () => void;
  isNewSave?: boolean; 
}

const ShareModal: React.FC<ShareModalProps> = ({ data, lang, onClose, isNewSave }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [customConfig, setCustomConfig] = useState<TemplateConfig | undefined>(undefined);
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  useEffect(() => {
    setUrl(generateShareUrl(data));
    getAllTemplates().then(templates => {
      const tmpl = (templates as CustomTemplate[]).find(t => t.id === data.templateId);
      if (tmpl) setCustomConfig(tmpl.config);
    });
  }, [data]);

  const getProfessionalText = () => {
    const name = data.name || (lang === 'ar' ? 'صاحب البطاقة' : 'Card Owner');
    const title = data.title ? `${data.title}` : '';
    const company = data.company ? ` | ${data.company}` : '';
    const bioInfo = title || company ? `\n(${title}${company})` : '';

    if (lang === 'ar') {
      return `*${name}*${bioInfo}\n\nيسعدني تواصلك معي عبر بطاقتي الرقمية الرسمية. يمكنك حفظ بياناتي والوصول لروابطي المهنية مباشرة من هنا:\n${url}`;
    }
    return `*${name}*${bioInfo}\n\nI'm pleased to connect with you through my official digital ID. You can save my contact details and access my professional links here:\n${url}`;
  };

  const handleImageShare = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const captureTarget = document.getElementById('pro-share-capture-area');
      if (!captureTarget) throw new Error("Capture target not found");

      // @ts-ignore
      const canvas = await window.html2canvas(captureTarget, {
        useCORS: true, 
        allowTaint: false,
        scale: 3, 
        backgroundColor: null,
        logging: false,
        width: 1080,
        height: 1080,
        windowWidth: 1080,
        windowHeight: 1080
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      
      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'card.jpg', { type: 'image/jpeg' })] })) {
        const file = new File([blob], `${data.id || 'card'}.jpg`, { type: 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: data.name,
          text: getProfessionalText()
        });
      } else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.download = `digital-id-${data.id}.jpg`;
        link.click();
      }
    } catch (err) {
      console.error("Capture Error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=2563eb&margin=1`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      
      {/* المنطقة المخفية لتوليد البوستر الاحترافي */}
      <div className="fixed top-0 left-0 -translate-x-[5000px] pointer-events-none" style={{ width: '1080px', height: '1080px' }}>
          <div id="pro-share-capture-area" className="w-[1080px] h-[1080px] relative overflow-hidden bg-white flex items-center justify-center font-sans">
              <div className="absolute inset-0 z-0" style={{ 
                background: data.themeType === 'gradient' ? data.themeGradient : (data.themeColor || '#2563eb'),
                opacity: 0.1
              }}></div>
              <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[150px]" style={{ background: data.themeColor || '#2563eb', opacity: 0.2 }}></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]" style={{ background: '#8b5cf6', opacity: 0.15 }}></div>

              <div className="relative z-10 w-[850px] bg-white rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col items-center p-16 space-y-12">
                  <div className="flex items-center gap-4 opacity-40">
                     <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs">ID</div>
                     <span className="text-xl font-black uppercase tracking-[0.3em] text-gray-900">NextID Official</span>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-8">
                     <div className="w-56 h-56 rounded-[4rem] border-[12px] border-gray-50 shadow-2xl overflow-hidden bg-white">
                        {data.profileImage ? (
                          <img src={data.profileImage} className="w-full h-full object-cover" crossOrigin="anonymous" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                             <UserPlus size={80} />
                          </div>
                        )}
                     </div>
                     <div className="space-y-4">
                        <h2 className="text-6xl font-black text-gray-900 tracking-tight">{data.name || 'Your Name'}</h2>
                        <p className="text-3xl font-bold text-blue-600 uppercase tracking-widest opacity-80">
                           {data.title || 'Digital Professional'}
                           {data.company && ` • ${data.company}`}
                        </p>
                     </div>
                  </div>

                  <div className="w-full flex items-center justify-between bg-gray-50/50 rounded-[4rem] p-12 border border-gray-100">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600">
                           <CheckCircle size={24} />
                           <span className="text-xl font-black uppercase tracking-widest">{isRtl ? 'هوية رقمية موثقة' : 'Verified Digital ID'}</span>
                        </div>
                        <h4 className="text-4xl font-black text-gray-800 leading-tight">
                           {isRtl ? 'امسح الرمز للتواصل' : 'Scan to Connect'}
                        </h4>
                        <p className="text-xl font-bold text-gray-400">nextid.my/?u={data.id}</p>
                     </div>
                     <div className="p-6 bg-white rounded-[3rem] shadow-xl border border-gray-100">
                        <img src={qrImageUrl} className="w-48 h-48" alt="QR" crossOrigin="anonymous" />
                     </div>
                  </div>
                  <p className="text-xl font-bold text-gray-400 italic">
                    {isRtl ? 'يسعدني تواصلك معي عبر هويتي الرقمية الرسمية' : 'I am pleased to connect with you via my official digital identity'}
                  </p>
              </div>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative animate-zoom-in">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
             <div className="flex flex-col">
                {isNewSave && (
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 w-fit">
                      <Check size={10} />
                      {isRtl ? 'تم الحفظ بنجاح' : 'Saved Successfully'}
                   </div>
                )}
                <h3 className="text-2xl font-black dark:text-white">
                  {isRtl ? 'مشاركة هويتك' : 'Share Identity'}
                </h3>
             </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative group cursor-pointer" onClick={handleImageShare}>
              <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="relative p-6 bg-white rounded-[2.5rem] shadow-inner border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-3">
                <img src={qrImageUrl} alt="QR" className="w-28 h-28" crossOrigin="anonymous" />
                <div className="flex items-center gap-1.5 text-blue-600">
                   <ImageIcon size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">{isRtl ? 'اضغط لتوليد الصورة' : 'Click to Generate Image'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* الزر المحدث ليطابق الصورة المرفقة تماماً */}
            <button 
              onClick={handleImageShare}
              disabled={isCapturing}
              className="w-full py-5 bg-emerald-600 text-white rounded-full font-black text-xs uppercase flex items-center justify-center gap-4 shadow-xl shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-70 group"
            >
              <span className="flex-1 text-center pr-4">
                {isCapturing ? (isRtl ? 'جاري التوليد...' : 'Generating...') : (isRtl ? 'مشاركة كصورة (احترافية)' : 'Share as Pro Image')}
              </span>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={20} />}
              </div>
            </button>

            <button 
              onClick={() => {
                 if (navigator.share) {
                    navigator.share({
                      title: data.name,
                      text: getProfessionalText(),
                      url: url
                    });
                 } else {
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                 }
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase flex items-center justify-center gap-3 shadow-lg shadow-blue-600/10 hover:brightness-110 active:scale-95 transition-all"
            >
              <Send size={16} />
              {isRtl ? 'إرسال الرابط مباشرة' : 'Send Link Directly'}
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`py-4 rounded-[1.5rem] font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all border ${copied ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-700'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? (isRtl ? 'تم النسخ' : 'Copied!') : (isRtl ? 'نسخ الرابط' : 'Copy Link')}
              </button>
              <button 
                 onClick={() => downloadVCard(data)}
                 className="py-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-white rounded-[1.5rem] font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-transparent"
              >
                <UserPlus size={14} />
                {t('saveContact')}
              </button>
            </div>
          </div>
          <p className="text-[9px] font-bold text-gray-400 text-center mt-6 uppercase tracking-[0.2em] opacity-60">
             {isRtl ? 'تصميم البطاقة محمي بنظام NextID' : 'Design protected by NextID system'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
