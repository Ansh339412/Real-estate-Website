export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden="true" className="btn-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-md">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9h13v-9" /><circle cx="12" cy="14" r="1.6" />
        </svg>
      </span>
      <span className={`font-display text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Hearth &amp; Key</span>
    </span>
  );
}
