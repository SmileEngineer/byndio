import { useState, useEffect } from 'react';
import { Clock, Eye, Package } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Badge } from './ui/badge';

interface DropDeal {
  id: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviews: number;
  endsAt: Date;
  stockLeft: number;
  viewing: number;
}

interface DropDealsProps {
  deals: DropDeal[];
  onProductClick: (product: any) => void;
}

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = endsAt.getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1.5 bg-destructive text-white px-3 py-1.5 rounded-full text-sm">
      <Clock className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  );
}

export function DropDeals({ deals, onProductClick }: DropDealsProps) {
  const nextDrop = new Date();
  nextDrop.setHours(nextDrop.getHours() + 6);

  return (
    <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-8 max-w-[1400px] mx-auto">
      <div className="px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl mb-2">⚡ Drop Deals</h2>
            <p className="text-sm text-muted-foreground">Limited time offers - grab them before they're gone!</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-sm text-muted-foreground">Next drop in:</div>
            <CountdownTimer endsAt={nextDrop} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <div key={deal.id} className="relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                <CountdownTimer endsAt={deal.endsAt} />
              </div>

              <ProductCard
                product={deal}
                onClick={() => onProductClick(deal)}
              />

              <div className="mt-2 flex items-center justify-between text-xs bg-white rounded-lg p-2 border border-border">
                <div className="flex items-center gap-1 text-destructive">
                  <Package className="w-3 h-3" />
                  <span>{deal.stockLeft} left</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{deal.viewing} viewing</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
