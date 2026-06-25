import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Send, 
  ChevronDown, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { getUserById } from "../../services/userService";
import { submitContactMessage } from "../../services/contactService";

interface FaqItem {
  question: string;
  answer: string;
}

export default function ContactUs() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (userId && userId !== "undefined" && userId !== "null") {
      getUserById(userId)
        .then((user) => {
          if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
          }
        })
        .catch((err) => {
          console.error("Failed to load user details", err);
        });
    }
  }, [userId]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setMessage(val);
    }
  };

  const handleSubmit = async () => {
    // Validations
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanUserId = (userId && userId !== "undefined" && userId !== "null") ? userId : null;
      await submitContactMessage(cleanUserId, {
        name,
        email,
        subject,
        category,
        message
      });
      
      setIsSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubject("");
    setCategory("General Inquiry");
    setMessage("");
    setIsSubmitted(false);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs: FaqItem[] = [
    {
      question: "How do I book a venue?",
      answer: "Browse venues on our Discover page, select your preferred venue, choose your date and time slot, and pay 20% upfront to confirm your booking."
    },
    {
      question: "What is the cancellation policy?",
      answer: "You can cancel more than 45 days before your event for a full refund (minus deposit). 30–45 days: 50% refund. 15–30 days: 25% refund. Less than 15 days: no refund."
    },
    {
      question: "How do I pay the remaining balance?",
      answer: "The remaining 80% can be paid via cash, cheque, or online through your Transactions page before or on the event day."
    },
    {
      question: "Can I leave a review?",
      answer: "Yes! After your event date has passed, you can leave a review on the venue's detail page."
    },
    {
      question: "How do I become a venue partner?",
      answer: "Register as a vendor on our platform, complete your profile, and list your venues. Our team will review and approve your listing."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes. All online payments are processed securely. We never store your payment details."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F7F6F2] pt-28 text-[#2d2d2d] overflow-x-hidden">
      
      {/* SECTION 1 — Hero */}
      <section className="relative w-full min-h-[40vh] flex flex-col justify-center items-center text-center px-6 py-16 bg-gradient-to-br from-[#3d4134] via-[#5C614D] to-[#8A8F78] text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-4"
        >
          <span className="text-xs font-bold tracking-[0.25em] text-white/70 uppercase">
            GET IN TOUCH
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold leading-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed">
            Have a question, feedback or need help? Our team is here for you.
          </p>
        </motion.div>
      </section>

      {/* SECTION 2 — Contact Info Cards */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center space-y-4 transition-all duration-300 hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#5C614D]/10 text-[#5C614D] flex items-center justify-center">
              <MapPin size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2d2d2d]">Our Office</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              123 Venue Street, Valsad, Gujarat 396001, India
            </p>
          </div>

          {/* Card 2 - Email */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center space-y-4 transition-all duration-300 hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#5C614D]/10 text-[#5C614D] flex items-center justify-center">
              <Mail size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2d2d2d]">Email Us</h3>
            <p className="text-gray-800 text-sm font-semibold">
              support@bookmyvenue.in
            </p>
            <p className="text-gray-400 text-xs">
              We reply within 24 hours
            </p>
          </div>

          {/* Card 3 - Phone */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center space-y-4 transition-all duration-300 hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#5C614D]/10 text-[#5C614D] flex items-center justify-center">
              <Phone size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2d2d2d]">Call Us</h3>
            <p className="text-gray-800 text-sm font-semibold">
              +91 98765 43210
            </p>
            <p className="text-gray-400 text-xs">
              Mon–Sat, 9am to 6pm IST
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Contact Form + FAQ Side by Side */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left - Contact Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-150/40">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#2d2d2d]">Send Us a Message</h2>
                    <p className="text-gray-400 text-xs mt-1">We value your inquiries and look forward to connecting.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name *</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C614D]/20 focus:border-[#5C614D] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address *</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C614D]/20 focus:border-[#5C614D] transition-all"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject / Title *</label>
                      <input 
                        type="text" 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="What is this inquiry about?"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C614D]/20 focus:border-[#5C614D] transition-all"
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category *</label>
                      <div className="relative">
                        <select 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C614D]/20 focus:border-[#5C614D] transition-all appearance-none cursor-pointer text-[#2d2d2d]"
                        >
                          <option>General Inquiry</option>
                          <option>Booking Issue</option>
                          <option>Venue Problem</option>
                          <option>Payment Issue</option>
                          <option>Account Support</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Message *</label>
                        <span className="text-[10px] font-semibold text-gray-400">{message.length}/500</span>
                      </div>
                      <textarea 
                        value={message} 
                        onChange={handleMessageChange}
                        placeholder="Type your message here..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C614D]/20 focus:border-[#5C614D] transition-all min-h-32 resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="w-full py-3.5 bg-[#5C614D] hover:bg-[#4C5040] disabled:bg-[#8A8F78] text-white rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 px-4 text-center flex flex-col items-center space-y-6"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-[#2d2d2d]">Message sent!</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                      We'll get back to you within 24 hours. Your inquiry has been logged in our system.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right - FAQ Accordion */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#2d2d2d]">Frequently Asked Questions</h2>
            
            <div className="divide-y divide-stone-200/50">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left font-serif font-bold text-base text-[#2d2d2d] py-2 cursor-pointer focus:outline-none group hover:text-[#5C614D] transition-colors"
                    >
                      <span>{faq.question}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-stone-400 group-hover:text-[#5C614D] transition-colors shrink-0 ml-4"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-500 text-sm pb-4 pt-2 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </section>

      {/* SECTION 4 — Map Placeholder */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="w-full h-64 bg-[#5C614D]/10 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 border border-[#5C614D]/10 shadow-inner">
          <div className="w-14 h-14 rounded-full bg-[#5C614D] text-white flex items-center justify-center shadow-md">
            <MapPin size={28} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-[#2d2d2d]">Valsad, Gujarat, India</h4>
            <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-sm mx-auto">
              Visit us or reach out online — we're always happy to help
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Bottom CTA */}
      <section className="w-full bg-[#3d4134] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-serif text-3xl text-white font-bold leading-tight">
            Still Have Questions?
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-md mx-auto">
            Check out our complaints section for faster resolution
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate("/complaints")}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#3d4134] hover:bg-stone-100 rounded-full font-bold text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
            >
              Go to Complaints
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
