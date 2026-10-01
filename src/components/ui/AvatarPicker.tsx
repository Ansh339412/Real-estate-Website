import { useRef, useState, type ChangeEvent } from 'react';
import { validateImage } from '../../repositories/StorageRepository';

interface Props {
  src: string | null;
  initial: string;
  onPick: (file: File) => void;
  onRemove?: () => void;
  busy?: boolean;
}

/** Circular photo chooser that opens the device gallery. Files are validated here before anything uploads. */
export function AvatarPicker({ src, initial, onPick, onRemove, busy = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const message = validateImage(file);
    setProblem(message);
    if (!message) onPick(file);
  }

  return (
    <div className="flex items-center gap-5">
      {src ? (
        <img src={src} alt="Your profile photo" className="h-24 w-24 rounded-full object-cover ring-4 ring-brand/15" />
      ) : (
        <div aria-hidden="true" className="flex h-24 w-24 items-center justify-center rounded-full bg-brand font-display text-4xl font-bold text-white ring-4 ring-brand/15">{initial}</div>
      )}
      <div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} className="sr-only" aria-label="Choose a profile photo from your gallery" />
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
            className="rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-semibold hover:border-brand disabled:opacity-60">
            {busy ? 'Uploading…' : src ? 'Change photo' : 'Choose photo from gallery'}
          </button>
          {src && onRemove && !busy && (
            <button type="button" onClick={onRemove} className="rounded-md px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button>
          )}
        </div>
        <p className="mt-1 text-xs text-ink/60">JPG, PNG or WebP, up to 5 MB.</p>
        {problem && <p role="alert" className="mt-1 text-sm text-red-700">{problem}</p>}
      </div>
    </div>
  );
}
