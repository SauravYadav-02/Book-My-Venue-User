import { LogIn, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../../services/userService";
import type { UserProfile } from "../../types/user.types";

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      getUserById(userId)
        .then((data) => {
          if (data && data._id) {
            setUser(data);
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUser(null);
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
        <Link to="/" className="hover:text-brand-primary transition-colors">Planning</Link>
        <Link to="/" className="hover:text-brand-primary transition-colors">Inspiration</Link>
      </nav>

      <div className="flex items-center gap-6 text-sm font-medium text-brand-text relative">
        {user ? (
          <div className="relative group cursor-pointer flex items-center">
            {/* Profile Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4C5040] shadow-sm transition-transform group-hover:scale-105">
              {user.profilePhoto ? (
                <img
                  src={`http://localhost:3000/${user.profilePhoto}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <UserIcon size={20} />
                </div>
              )}
            </div>

            {/* Hover Dropdown */}
            <div className="absolute top-full right-0 mt-3 pt-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2 min-w-[150px] flex flex-col">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Signed in as</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                </div>
                <Link
                  to="/profile"
                  className="w-full text-left px-4 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:text-[#5C614D] transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="flex items-center gap-2 hover:text-[#5C614D] transition-colors">
            <LogIn size={18} />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
