import type { DropDeal, HomeCollection, Product, VibeCard } from './types';

const now = Date.now();

export const defaultLocation = {
  city: 'Hyderabad',
  area: 'Hitech City',
  state: 'Telangana',
  pincode: '500081',
  mode: 'auto' as const,
};

export const topCategories = [
  { key: 'for-you', label: 'For You' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'mobiles', label: 'Mobiles' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'home', label: 'Home' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'hyperlocal', label: 'Hyperlocal' },
];

export const circleCategories = [
  {
    key: 'fashion',
    name: 'Fashion',
    badge: 'Popular',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=180&h=180&fit=crop',
  },
  {
    key: 'electronics',
    name: 'Electronics',
    badge: 'Trending',
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=180&h=180&fit=crop',
  },
  {
    key: 'home',
    name: 'Home',
    badge: 'Fast',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=180&h=180&fit=crop',
  },
  {
    key: 'beauty',
    name: 'Beauty',
    badge: 'New',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=180&h=180&fit=crop',
  },
  {
    key: 'grocery',
    name: 'Grocery',
    badge: '2 hrs',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=180&h=180&fit=crop',
  },
  {
    key: 'creator',
    name: 'Creator',
    badge: 'BYNDIO',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=180&h=180&fit=crop',
  },
  {
    key: 'budget',
    name: 'Budget',
    badge: 'Under 999',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=180&h=180&fit=crop',
  },
  {
    key: 'offers',
    name: 'Offers',
    badge: 'Auto on',
    image:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=180&h=180&fit=crop',
  },
];

export const locationSuggestions = [
  { city: 'Hyderabad', area: 'Hitech City', state: 'Telangana', pincode: '500081' },
  { city: 'Mumbai', area: 'Andheri East', state: 'Maharashtra', pincode: '400069' },
  { city: 'Bengaluru', area: 'Koramangala', state: 'Karnataka', pincode: '560034' },
  { city: 'Pune', area: 'Baner', state: 'Maharashtra', pincode: '411045' },
];

export const allProducts: Product[] = [
  {
    id: 'saree-soft-silk',
    name: 'Kashvi Vogue Saree',
    brand: 'Priyansh Creation',
    category: 'Fashion',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1610030469128-8c68de6454af?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1610030408612-f0d5b2eb4db1?w=900&h=900&fit=crop',
    ],
    price: 499,
    mrp: 999,
    discount: 50,
    rating: 4.1,
    reviews: 1245,
    localSeller: true,
    deliveryTime: 'Same day',
    stockLeft: 18,
    creator: 'Aarohi Styles',
    trusted: true,
    upiOffer: '5% instant UPI discount',
    affiliateRate: 'Affiliate 9.6% commission',
    sellerTag: '0% commission seller',
    viewersToday: 120,
    peopleViewing: 34,
    serviceZones: ['Hyderabad', 'Mumbai'],
    timerLabel: 'Deal ends in 01:20:15',
    videoLabel: '15 sec styling reel',
    colors: [
      { name: 'Berry Pink', swatch: '#be3e6d' },
      { name: 'Wine Gold', swatch: '#7d314d' },
      { name: 'Emerald', swatch: '#11705b' },
    ],
    highlights: [
      { label: 'Fabric', value: 'Soft silk blend' },
      { label: 'Length', value: '5.5m plus blouse' },
      { label: 'Occasion', value: 'Festive and casual' },
      { label: 'Wash care', value: 'Hand wash' },
    ],
    socialProof: ['Most loved in sarees', 'Top seller this week'],
    styledBy: [
      {
        name: 'Aarohi',
        look: 'Festive drape',
        image:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop',
      },
      {
        name: 'Niyati',
        look: 'Minimal styling',
        image:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'oversized-hoodie',
    name: 'Aesthetic Oversized Hoodie',
    brand: 'Byndio Street Lab',
    category: 'Fashion',
    image:
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=900&fit=crop',
    ],
    price: 1799,
    mrp: 3999,
    discount: 55,
    rating: 4.6,
    reviews: 892,
    localSeller: true,
    deliveryTime: '2 hrs',
    stockLeft: 10,
    creator: 'StreetwithRia',
    trusted: true,
    upiOffer: 'Flat Rs 75 on UPI',
    affiliateRate: 'Affiliate 8.4% commission',
    badge: 'New arrival',
    viewersToday: 164,
    peopleViewing: 28,
    serviceZones: ['Hyderabad', 'Bengaluru', 'Pune'],
    timerLabel: 'Drop in 02:12:09',
    videoLabel: 'Style reel preview',
    colors: [
      { name: 'Graphite', swatch: '#343a40' },
      { name: 'Cocoa', swatch: '#6f4e37' },
      { name: 'Cream', swatch: '#e3d5c5' },
    ],
    highlights: [
      { label: 'Fit', value: 'Oversized unisex fit' },
      { label: 'Fabric', value: '420 GSM brushed fleece' },
      { label: 'Vibe', value: 'Casual streetwear' },
      { label: 'Wash care', value: 'Machine wash cold' },
    ],
    socialProof: ['Creator approved', 'Selling fast'],
    styledBy: [
      {
        name: 'Ria',
        look: 'Airport look',
        image:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=240&h=240&fit=crop',
      },
      {
        name: 'Yash',
        look: 'Monochrome fit',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'wireless-earbuds',
    name: 'Wireless Earbuds with ANC',
    brand: 'Pulse Grid',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1580894908361-967195033215?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=900&h=900&fit=crop',
    ],
    price: 1299,
    mrp: 3999,
    discount: 67,
    rating: 4.5,
    reviews: 3421,
    sponsored: true,
    deliveryTime: '4 hrs',
    stockLeft: 23,
    creator: 'TechwithHarsh',
    trusted: true,
    upiOffer: 'No cost EMI on select cards',
    affiliateRate: 'Affiliate 10.2% commission',
    badge: 'Sponsored',
    viewersToday: 232,
    peopleViewing: 61,
    serviceZones: ['Hyderabad', 'Mumbai', 'Bengaluru'],
    timerLabel: 'Deal ends in 04:45:11',
    videoLabel: '30 sec sound test',
    colors: [
      { name: 'Midnight', swatch: '#171717' },
      { name: 'Ivory', swatch: '#efefea' },
      { name: 'Blue', swatch: '#2b6ee7' },
    ],
    highlights: [
      { label: 'Battery', value: '36 hours with case' },
      { label: 'Modes', value: 'ANC and transparency' },
      { label: 'Mic', value: 'ENC dual mic' },
      { label: 'Water proof', value: 'IPX5 splash resistant' },
    ],
    socialProof: ['Best seller this week', 'Trusted by 3000 plus buyers'],
    styledBy: [
      {
        name: 'Harsh',
        look: 'Work from anywhere setup',
        image:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop',
      },
      {
        name: 'Neha',
        look: 'Commute essentials',
        image:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'smart-watch',
    name: 'Smart Watch with Fitness Tracking',
    brand: 'Peak Motion',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?w=900&h=900&fit=crop',
    ],
    price: 2499,
    mrp: 5999,
    discount: 58,
    rating: 4.6,
    reviews: 2156,
    deliveryTime: '6 hrs',
    stockLeft: 15,
    creator: 'FitwithAvi',
    trusted: true,
    upiOffer: 'Get Rs 100 wallet cashback',
    affiliateRate: 'Affiliate 11.1% commission',
    badge: 'Top rated',
    viewersToday: 198,
    peopleViewing: 47,
    serviceZones: ['Mumbai', 'Pune', 'Bengaluru'],
    timerLabel: 'Limited deal for 03:08:21',
    videoLabel: '15 sec feature reel',
    colors: [
      { name: 'Black', swatch: '#000000' },
      { name: 'Rose Gold', swatch: '#d2877f' },
      { name: 'Teal', swatch: '#1f7a8c' },
    ],
    highlights: [
      { label: 'Display', value: '1.9 inch AMOLED' },
      { label: 'Tracking', value: '120 plus workout modes' },
      { label: 'Battery', value: '7 day battery life' },
      { label: 'Calling', value: 'Bluetooth calling' },
    ],
    socialProof: ['Top seller this week', 'Chosen by fitness creators'],
    styledBy: [
      {
        name: 'Avi',
        look: 'Morning run kit',
        image:
          'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=240&h=240&fit=crop',
      },
      {
        name: 'Mili',
        look: 'Office plus gym setup',
        image:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'vegan-laptop-sleeve',
    name: 'Laptop Sleeve in Vegan Leather',
    brand: 'Nomad Port',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=900&fit=crop',
    ],
    price: 899,
    mrp: 1999,
    discount: 55,
    rating: 4.4,
    reviews: 567,
    localSeller: true,
    deliveryTime: '3 hrs',
    stockLeft: 12,
    creator: 'DesksetupDaily',
    trusted: true,
    upiOffer: 'Flat Rs 50 on UPI',
    affiliateRate: 'Affiliate 7.8% commission',
    badge: 'Emerging brand',
    viewersToday: 88,
    peopleViewing: 21,
    serviceZones: ['Bengaluru', 'Hyderabad', 'Pune'],
    timerLabel: 'Ends in 02:41:33',
    videoLabel: 'Desk setup reel',
    colors: [
      { name: 'Tan', swatch: '#b07d4f' },
      { name: 'Olive', swatch: '#657153' },
      { name: 'Black', swatch: '#1d1d1f' },
    ],
    highlights: [
      { label: 'Material', value: 'Vegan leather exterior' },
      { label: 'Lining', value: 'Soft felt lining' },
      { label: 'Fit', value: 'Fits 13 to 14 inch laptops' },
      { label: 'Closure', value: 'Magnetic flap' },
    ],
    socialProof: ['Emerging brand', 'Creator desk pick'],
    styledBy: [
      {
        name: 'Ananya',
        look: 'Cafe workday kit',
        image:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop',
      },
      {
        name: 'Kabir',
        look: 'Minimal tech carry',
        image:
          'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'portable-speaker',
    name: 'Portable Waterproof Speaker',
    brand: 'Echo Dock',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&h=900&fit=crop',
    ],
    price: 1599,
    mrp: 3999,
    discount: 60,
    rating: 4.5,
    reviews: 1678,
    deliveryTime: '5 hrs',
    stockLeft: 19,
    creator: 'BassReviewLab',
    trusted: true,
    upiOffer: 'Extra Rs 125 on first order',
    affiliateRate: 'Affiliate 9.2% commission',
    badge: 'Picked by creators',
    viewersToday: 143,
    peopleViewing: 39,
    serviceZones: ['Mumbai', 'Hyderabad', 'Pune'],
    timerLabel: 'Drop deal live now',
    videoLabel: 'Audio demo clip',
    colors: [
      { name: 'Slate', swatch: '#484d56' },
      { name: 'Coral', swatch: '#e76f51' },
      { name: 'Navy', swatch: '#23395d' },
    ],
    highlights: [
      { label: 'Battery', value: '12 hours playback' },
      { label: 'Build', value: 'IP67 dust and water resistant' },
      { label: 'Audio', value: '360 degree stereo sound' },
      { label: 'Pairing', value: 'Bluetooth 5.3' },
    ],
    socialProof: ['Picked by creators', 'Weekend party favorite'],
    styledBy: [
      {
        name: 'Ishaan',
        look: 'Weekend road trip',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop',
      },
      {
        name: 'Riddhi',
        look: 'Balcony chill setup',
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'wireless-mouse',
    name: 'Wireless Mouse with Silent Clicks',
    brand: 'ByteFlow',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=900&h=900&fit=crop',
    ],
    price: 599,
    mrp: 1999,
    discount: 70,
    rating: 4.4,
    reviews: 1234,
    localSeller: true,
    deliveryTime: '2 hrs',
    stockLeft: 23,
    creator: 'DesksetupDaily',
    trusted: true,
    upiOffer: 'Get Rs 40 off with UPI',
    affiliateRate: 'Affiliate 8.8% commission',
    badge: 'Drop deal',
    viewersToday: 154,
    peopleViewing: 145,
    serviceZones: ['Hyderabad', 'Mumbai', 'Bengaluru'],
    timerLabel: 'Drop live',
    videoLabel: 'Quick unboxing',
    colors: [
      { name: 'Black', swatch: '#111827' },
      { name: 'Blue', swatch: '#1d4ed8' },
      { name: 'White', swatch: '#f8fafc' },
    ],
    highlights: [
      { label: 'Click', value: 'Silent click buttons' },
      { label: 'Battery', value: '18 month battery life' },
      { label: 'Grip', value: 'Ergonomic palm support' },
      { label: 'Mode', value: 'Dual device switch' },
    ],
    socialProof: ['Fast moving office essential', 'Only 23 left'],
    styledBy: [
      {
        name: 'Ananya',
        look: 'Work desk stack',
        image:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop',
      },
      {
        name: 'Kabir',
        look: 'Gaming and work setup',
        image:
          'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'desk-lamp',
    name: 'Desk Lamp with Touch Control',
    brand: 'Halo Home',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&h=900&fit=crop',
    ],
    price: 899,
    mrp: 2999,
    discount: 70,
    rating: 4.6,
    reviews: 892,
    localSeller: true,
    deliveryTime: '2 hrs',
    stockLeft: 15,
    creator: 'HomewithIra',
    trusted: true,
    upiOffer: 'Flat Rs 60 with UPI',
    affiliateRate: 'Affiliate 8.5% commission',
    badge: 'Drop deal',
    viewersToday: 97,
    peopleViewing: 89,
    serviceZones: ['Hyderabad', 'Pune', 'Mumbai'],
    timerLabel: 'Deal live now',
    videoLabel: 'Before and after lighting',
    colors: [
      { name: 'Warm White', swatch: '#fff4d2' },
      { name: 'Charcoal', swatch: '#374151' },
      { name: 'Olive', swatch: '#66785f' },
    ],
    highlights: [
      { label: 'Lighting', value: '3 color temperatures' },
      { label: 'Control', value: 'Touch slider dimming' },
      { label: 'Power', value: 'USB C powered' },
      { label: 'Use case', value: 'Desk and bedside' },
    ],
    socialProof: ['Top home deal', 'Fast moving item'],
    styledBy: [
      {
        name: 'Ira',
        look: 'Study desk setup',
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop',
      },
      {
        name: 'Naman',
        look: 'Night reading corner',
        image:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'gym-bag',
    name: 'Gym Bag with Wet Pocket',
    brand: 'LiftLab',
    category: 'Sports',
    image:
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&h=900&fit=crop',
    ],
    price: 1199,
    mrp: 3999,
    discount: 70,
    rating: 4.5,
    reviews: 678,
    deliveryTime: '1 day',
    stockLeft: 31,
    creator: 'FitwithAvi',
    trusted: true,
    upiOffer: 'Extra 10% on first fitness order',
    affiliateRate: 'Affiliate 9.9% commission',
    badge: 'Creator pick',
    viewersToday: 111,
    peopleViewing: 203,
    serviceZones: ['Bengaluru', 'Pune', 'Mumbai'],
    timerLabel: 'Drop live',
    videoLabel: 'Packing demo reel',
    colors: [
      { name: 'Black', swatch: '#0f172a' },
      { name: 'Navy', swatch: '#1e3a8a' },
      { name: 'Olive', swatch: '#556b2f' },
    ],
    highlights: [
      { label: 'Storage', value: 'Separate shoe and wet pocket' },
      { label: 'Material', value: 'Water resistant shell' },
      { label: 'Capacity', value: '38 liter capacity' },
      { label: 'Carry', value: 'Cross body and hand carry' },
    ],
    socialProof: ['Picked by creators', 'People buying now'],
    styledBy: [
      {
        name: 'Avi',
        look: 'Morning workout bag',
        image:
          'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=240&h=240&fit=crop',
      },
      {
        name: 'Rhea',
        look: 'Weekend sports pack',
        image:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'ceramic-mug-set',
    name: 'Ceramic Mug Set of 4',
    brand: 'Clayloom',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=900&fit=crop',
    ],
    price: 699,
    mrp: 1999,
    discount: 65,
    rating: 4.3,
    reviews: 1567,
    localSeller: true,
    deliveryTime: 'Same day',
    stockLeft: 42,
    creator: 'HomewithIra',
    trusted: true,
    upiOffer: 'Buy with UPI and save Rs 30',
    affiliateRate: 'Affiliate 7.5% commission',
    badge: 'Budget home',
    viewersToday: 68,
    peopleViewing: 167,
    serviceZones: ['Hyderabad', 'Mumbai'],
    timerLabel: 'Deal ends tonight',
    videoLabel: 'Table styling reel',
    colors: [
      { name: 'Sand', swatch: '#d5bdaf' },
      { name: 'Olive', swatch: '#9c6644' },
      { name: 'Ivory', swatch: '#f5ebe0' },
    ],
    highlights: [
      { label: 'Pieces', value: '4 ceramic mugs' },
      { label: 'Finish', value: 'Matte glazed finish' },
      { label: 'Use', value: 'Microwave safe' },
      { label: 'Care', value: 'Dishwasher safe' },
    ],
    socialProof: ['Budget find', 'Local fast delivery'],
    styledBy: [
      {
        name: 'Ira',
        look: 'Sunday brunch table',
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop',
      },
      {
        name: 'Dev',
        look: 'Coffee station shelf',
        image:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop',
      },
    ],
  },
  {
    id: 'pantry-hamper',
    name: 'Healthy Pantry Essentials Hamper',
    brand: 'Daily Basket',
    category: 'Grocery',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&h=700&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=900&h=900&fit=crop',
    ],
    price: 899,
    mrp: 1599,
    discount: 44,
    rating: 4.2,
    reviews: 433,
    localSeller: true,
    deliveryTime: '2 hrs',
    stockLeft: 27,
    creator: 'EverydayWellness',
    trusted: true,
    upiOffer: 'Rs 50 off on grocery UPI order',
    affiliateRate: 'Affiliate 6.5% commission',
    badge: 'Hyperlocal',
    sellerTag: 'Fast local delivery',
    viewersToday: 74,
    peopleViewing: 18,
    serviceZones: ['Hyderabad', 'Bengaluru'],
    timerLabel: 'Fresh stock today',
    videoLabel: 'What is inside',
    colors: [
      { name: 'Classic', swatch: '#f6bd60' },
      { name: 'Green', swatch: '#84a98c' },
      { name: 'Brown', swatch: '#99582a' },
    ],
    highlights: [
      { label: 'Includes', value: 'Snacks, cereals and nuts' },
      { label: 'Delivery', value: 'Hyperlocal within 2 hours' },
      { label: 'Shelf life', value: '30 to 90 days' },
      { label: 'Packaging', value: 'Gift ready box' },
    ],
    socialProof: ['Hyperlocal category', 'Quick repeat order favorite'],
    styledBy: [
      {
        name: 'Neha',
        look: 'Office snack drawer',
        image:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=240&h=240&fit=crop',
      },
      {
        name: 'Vani',
        look: 'Healthy pantry reset',
        image:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop',
      },
    ],
  },
];

const byId = Object.fromEntries(allProducts.map((product) => [product.id, product]));

export const homeCollections: HomeCollection[] = [
  {
    key: 'best-deals',
    title: 'Best Deals',
    subtitle: 'High converting deals with strong discount callouts.',
    pill: 'Trending Tuesday',
    products: [byId['wireless-earbuds'], byId['saree-soft-silk'], byId['smart-watch'], byId['portable-speaker']],
  },
  {
    key: 'nearby-stores',
    title: 'Local Nearby Stores',
    subtitle: 'Hyperlocal delivery from trusted sellers around the current pincode.',
    pill: '2 hrs delivery',
    products: [byId['saree-soft-silk'], byId['wireless-mouse'], byId['desk-lamp'], byId['pantry-hamper']],
  },
  {
    key: 'trending-products',
    title: 'Trending Products',
    subtitle: 'Products users are discovering the most today.',
    pill: 'Hot right now',
    products: [byId['wireless-earbuds'], byId['oversized-hoodie'], byId['smart-watch'], byId['ceramic-mug-set']],
  },
  {
    key: 'new-arrivals',
    title: 'New Arrivals',
    subtitle: 'Fresh styles and launches from nearby and emerging sellers.',
    pill: 'New',
    products: [byId['oversized-hoodie'], byId['vegan-laptop-sleeve'], byId['pantry-hamper'], byId['portable-speaker']],
  },
  {
    key: 'best-sellers',
    title: 'Best Sellers',
    subtitle: 'Reliable products with strong ratings and repeat orders.',
    pill: 'Top rated',
    products: [byId['smart-watch'], byId['wireless-earbuds'], byId['saree-soft-silk'], byId['desk-lamp']],
  },
  {
    key: 'creator-picks',
    title: 'Creator Picks',
    subtitle: 'Influencer and creator curated products unique to BYNDIO.',
    pill: 'BYNDIO USP',
    products: [byId['oversized-hoodie'], byId['portable-speaker'], byId['gym-bag'], byId['vegan-laptop-sleeve']],
  },
  {
    key: 'emerging-brands',
    title: 'Emerging Brands',
    subtitle: 'Smaller brands with clear storytelling and sharp conversion angles.',
    pill: 'Emerging',
    products: [byId['vegan-laptop-sleeve'], byId['portable-speaker'], byId['ceramic-mug-set'], byId['pantry-hamper']],
  },
  {
    key: 'budget-store',
    title: 'Budget Store',
    subtitle: 'Affordable picks that keep the cart moving.',
    pill: 'Under Rs 999',
    products: [byId['wireless-mouse'], byId['ceramic-mug-set'], byId['vegan-laptop-sleeve'], byId['saree-soft-silk']],
  },
];

export const dropDeals: DropDeal[] = [
  { ...byId['wireless-mouse'], endsAt: new Date(now + 2 * 60 * 60 * 1000) },
  { ...byId['desk-lamp'], endsAt: new Date(now + 95 * 60 * 1000) },
  { ...byId['gym-bag'], endsAt: new Date(now + 3 * 60 * 60 * 1000) },
  { ...byId['ceramic-mug-set'], endsAt: new Date(now + 80 * 60 * 1000) },
];

export const vibeCards: VibeCard[] = [
  {
    id: 'everyday',
    title: 'Everyday Essentials',
    subtitle: 'Simple. Clean. Daily wear.',
    tagline: 'Basics, workday picks and repeat buys.',
    image:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&h=800&fit=crop',
    gradient: 'from-slate-900/20 via-slate-900/20 to-slate-950/70',
    filterKey: 'new',
  },
  {
    id: 'party',
    title: 'Party and Glam',
    subtitle: 'Stand out. Go bold.',
    tagline: 'Dressy picks, statement colors and creator looks.',
    image:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&h=800&fit=crop',
    gradient: 'from-fuchsia-900/30 via-rose-900/20 to-rose-950/70',
    filterKey: 'trending',
  },
  {
    id: 'creator',
    title: 'Creator Picks',
    subtitle: 'Trending on BYNDIO.',
    tagline: 'Products styled and explained by creators.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=800&fit=crop',
    gradient: 'from-amber-900/30 via-orange-900/20 to-orange-950/70',
    filterKey: 'topRated',
  },
  {
    id: 'budget',
    title: 'Budget Finds',
    subtitle: 'Under Rs 999.',
    tagline: 'Conversion driven value picks for quick checkout.',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=800&fit=crop',
    gradient: 'from-emerald-900/30 via-emerald-900/10 to-emerald-950/70',
    filterKey: 'under999',
  },
  {
    id: 'festive',
    title: 'Festive Ready',
    subtitle: 'Celebrate in style.',
    tagline: 'Occasionwear, gifting and premium local delivery picks.',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=800&fit=crop',
    gradient: 'from-red-900/30 via-rose-900/20 to-red-950/70',
    filterKey: 'trending',
  },
];

export const popupContent = {
  signup: {
    title: 'Start earning while you shop',
    subtitle: '+50 points on signup and rewards on your first order.',
    body: 'Create an account to unlock rewards, hyperlocal deals and referral points.',
    cta: 'Create account and earn',
    secondary: 'Login instead',
    gradient: 'from-primary to-blue-700',
  },
  referral: {
    title: 'Invite friends. Earn more points.',
    subtitle: 'Share your referral code on WhatsApp and unlock +50 points each.',
    body: 'Referral points are added instantly after signup, with a bonus after the first order.',
    cta: 'Share and earn 50 points',
    secondary: 'Maybe later',
    gradient: 'from-fuchsia-600 to-rose-600',
  },
  exitIntent: {
    title: 'Wait. Do not miss your rewards.',
    subtitle: 'You already have points and local deals in this pincode.',
    body: 'Continue to checkout to save with rewards before the deal expires.',
    cta: 'Continue and save',
    secondary: 'Close',
    gradient: 'from-amber-500 to-orange-600',
  },
  firstPurchase: {
    title: 'Complete your first order and earn bonus points',
    subtitle: 'Get an extra 20 points on your first successful purchase.',
    body: 'Use creator picks, drop deals or local nearby stores to finish your first order.',
    cta: 'Shop now',
    secondary: 'View rewards',
    gradient: 'from-violet-600 to-indigo-700',
  },
  returning: {
    title: 'You have points waiting',
    subtitle: 'Return to checkout and use your reward balance now.',
    body: 'Your last visit unlocked rewards, creator picks and location based offers.',
    cta: 'Use points now',
    secondary: 'Browse first',
    gradient: 'from-emerald-600 to-teal-700',
  },
  referralSuccess: {
    title: 'You earned 50 points',
    subtitle: 'A friend joined with your referral link.',
    body: 'Keep the momentum going by sharing again and using points at checkout.',
    cta: 'Invite more friends',
    secondary: 'Open wallet',
    gradient: 'from-sky-600 to-primary',
  },
};

export function getProductsForCategory(categoryKey: string) {
  switch (categoryKey) {
    case 'fashion':
      return allProducts.filter((product) => product.category === 'Fashion');
    case 'mobiles':
      return allProducts.filter((product) =>
        ['Wireless Earbuds with ANC', 'Smart Watch with Fitness Tracking'].includes(product.name),
      );
    case 'beauty':
      return [byId['saree-soft-silk'], byId['oversized-hoodie']];
    case 'electronics':
      return allProducts.filter((product) => product.category === 'Electronics');
    case 'home':
      return allProducts.filter((product) => product.category === 'Home');
    case 'grocery':
      return allProducts.filter((product) => product.category === 'Grocery');
    case 'creator':
      return homeCollections.find((collection) => collection.key === 'creator-picks')?.products || [];
    case 'budget':
      return allProducts.filter((product) => product.price <= 999);
    case 'offers':
      return allProducts.filter((product) => product.discount >= 55);
    case 'hyperlocal':
      return allProducts.filter((product) => product.localSeller);
    case 'for-you':
    default:
      return homeCollections[0].products;
  }
}
