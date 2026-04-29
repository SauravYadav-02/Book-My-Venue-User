import { MapPin, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { currencyFormatter } from "../../utils/currency";

interface DiscoverCardProps {
    venueId: string;
    image: string;
    title: string;
    location: string;
    price: number;
    capacity: number;
    type?: string;
    rating?: number;
}

export default function DiscoverCard({
    venueId,
    image,
    title,
    location,
    price,
    capacity,
    type,
    rating = 4.8,
}: DiscoverCardProps) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/venue/${venueId}`)}
            className="group relative bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden m-3 rounded-[1.5rem]">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                    {type && (
                        <span className="bg-white/90 backdrop-blur-md text-[#2d2d2d] text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                            {type}
                        </span>
                    )}
                </div>

                <div className="absolute top-4 right-4 z-10">
                    <span className="bg-white/90 backdrop-blur-md text-[#2d2d2d] font-bold text-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {rating}
                    </span>
                </div>

                {/* View Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                    <div className="bg-white/95 backdrop-blur-sm text-[#2d2d2d] text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-full shadow-xl transition-transform duration-500 transform translate-y-4 group-hover:translate-y-0 hover:bg-[#5C614D] hover:text-white">
                        Explore Space
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                        <h3 className="text-xl font-serif text-[#2d2d2d] mb-2 line-clamp-1 group-hover:text-[#5C614D] transition-colors duration-300">
                            {title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <MapPin size={14} className="shrink-0 text-[#8A8F78]" />
                            <span className="truncate">{location}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Users size={16} className="text-[#8A8F78]" />
                        <span>Up to {capacity}</span>
                    </div>
                    <div className="text-right flex items-baseline gap-1">
                        <span className="text-[#2d2d2d] font-serif font-bold text-xl">{currencyFormatter.format(price)}</span>
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">/day</span>
                    </div>
                </div>
            </div>
        </div>
    );
}