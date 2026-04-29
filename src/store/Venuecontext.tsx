import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getApprovedVenues } from "../services/VenueUserservice ";
import type { Venue } from "../services/VenueUserservice ";

interface VenueContextType {
    venues: Venue[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const VenueContext = createContext<VenueContextType | undefined>(undefined);

export const VenueProvider = ({ children }: { children: ReactNode }) => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchVenues();
    }, []);

    return (
        <VenueContext.Provider value={{ venues, loading, error, refetch: fetchVenues }}>
            {children}
        </VenueContext.Provider>
    );
};
