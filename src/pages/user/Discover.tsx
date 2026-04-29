import { Sparkles, ArrowRight, SearchX } from "lucide-react";
import { getVenueImage } from "../../services/VenueUserservice ";
import { useVenues } from "../../store/Usevenues";
import DiscoverCard from "./DiscoverCard";

export default function Discover() {
    const { venues, loading, error, refetch } = useVenues();

    return (
        <div className="w-full flex flex-col items-center bg-[#FAFAFA] min-h-screen relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#5C614D]/5 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#8A8F78]/5 blur-[120px]" />
            </div>

            <section className="w-full max-w-7xl mx-auto px-6 pt-36 pb-24 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="h-px w-8 bg-[#5C614D]"></span>
                            <span className="text-[11px] font-bold tracking-[0.25em] text-[#5C614D] uppercase flex items-center gap-2">
                                <Sparkles size={14} />
                                Explore Collection
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif text-[#2d2d2d] mb-6 leading-[1.1]">
                            Discover Exceptional <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C614D] to-[#8A8F78]">Spaces</span>
                        </h1>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
                            Curated venues for extraordinary events. From intimate gatherings to grand celebrations, find the perfect backdrop for your next unforgettable moment.
                        </p>
                    </div>
                    {!loading && !error && (
                        <div className="flex flex-col items-end gap-4">
                            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-[#5C614D] animate-pulse" />
                                <span className="text-sm font-medium text-[#2d2d2d] tracking-wide">
                                    {venues.length} Venues Available
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading Skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
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
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <SearchX size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-[#2d2d2d] mb-4">Oops! Something went wrong</h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-md">{error}</p>
                        <button
                            onClick={refetch}
                            className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-8 py-3.5 rounded-full font-medium transition-all duration-300 shadow-lg shadow-[#5C614D]/20 hover:shadow-[#5C614D]/40 transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Try Again
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && venues.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                            <SearchX size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-[#2d2d2d] mb-4">No venues found</h3>
                        <p className="text-gray-500 text-lg max-w-md">We couldn't find any venues at the moment. Please check back later or modify your search criteria.</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && venues.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                rating={4.8}
                            />
                        ))}
                    </div>
                )}

            </section>

            {/* Bottom CTA */}
            {!loading && !error && venues.length > 0 && (
                <section className="w-full bg-white border-t border-gray-100 py-24 relative z-10 mt-12">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <span className="text-[11px] font-bold tracking-[0.25em] text-[#5C614D] uppercase mb-6 block">
                            Need Assistance?
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-[#2d2d2d] mb-8 leading-tight">
                            Let us help you find <br className="hidden md:block"/> the perfect match.
                        </h2>
                        <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                            Our curation team handpicks new venues every month. Share your requirements with us and we'll curate a personalized selection just for you.
                        </p>
                        <button className="group bg-[#2d2d2d] hover:bg-[#5C614D] text-white px-10 py-4 rounded-full font-medium transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-[#5C614D]/30 flex items-center gap-3 mx-auto transform hover:-translate-y-1">
                            Contact Our Team
                            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}