import { Heart, MapPin, Clock, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    mrp: number;
    discount: number;
    rating: number;
    reviews: number;
    localSeller?: boolean;
    sponsored?: boolean;
    deliveryTime?: string;
    stockLeft?: number;
    creator?: string;
  };
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle wishlist logic here
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow group text-left w-full"
    >
      <div className="relative aspect-square">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4" />
        </div>

        {product.discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-accent text-white">
            {product.discount}% OFF
          </Badge>
        )}

        {product.sponsored && (
          <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
            Sponsored
          </Badge>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h4 className="text-sm line-clamp-2 min-h-[40px]">{product.name}</h4>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#03a685] text-white px-1.5 py-0.5 rounded text-xs">
            <span>{product.rating}</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg text-foreground">₹{product.price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.localSeller && (
            <Badge variant="secondary" className="text-xs gap-1">
              <MapPin className="w-3 h-3" />
              Local Seller
            </Badge>
          )}

          {product.deliveryTime && (
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="w-3 h-3" />
              {product.deliveryTime}
            </Badge>
          )}
        </div>

        {product.creator && (
          <div className="text-xs text-primary">
            Recommended by {product.creator}
          </div>
        )}

        {product.stockLeft && product.stockLeft < 10 && (
          <div className="text-xs text-destructive">
            Only {product.stockLeft} left
          </div>
        )}
      </div>
    </button>
  );
}
