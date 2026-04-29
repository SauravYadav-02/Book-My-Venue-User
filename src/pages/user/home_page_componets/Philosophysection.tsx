import philosophyDiningImg from "../../../assets/philosophy_dining.png";

const pillars = [
    {
        title: "Handpicked",
        description: "Every venue is personally vetted for quality, style, and soul.",
    },
    {
        title: "Seamless",
        description: "Our tools make planning and booking as effortless as the event itself.",
    },
];

export default function PhilosophySection() {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* Left: Image & Floating Card */}
                <div className="relative pr-6 pb-12 w-full lg:w-11/12 mx-auto lg:mx-0">
                    <img
                        src={philosophyDiningImg}
                        alt="Dining Experience"
                        className="w-full h-[500px] lg:h-[650px] object-cover rounded-[2.5rem]"
                    />
                    <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-[#F7F6F2] p-10 md:p-12 rounded-[2.5rem] shadow-2xl w-72 md:w-80">
                        <h3 className="text-5xl md:text-6xl font-serif text-[#5C614D] mb-4">10k+</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Successful events hosted through our curation.
                        </p>
                    </div>
                </div>

                {/* Right: Text Content */}
                <div className="flex flex-col">
                    <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-6">Our Philosophy</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-text leading-[1.1] mb-8">
                        We believe every space tells a story.
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-12">
                        Book My Venue was born from a simple idea: that the right space can transform an ordinary gathering into an extraordinary memory. We don't just list venues; we curate experiences.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                        {pillars.map((p) => (
                            <div key={p.title}>
                                <h4 className="text-lg font-serif text-brand-text mb-3">{p.title}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
                            </div>
                        ))}
                    </div>

                    <div>
                        <button className="bg-[#5C614D] hover:bg-[#4C5040] text-[#F7F6F2] px-8 py-4 rounded-xl font-medium transition-colors shadow-sm">
                            Learn More About Us
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}