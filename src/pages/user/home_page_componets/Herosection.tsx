import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const images = [
    "/images/hero/wedding.png",
    "/images/hero/retreat.png",
    "/images/hero/creative.png",
];

export default function HeroSection() {
    const [currentImage, setCurrentImage] = useState(0);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 1.2,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 1.1,
        }),
    };

    const textVariants = {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.1,
                duration: 0.8,
                ease: [0.2, 0.65, 0.3, 0.9],
            },
        }),
    };

    const sentence = "Find a space that feels like home.";
    const words = sentence.split(" ");

    return (
        <section className="relative w-full min-h-screen md:min-h-[95vh] flex flex-col items-center justify-center text-center overflow-hidden bg-black">
            {/* Background Image Slider with Ken Burns & Slide Effect */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentImage}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.8 },
                            scale: { duration: 6, ease: "linear" }, // Ken Burns Effect
                        }}
                        className="absolute inset-0"
                    >
                        <motion.img
                            src={images[currentImage]}
                            alt="Hero Background"
                            className="w-full h-full object-cover"
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 6, ease: "easeOut" }}
                        />
                        {/* Refined Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">
                <h1 className="text-5xl md:text-[6rem] font-medium text-white tracking-tighter mb-6 leading-[1] drop-shadow-2xl flex flex-wrap justify-center gap-x-4">
                    {words.map((word, i) => (
                        <motion.span
                            key={i}
                            custom={i}
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                            className="inline-block"
                        >
                            {word}
                        </motion.span>
                    ))}
                </h1>

                <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="text-gray-200 text-lg md:text-2xl mb-14 max-w-2xl font-light tracking-widest uppercase opacity-80"
                >
                    Exquisite Venues • Memorable Moments
                </motion.p>

                {/* Grounded Search Bar with Hover Effects */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 3] }}
                    className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-4 md:p-4 flex flex-col md:flex-row items-center shadow-[0_30px_100px_rgba(0,0,0,0.5)] w-full max-w-4xl border border-white/20 gap-4 md:gap-0"
                >
                    <div className="w-full md:flex-[1.5] flex flex-col text-left px-6 py-2 group cursor-pointer hover:bg-white/5 rounded-3xl transition-all">
                        <span className="text-[11px] font-bold text-white/60 tracking-[0.2em] uppercase mb-1">Location</span>
                        <input
                            type="text"
                            placeholder="Where are you going?"
                            className="text-lg outline-none text-white placeholder:text-white/40 w-full bg-transparent font-light"
                        />
                    </div>

                    <div className="hidden md:block w-px h-12 bg-white/20 mx-4"></div>

                    <div className="w-full md:flex-1 flex flex-col text-left px-6 py-2 group cursor-pointer hover:bg-white/5 rounded-3xl transition-all">
                        <span className="text-[11px] font-bold text-white/60 tracking-[0.2em] uppercase mb-1">Guests</span>
                        <input
                            type="text"
                            placeholder="Set capacity"
                            className="text-lg outline-none text-white placeholder:text-white/40 w-full bg-transparent font-light"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-black w-full md:w-auto md:px-14 h-16 md:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl shrink-0 group"
                    >
                        <Search size={22} className="mr-3 transition-transform group-hover:rotate-12" />
                        <span className="font-bold text-lg tracking-tight">Search Now</span>
                    </motion.button>
                </motion.div>

                {/* Progress-based Indicators */}
                <div className="absolute bottom-12 flex gap-4">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className="relative h-1 w-12 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                            onClick={() => {
                                setDirection(index > currentImage ? 1 : -1);
                                setCurrentImage(index);
                            }}
                        >
                            {currentImage === index && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 6, ease: "linear" }}
                                    className="absolute inset-0 bg-white"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

