import { useState } from 'react';
import { FormField } from './FormField';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  error?: string;
  hint?: string;
}

export function PasswordField({ id, label, value, onChange, autoComplete, error, hint }: Props) {
  const [show, setShow] = useState(false);
  return (
    <FormField id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value}
          onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined}
          className="w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 pr-16" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm font-semibold text-brand">
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </FormField>
  );
}
