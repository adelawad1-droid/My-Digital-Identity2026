import React, { useState, useRef, useEffect } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData, TemplateCategory, VisualStyle, ThemeType, PageBgStrategy, SpecialLinkItem } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS, BACKGROUND_PRESETS, AVATAR_PRESETS, PATTERN_PRESETS, SVG_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import { getAllCategories, saveTemplateCategory, getAllVisualStyles, auth, getSiteSettings, searchUsersByEmail } from '../services/firebase';
import CardPreview from '../components/CardPreview';
import AuthModal from '../components/AuthModal';
import { 
  Save, Layout, Smartphone, Layers, Move, Check, X, 
  Zap, AlignCenter, Circle, Box, Loader2, Type as TypographyIcon, 
  Ruler, Star, Hash, ArrowLeft, Palette, Sparkles, ImageIcon, 
  UploadCloud, Sun, Moon, Pipette, Settings, FileText, AlignLeft, 
  // Added LayoutGrid to imports
  AlignRight, LayoutTemplate, LayoutGrid, Info, Maximize2, UserCircle, Mail, 
  Phone, Globe, MessageCircle, Camera, Download, Tablet, Monitor, 
  Eye, QrCode, Wind, GlassWater, ChevronRight, ChevronLeft, 
  Waves, Square, Columns, Minus, ToggleLeft, ToggleRight, Calendar, MapPin, Timer, PartyPopper, Link as LinkIcon, FolderOpen, Plus, Tag, Settings2, SlidersHorizontal, Share2, FileCode, HardDrive, Database,
  CheckCircle2, Grid, RefreshCcw, Shapes, Code2, MousePointer2, AlignJustify, EyeOff, Briefcase, Wand2 as MagicIcon, RotateCcw, AlertTriangle, Repeat, Sparkle, LogIn, Trophy, Trash2, ImagePlus, Navigation2, Map as MapIcon, ShoppingCart, Quote, User as UserIcon, Image as ImageIconLucide, ArrowLeftRight, ArrowUpDown, MonitorDot, TabletSmartphone, ShieldCheck, UserCheck, Search, Grab, ChevronDown, Sticker
} from 'lucide-react';

// --- المكونات المساعدة ---

type BuilderTab = 
  | 'header' 
  | 'body-style' 
  | 'visuals' 
  | 'avatar' 
  | 'identity-lab' 
  | 'bio-lab' 
  | 'direct-links' 
  | 'membership-lab' 
  | 'contact-lab' 
  | 'special-links' 
  | 'floating-asset-lab'
  | 'occasion-lab'
  | 'location' 
  | 'social-lab' 
  | 'qrcode' 
  | 'special-features' 
  | 'desktop-lab';

const RangeControl = ({ label, value, min, max, onChange, unit = "px", icon: Icon, hint }: any) => {
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d-]/g, '');
    setTempValue(val);
    if (val !== '' && val !== '-') {
      onChange(parseInt(val) || 0);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121215] p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-all hover:border-blue-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
             {Icon && <Icon size={14} />}
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{label}</span>
              {hint && <span className="text-[7px] text-gray-400 font-bold">{hint}</span>}
           </div>
        </div>
        <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-full px-1 py-0.5 border border-blue-100 dark:border-blue-800/30">
           <input 
             type="text"
             inputMode="numeric"
             dir="ltr"
             value={tempValue} 
             onChange={handleInputChange}
             className="w-16 bg-transparent text-center text-xs font-black text-blue-600 outline-none border-none"
           />
           <span className="text-[8px] font-black text-blue-400 pr-2 pointer-events-none">{unit}</span>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={isNaN(parseInt(tempValue)) ? 0 : parseInt(tempValue)} 
        onChange={(e) => onChange(parseInt(e.target.value))} 
        className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
      />
    </div>
  );
};

const ToggleSwitch = ({ label, value, onChange, icon: Icon, color = "bg-blue-600", isRtl }: any) => (
  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#121215] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:bg-gray-50/50">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
        {Icon && <Icon size={20} />}
      </div>
      <span className={`text