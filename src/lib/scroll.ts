/** Smooth-scrolls to an in-page section (works with hash routing, where plain #anchors would change the route). */
export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  el.focus({ preventScroll: true }); // keyboard and screen-reader users land in the section too
  return true;
}
