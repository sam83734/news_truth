import React, { useState, useRef } from 'react';
import { useApp } from '../context';
import {
  X,
  User,
  Camera,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ShieldCheck,
  Upload,
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    openProfileModal,
    updateProfileData,
    changePassword,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile Form state
  const [name, setName] = useState(() => currentUser?.name || '');
  const [bio, setBio] = useState(() => currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(() => currentUser?.avatarUrl || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevUser, setPrevUser] = useState(currentUser);
  if (currentUser !== prevUser) {
    setPrevUser(currentUser);
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }

  if (!isProfileModalOpen || !currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Photo size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      setProfileError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await updateProfileData({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      setProfileSuccess('Profile details and photo updated successfully!');
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                My Profile & Account Security
              </h3>
              <p className="text-xs text-neutral-400">
                Manage personal profile photo, credentials and security keys
              </p>
            </div>
          </div>

          <button
            onClick={() => openProfileModal(false)}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Summary Banner */}
        <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={
                  avatarUrl ||
                  currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
                }
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-gray-900">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{currentUser.email}</div>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
            {currentUser.roleBadge || currentUser.role}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 px-6 pt-3 bg-white gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Photo
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {profileSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                  <img
                    src={
                      avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
                    }
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="text-xs font-extrabold text-gray-800">
                    Profile Avatar / Photo
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Upload a high-resolution JPG or PNG (max 5MB). Click to browse file from your device.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-600" /> Choose Photo
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Account Email (Anchored Identity)
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  readOnly
                  disabled
                  className="w-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 rounded-xl p-3 cursor-not-allowed"
                />
              </div>

              {/* Bio / Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bio / Field Credential Note
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell readers or the editorial board about your ground reporting beat..."
                  className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:border-amber-500 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:border-amber-500 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:border-amber-500 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  After changing password, your DLT session token will be re-anchored on the ledger.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  {passwordSaving ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
