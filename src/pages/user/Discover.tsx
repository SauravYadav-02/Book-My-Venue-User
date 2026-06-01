import { Sparkles, ArrowRight, SearchX, ChevronLeft, ChevronRight, Search, MapPin, Filter, X, ChevronDown } from "lucide-react";
import { getVenueImage } from "../../services/VenueUserservice ";
import { useVenues } from "../../store/Usevenues";
import DiscoverCard from "./DiscoverCard";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const CITIES_LIST = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"];
const CATEGORIES_LIST = [
    "Hotels & Resorts",
    "Farmhouses & Private Villas",
    "Destination Venues",
    "Banquet Hall",
    "Outdoor Venue",
    "Conference Hall",
    "Rooftop"
];
const EVENTS_LIST = [
    "Weddings",
    "Birthday Parties",
    "Engagements",
    "Anniversaries",
    "Corporate Events",
    "Baby Showers",
    "Social Gatherings"
];

// ─── Custom Select Component with rounded border options list ───
interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    placeholder: string;
    icon?: React.ReactNode;
    className?: string;
}

function CustomSelect({ value, onChange, options, placeholder, icon, className = "" }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div ref={dropdownRef} className={`relative select-none ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between pl-11 pr-4 py-3 bg-gray-50 text-slate-700 rounded-2xl text-sm font-medium hover:bg-gray-100 transition-all outline-none border border-transparent cursor-pointer relative"
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                    <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[999] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                    <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-all hover:bg-gray-50 flex items-center justify-between ${
                                    value === opt.value ? "bg-[#5C614D]/10 text-[#5C614D] font-semibold" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <span className="truncate">{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Discover() {
    const { venues, pagination, loading, isFetching, error, refetch } = useVenues();
    const [searchParams] = useSearchParams();
    
    // Filter States initialized from URL if present (normalized case-insensitively to match select dropdown options)
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    
    const [city, setCity] = useState(() => {
        const initialCity = searchParams.get("city") || "";
        return ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"].find(
            c => c.toLowerCase() === initialCity.toLowerCase()
        ) || initialCity;
    });

    const [capacity] = useState(searchParams.get("capacity") || "");

    const [category, setCategory] = useState(() => {
        const initialCategory = searchParams.get("category") || "";
        return ["Hotels & Resorts", "Farmhouses & Private Villas", "Destination Venues", "Banquet Hall", "Outdoor Venue", "Conference Hall", "Rooftop"].find(
            c => c.toLowerCase() === initialCategory.toLowerCase()
        ) || initialCategory;
    });

    const [events, setEvents] = useState(() => {
        const initialEvent = searchParams.get("events") || "";
        return ["Weddings", "Birthday Parties", "Engagements", "Anniversaries", "Corporate Events", "Baby Showers", "Social Gatherings"].find(
            e => e.toLowerCase() === initialEvent.toLowerCase()
        ) || initialEvent;
    });
    
    const [sort, setSort] = useState("newest");

    // Single source-of-truth effect.
    // React 18 auto-batches all setState calls in one handler into ONE render,
    // so this effect fires exactly ONCE per user action — no cascade double-fetch.
    useEffect(() => {
        const timer = setTimeout(() => {
            refetch({ page, limit: 9, search, city, category, sort, capacity, events });
        }, 300);
        return () => clearTimeout(timer);
    }, [page, search, city, category, sort, capacity, events]);

    // Batched handlers — reset page AND set filter in same synchronous call.
    // React 18 batches both setStates → single render → single effect run.
    const handleSearchChange = (value: string) => { setPage(1); setSearch(value); };
    const handleCityChange   = (value: string) => { setPage(1); setCity(value); };
    const handleCategoryChange = (value: string) => { setPage(1); setCategory(value); };
    const handleSortChange   = (value: string) => { setPage(1); setSort(value); };

    const handlePageChange = (newPage: number) => {
        if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const clearFilters = () => {
        // All setState calls batch into ONE render in React 18
        setSearch("");
        setCity("");
        setCategory("");
        setEvents("");
        setSort("newest");
        setPage(1);
    };

    return (
        <div className="w-full flex flex-col items-center bg-[#FAFAFA] min-h-screen relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#5C614D]/5 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#8A8F78]/5 blur-[120px]" />
            </div>

            <section className="w-full max-w-7xl mx-auto px-6 pt-36 pb-24 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
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
                            Curated venues for extraordinary events. Find the perfect backdrop for your next unforgettable moment.
                        </p>
                    </motion.div>
                    {!loading && !error && pagination && (
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-end gap-4"
                        >
                            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-[#5C614D] animate-pulse" />
                                <span className="text-sm font-medium text-[#2d2d2d] tracking-wide">
                                    {pagination.totalItems} Venues Available
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Filter Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-12 flex flex-col lg:flex-row items-center gap-4"
                >
                    {/* Search Input */}
                    <div className="relative w-full lg:flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or keyword..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#5C614D]/20 transition-all outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        {/* City Filter */}
                        <CustomSelect
                            value={city}
                            onChange={handleCityChange}
                            options={[
                                { label: "All Cities", value: "" },
                                ...CITIES_LIST.map(c => ({ label: c, value: c }))
                            ]}
                            placeholder="All Cities"
                            icon={<MapPin size={16} />}
                            className="flex-1 min-w-[140px]"
                        />

                        {/* Category Filter */}
                        <CustomSelect
                            value={category}
                            onChange={handleCategoryChange}
                            options={[
                                { label: "All Categories", value: "" },
                                ...CATEGORIES_LIST.map(cat => ({ label: cat, value: cat }))
                            ]}
                            placeholder="All Categories"
                            icon={<Filter size={16} />}
                            className="flex-1 min-w-[140px]"
                        />

                        {/* Events Filter */}
                        <CustomSelect
                            value={events}
                            onChange={(value) => { setPage(1); setEvents(value); }}
                            options={[
                                { label: "All Events", value: "" },
                                ...EVENTS_LIST.map(ev => ({ label: ev, value: ev }))
                            ]}
                            placeholder="All Events"
                            icon={<Sparkles size={16} />}
                            className="flex-1 min-w-[140px]"
                        />

                        {/* Sort Dropdown */}
                        <CustomSelect
                            value={sort}
                            onChange={handleSortChange}
                            options={[
                                { label: "Newest First", value: "newest" },
                                { label: "Price: Low to High", value: "price_low" },
                                { label: "Price: High to Low", value: "price_high" },
                                { label: "Top Rated", value: "rating_high" },
                                { label: "Largest Capacity", value: "capacity_high" }
                            ]}
                            placeholder="Sort By"
                            className="flex-1 min-w-[140px]"
                        />

                        {/* Clear Button */}
                        {(search || city || category || events || sort !== "newest") && (
                            <button 
                                onClick={clearFilters}
                                className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all group"
                                title="Clear All Filters"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Slim progress bar — visible during filter refetches; grid stays mounted */}
                {isFetching && (
                    <div className="h-0.5 w-full rounded-full bg-gray-100 mb-4 overflow-hidden">
                        <div
                            className="h-full bg-[#5C614D] rounded-full"
                            style={{ width: '70%', animation: 'pulse 1s ease-in-out infinite' }}
                        />
                    </div>
                )}

                {/* Loading Skeletons — only on very first load */}
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
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2rem] shadow-sm border border-gray-100"
                    >
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <SearchX size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-[#2d2d2d] mb-4">Oops! Something went wrong</h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-md">{error}</p>
                        <button
                            onClick={() => refetch({ page })}
                            className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-8 py-3.5 rounded-full font-medium transition-all duration-300 shadow-lg shadow-[#5C614D]/20 hover:shadow-[#5C614D]/40 transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Try Again
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && !error && venues.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2rem] shadow-sm border border-gray-100"
                    >
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                            <SearchX size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-[#2d2d2d] mb-4">No venues found</h3>
                        <p className="text-gray-500 text-lg max-w-md">We couldn't find any venues at the moment. Please check back later or modify your search criteria.</p>
                    </motion.div>
                )}

                {/* Grid */}
                {!loading && !error && venues.length > 0 && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
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
                                />
                            ))}
                        </motion.div>

                        {/* Pagination Controls */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-20">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border border-gray-200 transition-all duration-300 ${
                                        !pagination.hasPrevPage 
                                        ? "text-gray-300 cursor-not-allowed" 
                                        : "text-[#2d2d2d] hover:bg-[#5C614D] hover:text-white hover:border-[#5C614D] shadow-sm"
                                    }`}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {[...Array(pagination.totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        // Simple logic to show current page and neighbors
                                        if (
                                            pageNum === 1 || 
                                            pageNum === pagination.totalPages || 
                                            (pageNum >= page - 1 && pageNum <= page + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 ${
                                                        page === pageNum 
                                                        ? "bg-[#2d2d2d] text-white shadow-lg scale-110" 
                                                        : "text-gray-500 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (
                                            (pageNum === 2 && page > 3) || 
                                            (pageNum === pagination.totalPages - 1 && page < pagination.totalPages - 2)
                                        ) {
                                            return <span key={pageNum} className="text-gray-400">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border border-gray-200 transition-all duration-300 ${
                                        !pagination.hasNextPage 
                                        ? "text-gray-300 cursor-not-allowed" 
                                        : "text-[#2d2d2d] hover:bg-[#5C614D] hover:text-white hover:border-[#5C614D] shadow-sm"
                                    }`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}

            </section>

            {/* Bottom CTA */}
            {!loading && !error && venues.length > 0 && (
                <section className="w-full bg-white border-t border-gray-100 py-24 relative z-10 mt-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto px-6 text-center"
                    >
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
                    </motion.div>
                </section>
            )}
        </div>
    );
}