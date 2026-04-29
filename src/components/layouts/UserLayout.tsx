
import { BsInstagram, BsTwitter } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";
import { Link, Outlet } from "react-router-dom";
import Navbar from "../user/Navbar";
export default function UserLayout() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans text-brand-text w-full">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full px-10 py-16 mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

          <div className="col-span-1 md:col-span-2 pr-8">
            <h2 className="text-2xl font-serif italic mb-4">Book My Venue.</h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8">
              Curating the world's most beautiful spaces for your most meaningful moments. From historic barns to modern lofts.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <BsInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <BsTwitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-6">Discover</h4>
            <ul className="flex flex-col gap-4 text-sm">
              <li><Link to="/" className="hover:text-brand-primary">Featured Venues</Link></li>
              <li><Link to="/" className="hover:text-brand-primary">New Collections</Link></li>
              <li><Link to="/" className="hover:text-brand-primary">Planning Tools</Link></li>
              <li><Link to="/" className="hover:text-brand-primary">Inspiration Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-6">Company</h4>
            <ul className="flex flex-col gap-4 text-sm">
              <li><Link to="/" className="hover:text-brand-primary">About Us</Link></li>
              <li><Link to="/" className="hover:text-brand-primary">Careers</Link></li>
              <li><Link to="/" className="hover:text-brand-primary">Press</Link></li>
              <li><Link to="/" className="hover:text-brand-primary">Contact</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2024 Book My Venue. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/" className="hover:text-brand-primary">Privacy Policy</Link>
            <Link to="/" className="hover:text-brand-primary">Terms of Service</Link>
            <Link to="/" className="hover:text-brand-primary">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
