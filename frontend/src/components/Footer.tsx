import React, { useState } from 'react';
import { SusaLabsLogo } from './SusaLabsLogo';
import { Phone, Mail, MapPin, Clock, Shield, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context';

export const Footer: React.FC = () => {
  const { setCategory, setSearch, openDLTModal, openSupportModal } = useApp();
  const [modalContent, setModalContent] = useState<{ title: string; body: string; link?: string } | null>(null);

  const filterAndScroll = (category: string, query?: string) => {
    setCategory(category);
    if (query) setSearch(query);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-100 mt-16 pt-16 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Brand & Manifesto Area */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-12 border-b border-gray-100">
          <div className="max-w-md">
            <div onClick={() => filterAndScroll('All')} className="cursor-pointer inline-block">
              <SusaLabsLogo size={48} />
            </div>
            <p className="mt-4 text-xs sm:text-sm text-gray-500 leading-relaxed">
              NextTruth is powered by{' '}
              <a
                href="https://susalabs.com"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-amber-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                SusaLabs Intelligence <ExternalLink className="w-3 h-3" />
              </a>
              . Built with a decentralized cryptographic audit ledger to defend citizen reporting and
              investigative journalism against commercial and political censorship.
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-gray-600">
            <div
              onClick={() => openSupportModal(true)}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Call Us</div>
                <div className="font-semibold text-gray-900">+1 310-457-2786</div>
              </div>
            </div>

            <div
              onClick={() => openSupportModal(true)}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Email Desk</div>
                <div className="font-semibold text-gray-900">contact@susalabs.com</div>
              </div>
            </div>

            <div
              onClick={() =>
                setModalContent({
                  title: 'SusaLabs Media Bureau & Research Lab',
                  body: '716 Campfire Ave, Media District, CA. Operating decentralized truth validation clusters for North America and global citizen bureaus.',
                  link: 'https://susalabs.com',
                })
              }
              className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Location</div>
                <div className="font-semibold text-gray-900">716 Campfire Ave, CA</div>
              </div>
            </div>

            <div
              onClick={() => openDLTModal(true)}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
            >
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Ground Desk</div>
                <div className="font-semibold text-emerald-700">24/7 Verified Stream</div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Column Links - 100% Fully Functional */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 py-12 border-b border-gray-100 text-xs">
          {/* 1. Business */}
          <div>
            <h5 className="font-extrabold text-gray-900 uppercase tracking-wider mb-4">
              Business
            </h5>
            <ul className="space-y-2.5 text-gray-500">
              <li>
                <button onClick={() => filterAndScroll('Economics', 'Start Up')} className="hover:text-amber-600 cursor-pointer text-left">
                  Start Up
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Economics', 'Corporate Filings')} className="hover:text-amber-600 cursor-pointer text-left">
                  Corporate Filings
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Economics', 'Municipal Budget')} className="hover:text-amber-600 cursor-pointer text-left">
                  Municipal Budget
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Economics', 'Financial Audits')} className="hover:text-amber-600 cursor-pointer text-left">
                  Financial Audits
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Economics', 'Market Telemetry')} className="hover:text-amber-600 cursor-pointer text-left">
                  Market Telemetry
                </button>
              </li>
            </ul>
          </div>

          {/* 2. Technology */}
          <div>
            <h5 className="font-extrabold text-gray-900 uppercase tracking-wider mb-4">
              Technology
            </h5>
            <ul className="space-y-2.5 text-gray-500">
              <li>
                <button onClick={() => filterAndScroll('Tech & Media', 'Innovation')} className="hover:text-amber-600 cursor-pointer text-left">
                  Innovation
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Tech & Media', 'Digital Privacy')} className="hover:text-amber-600 cursor-pointer text-left">
                  Digital Privacy
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Tech & Media', 'Smart City')} className="hover:text-amber-600 cursor-pointer text-left">
                  Smart City Telemetry
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Tech & Media', 'Compute Infrastructure')} className="hover:text-amber-600 cursor-pointer text-left">
                  Compute Infrastructure
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Tech & Media', 'AI Transparency')} className="hover:text-amber-600 cursor-pointer text-left">
                  AI Transparency
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Ground Reports */}
          <div>
            <h5 className="font-extrabold text-gray-900 uppercase tracking-wider mb-4">
              Ground Reports
            </h5>
            <ul className="space-y-2.5 text-gray-500">
              <li>
                <button onClick={() => filterAndScroll('Ground Reports', 'District 4')} className="hover:text-amber-600 cursor-pointer text-left">
                  District 4 Chamber
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Ground Reports', 'Market Square')} className="hover:text-amber-600 cursor-pointer text-left">
                  Market Square
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('live-video-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-600 cursor-pointer text-left text-rose-600 font-bold"
                >
                  Eyewitness Videos
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Ground Reports', 'Police Wire')} className="hover:text-amber-600 cursor-pointer text-left">
                  Police Wire Reports
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Infrastructure', 'Transit')} className="hover:text-amber-600 cursor-pointer text-left">
                  Transit Updates
                </button>
              </li>
            </ul>
          </div>

          {/* 4. DLT Truth */}
          <div>
            <h5 className="font-extrabold text-gray-900 uppercase tracking-wider mb-4">
              DLT Truth
            </h5>
            <ul className="space-y-2.5 text-gray-500">
              <li>
                <button onClick={() => openDLTModal(true)} className="hover:text-amber-600 cursor-pointer text-left flex items-center gap-1 font-semibold text-amber-700">
                  <Shield className="w-3 h-3 text-amber-500" /> Block Ledger
                </button>
              </li>
              <li>
                <button onClick={() => openDLTModal(true)} className="hover:text-amber-600 cursor-pointer text-left">
                  Merkle Roots
                </button>
              </li>
              <li>
                <button onClick={() => openDLTModal(true)} className="hover:text-amber-600 cursor-pointer text-left">
                  Validator Consensus
                </button>
              </li>
              <li>
                <button onClick={() => openDLTModal(true)} className="hover:text-amber-600 cursor-pointer text-left">
                  IPFS CIDs
                </button>
              </li>
              <li>
                <button onClick={() => openDLTModal(true)} className="hover:text-amber-600 cursor-pointer text-left">
                  Tamper Verification
                </button>
              </li>
            </ul>
          </div>

          {/* 5. Whistleblower */}
          <div>
            <h5 className="font-extrabold text-gray-900 uppercase tracking-wider mb-4">
              Whistleblower
            </h5>
            <ul className="space-y-2.5 text-gray-500">
              <li>
                <button onClick={() => openSupportModal(true)} className="hover:text-rose-700 cursor-pointer text-left font-bold text-rose-600">
                  Submit Safe Tip
                </button>
              </li>
              <li>
                <button onClick={() => openSupportModal(true)} className="hover:text-amber-600 cursor-pointer text-left">
                  Censorship Defense
                </button>
              </li>
              <li>
                <button onClick={() => openSupportModal(true)} className="hover:text-amber-600 cursor-pointer text-left">
                  Encrypted Hotdesk
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setModalContent({
                      title: 'Legal Shield & Whistleblower Protection Protocol',
                      body: 'NextTruth operates with strict zero-knowledge logging. Submissions sent via Whistleblower Mode strip all IP telemetry and timestamp coordinates to ensure safe civic leaks cannot be compromised or targeted by external entities.',
                    })
                  }
                  className="hover:text-amber-600 cursor-pointer text-left"
                >
                  Legal Shield Guide
                </button>
              </li>
            </ul>
          </div>

          {/* 6. Civic & Weather */}
          <div>
            <h5 className="font-extrabold text-gray-900 uppercase tracking-wider mb-4">
              Civic & Weather
            </h5>
            <ul className="space-y-2.5 text-gray-500">
              <li>
                <button onClick={() => filterAndScroll('Infrastructure', 'Storm')} className="hover:text-amber-600 cursor-pointer text-left">
                  District 4 Storms
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Infrastructure', 'Power Grid')} className="hover:text-amber-600 cursor-pointer text-left">
                  Power Grid Monitoring
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Infrastructure', 'Water Main')} className="hover:text-amber-600 cursor-pointer text-left">
                  Municipal Water Alert
                </button>
              </li>
              <li>
                <button onClick={() => filterAndScroll('Infrastructure', 'Air Quality')} className="hover:text-amber-600 cursor-pointer text-left">
                  Air Quality Telemetry
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar with SusaLabs Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-6 flex-wrap">
            <a
              href="https://susalabs.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-700 font-bold cursor-pointer flex items-center gap-1"
            >
              <span>About SusaLabs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button onClick={() => openSupportModal(true)} className="hover:text-gray-900 cursor-pointer">
              Contact Desk
            </button>

            <button
              onClick={() =>
                setModalContent({
                  title: 'Privacy Policy - SusaLabs Decentralized Architecture',
                  body: 'We respect privacy as a fundamental human right. NextTruth does not sell personal reader data or track browsing telemetry across third-party ad networks. Cryptographic hashes stored on our DLT ledger verify article authenticity without exposing private reader identities.',
                  link: 'https://susalabs.com',
                })
              }
              className="hover:text-gray-900 cursor-pointer"
            >
              Privacy Policy
            </button>

            <button
              onClick={() =>
                setModalContent({
                  title: 'NextTruth Platform Sitemap',
                  body: 'Directory: Home Feed, Ground Eyewitness Desk, Business & Economic Telemetry, Political Deliberations, Technology Sovereignty, Urban Infrastructure Audits, Live Video Broadcasts, and Public DLT Truth Explorer.',
                })
              }
              className="hover:text-gray-900 cursor-pointer"
            >
              Sitemap
            </button>

            <button
              onClick={() =>
                setModalContent({
                  title: 'Terms of Use & Truth Guarantee',
                  body: 'All articles published under the "Verified Ground" seal have undergone multi-stakeholder corroboration. Anyone can independently verify the verbatim content against the genesis DLT block.',
                  link: 'https://susalabs.com',
                })
              }
              className="hover:text-gray-900 cursor-pointer"
            >
              Terms of Use
            </button>
          </div>

          <div className="text-gray-500 font-medium text-center sm:text-right">
            © 2026{' '}
            <a
              href="https://susalabs.com"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-amber-700 hover:underline cursor-pointer"
            >
              SusaLabs
            </a> & NextTruth Media. All rights reserved.
          </div>
        </div>
      </div>

      {/* Info Modal for Footer Links */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <h4 className="font-extrabold text-gray-900 text-base">{modalContent.title}</h4>
              </div>
              <button
                onClick={() => setModalContent(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{modalContent.body}</p>
            {modalContent.link && (
              <a
                href={modalContent.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
              >
                Visit SusaLabs.com Official Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <div className="pt-2 text-right">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-amber-500 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
