import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getApprovedVenues } from "../services/VenueUserservice ";
import type { Venue } from "../services/VenueUserservice ";

interface VenueContextType {
    venues: Venue[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    wishlistIds: string[];
    toggleWishlist: (venueId: string) => Promise<void>;
    fetchWishlist: () => Promise<void>;
}

export const VenueContext = createContext<VenueContextType | undefined>(undefined);

export const VenueProvider = ({ children }: { children: ReactNode }) => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);

    const fetchVenues = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getApprovedVenues();
            setVenues(data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch venues");
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlist = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        
        try {
            const { getWishlist } = await import("../services/wishlistService");
            const data = await getWishlist();
            // Store just the IDs for easy lookup
            setWishlistIds(data.wishlist.map(v => typeof v === 'string' ? v : v._id));
        } catch (err) {
            console.error("Failed to fetch wishlist", err);
        }
    };

    const toggleWishlist = async (venueId: string) => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            // Can show a toast or redirect here in future
            console.warn("User must be logged in to wishlist");
            return;
        }

        const { addToWishlist, removeFromWishlist } = await import("../services/wishlistService");
        
        try {
            const isWishlisted = wishlistIds.includes(venueId);
            if (isWishlisted) {
                // Optimistic UI update
                setWishlistIds(prev => prev.filter(id => id !== venueId));
                await removeFromWishlist(venueId);
            } else {
                setWishlistIds(prev => [...prev, venueId]);
                await addToWishlist(venueId);
            }
        } catch (err) {
            console.error("Failed to toggle wishlist", err);
            // Revert on error
            await fetchWishlist();
        }
    };

    useEffect(() => {
        fetchVenues();
        fetchWishlist();
    }, []);

    return (
        <VenueContext.Provider value={{ venues, loading, error, refetch: fetchVenues, wishlistIds, toggleWishlist, fetchWishlist }}>
            {children}
        </VenueContext.Provider>
    );
};
