const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600] as const;

type ResponsiveImageOptions = {
  width?: number;
  quality?: number;
};

export type ResponsiveImageAttributes = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
};

function isCloudinaryUrl(url: string) {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

function isUnsplashUrl(url: string) {
  return url.includes('images.unsplash.com');
}

function isPexelsImageUrl(url: string) {
  return url.includes('images.pexels.com');
}

export function optimizeImageUrl(url: string, options: ResponsiveImageOptions = {}) {
  const width = options.width ?? 1200;
  const quality = options.quality ?? 80;

  if (!url) return url;

  if (isCloudinaryUrl(url)) {
    if (!url.includes('/image/upload/')) return url;
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) {
      return url.replace(/w_\d+/g, `w_${width}`);
    }
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
  }

  if (isUnsplashUrl(url)) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('q', String(quality));
      parsed.searchParams.set('w', String(width));
      return parsed.toString();
    } catch { return url; }
  }

  if (isPexelsImageUrl(url)) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'compress');
      parsed.searchParams.set('cs', 'tinysrgb');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('w', String(width));
      return parsed.toString();
    } catch { return url; }
  }

  return url;
}

export function buildSrcSet(url: string, quality = 80) {
  if (!url) return '';
  return RESPONSIVE_WIDTHS
    .map((width) => `${optimizeImageUrl(url, { width, quality })} ${width}w`)
    .join(', ');
}

export function getResponsiveImageAttributes(
  url: string,
  {
    width = 1200,
    height = 800,
    sizes = '(min-width: 1024px) 50vw, 100vw',
    quality = 80,
  }: {
    width?: number;
    height?: number;
    sizes?: string;
    quality?: number;
  } = {},
): ResponsiveImageAttributes {
  return {
    src: optimizeImageUrl(url, { width, quality }),
    srcSet: buildSrcSet(url, quality),
    sizes,
    width,
    height,
  };
}
