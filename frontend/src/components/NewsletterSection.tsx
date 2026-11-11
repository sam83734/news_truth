import React, { useState } from 'react';
import { subscribeNewsletter } from '../api/client';
import { CheckCircle2, Mail, Send } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const msg = await subscribeNewsletter(email);
      setStatusMessage(msg || 'Thank you for subscribing to NextTruth Dispatch alerts!');
      setEmail('');
    } catch (err: any) {
      setStatusMessage(err?.message || 'Subscription processed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Precision recreation of the Newsletter block from the Dribbble design reference */}
      <div
        className="rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #E86328 100%)',
        }}
      >
        <div className="max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
              <Mail className="w-4 h-4 text-white" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-amber-100">
              SusaLabs Truth Bulletin
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Newsletter
          </h3>
          <p className="mt-1 text-sm sm:text-base text-amber-50/90 font-normal">
            Be the first to know about breaking ground investigations, whistleblower proofs, and DLT truth dispatches.
          </p>

          {statusMessage && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-neutral-900 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Pill Input Container matching Dribbble reference */}
        <form onSubmit={handleSubmit} className="w-full md:w-auto">
          <div className="flex items-center bg-white rounded-full p-1.5 pl-5 shadow-2xl max-w-md mx-auto md:mx-0 w-full md:w-96">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-xs sm:text-sm text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              <span>{submitting ? '...' : 'Submit'}</span>
              <Send className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

