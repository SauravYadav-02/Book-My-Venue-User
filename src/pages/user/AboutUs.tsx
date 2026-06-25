import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  CalendarDays, 
  CreditCard, 
  Star, 
  Bell, 
  Users, 
  Target, 
  Eye, 
  Search, 
  ClipboardList, 
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { discoverVenues, getVenueImage, getPublicStats } from "../../services/VenueUserservice ";
import { type Venue } from "../../types/venue.types";

export default function AboutUs() {
  const navigate = useNavigate();

  const [totalVenuesCount, setTotalVenuesCount] = useState<number>(500);
  const [citiesCoveredCount, setCitiesCoveredCount] = useState<number>(50);
  const [happyCustomersCount, setHappyCustomersCount] = useState<number>(10000);
  const [topVenues, setTopVenues] = useState<Venue[]>([]);

  useEffect(() => {
    // 1. Fetch public stats
    getPublicStats()
      .then((stats) => {
        if (stats) {
          setTotalVenuesCount(stats.venuesCount);
          setCitiesCoveredCount(stats.citiesCount);
          setHappyCustomersCount(stats.customersCount);
        }
      })
      .catch((err) => {
        console.error("Failed to load public stats:", err);
      });

    // 2. Fetch top rated venues
    discoverVenues({ sort: "rating_high", limit: 3 })
      .then((data) => {
        if (data && data.venues) {
          setTopVenues(data.venues);
        }
      })
      .catch((err) => {
        console.error("Failed to load backend data for About Us page:", err);
      });
  }, []);

  // Animation Variant Helpers
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Fallback structures if backend venues are not loaded
  const fallbackVenue1 = {
    name: "The Amber Pavilion",
    city: "Jaipur",
    state: "Rajasthan",
    capacity: 500,
    pricePerDay: 45000,
    averageRating: 4.9,
    mediaFiles: []
  };

  const fallbackVenue2 = {
    name: "Royal Palace Gardens",
    city: "Udaipur",
    state: "Rajasthan",
    capacity: 1000,
    pricePerDay: 75000,
    averageRating: 4.8,
    mediaFiles: []
  };

  const venue1 = topVenues[0] || fallbackVenue1;
  const venue2 = topVenues[1] || fallbackVenue2;

  return (
    <div className="w-full min-h-screen bg-[#F7F6F2] pt-28 text-[#2d2d2d] overflow-x-hidden">
      
      {/* SECTION 1 — Hero Banner */}
      <section className="relative w-full min-h-[60vh] flex flex-col justify-center items-center text-center px-6 py-20 bg-gradient-to-br from-[#3d4134] via-[#5C614D] to-[#8A8F78] text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl"
        >
          <span className="tracking-[0.25em] text-white/70 text-xs font-bold uppercase mb-4">
            OUR STORY
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
            Bringing Dream Venues to Life
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed">
            We connect couples, families and businesses with the perfect venues for their most important moments.
          </p>
        </motion.div>
      </section>

      {/* SECTION 2 — Stats Row */}
      <section className="relative max-w-6xl mx-auto px-6 -mt-16 z-10 mb-20">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-white rounded-3xl p-6 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-100"
        >
          {[
            { value: `${totalVenuesCount}+`, label: "Venues Listed" },
            { value: `${happyCustomersCount}+`, label: "Happy Customers" },
            { value: `${citiesCoveredCount}+`, label: "Cities Covered" },
            { value: "98%", label: "Satisfaction Rate" }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={staggerItem}
              className="flex flex-col items-center text-center py-4 px-2"
            >
              <span className="font-serif text-3xl md:text-4xl font-bold text-[#5C614D] mb-2">
                {stat.value}
              </span>
              <span className="text-gray-500 text-xs md:text-sm font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 3 — Our Story */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b border-stone-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column */}
          <motion.div 
            {...fadeUp}
            className="lg:col-span-7 space-y-6"
          >
            <span className="tracking-[0.2em] text-[#8A8F78] text-xs font-bold uppercase block">
              WHO WE ARE
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#2d2d2d] font-bold leading-tight">
              More Than Just a Booking Platform
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
              At Book My Venue, we believe that life's most precious moments deserve spaces that match their significance. Our journey began with a simple observation: planning a celebration should be as joyful as the event itself.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-white rounded-2xl border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-start gap-4 transition-all duration-300 hover:shadow-md">
                <div className="p-2.5 rounded-xl bg-[#5C614D]/10 text-[#5C614D] shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2d2d2d] mb-1">Tailored for India</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Designed for diverse celebrations—from heritage weddings in Rajasthan to modern corporate retreats in Bengaluru.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-start gap-4 transition-all duration-300 hover:shadow-md">
                <div className="p-2.5 rounded-xl bg-[#5C614D]/10 text-[#5C614D] shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2d2d2d] mb-1">Personally Verified</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Our team personally visits and verifies each venue to ensure what you see online matches your experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-[#5C614D] pl-4 italic text-gray-500 text-xs md:text-sm leading-relaxed py-1">
              By bridging the gap between host and venue, we empower you to book with confidence, save time, and focus on what truly matters: celebrating milestones with the people you love.
            </div>
          </motion.div>

          {/* Right Stack Column */}
          <motion.div 
            {...fadeUp}
            className="lg:col-span-5 relative h-[360px] md:h-[420px] w-full max-w-[380px] mx-auto lg:mx-0 flex items-center justify-center mt-8 lg:mt-0"
          >
            {/* Card 3 (Bottom) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8A8F78]/30 to-[#5C614D]/25 rounded-3xl transform translate-x-5 translate-y-5 rotate-6 scale-95 border border-stone-200/40 shadow-sm" />
            
            {/* Card 2 (Middle) - Premium Partner */}
            <div 
              onClick={() => {
                if (venue2._id) {
                  navigate(`/venue/${venue2._id}`);
                } else {
                  navigate("/discover");
                }
              }}
              className="absolute inset-0 bg-gradient-to-br from-stone-50 to-[#5C614D]/5 rounded-3xl transform -translate-x-4 -translate-y-4 -rotate-3 scale-95 border border-stone-200/50 shadow-md p-4 flex flex-col justify-between text-stone-700 cursor-pointer"
            >
              <div className="w-full h-28 bg-stone-100 rounded-2xl overflow-hidden relative shrink-0">
                {venue2.mediaFiles && venue2.mediaFiles.length > 0 ? (
                  <img 
                    src={getVenueImage(venue2.mediaFiles)} 
                    alt={venue2.name} 
                    className="w-full h-full object-cover opacity-80" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#5C614D]/10 to-[#8A8F78]/20 flex items-center justify-center text-[#5C614D]">
                    <Sparkles size={20} className="opacity-40" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[9px] font-bold text-[#5C614D] bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Premium Partner
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center text-[#5C614D] gap-0.5 text-[10px] font-bold shadow-sm">
                  <Star size={10} fill="currentColor" />
                  <span>{venue2.averageRating?.toFixed(1) || "4.8"}</span>
                </div>
              </div>
              <div className="mt-2 flex-1 flex flex-col justify-between min-h-0">
                <div>
                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>{venue2.type || "Event Space"}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#2d2d2d] line-clamp-1">{venue2.name}</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={9} className="text-[#8A8F78]" /> {venue2.city}{venue2.state ? `, ${venue2.state}` : ""}
                  </p>
                  <p className="text-[10px] text-stone-400 line-clamp-1 mt-1 leading-relaxed">
                    {venue2.description || "A gorgeous space perfect for weddings and family celebrations."}
                  </p>
                </div>
                
                <div className="border-t border-stone-100/50 pt-2 mt-2 flex justify-between items-center text-stone-500 text-[10px] shrink-0">
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {venue2.capacity} Guests
                  </span>
                  <span className="font-bold text-[#5C614D]">
                    {venue2.pricePerDay ? `₹${venue2.pricePerDay}/day` : "Verified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 1 (Top) - Top Rated */}
            <div 
              onClick={() => {
                if (venue1._id) {
                  navigate(`/venue/${venue1._id}`);
                } else {
                  navigate("/discover");
                }
              }}
              className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-stone-100 p-4 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.02] cursor-pointer z-10"
            >
              <div className="w-full h-32 bg-stone-100 rounded-2xl overflow-hidden relative shrink-0">
                {venue1.mediaFiles && venue1.mediaFiles.length > 0 ? (
                  <img 
                    src={getVenueImage(venue1.mediaFiles)} 
                    alt={venue1.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center text-amber-600">
                    <Sparkles size={24} className="opacity-40" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Top Rated
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center text-amber-600 gap-1 text-[10px] font-bold shadow-sm">
                  <Star size={10} fill="currentColor" />
                  <span>{venue1.averageRating?.toFixed(1) || "5.0"}</span>
                  <span className="text-gray-400 font-normal">
                    ({venue1.totalReviews || venue1.ratingCount || 1})
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex-1 flex flex-col justify-between min-h-0">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>{venue1.type || "Banquet Hall"}</span>
                    {venue1.address && (
                      <span className="truncate max-w-[150px] font-medium text-right lowercase first-letter:uppercase">{venue1.address}</span>
                    )}
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2d2d2d] line-clamp-1">{venue1.name}</h4>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <MapPin size={10} className="text-[#8A8F78]" /> 
                    {venue1.city}{venue1.state ? `, ${venue1.state}` : ""}
                  </p>
                  
                  {/* Short Description */}
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {venue1.description || "A gorgeous space perfect for weddings, birthdays, corporate events, and family celebrations."}
                  </p>
                  
                  {/* Amenities Chips */}
                  {venue1.amenities && venue1.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {venue1.amenities.slice(0, 3).map((amenity, index) => (
                        <span 
                          key={index} 
                          className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium capitalize"
                        >
                          {amenity}
                        </span>
                      ))}
                      {venue1.amenities.length > 3 && (
                        <span className="text-[9px] text-stone-400 px-1 py-0.5 font-medium">
                          +{venue1.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Bottom Row - Pricing and capacity */}
                <div className="border-t border-stone-100 pt-3 mt-3 flex justify-between items-center text-stone-500 text-[11px] shrink-0">
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-[#5C614D]" /> {venue1.capacity} Guests
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#5C614D] block">
                      {venue1.pricePerDay ? `₹${venue1.pricePerDay}/day` : "Verified Price"}
                    </span>
                    {(venue1.vegPrice || venue1.nonVegPrice) && (
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        {venue1.vegPrice ? `Veg: ₹${venue1.vegPrice}/pl` : ""}
                        {venue1.vegPrice && venue1.nonVegPrice ? " | " : ""}
                        {venue1.nonVegPrice ? `Non-Veg: ₹${venue1.nonVegPrice}/pl` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4 — Mission & Vision */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <motion.div 
            {...fadeUp}
            className="bg-[#5C614D] text-white rounded-3xl p-8 md:p-10 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-[#4C5040] flex items-center justify-center text-white mb-6">
                <Target size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                To make venue discovery effortless, transparent, and joyful for every Indian celebration — big or small.
              </p>
            </div>
            <div className="h-2 w-12 bg-white/20 rounded-full mt-8" />
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            {...fadeUp}
            className="bg-white border-2 border-[#5C614D] text-[#2d2d2d] rounded-3xl p-8 md:p-10 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-[#5C614D]/10 flex items-center justify-center text-[#5C614D] mb-6">
                <Eye size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#5C614D] mb-4">Our Vision</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                To become India's most trusted venue booking platform, where every event finds its perfect home.
              </p>
            </div>
            <div className="h-2 w-12 bg-[#5C614D]/25 rounded-full mt-8" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — What We Offer (Features) */}
      <section className="w-full bg-white py-20 border-y border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            {...fadeUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[#2d2d2d] font-bold">
              Everything You Need
            </h2>
            <div className="w-12 h-[3px] bg-[#5C614D] mx-auto mt-4" />
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <MapPin size={22} />,
                title: "Verified Venues",
                desc: "Every venue is verified by our team before listing"
              },
              {
                icon: <CalendarDays size={22} />,
                title: "Easy Booking",
                desc: "Book your venue in minutes with our simple process"
              },
              {
                icon: <CreditCard size={22} />,
                title: "Secure Payments",
                desc: "Pay safely with upfront booking and balance at event"
              },
              {
                icon: <Star size={22} />,
                title: "Trusted Reviews",
                desc: "Real reviews from real customers who attended events"
              },
              {
                icon: <Bell size={22} />,
                title: "Instant Notifications",
                desc: "Get notified about booking updates in real time"
              },
              {
                icon: <Users size={22} />,
                title: "Vendor Partners",
                desc: "Work with hundreds of verified venue partners across India"
              }
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="bg-[#F7F6F2]/30 rounded-2xl p-8 border border-stone-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-full bg-[#5C614D]/10 text-[#5C614D] flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2d2d2d] mb-2.5">
                  {feat.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 6 — How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20 overflow-visible">
        <motion.div 
          {...fadeUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-[#2d2d2d] font-bold">
            How Book My Venue Works
          </h2>
          <div className="w-12 h-[3px] bg-[#5C614D] mx-auto mt-4" />
        </motion.div>

        <div className="relative">
          {/* Connector Line on Desktop */}
          <div className="absolute top-[68px] left-[12%] right-[12%] h-[2px] bg-stone-200/80 hidden md:block -z-10" />

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {[
              {
                num: "1",
                icon: <Search size={20} />,
                title: "Search",
                desc: "Browse hundreds of verified venues by city, type and budget"
              },
              {
                num: "2",
                icon: <ClipboardList size={20} />,
                title: "Choose",
                desc: "Compare venues, read reviews and pick your perfect match"
              },
              {
                num: "3",
                icon: <CreditCard size={20} />,
                title: "Book & Pay",
                desc: "Pay 20% upfront to confirm your booking instantly"
              },
              {
                num: "4",
                icon: <Sparkles size={20} />,
                title: "Celebrate",
                desc: "Show up and enjoy your event. Pay the balance on the day"
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="relative bg-white rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col items-center text-center pt-8"
              >
                {/* Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#5C614D] text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-white">
                  {step.num}
                </div>
                
                {/* Icon Circle */}
                <div className="w-14 h-14 rounded-full bg-[#5C614D]/5 text-[#5C614D] flex items-center justify-center mb-4 mt-2 border border-[#5C614D]/10">
                  {step.icon}
                </div>

                <h3 className="font-serif text-base md:text-lg font-bold text-[#2d2d2d] mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 8 — Values Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div 
          {...fadeUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-[#2d2d2d] font-bold">
            Our Core Values
          </h2>
          <div className="w-12 h-[3px] bg-[#5C614D] mx-auto mt-4" />
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { emoji: "💚", title: "Transparency", desc: "No hidden fees. What you see is what you pay." },
            { emoji: "🤝", title: "Trust", desc: "Every vendor and venue is verified by our team." },
            { emoji: "🎯", title: "Excellence", desc: "We settle for nothing less than a perfect experience." }
          ].map((val, idx) => (
            <motion.div
              key={idx}
              variants={staggerItem}
              className="bg-[#5C614D]/5 rounded-2xl p-8 border border-[#5C614D]/10 text-center flex flex-col items-center transition-all duration-300 hover:bg-[#5C614D]/8"
            >
              <span className="text-4xl mb-4" role="img" aria-label={val.title}>
                {val.emoji}
              </span>
              <h3 className="font-serif text-lg font-bold text-[#2d2d2d] mb-2.5">
                {val.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed max-w-xs">
                {val.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 9 — Contact / CTA Section */}
      <section className="w-full bg-[#3d4134] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <motion.div 
            {...fadeUp}
            className="space-y-4"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white font-bold leading-tight">
              Have Questions? We're Here to Help
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto">
              Reach out to our team and we'll get back to you within 24 hours.
            </p>
          </motion.div>

          <motion.div 
            {...fadeUp}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2"
          >
            <button
              onClick={() => navigate("/discover")}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#3d4134] hover:bg-stone-100 rounded-full font-bold text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
            >
              Browse Venues
            </button>
            <button
              onClick={() => navigate("/complaints")}
              className="w-full sm:w-auto px-8 py-3.5 border-2 border-white/40 hover:border-white text-white bg-transparent rounded-full font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Contact Us
            </button>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
}
