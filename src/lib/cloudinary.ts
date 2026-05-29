/**
 * Automatically adds Cloudinary optimization parameters to any Cloudinary URL
 * f_auto = WebP format | q_auto = auto quality | w_1200 = max width
 */
export function optimizeImage(url: string, width: number = 1200): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  if (url.includes('f_auto')) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
}
