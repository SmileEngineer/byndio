import { ArrowRight, Clock3, MapPin, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import type { LocationInfo } from '../types';

interface HeroBannerProps {
  location: LocationInfo;
  onExploreDeals: () => void;
  onExploreNearby: () => void;
}

export function HeroBanner({ location, onExploreDeals, onExploreNearby }: HeroBannerProps) {
  return (
    <section className="mx-auto max-w-[1400px] bg-white px-4 py-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="relative overflow-hidden rounded-[28px]">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=720&fit=crop"
            alt="Trending Tuesday deals"
            className="h-full min-h-[280px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-slate-950/10" />
          <div className="absolute inset-0 flex flex-col justify-between p-6 text-white md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Trending Tuesday
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                <MapPin className="h-3.5 w-3.5" />
                Serving {location.area}, {location.city}
              </span>
            </div>

            <div className="max-w-xl space-y-4">
              <div>
                <h1 className="text-3xl font-semibold md:text-5xl">
                  Shop nearby. Discover creator led deals. Get it delivered fast.
                </h1>
                <p className="mt-3 max-w-lg text-sm text-white/90 md:text-base">
                  BYNDIO blends Flipkart style marketplace browsing with hyperlocal delivery,
                  creator picks and points based rewards.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={onExploreDeals} className="gap-2 rounded-full">
                  Explore drop deals
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={onExploreNearby}
                  variant="secondary"
                  className="gap-2 rounded-full border border-white/20 bg-white/15 text-white backdrop-blur hover:bg-white/20"
                >
                  Shop nearby stores
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] bg-gradient-to-br from-primary/10 to-accent/10 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Clock3 className="h-4 w-4" />
              Auto enabled offer strips
            </div>
            <h3 className="mt-3">Deals of the day with live urgency</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Product cards show delivery time, UPI offer, affiliate commission and social proof by default.
            </p>
          </div>

          <div className="rounded-[24px] border border-border bg-white p-5">
            <div className="mb-2 text-sm font-medium text-primary">Location flow</div>
            <h3>Auto detect or switch pincode anytime</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Products from nearby sellers update instantly when the user changes area or pincode.
            </p>
            <div className="mt-4 rounded-2xl bg-secondary/70 p-4 text-sm">
              Current delivery zone: {location.area}, {location.city} {location.pincode}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
