import axios from "axios";
import type { Venue } from "../types/venue.types";

// const BASE_URL = "http://localhost:3000/api/wishlist";
const BASE_URL = "http://192.168.1.14:3000/api/wishlist";

// Helper to get auth headers
const getHeaders = () => {
    const userId = localStorage.getItem("userId");
    return {
        headers: {
            "Content-Type": "application/json",
            ...(userId ? { userid: userId } : {}),
        },
    };
};

export const getWishlist = async (): Promise<{ wishlist: Venue[] }> => {
    const res = await axios.get(BASE_URL, getHeaders());
    return res.data;
};

export const addToWishlist = async (venueId: string): Promise<{ wishlist: string[] }> => {
    const res = await axios.post(`${BASE_URL}/${venueId}`, {}, getHeaders());
    return res.data;
};

export const removeFromWishlist = async (venueId: string): Promise<{ wishlist: string[] }> => {
    const res = await axios.delete(`${BASE_URL}/${venueId}`, getHeaders());
    return res.data;
};
