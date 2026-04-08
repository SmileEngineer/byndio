import { ImageWithFallback } from './figma/ImageWithFallback';

const categories = [
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=150&h=150&fit=crop' },
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop' },
  { name: 'Home', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&h=150&fit=crop' },
  { name: 'Toys', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=150&h=150&fit=crop' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&h=150&fit=crop' },
  { name: 'Books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=150&h=150&fit=crop' },
  { name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop' },
];

export function CircularCategories() {
  return (
    <div className="bg-white py-6 max-w-[1400px] mx-auto">
      <div className="px-4">
        <h3 className="mb-4">Shop by Category</h3>
        <div className="flex overflow-x-auto gap-6 pb-2 scrollbar-hide">
          {categories.map((cat, idx) => (
            <button key={idx} className="flex flex-col items-center gap-2 min-w-[80px] group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
