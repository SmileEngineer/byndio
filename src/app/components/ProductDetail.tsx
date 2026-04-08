import { Heart, Share2, Star, Check, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useState } from 'react';

interface ProductDetailProps {
  product: any;
  onClose: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductDetail({ product, onClose, onAddToCart, onBuyNow }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');

  const images = [
    product.image,
    product.image,
    product.image,
  ];

  const sizes = ['S', 'M', 'L', 'XL'];

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon">
          <Share2 className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-6xl mx-auto lg:flex lg:gap-8 lg:p-8">
        <div className="lg:w-1/2">
          <div className="relative aspect-square bg-muted">
            <ImageWithFallback
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-accent text-white">
                {product.discount}% OFF
              </Badge>
            )}
          </div>

          <div className="flex gap-2 p-4 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === idx ? 'border-primary' : 'border-border'
                }`}
              >
                <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 p-4 space-y-6">
          <div>
            {product.creator && (
              <div className="text-sm text-primary mb-2">Recommended by {product.creator}</div>
            )}
            <h1 className="text-2xl mb-2">{product.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-success text-white px-2 py-1 rounded">
                <span>{product.rating}</span>
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm text-muted-foreground">{product.reviews} reviews</span>
              {product.localSeller && (
                <Badge variant="secondary" className="gap-1">
                  Local Seller
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl">₹{product.price.toLocaleString()}</span>
              <span className="text-xl text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
              <span className="text-lg text-success">{product.discount}% off</span>
            </div>
            <div className="text-sm text-muted-foreground">Inclusive of all taxes</div>
          </div>

          <div className="flex gap-3 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Truck className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <RotateCcw className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm">7 Day Returns</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm">Secure Payment</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4>Select Size</h4>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-lg border-2 transition-colors ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-white'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {product.stockLeft && product.stockLeft < 10 && (
            <div className="p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-destructive">Hurry! Only {product.stockLeft} left</span>
                <span className="text-sm text-muted-foreground">74% sold</span>
              </div>
              <Progress value={74} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onAddToCart} variant="outline" size="lg" className="gap-2">
              Add to Cart
            </Button>
            <Button onClick={onBuyNow} size="lg" className="gap-2">
              Buy Now
            </Button>
          </div>

          <div className="space-y-3 pt-6 border-t border-border">
            <h4>Product Highlights</h4>
            <ul className="space-y-2">
              {[
                'Premium quality fabric',
                'Comfortable fit',
                'Machine washable',
                'Available in multiple colors',
                'Trusted brand',
              ].map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-6 border-t border-border">
            <h4>Customer Reviews ({product.reviews})</h4>
            <div className="space-y-3">
              {[
                { name: 'Rahul S.', rating: 5, text: 'Excellent quality! Worth every penny.', verified: true },
                { name: 'Priya K.', rating: 4, text: 'Good product, fast delivery.', verified: true },
              ].map((review, idx) => (
                <div key={idx} className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">
                        {review.name[0]}
                      </div>
                      <div>
                        <div className="text-sm">{review.name}</div>
                        {review.verified && (
                          <div className="flex items-center gap-1 text-xs text-success">
                            <Check className="w-3 h-3" />
                            Verified Purchase
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span>{review.rating}</span>
                      <Star className="w-4 h-4 fill-success text-success" />
                    </div>
                  </div>
                  <p className="text-sm">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
