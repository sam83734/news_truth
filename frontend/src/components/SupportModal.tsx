import React, { useState } from 'react';
import { useApp } from '../context';
import { submitSupportTicket } from '../api/client';
import {
  X,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const SupportModal: React.FC = () => {
  const { isSupportModalOpen, openSupportModal } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('WHISTLEBLOWER_TIP');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isSupportModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Subject and detailed message are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setResultMsg(null);

    try {
      await submitSupportTicket({
        name: isAnonymous ? undefined : name,
        email: isAnonymous ? undefined : email,
        subject: subject.trim(),
        message: message.trim(),
        category,
        isAnonymous,
      });

      setResultMsg(
        isAnonymous
          ? 'Your tip has been securely encrypted and delivered to the investigative desk. No trace or metadata has been recorded.'
          : 'Support request received. Next Truth editorial desk will reply shortly.'
      );
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error transmitting request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl my-8 border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Whistleblower & User Support Desk
              </h3>
              <p className="text-xs text-neutral-400">
                Encrypted intake channel for reporting news suppression and civic tips
              </p>
            </div>
          </div>

          <button
            onClick={() => openSupportModal(false)}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
          {resultMsg ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900">Transmission Confirmed</h4>
              <p className="text-xs text-gray-600 max-w-md mx-auto">{resultMsg}</p>
              <button
                onClick={() => {
                  setResultMsg(null);
                  openSupportModal(false);
                }}
                className="px-6 py-2 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-amber-500 transition-all shadow"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Anonymous Toggle */}
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isAnonymous ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className={`w-4 h-4 ${isAnonymous ? 'text-amber-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      Zero-Knowledge Anonymous Whistleblower Mode
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Recommended when exposing corporate or political malpractice
                    </div>
                  </div>
                </div>
                <input type="checkbox" checked={isAnonymous} onChange={() => {}} className="rounded" />
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="WHISTLEBLOWER_TIP">Whistleblower Tip & Ground Leak</option>
                  <option value="CENSORSHIP_REPORT">Report News Suppression / Censorship Attempt</option>
                  <option value="FACT_CHECK">Fact-Check Dispute or Correction</option>
                  <option value="GENERAL">General Reader & Editorial Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Zoning committee bribery documentation or takedown threat"
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Details & Evidence</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide all known details, dates, individuals, and links to evidence..."
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-full text-xs font-bold text-white shadow-lg transition-all"
                style={{
                  backgroundColor: '#E86328',
                  backgroundImage: 'linear-gradient(135deg, #F59E0B, #E86328)',
                }}
              >
                {submitting ? 'Encrypting & Sending...' : 'Submit to Editorial Protection Desk'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
