
import { Mail, Phone, Globe, MessageCircle, UserPlus, Camera, Download, QrCode, Cpu, Calendar, MapPin, Timer, PartyPopper, Navigation2, Quote, Sparkle, CheckCircle, Star, ExternalLink, Map as MapIcon, Link as LinkIcon, ShoppingCart, ShieldCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { CardData, Language, TemplateConfig, SpecialLinkItem } from '../types';
import { TRANSLATIONS, PATTERN_PRESETS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { generateShareUrl } from '../utils/share';
import SocialIcon, { BRAND_COLORS } from './SocialIcon';

interface CardPreviewProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
  hideSaveButton?: boolean; 
  isFullFrame?: boolean; 
  hideHeader?: boolean; 
  bodyOffsetYOverride?: number;
  forCapture?: boolean; 
}

const MembershipBar = ({ 
  startDate, 
  expiryDate, 
  title, 
  isDark, 
  isGlassy,
  bgColor,
  borderColor,
  textColor,
  accentColor
}: { 
  startDate?: string, 
  expiryDate?: string, 
  title?: string, 
  isDark: boolean, 
  isGlassy?: boolean,
  bgColor?: string,
  borderColor?: string,
  textColor?: string,
  accentColor?: string
}) => {
  if (!expiryDate) return null;

  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const end = new Date(expiryDate);
  
  const total = end.getTime() - start.getTime();
  const remaining = end.getTime() - now.getTime();
  const progress = Math.max(0, Math.min(100, (remaining / total) * 100));
  const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));

  let dynamicColor = accentColor;
  if (!dynamicColor) {
    const r = Math.floor(239 - (239 - 34) * (progress / 100));
    const g = Math.floor(68 + (197 - 68) * (progress / 100));
    const b = Math.floor(68 + (94 - 68) * (progress / 100));
    dynamicColor = `rgb(${r}, ${g}, ${b})`;
  }

  const finalBg = bgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(249, 250, 251, 1)');
  const finalBorder = borderColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(243, 244, 246, 1)');
  const finalTextColor = textColor || (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(107, 114, 128, 1)');

  return (
    <div 
      className={`w-full p-5 rounded-[2rem] border transition-all duration-500 animate-fade-in-up ${isGlassy ? 'backdrop-blur-xl' : ''}`}
      style={{ 
        backgroundColor: finalBg,
        borderColor: finalBorder,
        fontFamily: 'inherit'
      }}
    >
       <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
             <ShieldCheck size={16} style={{ color: dynamicColor }} />
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: textColor || undefined, fontFamily: 'inherit' }}>{title || (daysLeft > 0 ? 'ACTIVE SUBSCRIPTION' : 'EXPIRED')}</span>
          </div>
          <span className="text-[10px] font-black" style={{ color: dynamicColor, fontFamily: 'inherit' }}>{daysLeft > 0 ? `${daysLeft} DAYS LEFT` : 'EXPIRED'}</span>
       </div>
       <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full transition-all duration-1000 ease-out rounded-full shadow-lg"
            style={{ 
              width: `${progress}%`, 
              backgroundColor: dynamicColor,
              boxShadow: `0 0 10px ${dynamicColor}44`
            }}
          />
       </div>
       <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-tighter" style={{ color: finalTextColor, fontFamily: 'inherit' }}>
          <span>{start.toLocaleDateString()}</span>
          <span>{end.toLocaleDateString()}</span>
       </div>
    </div>
  );
};

const CountdownTimer = ({ targetDate, isDark, primaryColor, lang }: { targetDate: string, isDark: boolean, primaryColor: string, lang: Language }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      if (!targetDate) return;
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;

  const Unit = ({ val, label }: { val: number, label: string }) => (
    <div className={`flex flex-col items-center justify-center w-full p-3 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} border shadow-sm transition-all duration-500 hover:scale-105`} style={{ fontFamily: 'inherit' }}>
      <span className="text-xl font-black leading-none" style={{ color: primaryColor, fontFamily: 'inherit' }}>{val}</span>
      <span className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1.5" style={{ fontFamily: 'inherit' }}>{label}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-2 w-full mt-6 animate-fade-in-up" style={{ animationDelay: '300ms', fontFamily: 'inherit' }}>
      <Unit val={timeLeft.s} label={t('unitSeconds')} />
      <Unit val={timeLeft.m} label={t('unitMinutes')} />
      <Unit val={timeLeft.h} label={t('unitHours')} />
      <Unit val={timeLeft.d} label={t('unitDays')} />
    </div>
  );
};

const CardPreview: React.FC<CardPreviewProps> = ({ data, lang, customConfig, hideSaveButton = false, isFullFrame = false, hideHeader = false, bodyOffsetYOverride, forCapture = false }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;

  const config = customConfig || {} as TemplateConfig;
  const isDark = data.isDark ?? config.defaultIsDark ?? false;
  const themeType = data.themeType || config.defaultThemeType || 'gradient';
  const themeColor = data.themeColor || config.defaultThemeColor || '#3b82f6';
  const themeGradient = data.themeGradient || config.defaultThemeGradient || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
  const backgroundImage = data.backgroundImage || config.defaultBackgroundImage;

  const headerType = config.headerType || 'classic';
  const headerHeight = config.headerHeight || 180;

  const nameColor = data.nameColor || config.nameColor || (isDark ? '#ffffff' : '#111827');
  const titleColor = data.titleColor || config.titleColor || '#2563eb';
  const linksColor = data.linksColor || config.linksColor || '#3b82f6';
  const socialIconsColor = data.socialIconsColor || config.socialIconsColor || linksColor;
  const phoneBtnColor = data.contactPhoneColor || config.contactPhoneColor || '#2563eb';
  const phoneTextColor = data.contactPhoneTextColor || config.contactPhoneTextColor || '#ffffff';
  const whatsappBtnColor = data.contactWhatsappColor || config.contactWhatsappColor || '#10b981';
  const whatsappTextColor = data.contactWhatsappTextColor || config.contactWhatsappTextColor || '#ffffff';

  const getImgProps = (url: string) => {
    if (!url) return {};
    const isExternal = url.startsWith('http');
    if (forCapture && isExternal) {
      return { src: url, crossOrigin: 'anonymous' as const };
    }
    return { src: url };
  };

  const hexToRgb = (hex: string) => {
    hex = (hex || '#000000').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return { r, g, b, string: `${r}, ${g}, ${b}` };
  };

  const bTextColor = data.bioTextColor || config.bioTextColor || (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
  let bBgColor = data.bioBgColor || config.bioBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
  const bGlassy = data.bioGlassy ?? config.bioGlassy;
  const bOpacity = (data.bioOpacity ?? config.bioOpacity ?? 100) / 100;
  if (bGlassy && bBgColor.startsWith('#')) {
    const rgb = hexToRgb(bBgColor);
    bBgColor = `rgba(${rgb.string}, ${bOpacity})`;
  } else if (!bBgColor.startsWith('rgba') && bOpacity < 1) {
    const rgb = hexToRgb(bBgColor);
    bBgColor = `rgba(${rgb.string}, ${bOpacity})`;
  }

  const bioStyles: React.CSSProperties = {
    backgroundColor: bBgColor,
    transform: `translate(${data.bioOffsetX ?? config.bioOffsetX ?? 0}px, ${data.bioOffsetY ?? config.bioOffsetY ?? 0}px)`,
    maxWidth: `${data.bioMaxWidth ?? config.bioMaxWidth ?? 90}%`,
    borderRadius: `${data.bioBorderRadius ?? config.bioBorderRadius ?? 32}px`,
    borderWidth: `${data.bioBorderWidth ?? config.bioBorderWidth ?? 1}px`,
    borderColor: data.bioBorderColor ?? config.bioBorderColor ?? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
    paddingTop: `${data.bioPaddingV ?? config.bioPaddingV ?? 20}px`,
    paddingBottom: `${data.bioPaddingV ?? config.bioPaddingV ?? 20}px`,
    paddingLeft: `${data.bioPaddingH ?? config.bioPaddingH ?? 20}px`,
    paddingRight: `${data.bioPaddingH ?? config.bioPaddingH ?? 20}px`,
    backdropFilter: bGlassy ? 'blur(15px)' : 'none',
    WebkitBackdropFilter: bGlassy ? 'blur(15px)' : 'none',
    textAlign: (data.bioTextAlign ?? config.bioTextAlign ?? 'center') as any,
    fontFamily: 'inherit'
  };

  const isLocGlassy = config.locationGlassy;
  let locBg = config.locationBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.05)');
  if (isLocGlassy && locBg.startsWith('#')) {
    const rgb = hexToRgb(locBg);
    locBg = `rgba(${rgb.string}, 0.2)`;
  }
  const locIconColor = config.locationIconColor || themeColor;
  const locTextColor = config.locationTextColor || (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.8)');
  const locRadius = config.locationBorderRadius ?? 24;
  const locPaddingV = config.locationPaddingV ?? 20; 
  const locAddressSize = config.locationAddressSize ?? 13; 

  const dLinksShowBg = data.linksShowBg ?? config.linksShowBg ?? true;
  const dLinksShowText = data.linksShowText ?? config.linksShowText ?? true;
  const isDLinksGlassy = config.linksSectionGlassy;
  
  let dLinksSectionBg = config.linksSectionBgColor || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)');
  if (isDLinksGlassy && dLinksSectionBg.startsWith('#')) {
    const rgb = hexToRgb(dLinksSectionBg);
    dLinksSectionBg = `rgba(${rgb.string}, 0.2)`;
  }

  const dLinksTextColor = config.linksSectionTextColor || (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.8)');
  const dLinksIconColor = config.linksSectionIconColor || themeColor;
  const dLinksRadius = config.linksSectionRadius ?? 24;
  const dLinksVariant = config.linksSectionVariant || 'list';
  const dLinksItemBg = config.linksItemBgColor || (isDark ? 'rgba(255,255,255,0.1)' : '#ffffff');
  const dLinksItemRadius = config.linksItemRadius ?? (dLinksVariant === 'pills' ? 999 : 16);
  const dLinksSectionPaddingV = data.linksSectionPaddingV ?? config.linksSectionPaddingV ?? 24;

  const isVerified = data.isVerified ?? config.isVerifiedByDefault;
  const showStars = data.showStars ?? config.showStarsByDefault;
  const hasGoldenFrame = data.hasGoldenFrame ?? config.hasGoldenFrameByDefault;

  const qrColorVal = (data.qrColor || config.qrColor || themeColor || '#000000').replace('#', '');
  const qrBgColor = data.qrBgColor || config.qrBgColor || (isDark ? '#111115' : '#ffffff');
  const qrSize = data.qrSize || config.qrSize || 90;
  const qrBorderWidth = data.qrBorderWidth ?? config.qrBorderWidth ?? 0;
  const qrBorderColor = data.qrBorderColor || config.qrBorderColor || 'transparent';
  const qrBorderRadius = data.qrBorderRadius ?? config.qrBorderRadius ?? 0;
  const qrOffsetY = data.qrOffsetY ?? config.qrOffsetY ?? 0;
  const qrOffsetX = data.qrOffsetX ?? config.qrOffsetX ?? 0;

  const cardUrl = generateShareUrl(data);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cardUrl)}&bgcolor=${qrBgColor === 'transparent' ? (isDark ? '0f0f12' : 'ffffff') : qrBgColor.replace('#', '')}&color=${qrColorVal}&margin=0`;

  const isVisible = (dataField: boolean | undefined, configField: boolean | undefined) => {
    if (dataField !== undefined) return dataField;
    return configField !== false; 
  };

  const showName = isVisible(data.showName, config.showNameByDefault);
  const showTitle = isVisible(data.showTitle, config.showTitleByDefault);
  const showCompany = isVisible(data.showCompany, config.showCompanyByDefault);
  const showBio = isVisible(data.showBio, config.showBioByDefault);
  const showProfileImage = isVisible(data.showProfileImage, config.avatarStyle !== 'none');
  const showEmail = isVisible(data.showEmail, config.showEmailByDefault);
  const showPhone = isVisible(data.showPhone, config.showPhoneByDefault);
  const showWebsite = isVisible(data.showWebsite, config.showWebsiteByDefault);
  const showWhatsapp = isVisible(data.showWhatsapp, config.showWhatsappByDefault);
  const showSocialLinks = isVisible(data.showSocialLinks, config.showSocialLinksByDefault);
  const showButtons = isVisible(data.showButtons, config.showButtonsByDefault);
  const showQrCode = isVisible(data.showQrCode, config.showQrCodeByDefault);
  const showSpecialLinks = isVisible(data.showSpecialLinks, config.showSpecialLinksByDefault);
  const showOccasion = isVisible(data.showOccasion, config.showOccasionByDefault);
  const showLocation = isVisible(data.showLocation, config.showLocationByDefault);
  const showMembership = isVisible(data.showMembership, config.showMembershipByDefault);
  const showFloatingAsset = isVisible(data.showFloatingAsset, config.showFloatingAssetByDefault);

  const finalPhones = data.phones && data.phones.length > 0 ? data.phones : (data.phone ? [data.phone] : []);
  const finalWhatsapps = data.whatsapps && data.whatsapps.length > 0 ? data.whatsapps : (data.whatsapp ? [data.whatsapp] : []);

  const hasContactButtons = (showPhone && finalPhones.length > 0) || 
                           (showWhatsapp && finalWhatsapps.length > 0) || 
                           (!hideSaveButton && showButtons);

  const getHeaderStyles = (): React.CSSProperties => {
    const opacity = (config.headerOpacity ?? 100) / 100;
    const isGlassy = config.headerGlassy;
    let baseStyle: React.CSSProperties = { 
      height: `${headerHeight}px`,
      width: '100%',
      position: headerType === 'overlay' ? 'absolute' : 'relative',
      top: 0,
      left: 0,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 0,
      overflow: 'hidden'
    };
    
    if (config.headerCustomAsset) {
      baseStyle = { ...baseStyle, backgroundImage: `url(${config.headerCustomAsset})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (themeType === 'image' && backgroundImage) {
      baseStyle = { ...baseStyle, backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (themeType === 'gradient' && themeGradient) {
      baseStyle = { ...baseStyle, background: themeGradient };
    } else {
      baseStyle = { ...baseStyle, backgroundColor: themeColor };
    }
    
    if (isGlassy) {
      baseStyle = { 
        ...baseStyle, 
        backgroundColor: isDark ? `rgba(15, 15, 20, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
      };
    }

    switch(headerType) {
      case 'curved': baseStyle.clipPath = 'ellipse(100% 100% at 50% 0%)'; break;
      case 'diagonal': baseStyle.clipPath = 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'; break;
      case 'split-left': baseStyle.clipPath = 'polygon(0 0, 100% 0, 100% 60%, 0 100%)'; break;
      case 'split-right': baseStyle.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 60%)'; break;
      case 'wave': baseStyle.clipPath = 'polygon(0% 0%, 100% 0%, 100% 85%, 90% 88%, 80% 90%, 70% 89%, 60% 86%, 50% 84%, 40% 83%, 30% 85%, 20% 88%, 10% 90%, 0% 88%)'; break;
      case 'side-left': baseStyle.width = '25%'; baseStyle.height = '100%'; baseStyle.position = 'absolute'; baseStyle.left = '0'; break;
      case 'side-right': baseStyle.width = '25%'; baseStyle.height = '100%'; baseStyle.position = 'absolute'; baseStyle.right = '0'; break;
      case 'floating': baseStyle.width = 'calc(100% - 32px)'; baseStyle.margin = '16px auto'; baseStyle.borderRadius = '32px'; break;
      case 'glass-card': baseStyle.width = 'calc(100% - 48px)'; baseStyle.margin = '24px auto'; baseStyle.borderRadius = '40px'; baseStyle.backdropFilter = 'blur(20px)'; break;
      case 'modern-split': baseStyle.clipPath = 'polygon(0 0, 100% 0, 75% 100%, 0 100%)'; break;
      case 'top-bar': baseStyle.height = '12px'; break;
      case 'minimal': baseStyle.height = '4px'; break;
      case 'hero': baseStyle.height = '350px'; break;
    }

    return baseStyle;
  };

  const isBodyGlassy = data.bodyGlassy ?? config.bodyGlassy;
  const bodyOpacity = (data.bodyOpacity ?? config.bodyOpacity ?? 100) / 100;
  
  const bodyBaseColor = data.cardBodyColor || config.cardBodyColor || (isDark ? '#1a1a20' : '#ffffff');
  const bodyBgImage = data.cardBodyBackgroundImage || config.cardBodyBackgroundImage;
  const bodyThemeType = data.cardBodyThemeType || config.cardBodyThemeType || 'color';
  const rgbBody = hexToRgb(bodyBaseColor);

  const needsSideMargins = headerType.startsWith('side') || isBodyGlassy || bodyOpacity < 1 || config.headerType === 'floating' || hideHeader;

  const finalBodyOffsetY = bodyOffsetYOverride !== undefined ? bodyOffsetYOverride : (data.bodyOffsetY ?? config.bodyOffsetY ?? 0);
  const finalBodyOffsetX = data.bodyOffsetX ?? config.bodyOffsetX ?? 0;

  const bodyContentStyles: React.CSSProperties = {
    marginTop: hideHeader ? '0px' : (headerType === 'overlay' ? '40px' : (headerType.startsWith('side') ? '40px' : '-40px')),
    transform: `translate(${finalBodyOffsetX}px, ${finalBodyOffsetY}px)`, 
    borderRadius: `${data.bodyBorderRadius ?? config.bodyBorderRadius ?? 48}px`,
    paddingTop: '24px',
    paddingBottom: forCapture ? '0px' : '24px', 
    position: 'relative',
    zIndex: 20,
    width: (needsSideMargins || hideHeader) ? 'calc(100% - 32px)' : '100%',
    margin: (needsSideMargins || hideHeader) ? '0 auto' : '0',
    backdropFilter: isBodyGlassy ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: isBodyGlassy ? 'blur(15px)' : 'none',
    border: (needsSideMargins || hideHeader) ? (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)') : 'none',
    textAlign: config.contentAlign || 'center',
    marginLeft: headerType === 'side-left' ? '28%' : (headerType === 'side-right' ? '2%' : ((needsSideMargins || hideHeader) ? 'auto' : '0')),
    marginRight: headerType === 'side-right' ? '28%' : (headerType === 'side-left' ? '2%' : ((needsSideMargins || hideHeader) ? 'auto' : '0')),
    minHeight: forCapture ? '200px' : '400px', 
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: (needsSideMargins || hideHeader) ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : 'none',
    fontFamily: 'inherit'
  };

  if (bodyThemeType === 'image' && bodyBgImage) {
    bodyContentStyles.backgroundImage = `url(${bodyBgImage})`;
    bodyContentStyles.backgroundSize = 'cover';
    bodyContentStyles.backgroundPosition = 'center';
  } else {
    bodyContentStyles.backgroundColor = `rgba(${rgbBody.string}, ${bodyOpacity})`;
  }

  const finalCardBaseGroundColor = hideHeader ? 'transparent' : (data.cardBgColor || config.cardBgColor || (isDark ? '#0f0f12' : '#f1f5f9'));

  const showAnimatedBorder = config.avatarAnimatedBorder;
  const borderClr1 = config.avatarAnimatedBorderColor1 || themeColor;
  const borderClr2 = config.avatarAnimatedBorderColor2 || '#ffffff';
  const borderSpeed = config.avatarAnimatedBorderSpeed || 3;

  const showBodyFeature = isVisible(data.showBodyFeature, config.showBodyFeatureByDefault);
  const featureContent = data.bodyFeatureText || (isRtl ? config.bodyFeatureTextAr : config.bodyFeatureTextEn) || '';
  const featurePaddingX = config.bodyFeaturePaddingX ?? 0;
  const featureBg = config.bodyFeatureBgColor || themeColor;
  const featureTextColor = config.bodyFeatureTextColor || '#ffffff';
  const isFeatureGlassy = config.bodyFeatureGlassy;
  const featureContent_Height = config.bodyFeatureHeight || 45;
  const featureRadius = config.bodyFeatureBorderRadius ?? 16;
  const featureOffsetY = data.bodyFeatureOffsetY ?? config.bodyFeatureOffsetY ?? 0;
  const featureOffsetX = data.bodyFeatureOffsetX ?? config.bodyFeatureOffsetX ?? 0;

  const sStyle = config.socialIconStyle || 'rounded';
  const sSize = config.socialIconSize || 22;
  const sPadding = config.socialIconPadding || 14;
  const sGap = config.socialIconGap || 12;
  const sCols = data.socialIconColumns !== undefined ? data.socialIconColumns : (config.socialIconColumns || 0);
  const sVariant = config.socialIconVariant || 'filled';
  const sBg = config.socialIconBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
  const sColor = config.socialIconColor || socialIconsColor;
  const sBorderWidth = config.socialIconBorderWidth || 1;
  const sBorderColor = config.socialIconBorderColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');
  const useBrandColors = data.useSocialBrandColors !== undefined ? data.useSocialBrandColors : config.useSocialBrandColors;

  const getSocialBtnStyles = (platformId: string): React.CSSProperties => {
    const brandColor = BRAND_COLORS[platformId];
    let style: React.CSSProperties = {
      padding: `${sPadding}px`,
      color: (useBrandColors && brandColor) ? (sVariant === 'filled' ? '#ffffff' : brandColor) : sColor,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (sStyle === 'circle') style.borderRadius = '9999px';
    else if (sStyle === 'squircle') style.borderRadius = '28%';
    else if (sStyle === 'rounded') style.borderRadius = '16px';
    else if (sStyle === 'square') style.borderRadius = '0px';

    if (sVariant === 'filled') {
      style.backgroundColor = (useBrandColors && brandColor) ? brandColor : sBg;
      style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
    } else if (sVariant === 'outline') {
      style.border = `${sBorderWidth}px solid ${(useBrandColors && brandColor) ? brandColor : sBorderColor}`;
    } else if (sVariant === 'glass') {
      style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)';
      style.backdropFilter = 'blur(10px)';
      style.WebkitBackdropFilter = 'blur(10px)';
      style.border = `1px solid ${(useBrandColors && brandColor) ? brandColor + '44' : 'rgba(255,255,255,0.1)'}`;
    }

    return style;
  };

  const getAvatarRadiusClasses = (inner: boolean = false) => {
    if (config.avatarStyle === 'circle') return 'rounded-full';
    if (config.avatarStyle === 'square') return 'rounded-none';
    return inner ? 'rounded-[22%]' : 'rounded-[28%]';
  };

  const slCols = data.specialLinksCols || config.specialLinksCols || 2;
  const slGap = config.specialLinksGap || 12;
  const slRadius = config.specialLinksRadius ?? 24;
  const slAspect = data.specialLinksAspectRatio || config.specialLinksAspectRatio || 'square';
  const slOffsetY = data.specialLinksOffsetY ?? config.specialLinksOffsetY ?? 0;
  const slOffsetX = data.specialLinksOffsetX ?? config.specialLinksOffsetX ?? 0;

  const finalEmails = data.emails && data.emails.length > 0 ? data.emails : (data.email ? [data.email] : []);
  const finalWebsites = data.websites && data.websites.length > 0 ? data.websites : (data.website ? [data.website] : []);
  const hasDirectLinks = (showEmail && finalEmails.length > 0) || (showWebsite && finalWebsites.length > 0);

  const finalName = data.name?.trim() || config.defaultName || '---';
  const finalTitle = data.title?.trim() || config.defaultTitle || '';
  const finalCompany = data.company?.trim() || config.defaultCompany || '';
  const finalSpecialLinks = (data.specialLinks && data.specialLinks.length > 0) ? data.specialLinks : (config.defaultSpecialLinks || []);
  const finalBio = data.bio?.trim() || (isRtl ? config.defaultBioAr : config.defaultBioEn) || '';
  const finalProfileImage = data.profileImage || config.defaultProfileImage;

  const cbRadius = config.contactButtonsRadius ?? 16;
  const cbGap = config.contactButtonsGap ?? 12;
  const cbPaddingV = config.contactButtonsPaddingV ?? 16;
  const cbGlassy = config.contactButtonsGlassy;
  const cbVariant = config.contactButtonsVariant || 'buttons';

  const getContactBtnStyle = (baseColor: string, textColorProp?: string): React.CSSProperties => {
    let finalRadius = `${cbRadius}px`;
    if (cbVariant === 'pills' || cbVariant === 'icons-circle') finalRadius = '999px';
    else if (cbVariant === 'icons-square') finalRadius = '16px';

    const style: React.CSSProperties = {
      backgroundColor: cbGlassy ? `rgba(${hexToRgb(baseColor).string}, 0.15)` : baseColor,
      borderRadius: finalRadius,
      paddingTop: `${cbPaddingV}px`,
      paddingBottom: `${cbPaddingV}px`,
      backdropFilter: cbGlassy ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: cbGlassy ? 'blur(10px)' : 'none',
      border: cbGlassy ? `1px solid rgba(${hexToRgb(baseColor).string}, 0.3)` : 'none',
      color: cbGlassy ? baseColor : (textColorProp || '#ffffff'),
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      width: '100%'
    };

    if (cbVariant.startsWith('icons')) {
        style.aspectRatio = '1/1';
        style.paddingLeft = '0';
        style.paddingRight = '0';
        style.width = 'fit-content';
        style.minWidth = `${(cbPaddingV * 2) + 24}px`;
    }

    return style;
  };

  const currentFont = data.fontFamily || config.fontFamily || 'var(--site-font), sans-serif';

  const cleanSvgRaw = (raw: string, userConfig: TemplateConfig) => {
    if (!raw) return '';
    const targetColor = userConfig.headerSvgColor || themeColor;
    let processed = raw;
    if (targetColor) {
      processed = processed.replace(/currentColor/g, targetColor);
      processed = processed.replace(/fill="((?!none|transparent|url)[^"]+)"/gi, `fill="${targetColor}"`);
      processed = processed.replace(/stroke="((?!none|transparent|url)[^"]+)"/gi, `stroke="${targetColor}"`);
      processed = processed.replace(/style="([^"]*?)fill:\s*?#[a-fA-F0-9]{3,6}([^"]*?)"/gi, (match, p1, p2) => `style="${p1}fill:${targetColor}${p2}"`);
    }
    const rotation = userConfig.headerSvgRotation || 0;
    const scale = (userConfig.headerPatternScale || 100) / 100;
    const opacity = (userConfig.headerPatternOpacity ?? 100) / 100;
    const transformStyle = `transform: rotate(${rotation}deg) scale(${scale}); width: 100%; height: 100%; display: block; opacity: ${opacity}; transition: all 0.3s ease;`;
    return processed
      .replace(/width="[^"]*"/g, 'width="100%"')
      .replace(/height="[^"]*"/g, 'height="100%"')
      .replace(/<svg/g, `<svg preserveAspectRatio="none" style="${transformStyle}"`);
  };

  const getProfileImageStyle = (): React.CSSProperties => {
    let filter = '';
    const whiteMode = data.profileImageWhiteMode ?? config.profileImageWhiteMode;
    const removeBg = data.profileImageRemoveBg ?? config.profileImageRemoveBg;

    if (whiteMode) {
      filter += ' brightness(0) invert(1)';
    }
    
    const style: React.CSSProperties = {
      filter: filter.trim() || undefined,
      mixBlendMode: removeBg ? 'multiply' : undefined
    };
    return style;
  };

  return (
    <div 
      className={`w-full ${forCapture ? 'h-full' : 'min-h-full'} flex flex-col transition-all duration-500 relative overflow-hidden isolate ${isFullFrame ? 'rounded-none' : 'rounded-[2.25rem]'} ${isDark ? 'text-white' : 'text-gray-900'} ${hasGoldenFrame ? 'ring-[10px] ring-yellow-500/30 ring-inset shadow-[0_0_50px_rgba(234,179,8,0.3)]' : ''}`}
      style={{ 
        backgroundColor: finalCardBaseGroundColor,
        clipPath: isFullFrame ? 'none' : 'inset(0 round 2.25rem)',
        fontFamily: currentFont
      }}
    >
      
      {!hideHeader && (
        <div className="shrink-0 overflow-hidden relative" style={getHeaderStyles()}>
            {headerType === 'custom-asset' && config.headerSvgRaw ? (
               <div className="absolute inset-0 flex items-start justify-center overflow-hidden" 
                    dangerouslySetInnerHTML={{ __html: cleanSvgRaw(config.headerSvgRaw, config) }} />
            ) : null}

            {config.headerPatternId && config.headerPatternId !== 'none' && (
              <div className="absolute inset-0 pointer-events-none opacity-[0.2]" 
                   style={{ 
                     backgroundImage: `url("data:image/svg+xml;base64,${window.btoa((PATTERN_PRESETS.find(p => p.id === config.headerPatternId)?.svg || '').replace('currentColor', isDark ? '#ffffff' : '#000000'))}")`,
                     backgroundSize: `${config.headerPatternScale || 100}%`,
                     opacity: (config.headerPatternOpacity || 20) / 100
                   }} />
            )}
        </div>
      )}

      {showFloatingAsset && (data.floatingAssetUrl || config.floatingAssetUrl) && (
        <div 
          data-element-id="floatingAsset"
          className="absolute z-[100] transition-all"
          style={{
            transform: `translate(${data.floatingAssetOffsetX ?? config.floatingAssetOffsetX ?? 0}px, ${data.floatingAssetOffsetY ?? config.floatingAssetOffsetY ?? 0}px)`,
            width: `${data.floatingAssetSize ?? config.floatingAssetSize ?? 100}px`,
            opacity: (data.floatingAssetOpacity ?? config.floatingAssetOpacity ?? 100) / 100,
            pointerEvents: 'auto'
          }}
        >
          <img 
            {...getImgProps(data.floatingAssetUrl || config.floatingAssetUrl || '')} 
            className="w-full h-auto object-contain pointer-events-none" 
            alt="Floating Asset" 
          />
        </div>
      )}

      <div className={`flex flex-col flex-1 ${forCapture ? 'px-4' : 'px-4 sm:px-6'}`} style={{ ...bodyContentStyles, fontFamily: 'inherit' }}>
        {showProfileImage && (
          <div className={`relative ${getAvatarRadiusClasses()} z-30 shrink-0 mx-auto transition-all`} 
               data-element-id="avatar"
               style={{ 
                 width: `${config.avatarSize}px`, height: `${config.avatarSize}px`, 
                 transform: `translate(${data.avatarOffsetX ?? config.avatarOffsetX ?? 0}px, ${data.avatarOffsetY ?? config.avatarOffsetY ?? 0}px)`,
                 padding: `${config.avatarBorderWidth ?? 4}px`, 
                 backgroundColor: showAnimatedBorder ? 'transparent' : (config.avatarBorderColor || '#ffffff'),
                 boxShadow: config.avatarAnimatedGlow ? `0 0 20px rgba(${hexToRgb(borderClr1).string}, 0.5)` : '0 20px 40px rgba(0,0,0,0.1)',
                 fontFamily: 'inherit'
               }}>
            
            {showAnimatedBorder && (
              <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ borderRadius: config.avatarStyle === 'circle' ? '50%' : (config.avatarStyle === 'square' ? '0' : '28%') }}>
                <div 
                  className="absolute inset-[-100%] animate-spin-slow"
                  style={{ 
                    background: `conic-gradient(from 0deg, transparent, ${borderClr1}, ${borderClr2}, transparent 60%)`,
                    animationDuration: `${borderSpeed}s`
                  }}
                />
              </div>
            )}

            <div className={`w-full h-full ${getAvatarRadiusClasses(true)} overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center`}>
              {finalProfileImage ? (
                <img 
                  {...getImgProps(finalProfileImage)} 
                  className="w-full h-full object-cover" 
                  style={getProfileImageStyle()}
                />
              ) : (
                <Camera size={40} className="text-gray-200" />
              )}
            </div>
          </div>
        )}

        <div className={`w-full ${config.spacing === 'relaxed' ? 'space-y-6' : config.spacing === 'compact' ? 'space-y-2' : 'space-y-4'} relative z-10`} style={{ marginTop: hideHeader ? '20px' : (headerType === 'overlay' ? '20px' : '24px'), fontFamily: 'inherit' }}>
           
           {showName && (
             <div className="flex flex-col items-center justify-center gap-1" data-element-id="name" style={{ transform: `translate(${data.nameOffsetX ?? config.nameOffsetX ?? 0}px, ${data.nameOffsetY ?? config.nameOffsetY ?? 0}px)`, fontFamily: 'inherit' }}>
                <div className="flex items-center justify-center gap-2" style={{ fontFamily: 'inherit' }}>
                  <h2 className="font-black leading-tight" style={{ color: nameColor, fontSize: `${config.nameSize}px`, fontFamily: 'inherit' }}>
                    {finalName}
                  </h2>
                  {isVerified && <CheckCircle size={config.nameSize * 0.7} className="text-blue-500 animate-pulse" />}
                </div>
                {showStars && (
                   <div className="flex items-center gap-1 mt-1" style={{ fontFamily: 'inherit' }}>
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#fbbf24" className="text-yellow-400" />)}
                   </div>
                )}
             </div>
           )}

           {(showTitle || showCompany) && (
             <p className="font-bold opacity-80" data-element-id="title" style={{ color: titleColor, transform: `translate(${data.titleOffsetX ?? config.titleOffsetX ?? 0}px, ${data.titleOffsetY ?? config.titleOffsetY ?? 0}px)`, fontSize: '14px', fontFamily: 'inherit' }}>
               {showTitle && finalTitle}
               {(showTitle && showCompany) && finalTitle && finalCompany && ' • '}
               {showCompany && finalCompany}
             </p>
           )}

           {showBodyFeature && featureContent && (
             <div 
               data-element-id="bodyFeature"
               className={`py-3 px-4 shadow-xl flex items-center justify-center gap-3 transition-all duration-500 animate-fade-in-up relative z-40`}
               style={{ 
                 color: featureTextColor,
                 transform: `translate(${featureOffsetX}px, ${featureOffsetY}px)`,
                 marginLeft: `-${featurePaddingX}px`,
                 marginRight: `-${featurePaddingX}px`,
                 borderRadius: `${featureRadius}px`,
                 minHeight: `${featureContent_Height}px`,
                 backdropFilter: isFeatureGlassy ? 'blur(10px)' : 'none',
                 WebkitBackdropFilter: isFeatureGlassy ? 'blur(15px)' : 'none',
                 border: isFeatureGlassy ? `1px solid rgba(${hexToRgb(featureBg).string}, 0.3)` : 'none',
                 background: isFeatureGlassy 
                    ? `rgba(${hexToRgb(featureBg).string}, 0.15)` 
                    : featureBg,
                 fontFamily: 'inherit'
               }}
             >
                <Sparkle size={14} className="animate-pulse shrink-0" />
                <span className="text-xs font-black uppercase tracking-tight text-center" style={{ fontFamily: 'inherit' }}>{featureContent}</span>
                <Sparkle size={14} className="animate-pulse shrink-0" />
             </div>
           )}

           {showBio && finalBio && (
             <div className="mx-auto relative group overflow-hidden" data-element-id="bio" style={bioStyles}>
                <Quote size={12} className="absolute top-3 left-4 opacity-20 text-blue-500" />
               <p className="font-bold leading-relaxed italic" style={{ color: bTextColor, fontSize: `${config.bioSize}px`, fontFamily: 'inherit' }}>
                 {finalBio}
               </p>
             </div>
           )}

           {hasDirectLinks ? (
              <div 
                data-element-id="linksSection"
                className={`w-full px-2 animate-fade-in-up flex flex-col items-center gap-3`}
                style={{ 
                  transform: `translate(${data.linksSectionOffsetX ?? config.linksSectionOffsetX ?? 0}px, ${data.linksSectionOffsetY ?? config.linksSectionOffsetY ?? 0}px)`,
                  padding: `${config.linksSectionPadding || 0}px`,
                  fontFamily: 'inherit'
                }}
              >
                <div 
                  className={`w-full transition-all duration-500 flex flex-col items-center ${dLinksShowBg ? 'shadow-xl' : 'shadow-none'}`}
                  style={{ 
                    borderRadius: `${dLinksRadius}px`,
                    backgroundColor: dLinksSectionBg,
                    paddingTop: dLinksShowBg ? `${dLinksSectionPaddingV}px` : '0px',
                    paddingBottom: dLinksShowBg ? `${dLinksSectionPaddingV}px` : '0px',
                    paddingLeft: dLinksShowBg ? '24px' : '0px',
                    paddingRight: dLinksShowBg ? '24px' : '0px',
                    backdropFilter: (dLinksShowBg && isDLinksGlassy) ? 'blur(15px)' : 'none',
                    WebkitBackdropFilter: (dLinksShowBg && isDLinksGlassy) ? 'blur(15px)' : 'none',
                    border: (isDark && dLinksShowBg) ? '1px solid rgba(255,255,255,0.1)' : (!isDark && dLinksShowBg ? '1px solid rgba(0,0,0,0.05)' : 'none'),
                    fontFamily: 'inherit'
                  }}
                >
                   <div className={`flex flex-wrap items-center justify-center gap-4 ${!dLinksShowText ? 'flex-row' : (dLinksVariant === 'grid' ? 'grid grid-cols-2' : (dLinksVariant === 'pills' ? 'flex-row' : 'flex-col'))} w-full`} style={{ fontFamily: 'inherit' }}>
                      {showEmail && finalEmails.map((email, idx) => (
                        <a 
                          key={`em-${idx}`}
                          href={`mailto:${email}`} 
                          className={`flex items-center gap-3 text-sm font-bold opacity-80 hover:opacity-100 transition-all hover:scale-[1.03] active:scale-95 justify-center ${!dLinksShowText ? 'w-12 h-12 p-0' : (dLinksVariant === 'pills' ? 'px-6 py-3 shadow-md' : 'w-full px-4 py-2 border border-white/10')}`} 
                          style={{ 
                            color: dLinksTextColor, 
                            backgroundColor: dLinksItemBg,
                            borderRadius: !dLinksShowText ? '999px' : `${dLinksItemRadius}px`,
                            fontFamily: 'inherit'
                          }}
                          title={!dLinksShowText ? email : ''}
                        >
                          <div className={`shrink-0 ${dLinksVariant === 'pills' || !dLinksShowText ? '' : 'p-2 bg-white/10 rounded-xl shadow-sm'}`} style={{ color: dLinksIconColor }}>
                            <Mail size={!dLinksShowText ? 22 : 18} />
                          </div>
                          {dLinksShowText && <span className="break-all text-start leading-tight" style={{ fontFamily: 'inherit' }}>{email}</span>}
                        </a>
                      ))}
                      {showWebsite && finalWebsites.map((web, idx) => (
                        <a 
                          key={`web-${idx}`}
                          href={web.startsWith('http') ? web : `https://${web}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 text-sm font-bold opacity-80 hover:opacity-100 transition-all hover:scale-[1.03] active:scale-95 justify-center ${!dLinksShowText ? 'w-12 h-12 p-0' : (dLinksVariant === 'pills' ? 'px-6 py-3 shadow-md' : 'w-full px-4 py-2 border border-white/10')}`} 
                          style={{ 
                            color: dLinksTextColor, 
                            backgroundColor: dLinksItemBg,
                            borderRadius: !dLinksShowText ? '999px' : `${dLinksItemRadius}px`,
                            fontFamily: 'inherit'
                          }}
                          title={!dLinksShowText ? web : ''}
                        >
                          <div className={`shrink-0 ${dLinksVariant === 'pills' || !dLinksShowText ? '' : 'p-2 bg-white/10 rounded-xl shadow-sm'}`} style={{ color: dLinksIconColor }}>
                            {config.linksWebsiteIconType === 'store' ? <ShoppingCart size={!dLinksShowText ? 22 : 18} /> : <Globe size={!dLinksShowText ? 22 : 18} />}
                          </div>
                          {dLinksShowText && <span className="break-all text-start leading-tight" style={{ fontFamily: 'inherit' }}>{web}</span>}
                        </a>
                      ))}
                   </div>
                </div>
              </div>
           ) : null}

           {hasContactButtons && (
              <div 
                data-element-id="contactButtons"
                className={`w-full mt-6 px-2 transition-all duration-500`} 
                style={{ 
                  transform: `translate(${data.contactButtonsOffsetX ?? config.contactButtonsOffsetX ?? 0}px, ${data.contactButtonsOffsetY ?? config.contactButtonsOffsetY ?? 0}px)`,
                  fontFamily: 'inherit',
                }}
              >
                <div 
                  className={`w-full ${cbVariant.startsWith('icons') ? 'flex flex-wrap items-center justify-center' : 'grid'} gap-[inherit]`}
                  style={{
                    gridTemplateColumns: (cbVariant === 'buttons' || cbVariant === 'pills') 
                      ? 'repeat(2, 1fr)' 
                      : (cbVariant === 'full-width' ? '1fr' : 'none'),
                    gap: `${cbGap}px`
                  }}
                >
                    {showPhone && finalPhones.map((phone, idx) => (
                    <a key={`ph-${idx}`} href={`tel:${phone}`} className="shadow-lg hover:brightness-110 active:scale-95 transition-all" style={getContactBtnStyle(phoneBtnColor, phoneTextColor)}>
                        <Phone size={14} className="shrink-0" /> 
                        {!cbVariant.startsWith('icons') && (
                            <span className="truncate text-[10px] font-black" style={{ fontFamily: 'inherit' }}>{t('call')} {finalPhones.length > 1 ? idx + 1 : ''}</span>
                        )}
                    </a>
                    ))}
                    
                    {showWhatsapp && finalWhatsapps.map((wa, idx) => (
                    <a key={`wa-${idx}`} href={`https://wa.me/${wa}`} target="_blank" className="shadow-lg hover:brightness-110 active:scale-95 transition-all" style={getContactBtnStyle(whatsappBtnColor, whatsappTextColor)}>
                        <MessageCircle size={14} className="shrink-0" /> 
                        {!cbVariant.startsWith('icons') && (
                            <span className="truncate text-[10px] font-black" style={{ fontFamily: 'inherit' }}>{t('whatsappBtn')} {finalWhatsapps.length > 1 ? idx + 1 : ''}</span>
                        )}
                    </a>
                    ))}

                    {!hideSaveButton && showButtons && (
                    <button onClick={() => downloadVCard(data)} className="shadow-lg hover:brightness-110 active:scale-95 transition-all" style={getContactBtnStyle('#111827', '#ffffff')}>
                        <UserPlus size={14} className="shrink-0" /> 
                        {!cbVariant.startsWith('icons') && (
                            <span className="truncate text-[10px] font-black" style={{ fontFamily: 'inherit' }}>{t('saveContact')}</span>
                        )}
                    </button>
                    )}
                </div>
              </div>
           )}

           {showMembership && (data.membershipExpiryDate || config.membershipExpiryDate) && (
              <div 
                data-element-id="membership"
                className="w-full px-2 mt-4"
                style={{ transform: `translate(${data.membershipOffsetX ?? config.membershipOffsetX ?? 0}px, ${data.membershipOffsetY ?? config.membershipOffsetY ?? 0}px)`, fontFamily: 'inherit' }}
              >
                 <MembershipBar 
                    startDate={data.membershipStartDate || config.membershipStartDate} 
                    expiryDate={data.membershipExpiryDate || config.membershipExpiryDate} 
                    title={isRtl ? (data.membershipTitleAr || config.membershipTitleAr) : (data.membershipTitleEn || config.membershipTitleEn)}
                    isDark={isDark}
                    isGlassy={data.membershipGlassy ?? config.membershipGlassy}
                    bgColor={data.membershipBgColor || config.membershipBgColor}
                    borderColor={data.membershipBorderColor || config.membershipBorderColor}
                    textColor={data.membershipTextColor || config.membershipTextColor}
                    accentColor={data.membershipAccentColor || config.membershipAccentColor}
                 />
              </div>
           )}

           {showOccasion && (data.occasionDate || config.occasionDate) && (
              <div 
                data-element-id="occasion"
                className="w-full px-2 mt-4"
                style={{ transform: `translate(${data.occasionOffsetX ?? config.occasionOffsetX ?? 0}px, ${data.occasionOffsetY ?? config.occasionOffsetY ?? 0}px)`, fontFamily: 'inherit' }}
              >
                 <div 
                   className={`w-full p-6 rounded-[2.5rem] border transition-all duration-500 ${data.occasionGlassy ?? config.occasionGlassy ? 'backdrop-blur-xl' : ''}`}
                   style={{ 
                     backgroundColor: data.occasionBgColor || config.occasionBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.8)'),
                     borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                     fontFamily: 'inherit'
                   }}
                 >
                    <div className="text-center space-y-4" style={{ fontFamily: 'inherit' }}>
                       <h3 
                         className="text-sm font-black uppercase tracking-widest opacity-80" 
                         style={{ 
                           color: data.occasionTitleColor || config.occasionTitleColor || (isDark ? '#ffffff' : 'inherit'),
                           fontFamily: 'inherit' 
                         }}
                       >
                          {isRtl ? (data.occasionTitleAr || config.occasionTitleAr || 'مناسبة قادمة') : (data.occasionTitleEn || config.occasionTitleEn || 'Upcoming Occasion')}
                       </h3>
                       <CountdownTimer 
                         targetDate={data.occasionDate || config.occasionDate || ''} 
                         isDark={isDark} 
                         lang={lang}
                         primaryColor={data.occasionPrimaryColor || config.occasionPrimaryColor || themeColor} 
                       />
                    </div>
                 </div>
              </div>
           )}

           {showSpecialLinks && finalSpecialLinks.length > 0 && (
              <div 
                data-element-id="specialLinks"
                className={`grid w-full px-2 animate-fade-in-up`}
                style={{ 
                  gridTemplateColumns: `repeat(${slCols}, 1fr)`,
                  gap: `${slGap}px`,
                  transform: `translate(${slOffsetX}px, ${slOffsetY}px)`,
                  fontFamily: 'inherit'
                }}
              >
                {finalSpecialLinks.map((link) => (
                  <a 
                    key={link.id} 
                    href={link.linkUrl} 
                    target="_blank" 
                    className="group relative overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.03] active:scale-95"
                    style={{ 
                      borderRadius: `${slRadius}px`,
                      aspectRatio: slAspect === 'square' ? '1/1' : (slAspect === 'video' ? '16/9' : '3/4'),
                      fontFamily: 'inherit'
                    }}
                  >
                    <img {...getImgProps(link.imageUrl)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Link Image" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <ExternalLink size={24} className="text-white drop-shadow-lg" />
                    </div>
                    {(isRtl ? link.titleAr : link.titleEn) && (
                       <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[10px] font-black text-white text-center truncate" style={{ fontFamily: 'inherit' }}>{isRtl ? link.titleAr : link.titleEn}</p>
                       </div>
                    )}
                  </a>
                ))}
              </div>
           )}

           {showLocation && data.locationUrl && (
             <div data-element-id="location" className="w-full px-2 animate-fade-in-up" style={{ transform: `translate(${data.locationOffsetX ?? config.locationOffsetX ?? 0}px, ${data.locationOffsetY ?? config.locationOffsetY ?? 0}px)`, fontFamily: 'inherit' }}>
               <a 
                 href={data.locationUrl} 
                 target="_blank" 
                 className={`flex items-center gap-4 transition-all duration-500 hover:scale-[1.02] shadow-xl group relative overflow-hidden`}
                 style={{ 
                   borderRadius: `${locRadius}px`, 
                   backgroundColor: locBg,
                   paddingTop: `${locPaddingV}px`,
                   paddingBottom: `${locPaddingV}px`,
                   paddingLeft: '20px',
                   paddingRight: '20px',
                   backdropFilter: isLocGlassy ? 'blur(15px)' : 'none',
                   WebkitBackdropFilter: isLocGlassy ? 'blur(15px)' : 'none',
                   border: (isDark) ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                   fontFamily: 'inherit'
                 }}
               >
                 <div className="p-3 bg-white/10 rounded-2xl shadow-inner text-blue-500 group-hover:scale-110 transition-transform" style={{ color: locIconColor }}>
                    <MapPin size={22} />
                 </div>
                 <div className="flex-1 min-w-0 text-start">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5" style={{ fontFamily: 'inherit' }}>{t('locationSection')}</p>
                    <p className="font-bold truncate" style={{ color: locTextColor, fontSize: `${locAddressSize}px`, fontFamily: 'inherit' }}>{data.location || t('visitUs')}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Navigation2 size={16} />
                 </div>
               </a>
             </div>
           )}

           {showQrCode && (
              <div 
                data-element-id="qrCode"
                className="mx-auto mt-6 animate-fade-in-up"
                style={{ 
                  transform: `translate(${qrOffsetX}px, ${qrOffsetY}px)`,
                  padding: `${config.qrPadding || 0}px`,
                  fontFamily: 'inherit'
                }}
              >
                <div 
                   className="relative group p-4 inline-block transition-all duration-500 hover:scale-105"
                   style={{ 
                      backgroundColor: qrBgColor,
                      borderRadius: `${qrBorderRadius}px`,
                      border: qrBorderWidth > 0 ? `${qrBorderWidth}px solid ${qrBorderColor}` : 'none',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                   }}
                >
                   <img src={qrImageUrl} style={{ width: `${qrSize}px`, height: `${qrSize}px` }} className="relative z-10" alt="QR Code" />
                   <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit]"></div>
                </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
