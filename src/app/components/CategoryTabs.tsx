import { ChevronDown, Sparkles } from 'lucide-react';

interface CategoryTabsProps {
  categories: Array<{ key: string; label: string }>;
  activeCategory: string;
  onSelect: (categoryKey: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 overflow-x-auto px-4">
        {categories.map((category) => {
          const isActive = activeCategory === category.key;

          return (
            <button
              key={category.key}
              onClick={() => onSelect(category.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {category.key === 'for-you' ? <Sparkles className="h-4 w-4" /> : null}
              <span>{category.label}</span>
              {['fashion', 'electronics', 'home'].includes(category.key) ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
