import { useState } from 'react';
import { formatPrice } from '../../utils/format';

/** Home-loan EMI estimate: EMI = P·r·(1+r)^n / ((1+r)^n − 1). Indicative only. */
export function EmiCalculator({ price }: { price: number }) {
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const principal = price * (1 - down / 100);
  const r = rate / 12 / 100;
  const n = years * 12;
  const emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interestShare = total > 0 ? Math.round(((total - principal) / total) * 100) : 0;
  const slider = 'w-full accent-brand';

  return (
    <section aria-labelledby="emi-title" className="glass rounded-2xl p-6">
      <h2 id="emi-title" className="text-xl font-bold">Home loan EMI calculator</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold">Down payment: {down}% ({formatPrice(price * (down / 100))})
            <input type="range" min={0} max={90} step={5} value={down} onChange={(e) => setDown(Number(e.target.value))} className={slider} /></label>
          <label className="block text-sm font-semibold">Interest rate: {rate}% per year
            <input type="range" min={5} max={15} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className={slider} /></label>
          <label className="block text-sm font-semibold">Loan tenure: {years} years
            <input type="range" min={1} max={30} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className={slider} /></label>
        </div>
        <div>
          <p className="text-sm text-ink/60">Estimated monthly EMI</p>
          <p className="font-display text-4xl font-bold text-brand-dark" aria-live="polite">{formatPrice(Math.round(emi))}</p>
          <div aria-hidden="true" className="mt-4 flex h-3 overflow-hidden rounded-full bg-mist">
            <div className="btn-primary" style={{ width: `${100 - interestShare}%` }} />
            <div className="bg-accent/70" style={{ width: `${interestShare}%` }} />
          </div>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Loan amount</dt><dd className="font-semibold">{formatPrice(Math.round(principal))}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Total interest</dt><dd className="font-semibold">{formatPrice(Math.round(total - principal))}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Total payable</dt><dd className="font-semibold">{formatPrice(Math.round(total))}</dd></div>
          </dl>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink/50">Indicative estimate only. Your lender's rate and charges will decide the final figure.</p>
    </section>
  );
}
