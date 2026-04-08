import { ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface Product {
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
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductSection({ title, products, onProductClick }: ProductSectionProps) {
  return (
    <section className="bg-white py-6 max-w-[1400px] mx-auto">
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3>{title}</h3>
          <button className="flex items-center gap-1 text-primary text-sm hover:underline">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
