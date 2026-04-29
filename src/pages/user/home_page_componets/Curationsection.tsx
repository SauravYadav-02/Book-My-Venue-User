import { ChevronDown, Filter } from "lucide-react";


import historicBarnImg from "../../../assets/historic_barn.png";
import urbanLoftImg from "../../../assets/urban_loft.png";
import secretGardenImg from "../../../assets/secret_garden.png";
import VenueCard from "../../../components/user/VenueCard";

export default function CurationSection() {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-gray-200 pb-6 mb-10 text-center md:text-left">
                <div>
                    <h2 className="text-3xl font-serif text-brand-text mb-2">Curation for April</h2>
                    <p className="text-gray-500 text-sm">Handpicked venues for your special occasions</p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4 mt-6 md:mt-0 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort By</span>
                        <div className="relative flex items-center">
                            <select className="border border-gray-200 rounded-full pl-4 pr-8 py-1.5 bg-white text-gray-700 outline-none appearance-none cursor-pointer text-sm">
                                <option>newest</option>
                                <option>price: low to high</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</span>
                        <div className="relative flex items-center">
                            <select className="border border-gray-200 rounded-full pl-4 pr-8 py-1.5 bg-white text-gray-700 outline-none appearance-none cursor-pointer text-sm">
                                <option>all</option>
                                <option>boutique</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <button className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                        <Filter size={14} className="text-gray-500" />
                        Amenities
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <VenueCard
                    image={historicBarnImg}
                    type="BOUTIQUE"
                    price="$250"
                    name="The Oak Barn"
                    location="Cotswolds, UK"
                    capacity="150 cap."
                    rating="4.8"
                />
                <VenueCard
                    image={urbanLoftImg}
                    type="BOUTIQUE"
                    price="$180"
                    name="Urban Loft Studio"
                    location="London, UK"
                    capacity="80 cap."
                    rating="4.5"
                />
                <VenueCard
                    image={secretGardenImg}
                    type="GRAND HALL"
                    price="$450"
                    name="Secret Garden Estate"
                    location="Surrey, UK"
                    capacity="300 cap."
                    rating="4.9"
                />
            </div>
        </section>
    );
}