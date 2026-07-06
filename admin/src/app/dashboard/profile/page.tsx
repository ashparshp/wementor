"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { User, Shield, KeyRound, AlertCircle, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Loading user details...</div>;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await fetchApi<any>("/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password. Check your current password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#111827]">Account Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: User Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-[#F29440]/20 to-[#F29440]/5 relative">
              <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-[#F29440] to-[#E88935]">
                  <span className="text-4xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="pt-16 pb-8 px-8">
              <h2 className="text-2xl font-bold text-[#111827]">{user.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user.role} Account</p>

              <div className="mt-8 pt-8 border-t border-[#E5E7EB] space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</label>
                  <span className="text-sm font-medium text-[#111827] break-all">{user.email}</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">User ID</label>
                  <span className="text-xs font-mono font-medium text-[#6B7280] break-all">{user.id}</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Status</label>
                  <span className="inline-flex items-center mt-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Change Password Form */}
        <div className="lg:col-span-2 space-y-6" id="password">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-6 mb-6">
              <div className="p-3 bg-[#FDF8F5] rounded-2xl text-[#F29440]">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Security & Password</h3>
                <p className="text-sm text-gray-500">Update your account credentials below.</p>
              </div>
            </div>

            {/* Notification Banners */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-700">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#F29440] hover:bg-[#E88935] text-white font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
