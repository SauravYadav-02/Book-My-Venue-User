import { useState, useEffect } from "react";
import { Star, Send, Loader2, User, Edit2 } from "lucide-react";

import toast from "react-hot-toast";
import { submitReview, getVenueReviews, type Review } from "../../services/ratingService";

interface VenueRatingProps {
    venueId: string;
    venueName: string;
    onRatingUpdate?: () => void;
}

export default function VenueRating({ venueId, venueName, onRatingUpdate }: VenueRatingProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchReviews();
    }, [venueId]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const query = userId ? `?userId=${userId}` : "";
            const data = await getVenueReviews(venueId + query);
            setReviews(data);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            toast.error("Please login to give a rating");
            return;
        }

        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await submitReview(venueId, {
                userId,
                rating,
                feedback,
            });

            toast.success(response.message || "Thank you for your review!");
            setRating(0);
            setFeedback("");
            setReviews(response.reviews);
            if (onRatingUpdate) onRatingUpdate();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (r: Review) => {
        setRating(r.rating);
        setFeedback(r.feedback);
        // Scroll to form
        window.scrollTo({ top: document.getElementById('review-form')?.offsetTop ? document.getElementById('review-form')!.offsetTop - 100 : 0, behavior: 'smooth' });
    };

    const getUserIdFromReview = (r: Review) => {
        if (typeof r.userId === 'string') return r.userId;
        return r.userId?._id;
    };

    const getUserNameFromReview = (r: Review) => {
        if (typeof r.userId === 'string') return "Verified User";
        return r.userId?.name || "Verified User";
    };

    const getUserPhotoFromReview = (r: Review) => {
        if (typeof r.userId === 'string') return null;
        return r.userId?.profilePhoto || null;
    };

    return (
        <div className="space-y-10 mt-12 border-t border-gray-200 pt-12">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-3xl font-serif text-[#2d2d2d]">Ratings & Reviews</h2>
                <p className="text-gray-500 text-sm">Share your experience at {venueName}</p>
            </div>

            {/* Rating Form */}
            {userId ? (
                <div id="review-form" className="bg-white rounded-3xl p-8 shadow-soft border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-[#2d2d2d]">Overall Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star
                                            size={32}
                                            className={`transition-colors duration-200 ${(hover || rating) >= star
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-[#2d2d2d]">Review Description (Optional)</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tell others about your experience, the atmosphere, service, etc."
                                maxLength={500}
                                className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C614D]/20 focus:border-[#5C614D] transition-all resize-none"
                            />
                            <div className="flex justify-end">
                                <span className="text-[10px] text-gray-400 font-medium">{feedback.length}/500</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="flex items-center gap-2 px-8 py-3.5 bg-[#4a5043] hover:bg-[#3a3f35] disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-[#4a5043]/5 rounded-3xl p-8 border border-dashed border-[#4a5043]/20 text-center space-y-4">
                    <p className="text-[#4a5043] font-medium">Please login to share your review</p>
                    <a href="/login" className="inline-block text-sm font-bold text-[#4a5043] underline underline-offset-4">
                        Login Now
                    </a>
                </div>
            )}

            {/* Existing Reviews */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif text-[#2d2d2d]">
                        User Reviews ({reviews.length})
                    </h3>
                </div>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Loading reviews...</span>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid gap-6">
                        {reviews.map((r) => (
                            <div
                                key={r._id}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 transition-all hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100">
                                            {getUserPhotoFromReview(r) ? (
                                                <img 
                                                    src={getUserPhotoFromReview(r)!} 
                                                    alt={getUserNameFromReview(r)} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#2d2d2d]">{getUserNameFromReview(r)}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={
                                                            i < r.rating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-200"
                                                        }
                                                    />
                                                ))}
                                                <span className="text-[10px] text-gray-400 ml-2 font-medium">
                                                    {r.createdAt
                                                        ? (() => {
                                                            const d = new Date(r.createdAt);
                                                            const dd = String(d.getDate()).padStart(2, '0');
                                                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                                                            const yyyy = d.getFullYear();
                                                            return `${dd}/${mm}/${yyyy}`;
                                                        })()
                                                        : 'Just now'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {userId === getUserIdFromReview(r) && (
                                        <div className="flex items-center gap-2">
                                            {r.status && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                                    r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {r.status}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleEdit(r)}
                                                className="p-2 text-gray-400 hover:text-[#4a5043] transition-colors"
                                                title="Edit review"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {r.feedback || <span className="italic text-gray-400">No description provided.</span>}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No reviews yet. Be the first to rate!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
