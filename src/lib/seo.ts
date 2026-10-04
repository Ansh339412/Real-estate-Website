import { useEffect } from 'react';

/** Sets the tab title and meta description for the current page. */
export function useDocumentMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

/** Adds a JSON-LD structured-data block while the page is mounted. `<` is escaped so data can never close the tag. */
export function useJsonLd(id: string, data: object | null): void {
  useEffect(() => {
    if (!data) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.text = JSON.stringify(data).replace(/</g, '\\u003c');
    document.head.appendChild(el);
    return () => el.remove();
  }, [id, data]);
}
