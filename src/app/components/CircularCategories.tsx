import { ImageWithFallback } from './figma/ImageWithFallback';

interface CircularCategoriesProps {
  categories: Array<{
    key: string;
    name: string;
    badge: string;
    image: string;
  }>;
  onSelect: (categoryKey: string) => void;
}

export function CircularCategories({ categories, onSelect }: CircularCategoriesProps) {
  return (
    <section className="mx-auto max-w-[1400px] bg-white py-6">
      <div className="px-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3>Shop by category</h3>
            <p className="text-sm text-muted-foreground">
              Mobile first circular categories with offer badges and quick discovery.
            </p>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => onSelect(category.key)}
              className="group min-w-[92px] text-center"
            >
              <div className="relative mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-2 border-border transition group-hover:border-primary">
                <ImageWithFallback
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/75 px-2 py-0.5 text-[10px] text-white">
                  {category.badge}
                </div>
              </div>
              <div className="line-clamp-1 text-sm">{category.name}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
