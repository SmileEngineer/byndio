import { Search, ShoppingCart, MapPin, User, Menu } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface HeaderProps {
  onLocationClick: () => void;
  onLoginClick: () => void;
}

export function Header({ onLocationClick, onLoginClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="flex items-center gap-4 px-4 py-3 max-w-[1400px] mx-auto">
        <button className="lg:hidden">
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="text-[28px] tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <span className="text-[#2874f0]">BYND</span>
            <span className="text-[#ff9f00]">IO</span>
          </div>
        </div>

        <button
          onClick={onLocationClick}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm">Mumbai 400001</span>
        </button>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for products, brands and more"
            className="pl-10 bg-secondary/50 border-none focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoginClick}
            className="hidden sm:flex gap-2"
          >
            <User className="w-4 h-4" />
            <span>Login</span>
          </Button>

          <Button variant="ghost" size="sm" className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              2
            </span>
          </Button>
        </div>
      </div>

      <button
        onClick={onLocationClick}
        className="lg:hidden w-full flex items-center gap-2 px-4 py-2 bg-secondary/30 border-t border-border"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm">Deliver to: Mumbai 400001</span>
      </button>
    </header>
  );
}
