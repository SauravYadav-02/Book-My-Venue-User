import { LogIn, User as UserIcon, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../../services/userService";
import type { UserProfile } from "../../types/user.types";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId && userId !== "undefined" && userId !== "null") {
      getUserById(userId)
        .then((data) => {
          if (data && data._id) {
            setUser(data);
          } else {
            localStorage.removeItem("userId");
            setUser(null);
          }
        })
        .catch((err) => {
          console.error(err);
          localStorage.removeItem("userId");
          setUser(null);
        });
    }
  }, [userId]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setIsProfileOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem("userId");
    setUser(null);
    setShowLogoutConfirm(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 md:py-5 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-serif italic tracking-wide text-brand-text">
          Book My Venue.
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-text">
        <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
        <Link to="/discover" className="hover:text-brand-primary transition-colors">Discover</Link>
        <Link to="/wishlist" className="hover:text-brand-primary transition-colors">Wishlist</Link>
        <Link to="/planning" className="hover:text-brand-primary transition-colors">Planning</Link>
        <Link to="/" className="hover:text-brand-primary transition-colors">Inspiration</Link>
      </nav>

      <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-brand-text relative">
        {userId ? (
          <div 
            className="relative cursor-pointer flex items-center"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            {/* Profile Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4C5040] shadow-sm transition-transform hover:scale-105">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <UserIcon size={20} />
                </div>
              )}
            </div>

            {/* Hover Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-3 pt-2 z-50"
                >
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2 min-w-[150px] flex flex-col">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Signed in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user?.name || "Loading..."}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="w-full text-left px-4 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:text-[#5C614D] transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/transactions"
                      className="w-full text-left px-4 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:text-[#5C614D] transition-colors"
                    >
                      My Transactions
                    </Link>
                    <Link
                      to="/wishlist"
                      className="w-full text-left px-4 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:text-[#5C614D] transition-colors"
                    >
                      My Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login" className="flex items-center gap-2 hover:text-[#5C614D] transition-colors">
            <LogIn size={18} />
            Sign In
          </Link>
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden p-1 text-brand-text hover:text-brand-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-[#F7F6F2] shadow-md border-b border-gray-200 md:hidden flex flex-col py-4 px-6 gap-4 z-40"
          >
             <Link to="/" className="text-lg font-medium text-brand-text hover:text-brand-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/discover" className="text-lg font-medium text-brand-text hover:text-brand-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Discover</Link>
            <Link to="/transactions" className="text-lg font-medium text-brand-text hover:text-brand-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Transactions</Link>
            <Link to="/wishlist" className="text-lg font-medium text-brand-text hover:text-brand-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
            <Link to="/planning" className="text-lg font-medium text-brand-text hover:text-brand-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Planning</Link>
            <Link to="/" className="text-lg font-medium text-brand-text hover:text-brand-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Inspiration</Link>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Premium Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4">
            {/* Glassmorphic Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-stone-900/40"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 text-center space-y-6 z-10"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <LogOut size={28} />
              </div>

              {/* Title & Message */}
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-[#2d2d2d]">Confirm Sign Out</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Do you want to log out, <span className="font-semibold text-[#2d2d2d]">{user?.name || "User"}</span>?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-md shadow-red-600/10 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
