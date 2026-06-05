/**
 * Automatically adds Cloudinary optimization parameters to any Cloudinary URL.
 * f_auto = automatic format | q_auto = automatic quality | w_* = target width
 */
export function optimizeImage(url: string, width: number = 1200): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  if (url.includes('f_auto')) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
}

type ResponsiveImageOptions = {
  width?: number;
  height?: number;
  sizes?: string;
  widths?: number[];
};

type ResponsiveImageAttributes = {
  src: string;
  srcSet?: string;
  sizes: string;
  width: number;
  height: number;
};

const DEFAULT_RESPONSIVE_WIDTHS = [480, 768, 1024, 1200, 1600];

function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com');
}

function isPexelsUrl(url: string): boolean {
  return url.includes('images.pexels.com');
}

function optimizePexelsImage(url: string, width: number): string {
  try {
    const imageUrl = new URL(url);
    imageUrl.searchParams.set('auto', 'compress');
    imageUrl.searchParams.set('cs', 'tinysrgb');
    imageUrl.searchParams.set('w', String(width));
    return imageUrl.toString();
  } catch {
    return url;
  }
}

function optimizeResponsiveImage(url: string, width: number): string {
  if (isCloudinaryUrl(url)) return optimizeImage(url, width);
  if (isPexelsUrl(url)) return optimizePexelsImage(url, width);
  return url;
}

export function getResponsiveImageAttributes(
  url: string,
  {
    width = 1200,
    height = 900,
    sizes = '100vw',
    widths = DEFAULT_RESPONSIVE_WIDTHS,
  }: ResponsiveImageOptions = {},
): ResponsiveImageAttributes {
  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return {
      src: '',
      sizes,
      width,
      height,
    };
  }

  const supportsResponsiveOptimization = isCloudinaryUrl(cleanUrl) || isPexelsUrl(cleanUrl);

  return {
    src: optimizeResponsiveImage(cleanUrl, width),
    srcSet: supportsResponsiveOptimization
      ? widths
          .filter((candidateWidth) => candidateWidth <= Math.max(width, 1600))
          .map((candidateWidth) => `${optimizeResponsiveImage(cleanUrl, candidateWidth)} ${candidateWidth}w`)
          .join(', ')
      : undefined,
    sizes,
    width,
    height,
  };
}
