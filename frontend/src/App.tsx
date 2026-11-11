import React from 'react';
import { AppProvider, useApp } from './context';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WeeklyTopNews } from './components/WeeklyTopNews';
import { TechNewsSection } from './components/TechNewsSection';
import { DLTLedgerSection } from './components/DLTLedgerSection';
import { SportsGroundSection } from './components/SportsGroundSection';
import { LiveVideoSection } from './components/LiveVideoSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { ArticleModal } from './components/ArticleModal';
import { SubmitNewsModal } from './components/SubmitNewsModal';
import { AdminDeskModal } from './components/AdminDeskModal';
import { DLTExplorerModal } from './components/DLTExplorerModal';
import { SupportModal } from './components/SupportModal';
import { AuthModal } from './components/AuthModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { Dashboard } from './components/Dashboard';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { ProfileModal } from './components/ProfileModal';
import { PublicSkeletonLoader } from './components/PublicSkeletonLoader';
import { Flame } from 'lucide-react';

const MainContent: React.FC = () => {
  const { categories, activeCategory, setCategory, isDashboardOpen, loading } = useApp();

  if (isDashboardOpen) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
        <Dashboard />
        <ArticleModal />
        <SubmitNewsModal />
        <AdminDeskModal />
        <DLTExplorerModal />
        <SupportModal />
        <AuthModal />
        <ProfileModal />
        <AudioPlayerBar />
        <ImageLightboxModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header />

      {/* Category Pills Scroller - Full width, naturally flows with the page */}
      <div className="bg-white border-b border-gray-100 py-3 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-1 flex-shrink-0">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Topic Filter:
            </span>
            {categories.map((cat: any) => {
              const isActive =
                activeCategory === cat.name ||
                (cat.name === 'All' && activeCategory === 'All');
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Page Layout Sections or Skeleton Loader */}
      <main className="flex-1">
        {loading ? (
          <PublicSkeletonLoader />
        ) : (
          <>
            {/* 1. Top Featured Hero & Stacked Stories (Dribbble Layout) */}
            <HeroSection />

            {/* 2. Weekly Top News (3-Column Grid, Dribbble Layout) */}
            <WeeklyTopNews />

            {/* 3. Tech News & Investigations (Dribbble Layout) */}
            <TechNewsSection />

            {/* 4. SusaLabs DLT Protocol & Censorship Defense Banner */}
            <DLTLedgerSection />

            {/* 5. Ground Reports & Community Dispatches (Dribbble Layout) */}
            <SportsGroundSection />

            {/* 6. Live Eyewitness Stream Feeds */}
            <LiveVideoSection />

            {/* 7. Newsletter Subscription (Dribbble Layout) */}
            <NewsletterSection />
          </>
        )}
      </main>

      {/* Editorial Footer with SusaLabs Links */}
      <Footer />

      {/* Interactive Modals */}
      <ArticleModal />
      <SubmitNewsModal />
      <AdminDeskModal />
      <DLTExplorerModal />
      <SupportModal />
      <AuthModal />
      <ProfileModal />
      <AudioPlayerBar />
      <ImageLightboxModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
