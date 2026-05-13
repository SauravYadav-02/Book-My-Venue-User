import { motion } from "framer-motion";
import { ChevronDown, Filter } from "lucide-react";
import { useVenues } from "../../../store/Usevenues";
import { getVenueImage } from "../../../services/VenueUserservice ";
import VenueCard from "../../../components/user/VenueCard";

export default function CurationSection() {
    const { venues, loading, error } = useVenues();

    // Show only first 3 venues for the curation section
    const curatedVenues = venues.slice(0, 3);

    if (loading) return null; // Or skeleton
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-gray-200 pb-6 mb-10 text-center md:text-left">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-serif text-brand-text mb-2">Curation for April</h2>
                    <p className="text-gray-500 text-sm">Handpicked venues for your special occasions</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap justify-center items-center gap-4 mt-6 md:mt-0 text-sm"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort By</span>
                        <div className="relative flex items-center">
                            <select className="border border-gray-200 rounded-full pl-4 pr-8 py-1.5 bg-white text-gray-700 outline-none appearance-none cursor-pointer text-sm">
                                <option>newest</option>
                                <option>price: low to high</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</span>
                        <div className="relative flex items-center">
                            <select className="border border-gray-200 rounded-full pl-4 pr-8 py-1.5 bg-white text-gray-700 outline-none appearance-none cursor-pointer text-sm">
                                <option>all</option>
                                <option>boutique</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                        <Filter size={14} className="text-gray-500" />
                        Amenities
                    </motion.button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {curatedVenues.map((venue) => (
                    <VenueCard
                        key={venue._id}
                        image={getVenueImage(venue.mediaFiles)}
                        type={venue.type}
                        price={`₹${venue.pricePerDay}`}
                        name={venue.name}
                        location={`${venue.city}, ${venue.state}`}
                        capacity={`${venue.capacity} cap.`}
                        rating={venue.averageRating ? venue.averageRating.toFixed(1) : "New"}
                    />
                ))}
            </div>
        </section>
    );
}