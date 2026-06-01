import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, X, Filter, ChevronDown } from "lucide-react";
import { useVenues } from "../../../store/Usevenues";
import { getVenueImage } from "../../../services/VenueUserservice ";
import VenueCard from "../../../components/user/VenueCard";

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

interface CurationSectionProps {
    searchQuery?: string;
    capacityQuery?: string;
}

export default function CurationSection({ searchQuery = "", capacityQuery = "" }: CurationSectionProps = {}) {
    const { venues, loading, isFetching, refetch } = useVenues();
    const navigate = useNavigate();

    // Horizontal Filter States (Matching Discover Page)
    const [search, setSearch] = useState(searchQuery);
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("");
    const [events, setEvents] = useState("");
    const [sort, setSort] = useState("newest");
    
    const isMounted = useRef(false); // skip first-mount duplicate fetch

    // Sync search query from Hero section search action
    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    // Triggers search fetch whenever any filter changes
    useEffect(() => {
        // Skip on first render — VenueContext already fetched on mount
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        const timer = setTimeout(() => {
            refetch({
                page: 1,
                limit: 10,
                search,
                city,
                category,
                events,
                sort,
                capacity: capacityQuery || undefined
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, city, category, events, sort, capacityQuery]);

    const clearFilters = () => {
        setSearch("");
        setCity("");
        setCategory("");
        setEvents("");
        setSort("newest");
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-16" id="search-results">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-gray-200 pb-6 mb-8 text-center md:text-left">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-serif text-brand-text mb-2">Search Results</h2>
                    <p className="text-gray-500 text-sm">Find the perfect venue for your special occasion</p>
                </motion.div>
            </div>

            {/* Premium Discover-style Horizontal Filter Bar */}
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
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#5C614D]/20 transition-all outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* City Filter */}
                    <CustomSelect
                        value={city}
                        onChange={setCity}
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
                        onChange={setCategory}
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
                        onChange={setEvents}
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
                        onChange={setSort}
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

            {/* Subtle fetching bar — cards stay mounted, no blink */}
            {isFetching && (
                <div className="h-0.5 w-full rounded-full bg-gray-100 mb-6 overflow-hidden">
                    <div className="h-full bg-[#5C614D] animate-[shimmer_1s_ease-in-out_infinite]" style={{ width: '60%', animation: 'pulse 1s ease-in-out infinite' }} />
                </div>
            )}

            {/* Results Grid — uses loading only for the very first skeleton */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#5C614D] rounded-full animate-spin"></div>
                </div>
            ) : venues.length > 0 ? (
                <div className="flex flex-col items-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                        {venues.slice(0, 4).map((venue) => (
                            <VenueCard
                                key={venue._id}
                                venueId={venue._id}
                                image={getVenueImage(venue.mediaFiles)}
                                type={venue.type || "VENUE"}
                                venueTypes={venue.venueTypes}
                                eventsSupported={venue.eventsSupported}
                                price={`₹${venue.pricePerDay || 0}`}
                                name={venue.name}
                                location={`${venue.city || ''}, ${venue.state || ''}`}
                                capacity={`${venue.capacity || 0} cap.`}
                                rating={venue.averageRating ? venue.averageRating.toFixed(1) : "0.0"}
                                amenities={venue.amenities}
                                isNew={venue.isNew}
                            />
                        ))}
                    </div>
                    {venues.length > 4 && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => navigate("/discover")}
                                className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg shadow-[#5C614D]/20 hover:shadow-[#5C614D]/40 transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                            >
                                Continue to Discover
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="text-xl font-serif text-gray-800 mb-2">No venues found</h3>
                    <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                    <button
                        onClick={clearFilters}
                        className="mt-6 bg-[#5C614D] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#4C5040] transition-colors cursor-pointer"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </section>
    );
}