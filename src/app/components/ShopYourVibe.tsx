import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { VibeCard } from '../types';

interface ShopYourVibeProps {
  vibes: VibeCard[];
  onSelectVibe: (vibe: VibeCard) => void;
}

const quickFilters = [
  { key: 'trending', label: 'Trending' },
  { key: 'under999', label: 'Under Rs 999' },
  { key: 'new', label: 'New' },
  { key: 'topRated', label: 'Top rated' },
];

export function ShopYourVibe({ vibes, onSelectVibe }: ShopYourVibeProps) {
  const [activeFilter, setActiveFilter] = useState('trending');

  return (
    <section className="mx-auto max-w-[1400px] bg-white py-8">
      <div className="px-4">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl">Shop your vibe</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Not categories. Lifestyle led discovery tiles that match shopping intent, mood and creator context.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {quickFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                  activeFilter === filter.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-white hover:border-primary hover:bg-secondary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {vibes.map((vibe, index) => {
            const isPrimary = index === 0;
            const highlight = vibe.filterKey === activeFilter;

            return (
              <button
                key={vibe.id}
                onClick={() => onSelectVibe(vibe)}
                className={`group relative overflow-hidden rounded-[28px] text-left ${
                  isPrimary ? 'min-h-[360px] lg:row-span-2' : 'min-h-[220px]'
                } ${highlight ? 'ring-2 ring-primary/70' : ''}`}
              >
                <ImageWithFallback
                  src={vibe.image}
                  alt={vibe.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${vibe.gradient}`} />
                <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                  <div className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                    {highlight ? 'Quick filter match' : vibe.subtitle}
                  </div>
                  <div>
                    <h3 className={isPrimary ? 'text-3xl' : 'text-xl'}>{vibe.title}</h3>
                    <p className="mt-2 text-sm text-white/90">{vibe.tagline}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
