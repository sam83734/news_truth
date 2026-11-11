import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { fetchSubmissions, updateSubmissionStatus } from '../api/client';
import type { Submission } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  XCircle,
  FileText,
} from 'lucide-react';

export const AdminDeskModal: React.FC = () => {
  const { isAdminModalOpen, openAdminModal, refreshData } = useApp();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchSubmissions(undefined, undefined);
      setSubmissions(data);
    } catch {
      // Fallback handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (isAdminModalOpen) {
      fetchSubmissions(undefined, undefined)
        .then((data) => {
          if (!ignore) setSubmissions(data);
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [isAdminModalOpen]);

  if (!isAdminModalOpen) return null;

  const handleUpdateStatus = async (sub: Submission, status: string, note?: string) => {
    setProcessingId(sub.id);
    setActionMessage(null);
    try {
      await updateSubmissionStatus(sub.id, status, note);
      setActionMessage(
        status === 'APPROVED'
          ? `Submission "${sub.title.substring(0, 30)}..." APPROVED & sealed on SusaLabs DLT Ledger!`
          : `Submission updated to ${status}.`
      );
      await loadSubmissions();
      refreshData();
    } catch (err: any) {
      setActionMessage(err?.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl my-8 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Chief Editor Admin & Verification Desk
                </h3>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-black tracking-wider">
                  DR. ALEXANDER VANCE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Review incoming citizen dispatches, approve ground reports, and mint immutable DLT truth blocks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSubmissions}
              className="p-2 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => openAdminModal(false)}
              className="p-2 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {actionMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Pending Citizen Eyewitness Reports ({submissions.length})
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-600">No submissions currently pending review.</p>
              <p className="text-xs text-gray-400 mt-1">
                Citizen reporters will transmit dispatches from the mobile app and web submit desk.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const isApproved = sub.status === 'APPROVED';
                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-amber-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                          <span className="text-amber-600 font-bold uppercase">
                            {sub.category || 'Ground Reports'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {sub.submittedTimeAgo || 'Just now'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {sub.location || 'Metro'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-gray-900">{sub.title}</h4>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'REVISE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    {sub.description && (
                      <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100">
                        {sub.description}
                      </p>
                    )}

                    {sub.note && (
                      <div className="text-[11px] text-gray-500 italic">
                        <span className="font-bold">Reporter Note: </span>
                        {sub.note}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
                      {!isApproved && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                sub,
                                'REVISE',
                                'Chief Editor requests additional photographic cross-reference before publication.'
                              )
                            }
                            disabled={processingId === sub.id}
                            className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                          >
                            Request Revision
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(sub, 'REJECT', 'Rejected by Chief Editor.')}
                            disabled={processingId === sub.id}
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(sub, 'APPROVED', 'Verified & approved for dispatch.')}
                            disabled={processingId === sub.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {processingId === sub.id ? 'Sealing...' : 'Approve & Seal with DLT'}
                            </span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Published to Feed & Sealed on Ledger
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
