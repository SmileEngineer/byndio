import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  PlayCircle,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  WalletCards,
  ZoomIn,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { LocationInfo, Product } from '../types';

interface ProductDetailProps {
  product: Product | null;
  location: LocationInfo;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductDetail({
  product,
  location,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const images = useMemo(() => product?.images || [], [product]);

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{product.brand}</div>
            <div className="line-clamp-1 text-xs text-muted-foreground">{product.name}</div>
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-[28px] bg-muted">
            <ImageWithFallback
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge className="rounded-full bg-accent text-white">{product.discount}% OFF</Badge>
              {product.badge ? <Badge className="rounded-full bg-primary text-white">{product.badge}</Badge> : null}
            </div>
            <div className="absolute right-4 top-4 flex gap-2">
              <button className="rounded-full bg-white/90 p-2 text-slate-700 shadow">
                <ZoomIn className="h-4 w-4" />
              </button>
              {product.videoLabel ? (
                <button className="rounded-full bg-white/90 p-2 text-slate-700 shadow">
                  <PlayCircle className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs text-white">
              {selectedImage + 1}/{images.length}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImage(index)}
                className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-border'
                }`}
              >
                <ImageWithFallback src={image} alt="" className="h-full w-full object-cover" />
                {index === 0 && product.videoLabel ? (
                  <div className="absolute bottom-2 left-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] text-white">
                    Video
                  </div>
                ) : null}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] bg-secondary/70 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium text-primary">
                <Truck className="h-4 w-4" />
                Delivery
              </div>
              <div>{product.deliveryTime || 'Same day'} delivery in {location.area}</div>
            </div>
            <div className="rounded-[24px] bg-secondary/70 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium text-primary">
                <RotateCcw className="h-4 w-4" />
                Returns
              </div>
              <div>Easy returns within 7 days for eligible products.</div>
            </div>
            <div className="rounded-[24px] bg-secondary/70 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium text-primary">
                <WalletCards className="h-4 w-4" />
                Payment
              </div>
              <div>Secure payment with UPI, cards and wallet support.</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {product.socialProof.map((proof) => (
                <Badge key={proof} variant="secondary" className="rounded-full px-3 py-1">
                  {proof}
                </Badge>
              ))}
            </div>

            <div>
              <div className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {product.brand}
              </div>
              <h1 className="mt-1 text-3xl">{product.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 rounded-full bg-[#03a685] px-2 py-1 text-white">
                {product.rating.toFixed(1)}
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="text-muted-foreground">{product.reviews.toLocaleString()} reviews</span>
              {product.trusted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Trusted seller
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-border p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-semibold">Rs {product.price.toLocaleString()}</span>
              <span className="text-xl text-muted-foreground line-through">
                Rs {product.mrp.toLocaleString()}
              </span>
              <span className="text-lg font-medium text-success">{product.discount}% OFF</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Inclusive of all taxes</div>
            {product.upiOffer ? <div className="mt-3 text-sm text-success">{product.upiOffer}</div> : null}
            {product.affiliateRate ? (
              <div className="mt-3 rounded-2xl bg-secondary/70 px-4 py-3 text-sm text-primary">
                {product.affiliateRate}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4>Available colors</h4>
              <div className="text-sm text-muted-foreground">{product.colors[selectedColor]?.name}</div>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {product.colors.map((color, index) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(index)}
                  className={`min-w-[88px] rounded-2xl border px-3 py-3 text-left transition ${
                    selectedColor === index ? 'border-primary bg-secondary/70' : 'border-border'
                  }`}
                >
                  <div
                    className="mb-2 h-9 w-9 rounded-full border border-border"
                    style={{ backgroundColor: color.swatch }}
                  />
                  <div className="text-xs font-medium">{color.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-primary/10 to-accent/10 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h4>Urgency and social proof</h4>
              <Badge className="rounded-full bg-destructive text-white">Selling fast</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 text-sm">{product.viewersToday} people viewed today</div>
              <div className="rounded-2xl bg-white p-4 text-sm">{product.stockLeft} left in stock</div>
              <div className="rounded-2xl bg-white p-4 text-sm">{product.peopleViewing} viewing now</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => onAddToCart(product)}>
              Add to cart
            </Button>
            <Button size="lg" className="rounded-full" onClick={() => onBuyNow(product)}>
              Buy now
            </Button>
          </div>

          <div className="space-y-3 rounded-[28px] border border-border p-5">
            <h4>Key highlights</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {product.highlights.map((highlight) => (
                <div key={highlight.label} className="rounded-2xl bg-muted/50 p-4">
                  <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {highlight.label}
                  </div>
                  <div className="mt-1 text-sm">{highlight.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-border p-5">
            <div className="flex items-center justify-between">
              <h4>Styled by creators</h4>
              <button className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                See how people styled this
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {product.styledBy.map((creator) => (
                <div key={creator.name} className="flex gap-3 rounded-2xl bg-muted/40 p-3">
                  <ImageWithFallback
                    src={creator.image}
                    alt={creator.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                  <div>
                    <div className="font-medium">{creator.name}</div>
                    <div className="text-sm text-muted-foreground">{creator.look}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-border p-5">
            <h4>Customer reviews</h4>
            {[
              {
                name: 'Ritika',
                rating: 5,
                text: 'Great fit, fast delivery and the creator styling tips were actually useful.',
              },
              {
                name: 'Mohit',
                rating: 4,
                text: 'Product matches the listing and checkout rewards made the purchase better.',
              },
            ].map((review) => (
              <div key={review.name} className="rounded-2xl bg-muted/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium">{review.name}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {review.rating}
                    <Star className="h-4 w-4 fill-current text-success" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
