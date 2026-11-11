import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { fetchDLTLedger, verifyArticleDLT } from '../api/client';
import type { DLTBlock } from '../types';
import {
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  Key,
} from 'lucide-react';

export const DLTLedgerSection: React.FC = () => {
  const { openDLTModal, articles } = useApp();
  const [ledgerData, setLedgerData] = useState<{
    totalBlocks: number;
    blocks: DLTBlock[];
    networkStats: any;
  } | null>(null);

  const [testArticleId, setTestArticleId] = useState<string>('hero_1');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchDLTLedger().then((data) => setLedgerData(data));
  }, []);

  const runVerification = async () => {
    setVerifying(true);
    try {
      const res = await verifyArticleDLT(testArticleId);
      setVerificationResult(res);
    } catch (err) {
      console.warn('Verify error:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
      {/* Container with High-Tech Dark Editorial Styling */}
      <div className="relative rounded-3xl bg-neutral-950 border border-neutral-800 p-8 sm:p-12 text-white overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Lock className="w-3.5 h-3.5" />
                  Anti-Censorship DLT Architecture
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {ledgerData ? `${ledgerData.totalBlocks} Blocks Anchored` : '3/3 Nodes Consensus'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                SusaLabs Distributed Truth Ledger (DLT)
              </h2>
              <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
                Protecting legitimate investigative journalism against political takedown attempts,
                database tampering, and coercive censorship via decentralized cryptographic Merkle proofs.
              </p>
            </div>

            <button
              onClick={() => openDLTModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-neutral-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Public Block Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Pillars of Defense against Powerful Actors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Key className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                1. Cryptographic Content Sealing
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every investigative dispatch is immediately hashed with SHA-256 (title, text, eyewitness photos, geotag metadata). The resulting fingerprint is immutable.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                2. Multi-Node Byzantine Consensus
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Validated simultaneously by SusaLabs Core Node, Independent Press Guild, and Citizen Witness nodes. No single government or entity can alter the record.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                3. Real-Time Tamper Alarm
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                If an unauthorized actor hacks the centralized database or alters a politician’s name, the hash breaks instantly and flags a public Tamper Alarm.
              </p>
            </div>
          </div>

          {/* Live Anti-Tamper Verification Tester */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Live On-Chain Cryptographic Audit
              </div>
              <div className="text-sm font-semibold text-white">
                Select an article to verify against the SusaLabs DLT genesis ledger:
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <select
                  value={testArticleId}
                  onChange={(e) => setTestArticleId(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                >
                  {articles.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.title.substring(0, 45)}... ({a.id})
                    </option>
                  ))}
                </select>

                <button
                  onClick={runVerification}
                  disabled={verifying}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-700 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                  <span>Verify Article Integrity</span>
                </button>
              </div>
            </div>

            {/* Result Box */}
            <div className="w-full md:w-80 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
              {verificationResult ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 font-bold">
                    {verificationResult.isTampered ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> TAMPER DETECTED
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% IMMUTABLE & VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-400 text-[11px] mb-2 leading-relaxed">
                    {verificationResult.message}
                  </p>
                  {verificationResult.block && (
                    <div className="font-mono text-[10px] text-neutral-500 break-all bg-neutral-900 p-2 rounded">
                      Hash: {verificationResult.block.blockHash.substring(0, 32)}...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-neutral-500 text-center py-2">
                  Click "Verify Article Integrity" to run real-time SHA-256 consensus check.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
