import { useState } from "react";
import { Bell, Search } from "lucide-react";

const Navbar: React.FC = () => {
    const [showProfileInfo, setShowProfileInfo] = useState(false);

    return (
        <header className="w-full bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 xl:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">

            {/* ── Left: Search & Title (Mobile) ───────────────────────── */}
            <div className="flex items-center gap-4 flex-1">
                <h1 className="font-semibold text-gray-800 tracking-tight text-lg md:text-xl hidden md:block">
                    Vendor Dashboard
                </h1>

                {/* Search Bar - hidden on mobile, visible on tablet+ */}
                {/* <div className="hidden sm:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-full max-w-sm ml-0 md:ml-8 transition-all focus-within:ring-2 focus-within:ring-primary-light/20 focus-within:border-primary-light">
                    <Search className="text-gray-400 mr-2" size={18} />
                    <input
                        type="text"
                        placeholder="Search venues, bookings..."
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
                    />
                </div> */}

                {/* Mobile Title - hides when searching */}
                <h1 className="font-semibold text-gray-800 tracking-tight text-lg md:hidden">
                    Dashboard
                </h1>
            </div>

            {/* ── Right: Bell + Profile ────────────────────────────────── */}
            <div className="flex items-center gap-3 md:gap-5 ml-4">

                <button className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
                    <Search className="text-gray-600" size={20} />
                </button>

                {/* Notification Bell */}
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
                    <Bell className="text-gray-600" size={20} />
                    {/* Unread dot */}
                    {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" /> */}
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                {/* ── Profile ────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 relative">
                    {/* Text info */}
                    <div className={`
                        flex flex-col text-right transition-all duration-200
                        ${showProfileInfo ? "absolute top-12 right-0 bg-white shadow-lg border border-gray-100 p-4 rounded-xl z-50 w-48 text-left" : "hidden"}
                        md:flex! md:relative! md:top-0! md:bg-transparent! md:shadow-none! md:border-none! md:p-0! md:w-auto! md:text-right!
                    `}>
                        <span className="font-medium text-gray-800 leading-tight text-sm">
                            Alexander Sterling
                        </span>
                        <span className="text-gray-500 font-medium leading-tight mt-0.5 text-xs">
                            Owner, Sterling Estates
                        </span>
                    </div>

                    {/* Avatar */}
                    <button
                        onClick={() => setShowProfileInfo((prev) => !prev)}
                        className="focus:outline-none shrink-0"
                        aria-label="Toggle profile info"
                    >
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="Alexander Sterling"
                            className="rounded-full object-cover ring-2 ring-transparent hover:ring-primary-light transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10 cursor-pointer"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;