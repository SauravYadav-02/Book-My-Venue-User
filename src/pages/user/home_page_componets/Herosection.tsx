import { Search } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="w-full max-w-5xl mx-auto px-6 pt-36 md:pt-48 pb-20 flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-[5rem] font-medium text-[#2d2d2d] tracking-tight mb-2 leading-[1.1]">
                Find a space that feels like<br /> home.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl mb-12 max-w-2xl">
                Bespoke venues for weddings, retreats, and creative gatherings.
            </p>

            {/* Floating Search Bar */}
            <div className="bg-white rounded-[2rem] md:rounded-full p-4 md:p-2.5 md:pl-8 flex flex-col md:flex-row items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full max-w-3xl border border-gray-100 gap-4 md:gap-0">
                <div className="w-full md:flex-1 flex flex-col text-left px-2 md:px-0 pr-0 md:pr-4">
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Location</span>
                    <input
                        type="text"
                        placeholder="Where are you going?"
                        className="text-sm outline-none text-brand-text placeholder:text-gray-300 w-full bg-transparent font-medium"
                    />
                </div>
                <div className="hidden md:block w-px h-10 bg-gray-200 mx-2"></div>
                <div className="md:hidden w-full h-px bg-gray-100"></div>
                <div className="w-full md:flex-1 flex flex-col text-left px-2 md:px-0 pl-0 md:pl-6 pr-0 md:pr-4">
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Guests</span>
                    <input
                        type="text"
                        placeholder="120 - 200 People"
                        className="text-sm outline-none text-brand-text placeholder:text-gray-300 w-full bg-transparent font-medium"
                    />
                </div>
                <button className="bg-[#5C614D] text-white w-full md:w-12 h-12 rounded-xl md:rounded-full flex items-center justify-center hover:bg-[#4C5040] transition-colors shrink-0">
                    <Search size={18} className="hidden md:block" />
                    <span className="md:hidden font-medium">Search</span>
                </button>
            </div>
        </section>
    );
}