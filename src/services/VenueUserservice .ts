const BASE_URL = "http://localhost:3000/venues";
export const MEDIA_BASE_URL = "http://localhost:3000";

export const getVenueImage = (mediaFiles: string[]): string => {
    return mediaFiles?.[0] ? `${MEDIA_BASE_URL}/${mediaFiles[0]}` : "/placeholder.jpg";
};

export interface Venue {
    _id: string;
    vendorId: string;
    name: string;
    type?: string;
    capacity: number;
    description?: string;
    pricePerDay: number;
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
    createdAt: string;
    updatedAt: string;
}

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