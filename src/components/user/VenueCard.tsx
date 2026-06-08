import { memo, useState } from 'react';
import { Star, MapPin, X, AlertTriangle } from 'lucide-react';
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
  isSubscriptionActive?: boolean;
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
  isNew,
  isSubscriptionActive = true
}: VenueCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

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
      onMouseEnter={() => isSubscriptionActive && setIsHovered(true)}
      onMouseLeave={() => isSubscriptionActive && setIsHovered(false)}
      onClick={() => {
        if (isSubscriptionActive) {
          navigate(`/venue/${venueId}`);
        } else {
          setShowUnavailableModal(true);
        }
      }}
      className="h-full relative"
    >
      <motion.div
        // No `initial` — avoids the opacity:0 flash on every re-render/re-mount
        animate={isHovered ? { y: -5 } : { y: 0 }}
        transition={{ duration: 0.2 }}
        whileTap={isSubscriptionActive ? { scale: 0.98 } : {}}
        className={`bg-white rounded-3xl p-3 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col ${
          !isSubscriptionActive ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className={`relative h-60 rounded-2xl overflow-hidden mb-4 bg-gray-100 flex-shrink-0 ${!isSubscriptionActive ? "grayscale" : ""}`}>
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

          {!isSubscriptionActive && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-10">
              <span className="bg-white/90 text-red-600 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg text-center">
                Venue is not Available currently.
              </span>
            </div>
          )}

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (isSubscriptionActive) {
                navigate(`/venue/${venueId}`);
              } else {
                setShowUnavailableModal(true);
              }
            }}
            className={`absolute bottom-4 right-4 backdrop-blur-sm text-xs font-bold tracking-wider px-4 py-2 rounded-full uppercase transition-colors z-10 ${
              isSubscriptionActive 
              ? "bg-white/90 hover:bg-white text-gray-800 hover:shadow-sm" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubscriptionActive ? "View" : "Unavailable"}
          </button>
          
          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md z-10">
            <Star size={13} fill="#f59e0b" className="text-amber-400" />
            <span className="text-xs font-bold text-gray-800">{rating}</span>
          </div>
        </div>

        <div className="px-2 pb-2 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-3">
            <span className="bg-brand-bg text-[10px] font-bold tracking-widest text-brand-light px-3 py-1 rounded-full uppercase">
              {venueTypes && venueTypes.length > 0 ? venueTypes[0] : type}
            </span>
            <span className="font-bold text-lg">{price}</span>
          </div>

          <h3 className="text-2xl font-serif text-brand-text mb-3 leading-snug">{name}</h3>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3 mt-auto">
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

      {/* Modal Dialog */}
      {showUnavailableModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px]" 
          onClick={(e) => { 
            e.stopPropagation(); 
            setShowUnavailableModal(false); 
          }}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center relative font-sans"
          >
            <button 
              onClick={() => setShowUnavailableModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-600">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Venue Unavailable</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Venue is not Available currently.
            </p>
            
            <button
              onClick={() => setShowUnavailableModal(false)}
              className="w-full bg-[#5C614D] hover:bg-[#4C5040] text-white py-3 rounded-xl font-semibold transition-colors duration-300 shadow-md shadow-[#5C614D]/20 cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
});

export default VenueCard;
