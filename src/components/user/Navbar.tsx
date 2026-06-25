import { LogIn, User as UserIcon, Menu, X, LogOut, Bell, CreditCard, Calendar, Heart, AlertCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../../services/userService";
import type { UserProfile } from "../../types/user.types";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, type Notification } from "../../services/notificationService";

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Discover", path: "/discover" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
    { name: "My Bookings", path: "/my-bookings" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Planning", path: "/planning" },
    { name: "Complaints", path: "/complaints" },
    { name: "Blogs", path: "/blogs" }
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const userId = localStorage.getItem("userId");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    if (userId && userId !== "undefined" && userId !== "null") {
      try {
        const data = await getUserNotifications(userId);
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    }
  };

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

      fetchNotifications();
      // Poll every 30 seconds for live notification updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const container = document.getElementById("notifications-dropdown-container");
      if (container && !container.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isNotificationsOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const container = document.getElementById("profile-dropdown-container");
      if (container && !container.contains(target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isProfileOpen]);

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

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await markAllNotificationsAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all notifications as read", err);
    }
  };

  return (
    <header className="fixed top-3 left-3 right-3 md:top-4 md:left-10 md:right-10 z-50 flex items-center justify-between px-4 md:px-10 py-2.5 md:py-3.5 bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl md:rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/images/hero/logo.png" 
            alt="Book My Venue" 
            className="h-8 sm:h-10 md:h-12 w-auto object-contain"
          />
        </Link>
      </div>

      <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-stone-600">
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-4 py-2 rounded-full uppercase tracking-wider transition-all duration-200 ${
                active 
                  ? "text-[#4C5040] bg-[#4C5040]/10" 
                  : "hover:text-[#4C5040] hover:bg-stone-100/50"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 text-sm font-medium text-brand-text relative">
        {userId && (
          <div id="notifications-dropdown-container" className="static md:relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-stone-600 hover:text-[#4C5040] transition-colors focus:outline-none cursor-pointer flex items-center justify-center rounded-full hover:bg-stone-100/50"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-3 w-[calc(100vw-24px)] md:w-96 bg-white border border-stone-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#F7F6F2]/50">
                      <h3 className="font-serif text-[#4C5040] font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] text-[#5C614D] hover:text-[#4C5040] font-semibold cursor-pointer transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-gray-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={async () => {
                              if (!notification.isRead) {
                                try {
                                  await markNotificationAsRead(notification._id);
                                  setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                              setIsNotificationsOpen(false);
                              navigate("/transactions");
                            }}
                            className={`px-4 py-3 flex gap-2.5 text-left transition-colors cursor-pointer hover:bg-stone-50 ${
                              !notification.isRead ? "bg-stone-50/70" : ""
                            }`}
                          >
                            {/* Dot indicator */}
                            <div className="flex-shrink-0 mt-1.5">
                              <span className={`block h-1.5 w-1.5 rounded-full ${
                                !notification.isRead ? "bg-red-500" : "bg-transparent"
                              }`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs ${!notification.isRead ? "font-bold text-gray-900" : "text-gray-600"}`}>
                                {notification.title}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-[9px] text-gray-400 mt-1 font-medium">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {userId ? (
          <div 
            id="profile-dropdown-container"
            className="relative cursor-pointer flex items-center"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {/* Profile Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#4C5040] shadow-sm transition-transform hover:scale-105">
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
                  <UserIcon size={18} />
                </div>
              )}
            </div>

            {/* Click Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full right-0 mt-3 pt-2 z-50 cursor-default"
                >
                    <div className="bg-white border border-stone-100 rounded-2xl shadow-[0_12px_38px_rgba(0,0,0,0.08)] p-2 w-60 flex flex-col">
                      {/* User Header Info */}
                      <div className="px-3.5 py-3 border-b border-stone-100 mb-1.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-100 flex-shrink-0">
                          {user?.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
                              alt={user?.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-500 bg-stone-100">
                              <UserIcon size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase leading-none">Signed in as</p>
                          <p className="text-xs font-bold text-stone-800 truncate mt-1 leading-tight">{user?.name || "User"}</p>
                          {user?.email && <p className="text-[10px] text-stone-400 truncate mt-0.5 leading-none">{user.email}</p>}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-[#5C614D] font-medium text-xs transition-all duration-200"
                      >
                        <UserIcon size={15} className="text-stone-400 group-hover:text-[#5C614D] transition-colors" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/transactions"
                        onClick={() => setIsProfileOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-[#5C614D] font-medium text-xs transition-all duration-200"
                      >
                        <CreditCard size={15} className="text-stone-400 group-hover:text-[#5C614D] transition-colors" />
                        <span>My Transactions</span>
                      </Link>
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsProfileOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-[#5C614D] font-medium text-xs transition-all duration-200"
                      >
                        <Calendar size={15} className="text-stone-400 group-hover:text-[#5C614D] transition-colors" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsProfileOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-[#5C614D] font-medium text-xs transition-all duration-200"
                      >
                        <Heart size={15} className="text-stone-400 group-hover:text-[#5C614D] transition-colors" />
                        <span>My Wishlist</span>
                      </Link>
                      <Link
                        to="/complaints"
                        onClick={() => setIsProfileOpen(false)}
                        className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-[#5C614D] font-medium text-xs transition-all duration-200"
                      >
                        <AlertCircle size={15} className="text-stone-400 group-hover:text-[#5C614D] transition-colors" />
                        <span>My Complaints</span>
                      </Link>
                      
                      <div className="h-px bg-stone-100 my-1.5" />
                      
                      <button
                        onClick={handleLogout}
                        className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs transition-all duration-200 cursor-pointer"
                      >
                        <LogOut size={15} className="text-red-400 group-hover:text-red-600 transition-colors" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#4C5040] hover:bg-[#3d4133] text-white hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <LogIn size={12} />
            <span>Sign In</span>
          </Link>
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          className="xl:hidden p-1.5 text-stone-600 hover:text-[#4C5040] hover:bg-stone-100/50 rounded-full transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl border border-stone-100 rounded-2xl xl:hidden flex flex-col py-4 px-6 gap-2.5 z-40"
          >
             {navLinks.map((link) => {
               const active = isActive(link.path);
               return (
                 <Link
                   key={link.path}
                   to={link.path}
                   className={`text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors ${
                     active 
                       ? "text-[#4C5040] bg-[#4C5040]/10" 
                       : "text-stone-600 hover:bg-stone-50 hover:text-[#4C5040]"
                   }`}
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   {link.name}
                 </Link>
               );
             })}
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
