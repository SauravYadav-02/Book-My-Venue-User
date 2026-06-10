
import { useVenues } from '../../store/Usevenues';
import DiscoverCard from './DiscoverCard';
import { getVenueImage } from '../../services/VenueUserservice ';
import { HeartCrack } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Wishlist() {
    const { venues, wishlistIds, loading } = useVenues();

    const wishlistedVenues = venues.filter(v => wishlistIds.includes(v._id));

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-[#4C5040]/20 border-t-[#4C5040] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F6F2] py-20 px-6 md:px-10 lg:px-20 font-sans">
            <div className="max-w-7xl mx-auto mt-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-serif text-[#2d2d2d] mb-4">Your Wishlist</h1>
                    <p className="text-gray-500 mb-12">Keep track of your favorite venues for your upcoming events.</p>
                </motion.div>

                {wishlistedVenues.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 mt-10"
                    >
                        <div className="bg-red-50 p-6 rounded-full mb-6">
                            <HeartCrack size={48} className="text-red-400" />
                        </div>
                        <h2 className="text-2xl font-serif text-[#2d2d2d] mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-500 max-w-md mb-8">
                            You haven't added any venues to your wishlist yet. Discover beautiful spaces and save them here.
                        </p>
                        <Link 
                            to="/discover" 
                            className="bg-[#4C5040] text-white px-8 py-3.5 rounded-xl font-medium tracking-wide hover:bg-[#3A3D30] transition-colors shadow-md"
                        >
                            Explore Venues
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {wishlistedVenues.map((venue) => (
                            <DiscoverCard
                                key={venue._id}
                                venueId={venue._id}
                                image={getVenueImage(venue.mediaFiles)}
                                title={venue.name}
                                location={`${venue.city}, ${venue.state}`}
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
                    </motion.div>
                )}
            </div>
        </div>
    );
}

