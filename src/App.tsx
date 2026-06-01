import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";



// Public / Auth Pages
import LoginPage from "./pages/auth/LoginPage";

import UserRegistration from "./pages/auth/UserRegistration";
import VendorRegistration from "./pages/auth/VendorRegistration";

// Public User Layout & Pages
import UserLayout from "./components/layouts/UserLayout";
import Home from "./pages/user/Home";

import Discover from "./pages/user/Discover";
import VenueDetails from "./pages/user/VenueDetails";
import Profile from "./pages/user/Profile";
import Wishlist from "./pages/user/Wishlist";
import Transactions from "./pages/user/Transactions";
import Planning from "./pages/user/Planning";

// Context
import { VenueProvider } from "./store/Venuecontext";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public / Auth Routes */}
        <Route path="/login" element={<LoginPage />} />

        <Route path="/user-register" element={<UserRegistration />} />
        <Route path="/register" element={<VendorRegistration />} />

        {/* Public / User End */}
        <Route path="/" element={<VenueProvider><UserLayout /></VenueProvider>}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="venue/:id" element={<VenueDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="planning" element={<Planning />} />
        </Route>



        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}