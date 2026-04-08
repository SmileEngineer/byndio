import { Clock3, Heart, MapPin, ShieldCheck, Star, Tag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[22px] border border-border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative aspect-[0.92] overflow-hidden bg-muted">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            {product.timerLabel ? (
              <Badge className="rounded-full bg-slate-950/85 px-3 py-1 text-[11px] text-white">
                {product.timerLabel}
              </Badge>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {product.discount ? (
                <Badge className="rounded-full bg-accent px-3 py-1 text-[11px] text-white">
                  {product.discount}% OFF
                </Badge>
              ) : null}
              {product.sponsored ? (
                <Badge variant="secondary" className="rounded-full bg-white/90 px-3 py-1 text-[11px]">
                  Sponsored
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow">
            <Heart className="h-4.5 w-4.5" />
          </div>
        </div>

        {(product.sellerTag || product.badge) && (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
            {product.sellerTag ? (
              <Badge className="rounded-full bg-white/95 px-3 py-1 text-[11px] text-slate-700">
                {product.sellerTag}
              </Badge>
            ) : null}
            {product.badge ? (
              <Badge className="rounded-full bg-primary px-3 py-1 text-[11px] text-white">
                {product.badge}
              </Badge>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {product.brand}
          </div>
          <h4 className="line-clamp-2 min-h-[44px] text-sm">{product.name}</h4>
        </div>

        <div className="space-y-1">
          <div className="flex items-end gap-2">
            <span className="text-xl font-semibold text-foreground">Rs {product.price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground line-through">
              Rs {product.mrp.toLocaleString()}
            </span>
          </div>
          {product.upiOffer ? <div className="text-xs text-success">{product.upiOffer}</div> : null}
        </div>

        {product.affiliateRate ? (
          <div className="rounded-2xl bg-secondary/70 px-3 py-2 text-xs text-primary">
            {product.affiliateRate}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 rounded-full bg-[#03a685] px-2 py-1 text-white">
            <span>{product.rating.toFixed(1)}</span>
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="text-muted-foreground">({product.reviews.toLocaleString()})</span>
          {product.trusted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {product.localSeller ? (
            <Badge variant="secondary" className="gap-1 rounded-full">
              <MapPin className="h-3.5 w-3.5" />
              Local seller
            </Badge>
          ) : null}
          {product.deliveryTime ? (
            <Badge variant="outline" className="gap-1 rounded-full">
              <Clock3 className="h-3.5 w-3.5" />
              {product.deliveryTime}
            </Badge>
          ) : null}
          {product.creator ? (
            <Badge variant="outline" className="gap-1 rounded-full">
              <Tag className="h-3.5 w-3.5" />
              {product.creator}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {product.viewersToday ? <div>{product.viewersToday} people viewed today</div> : null}
          {product.stockLeft ? <div>Only {product.stockLeft} left in stock</div> : null}
        </div>
      </div>
    </button>
  );
}
