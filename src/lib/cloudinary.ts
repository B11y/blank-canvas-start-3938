import { optimizeImageUrl } from './responsive-image';

/**
 * Backward-compatible image optimization helper.
 * Optimizes Cloudinary URLs and also supports common remote image CDNs.
 */
export function optimizeImage(url: string, width: number = 1200): string {
  return optimizeImageUrl(url, { width });
}
