import { Bell, MapPin, Menu, Search, ShoppingCart, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { LocationInfo } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  location: LocationInfo;
  onLocationClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onRewardsClick: () => void;
  isAuthenticated: boolean;
  userName?: string;
}

export function Header({
  location,
  onLocationClick,
  onLoginClick,
  onLogoutClick,
  onRewardsClick,
  isAuthenticated,
  userName,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        <button className="rounded-full p-2 transition hover:bg-secondary lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-[198px]">
          <BrandLogo size="sm" showTagline />
        </div>

        <button
          onClick={onLocationClick}
          className="hidden min-w-[220px] rounded-2xl border border-border px-4 py-2 text-left transition hover:border-primary hover:bg-secondary md:block"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {location.area}, {location.city}
          </div>
          <div className="text-xs text-muted-foreground">
            Pincode {location.pincode} | {location.mode === 'auto' ? 'Auto detected' : 'Manual'}
          </div>
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for products, local stores, creators and more"
            className="rounded-2xl border-none bg-secondary/80 pl-10 shadow-none focus-visible:ring-1"
          />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" onClick={onRewardsClick}>
            Rewards
          </Button>
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {userName || 'Account'}
              </Button>
              <Button variant="outline" size="sm" onClick={onLogoutClick}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={onLoginClick} className="gap-2">
              <User className="h-4 w-4" />
              Login
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
              2
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <button
        onClick={onLocationClick}
        className="flex w-full items-center gap-2 border-t border-border bg-secondary/30 px-4 py-2 text-left md:hidden"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm">
          Deliver to {location.area}, {location.city} {location.pincode}
        </span>
      </button>
    </header>
  );
}
