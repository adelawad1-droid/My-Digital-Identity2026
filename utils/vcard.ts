
import { CardData } from '../types';

/**
 * وظيفة مساعدة لتحويل رابط صورة إلى Base64
 * ضرورية لأن نظام vCard يتطلب الصورة مدمجة نصياً
 */
const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert image for vCard:", e);
    return null;
  }
};

export const downloadVCard = async (data: CardData) => {
  const cleanName = (data.name || '').trim();
  const cleanTitle = (data.title || '').trim();
  const cleanOrg = (data.company || '').trim();
  const cleanEmail = (data.email || '').trim();
  const cleanWeb = (data.website || '').trim();

  // تجميع كافة أرقام الهواتف والواتساب
  const allPhones = Array.from(new Set([
    ...(data.phones || []),
    ...(data.whatsapps || []),
    data.phone,
    data.whatsapp
  ])).filter(p => p && p.trim() !== '');

  let vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${cleanName}`,
    `N:;${cleanName};;;`,
    `TITLE:${cleanTitle}`,
    `ORG:${cleanOrg}`,
    `EMAIL;TYPE=INTERNET:${cleanEmail}`,
    `URL:${cleanWeb}`,
    `ADR;TYPE=WORK:;;${data.location || ''};;;`,
    `NOTE:${data.bio || ''}`,
  ];

  // إضافة كافة الأرقام المكتشفة
  allPhones.forEach(p => {
    vcard.push(`TEL;TYPE=CELL:${p.replace(/\s/g, '')}`);
  });

  // التعامل مع الصورة الشخصية
  if (data.profileImage) {
    if (data.profileImage.startsWith('data:image/')) {
      const base64Data = data.profileImage.split(',')[1];
      const mimeType = data.profileImage.split(';')[0].split(':')[1].toUpperCase();
      const type = mimeType.split('/')[1] || 'JPEG';
      vcard.push(`PHOTO;TYPE=${type};ENCODING=b:${base64Data}`);
    } else if (data.profileImage.startsWith('http')) {
      const base64Data = await imageUrlToBase64(data.profileImage);
      if (base64Data) {
        vcard.push(`PHOTO;TYPE=JPEG;ENCODING=b:${base64Data}`);
      }
    }
  }

  vcard.push('END:VCARD');

  const vcardString = vcard.join('\r\n');
  const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${cleanName.replace(/\s+/g, '_') || 'contact'}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
