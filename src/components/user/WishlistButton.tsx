import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useVenues } from '../../store/Usevenues';

interface WishlistButtonProps {
    venueId: string;
    className?: string;
}

export default function WishlistButton({ venueId, className = "" }: WishlistButtonProps) {
    const { wishlistIds, toggleWishlist } = useVenues();
    const [loading, setLoading] = useState(false);

    const isWishlisted = wishlistIds.includes(venueId);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setLoading(true);
        try {
            await toggleWishlist(venueId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 shadow-sm
                ${isWishlisted ? 'bg-red-50 hover:bg-red-100' : 'bg-white/90 hover:bg-white backdrop-blur-md'}
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart 
                size={20} 
                className={`transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
        </button>
    );
}
