import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Video,
  Image as ImageIcon,
  Building,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getBlogById,
  toggleLike,
  addComment,
  deleteComment,
  type Blog
} from "../../services/blogService";
import { getUserById } from "../../services/userService";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User auth state
  const userId = localStorage.getItem("userId");
  const [userName, setUserName] = useState("Anonymous User");

  // Interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch blog data
  const fetchBlogData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getBlogById(id);
      setBlog(data);
      setLikeCount(data.likes?.length || 0);
      if (userId) {
        setIsLiked(data.likes?.includes(userId) || false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load the article. It may have been removed or unpublished.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, [id, userId]);

  // Fetch user name if logged in to pre-populate comments
  useEffect(() => {
    if (userId && userId !== "undefined" && userId !== "null") {
      getUserById(userId)
        .then((data) => {
          if (data && data.name) {
            setUserName(data.name);
          }
        })
        .catch((err) => console.error("Error fetching user detail", err));
    }
  }, [userId]);

  // Handle Like
  const handleLikeToggle = async () => {
    if (!userId) {
      toast.error("Please sign in to like this article.");
      return;
    }
    if (!blog) return;

    try {
      // Optimistic update
      const previouslyLiked = isLiked;
      setIsLiked(!previouslyLiked);
      setLikeCount((prev) => (previouslyLiked ? prev - 1 : prev + 1));

      const res = await toggleLike(blog._id, userId);
      setIsLiked(res.liked);
      setLikeCount(res.likeCount);

      if (res.liked) {
        toast.success("Added to liked posts");
      } else {
        toast.success("Removed from liked posts");
      }
    } catch (err) {
      // Revert on error
      setIsLiked(blog.likes.includes(userId));
      setLikeCount(blog.likes.length);
      toast.error("Failed to update like status.");
    }
  };

  // Handle Share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  // Handle Add Comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please sign in to comment.");
      return;
    }
    if (!commentText.trim() || !blog) return;

    try {
      setSubmittingComment(true);
      const newComment = await addComment(blog._id, userId, commentText, userName);
      setBlog((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        };
      });
      setCommentText("");
      toast.success("Comment posted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleCommentDelete = async (commentId: string) => {
    if (!userId || !blog) return;

    try {
      await deleteComment(blog._id, commentId, userId);
      setBlog((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c._id !== commentId),
        };
      });
      toast.success("Comment deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete comment.");
    }
  };

  // YouTube Link Parser
  const getYoutubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#F7F6F2] gap-3">
        <div className="w-10 h-10 border-4 border-[#5C614D]/20 border-t-[#5C614D] rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-medium">Opening the journal...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] py-28 px-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-sm text-center border border-stone-100">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#2d2d2d] mb-3">Article Unavailable</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {error || "This blog post cannot be found or is not approved for publishing."}
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 bg-[#5C614D] hover:bg-[#4C5040] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(blog.videoUrl);

  return (
    <div className="min-h-screen bg-[#F7F6F2] py-20 px-6 md:px-10 lg:px-20 font-sans">
      <div className="max-w-6xl mx-auto mt-10">
        
        {/* Navigation & Actions Row */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-[#5C614D] hover:text-[#4C5040] font-bold text-sm transition-colors group"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Journal
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 bg-white border border-stone-200 hover:border-stone-300 text-gray-500 hover:text-gray-800 rounded-full shadow-sm transition-all cursor-pointer"
              title="Copy link to share"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm transition-all cursor-pointer ${
                isLiked
                  ? "border-red-200 text-red-500 hover:bg-red-50/20"
                  : "border-stone-200 text-gray-500 hover:text-gray-800"
              }`}
            >
              <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />
              <span className="text-xs font-bold">{likeCount} Likes</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#5C614D]/10 text-[#5C614D] text-[10px] font-extrabold tracking-wider uppercase px-3.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#2d2d2d] leading-tight mb-6">
            {blog.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <User size={15} className="text-[#8A8F78]" />
              <span className="text-gray-600">
                {blog.vendorId?.businessName || blog.vendorId?.fullName || "Partner"}
              </span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#8A8F78]" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-12 shadow-sm border border-stone-200">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Grid Layout: Main Read & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Article Content (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Body Text */}
            <article className="prose max-w-none text-gray-700 text-base md:text-lg leading-relaxed space-y-6">
              {blog.content.split("\n\n").map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </article>

            {/* Video Guide Embed */}
            {embedUrl && (
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
                <h3 className="text-lg font-serif text-[#2d2d2d] flex items-center gap-2 font-bold">
                  <Video size={18} className="text-[#5C614D]" />
                  Watch Video Guide
                </h3>
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={embedUrl}
                    title="YouTube Video Guide"
                    className="absolute inset-0 w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Inspiration Gallery */}
            {blog.images && blog.images.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
                <h3 className="text-lg font-serif text-[#2d2d2d] flex items-center gap-2 font-bold">
                  <ImageIcon size={18} className="text-[#5C614D]" />
                  Inspiration Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {blog.images.map((imgUrl, index) => (
                    <a
                      key={index}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-[4/3] rounded-xl overflow-hidden bg-stone-50 border border-stone-100"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery element ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-white/95 text-stone-700 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                          View Full Image
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-8" id="comments">
              <h3 className="text-xl font-serif text-[#2d2d2d] font-bold flex items-center gap-2.5">
                <MessageSquare size={20} className="text-[#5C614D]" />
                Discussion ({blog.comments?.length || 0} Comments)
              </h3>

              {/* Add Comment Form */}
              {userId ? (
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Posting as {userName}
                    </label>
                    <textarea
                      placeholder="Share your thoughts or ask a question about this article..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-[#5C614D] focus:ring-1 focus:ring-[#5C614D] text-[#2d2d2d] rounded-2xl p-4 text-sm focus:outline-none transition-all resize-none"
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 text-center">
                  <p className="text-gray-500 text-sm mb-4">You must be logged in to participate in the discussion.</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center bg-[#5C614D] hover:bg-[#4C5040] text-white px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors"
                  >
                    Sign In to Comment
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6 divide-y divide-stone-100">
                {blog.comments?.length === 0 ? (
                  <p className="text-gray-400 text-sm italic text-center py-6">Be the first to share your thoughts!</p>
                ) : (
                  blog.comments.map((comment, idx) => (
                    <div key={comment._id} className={`pt-6 ${idx === 0 ? "border-t-0 pt-0" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-[#2d2d2d]">{comment.userName}</span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                            {comment.text}
                          </p>
                        </div>

                        {/* Delete Comment Button */}
                        {userId && (comment.userId === userId || localStorage.getItem("userId") === comment.userId) && (
                          <button
                            onClick={() => handleCommentDelete(comment._id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar (Right 1 Column) */}
          <div className="space-y-8">
            
            {/* Author/Vendor Profile Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5C614D]/10 flex items-center justify-center text-[#5C614D]">
                  <Building size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#2d2d2d] leading-snug">
                    {blog.vendorId?.businessName || blog.vendorId?.fullName || "Vendor Partner"}
                  </h4>
                  <span className="text-xs text-[#8A8F78] font-bold uppercase tracking-wider">
                    Official Host
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-xs leading-relaxed">
                This inspiration guide is crafted by one of our trusted partner venues. They are dedicated to helping hosts construct memorable guest experiences.
              </p>

              <div className="border-t border-stone-50 pt-4">
                <Link
                  to="/discover"
                  className="w-full inline-flex justify-center items-center bg-[#5C614D] hover:bg-[#4C5040] text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm shadow-[#5C614D]/10 cursor-pointer"
                >
                  Browse Venues
                </Link>
              </div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
              <h4 className="font-serif text-base font-bold text-[#2d2d2d]">Article Information</h4>
              
              <div className="space-y-3 divide-y divide-stone-50 text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-400">Total Likes</span>
                  <span className="font-bold text-[#2d2d2d]">{likeCount} Likes</span>
                </div>
                <div className="flex justify-between py-2.5 pt-2.5">
                  <span className="text-gray-400">Comments</span>
                  <span className="font-bold text-[#2d2d2d]">{blog.comments?.length || 0} Comments</span>
                </div>
                <div className="flex justify-between py-2.5 pt-2.5">
                  <span className="text-gray-400">Status</span>
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider">
                    Published
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
