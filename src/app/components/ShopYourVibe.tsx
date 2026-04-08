import { ImageWithFallback } from './figma/ImageWithFallback';

const vibes = [
  {
    title: 'Everyday Essentials',
    subtitle: 'Comfort meets style',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop',
    gradient: 'from-blue-600/60 to-purple-600/60'
  },
  {
    title: 'Party & Glam',
    subtitle: 'Stand out tonight',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=400&fit=crop',
    gradient: 'from-pink-600/60 to-rose-600/60'
  },
  {
    title: 'Creator Picks',
    subtitle: 'Trending with influencers',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop',
    gradient: 'from-amber-600/60 to-orange-600/60'
  },
  {
    title: 'Budget Finds',
    subtitle: 'Style under ₹999',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
    gradient: 'from-green-600/60 to-teal-600/60'
  },
  {
    title: 'Festive Ready',
    subtitle: 'Celebrate in style',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=400&fit=crop',
    gradient: 'from-red-600/60 to-pink-600/60'
  }
];

export function ShopYourVibe() {
  return (
    <section className="bg-white py-8 max-w-[1400px] mx-auto">
      <div className="px-4">
        <div className="mb-6">
          <h2 className="text-2xl mb-2">Shop Your Vibe ✨</h2>
          <p className="text-sm text-muted-foreground">Discover curated collections that match your lifestyle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-1 lg:row-span-2">
            <button className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden group">
              <ImageWithFallback
                src={vibes[0].image}
                alt={vibes[0].title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${vibes[0].gradient}`} />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl mb-1">{vibes[0].title}</h3>
                <p className="text-sm opacity-90">{vibes[0].subtitle}</p>
              </div>
            </button>
          </div>

          {vibes.slice(1).map((vibe, idx) => (
            <button
              key={idx}
              className="relative w-full h-[200px] rounded-xl overflow-hidden group"
            >
              <ImageWithFallback
                src={vibe.image}
                alt={vibe.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${vibe.gradient}`} />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h4 className="mb-1">{vibe.title}</h4>
                <p className="text-xs opacity-90">{vibe.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
