import { useEffect, useMemo, useState } from 'react';
import { Gift, LayoutDashboard, MapPin, Store } from 'lucide-react';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { HeroBanner } from './components/HeroBanner';
import { CircularCategories } from './components/CircularCategories';
import { ProductSection } from './components/ProductSection';
import { DropDeals } from './components/DropDeals';
import { ShopYourVibe } from './components/ShopYourVibe';
import { RewardsSection } from './components/RewardsSection';
import { ProductDetail } from './components/ProductDetail';
import { SellerOnboarding } from './components/SellerOnboarding';
import { PopupModal } from './components/PopupModal';
import { CheckoutSection } from './components/CheckoutSection';
import { LoginSignup } from './components/LoginSignup';
import { AdminDashboard } from './components/AdminDashboard';
import { LocationSheet } from './components/LocationSheet';
import { ProductListing } from './components/ProductListing';
import { Button } from './components/ui/button';
import { clearAuthSession, getMe, loadAuthSession, saveAuthSession, type AuthResponse } from './api';
import {
  circleCategories,
  defaultLocation,
  dropDeals,
  getProductsForCategory,
  homeCollections,
  topCategories,
  vibeCards,
} from './mockData';
import type { HomeCollection, LocationInfo, PopupType, Product, View } from './types';

function isServiceable(product: Product, location: LocationInfo) {
  if (!product.serviceZones || product.serviceZones.length === 0) {
    return true;
  }

  return product.serviceZones.includes(location.city);
}

function filterByLocation(products: Product[], location: LocationInfo) {
  const serviceable = products.filter((product) => isServiceable(product, location));
  if (serviceable.length > 0) {
    return serviceable;
  }

  return products;
}

export default function App() {
  const [authSession, setAuthSession] = useState<AuthResponse | null>(() => loadAuthSession());
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [location, setLocation] = useState<LocationInfo>(defaultLocation);
  const [activeCategory, setActiveCategory] = useState('for-you');
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [popupType, setPopupType] = useState<PopupType | null>(null);
  const [returnViewAfterDetail, setReturnViewAfterDetail] = useState<View>('home');
  const [checkoutItems, setCheckoutItems] = useState<Product[]>([]);
  const [exitPopupShown, setExitPopupShown] = useState(false);
  const [listingState, setListingState] = useState<{
    title: string;
    description: string;
    products: Product[];
  }>({
    title: 'For You',
    description: 'Personalized picks based on location and current trends.',
    products: [],
  });

  useEffect(() => {
    if (authSession) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPopupType('signup');
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [authSession]);

  useEffect(() => {
    saveAuthSession(authSession);
  }, [authSession]);

  useEffect(() => {
    let cancelled = false;

    async function validateSession() {
      if (!authSession?.token) {
        return;
      }

      try {
        const me = await getMe();
        if (cancelled) {
          return;
        }

        setAuthSession((prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            user: me.user,
            wallet: me.wallet || prev.wallet,
          };
        });
      } catch {
        if (!cancelled) {
          setAuthSession(null);
          clearAuthSession();
        }
      }
    }

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [authSession?.token]);

  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 8 || exitPopupShown || popupType || currentView !== 'home') {
        return;
      }
      setExitPopupShown(true);
      setPopupType('exitIntent');
    };

    window.addEventListener('mouseleave', handleMouseLeave);
    return () => window.removeEventListener('mouseleave', handleMouseLeave);
  }, [currentView, exitPopupShown, popupType]);

  const locationAwareCollections = useMemo(
    () =>
      homeCollections.map((collection) => ({
        ...collection,
        products: filterByLocation(collection.products, location),
      })),
    [location],
  );

  const locationAwareDropDeals = useMemo(
    () => dropDeals.filter((deal) => isServiceable(deal, location)),
    [location],
  );

  const openListing = (title: string, description: string, products: Product[]) => {
    setListingState({ title, description, products: filterByLocation(products, location) });
    setCurrentView('listing');
  };

  const openCategoryListing = (categoryKey: string, categoryLabel: string) => {
    setActiveCategory(categoryKey);

    if (categoryKey === 'for-you') {
      setCurrentView('home');
      return;
    }

    const products = getProductsForCategory(categoryKey);
    openListing(
      `${categoryLabel} picks`,
      'Dynamic category feed with local seller prioritization, discount badges and quick filters.',
      products,
    );
  };

  const openCollectionListing = (collection: HomeCollection) => {
    openListing(collection.title, collection.subtitle, collection.products);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setReturnViewAfterDetail(currentView);
    setCurrentView('productDetail');
  };

  const handleAddToCart = (product: Product) => {
    setCheckoutItems((items) => {
      if (items.find((item) => item.id === product.id)) {
        return items;
      }

      return [...items, product];
    });
  };

  const handleBuyNow = (product: Product) => {
    setCheckoutItems([product]);
    setCurrentView('checkout');
  };

  const renderHome = () => (
    <>
      <Header
        location={location}
        onLocationClick={() => setShowLocationSheet(true)}
        onLoginClick={() => setCurrentView('login')}
        onLogoutClick={() => {
          setAuthSession(null);
          clearAuthSession();
        }}
        onRewardsClick={() => setCurrentView('rewards')}
        isAuthenticated={Boolean(authSession?.token)}
        userName={authSession?.user?.name}
      />

      <CategoryTabs
        categories={topCategories}
        activeCategory={activeCategory}
        onSelect={(categoryKey) => {
          const category = topCategories.find((entry) => entry.key === categoryKey);
          openCategoryListing(categoryKey, category?.label || 'Category');
        }}
      />

      <HeroBanner
        location={location}
        onExploreDeals={() =>
          openListing(
            'Drop Deals',
            'Limited-time drops with countdowns, stock pressure and creator picks.',
            locationAwareDropDeals,
          )
        }
        onExploreNearby={() =>
          openListing(
            'Nearby Stores',
            'Products from local sellers with fast delivery and hyperlocal availability.',
            locationAwareCollections.find((collection) => collection.key === 'nearby-stores')?.products ||
              [],
          )
        }
      />

      <CircularCategories
        categories={circleCategories}
        onSelect={(categoryKey) => {
          const category = circleCategories.find((entry) => entry.key === categoryKey);
          openCategoryListing(categoryKey, category?.name || 'Category');
        }}
      />

      {locationAwareCollections
        .filter((collection) => collection.key !== 'creator-picks')
        .map((collection) => (
          <ProductSection
            key={collection.key}
            title={collection.title}
            subtitle={collection.subtitle}
            products={collection.products}
            pill={collection.pill}
            onProductClick={handleProductClick}
            onViewAll={() => openCollectionListing(collection)}
          />
        ))}

      <DropDeals
        deals={locationAwareDropDeals}
        onProductClick={handleProductClick}
        onViewAll={() =>
          openListing(
            'Drop Deals',
            'Each product has a dedicated timer, stock indicator and active viewer count.',
            locationAwareDropDeals,
          )
        }
      />

      <ShopYourVibe
        vibes={vibeCards}
        onSelectVibe={(vibe) =>
          openListing(
            vibe.title,
            `${vibe.subtitle} ${vibe.tagline}`,
            getProductsForCategory('fashion').filter(
              (product) =>
                vibe.filterKey === 'under999'
                  ? product.price <= 999
                  : vibe.filterKey === 'topRated'
                    ? product.rating >= 4.5
                    : true,
            ),
          )
        }
      />

      {locationAwareCollections
        .filter((collection) => collection.key === 'creator-picks')
        .map((collection) => (
          <ProductSection
            key={collection.key}
            title={collection.title}
            subtitle={collection.subtitle}
            products={collection.products}
            pill={collection.pill}
            onProductClick={handleProductClick}
            onViewAll={() => openCollectionListing(collection)}
          />
        ))}

      <div className="h-24" />

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-around px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto flex-col gap-1 py-2"
            onClick={() => setCurrentView('rewards')}
          >
            <Gift className="h-5 w-5" />
            <span className="text-xs">Rewards</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto flex-col gap-1 py-2"
            onClick={() => setShowLocationSheet(true)}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Nearby</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto flex-col gap-1 py-2"
            onClick={() => setCurrentView('sellerOnboarding')}
          >
            <Store className="h-5 w-5" />
            <span className="text-xs">Sell</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto flex-col gap-1 py-2"
            onClick={() => setCurrentView('sellerDashboard')}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {currentView === 'home' ? renderHome() : null}

      {currentView === 'listing' ? (
        <ProductListing
          title={listingState.title}
          description={listingState.description}
          products={listingState.products}
          location={location}
          onBack={() => setCurrentView('home')}
          onProductClick={handleProductClick}
        />
      ) : null}

      {currentView === 'productDetail' ? (
        <ProductDetail
          product={selectedProduct}
          location={location}
          onClose={() => setCurrentView(returnViewAfterDetail)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      ) : null}

      {currentView === 'checkout' ? (
        <CheckoutSection
          onClose={() => setCurrentView('home')}
          location={location}
          products={checkoutItems.length ? checkoutItems : selectedProduct ? [selectedProduct] : []}
          availablePoints={2450}
        />
      ) : null}

      {currentView === 'rewards' ? (
        <RewardsSection
          onClose={() => setCurrentView('home')}
          onTriggerPopup={(type) => setPopupType(type)}
        />
      ) : null}

      {currentView === 'sellerOnboarding' ? (
        <SellerOnboarding onClose={() => setCurrentView('home')} />
      ) : null}

      {currentView === 'sellerDashboard' ? (
        <AdminDashboard onClose={() => setCurrentView('home')} />
      ) : null}

      {currentView === 'login' ? (
        <LoginSignup
          onClose={() => setCurrentView('home')}
          onLogin={(session) => {
            setAuthSession(session);
            setCurrentView('home');
            setPopupType('firstPurchase');
          }}
        />
      ) : null}

      {showLocationSheet ? (
        <LocationSheet
          currentLocation={location}
          onClose={() => setShowLocationSheet(false)}
          onApply={(nextLocation) => {
            setLocation(nextLocation);
            setPopupType('returning');
          }}
        />
      ) : null}

      {popupType ? <PopupModal type={popupType} onClose={() => setPopupType(null)} /> : null}
    </div>
  );
}
