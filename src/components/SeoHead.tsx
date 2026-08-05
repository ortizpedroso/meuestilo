import { useEffect } from 'react';
import { SalonSettings } from '../types';

interface SeoHeadProps {
  settings: SalonSettings;
}

/** Atualiza título e meta tags dinâmicas conforme a marca do salão (white-label). */
export function SeoHead({ settings }: SeoHeadProps) {
  useEffect(() => {
    const name = settings.name || 'Ag Salão';
    const desc =
      settings.tagline ||
      `Agende horários online em ${name}. Escolha serviços, profissionais e horários disponíveis.`;
    const title = `${name} — Agendamento Online`;

    document.title = title;

    const setMeta = (nameOrProp: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:locale', 'pt_BR', true);
    setMeta('twitter:title', title);
    setMeta('twitter:description', desc);

    // JSON-LD LocalBusiness (SEO)
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      name,
      description: desc,
      address: settings.address
        ? { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: settings.city }
        : undefined,
      telephone: settings.phone || undefined,
      url: window.location.origin + window.location.pathname
    };
    let script = document.getElementById('ag-ld-json') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'ag-ld-json';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ld);
  }, [settings]);

  return null;
}
