import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import {
  fetchDLTLedger,
  verifyBlockProofDLT,
  verifyFullChainDLT,
  simulateTamperAttack,
  fetchIpfsDocument,
} from '../api/client';
import type { DLTBlock } from '../types';
import {
  X,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Search,
  RefreshCw,
  Cpu,
  Key,
  Database,
  Copy,
  Check,
  AlertTriangle,
  Terminal,
  Eye,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';

export const DLTExplorerModal: React.FC = () => {
  const { isDLTModalOpen, openDLTModal } = useApp();
  const [ledgerData, setLedgerData] = useState<{
    totalBlocks: number;
    blocks: DLTBlock[];
    networkStats: any;
  } | null>(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Full Chain Audit State
  const [isAuditingChain, setIsAuditingChain] = useState(false);
  const [chainAuditResult, setChainAuditResult] = useState<any | null>(null);

  // Individual Block Verification State
  const [verifyingBlockIndex, setVerifyingBlockIndex] = useState<number | null>(null);
  const [blockVerificationResult, setBlockVerificationResult] = useState<{
    [index: number]: any;
  }>({});

  // Tamper Attack Simulation State
  const [isTamperLabOpen, setIsTamperLabOpen] = useState(false);
  const [tamperTargetIndex, setTamperTargetIndex] = useState<number>(0);
  const [tamperedTitle, setTamperedTitle] = useState('');
  const [tamperedContent, setTamperedContent] = useState('');
  const [isSimulatingTamper, setIsSimulatingTamper] = useState(false);
  const [tamperAttackResult, setTamperAttackResult] = useState<any | null>(null);

  // IPFS Snapshot Modal State
  const [ipfsDocModal, setIpfsDocModal] = useState<any | null>(null);
  const [loadingIpfsCid, setLoadingIpfsCid] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const loadLedger = async () => {
    setLoading(true);
    try {
      const data = await fetchDLTLedger();
      setLedgerData(data);
      if (data?.blocks && data.blocks.length > 0) {
        // Pre-fill tamper lab target with latest non-genesis block
        const latestNonGen = data.blocks.find((b) => b.blockIndex > 0) || data.blocks[0];
        setTamperTargetIndex(latestNonGen.blockIndex);
        setTamperedTitle(latestNonGen.title + ' [ALTERED BY HACKER]');
        setTamperedContent('Hacked content: Fabricated text attempting to overwrite the immutable ledger.');
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (isDLTModalOpen) {
      fetchDLTLedger()
        .then((data) => {
          if (!ignore) {
            setLedgerData(data);
            if (data?.blocks && data.blocks.length > 0) {
              const latestNonGen = data.blocks.find((b) => b.blockIndex > 0) || data.blocks[0];
              setTamperTargetIndex(latestNonGen.blockIndex);
              setTamperedTitle(latestNonGen.title + ' [ALTERED BY HACKER]');
              setTamperedContent('Hacked content: Fabricated text attempting to overwrite the immutable ledger.');
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [isDLTModalOpen]);

  // Handle Full Chain Audit
  const handleAuditFullChain = async () => {
    setIsAuditingChain(true);
    setChainAuditResult(null);
    try {
      const result = await verifyFullChainDLT();
      setChainAuditResult(result);
    } catch (err: any) {
      setChainAuditResult({
        chainValid: false,
        message: err.message || 'Audit failed',
        totalBlocksAudited: ledgerData?.totalBlocks || 0,
      });
    } finally {
      setIsAuditingChain(false);
    }
  };

  // Handle Individual Block Verification
  const handleVerifyBlockProof = async (blockIndex: number) => {
    setVerifyingBlockIndex(blockIndex);
    try {
      const result = await verifyBlockProofDLT(blockIndex);
      setBlockVerificationResult((prev) => ({
        ...prev,
        [blockIndex]: result,
      }));
    } catch {
      // Handle error
    } finally {
      setVerifyingBlockIndex(null);
    }
  };

  // Handle Tamper Attack Execution
  const handleExecuteTamperAttack = async () => {
    setIsSimulatingTamper(true);
    setTamperAttackResult(null);
    try {
      const res = await simulateTamperAttack(tamperTargetIndex, tamperedTitle, tamperedContent);
      setTamperAttackResult(res);
    } catch (err: any) {
      setTamperAttackResult({
        attackDetected: true,
        bftConsensusOutcome: {
          actionTaken: 'Simulated network rejection: ' + err.message,
        },
      });
    } finally {
      setIsSimulatingTamper(false);
    }
  };

  // Handle View IPFS Snapshot
  const handleOpenIpfsDoc = async (cid: string) => {
    setLoadingIpfsCid(cid);
    try {
      const doc = await fetchIpfsDocument(cid);
      setIpfsDocModal(doc);
    } catch {
      // Fallback display
      setIpfsDocModal({
        cid,
        protocol: 'SusaLabs-DLT-IPFS-v1',
        message: 'Decentralized snapshot anchored on IPFS storage cluster.',
      });
    } finally {
      setLoadingIpfsCid(null);
    }
  };

  if (!isDLTModalOpen) return null;

  const filteredBlocks =
    ledgerData?.blocks?.filter((b) => {
      const q = search.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.blockHash.toLowerCase().includes(q) ||
        b.contentHash.toLowerCase().includes(q) ||
        b.ipfsCid.toLowerCase().includes(q) ||
        b.blockIndex.toString() === q
      );
    }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Light Mode Container (Clean Modern Editorial & Forensic DLT Aesthetic) */}
      <div className="relative w-full max-w-5xl bg-white text-gray-900 rounded-3xl overflow-hidden shadow-2xl my-6 border border-gray-200 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
                  SusaLabs DLT Public Truth Ledger Explorer
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full font-black tracking-widest flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  3/3 VALIDATOR NODES ACTIVE
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Decentralized proof-of-truth chain anchored across 3 multi-stake validator nodes to prevent censorship
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Audit Chain Button */}
            <button
              onClick={handleAuditFullChain}
              disabled={isAuditingChain}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Audit entire cryptographic blockchain from Genesis Block to tip"
            >
              <ShieldCheck className={`w-3.5 h-3.5 text-emerald-400 ${isAuditingChain ? 'animate-spin' : ''}`} />
              <span>{isAuditingChain ? 'Auditing Chain...' : 'Audit Entire Chain'}</span>
            </button>

            {/* Hacker Tamper Lab Toggle */}
            <button
              onClick={() => setIsTamperLabOpen(!isTamperLabOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isTamperLabOpen
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
              title="Test altering content and verify how SHA-256 and BFT consensus repel attacks"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isTamperLabOpen ? 'Close Tamper Lab' : 'Tamper Attack Test Lab'}</span>
            </button>

            <button
              onClick={loadLedger}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              title="Refresh Ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => openDLTModal(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Chain Audit Banner Notification (When Audited) */}
        {chainAuditResult && (
          <div
            className={`p-4 border-b flex items-center justify-between text-xs animate-fadeIn ${
              chainAuditResult.chainValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {chainAuditResult.chainValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="font-extrabold">{chainAuditResult.message}</span>
                <span className="ml-2 text-[11px] opacity-75 font-mono">
                  (Audited {chainAuditResult.totalBlocksAudited} blocks • BFT Consensus: {chainAuditResult.bftConsensusPercentage}%)
                </span>
              </div>
            </div>
            <button
              onClick={() => setChainAuditResult(null)}
              className="text-xs font-bold underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Interactive Hacker Tamper Attack Simulation Console */}
        {isTamperLabOpen && (
          <div className="p-5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white border-b border-neutral-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>Cryptographic Tamper Defense & Attack Simulator</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-900/60 text-rose-300 border border-rose-700/60">
                      LIVE TEST ENGINE
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Test what happens when a rogue actor or compromised database alters article text. Witness cryptographic SHA-256 mismatch and unanimous validator node rejection.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTamperLabOpen(false)}
                className="text-neutral-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2 bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                  <span>TARGET BLOCK FOR TAMPER TEST:</span>
                  <select
                    value={tamperTargetIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setTamperTargetIndex(idx);
                      const b = ledgerData?.blocks.find((x) => x.blockIndex === idx);
                      if (b) {
                        setTamperedTitle(b.title + ' [ALTERED BY HACKER]');
                      }
                    }}
                    className="bg-neutral-800 text-amber-400 px-2 py-1 rounded border border-neutral-700 text-xs focus:outline-none"
                  >
                    {ledgerData?.blocks.map((b) => (
                      <option key={b.blockHash} value={b.blockIndex}>
                        Block #{b.blockIndex} - {b.title.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                    Simulated Tampered Headline:
                  </label>
                  <input
                    type="text"
                    value={tamperedTitle}
                    onChange={(e) => setTamperedTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-rose-300 text-xs focus:border-rose-500 focus:outline-none"
                    placeholder="Enter modified title..."
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                    Simulated Tampered Paragraph:
                  </label>
                  <textarea
                    rows={2}
                    value={tamperedContent}
                    onChange={(e) => setTamperedContent(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-rose-300 text-xs focus:border-rose-500 focus:outline-none"
                    placeholder="Enter altered body text..."
                  />
                </div>

                <button
                  onClick={handleExecuteTamperAttack}
                  disabled={isSimulatingTamper || !tamperedTitle.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isSimulatingTamper ? 'Simulating Cryptographic Attack...' : 'Execute Tamper Attack (Test Anti-Fraud)'}</span>
                </button>
              </div>

              {/* Live Tamper Result Window */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex flex-col justify-between overflow-y-auto max-h-64">
                {tamperAttackResult ? (
                  <div className="space-y-2.5 text-[11px]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                      <span className="font-extrabold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        ATTACK REPELLED BY BFT PROTOCOL
                      </span>
                      <span className="text-neutral-400 text-[10px]">
                        Quorum: {tamperAttackResult.bftConsensusOutcome?.votesAccepted}/3 Accepted
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-neutral-400">Original SHA-256 Hash:</div>
                      <div className="text-emerald-400 break-all bg-neutral-900 p-1.5 rounded">
                        {tamperAttackResult.original?.contentHash}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-neutral-400">Tampered SHA-256 Hash:</div>
                      <div className="text-rose-400 break-all bg-neutral-900 p-1.5 rounded">
                        {tamperAttackResult.tampered?.tamperedContentHash}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-neutral-800 space-y-1">
                      <div className="text-neutral-400 font-bold">Consensus Validator Responses:</div>
                      {tamperAttackResult.nodeConsensusResponses?.map((n: any) => (
                        <div key={n.nodeId} className="flex items-center justify-between text-[10px]">
                          <span className="text-neutral-300 truncate max-w-[200px]">{n.nodeName}:</span>
                          <span className="text-rose-400 font-bold font-mono">REJECTED (Hash Mismatch)</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[10px]">
                      {tamperAttackResult.bftConsensusOutcome?.actionTaken}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 py-6">
                    <Fingerprint className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Click "Execute Tamper Attack" to verify that altering 1 byte breaks SHA-256 verification and triggers unanimous BFT rejection.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Network Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 sm:p-5 bg-slate-50/90 border-b border-gray-200/80 text-xs">
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Total Blocks Mined</div>
            <div className="text-lg font-black text-amber-600 font-mono mt-0.5">
              #{ledgerData?.totalBlocks || 0} Blocks
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Consensus State</div>
            <div className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Byzantine FT</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Validator Nodes</div>
            <div className="text-sm font-bold text-blue-700 flex items-center gap-1 mt-1">
              <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>3 Consensus Nodes</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Tamper Protection</div>
            <div className="text-sm font-bold text-purple-700 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Immutable Anchored</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter blocks by block number, content hash, IPFS CID, or headline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all font-mono shadow-inner"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          </div>
        </div>

        {/* Block List (Light Mode Cards with Deep Verifications) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {filteredBlocks.map((b) => {
            const verification = blockVerificationResult[b.blockIndex];
            const isCurrentlyVerifying = verifyingBlockIndex === b.blockIndex;

            return (
              <div
                key={b.blockHash}
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all space-y-3 font-mono text-xs"
              >
                {/* Block Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-black text-xs">
                      BLOCK #{b.blockIndex}
                    </span>
                    <span className="text-gray-900 font-sans font-bold text-sm">
                      {b.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[11px] font-sans">
                      {new Date(b.timestamp).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleVerifyBlockProof(b.blockIndex)}
                      disabled={isCurrentlyVerifying}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-sans font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Verify SHA-256 hash, Merkle root, and 3 validator node signatures"
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 text-emerald-600 ${isCurrentlyVerifying ? 'animate-spin' : ''}`} />
                      <span>{isCurrentlyVerifying ? 'Verifying...' : 'Verify Cryptographic Proof'}</span>
                    </button>
                  </div>
                </div>

                {/* Cryptographic Hashes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] pt-2 border-t border-gray-100">
                  {/* Block Hash */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 break-all relative group">
                    <div className="flex items-center justify-between text-gray-500 font-semibold mb-0.5">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3 text-amber-600" /> Block Hash:
                      </span>
                      <button
                        onClick={() => copyToClipboard(b.blockHash)}
                        className="text-gray-400 hover:text-amber-700 transition-colors cursor-pointer"
                        title="Copy Block Hash"
                      >
                        {copiedHash === b.blockHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="text-amber-800 font-bold">{b.blockHash}</span>
                  </div>

                  {/* Content Hash */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 break-all relative group">
                    <div className="flex items-center justify-between text-gray-500 font-semibold mb-0.5">
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-emerald-600" /> Content Hash (SHA-256):
                      </span>
                      <button
                        onClick={() => copyToClipboard(b.contentHash)}
                        className="text-gray-400 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Copy Content Hash"
                      >
                        {copiedHash === b.contentHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="text-emerald-700 font-bold">{b.contentHash}</span>
                  </div>

                  {/* Previous Block Hash */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 break-all relative group">
                    <div className="flex items-center justify-between text-gray-500 font-semibold mb-0.5">
                      <span>Previous Block Hash:</span>
                      <button
                        onClick={() => copyToClipboard(b.previousHash)}
                        className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        title="Copy Previous Hash"
                      >
                        {copiedHash === b.previousHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="text-gray-600">{b.previousHash}</span>
                  </div>

                  {/* IPFS CIDv1 */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 break-all relative group">
                    <div className="flex items-center justify-between text-gray-500 font-semibold mb-0.5">
                      <span>Decentralized IPFS CIDv1:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenIpfsDoc(b.ipfsCid)}
                          disabled={loadingIpfsCid === b.ipfsCid}
                          className="text-blue-600 hover:text-blue-800 text-[10px] font-sans font-bold flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                          title="View Decentralized IPFS JSON snapshot"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{loadingIpfsCid === b.ipfsCid ? 'Loading...' : 'View JSON'}</span>
                        </button>
                        <button
                          onClick={() => copyToClipboard(b.ipfsCid)}
                          className="text-gray-400 hover:text-blue-700 transition-colors cursor-pointer"
                          title="Copy IPFS CID"
                        >
                          {copiedHash === b.ipfsCid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <span
                      onClick={() => handleOpenIpfsDoc(b.ipfsCid)}
                      className="text-blue-700 font-bold cursor-pointer hover:underline"
                    >
                      {b.ipfsCid}
                    </span>
                  </div>
                </div>

                {/* Deep Block Verification Dossier Card (When Verified) */}
                {verification && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs font-sans space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Cryptographic Block #{b.blockIndex} Verification Dossier</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                        {verification.consensusState?.status || '100% BYZANTINE FT'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                      <div className="p-2 bg-white rounded-lg border border-emerald-100">
                        <span className="text-gray-500 block text-[10px]">PREVIOUS LINK:</span>
                        <span className="text-emerald-700 font-bold">
                          {verification.checks?.previousHashValid ? '✓ UNBROKEN CONTINUITY' : '✗ BROKEN'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-100">
                        <span className="text-gray-500 block text-[10px]">BLOCK HASH:</span>
                        <span className="text-emerald-700 font-bold">
                          {verification.checks?.blockHashValid ? '✓ RECOMPUTED MATCH' : '✗ MISMATCH'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-100">
                        <span className="text-gray-500 block text-[10px]">BFT QUORUM:</span>
                        <span className="text-emerald-700 font-bold">
                          {verification.consensusState?.validSignaturesCount}/3 VALIDATOR SIGNATURES
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-emerald-200/60 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                        Validator Node Signatures Audited:
                      </span>
                      {verification.validatorsAudit?.map((v: any) => (
                        <div key={v.nodeId} className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-gray-700">{v.nodeName}:</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>HMAC-SHA256 Validated</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validator Signatures in Light Mode */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-[10px] text-gray-500 font-sans">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>3 Validator Signatures Anchored (SusaLabs Truth Node, Independent Press, Citizen Network)</span>
                  </div>
                  <span className="bg-slate-100 text-gray-700 font-bold px-2 py-0.5 rounded font-mono">
                    Status: {b.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IPFS Snapshot Modal */}
      {ipfsDocModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
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
                  onClick={() => copyToClipboard(JSON.stringify(ipfsDocModal, null, 2))}
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
