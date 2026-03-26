import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonical, 
  ogImage = 'https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file.png?raw=true', 
  ogType = 'website',
  structuredData 
}) => {
  useEffect(() => {
    const fullTitle = `${title} | BOT BASH`;
    document.title = fullTitle;

    // Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Canonical Link
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }

    // Open Graph Tags
    const ogTags = [
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description || '' },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description || '' },
      { name: 'twitter:image', content: ogImage }
    ];

    ogTags.forEach(tag => {
      const attr = tag.property ? 'property' : 'name';
      const val = tag.property || tag.name;
      let element = document.querySelector(`meta[${attr}="${val}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, val!);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    // Structured Data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

  }, [title, description, canonical, ogImage, ogType, structuredData]);

  return null;
};

export default SEO;
