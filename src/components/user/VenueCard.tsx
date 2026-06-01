import { memo, useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface VenueCardProps {
  venueId: string;
  image: string;
  type: string;
  venueTypes?: string[];
  eventsSupported?: string[];
  price: string;
  name: string;
  location: string;
  capacity: string;
  rating: string;
  amenities?: string[];
  isNew?: boolean;
}

// memo() prevents re-render when parent re-renders but props haven't changed
const VenueCard = memo(function VenueCard({
  venueId,
  image,
  type,
  venueTypes,
  price,
  name,
  location,
  capacity,
  rating,
  amenities,
  isNew
}: VenueCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Safely parse amenities if they are stringified JSON
  let parsedAmenities: string[] = [];
  if (amenities && amenities.length > 0) {
    if (amenities.length === 1 && typeof amenities[0] === 'string' && amenities[0].startsWith('[')) {
      try {
        parsedAmenities = JSON.parse(amenities[0]);
      } catch {
        parsedAmenities = [amenities[0]];
      }
    } else {
      parsedAmenities = amenities;
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/venue/${venueId}`)}
      className="h-full"
    >
      <motion.div
        // No `initial` — avoids the opacity:0 flash on every re-render/re-mount
        animate={isHovered ? { y: -5 } : { y: 0 }}
        transition={{ duration: 0.2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full"
      >
      <div className="relative h-60 rounded-2xl overflow-hidden mb-4 bg-gray-100">
        {isNew && (
          <span className="absolute top-4 left-4 z-10 bg-amber-400 text-stone-900 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm animate-pulse">
            New
          </span>
        )}
        {/* Plain <img> — no framer-motion wrapper avoids animation conflicts */}
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover origin-center transition-transform duration-500 hover:scale-105"
        />
        <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold tracking-wider px-4 py-2 rounded-full uppercase hover:bg-white transition-colors">
          View
        </button>
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md">
          <Star size={13} fill="#f59e0b" className="text-amber-400" />
          <span className="text-xs font-bold text-gray-800">{rating}</span>
        </div>
      </div>

      <div className="px-2 pb-2">
        <div className="flex justify-between items-center mb-3">
          <span className="bg-brand-bg text-[10px] font-bold tracking-widest text-brand-light px-3 py-1 rounded-full uppercase">
            {venueTypes && venueTypes.length > 0 ? venueTypes[0] : type}
          </span>
          <span className="font-bold text-lg">{price}</span>
        </div>

        <h3 className="text-2xl font-serif text-brand-text mb-3">{name}</h3>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin size={14} />
          <span>{location} • {capacity}</span>
        </div>

        {parsedAmenities.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-100">
            {parsedAmenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="bg-white border border-gray-200 shadow-sm text-gray-800 text-[10px] px-2 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5C614D]"></div>
                <span className="truncate" title={amenity}>{amenity}</span>
              </div>
            ))}
            {parsedAmenities.length > 4 && (
              <div className="bg-gray-50 border border-gray-100 text-gray-500 text-[10px] px-2 py-1.5 rounded-full font-medium flex items-center justify-center">
                +{parsedAmenities.length - 4} more
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
    </div>
  );
});

export default VenueCard;
