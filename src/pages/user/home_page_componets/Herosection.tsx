import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
const images = [
    "/images/hero/wedding_bg.png",
    "/images/hero/birthday_bg.png",
    "/images/hero/rooftop_bg.png",
    "/images/hero/anniversary_bg.png",
];

export default function HeroSection() {
    const [slideIndex, setSlideIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

    const currentImage = Math.abs(slideIndex % images.length);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setSlideIndex((prev) => prev + 1);
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

    const textVariants: any = {
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

    const sentence = "Find the space that feels like home.";
    const words = sentence.split(" ");

    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-end text-center overflow-hidden bg-black pb-20">
            {/* Background Image Slider with Ken Burns & Slide Effect */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence custom={direction}>
                    <motion.div
                        key={slideIndex}
                        custom={direction}
                        variants={variants}
                        initial={slideIndex === 0 ? { opacity: 0, scale: 1.2, x: 0 } : "enter"}
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

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight drop-shadow-md flex flex-wrap justify-center gap-x-3 mb-2 leading-[1.2]">
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
                        className="text-stone-300 text-xs md:text-sm tracking-[0.25em] uppercase font-light opacity-90 max-w-2xl"
                    >
                        Exquisite Venues • Memorable Moments
                    </motion.p>
                </div>


            </div>
        </section>
    );
}

