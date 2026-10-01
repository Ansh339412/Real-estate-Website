import { AnimatePresence, motion } from 'framer-motion';
import { useState, type KeyboardEvent } from 'react';
import type { PropertyImage } from '../../types/property';
import { ease } from '../ui/motion';

export interface ImageCarouselProps {
  images: PropertyImage[];
  initialIndex?: number;
  showThumbnails?: boolean;
  onSlideChange?: (index: number) => void;
  className?: string;
}

export function ImageCarousel({ images, initialIndex = 0, showThumbnails = true, onSlideChange, className = '' }: ImageCarouselProps) {
  const [[index, dir], setState] = useState<[number, number]>([Math.min(initialIndex, Math.max(images.length - 1, 0)), 0]);
  if (images.length === 0) return null;

  const go = (next: number) => {
    const i = (next + images.length) % images.length;
    setState([i, next > index || (index === images.length - 1 && i === 0) ? 1 : -1]);
    onSlideChange?.(i);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  };
  const current = images[index];
  const btn = 'absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl font-bold';

  return (
    <section aria-roledescription="carousel" aria-label="Property photos" onKeyDown={onKeyDown} className={className}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-ink/5">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img key={current.src} src={current.src} alt={current.alt} custom={dir}
            variants={{ enter: (d: number) => ({ x: d * 80, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d * -80, opacity: 0 }) }}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease }}
            className="absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => go(index - 1)} className={`${btn} left-3`}>‹</button>
            <button type="button" aria-label="Next photo" onClick={() => go(index + 1)} className={`${btn} right-3`}>›</button>
          </>
        )}
        <p aria-live="polite" className="absolute bottom-3 right-3 z-10 rounded bg-ink/80 px-2 py-1 text-xs text-white">{index + 1} / {images.length}</p>
      </div>
      {showThumbnails && images.length > 1 && (
        <ul className="mt-2 flex gap-2">
          {images.map((img, i) => (
            <li key={img.src}>
              <button type="button" onClick={() => go(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index}
                className={`overflow-hidden rounded-md border-2 transition-opacity ${i === index ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <img src={img.src} alt="" className="h-16 w-24 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
