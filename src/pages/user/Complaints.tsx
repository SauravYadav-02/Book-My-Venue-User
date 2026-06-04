import React, { useState, useEffect, useRef } from "react";
import { 
  getMyComplaints, 
  getComplaintById, 
  getComplaintMessages, 
  sendComplaintMessage, 
  submitComplaint,
  type Complaint,
  type ComplaintMessage
} from "../../services/complaintService";
import { getAllVenues } from "../../services/VenueUserservice ";
import { type Venue } from "../../types/venue.types";
import toast, { Toaster } from "react-hot-toast";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Paperclip, 
  AlertCircle, 
  X,
  FileText,
  ArrowLeft
} from "lucide-react";

export default function Complaints() {
  const userId = localStorage.getItem("userId") || "";
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<ComplaintMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  
  // Modals & Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch complaints list on load
  const fetchComplaints = async (silent = false) => {
    if (!userId) return;
    if (!silent) setListLoading(true);
    try {
      const data = await getMyComplaints(userId);
      setComplaints(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load complaints");
    } finally {
      if (!silent) setListLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // Load venues for dropdown selector
    getAllVenues()
      .then(setVenues)
      .catch(console.error);
  }, [userId]);

  // 2. Poll messages & status of the active complaint
  useEffect(() => {
    if (!selectedComplaint) {
      setMessages([]);
      return;
    }

    const pollData = async () => {
      try {
        // Fetch fresh complaint details to check status changes
        const updatedComp = await getComplaintById(userId, selectedComplaint._id);
        setSelectedComplaint(prev => {
          if (prev && prev.status !== updatedComp.status) {
            // Update in the main list too
            fetchComplaints(true);
            return updatedComp;
          }
          return prev;
        });

        // Fetch thread messages
        const msgs = await getComplaintMessages(userId, selectedComplaint._id);
        setMessages(msgs);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollData(); // run immediately

    const interval = setInterval(pollData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [selectedComplaint?._id]);

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Submit message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedComplaint) return;

    try {
      const msg = await sendComplaintMessage(userId, selectedComplaint._id, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  // 5. Submit Complaint Form
  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Please fill in Title and Description");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("description", formDescription);
      
      if (selectedVenueId) {
        formData.append("venue", selectedVenueId);
        // Find corresponding vendorId from venue state
        const venueObj = venues.find(v => v._id === selectedVenueId);
        if (venueObj && venueObj.vendorId) {
          // If vendorId is populated as object or string
          const vendorStr = typeof venueObj.vendorId === "object" ? (venueObj.vendorId as any)._id : venueObj.vendorId;
          if (vendorStr) formData.append("vendor", vendorStr);
        }
      }

      selectedFiles.forEach(file => {
        formData.append("attachments", file);
      });

      await submitComplaint(userId, formData);
      toast.success("Complaint submitted successfully!");
      
      // Reset form
      setFormTitle("");
      setFormDescription("");
      setSelectedVenueId("");
      setSelectedFiles([]);
      setShowCreateModal(false);

      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // UI status style helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Closed":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-stone-50/50 p-4 sm:p-6 lg:p-8 pt-32 font-sans">
      <Toaster />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-800 tracking-tight">Support & Complaints</h1>
          <p className="text-sm text-stone-500 mt-1">Raise support requests, report service issues, and chat with vendors.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#5C614D] hover:bg-[#4C5040] text-white px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95 mt-2"
        >
          <Plus size={16} />
          File New Complaint
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden min-h-[500px]">
        
        {/* Left Side: Complaints List */}
        <div className={`lg:col-span-4 border-r border-stone-200 flex flex-col h-full ${selectedComplaint ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 border-b border-stone-100 bg-stone-50/30">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Your Complaints</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 max-h-[600px]">
            {listLoading ? (
              <div className="p-8 text-center text-stone-400 text-sm">Loading complaints list...</div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">No complaints raised yet. Click "File New Complaint" to get started.</div>
            ) : (
              complaints.map(comp => (
                <div
                  key={comp._id}
                  onClick={() => setSelectedComplaint(comp)}
                  className={`p-4 cursor-pointer transition-all hover:bg-stone-50/80 ${selectedComplaint?._id === comp._id ? "bg-stone-50" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-stone-800 text-sm line-clamp-1">{comp.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeClass(comp.status)}`}>
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-2">{comp.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-stone-400">
                    <span>Venue: {comp.venue?.name || "N/A"}</span>
                    <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Complaint Details & Live Chat Thread */}
        <div className={`lg:col-span-8 flex flex-col h-full ${!selectedComplaint ? "hidden lg:flex items-center justify-center bg-stone-50/20" : "flex"}`}>
          {selectedComplaint ? (
            <div className="flex flex-col h-full min-h-[500px]">
              
              {/* Back Button for mobile / Header for detail */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/30">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedComplaint(null)}
                    className="lg:hidden p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="font-serif text-stone-800 text-base sm:text-lg line-clamp-1">{selectedComplaint.title}</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Raised on {new Date(selectedComplaint.createdAt).toLocaleDateString()} • Assigned Vendor: {selectedComplaint.vendor?.fullName || selectedComplaint.vendor?.businessName || "Unassigned"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBadgeClass(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>

              {/* Complaint Description & Attachments Box */}
              <div className="p-4 bg-stone-50/60 border-b border-stone-150 text-sm text-stone-700">
                <p className="leading-relaxed whitespace-pre-line">{selectedComplaint.description}</p>
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedComplaint.attachments.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-stone-400 text-stone-600 text-xs font-medium transition-all shadow-sm"
                      >
                        <FileText size={14} />
                        View Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px] bg-stone-50/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                    <MessageSquare size={36} className="mb-2 text-stone-300" />
                    <p className="text-sm">No messages in this support ticket yet.</p>
                    <p className="text-xs mt-1">Send a reply below to initiate conversation.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === userId;
                    return (
                      <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isOwn 
                            ? "bg-[#5C614D] text-white rounded-br-none" 
                            : "bg-white border border-stone-200/70 text-stone-800 rounded-bl-none"
                        }`}>
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isOwn ? "text-stone-300" : "text-stone-400"}`}>
                              {isOwn ? "You" : msg.senderName} ({msg.senderModel})
                            </span>
                            <span className={`text-[9px] ${isOwn ? "text-stone-400" : "text-stone-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t border-stone-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    disabled={selectedComplaint.status === "Closed"}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 disabled:bg-stone-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || selectedComplaint.status === "Closed"}
                    className="bg-[#5C614D] hover:bg-[#4C5040] disabled:bg-stone-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <Send size={16} />
                  </button>
                </form>
                {selectedComplaint.status === "Closed" && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> This complaint has been closed. Replying is disabled.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-stone-400">
              <MessageSquare size={48} className="mx-auto mb-3 text-stone-300" />
              <p className="text-base font-serif italic">No complaint selected</p>
              <p className="text-xs mt-1">Choose a ticket from the sidebar list or file a new one.</p>
            </div>
          )}
        </div>

      </div>

      {/* --- File New Complaint Modal --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50">
              <h2 className="text-lg font-serif text-stone-800">File New Support Ticket</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="p-6 space-y-4">
              
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Complaint Title <span className="text-stone-800">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the issue in a few words"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm text-stone-800 focus:border-stone-500"
                />
              </div>

              {/* Venue Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Associated Venue (Optional)</label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm text-stone-800 focus:border-stone-500 bg-white"
                >
                  <option value="">-- Select a Venue (Autolinks Vendor) --</option>
                  {venues.map(venue => (
                    <option key={venue._id} value={venue._id}>{venue.name} ({venue.city})</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Detailed Description <span className="text-stone-800">*</span></label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete details about the delay, cleanup quality, or vendor issue..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm text-stone-800 focus:border-stone-500 resize-none"
                />
              </div>

              {/* Attachments Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Add Attachments (JPG, PNG, PDF)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 border border-stone-200 bg-stone-50 hover:bg-stone-100/80 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 transition-all select-none">
                    <Paperclip size={14} />
                    Attach Files
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-stone-400">Attach photos or confirmation letters (Max 10MB each)</span>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-stone-50 border border-stone-100 rounded-lg p-2 text-xs text-stone-600">
                        <span className="truncate max-w-[85%]">{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#5C614D] hover:bg-[#4C5040] disabled:bg-stone-200 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold tracking-wide shadow-md active:scale-95 transition-all"
                >
                  {loading ? "Submitting..." : "Submit Complaint"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
