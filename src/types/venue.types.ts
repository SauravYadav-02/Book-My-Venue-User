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
    vendorId: string | { _id: string; fullName: string; email: string; businessName?: string; phone?: string };
    name: string;
    type?: string;
    venueTypes?: string[];
    eventsSupported?: string[];
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
    isSubscriptionActive?: boolean;
    adminDescription?: string;
    averageRating?: number;
    ratingCount?: number;
    totalReviews?: number;
    reviews?: Review[];
    isNew?: boolean;
    createdAt: string;
    updatedAt: string;
}
