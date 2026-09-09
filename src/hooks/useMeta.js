import { useEffect } from 'react';

const OG_IMAGE = 'https://res.cloudinary.com/d5qqtsou/image/upload/v1787329124/spr_qtwrcq.png';

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

export function useMeta({ title, description, url, googleVerification }) {
  useEffect(() => {
    const prev = { title: document.title };
    document.title = title;
    if (googleVerification) setGoogleVerification(googleVerification);
    setMeta('description', description, true);
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:url', url);
    setMeta('og:image', OG_IMAGE);
    setMeta('twitter:title', title, true);
    setMeta('twitter:description', description, true);
    setMeta('twitter:image', OG_IMAGE, true);
    setCanonical(url);
    return () => { document.title = prev.title; };
  }, [title, description, url]);
}
