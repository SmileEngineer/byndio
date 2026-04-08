export type View =
  | 'home'
  | 'listing'
  | 'rewards'
  | 'productDetail'
  | 'sellerOnboarding'
  | 'checkout'
  | 'login'
  | 'sellerDashboard';

export type PopupType =
  | 'signup'
  | 'referral'
  | 'exitIntent'
  | 'firstPurchase'
  | 'returning'
  | 'referralSuccess';

export interface LocationInfo {
  city: string;
  area: string;
  state: string;
  pincode: string;
  mode: 'auto' | 'manual';
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface ProductColor {
  name: string;
  swatch: string;
}

export interface CreatorLook {
  name: string;
  look: string;
  image: string;
}

export interface ProductHighlight {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  images: string[];
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
  trusted?: boolean;
  upiOffer?: string;
  affiliateRate?: string;
  badge?: string;
  sellerTag?: string;
  viewersToday?: number;
  peopleViewing?: number;
  serviceZones?: string[];
  timerLabel?: string;
  videoLabel?: string;
  colors: ProductColor[];
  highlights: ProductHighlight[];
  socialProof: string[];
  styledBy: CreatorLook[];
}

export interface HomeCollection {
  key: string;
  title: string;
  subtitle: string;
  products: Product[];
  pill?: string;
}

export interface DropDeal extends Product {
  endsAt: Date;
}

export interface VibeCard {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  gradient: string;
  filterKey: 'trending' | 'under999' | 'new' | 'topRated';
}
