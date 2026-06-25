import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MessageSquare, Heart, BookOpen, AlertCircle, Trash2, Send, ChevronDown, Filter } from "lucide-react";
import { getBlogs, toggleLike, addComment, deleteComment, type Blog } from "../../services/blogService";
import { getUserById } from "../../services/userService";
import toast, { Toaster } from "react-hot-toast";

const CURATED_TAGS = ["All", "Planning", "Decor", "Catering", "Photography", "Venues", "Trends", "Tips"];

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}

function CustomSelect({ value, onChange, options, placeholder, icon, className = "", align = "left" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={dropdownRef} className={`relative select-none w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between ${
          icon ? "pl-11" : "pl-4"
        } pr-4 py-3 bg-stone-50 border border-stone-200 text-[#2d2d2d] rounded-xl text-sm font-medium hover:bg-stone-100/50 transition-all outline-none cursor-pointer relative`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-[999] mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden ${
          align === "right" ? "right-0 w-max min-w-full" : "left-0 right-0"
        }`}>
          <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-all hover:bg-gray-50 flex items-center justify-between gap-4 ${
                  value === opt.value ? "bg-[#5C614D]/10 text-[#5C614D] font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [page, setPage] = useState(1);
  
  // User authentication & interaction states
  const userId = localStorage.getItem("userId");
  const [userName, setUserName] = useState("Anonymous User");
  const [expandedCommentsBlogId, setExpandedCommentsBlogId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search term if needed, but since we have a button or simple trigger, let's fetch on filter/search change
  const fetchBlogs = async (pageNum: number, isLoadMore = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params: { page: number; limit: number; search?: string; tag?: string } = {
        page: pageNum,
        limit: 6,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedTag !== "All") {
        params.tag = selectedTag;
      }

      const res = await getBlogs(params);

      if (isLoadMore) {
        setBlogs((prev) => [...prev, ...res.data]);
      } else {
        setBlogs(res.data);
      }

      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch when search, tag changes
  useEffect(() => {
    setPage(1);
    fetchBlogs(1, false);
  }, [selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs(1, false);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBlogs(nextPage, true);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!userId) {
      toast.error("Please sign in to like this article.");
      return;
    }

    try {
      const targetBlog = blogs.find((b) => b._id === blogId);
      if (!targetBlog) return;

      const isAlreadyLiked = targetBlog.likes?.includes(userId) || false;

      // Optimistic update
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => {
          if (b._id === blogId) {
            const updatedLikes = isAlreadyLiked
              ? (b.likes || []).filter((id) => id !== userId)
              : [...(b.likes || []), userId];
            return { ...b, likes: updatedLikes };
          }
          return b;
        })
      );

      const res = await toggleLike(blogId, userId);

      // Sync state with actual response
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => {
          if (b._id === blogId) {
            const updatedLikes = res.liked
              ? (b.likes?.includes(userId) ? b.likes : [...(b.likes || []), userId])
              : (b.likes || []).filter((id) => id !== userId);
            return { ...b, likes: updatedLikes };
          }
          return b;
        })
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update like status.");
    }
  };

  const handleInlineAddComment = async (blogId: string) => {
    if (!userId) {
      toast.error("Please sign in to comment.");
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      setSubmittingComment(true);
      const text = newCommentText.trim();
      const addedComment = await addComment(blogId, userId, text, userName);

      // Update lists
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => {
          if (b._id === blogId) {
            return { ...b, comments: [...(b.comments || []), addedComment] };
          }
          return b;
        })
      );

      setNewCommentText("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string, blogId: string) => {
    if (!userId) return;

    try {
      await deleteComment(blogId, commentId, userId);

      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => {
          if (b._id === blogId) {
            return { ...b, comments: (b.comments || []).filter((c) => c._id !== commentId) };
          }
          return b;
        })
      );

      toast.success("Comment deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment.");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] py-20 px-6 md:px-10 lg:px-20 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto mt-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left mb-12"
        >
          <span className="text-[#8A8F78] text-xs font-bold tracking-widest uppercase bg-[#5C614D]/10 px-3 py-1.5 rounded-full">
            Inspiration & Guides
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2d2d2d] mt-4 mb-4">
            Our Venue Journal
          </h1>
          <p className="text-gray-500 max-w-2xl text-base leading-relaxed">
            Discover professional planning guides, style inspiration, venue checklists, and industry insights to help you craft the perfect event.
          </p>
        </motion.div>

        {/* Search & Tag Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-lg">
            <input
              type="text"
              placeholder="Search articles or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#5C614D] focus:ring-1 focus:ring-[#5C614D] text-[#2d2d2d] placeholder-gray-400 rounded-xl pl-11 pr-24 py-3 text-sm focus:outline-none transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-[#5C614D] hover:bg-[#4C5040] text-white text-xs font-bold tracking-wider px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>

          {/* Dropdown for Categories */}
          <div className="w-full md:w-60 z-30">
            <CustomSelect
              value={selectedTag}
              onChange={setSelectedTag}
              options={CURATED_TAGS.map((tag) => ({ label: tag === "All" ? "All Categories" : tag, value: tag }))}
              placeholder="All Categories"
              icon={<Filter size={16} />}
              align="right"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[40vh] gap-3">
            <div className="w-10 h-10 border-4 border-[#5C614D]/20 border-t-[#5C614D] rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-medium">Curating articles...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm">
            <AlertCircle size={40} className="text-red-500 mb-4 animate-bounce" />
            <h3 className="text-xl font-serif text-[#2d2d2d] mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchBlogs(1, false)}
              className="bg-[#5C614D] text-white px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-[#4C5040] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-100"
          >
            <div className="bg-stone-50 p-6 rounded-full mb-6">
              <BookOpen size={48} className="text-stone-400" />
            </div>
            <h2 className="text-2xl font-serif text-[#2d2d2d] mb-3">No articles found</h2>
            <p className="text-gray-500 max-w-md mb-8">
              We couldn't find any articles matching your search query or selected category. Check back later or try a different filter.
            </p>
            {(search || selectedTag !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedTag("All");
                }}
                className="bg-[#5C614D] text-white px-8 py-3.5 rounded-xl font-medium tracking-wide hover:bg-[#4C5040] transition-colors shadow-md shadow-[#5C614D]/10"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
            >
              {blogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="group bg-transparent overflow-hidden transition-all duration-300 flex flex-col h-full border-none shadow-none"
                >
                  {/* Editorial Image Collage / Cover */}
                  <Link to={`/blogs/${blog._id}`} className="relative block overflow-hidden aspect-[16/10] bg-stone-100 rounded-md">
                    {blog.images && blog.images.length >= 3 ? (
                      <div className="grid grid-cols-3 gap-[2px] w-full h-full transition-transform duration-500 group-hover:scale-[1.02]">
                        <img src={blog.images[0]} alt="" className="w-full h-full object-cover" />
                        <img src={blog.images[1]} alt="" className="w-full h-full object-cover" />
                        <img src={blog.images[2]} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : blog.images && blog.images.length === 2 ? (
                      <div className="grid grid-cols-2 gap-[2px] w-full h-full transition-transform duration-500 group-hover:scale-[1.02]">
                        <img src={blog.images[0]} alt="" className="w-full h-full object-cover" />
                        <img src={blog.images[1]} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : blog.coverImage ? (
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-400">
                        <BookOpen size={40} className="stroke-1" />
                      </div>
                    )}
                    
                    {/* Tags on Image */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[80%]">
                        {blog.tags.slice(0, 1).map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#5C614D]/90 backdrop-blur-sm text-white text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="mt-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title */}
                      <Link to={`/blogs/${blog._id}`}>
                        <h2 className="text-xl md:text-2xl font-serif font-normal text-[#2d2d2d] text-center leading-tight mb-3 hover:text-[#5C614D] transition-colors px-2">
                          {blog.title}
                        </h2>
                      </Link>

                      {/* Meta (Centered: Author | Date | Read Time) */}
                      <div className="flex items-center justify-center gap-2 text-[#8A8F78] text-[9px] sm:text-xs font-bold tracking-widest uppercase mb-4">
                        <span>BY {blog.vendorId?.businessName || blog.vendorId?.fullName || "Apoorva"}</span>
                        <span>|</span>
                        <span>{formatDate(blog.createdAt)}</span>
                        <span>|</span>
                        <span>{Math.max(1, Math.ceil((blog.content || "").split(/\s+/).length / 200))} min read</span>
                      </div>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 text-left line-clamp-3 px-1">
                        {blog.content}
                      </p>
                    </div>

                    {/* Footer stats / CTA */}
                    <div className="pt-4 mt-auto flex items-center justify-between border-t border-stone-100">
                      {/* Interaction Counts (Bordered Box) */}
                      <div 
                        onClick={() => setExpandedCommentsBlogId(expandedCommentsBlogId === blog._id ? null : blog._id)}
                        className="border border-[#5C614D]/30 px-3.5 py-1.5 rounded-none flex items-center gap-4 text-xs font-bold text-[#5C614D] cursor-pointer hover:bg-stone-50 transition-colors"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // prevent comment box toggling
                            handleLike(blog._id);
                          }}
                          className="flex items-center gap-1 focus:outline-none hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent p-0"
                        >
                          {blog.likes?.includes(userId || "") ? (
                            <Heart size={13} className="text-red-500 fill-red-500 animate-pulse" />
                          ) : (
                            <Heart size={13} className="text-[#5C614D]" />
                          )}
                          <span>{blog.likes?.length || 0}</span>
                        </button>

                        <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <MessageSquare size={13} className="text-[#5C614D]" />
                          <span>{blog.comments?.length || 0}</span>
                        </div>
                      </div>

                      {/* Action CTA */}
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="text-xs font-bold tracking-wider uppercase text-[#5C614D] hover:text-[#4C5040] transition-colors flex items-center gap-1"
                      >
                        Read Post →
                      </Link>
                    </div>

                    {/* Inline Comment Box */}
                    {expandedCommentsBlogId === blog._id && (
                      <div className="mt-4 pt-4 border-t border-stone-100 space-y-3 font-sans text-[#2c2c2c] w-full text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            Comments ({blog.comments?.length || 0})
                          </span>
                          <button 
                            onClick={() => setExpandedCommentsBlogId(null)}
                            className="text-[10px] font-semibold text-stone-400 hover:text-stone-600 bg-transparent border-none p-0 cursor-pointer"
                          >
                            Close
                          </button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {!blog.comments || blog.comments.length === 0 ? (
                            <p className="text-xs text-stone-400 py-2">No comments yet. Be the first to share!</p>
                          ) : (
                            blog.comments.map((comment) => (
                              <div key={comment._id} className="bg-stone-50 border border-stone-200/40 p-2.5 rounded-lg flex flex-col justify-between group/comment">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  <span className="font-bold text-[11px] text-[#5C614D] tracking-wide">
                                    {comment.userName || "Anonymous"}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-stone-400 font-medium">
                                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                    {userId === comment.userId && (
                                      <button
                                        onClick={() => handleDeleteComment(comment._id, blog._id)}
                                        className="text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover/comment:opacity-100 p-0.5 rounded cursor-pointer border-none bg-transparent"
                                        title="Delete comment"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-stone-600 text-xs leading-relaxed font-normal whitespace-pre-line">
                                  {comment.text}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Input Form */}
                        <div className="pt-2">
                          {userId ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleInlineAddComment(blog._id);
                              }} 
                              className="flex gap-2"
                            >
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                disabled={submittingComment}
                                className="flex-1 bg-stone-50 border border-stone-200 focus:border-[#5C614D] focus:ring-1 focus:ring-[#5C614D] rounded-lg px-3 py-1.5 text-xs focus:outline-none placeholder-gray-400 text-[#2c2c2c] transition-all"
                              />
                              <button
                                type="submit"
                                disabled={submittingComment || !newCommentText.trim()}
                                className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-3.5 py-1.5 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors border-none"
                              >
                                {submittingComment ? (
                                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                  <Send size={11} />
                                )}
                              </button>
                            </form>
                          ) : (
                            <div className="text-center py-1 text-stone-500 text-[10px] font-medium">
                              Please{" "}
                              <Link to="/login" className="text-[#5C614D] underline hover:text-[#4C5040]">
                                login
                              </Link>{" "}
                              to leave a comment.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination / Load More */}
            {page < totalPages && (
              <div className="flex justify-center mt-16">
                <button
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-8 py-3.5 rounded-xl font-semibold tracking-wider text-xs uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#5C614D]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer border-none"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Articles</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
