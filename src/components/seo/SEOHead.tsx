import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { photographerInfo } from '@/data/photographer';

type SEOType = 'website' | 'article';
type Locale = 'en' | 'ar';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: SEOType;
  locale?: Locale;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalPath?: string;
}

const SITE_NAME = 'IM Design Studio';
const DEFAULT_IMAGE = photographerInfo.portraitImage;
const DEFAULT_DESCRIPTION =
  'Graphic designer specializing in brand identity, visual systems, and social media design. Based in Cairo, Egypt.';

function getBaseUrl() {
  if (typeof window === 'undefined') return 'https://im-design-studio.vercel.app';
  return window.location.origin;
}

function buildTitle(title?: string) {
  if (!title || title.trim() === '' || title === SITE_NAME) return SITE_NAME;
  return `${title} | ${SITE_NAME}`;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const sel = extra?.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  if (extra) Object.entries(extra).forEach(([k, v]) => el?.setAttribute(k, v));
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.querySelector<HTMLScriptElement>(`script#${id}`)?.remove();
}

export function SEOHead({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = 'website',
  locale = 'en',
  publishedTime,
  modifiedTime,
  canonicalPath,
}: SEOHeadProps) {
  const location = useLocation();

  const seo = useMemo(() => {
    const baseUrl = getBaseUrl();
    const cleanPath = canonicalPath || location.pathname;
    const canonicalUrl = `${baseUrl}${cleanPath}`;
    const fullTitle = buildTitle(title);
    const fullDescription = description || photographerInfo.heroIntroduction || DEFAULT_DESCRIPTION;
    const pageImage = image || DEFAULT_IMAGE;
    const isArabic = locale === 'ar';
    return {
      baseUrl,
      canonicalUrl,
      fullTitle,
      fullDescription,
      pageImage,
      htmlLang: isArabic ? 'ar' : 'en',
      htmlDir: isArabic ? 'rtl' : 'ltr',
      ogLocale: isArabic ? 'ar_EG' : 'en_US',
    };
  }, [canonicalPath, description, image, locale, location.pathname, title]);

  useEffect(() => {
    document.title = seo.fullTitle;
    document.documentElement.lang = seo.htmlLang;
    document.documentElement.dir = seo.htmlDir;

    upsertMeta('name', 'description', seo.fullDescription);
    upsertMeta('name', 'author', photographerInfo.name);
    upsertMeta('name', 'keywords',
      ['graphic design','brand identity','visual identity','branding','social media design',
       'logo design','packaging design', photographerInfo.name,'IM Design Studio','Cairo designer'].join(', '));

    upsertLink('canonical', seo.canonicalUrl);
    upsertLink('alternate', `${seo.baseUrl}${location.pathname}`, { hreflang: 'en' });
    upsertLink('alternate', `${seo.baseUrl}${location.pathname}`, { hreflang: 'x-default' });

    upsertMeta('property', 'og:title', seo.fullTitle);
    upsertMeta('property', 'og:description', seo.fullDescription);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', seo.canonicalUrl);
    upsertMeta('property', 'og:image', seo.pageImage);
    upsertMeta('property', 'og:image:alt', seo.fullTitle);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', seo.ogLocale);

    if (type === 'article') {
      if (publishedTime) upsertMeta('property', 'article:published_time', publishedTime);
      if (modifiedTime) upsertMeta('property', 'article:modified_time', modifiedTime);
      upsertMeta('property', 'article:author', photographerInfo.name);
    }

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', seo.fullTitle);
    upsertMeta('name', 'twitter:description', seo.fullDescription);
    upsertMeta('name', 'twitter:image', seo.pageImage);
    upsertMeta('name', 'twitter:image:alt', seo.fullTitle);

    upsertJsonLd('person-schema', {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${seo.baseUrl}/#person`,
      name: photographerInfo.name,
      jobTitle: 'Graphic Designer',
      description: photographerInfo.heroIntroduction,
      url: seo.baseUrl,
      image: photographerInfo.portraitImage,
      email: photographerInfo.email,
      telephone: photographerInfo.phone,
      address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
      sameAs: Object.values(photographerInfo.socialLinks).filter(Boolean),
      knowsAbout: photographerInfo.skills,
    });

    upsertJsonLd('organization-schema', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${seo.baseUrl}/#organization`,
      name: SITE_NAME,
      url: seo.baseUrl,
      logo: `${seo.baseUrl}/favicon.webp`,
      founder: { '@id': `${seo.baseUrl}/#person` },
      sameAs: Object.values(photographerInfo.socialLinks).filter(Boolean),
    });

    upsertJsonLd('professional-service-schema', {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${seo.baseUrl}/#professional-service`,
      name: SITE_NAME,
      url: seo.baseUrl,
      image: seo.pageImage,
      description: seo.fullDescription,
      founder: { '@id': `${seo.baseUrl}/#person` },
      areaServed: ['Egypt', 'MENA', 'Worldwide'],
      address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
      serviceType: ['Brand Identity Design','Logo Design','Social Media Design','Packaging Design','Visual Identity Design'],
    });

    if (type === 'article') {
      upsertJsonLd('creative-work-schema', {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        headline: seo.fullTitle,
        name: title || seo.fullTitle,
        description: seo.fullDescription,
        image: seo.pageImage,
        url: seo.canonicalUrl,
        author: { '@id': `${seo.baseUrl}/#person` },
        creator: { '@id': `${seo.baseUrl}/#person` },
        publisher: { '@id': `${seo.baseUrl}/#organization` },
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
      });
    } else {
      removeJsonLd('creative-work-schema');
    }
  }, [location.pathname, modifiedTime, publishedTime, seo, title, type]);

  return null;
}
