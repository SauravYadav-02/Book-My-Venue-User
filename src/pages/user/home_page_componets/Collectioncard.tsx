import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CollectionCardProps {
    image: string;
    title: string;
    venueCount: number;
    alt?: string;
    index?: number;
}

export default function CollectionCard({ image, title, venueCount, alt, index = 0 }: CollectionCardProps) {
    const navigate = useNavigate();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate('/discover')}
            className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer"
        >
            <img
                src={image}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={alt || title}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                <h3 className="text-2xl font-serif text-white mb-1">{title}</h3>
                <p className="text-white/80 text-xs font-bold tracking-widest uppercase">{venueCount} Venues</p>
            </div>
        </motion.div>
    );
}