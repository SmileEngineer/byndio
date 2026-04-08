import { ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  pill?: string;
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
}

export function ProductSection({
  title,
  subtitle,
  products,
  pill,
  onProductClick,
  onViewAll,
}: ProductSectionProps) {
  return (
    <section className="mx-auto max-w-[1400px] bg-white py-6">
      <div className="px-4">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3>{title}</h3>
              {pill ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                  {pill}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
          ))}
        </div>
      </div>
    </section>
  );
}
