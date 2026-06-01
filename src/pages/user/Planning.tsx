import { useState, useEffect } from "react";
import { 
  CheckCircle2, Circle, Trash2, Plus, Calendar, 
  Sparkles, ClipboardList, CheckSquare, PlusCircle,
  CreditCard, MapPin, Clock, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

interface Todo {
  _id?: string;
  id?: string;
  text: string;
  category: string;
  type: "task" | "payment" | "booking" | "appointment";
  completed: boolean;
  dueDate?: string;
  amount?: number;
  location?: string;
}

interface CustomCategory {
  _id: string;
  value: string;
  label: string;
  color: string;
}

interface Category {
  value: string;
  label: string;
  color: string;
  isCustom?: boolean;
  _id?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { value: "all", label: "All Tasks", color: "bg-stone-500" },
  { value: "venue", label: "Venue & Space", color: "bg-emerald-500" },
  { value: "catering", label: "Catering & Food", color: "bg-amber-500" },
  { value: "guests", label: "Guests & Invitations", color: "bg-blue-500" },
  { value: "outfits", label: "Outfits & Apparel", color: "bg-pink-500" },
  { value: "photography", label: "Media & Decor", color: "bg-indigo-500" },
  { value: "other", label: "Other Tasks", color: "bg-stone-400" }
];

const COLOR_CHOICES = [
  { value: "bg-emerald-500", label: "Green" },
  { value: "bg-amber-500", label: "Amber" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-rose-500", label: "Rose" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-cyan-500", label: "Cyan" }
];

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem("userId");
  return {
    headers: {
      "Content-Type": "application/json",
      userid: token || "",
    },
  };
};

export default function Planning() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");
  
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("venue");
  const [newType, setNewType] = useState<"task" | "payment" | "booking" | "appointment">("task");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newLocation, setNewLocation] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // States for Category Creation Form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("bg-emerald-500");

  // Load from Backend API
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId || userId === "undefined" || userId === "null") {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = getHeaders();
        const [todosRes, catsRes] = await Promise.all([
          axios.get("http://localhost:3000/todos", headers),
          axios.get("http://localhost:3000/todos/categories", headers)
        ]);
        setTodos(todosRes.data);
        setCustomCategories(catsRes.data);
      } catch (err) {
        console.error("Error fetching planner data:", err);
        toast.error("Failed to load your planning details. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    const payload: Partial<Todo> = {
      text: newText.trim(),
      category: newCategory,
      type: newType,
      dueDate: newDueDate || undefined,
      amount: newType === "payment" ? Number(newAmount) || 0 : undefined,
      location: (newType === "booking" || newType === "appointment") ? newLocation.trim() || undefined : undefined
    };

    try {
      const res = await axios.post("http://localhost:3000/todos", payload, getHeaders());
      setTodos(prev => [res.data, ...prev]);
      
      // Reset form
      setNewText("");
      setNewDueDate("");
      setNewAmount("");
      setNewLocation("");
      setShowAddForm(false);
      toast.success("Task added to checklist! 📝");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  const toggleTodo = async (id: string, currentCompleted: boolean) => {
    // Optimistic update
    setTodos(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, completed: !currentCompleted } : t));
    
    try {
      await axios.put(`http://localhost:3000/todos/${id}`, { completed: !currentCompleted }, getHeaders());
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
      // Rollback
      setTodos(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, completed: currentCompleted } : t));
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/todos/${id}`, getHeaders());
      setTodos(prev => prev.filter(t => t._id !== id && t.id !== id));
      toast.success("Task removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove task");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const value = catName.trim().toLowerCase().replace(/\s+/g, "-");
    const payload = {
      value,
      label: catName.trim(),
      color: catColor
    };

    try {
      const res = await axios.post("http://localhost:3000/todos/categories", payload, getHeaders());
      setCustomCategories(prev => [...prev, res.data]);
      setNewCategory(value); // Automatically select newly created category
      setCatName("");
      setShowCategoryForm(false);
      toast.success("Custom category created! 🏷️");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string, value: string) => {
    if (!window.confirm("Are you sure you want to delete this custom category? All tasks inside will be set to 'Other'.")) return;
    try {
      await axios.delete(`http://localhost:3000/todos/categories/${id}`, getHeaders());
      setCustomCategories(prev => prev.filter(c => c._id !== id));
      
      // Update todos that belong to this category to 'other' locally
      setTodos(prev => prev.map(t => t.category === value ? { ...t, category: "other" } : t));
      
      if (activeCategory === value) {
        setActiveCategory("all");
      }
      toast.success("Category deleted");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  // Combine default and custom categories
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map(cat => ({
      value: cat.value,
      label: cat.label,
      color: cat.color,
      isCustom: true,
      _id: cat._id
    }))
  ];

  // Calculations
  const filteredTodos = todos.filter(t => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesType = activeType === "all" || t.type === activeType;
    return matchesCategory && matchesType;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] py-20 px-6 md:px-10 lg:px-20 font-sans w-full flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-gray-150 shadow-md space-y-6">
          <div className="w-16 h-16 bg-[#5C614D]/10 rounded-full flex items-center justify-center mx-auto text-[#5C614D]">
            <CheckSquare size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-[#2d2d2d]">Checklist Planning</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Please sign in to start organizing your venues, payments, bookings, and custom event checklists.
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/login"}
            className="w-full bg-[#5C614D] hover:bg-[#4C5040] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            Sign In to Your Account
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] py-20 px-6 md:px-10 lg:px-20 font-sans w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#5C614D]/30 border-t-[#5C614D] rounded-full animate-spin"></div>
          <p className="text-[#5C614D] text-sm font-semibold tracking-wide font-sans">Loading checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] py-20 px-6 md:px-10 lg:px-20 font-sans w-full flex flex-col items-center">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl w-full mt-10 space-y-10">
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <span className="h-px w-8 bg-[#5C614D]"></span>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#5C614D] uppercase flex items-center gap-1.5">
                <Sparkles size={14} />
                Organize & Plan
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#2d2d2d] leading-tight">
              Event Checklist
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Plan your milestone moments without breaking a sweat. Track and update your progress dynamically.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="self-center md:self-auto bg-[#5C614D] hover:bg-[#4C5040] text-white px-6 py-3.5 rounded-2xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Add New Task
          </button>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#5C614D]/10 rounded-2xl flex items-center justify-center text-[#5C614D]">
              <ClipboardList size={30} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-[#2d2d2d]">Overall Completion</h2>
              <p className="text-gray-500 text-sm mt-1">{completedCount} of {totalCount} tasks completed</p>
            </div>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-2">
            <div className="flex justify-between text-sm font-bold text-[#2d2d2d]">
              <span>Progress Bar</span>
              <span>{completionRate}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#5C614D] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {allCategories.map(cat => (
              <div key={cat.value} className="relative group">
                <button
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide border transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.value
                      ? "bg-[#2d2d2d] text-white border-[#2d2d2d] shadow-sm"
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`}></span>
                  {cat.label}
                </button>
                
                {cat.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat._id!, cat.value);
                    }}
                    className="absolute -top-1 -right-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-full p-0.5 border border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Secondary Task Type Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 justify-center md:justify-start">
            <span className="font-bold uppercase tracking-wider text-[9px]">Filter Type:</span>
            {[
              { value: "all", label: "All Types" },
              { value: "task", label: "📝 Tasks" },
              { value: "payment", label: "💳 Payments" },
              { value: "booking", label: "🏨 Bookings" },
              { value: "appointment", label: "📅 Appointments" }
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setActiveType(t.value)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeType === t.value
                    ? "bg-[#5C614D]/15 text-[#5C614D] font-bold"
                    : "hover:text-gray-600 bg-white border border-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Todo Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAddTodo} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <h3 className="text-lg font-serif text-[#2d2d2d] flex items-center gap-2">
                  <PlusCircle size={18} className="text-[#5C614D]" />
                  Add a new checklist task
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Task Description */}
                  <div className="md:col-span-3 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Task Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Pay vendor deposit, review catering options..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#5C614D] focus:ring-1 focus:ring-[#5C614D] transition-all"
                    />
                  </div>

                  {/* Todo Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Todo Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none cursor-pointer focus:border-[#5C614D]"
                    >
                      <option value="task">📝 Task (General)</option>
                      <option value="payment">💳 Payment</option>
                      <option value="booking">🏨 Booking</option>
                      <option value="appointment">📅 Appointment</option>
                    </select>
                  </div>

                  {/* Category Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none cursor-pointer focus:border-[#5C614D]"
                    >
                      {allCategories.filter(c => c.value !== "all").map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#5C614D]"
                    />
                  </div>

                  {/* Conditional Payment Amount */}
                  {newType === "payment" && (
                    <div className="flex flex-col gap-1.5 md:col-span-3">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Payment Amount ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#5C614D]"
                      />
                    </div>
                  )}

                  {/* Conditional Booking / Appointment Details */}
                  {(newType === "booking" || newType === "appointment") && (
                    <div className="flex flex-col gap-1.5 md:col-span-3">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Location / Details</label>
                      <input
                        type="text"
                        placeholder={newType === "booking" ? "e.g. Grand Plaza Hotel" : "e.g. Caterer's Office / Zoom Call"}
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#5C614D]"
                      />
                    </div>
                  )}

                  <div className="md:col-span-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2">
                    {/* Add Custom Category Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(!showCategoryForm)}
                      className="text-xs font-semibold text-[#5C614D] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus size={14} />
                      Create Custom Category
                    </button>
                    
                    <button
                      type="submit"
                      className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer text-center"
                    >
                      Confirm Task
                    </button>
                  </div>
                </div>
              </form>

              {/* Dynamic Category Creation panel */}
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 mt-4 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-serif text-[#2d2d2d] flex items-center gap-2">
                      <PlusCircle size={16} className="text-[#5C614D]" />
                      Create New Custom Category
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setShowCategoryForm(false)} 
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Category Label Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Transportation, DJ & Sound"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#5C614D]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="w-full bg-[#2d2d2d] hover:bg-black text-white py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                      >
                        Create Category Label
                      </button>
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Label Color Theme</label>
                    <div className="flex gap-2.5 flex-wrap">
                      {COLOR_CHOICES.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCatColor(c.value)}
                          className={`w-6 h-6 rounded-full ${c.value} transition-transform cursor-pointer ${
                            catColor === c.value ? "ring-2 ring-offset-2 ring-[#5C614D] scale-110" : "hover:scale-105"
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Todo List */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => {
                const catInfo = allCategories.find(c => c.value === todo.category);
                const todoId = todo._id || todo.id || "";
                
                return (
                  <motion.div
                    key={todoId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 transition-all ${
                      todo.completed ? "bg-stone-50/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTodo(todoId, todo.completed)}
                        className={`shrink-0 transition-transform active:scale-90 cursor-pointer ${
                          todo.completed ? "text-[#5C614D]" : "text-gray-300 hover:text-[#5C614D]"
                        }`}
                      >
                        {todo.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold text-[#2d2d2d] leading-snug truncate ${
                          todo.completed ? "line-through text-gray-400" : ""
                        }`}>
                          {todo.text}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {catInfo && (
                            <span className="bg-[#5C614D]/5 text-[#5C614D] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className={`w-1 h-1 rounded-full ${catInfo.color}`}></span>
                              {catInfo.label}
                            </span>
                          )}

                          {/* Todo Type Badge */}
                          {todo.type === "payment" && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CreditCard size={10} />
                              Payment • ${todo.amount?.toFixed(2)}
                            </span>
                          )}
                          {todo.type === "booking" && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                              <MapPin size={10} />
                              Booking {todo.location ? `• ${todo.location}` : ""}
                            </span>
                          )}
                          {todo.type === "appointment" && (
                            <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock size={10} />
                              Appointment {todo.location ? `• ${todo.location}` : ""}
                            </span>
                          )}

                          {todo.dueDate && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Calendar size={11} />
                              Due: {new Date(todo.dueDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTodo(todoId)}
                      className="p-2 text-gray-300 hover:text-red-500 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <CheckSquare size={28} />
                </div>
                <h3 className="text-lg font-serif text-gray-700">No tasks in this category/type</h3>
                <p className="text-gray-400 text-sm mt-1">Select another filter or add a task to get started.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
