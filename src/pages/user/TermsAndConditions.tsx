import { useEffect, useState } from "react";
import { getActiveTerms, type TermsDocument } from "../../services/termsService";

// ─── Loading skeleton ────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Renders the plain-text content stored in DB ─────────────────────────────
function TermsContent({ content }: { content: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
      <pre
        className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-sans"
        style={{ fontFamily: "inherit" }}
      >
        {content}
      </pre>
    </div>
  );
}

export default function TermsAndConditions() {
  const [terms, setTerms] = useState<TermsDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getActiveTerms()
      .then((data) => {
        setTerms(data);
        setLoading(false);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          "No active Terms & Conditions found. Please check back later.";
        setError(msg);
        setLoading(false);
      });
  }, []);

  const formattedDate = terms
    ? new Date(terms.updatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#fdfcfb] w-full">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="w-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-20 px-6 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
          Legal
        </p>
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
          Terms &amp; Conditions
        </h1>
        <p className="text-gray-300 text-sm max-w-xl mx-auto">
          Please read these terms carefully before using Book My Venue. By
          accessing our platform, you agree to be bound by the following
          conditions.
        </p>

        {/* Version & date badge */}
        {terms && (
          <div className="mt-6 inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-xs text-gray-300">
            <span className="text-[#c9a96e] font-semibold">
              v{terms.version}
            </span>
            <span className="w-px h-3 bg-white/30" />
            <span>Last updated: {formattedDate}</span>
          </div>
        )}
      </div>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {loading && <Skeleton />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Content Unavailable
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">{error}</p>
          </div>
        )}

        {!loading && terms && <TermsContent content={terms.content} />}

        {/* Footer note */}
        {!loading && terms && (
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400">
              © 2026 Book My Venue. All rights reserved. These terms are subject
              to change. Version {terms.version}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
