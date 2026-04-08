import { useEffect, useMemo, useState } from 'react';
import { Clock3, Eye, Flame, Package } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Badge } from './ui/badge';
import type { DropDeal } from '../types';

interface DropDealsProps {
  deals: DropDeal[];
  onProductClick: (product: DropDeal) => void;
  onViewAll: () => void;
}

function useCountdown(targetDate: Date) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      const diff = targetDate.getTime() - Date.now();

      if (diff <= 0) {
        setValue('00:00:00');
        window.clearInterval(timer);
        return;
      }

      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      setValue(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  return value;
}

function CountdownPill({ targetDate }: { targetDate: Date }) {
  const countdown = useCountdown(targetDate);

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
      <Clock3 className="h-3.5 w-3.5" />
      {countdown}
    </div>
  );
}

export function DropDeals({ deals, onProductClick, onViewAll }: DropDealsProps) {
  const nextDropDate = useMemo(() => new Date(Date.now() + 6 * 60 * 60 * 1000), []);

  return (
    <section className="mx-auto max-w-[1400px] bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-rose-50 py-8">
      <div className="px-4">
        <div className="mb-6 rounded-[28px] bg-slate-950 p-5 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <Flame className="h-3.5 w-3.5" />
                Limited time drops. Gone when sold out.
              </div>
              <h2 className="text-2xl">Drop deals</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/75">
                Each card carries its own countdown, stock pressure and live viewer count instead of using a single generic flash sale strip.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Next drop in</div>
                <div className="mt-1">
                  <CountdownPill targetDate={nextDropDate} />
                </div>
              </div>
              <button
                onClick={onViewAll}
                className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                View all drops
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {deals.map((deal, index) => (
            <div key={deal.id} className={index === 0 ? 'lg:col-span-2' : ''}>
              <div className="mb-3 flex items-center justify-between">
                <CountdownPill targetDate={deal.endsAt} />
                <Badge className="rounded-full bg-white px-3 py-1 text-primary shadow">
                  Picked by creators
                </Badge>
              </div>
              <ProductCard product={deal} onClick={() => onProductClick(deal)} />
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-border bg-white px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 text-destructive">
                    <Package className="h-4 w-4" />
                    Only {deal.stockLeft} left
                  </div>
                  <div className="text-xs text-muted-foreground">Low stock creates urgency.</div>
                </div>
                <div className="rounded-2xl border border-border bg-white px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 text-primary">
                    <Eye className="h-4 w-4" />
                    {deal.peopleViewing} viewing now
                  </div>
                  <div className="text-xs text-muted-foreground">Demand proof for fast moving products.</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
