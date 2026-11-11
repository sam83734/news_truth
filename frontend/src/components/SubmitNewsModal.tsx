import React, { useState, useRef } from 'react';
import { useApp } from '../context';
import { createSubmission } from '../api/client';
import {
  X,
  Send,
  MapPin,
  Camera,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  UploadCloud,
  Film,
  Trash2,
} from 'lucide-react';

export const SubmitNewsModal: React.FC = () => {
  const {
    isSubmitModalOpen,
    openSubmitModal,
    currentUser,
    categories,
    refreshData,
    refreshSubmissions,
    addSubmissionLocally,
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ground Reports');
  const [location, setLocation] = useState('Old City Market District - Sector 4');
  const [description, setDescription] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{
    file: File;
    dataUrl: string;
    name: string;
    size: string;
    type: 'image' | 'video';
  } | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requireJournalistReview, setRequireJournalistReview] = useState(true);
  const [requireExpertFactCheck, setRequireExpertFactCheck] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successSubmission, setSuccessSubmission] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSubmitModalOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25MB limit. Please select a smaller photo or video.');
      return;
    }

    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedMedia({
        file,
        dataUrl,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: isVideo ? 'video' : 'image',
      });
      setImageUrl(dataUrl);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Headline / Incident Summary is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const attachmentsPayload = imageUrl
        ? JSON.stringify([{ uri: imageUrl.trim(), name: selectedMedia?.name, type: selectedMedia?.type || 'image' }])
        : '';

      const res = await createSubmission(
        {
          title: title.trim(),
          category,
          location: location.trim(),
          description: description.trim(),
          sourceNotes: sourceNotes.trim(),
          attachments: attachmentsPayload,
          isAnonymous,
          requireJournalistReview,
          requireExpertFactCheck,
        },
        currentUser?.id
      );

      setSuccessSubmission(res);
      addSubmissionLocally(res);
      refreshSubmissions();
      refreshData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit news report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setSourceNotes('');
    setImageUrl('');
    setSelectedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSuccessSubmission(null);
    openSubmitModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl my-8 border border-gray-100 flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Citizen Eyewitness Submission Desk
              </h3>
              <p className="text-xs text-neutral-400">
                Transmit ground evidence directly to NextTruth Verification Editors
              </p>
            </div>
          </div>

          <button
            onClick={() => openSubmitModal(false)}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success Message */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
          {successSubmission ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-gray-900">
                Dispatch Transmitted Successfully!
              </h4>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your ground report has been received by Chief Editor Dr. Alexander Vance and is queued for verification review.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl max-w-md mx-auto text-xs text-left text-gray-700 space-y-1 font-mono">
                <div><span className="font-bold">Submission ID: </span>{successSubmission.id || 'SUB-7841'}</div>
                <div><span className="font-bold">Status: </span>PENDING EDITORIAL AUDIT</div>
                <div><span className="font-bold">Verification Desk: </span>NextTruth Ground Intelligence</div>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-amber-500 transition-all shadow-md"
              >
                Close & Return to Feed
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Anonymous Whistleblower Banner */}
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isAnonymous
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isAnonymous ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">
                      Anonymous Whistleblower Protection Mode
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Strip identifying metadata. Safe transmission against powerful or hostile entities.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-600 rounded"
                />
              </div>

              {/* Dual-Consensus Verification Policy (Configurable checkboxes) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                    Verification Consensus Policy (Required Approvals Before Publication)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Select which accredited desks must independently audit this report before it is published on the portal and anchored to SusaLabs DLT.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    requireJournalistReview ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}>
                    <input
                      type="checkbox"
                      checked={requireJournalistReview}
                      onChange={(e) => setRequireJournalistReview(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        Staff Journalist Field Audit
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Sarah Jenkins / Field correspondent verification
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    requireExpertFactCheck ? 'bg-white border-amber-300 shadow-2xs' : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}>
                    <input
                      type="checkbox"
                      checked={requireExpertFactCheck}
                      onChange={(e) => setRequireExpertFactCheck(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        Ground Expert Forensic Fact-Check
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Elias Thorne / Technical &amp; GPS proof certification
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category Channel
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories
                      .filter((c: any) => c.name !== 'All')
                      .map((c: any) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    {/* Fallback default options if categories not yet loaded */}
                    {categories.length <= 1 && (
                      <>
                        <option value="Ground Reports">Ground Reports</option>
                        <option value="Urgent Breaking">Urgent Breaking</option>
                        <option value="Business & Economy">Business & Economy</option>
                        <option value="Politics & Governance">Politics & Governance</option>
                        <option value="Tech & Media">Tech & Media</option>
                        <option value="Urban Infrastructure">Urban Infrastructure</option>
                        <option value="Editorial Opinion">Editorial Opinion</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Incident Location (GPS Tagged)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Market Square - District 4"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:border-amber-500"
                    />
                    <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Headline / Incident Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Market square protests escalate into the evening with road closures"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm font-semibold bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Eyewitness Report Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Eyewitness Details & Observations
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail what you observed on the ground: sequence of events, personnel present, barricades, crowd actions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              {/* Attachment Photo / Video Evidence - Real Device File Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Attach Photo / Video Evidence</span>
                  <span className="text-[11px] text-gray-400 font-normal">Direct from device or link</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedMedia ? (
                  /* Preview Card */
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {selectedMedia.type === 'video' ? (
                        <div className="w-16 h-14 bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                          <Film className="w-6 h-6 text-amber-400" />
                        </div>
                      ) : (
                        <img
                          src={selectedMedia.dataUrl}
                          alt="Evidence Preview"
                          className="w-16 h-14 rounded-xl object-cover border border-amber-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 truncate">
                          {selectedMedia.name}
                        </div>
                        <div className="text-[11px] text-amber-800 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="uppercase px-1.5 py-0.2 rounded bg-amber-200/80 text-[10px] font-black">
                            {selectedMedia.type}
                          </span>
                          <span>{selectedMedia.size}</span>
                          <span>• Ready to Transmit</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                      title="Remove attached evidence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Upload Button / Dropzone */
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 rounded-2xl flex items-center justify-center gap-3 text-amber-900 font-bold text-xs transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="p-2 bg-amber-500 text-white rounded-xl group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-extrabold text-xs">Choose Photo or Video File from Device</div>
                        <div className="text-[11px] text-amber-700/80 font-normal">Supports JPG, PNG, WEBP, MP4, MOV (up to 25MB)</div>
                      </div>
                    </button>

                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">or paste evidence web url</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://... photo or video evidence link"
                        value={imageUrl.startsWith('data:') ? '' : imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setSelectedMedia(null);
                        }}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500"
                      />
                      <Camera className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">Quick presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800');
                          setSelectedMedia(null);
                        }}
                        className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium cursor-pointer"
                      >
                        Chamber Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=800');
                          setSelectedMedia(null);
                        }}
                        className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium cursor-pointer"
                      >
                        Protest Evidence
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Source Verification Note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Private Verification Notes (For Chief Editor Only)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eyewitness standing near East Entrance; municipal badge #408 observed."
                  value={sourceNotes}
                  onChange={(e) => setSourceNotes(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>DLT Anchored Upon Editorial Approval</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white shadow-lg transition-all"
                  style={{
                    backgroundColor: '#E86328',
                    backgroundImage: 'linear-gradient(135deg, #F59E0B, #E86328)',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Transmitting...' : 'Transmit to Verification Desk'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
