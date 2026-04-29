import historicBarnImg from "../../../assets/historic_barn.png";
import urbanLoftImg from "../../../assets/urban_loft.png";
import secretGardenImg from "../../../assets/secret_garden.png";
import CollectionCard from "./Collectioncard"; // ← capital C in CollectionCard

const collections = [
    { image: historicBarnImg, title: "Historic Barns", venueCount: 12 },
    { image: urbanLoftImg, title: "Modern Lofts", venueCount: 8 },
    { image: secretGardenImg, title: "Secret Gardens", venueCount: 15 },
];

export default function CuratedCollectionsSection() {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-24 text-center">
            <h2 className="text-4xl font-serif text-brand-text mb-4">Curated Collections</h2>
            <p className="text-gray-500 mb-12">Explore our handpicked selections for every mood and occasion.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((c) => (
                    <CollectionCard key={c.title} {...c} />
                ))}
            </div>
        </section>
    );
}