import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, User, MessageSquare, Heart, BookOpen, AlertCircle } from "lucide-react";
import { getBlogs, type Blog } from "../../services/blogService";

const CURATED_TAGS = ["All", "Planning", "Decor", "Catering", "Photography", "Venues", "Trends", "Tips"];

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [page, setPage] = useState(1);
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
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
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

          {/* Tags (Horizontal Scrolling) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto md:max-w-[60%]">
            {CURATED_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer shrink-0 border ${
                  selectedTag === tag
                    ? "bg-[#5C614D] border-[#5C614D] text-white shadow-sm"
                    : "bg-stone-50 border-stone-200 text-gray-600 hover:bg-stone-100"
                }`}
              >
                {tag}
              </button>
            ))}
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {blogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-stone-100"
                >
                  {/* Cover Image */}
                  <Link to={`/blogs/${blog._id}`} className="relative block overflow-hidden aspect-[16/10] bg-stone-100">
                    {blog.coverImage ? (
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-400">
                        <BookOpen size={40} className="stroke-1" />
                      </div>
                    )}
                    
                    {/* Tags on Image */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[80%]">
                        {blog.tags.slice(0, 2).map((tag) => (
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
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta (Author & Date) */}
                      <div className="flex items-center gap-4 text-gray-400 text-xs font-medium mb-3">
                        <div className="flex items-center gap-1.5 truncate">
                          <User size={13} className="text-[#8A8F78]" />
                          <span className="truncate">
                            {blog.vendorId?.businessName || blog.vendorId?.fullName || "Partner"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Calendar size={13} className="text-[#8A8F78]" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <Link to={`/blogs/${blog._id}`}>
                        <h3 className="text-xl font-bold text-[#2d2d2d] leading-snug mb-3 line-clamp-2 hover:text-[#5C614D] transition-colors">
                          {blog.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {blog.content}
                      </p>
                    </div>

                    {/* Footer stats / CTA */}
                    <div className="border-t border-stone-50 pt-4 mt-auto flex items-center justify-between">
                      {/* Interaction Counts */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Heart size={14} className="text-red-400" />
                          {blog.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare size={14} className="text-blue-400" />
                          {blog.comments?.length || 0}
                        </span>
                      </div>

                      {/* Action CTA */}
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="text-xs font-bold tracking-wider uppercase text-[#5C614D] hover:text-[#4C5040] transition-colors flex items-center gap-1"
                      >
                        Read Post →
                      </Link>
                    </div>
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
