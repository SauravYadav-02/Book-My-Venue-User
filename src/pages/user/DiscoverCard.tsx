import { memo } from "react";
import { MapPin, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { currencyFormatter } from "../../utils/currency";
import WishlistButton from "../../components/user/WishlistButton";
import { motion } from "framer-motion";

interface DiscoverCardProps {
    venueId: string;
    image: string;
    title: string;
    location: string;
    price: number;
    capacity: number;
    type?: string;
    venueTypes?: string[];
    eventsSupported?: string[];
    rating?: number;
    isSubscriptionActive?: boolean;
}

// memo() prevents re-render when parent state changes but props are identical
const DiscoverCard = memo(function DiscoverCard({
    venueId,
    image,
    title,
    location,
    price,
    capacity,
    type,
    venueTypes,
    eventsSupported,
    rating = 0,
    isSubscriptionActive = true,
}: DiscoverCardProps) {
    const navigate = useNavigate();

    return (
        <motion.div
            // No `initial` — avoids the opacity:0 flash on every re-mount during refetch
            whileHover={isSubscriptionActive ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400 flex flex-col ${
                !isSubscriptionActive ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
            style={{ borderRadius: "1.5rem" }}
            onClick={() => isSubscriptionActive && navigate(`/venue/${venueId}`)}
        >
            {/* ── Image Container ─────────────────────────────── */}
            <div
                className={`relative overflow-hidden m-3 flex-shrink-0 ${!isSubscriptionActive ? "grayscale" : ""}`}
                style={{ borderRadius: "1.2rem", aspectRatio: "4/3" }}
            >
                {/* Plain img + CSS transition: no framer-motion conflict */}
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {!isSubscriptionActive && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                        <span className="bg-white/90 text-red-600 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg text-center">
                            Venue is not available for booking yet.
                        </span>
                    </div>
                )}

                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                {/* Type tag — top left */}
                {venueTypes && venueTypes.length > 0 ? (
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 max-w-[70%]">
                        {venueTypes.slice(0, 2).map((t) => (
                            <span key={t} className="bg-emerald-500 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                                {t}
                            </span>
                        ))}
                    </div>
                ) : type ? (
                    <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm text-[#2d2d2d] text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                        {type}
                    </span>
                ) : null}

                {/* Wishlist button — top right */}
                <div className="absolute top-3 right-3 z-10">
                    <WishlistButton venueId={venueId} />
                </div>

                {/* Rating badge — bottom right */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white shadow-md px-2.5 py-1 rounded-full">
                    {rating > 0 ? (
                        <>
                            <Star size={13} fill="#f59e0b" className="text-amber-400" />
                            <span className="text-xs font-bold text-[#2d2d2d]">{rating.toFixed(1)}</span>
                        </>
                    ) : (
                        <span className="text-[10px] font-bold text-[#5C614D] uppercase tracking-wide">New</span>
                    )}
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────── */}
            <div className={`px-4 pb-4 flex flex-col gap-3 flex-1 ${!isSubscriptionActive ? "opacity-50" : ""}`}>

                {/* Name + Location */}
                <div>
                    <h3 className={`text-lg font-bold text-[#2d2d2d] leading-snug line-clamp-1 transition-colors duration-300 ${isSubscriptionActive ? "group-hover:text-[#5C614D]" : ""}`}>
                        {title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <MapPin size={13} className="shrink-0 text-[#8A8F78]" />
                        <span className="truncate">{location}</span>
                    </div>

                    {/* Supported Events chips */}
                    {eventsSupported && eventsSupported.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {eventsSupported.slice(0, 3).map((ev) => (
                                <span key={ev} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                    {ev}
                                </span>
                            ))}
                            {eventsSupported.length > 3 && (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                    +{eventsSupported.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Capacity + Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                        <Users size={15} className="text-[#8A8F78]" />
                        <span>Up to {capacity}</span>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-[#2d2d2d] font-bold text-base">
                            {currencyFormatter.format(price)}
                        </span>
                        <span className="text-gray-400 text-xs font-medium">/day</span>
                    </div>
                </div>

                {/* Book Now button */}
                <motion.button
                    whileTap={isSubscriptionActive ? { scale: 0.95 } : {}}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isSubscriptionActive) {
                            navigate(`/venue/${venueId}`);
                        }
                    }}
                    disabled={!isSubscriptionActive}
                    className={`w-full text-sm font-semibold py-3 rounded-xl transition-all duration-300 transform tracking-wide ${
                        isSubscriptionActive 
                        ? "bg-[#5C614D] hover:bg-[#4C5040] text-white hover:shadow-md hover:shadow-[#5C614D]/30 hover:-translate-y-0.5"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    {isSubscriptionActive ? "Book Now" : "Currently Unavailable"}
                </motion.button>
            </div>
        </motion.div>
    );
});

export default DiscoverCard;