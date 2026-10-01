import type { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

// Module-level on purpose: components declared inside other components remount their inputs on every keystroke.
export function FormField({ id, label, hint, error, children }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
