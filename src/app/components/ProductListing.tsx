import { useMemo, useState } from 'react';
import { ArrowLeft, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ProductCard } from './ProductCard';
import type { LocationInfo, Product } from '../types';

interface ProductListingProps {
  title: string;
  description: string;
  products: Product[];
  location: LocationInfo;
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

const filters = [
  { key: 'all', label: 'All' },
  { key: 'trending', label: 'Trending' },
  { key: 'under999', label: 'Under Rs 999' },
  { key: 'new', label: 'New' },
  { key: 'topRated', label: 'Top rated' },
  { key: 'local', label: 'Hyperlocal' },
];

const sortOptions = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'priceLow', label: 'Price low to high' },
  { key: 'rating', label: 'Rating' },
  { key: 'delivery', label: 'Fast delivery' },
];

export function ProductListing({
  title,
  description,
  products,
  location,
  onBack,
  onProductClick,
}: ProductListingProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const filteredProducts = useMemo(() => {
    let nextProducts = [...products];

    if (activeFilter === 'under999') {
      nextProducts = nextProducts.filter((product) => product.price <= 999);
    }

    if (activeFilter === 'topRated') {
      nextProducts = nextProducts.filter((product) => product.rating >= 4.5);
    }

    if (activeFilter === 'new') {
      nextProducts = nextProducts.filter((product) => product.badge?.toLowerCase().includes('new'));
    }

    if (activeFilter === 'trending') {
      nextProducts = nextProducts.filter((product) => (product.viewersToday ?? 0) >= 100);
    }

    if (activeFilter === 'local') {
      nextProducts = nextProducts.filter((product) => product.localSeller);
    }

    switch (sortBy) {
      case 'priceLow':
        nextProducts.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        nextProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery':
        nextProducts.sort((a, b) => (a.deliveryTime || '').localeCompare(b.deliveryTime || ''));
        break;
      default:
        nextProducts.sort((a, b) => (b.viewersToday ?? 0) - (a.viewersToday ?? 0));
    }

    return nextProducts;
  }, [activeFilter, products, sortBy]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2>{title}</h2>
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location.area}, {location.city}
                </Badge>
              </div>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
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

            <div className="flex items-center gap-2 overflow-x-auto">
              <Badge variant="outline" className="gap-1 rounded-full px-3 py-2">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters update instantly
              </Badge>
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                    sortBy === option.key
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border bg-white hover:border-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredProducts.length} products for {location.pincode}. Nearby seller results are prioritized.
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
          ))}
        </div>
      </section>
    </div>
  );
}
