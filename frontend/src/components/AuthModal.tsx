import React, { useState } from 'react';
import { useApp } from '../context';
import { X, Lock, Mail, User, AlertCircle, CheckCircle2, LogIn, UserPlus } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, openAuthModal, loginWithCredentials, registerNewAccount } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState<'USER' | 'JOURNALIST' | 'EXPERT'>('USER');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithCredentials(email.trim(), password.trim() || undefined);
      setSuccessMsg('Authenticated successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        openAuthModal(false);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Full name and email are required.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await registerNewAccount({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || 'password123',
        role,
        bio: bio.trim() || undefined,
      });
      setSuccessMsg('Account created and authenticated successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        openAuthModal(false);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl my-8 border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              {mode === 'LOGIN' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {mode === 'LOGIN' ? 'Login to NextTruth' : 'Create NextTruth Account'}
              </h3>
              <p className="text-xs text-neutral-400">
                {mode === 'LOGIN' ? 'Access verified ground reports & citizen desk' : 'Join independent truth network'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openAuthModal(false)}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/60 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === 'LOGIN'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === 'REGISTER'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Create New Account
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 sm:p-7 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. citizen@nexttruth.media"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 text-gray-900"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 text-gray-900"
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                style={{
                  backgroundColor: '#E86328',
                  backgroundImage: 'linear-gradient(135deg, #F59E0B, #E86328)',
                }}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>

              {/* Toggle to Register */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
                >
                  Don't have an account? <span className="underline font-bold">Create new account</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 text-gray-900"
                  />
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 text-gray-900"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 text-gray-900"
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Reporting Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500 text-gray-900 cursor-pointer"
                >
                  <option value="USER">Citizen Eyewitness Reporter</option>
                  <option value="JOURNALIST">Staff Investigative Journalist</option>
                  <option value="EXPERT">Ground Policy Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Short Bio / Background
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eyewitness delegate in Sector 4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500 text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                style={{
                  backgroundColor: '#E86328',
                  backgroundImage: 'linear-gradient(135deg, #F59E0B, #E86328)',
                }}
              >
                {loading ? 'Creating Account...' : 'Register & Log In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
                >
                  Already have an account? <span className="underline font-bold">Login here</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
