
import { Star, MapPin } from 'lucide-react';

interface VenueCardProps {
  image: string;
  type: string;
  price: string;
  name: string;
  location: string;
  capacity: string;
  rating: string;
}

export default function VenueCard({
  image,
  type,
  price,
  name,
  location,
  capacity,
  rating
}: VenueCardProps) {
  return (
    <div className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-60 rounded-2xl overflow-hidden mb-4">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold tracking-wider px-4 py-2 rounded-full uppercase hover:bg-white transition-colors">
          View
        </button>
      </div>
      <div className="px-2 pb-2">
        <div className="flex justify-between items-center mb-3">
          <span className="bg-brand-bg text-[10px] font-bold tracking-widest text-brand-light px-3 py-1 rounded-full uppercase">
            {type}
          </span>
          <span className="font-bold text-lg">{price}</span>
        </div>
        
        <h3 className="text-2xl font-serif text-brand-text mb-3">{name}</h3>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>{location} • {capacity}</span>
          </div>
          <div className="flex items-center gap-1 text-orange-400 font-medium">
            <Star size={14} fill="currentColor" />
            <span className="text-brand-text">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
