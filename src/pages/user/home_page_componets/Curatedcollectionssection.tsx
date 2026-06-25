import { useState, useEffect } from "react";
import { discoverVenues, getVenueImage } from "../../../services/VenueUserservice ";
import { type Venue } from "../../../types/venue.types";
import DiscoverCard from "../DiscoverCard";
import { motion } from "framer-motion";

export default function CuratedCollectionsSection() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewlyListed = async () => {
            try {
                setLoading(true);
                const res = await discoverVenues({ limit: 3, sort: "newest" });
                setVenues(res.venues);
            } catch (err) {
                console.error("Failed to fetch newly listed venues", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNewlyListed();
    }, []);

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-24 text-center" id="newly-listed">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-4xl font-serif text-brand-text mb-4">Newly Listed Venues</h2>
                <p className="text-gray-500 mb-12">Discover our latest venues and be the first to book these exceptional spaces.</p>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 text-left">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm animate-pulse border border-gray-50">
                            <div className="aspect-[4/3] bg-gray-100" />
                            <div className="p-6 space-y-4">
                                <div className="h-6 bg-gray-100 rounded-lg w-3/4" />
                                <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                                <div className="pt-4 border-t border-gray-50 flex justify-between">
                                    <div className="h-4 bg-gray-100 rounded-lg w-1/4" />
                                    <div className="h-4 bg-gray-100 rounded-lg w-1/4" />
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : venues.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 text-left">
                    {venues.map((venue) => (
                        <DiscoverCard
                            key={venue._id}
                            venueId={venue._id}
                            image={getVenueImage(venue.mediaFiles)}
                            title={venue.name}
                            location={[venue.city, venue.state, venue.country]
                                .filter(Boolean)
                                .join(", ")}
                            price={venue.pricePerDay}
                            capacity={venue.capacity}
                            type={venue.type}
                            venueTypes={venue.venueTypes}
                            eventsSupported={venue.eventsSupported}
                            rating={venue.averageRating ?? 0}
                            isSubscriptionActive={venue.isSubscriptionActive}
                            isNew={venue.isNew}
                            vendorName={venue.vendorId && typeof venue.vendorId === "object" ? venue.vendorId.fullName : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 py-10 font-medium">No newly listed venues found.</div>
            )}
        </section>
    );
}