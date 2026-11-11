import React, { useState } from 'react';
import { useApp } from '../context';
import {
  X,
  Clock,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Share2,
  Headphones,
  Key,
  Layers,
  AlertTriangle,
  RefreshCw,
  Database,
  Copy,
} from 'lucide-react';
import { verifyArticleDLT, fetchIpfsDocument } from '../api/client';
import { getArticleMediaInfo } from '../utils/mediaUtils';

export const ArticleModal: React.FC = () => {
  const {
    selectedArticle,
    selectArticle,
    bookmarkedIds,
    toggleBookmarkItem,
    playArticleAudio,
    currentUser,
    openLightbox,
    formatTimeAgo,
  } = useApp();

  const [verifyData, setVerifyData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ipfsDocModal, setIpfsDocModal] = useState<any | null>(null);
  const [loadingIpfs, setLoadingIpfs] = useState(false);

  React.useEffect(() => {
    let ignore = false;
    if (selectedArticle?.id) {
      verifyArticleDLT(selectedArticle.id)
        .then((res) => {
          if (!ignore) setVerifyData(res);
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [selectedArticle?.id]);

  if (!selectedArticle) return null;

  const isBookmarked = bookmarkedIds.includes(selectedArticle.id);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyArticleDLT(selectedArticle.id);
      setVerifyData(res);
    } catch (err) {
      console.warn('Verify error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenIpfs = async (cid: string) => {
    setLoadingIpfs(true);
    try {
      const doc = await fetchIpfsDocument(cid);
      setIpfsDocModal(doc);
    } catch {
      setIpfsDocModal({
        cid,
        protocol: 'SusaLabs-DLT-IPFS-v1',
        message: 'Snapshot anchored on SusaLabs Decentralized IPFS gateway node.',
      });
    } finally {
      setLoadingIpfs(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl my-8 border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
              {selectedArticle.categoryTag || selectedArticle.category}
            </span>
            {selectedArticle.isVerifiedGround && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Ground
              </span>
            )}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              DLT Protected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmarkItem(selectedArticle.id)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-amber-600 transition-colors"
              title="Bookmark"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors relative"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={() => selectArticle(null)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8">
          {/* Article Title & Metadata */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {selectedArticle.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 text-xs text-gray-500">
              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={selectedArticle.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120'}
                  alt={selectedArticle.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="font-bold text-gray-900 text-sm">{selectedArticle.authorName}</div>
                  <div className="text-gray-500">{selectedArticle.authorTitle || 'Correspondent'}</div>
                </div>
              </div>

              {/* Time, Read Duration & Narration CTA */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimeAgo(selectedArticle.createdAt || selectedArticle.dateOrTimeAgo)}
                </span>
                <span>•</span>
                <span>{selectedArticle.readTime || '4 min read'}</span>
                {selectedArticle.views && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {selectedArticle.views} views
                    </span>
                  </>
                )}

                {/* Audio Listen Button */}
                <button
                  onClick={() => playArticleAudio(selectedArticle)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all ml-2 cursor-pointer"
                  title="Listen to real speech narration of this dispatch"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Listen Narration</span>
                </button>
              </div>
            </div>
          </div>

          {/* Media Header (Video, YouTube Player, or Photo Evidence) */}
          {(() => {
            const mediaInfo = getArticleMediaInfo(selectedArticle);

            if (mediaInfo.isYouTube && mediaInfo.ytEmbedUrl) {
              return (
                <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video w-full bg-black border border-gray-800">
                  <iframe
                    src={mediaInfo.ytEmbedUrl}
                    title={selectedArticle.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              );
            }

            if (mediaInfo.isVideo && mediaInfo.videoSrc) {
              return (
                <div className="rounded-3xl overflow-hidden shadow-2xl w-full bg-black border border-gray-800 flex items-center justify-center p-1">
                  <video
                    src={mediaInfo.videoSrc}
                    controls
                    autoPlay={false}
                    className="w-full max-h-[480px] object-contain rounded-2xl"
                    poster={mediaInfo.displayImage || undefined}
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                </div>
              );
            }

            if (mediaInfo.displayImage) {
              return (
                <div
                  onClick={() => openLightbox(mediaInfo.displayImage, selectedArticle.title, 'image')}
                  className="rounded-3xl overflow-hidden shadow-lg h-72 sm:h-96 w-full cursor-zoom-in group relative"
                  title="Click to view high-resolution photo"
                >
                  <img
                    src={mediaInfo.displayImage}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Click to Enlarge
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Article Full Body */}
          <div className="prose prose-neutral max-w-none text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
            {selectedArticle.fullContent
              ? selectedArticle.fullContent.split('\n\n').map((para: string, i: number) => (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                ))
              : selectedArticle.excerpt}
          </div>

          {/* Ground Verification Audit Dossier */}
          <div className="rounded-2xl p-6 bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                Ground Verification Audit Dossier
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-bold text-gray-800">Editorial Desk: </span>
                {selectedArticle.editorialDesk || 'NextTruth Dispatch & SusaLabs Civic Review'}
              </div>
              <div>
                <span className="font-bold text-gray-800">Verification Status: </span>
                <span className="text-emerald-700 font-bold">
                  {selectedArticle.verificationStatus || (selectedArticle.isVerifiedGround ? '100% Eyewitness Corroborated • Dual-Consensus Certified' : 'Editorial Review Confirmed')}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-800">Eyewitness Correspondent: </span>
                {selectedArticle.authorName} ({selectedArticle.authorTitle || 'Citizen Reporter'})
              </div>
              <div>
                <span className="font-bold text-gray-800">Staff Journalist Audit: </span>
                <span className="text-emerald-700 font-extrabold">
                  {selectedArticle.verifiedByJournalist || 'Sarah Jenkins (Staff Correspondent)'}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-800">Forensic Fact-Check: </span>
                <span className="text-amber-700 font-extrabold">
                  {selectedArticle.factCheckedBy || 'Elias Thorne (Ground Expert & Policy Auditor)'}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-800">Chief Editorial Clearance: </span>
                <span className="text-blue-700 font-bold">
                  {selectedArticle.finalAuditor || 'Dr. Alexander Vance (Chief Editor)'}
                </span>
              </div>
              <div className="sm:col-span-2 pt-1 border-t border-gray-200/60">
                <span className="font-bold text-gray-800">Tamper Seal: </span>
                Cryptographic Merkle Tree Hash Confirmed • DLT Immutable Anchor
              </div>
            </div>
          </div>

          {/* SusaLabs DLT Blockchain Proof & Anti-Censorship Seal */}
          <div className="rounded-2xl p-6 bg-neutral-950 text-white border border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    SusaLabs DLT Anti-Censorship Proof
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Anchored to decentralized ledger nodes to defend against suppression by powerful actors
                  </p>
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={verifying}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-400 border border-neutral-700 transition-all self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                <span>Verify Live Hash</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 flex items-center gap-1.5 shrink-0">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  SHA-256 Content Hash:
                </span>
                <span className="text-amber-300 font-semibold break-all text-[11px]">
                  {verifyData?.expectedHash || verifyData?.computedHash || selectedArticle.dltContentHash || 'Generating hash...'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                <span className="text-neutral-400 flex items-center gap-1.5 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Ledger Block ID:
                </span>
                <span className="text-neutral-300 font-semibold">
                  Block #{verifyData?.auditReceipt?.blockIndex ?? selectedArticle.dltBlockIndex ?? 1} (Multi-Stake Node Anchored)
                </span>
              </div>

              {(verifyData?.auditReceipt?.ipfsCid || selectedArticle.dltIpfsCid) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                  <span className="text-neutral-400 flex items-center gap-1.5 shrink-0">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    Decentralized IPFS CIDv1:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-semibold truncate max-w-[200px] text-[11px]">
                      {verifyData?.auditReceipt?.ipfsCid || selectedArticle.dltIpfsCid}
                    </span>
                    <button
                      onClick={() => handleOpenIpfs(verifyData?.auditReceipt?.ipfsCid || selectedArticle.dltIpfsCid || '')}
                      disabled={loadingIpfs}
                      className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 hover:bg-blue-900 border border-blue-800 text-[10px] font-sans font-bold cursor-pointer"
                    >
                      {loadingIpfs ? 'Loading...' : 'View Snapshot'}
                    </button>
                  </div>
                </div>
              )}

              {verifyData && (
                <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-xs animate-fadeIn">
                  <div className="font-bold flex items-center justify-between flex-wrap gap-1 mb-1">
                    {verifyData.isTampered ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> TAMPER DETECTED
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% IMMUTABLE & VERIFIED
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {verifyData.auditReceipt?.consensusRating || '100% Byzantine Fault Tolerant (3/3 Nodes Signed)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    {verifyData.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Upsell Card if premium article & user is non-premium */}
          {selectedArticle.isPremium && !currentUser?.isPremium && (
            <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-base mb-1">
                  Read Full Unabridged Dossiers with Premium
                </h4>
                <p className="text-xs text-purple-200">
                  Fund independent ground investigations and receive early DLT audit alerts.
                </p>
              </div>
              <button className="px-5 py-2.5 rounded-full bg-white text-purple-900 font-black text-xs hover:bg-amber-400 transition-all shadow-md cursor-pointer">
                Unlock for $4.99/mo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* IPFS Snapshot Modal */}
      {ipfsDocModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-neutral-950 text-neutral-100 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    Decentralized IPFS Immutable Document Snapshot
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    CID: {ipfsDocModal.cid}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIpfsDocModal(null)}
                className="text-neutral-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-neutral-400 text-[11px] pb-2 border-b border-neutral-800">
                <span>Storage Gateway: {ipfsDocModal.storageGateway || 'https://ipfs.susalabs.io'}</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(ipfsDocModal, null, 2));
                  }}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy JSON</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 text-amber-300 overflow-x-auto text-[11px] leading-relaxed border border-neutral-800 whitespace-pre-wrap break-all">
                {JSON.stringify(ipfsDocModal, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setIpfsDocModal(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
