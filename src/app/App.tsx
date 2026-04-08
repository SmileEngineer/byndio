import { useState } from 'react';
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
import { Gift, Store, MapPin, LayoutDashboard } from 'lucide-react';
import { Button } from './components/ui/button';

type View = 'home' | 'rewards' | 'productDetail' | 'sellerOnboarding' | 'checkout' | 'login' | 'adminDashboard';
type PopupType = 'signup' | 'referral' | 'firstPurchase' | 'returning' | 'referralSuccess' | null;

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPopup, setShowPopup] = useState<PopupType>('signup');

  const bestDeals = [
    {
      id: '1',
      name: 'Premium Cotton T-Shirt - Comfortable Fit',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      price: 599,
      mrp: 1299,
      discount: 54,
      rating: 4.3,
      reviews: 1247,
      localSeller: true,
      deliveryTime: '2 hrs'
    },
    {
      id: '2',
      name: 'Wireless Bluetooth Earbuds with Charging Case',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
      price: 1299,
      mrp: 3999,
      discount: 67,
      rating: 4.5,
      reviews: 3421,
      sponsored: true,
      deliveryTime: '4 hrs'
    },
    {
      id: '3',
      name: 'Classic Denim Jeans - Slim Fit',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
      price: 1499,
      mrp: 2999,
      discount: 50,
      rating: 4.4,
      reviews: 892,
      localSeller: true,
      deliveryTime: '3 hrs'
    },
    {
      id: '4',
      name: 'Smart Watch with Fitness Tracking',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      price: 2499,
      mrp: 5999,
      discount: 58,
      rating: 4.6,
      reviews: 2156,
      deliveryTime: '6 hrs'
    },
    {
      id: '5',
      name: 'Leather Wallet - Genuine Leather',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
      price: 799,
      mrp: 1999,
      discount: 60,
      rating: 4.2,
      reviews: 567,
      localSeller: true,
      deliveryTime: '2 hrs'
    }
  ];

  const nearbyStores = bestDeals.map((p, i) => ({
    ...p,
    id: `nearby-${i}`,
    localSeller: true,
    deliveryTime: ['1 hr', '2 hrs', '3 hrs'][i % 3]
  }));

  const trendingProducts = [
    {
      id: 'trend-1',
      name: 'Running Shoes - Lightweight & Breathable',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      price: 2199,
      mrp: 4999,
      discount: 56,
      rating: 4.7,
      reviews: 1834,
      stockLeft: 7
    },
    {
      id: 'trend-2',
      name: 'Backpack - Water Resistant with USB Port',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      price: 1299,
      mrp: 2999,
      discount: 57,
      rating: 4.4,
      reviews: 1245,
      localSeller: true
    },
    {
      id: 'trend-3',
      name: 'Sunglasses - UV Protection Polarized',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      price: 899,
      mrp: 2499,
      discount: 64,
      rating: 4.3,
      reviews: 678,
      stockLeft: 5
    },
    {
      id: 'trend-4',
      name: 'Water Bottle - Insulated Steel 1L',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
      price: 499,
      mrp: 999,
      discount: 50,
      rating: 4.5,
      reviews: 2341,
      localSeller: true
    },
    {
      id: 'trend-5',
      name: 'Phone Case - Shockproof Clear',
      image: 'https://images.unsplash.com/photo-1585248809095-77b69aba8e5b?w=400&h=400&fit=crop',
      price: 299,
      mrp: 799,
      discount: 63,
      rating: 4.2,
      reviews: 3456,
      stockLeft: 8
    }
  ];

  const creatorPicks = [
    {
      id: 'creator-1',
      name: 'Aesthetic Hoodie - Oversized Fit',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
      price: 1799,
      mrp: 3999,
      discount: 55,
      rating: 4.6,
      reviews: 892,
      creator: '@fashionista'
    },
    {
      id: 'creator-2',
      name: 'Minimalist Watch - Rose Gold',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
      price: 1999,
      mrp: 4999,
      discount: 60,
      rating: 4.7,
      reviews: 1234,
      creator: '@techreview'
    },
    {
      id: 'creator-3',
      name: 'Laptop Sleeve - Vegan Leather',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
      price: 899,
      mrp: 1999,
      discount: 55,
      rating: 4.4,
      reviews: 567,
      creator: '@techblogger'
    },
    {
      id: 'creator-4',
      name: 'Yoga Mat - Extra Thick Non-Slip',
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
      price: 1299,
      mrp: 2999,
      discount: 57,
      rating: 4.8,
      reviews: 2345,
      creator: '@fitnessqueen'
    },
    {
      id: 'creator-5',
      name: 'Portable Speaker - Waterproof Bluetooth',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      price: 1599,
      mrp: 3999,
      discount: 60,
      rating: 4.5,
      reviews: 1678,
      creator: '@musiclover'
    }
  ];

  const budgetStore = [
    {
      id: 'budget-1',
      name: 'Cotton Socks Pack of 5',
      image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&h=400&fit=crop',
      price: 299,
      mrp: 699,
      discount: 57,
      rating: 4.1,
      reviews: 3421
    },
    {
      id: 'budget-2',
      name: 'Notebook Set - A5 Ruled 3 Pack',
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop',
      price: 199,
      mrp: 499,
      discount: 60,
      rating: 4.3,
      reviews: 1234
    },
    {
      id: 'budget-3',
      name: 'Phone Stand - Adjustable Aluminum',
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
      price: 349,
      mrp: 999,
      discount: 65,
      rating: 4.2,
      reviews: 892
    },
    {
      id: 'budget-4',
      name: 'Keychain - Leather with Clasp',
      image: 'https://images.unsplash.com/photo-1563465585-5c4f32f2e8f7?w=400&h=400&fit=crop',
      price: 199,
      mrp: 499,
      discount: 60,
      rating: 4.0,
      reviews: 567
    },
    {
      id: 'budget-5',
      name: 'Cable Organizer - 3 Pack',
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
      price: 249,
      mrp: 699,
      discount: 64,
      rating: 4.4,
      reviews: 2156
    }
  ];

  const dropDeals = [
    {
      id: 'drop-1',
      name: 'Wireless Mouse - Ergonomic Design',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
      price: 599,
      mrp: 1999,
      discount: 70,
      rating: 4.4,
      reviews: 1234,
      endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      stockLeft: 23,
      viewing: 145
    },
    {
      id: 'drop-2',
      name: 'Desk Lamp - LED with Touch Control',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
      price: 899,
      mrp: 2999,
      discount: 70,
      rating: 4.6,
      reviews: 892,
      endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      stockLeft: 15,
      viewing: 89
    },
    {
      id: 'drop-3',
      name: 'Gym Bag - Water Resistant Large',
      image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop',
      price: 1199,
      mrp: 3999,
      discount: 70,
      rating: 4.5,
      reviews: 678,
      endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      stockLeft: 31,
      viewing: 203
    },
    {
      id: 'drop-4',
      name: 'Coffee Mug Set - Ceramic 4 Pack',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
      price: 699,
      mrp: 1999,
      discount: 65,
      rating: 4.3,
      reviews: 1567,
      endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      stockLeft: 42,
      viewing: 167
    }
  ];

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setCurrentView('productDetail');
  };

  const handleLocationClick = () => {
    alert('Location picker would open here');
  };

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleLogin = () => {
    setCurrentView('home');
    setShowPopup(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <LoginSignup onClose={() => setCurrentView('home')} onLogin={handleLogin} />;
      case 'adminDashboard':
        return <AdminDashboard onClose={() => setCurrentView('home')} />;
      case 'rewards':
        return <RewardsSection onClose={() => setCurrentView('home')} />;
      case 'productDetail':
        return (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setCurrentView('home')}
            onAddToCart={() => alert('Added to cart!')}
            onBuyNow={() => setCurrentView('checkout')}
          />
        );
      case 'sellerOnboarding':
        return <SellerOnboarding onClose={() => setCurrentView('home')} />;
      case 'checkout':
        return <CheckoutSection onClose={() => setCurrentView('home')} />;
      default:
        return (
          <>
            <Header onLocationClick={handleLocationClick} onLoginClick={handleLoginClick} />
            <CategoryTabs />
            <HeroBanner />
            <CircularCategories />
            <ProductSection
              title="Best Deals"
              products={bestDeals}
              onProductClick={handleProductClick}
            />
            <ProductSection
              title="Nearby Stores - Fast Delivery 🚀"
              products={nearbyStores}
              onProductClick={handleProductClick}
            />
            <DropDeals deals={dropDeals} onProductClick={handleProductClick} />
            <ProductSection
              title="Trending Products"
              products={trendingProducts}
              onProductClick={handleProductClick}
            />
            <ShopYourVibe />
            <ProductSection
              title="Creator Picks ⭐"
              products={creatorPicks}
              onProductClick={handleProductClick}
            />
            <ProductSection
              title="Budget Store - Under ₹499"
              products={budgetStore}
              onProductClick={handleProductClick}
            />

            <div className="h-24" />

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
              <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-around">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-2"
                  onClick={() => setCurrentView('rewards')}
                >
                  <Gift className="w-5 h-5" />
                  <span className="text-xs">Rewards</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-2"
                  onClick={handleLocationClick}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs">Nearby</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-2"
                  onClick={() => setCurrentView('sellerOnboarding')}
                >
                  <Store className="w-5 h-5" />
                  <span className="text-xs">Sell</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-2"
                  onClick={() => setCurrentView('adminDashboard')}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-xs">Dashboard</span>
                </Button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {renderView()}
      {showPopup && <PopupModal type={showPopup} onClose={() => setShowPopup(null)} />}
    </div>
  );
}
