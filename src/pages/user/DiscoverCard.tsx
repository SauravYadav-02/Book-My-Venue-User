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
    rating = 0,
}: DiscoverCardProps) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400 cursor-pointer flex flex-col"
            style={{ borderRadius: "1.5rem" }}
            onClick={() => navigate(`/venue/${venueId}`)}
        >
            {/* ── Image Container ─────────────────────────────── */}
            <div
                className="relative overflow-hidden m-3 flex-shrink-0"
                style={{ borderRadius: "1.2rem", aspectRatio: "4/3" }}
            >
                <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
                />

                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                {/* Type tag — top left */}
                {type && (
                    <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm text-[#2d2d2d] text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                        {type}
                    </span>
                )}

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
            <div className="px-4 pb-4 flex flex-col gap-3 flex-1">

                {/* Name + Location */}
                <div>
                    <h3 className="text-lg font-bold text-[#2d2d2d] leading-snug line-clamp-1 group-hover:text-[#5C614D] transition-colors duration-300">
                        {title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <MapPin size={13} className="shrink-0 text-[#8A8F78]" />
                        <span className="truncate">{location}</span>
                    </div>
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
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/venue/${venueId}`);
                    }}
                    className="w-full bg-[#5C614D] hover:bg-[#4C5040] text-white text-sm font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-[#5C614D]/30 hover:-translate-y-0.5 transform tracking-wide"
                >
                    Book Now
                </motion.button>
            </div>
        </motion.div>
    );
}