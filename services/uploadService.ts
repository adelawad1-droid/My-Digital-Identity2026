
import { storage, auth, getSiteSettings } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * خدمة معالجة الصور ورفعها بناءً على إعدادات الموقع
 */
export const uploadImageToCloud = async (
  file: File, 
  type: 'avatar' | 'background' | 'logo' = 'avatar',
  config?: { storageType?: 'database' | 'server' | 'firebase', uploadUrl?: string }
): Promise<string | null> => {
  if (!file) return null;

  // 1. معالجة الصورة أولاً (الضغط وتغيير الحجم حسب النوع)
  const processedBase64 = await processImageClientSide(file, type);
  if (!processedBase64) return null;

  // جلب إعدادات الموقع لتحديد استراتيجية التخزين المناسبة
  const siteSettings = await getSiteSettings();
  
  // تحديد الاستراتيجية الافتراضية
  let storageType: 'database' | 'server' | 'firebase' = 'firebase';
  
  if (config?.storageType) {
    storageType = config.storageType;
  } else if (siteSettings) {
    // التمييز بين الصور الشخصية والوسائط الأخرى حسب قرار المسؤول
    storageType = type === 'avatar' 
      ? (siteSettings.avatarStorageType || 'database') 
      : (siteSettings.mediaStorageType || 'firebase');
  }

  // خيار التخزين المباشر في قاعدة البيانات (Base64) - ممتاز للصور الشخصية
  if (storageType === 'database') {
    return processedBase64;
  }

  // خيار Firebase Storage (الأفضل للملفات الكبيرة)
  if (storageType === 'firebase') {
    try {
      const blob = await base64ToBlob(processedBase64);
      const timestamp = Date.now();
      const userId = auth.currentUser?.uid || 'public';
      const fileName = `${type}_${timestamp}_${Math.random().toString(36).substring(7)}.${file.type === 'image/png' ? 'png' : 'jpg'}`;
      const storageRef = ref(storage, `uploads/${userId}/${type}/${fileName}`);
      
      const metadata = { contentType: file.type === 'image/png' ? 'image/png' : 'image/jpeg' };
      const snapshot = await uploadBytes(storageRef, blob, metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Firebase Storage Upload Error:", error);
      return processedBase64; // Fallback to Base64 on error
    }
  }

  // خيار السيرفر الخاص (PHP)
  if (storageType === 'server') {
    const uploadUrl = config?.uploadUrl || siteSettings?.serverUploadUrl;
    if (uploadUrl) {
      try {
        const formData = new FormData();
        const blob = await base64ToBlob(processedBase64);
        const fileName = file.name || (type + '.' + (file.type === 'image/png' ? 'png' : 'jpg'));
        formData.append('file', blob, fileName); 
        formData.append('type', type);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error("Server upload failed");
        
        const result = await response.json();
        return result.url || result.data?.url || null;
      } catch (error) {
        console.error("Private Server Upload Error:", error);
        return processedBase64; // Fallback
      }
    }
  }

  return processedBase64;
};

/**
 * دالة معالجة الصور في المتصفح (تصغير الأبعاد وضبط الجودة)
 */
async function processImageClientSide(file: File, type: 'avatar' | 'background' | 'logo'): Promise<string | null> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = () => reject("File reading error");
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          let MAX_SIZE = 800; 
          let quality = 0.8;  

          if (type === 'avatar') {
            MAX_SIZE = 450;    
            quality = 0.75;    
          } else if (type === 'background') {
            MAX_SIZE = 1920;   
            quality = 0.85;    
          } else if (type === 'logo') {
            MAX_SIZE = 1000;
            quality = 0.9;
          }

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          // Use image/png for transparency support if input is PNG
          const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const base64String = canvas.toDataURL(outputMime, quality);
          resolve(base64String);
        };
      };
    });
  } catch (error) {
    console.error("Image Processing Error:", error);
    return null;
  }
}

async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return await response.blob();
}
