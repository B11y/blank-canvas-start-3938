import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { photographerInfo } from '@/data/photographer';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

export function SEOHead({ 
  title, 
  description, 
  image = 'https://images.unsplash.com/photo-1662333085102-f6ae3be21c91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MDA2OTF8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjI3Njk1NjB8&ixlib=rb-4.1.0&q=80&w=1080',
  type = 'website'
}: SEOHeadProps) {
  const location = useLocation();
  
  const fullTitle = title 
    ? `IM Design Studio` 
    : 'IM Design Studio';
  
  const defaultDescription = photographerInfo.heroIntroduction;
  const fullDescription = description || defaultDescription;
  
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}${location.pathname}`;

  useEffect(() => {
    document.title = fullTitle;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    updateMetaTag('description', fullDescription);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'IM Design Studio', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', image);
    updateMetaTag('author', photographerInfo.name);
    updateMetaTag('keywords', `graphic design, branding, ${photographerInfo.name}, visual identity, social media design`);
  }, [fullTitle, fullDescription, fullUrl, image, type]);

  return null;
}
