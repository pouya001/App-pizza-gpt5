'use client';
import { useEffect } from 'react';

// Hides the Vercel preview toolbar — it's injected after load and shows up in print
export function VercelToolbarKiller() {
  useEffect(() => {
    const SELECTORS = [
      'vercel-toolbar',
      '#vercel-live-feedback',
      '#__vercel_toolbar',
      '#__vercel_toolbar_wrapper',
      'iframe[src*="vercel.live"]',
      'iframe[name="vercel-live-feedback"]',
    ].join(',');

    function kill() {
      document.querySelectorAll<HTMLElement>(SELECTORS).forEach((el) => {
        el.style.setProperty('display', 'none', 'important');
      });
    }

    kill();

    const observer = new MutationObserver(kill);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('beforeprint', kill);

    return () => {
      observer.disconnect();
      window.removeEventListener('beforeprint', kill);
    };
  }, []);

  return null;
}
