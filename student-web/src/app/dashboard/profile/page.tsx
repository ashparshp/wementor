"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, PencilLine, Check, X } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi<any>("/users/me");
        if (data) {
          setUser(data);
          setEditName(data.name);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Fallback to local storage if API fails
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const parsed = JSON.parse(userStr);
          setUser(parsed);
          setEditName(parsed.name);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!editName.trim() || editName === user.name) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      const data = await fetchApi<any>("/users/me", {
        method: "PUT",
        body: JSON.stringify({ name: editName }),
      });
      setUser(data);
      // Update local storage so navbar and layout stay in sync
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const localUser = JSON.parse(userStr);
        localUser.name = data.name;
        localStorage.setItem("user", JSON.stringify(localUser));
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#EA8A2F]/20"></div>
          <div className="h-6 bg-[#EADBCB] rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-12 text-gray-500">Failed to load profile.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-[#6B7280]">Manage your personal information and account settings.</p>
        </div>
        
        {isEditing ? (
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={() => { setIsEditing(false); setEditName(user.name); }}
              disabled={saving}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#EA8A2F] text-white text-sm font-bold rounded-xl hover:bg-[#D97706] transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : <><Check size={16} /> Save Changes</>}
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-bold rounded-xl hover:bg-[#1F2937] transition-colors shadow-sm"
          >
            <PencilLine size={16} />
            Edit Profile
          </button>
        )}
      </header>

      <div className="bg-white rounded-3xl border border-[#EADBCB] shadow-sm overflow-hidden">
        {/* Profile Header Banner */}
        <div className="h-32 bg-gradient-to-r from-[#EA8A2F]/20 to-[#FFF8F1]"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar & Name */}
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-sm border border-[#EADBCB]">
                <div className="w-full h-full rounded-full bg-[#FFF8F1] text-[#EA8A2F] flex items-center justify-center text-3xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-white border border-[#EADBCB] rounded-lg px-3 py-1 mb-1 focus:outline-none focus:ring-2 focus:ring-[#EA8A2F] w-full max-w-xs"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EA8A2F]/10 text-[#EA8A2F] text-xs font-bold uppercase tracking-wider">
                    {user.role || 'Student'}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="sm:hidden p-2 text-[#6B7280] hover:text-[#111827] bg-gray-50 rounded-lg border border-gray-200"
            >
              {isEditing ? <Check size={20} className="text-[#EA8A2F]" /> : <PencilLine size={20} />}
            </button>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-[#EADBCB] pb-2">Account Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#A08D7C] mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] mb-0.5">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#A08D7C] mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] mb-0.5">Email Address</p>
                      <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-[#EADBCB] pb-2">System Information</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#A08D7C] mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] mb-0.5">Account Role</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{user.role}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#A08D7C] mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] mb-0.5">Member Since</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
