export interface Review {
    _id?: string;
    userId: string | { _id: string; name: string; email: string; profilePhoto?: string };
    rating: number;
    feedback: string;
    status?: "pending" | "approved" | "rejected";
    createdAt?: string;
}

export interface Venue {
    _id: string;
    vendorId: string;
    name: string;
    type?: string;
    capacity: number;
    description?: string;
    pricePerDay: number;
    vegPrice?: number | null;
    nonVegPrice?: number | null;
    address?: string;
    city: string;
    state: string;
    zip?: string;
    country: string;
    lat?: string;
    lng?: string;
    amenities?: string[];
    availableFrom?: string;
    mediaFiles: string[];
    status: "pending" | "approved" | "rejected";
    adminDescription?: string;
    averageRating?: number;
    ratingCount?: number;
    totalReviews?: number;
    reviews?: Review[];
    createdAt: string;
    updatedAt: string;
}
