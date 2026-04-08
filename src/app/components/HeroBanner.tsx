import { ImageWithFallback } from './figma/ImageWithFallback';

const banners = [
  {
    title: 'Summer Sale',
    subtitle: 'Up to 70% Off',
    gradient: 'from-blue-500 to-purple-600',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop'
  },
  {
    title: 'Electronics Fest',
    subtitle: 'Best Deals on Gadgets',
    gradient: 'from-indigo-500 to-pink-600',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop'
  }
];

export function HeroBanner() {
  return (
    <div className="bg-white px-4 py-4 max-w-[1400px] mx-auto">
      <div className="relative rounded-xl overflow-hidden h-[200px] md:h-[280px]">
        <ImageWithFallback
          src={banners[0].image}
          alt={banners[0].title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${banners[0].gradient} opacity-80`} />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white">
          <h2 className="text-3xl md:text-5xl mb-2">{banners[0].title}</h2>
          <p className="text-lg md:text-2xl mb-4">{banners[0].subtitle}</p>
          <button className="bg-white text-primary px-6 py-2.5 rounded-lg w-fit hover:bg-opacity-90 transition-colors">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}
