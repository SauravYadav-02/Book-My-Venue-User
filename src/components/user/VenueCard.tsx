import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const navigate = useNavigate();

  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      onClick={() => navigate('/discover')}
      className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative h-60 rounded-2xl overflow-hidden mb-4">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={image} 
          alt={name} 
          className="w-full h-full object-cover origin-center" 
        />
        <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold tracking-wider px-4 py-2 rounded-full uppercase hover:bg-white transition-colors">
          View
        </button>
        {/* Rating badge — bottom-right overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md">
          <Star size={13} fill="#f59e0b" className="text-amber-400" />
          <span className="text-xs font-bold text-gray-800">{rating}</span>
        </div>
      </div>
      <div className="px-2 pb-2">
        <div className="flex justify-between items-center mb-3">
          <span className="bg-brand-bg text-[10px] font-bold tracking-widest text-brand-light px-3 py-1 rounded-full uppercase">
            {type}
          </span>
          <span className="font-bold text-lg">{price}</span>
        </div>
        
        <h3 className="text-2xl font-serif text-brand-text mb-3">{name}</h3>
        
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin size={14} />
          <span>{location} • {capacity}</span>
        </div>
      </div>
    </motion.div>
  );
}
