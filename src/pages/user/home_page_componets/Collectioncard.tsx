interface CollectionCardProps {
    image: string;
    title: string;
    venueCount: number;
    alt?: string;
}

export default function CollectionCard({ image, title, venueCount, alt }: CollectionCardProps) {
    return (
        <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
            <img
                src={image}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={alt || title}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                <h3 className="text-2xl font-serif text-white mb-1">{title}</h3>
                <p className="text-white/80 text-xs font-bold tracking-widest uppercase">{venueCount} Venues</p>
            </div>
        </div>
    );
}