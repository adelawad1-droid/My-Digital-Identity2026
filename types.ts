
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ru' | 'hi';

export interface SocialLink {
  platform: string;
  url: string;
  platformId: string;
}

export interface SpecialLinkItem {
  id: string;
  imageUrl: string;
  linkUrl: string;
  titleAr?: string;
  titleEn?: string;
}

export type ThemeType = 'color' | 'gradient' | 'image';
export type PageBgStrategy = 'solid' | 'mirror-header';

export interface PricingPlan {
  id: string;
  nameAr: string;
  nameEn: string;
  price: string;
  originalPrice?: string; // السعر قبل الخصم (يظهر مشطوباً)
  billingCycleAr: string; // مثال: شهر، 3 أشهر، سنة
  billingCycleEn: string; // example: Monthly, 3 Months, Yearly
  durationMonths: number; // الحقل الجديد: مدة الباقة بالأشهر
  featuresAr: string[];
  featuresEn: string[];
  isPopular: boolean;
  isActive: boolean;
  order: number;
  iconName: string;
  buttonTextAr?: string;
  buttonTextEn?: string;
  stripeLink?: string; 
  updatedAt?: string;
}

export interface TemplateConfig {
  headerType: 
    | 'classic' | 'split-left' | 'split-right' | 'overlay' 
    | 'hero' | 'minimal' | 'side-left' | 'side-right' 
    | 'curved' | 'diagonal' | 'wave' | 'floating' 
    | 'glass-card' | 'modern-split' | 'top-bar' | 'custom-asset';
  headerHeight: number;
  headerCustomAsset?: string; 
  headerSvgRaw?: string;
  headerSvgColor?: string; // الخاصية الجديدة للتحكم في لون الـ SVG
  headerSvgRotation?: number; // الخاصية الجديدة للتحكم في تدوير الـ SVG
  headerPatternId?: string; 
  headerPatternOpacity?: number; 
  headerPatternScale?: number; 
  avatarStyle: 'circle' | 'squircle' | 'square' | 'none';
  avatarSize: number;
  avatarOffsetY: number;
  avatarOffsetX: number;
  avatarBorderWidth?: number;
  avatarBorderColor?: string;
  avatarBorderRadius?: number;
  avatarAnimatedBorder?: boolean;
  avatarAnimatedBorderColor1?: string;
  avatarAnimatedBorderColor2?: string;
  avatarAnimatedBorderSpeed?: number;
  avatarAnimatedGlow?: boolean;

  nameOffsetY: number;
  nameOffsetX?: number;
  titleOffsetY?: number; 
  titleOffsetX?: number;
  bioOffsetY: number;
  bioOffsetX?: number;
  emailOffsetY: number;
  emailOffsetX?: number;
  websiteOffsetY: number;
  websiteOffsetX?: number;
  
  // Contact Buttons Section
  contactButtonsOffsetY: number;
  contactButtonsOffsetX?: number;
  contactButtonsGap?: number;
  contactButtonsRadius?: number;
  contactButtonsPaddingV?: number;
  contactButtonsGlassy?: boolean;
  
  socialLinksOffsetY: number;
  socialLinksOffsetX?: number;
  contentAlign: 'start' | 'center' | 'end';
  buttonStyle: 'pill' | 'square' | 'glass';
  animations: 'none' | 'fade' | 'slide' | 'bounce';
  spacing: 'compact' | 'normal' | 'relaxed';
  nameSize: number;
  bioSize: number;
  
  headerGlassy?: boolean;
  headerOpacity?: number;
  bodyGlassy?: boolean;
  bodyOpacity?: number;
  bodyOffsetY?: number;
  bodyOffsetX?: number;
  bodyBorderRadius?: number;

  socialIconStyle?: 'circle' | 'squircle' | 'rounded' | 'square' | 'none';
  socialIconSize?: number;
  socialIconVariant?: 'filled' | 'outline' | 'glass' | 'ghost';
  socialIconBgColor?: string;
  socialIconColor?: string;
  socialIconBorderWidth?: number;
  socialIconBorderColor?: string;
  socialIconGap?: number;
  socialIconGapMobile?: number;
  socialIconColumns?: number;
  socialIconPadding?: number;
  useSocialBrandColors?: boolean;

  // Special Links Config
  showSpecialLinksByDefault?: boolean;
  specialLinksCols?: number;
  specialLinksGap?: number;
  specialLinksRadius?: number;
  specialLinksAspectRatio?: 'square' | 'video' | 'portrait';
  specialLinksOffsetY?: number;
  specialLinksOffsetX?: number;
  defaultSpecialLinks?: SpecialLinkItem[];

  // Floating Asset Config
  floatingAssetUrl?: string;
  floatingAssetSize?: number;
  floatingAssetOffsetY?: number;
  floatingAssetOffsetX?: number;
  floatingAssetOpacity?: number;
  showFloatingAssetByDefault?: boolean;

  // Membership & Subscription Config
  showMembershipByDefault?: boolean;
  membershipTitleAr?: string;
  membershipTitleEn?: string;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  membershipOffsetY?: number;
  membershipOffsetX?: number;
  membershipGlassy?: boolean;
  membershipBgColor?: string;
  membershipBorderColor?: string;
  membershipTextColor?: string;
  membershipAccentColor?: string;

  // Location Config
  showLocationByDefault?: boolean;
  locationOffsetY?: number;
  locationOffsetX?: number;
  locationBgColor?: string;
  locationIconColor?: string;
  locationTextColor?: string;
  locationBorderRadius?: number;
  locationGlassy?: boolean;
  locationPaddingV?: number; 
  locationAddressSize?: number; 

  // Direct Links Section (Email & Website)
  linksSectionVariant?: 'list' | 'grid' | 'pills';
  linksSectionBgColor?: string;
  linksSectionTextColor?: string;
  linksSectionIconColor?: string;
  linksSectionRadius?: number;
  linksSectionGlassy?: boolean;
  linksSectionOffsetY?: number;
  linksSectionOffsetX?: number;
  linksSectionPadding?: number;
  linksSectionPaddingV?: number;
  linksSectionGap?: number;
  linksShowText?: boolean; 
  linksShowBg?: boolean;   
  linksWebsiteIconType?: 'globe' | 'store'; 
  linksItemBgColor?: string; 
  linksItemRadius?: number; 

  qrSize?: number;
  qrColor?: string; 
  qrBgColor?: string;
  qrPadding?: number;
  qrOffsetY?: number;
  qrOffsetX?: number;
  qrBorderWidth?: number;
  qrBorderColor?: string;
  qrBorderRadius?: number;
  showQrCodeByDefault?: boolean;
  showBioByDefault?: boolean; 
  showNameByDefault?: boolean;
  showTitleByDefault?: boolean;
  showCompanyByDefault?: boolean;
  showEmailByDefault?: boolean;
  showWebsiteByDefault?: boolean;
  showPhoneByDefault?: boolean;
  showWhatsappByDefault?: boolean;
  showSocialLinksByDefault?: boolean;
  showButtonsByDefault?: boolean;

  showOccasionByDefault?: boolean;
  occasionTitle?: string;
  occasionDesc?: string;
  occasionTitleAr?: string; 
  occasionTitleEn?: string; 
  occasionDate?: string;
  occasionMapUrl?: string;
  occasionOffsetY?: number;
  occasionOffsetX?: number;
  occasionFloating?: boolean;
  occasionPrimaryColor?: string;
  occasionBgColor?: string;
  occasionTitleColor?: string;
  occasionGlassy?: boolean;
  occasionOpacity?: number;
  showCountdown?: boolean;

  showBodyFeatureByDefault?: boolean;
  bodyFeatureTextAr?: string;
  bodyFeatureTextEn?: string;
  bodyFeatureBgColor?: string;
  bodyFeatureTextColor?: string;
  bodyFeatureHeight?: number;
  bodyFeaturePaddingX?: number; 
  bodyFeatureOffsetY?: number;
  bodyFeatureOffsetX?: number;
  bodyFeatureBorderRadius?: number;
  bodyFeatureGlassy?: boolean;

  // Bio Advanced Config
  bioBorderRadius?: number;
  bioBorderWidth?: number;
  bioBorderColor?: string;
  bioPaddingV?: number;
  bioPaddingH?: number;
  bioGlassy?: boolean;
  bioOpacity?: number;
  bioMaxWidth?: number;
  bioTextAlign?: 'start' | 'center' | 'end';
  defaultBioAr?: string;
  defaultBioEn?: string;

  // Desktop Display Config
  desktopLayout?: 'full-width-header' | 'centered-card';
  cardMaxWidth?: number;
  desktopBodyOffsetY?: number;
  mobileBodyOffsetY?: number;

  // Premium Features
  showStarsByDefault?: boolean;
  isVerifiedByDefault?: boolean;
  hasGoldenFrameByDefault?: boolean;

  occasionPrefixColor?: string;
  occasionNameColor?: string;
  occasionWelcomeColor?: string;

  invitationPrefix?: string;
  invitationWelcome?: string;
  invitationWelcomeAr?: string;
  invitationWelcomeEn?: string;
  invitationYOffset?: number;

  nameColor?: string;
  titleColor?: string;
  bioTextColor?: string;
  bioBgColor?: string;
  linksColor?: string;
  socialIconsColor?: string;
  contactPhoneColor?: string;
  contactWhatsappColor?: string;
  
  defaultThemeType?: ThemeType;
  defaultThemeColor?: string;
  defaultThemeGradient?: string;
  defaultBackgroundImage?: string;
  defaultBackgroundImageId?: string;
  defaultProfileImage?: string;
  defaultName?: string;
  defaultTitle?: string;
  defaultCompany?: string;
  defaultNameSize?: number;
  defaultIsDark?: boolean;
  cardBodyColor?: string;
  cardBodyBackgroundImage?: string;
  cardBodyThemeType?: 'color' | 'image';
  cardBgColor?: string; 
  pageBgColor?: string; 
  pageBgStrategy?: PageBgStrategy; 
  
  fontFamily?: string;

  customCss?: string;
}

export interface CardData {
  id: string;
  templateId: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  location: string;
  locationUrl: string;
  profileImage: string;
  themeType: ThemeType;
  themeColor: string;
  themeGradient: string;
  backgroundImage: string;
  isDark: boolean;
  isActive?: boolean;
  viewCount?: number;
  socialLinks: SocialLink[];
  specialLinks?: SpecialLinkItem[];
  emails?: string[];   
  websites?: string[]; 
  useSocialBrandColors?: boolean; 
  // Fix: Add socialIconColumns to CardData to resolve type error in Editor.tsx
  socialIconColumns?: number;
  ownerId?: string;
  ownerEmail?: string;
  updatedAt?: string;
  showName?: boolean;
  showTitle?: boolean;
  showCompany?: boolean;
  showBio?: boolean;
  showProfileImage?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showWebsite?: boolean;
  showWhatsapp?: boolean;
  showSocialLinks?: boolean;
  showButtons?: boolean;
  showQrCode?: boolean;
  showOccasion?: boolean;
  showSpecialLinks?: boolean;
  showLocation?: boolean;
  linksShowText?: boolean;
  linksShowBg?: boolean;
  specialLinksCols?: number;
  fontFamily?: string;

  specialLinksOffsetY?: number;
  specialLinksOffsetX?: number;
  specialLinksAspectRatio?: 'square' | 'video' | 'portrait';

  floatingAssetUrl?: string;
  floatingAssetSize?: number;
  floatingAssetOffsetX?: number;
  floatingAssetOffsetY?: number;
  floatingAssetOpacity?: number;
  showFloatingAsset?: boolean;

  showMembership?: boolean;
  membershipTitleAr?: string;
  membershipTitleEn?: string;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  membershipOffsetY?: number;
  membershipOffsetX?: number;
  membershipGlassy?: boolean;
  membershipBgColor?: string;
  membershipBorderColor?: string;
  membershipTextColor?: string;
  membershipAccentColor?: string;

  showStars?: boolean;
  isVerified?: boolean;
  hasGoldenFrame?: boolean;

  occasionTitle?: string;
  occasionDesc?: string;
  occasionTitleAr?: string; 
  occasionTitleEn?: string; 
  occasionDate?: string;
  occasionMapUrl?: string;
  occasionOffsetY?: number;
  occasionOffsetX?: number;
  occasionFloating?: boolean;
  occasionPrimaryColor?: string;
  occasionBgColor?: string;
  occasionTitleColor?: string;
  occasionGlassy?: boolean;
  occasionOpacity?: number;

  invitationPrefix?: string;
  invitationWelcome?: string;
  invitationYOffset?: number;
  occasionPrefixColor?: string;
  occasionNameColor?: string;
  occasionWelcomeColor?: string;

  showBodyFeature?: boolean;
  bodyFeatureText?: string;
  bodyFeatureOffsetX?: number;
  bodyFeatureOffsetY?: number;

  bodyGlassy?: boolean;
  bodyOpacity?: number;
  bodyBorderRadius?: number;
  bodyOffsetY?: number;
  bodyOffsetX?: number;

  nameColor?: string;
  titleColor?: string;
  bioTextColor?: string;
  bioBgColor?: string;
  linksColor?: string;
  socialIconsColor?: string;
  contactPhoneColor?: string;
  contactWhatsappColor?: string;

  bioBorderRadius?: number;
  bioBorderWidth?: number;
  bioBorderColor?: string;
  bioPaddingV?: number;
  bioPaddingH?: number;
  bioGlassy?: boolean;
  bioOpacity?: number;
  bioMaxWidth?: number;
  bioTextAlign?: 'start' | 'center' | 'end';
  defaultBioAr?: string;
  defaultBioEn?: string;

  qrSize?: number;
  qrColor?: string; 
  qrBgColor?: string;
  qrPadding?: number;
  qrOffsetY?: number;
  qrOffsetX?: number;
  qrBorderWidth?: number;
  qrBorderColor?: string;
  qrBorderRadius?: number;
  cardBodyColor?: string;
  cardBodyBackgroundImage?: string;
  cardBodyThemeType?: 'color' | 'image';
  cardBgColor?: string; 
  pageBgColor?: string;
  pageBgStrategy?: PageBgStrategy;
  mobileBodyOffsetY?: number;
  desktopBodyOffsetY?: number;
  linksSectionPaddingV?: number;
  linksSectionOffsetX?: number;
  linksSectionOffsetY?: number;
  nameOffsetY?: number;
  nameOffsetX?: number;
  titleOffsetY?: number;
  titleOffsetX?: number;
  bioOffsetY?: number;
  bioOffsetX?: number;
  contactButtonsOffsetY?: number;
  contactButtonsOffsetX?: number;
  socialLinksOffsetY?: number;
  socialLinksOffsetX?: number;
  avatarOffsetX?: number;
  avatarOffsetY?: number;
  locationOffsetX?: number;
  locationOffsetY?: number;
}

export interface VisualStyle {
  id: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  config: Partial<TemplateConfig>; 
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  order: number;
  isActive: boolean;
}

export interface CustomTemplate {
  id: string;
  categoryId?: string; 
  parentStyleId?: string; 
  restrictedUserId?: string; 
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  config: TemplateConfig;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  usageCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TranslationStrings {
  [key: string]: {
    [key in Language]?: string;
  };
}
