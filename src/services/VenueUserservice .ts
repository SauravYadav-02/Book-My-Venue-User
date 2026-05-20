// const BASE_URL = "http://localhost:3000/venues";
const BASE_URL = "http://192.168.1.14:3000/venues";
// export const MEDIA_BASE_URL = "http://localhost:3000";
export const MEDIA_BASE_URL = "http://192.168.1.14:3000";

import { type Venue } from "../types/venue.types";

export interface PaginationData {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface DiscoveryResponse {
    venues: Venue[];
    pagination: PaginationData;
}

export const getVenueImage = (mediaFiles: string[]): string => {
    return mediaFiles?.[0] ? `${MEDIA_BASE_URL}/${mediaFiles[0]}` : "/placeholder.jpg";
};

// ✅ Get All Venues
export const getAllVenues = async (): Promise<Venue[]> => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch venues");
    return res.json();
};

// ✅ Get Approved Venues only
export const getApprovedVenues = async (): Promise<Venue[]> => {
    const venues = await getAllVenues();
    return venues.filter((v) => v.status === "approved");
};

// ✅ Discover Venues (Paginated, Searchable, Filterable)
export const discoverVenues = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
    sort?: string;
    amenities?: string;
    events?: string;
} = {}): Promise<DiscoveryResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value.toString());
        }
    });

    const res = await fetch(`${BASE_URL}/discover?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to discover venues");
    return res.json();
};

// ✅ Get Single Venue
export const getVenueById = async (id: string): Promise<Venue> => {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error("Venue not found");
    return res.json();
};

// ✅ Get Venues by Vendor
export const getVenuesByVendor = async (vendorId: string): Promise<Venue[]> => {
    const res = await fetch(`${BASE_URL}/vendor/${vendorId}`);
    if (!res.ok) throw new Error("Failed to fetch vendor venues");
    return res.json();
};

// ✅ Create Venue
export const createVenue = async (formData: FormData): Promise<Venue> => {
    const res = await fetch(`${BASE_URL}/add`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to create venue");
    return res.json();
};

// ✅ Update Venue
export const updateVenue = async (id: string, formData: FormData): Promise<Venue> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to update venue");
    return res.json();
};

// ✅ Delete Venue
export const deleteVenue = async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete venue");
};

// ✅ Approve Venue (admin)
export const approveVenue = async (id: string): Promise<Venue> => {
    const res = await fetch(`${BASE_URL}/${id}/approve`, {
        method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to approve venue");
    return res.json();
};

// ✅ Reject Venue (admin)
export const rejectVenue = async (id: string, adminDescription: string): Promise<Venue> => {
    const res = await fetch(`${BASE_URL}/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminDescription }),
    });
    if (!res.ok) throw new Error("Failed to reject venue");
    return res.json();
};