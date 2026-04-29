// import { Search, ChevronDown, Filter } from "lucide-react";
// import VenueCard from "../../components/user/VenueCard";

// // Images from generation
// import historicBarnImg from "../../assets/historic_barn.png";
// import urbanLoftImg from "../../assets/urban_loft.png";
// import secretGardenImg from "../../assets/secret_garden.png";
// import philosophyDiningImg from "../../assets/philosophy_dining.png";

// export default function Home() {
//   return (
//     <div className="w-full flex flex-col items-center">

//       {/* Hero Section */}
//       <section className="w-full max-w-5xl mx-auto px-6 pt-36 md:pt-48 pb-20 flex flex-col items-center text-center">
//         <h1 className="text-5xl md:text-[5rem] font-medium text-[#2d2d2d] tracking-tight mb-2 leading-[1.1]">
//           Find a space that feels like<br /> home.
//         </h1>
//         <p className="text-gray-500 text-lg md:text-xl mb-12 max-w-2xl">
//           Bespoke venues for weddings, retreats, and creative gatherings.
//         </p>

//         {/* Floating Search Bar */}
//         <div className="bg-white rounded-[2rem] md:rounded-full p-4 md:p-2.5 md:pl-8 flex flex-col md:flex-row items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full max-w-3xl border border-gray-100 gap-4 md:gap-0">
//           <div className="w-full md:flex-1 flex flex-col text-left px-2 md:px-0 pr-0 md:pr-4">
//             <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Location</span>
//             <input
//               type="text"
//               placeholder="Where are you going?"
//               className="text-sm outline-none text-brand-text placeholder:text-gray-300 w-full bg-transparent font-medium"
//             />
//           </div>
//           <div className="hidden md:block w-[1px] h-10 bg-gray-200 mx-2"></div>
//           <div className="md:hidden w-full h-[1px] bg-gray-100"></div>
//           <div className="w-full md:flex-1 flex flex-col text-left px-2 md:px-0 pl-0 md:pl-6 pr-0 md:pr-4">
//             <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Guests</span>
//             <input
//               type="text"
//               placeholder="120 - 200 People"
//               className="text-sm outline-none text-brand-text placeholder:text-gray-300 w-full bg-transparent font-medium"
//             />
//           </div>
//           <button className="bg-[#5C614D] text-white w-full md:w-12 h-12 rounded-xl md:rounded-full flex items-center justify-center hover:bg-[#4C5040] transition-colors shrink-0">
//             <Search size={18} className="hidden md:block" />
//             <span className="md:hidden font-medium">Search</span>
//           </button>
//         </div>
//       </section>

//       {/* Curation Section */}
//       <section className="w-full max-w-7xl mx-auto px-6 py-16">
//         <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-gray-200 pb-6 mb-10 text-center md:text-left">
//           <div>
//             <h2 className="text-3xl font-serif text-brand-text mb-2">Curation for April</h2>
//             <p className="text-gray-500 text-sm">Handpicked venues for your special occasions</p>
//           </div>

//           <div className="flex flex-wrap justify-center items-center gap-4 mt-6 md:mt-0 text-sm">
//             <div className="flex items-center gap-2">
//               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort By</span>
//               <div className="relative flex items-center">
//                 <select className="border border-gray-200 rounded-full pl-4 pr-8 py-1.5 bg-white text-gray-700 outline-none appearance-none cursor-pointer text-sm">
//                   <option>newest</option>
//                   <option>price: low to high</option>
//                 </select>
//                 <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</span>
//               <div className="relative flex items-center">
//                 <select className="border border-gray-200 rounded-full pl-4 pr-8 py-1.5 bg-white text-gray-700 outline-none appearance-none cursor-pointer text-sm">
//                   <option>all</option>
//                   <option>boutique</option>
//                 </select>
//                 <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
//               </div>
//             </div>

//             <button className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm">
//               <Filter size={14} className="text-gray-500" />
//               Amenities
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           <VenueCard
//             image={historicBarnImg}
//             type="BOUTIQUE"
//             price="$250"
//             name="The Oak Barn"
//             location="Cotswolds, UK"
//             capacity="150 cap."
//             rating="4.8"
//           />
//           <VenueCard
//             image={urbanLoftImg}
//             type="BOUTIQUE"
//             price="$180"
//             name="Urban Loft Studio"
//             location="London, UK"
//             capacity="80 cap."
//             rating="4.5"
//           />
//           <VenueCard
//             image={secretGardenImg}
//             type="GRAND HALL"
//             price="$450"
//             name="Secret Garden Estate"
//             location="Surrey, UK"
//             capacity="300 cap."
//             rating="4.9"
//           />
//         </div>
//       </section>



//       {/* Curated Collections Section */}
//       <section className="w-full max-w-7xl mx-auto px-6 py-24 text-center">
//         <h2 className="text-4xl font-serif text-brand-text mb-4">Curated Collections</h2>
//         <p className="text-gray-500 mb-12">Explore our handpicked selections for every mood and occasion.</p>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
//             <img src={historicBarnImg} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Historic Barns" />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
//               <h3 className="text-2xl font-serif text-white mb-1">Historic Barns</h3>
//               <p className="text-white/80 text-xs font-bold tracking-widest uppercase">12 Venues</p>
//             </div>
//           </div>

//           <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
//             <img src={urbanLoftImg} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Modern Lofts" />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
//               <h3 className="text-2xl font-serif text-white mb-1">Modern Lofts</h3>
//               <p className="text-white/80 text-xs font-bold tracking-widest uppercase">8 Venues</p>
//             </div>
//           </div>

//           <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
//             <img src={secretGardenImg} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Secret Gardens" />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
//               <h3 className="text-2xl font-serif text-white mb-1">Secret Gardens</h3>
//               <p className="text-white/80 text-xs font-bold tracking-widest uppercase">15 Venues</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Philosophy Section */}
//       <section className="w-full max-w-7xl mx-auto px-6 py-24">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

//           {/* Left: Image & Floating Card */}
//           <div className="relative pr-6 pb-12 w-full lg:w-11/12 mx-auto lg:mx-0">
//             <img
//               src={philosophyDiningImg}
//               alt="Dining Experience"
//               className="w-full h-[500px] lg:h-[650px] object-cover rounded-[2.5rem]"
//             />
//             <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-[#F7F6F2] p-10 md:p-12 rounded-[2.5rem] shadow-2xl w-72 md:w-80">
//               <h3 className="text-5xl md:text-6xl font-serif text-[#5C614D] mb-4">10k+</h3>
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 Successful events hosted through our curation.
//               </p>
//             </div>
//           </div>

//           {/* Right: Text Content */}
//           <div className="flex flex-col">
//             <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-6">Our Philosophy</span>
//             <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-text leading-[1.1] mb-8">
//               We believe every space tells a story.
//             </h2>
//             <p className="text-gray-500 text-lg leading-relaxed mb-12">
//               Book My Venue was born from a simple idea: that the right space can transform an ordinary gathering into an extraordinary memory. We don't just list venues; we curate experiences.
//             </p>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
//               <div>
//                 <h4 className="text-lg font-serif text-brand-text mb-3">Handpicked</h4>
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   Every venue is personally vetted for quality, style, and soul.
//                 </p>
//               </div>
//               <div>
//                 <h4 className="text-lg font-serif text-brand-text mb-3">Seamless</h4>
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   Our tools make planning and booking as effortless as the event itself.
//                 </p>
//               </div>
//             </div>

//             <div>
//               <button className="bg-[#5C614D] hover:bg-[#4C5040] text-[#F7F6F2] px-8 py-4 rounded-xl font-medium transition-colors shadow-sm">
//                 Learn More About Us
//               </button>
//             </div>
//           </div>

//         </div>
//       </section>


//     </div>
//   );
// }





import CurationSection from "./home_page_componets/Curationsection";
import CuratedCollectionsSection from "./home_page_componets/Curatedcollectionssection";
import PhilosophySection from "./home_page_componets/Philosophysection";
import HeroSection from "./home_page_componets/Herosection";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <HeroSection />
      <CurationSection />
      <CuratedCollectionsSection />
      <PhilosophySection />
    </div>
  );
}