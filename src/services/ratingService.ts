// const RATINGS_URL = "http://localhost:3000/ratings";
const RATINGS_URL = "http://10.113.216.96:3000/ratings";

export type { Review } from "../types/venue.types";
import { type Review } from "../types/venue.types";

export interface RatingResponse {
    message: string;
    averageRating: number;
    ratingCount: number;
    reviews: Review[];
}

export const submitReview = async (venueId: string, reviewData: { userId: string; rating: number; feedback: string }): Promise<RatingResponse> => {
    const res = await fetch(`${RATINGS_URL}/venue/${venueId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit review");
    }

    return res.json();
};

export const getVenueReviews = async (venueIdWithQuery: string): Promise<Review[]> => {
    // The venueIdWithQuery might include "?userId=...", so we split it if needed,
    // but typically it's just passed as is.
    const res = await fetch(`${RATINGS_URL}/venue/${venueIdWithQuery}`);
    if (!res.ok) {
        throw new Error("Failed to fetch reviews");
    }
    const data = await res.json();
    return data.reviews || [];
};

