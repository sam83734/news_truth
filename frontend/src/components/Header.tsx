import React, { useState } from 'react';
import { useApp } from '../context';
import { SusaLabsLogo } from './SusaLabsLogo';
import {
  Search,
  Shield,
  Send,
  ChevronDown,
  Video,
  LogIn,
  LogOut,
  Layers,
  LayoutDashboard,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeCategory,
    setCategory,
    searchQuery,
    setSearch,
    openSubmitModal,
    openDLTModal,
    openAuthModal,
    openDashboard,
    logout,
  } = useApp();

  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  // Grouped dropdown categories to keep navbar compact and elegant
  const dropdownCategories = [
    { label: 'Business & Economy', category: 'Economics' },
    { label: 'Politics & Governance', category: 'Politics' },
    { label: 'Tech & Media', category: 'Tech & Media' },
    { label: 'Urban Infrastructure', category: 'Infrastructure' },
    { label: 'Editorial Opinion', category: 'Opinion' },
    { label: 'Urgent Breaking', category: 'Urgent Report' },
  ];

  const isGuest = !currentUser || currentUser.id === 'guest_user';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div onClick={() => setCategory('All')} className="cursor-pointer">
            <SusaLabsLogo size={46} />
          </div>

          {/* Compact Navigation Menu (Ground Reports, Categories Dropdown, DLT Truth, Live Feeds) */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCategory('Ground Reports')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'Ground Reports'
                  ? 'text-gray-900 bg-gray-100 font-extrabold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Ground Reports
            </button>

            {/* Categories Dropdown (Puts Business, Politics, Tech & Media, Infrastructure in a dropdown) */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className={`flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  dropdownCategories.some((c) => c.category === activeCategory)
                    ? 'text-amber-800 bg-amber-50 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Categories</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {categoriesDropdownOpen && (
                <div
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn"
                >
                  <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select News Channel
                  </div>
                  {dropdownCategories.map((item) => (
                    <button
                      key={item.category}
                      onClick={() => {
                        setCategory(item.category);
                        setCategoriesDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors ${
                        activeCategory === item.category ? 'text-amber-600 font-bold bg-amber-50/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {activeCategory === item.category && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DLT Truth Action */}
            <button
              onClick={() => openDLTModal(true)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              DLT Truth
            </button>

            {/* Live Video Feeds */}
            <button
              onClick={() => {
                const el = document.getElementById('live-video-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Live Feeds
            </button>
          </nav>

          {/* Right Header Utilities: Search, User Auth / Profile, Submit CTA */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative hidden md:block w-44 xl:w-56">
              <input
                type="text"
                placeholder="Search dispatches..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-amber-400 focus:outline-none transition-all placeholder-gray-400 text-gray-800"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            </div>

            {/* User Profile / Auth Area */}
            {isGuest ? (
              <button
                onClick={() => openAuthModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-amber-500 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-600" />
                <span>Login</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Dashboard Button with Sidebar Launcher */}
                <button
                  onClick={() => openDashboard(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer border border-neutral-700"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dashboard</span>
                </button>

                {/* Instant 1-Click Logout Action */}
                <button
                  onClick={logout}
                  title="Log Out of NextTruth"
                  className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            )}

            {/* Orange Pill Submit Button (Only visible for authenticated reporters/users) */}
            {!isGuest && (
              <button
                onClick={() => openSubmitModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: '#E86328',
                  backgroundImage: 'linear-gradient(135deg, #F59E0B, #E86328)',
                }}
              >
                <Send className="w-3 h-3" />
                <span>Submit News</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
