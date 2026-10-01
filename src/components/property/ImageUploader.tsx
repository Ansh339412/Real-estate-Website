import { useRef, useState, type ChangeEvent } from 'react';
import { storage } from '../../repositories';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  userId: string;
  onBusyChange?: (busy: boolean) => void;
  max?: number;
  error?: string;
}

export function ImageUploader({ value, onChange, userId, onBusyChange, max = 8, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, max - value.length);
    e.target.value = '';
    if (files.length === 0) return;
    setBusy(true);
    onBusyChange?.(true);
    setProblem(null);
    const urls = [...value];
    for (const file of files) {
      try {
        urls.push(await storage.upload(file, userId));
      } catch (err) {
        setProblem(err instanceof Error ? err.message : 'Upload failed.');
      }
    }
    onChange(urls);
    setBusy(false);
    onBusyChange?.(false);
  }

  const remove = (url: string) => {
    onChange(value.filter((u) => u !== url));
    void storage.removeByUrls([url]).catch(() => undefined);
  };
  const makeCover = (url: string) => onChange([url, ...value.filter((u) => u !== url)]);

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">Photos</span>
      <input ref={inputRef} id="photos" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={onFiles} className="sr-only" />
      <button type="button" disabled={busy || value.length >= max} onClick={() => inputRef.current?.click()}
        className="rounded-md border-2 border-dashed border-ink/30 bg-white px-5 py-4 font-semibold hover:border-brand disabled:opacity-60">
        {busy ? 'Uploading…' : value.length >= max ? `Maximum ${max} photos` : 'Choose photos from your gallery'}
      </button>
      <p className="mt-1 text-xs text-ink/60">JPG, PNG or WebP, up to 5 MB each, up to {max} photos. The first photo is the cover.</p>
      {problem && <p role="alert" className="mt-1 text-sm text-red-700">{problem}</p>}
      {error && <p id="images-err" role="alert" className="mt-1 text-sm text-red-700">{error}</p>}

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url, i) => (
            <li key={url} className="overflow-hidden rounded-lg border border-ink/10 bg-white">
              <div className="relative">
                <img src={url} alt={`Uploaded photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded btn-primary px-2 py-0.5 text-xs font-semibold text-white">Cover</span>}
              </div>
              <div className="flex justify-between gap-2 p-2 text-xs font-semibold">
                {i > 0 ? <button type="button" onClick={() => makeCover(url)} className="text-brand underline">Make cover</button> : <span />}
                <button type="button" onClick={() => remove(url)} className="text-red-700 underline">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
