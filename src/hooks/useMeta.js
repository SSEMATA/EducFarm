import { useEffect } from 'react';

const OG_IMAGE = 'https://res.cloudinary.com/d5qqtsou/image/upload/v1788426936/sm_smo9sk.jpg';

function setMeta(property, content, isName = false) {
  const attr = isName ? 'name' : 'property';
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setGoogleVerification(content) {
  let el = document.querySelector('meta[name="google-site-verification"]');
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', 'google-site-verification'); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', url);
}

export function useMeta({ title, description, url, keywords, ogImage, googleVerification }) {
  useEffect(() => {
    const prev = { title: document.title };
    document.title = title;
    if (googleVerification) setGoogleVerification(googleVerification);
    setMeta('description', description, true);
    setMeta('robots', 'index, follow', true);
    if (keywords) setMeta('keywords', keywords, true);
    setMeta('og:type', 'website');
    setMeta('og:site_name', 'EducFarm');
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:url', url);
    setMeta('og:image', ogImage || OG_IMAGE);
    setMeta('twitter:card', 'summary_large_image', true);
    setMeta('twitter:title', title, true);
    setMeta('twitter:description', description, true);
    setMeta('twitter:image', ogImage || OG_IMAGE, true);
    setCanonical(url);
    return () => { document.title = prev.title; };
  }, [title, description, url, keywords, ogImage]);
}
