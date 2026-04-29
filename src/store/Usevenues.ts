import { useContext } from "react";
import { VenueContext } from "./Venuecontext";

export const useVenues = () => {
    const context = useContext(VenueContext);
    if (context === undefined) {
        throw new Error("useVenues must be used within a VenueProvider");
    }
    return context;
};
