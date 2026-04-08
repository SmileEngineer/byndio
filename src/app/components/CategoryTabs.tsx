import { Package, Shirt, Smartphone, Home, Sparkles, Gift } from 'lucide-react';

const categories = [
  { icon: Sparkles, label: 'Top Offers' },
  { icon: Smartphone, label: 'Electronics' },
  { icon: Shirt, label: 'Fashion' },
  { icon: Home, label: 'Home' },
  { icon: Package, label: 'Grocery' },
  { icon: Gift, label: 'Gifts' },
];

export function CategoryTabs() {
  return (
    <div className="bg-white border-b border-border overflow-x-auto">
      <div className="flex items-center gap-1 max-w-[1400px] mx-auto px-4">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className="flex items-center gap-2 px-4 py-3 text-sm hover:text-primary hover:bg-secondary/50 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-primary"
          >
            <cat.icon className="w-4 h-4" />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
