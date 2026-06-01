import { createContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { discoverVenues, type PaginationData } from "../services/VenueUserservice ";
import type { Venue } from "../types/venue.types";

interface VenueContextType {
    venues: Venue[];
    pagination: PaginationData | null;
    loading: boolean;      // true only on the very first load (shows skeleton)
    isFetching: boolean;   // true on every subsequent refetch (subtle indicator only)
    error: string | null;
    refetch: (params?: any) => void;
    wishlistIds: string[];
    toggleWishlist: (venueId: string) => Promise<void>;
    fetchWishlist: () => Promise<void>;
}

export const VenueContext = createContext<VenueContextType | undefined>(undefined);

export const VenueProvider = ({ children }: { children: ReactNode }) => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);    // initial skeleton
    const [isFetching, setIsFetching] = useState<boolean>(false); // subtle refetch indicator
    const [error, setError] = useState<string | null>(null);
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const isFirstLoad = useRef(true);

    const fetchVenues = async (params: any = {}) => {
        if (isFirstLoad.current) {
            // First load: show full skeleton
            setLoading(true);
        } else {
            // Subsequent refetches: keep existing cards visible, just show subtle indicator
            setIsFetching(true);
        }
        setError(null);

        try {
            const response = await discoverVenues(params);
            setVenues(response.venues);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || "Failed to fetch venues");
        } finally {
            if (isFirstLoad.current) {
                setLoading(false);
                isFirstLoad.current = false;
            } else {
                setIsFetching(false);
            }
        }
    };

    const fetchWishlist = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        try {
            const { getWishlist } = await import("../services/wishlistService");
            const data = await getWishlist();
            setWishlistIds(data.wishlist.map((v: any) => v ? (typeof v === 'string' ? v : v._id) : null).filter(Boolean));
        } catch (err) {
            console.error("Failed to fetch wishlist", err);
        }
    };

    const toggleWishlist = async (venueId: string) => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.warn("User must be logged in to wishlist");
            return;
        }
        const { addToWishlist, removeFromWishlist } = await import("../services/wishlistService");
        try {
            const isWishlisted = wishlistIds.includes(venueId);
            if (isWishlisted) {
                setWishlistIds(prev => prev.filter(id => id !== venueId));
                await removeFromWishlist(venueId);
            } else {
                setWishlistIds(prev => [...prev, venueId]);
                await addToWishlist(venueId);
            }
        } catch (err) {
            console.error("Failed to toggle wishlist", err);
            await fetchWishlist();
        }
    };

    useEffect(() => {
        fetchVenues();
        fetchWishlist();
    }, []);

    return (
        <VenueContext.Provider value={{
            venues, pagination, loading, isFetching, error,
            refetch: fetchVenues, wishlistIds, toggleWishlist, fetchWishlist
        }}>
            {children}
        </VenueContext.Provider>
    );
};
