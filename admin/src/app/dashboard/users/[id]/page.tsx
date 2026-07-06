"use client";

import { ArrowLeft, Mail, Calendar, MapPin, Clock, BookOpen, Star, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  email_verified: boolean;
}

export default function UserDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetchApi<{ data: User[] }>("/admin/users?per_page=100");
        const allUsers = res.data || [];
        const found = allUsers.find((u) => u.id === id);
        setUser(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">User Not Found</h2>
        <p className="text-gray-500 mt-2">The requested user could not be found.</p>
        <Link href="/dashboard/users" className="mt-4 inline-block text-[#F29440] hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  const status = user.email_verified ? "Active" : "Pending";
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/users" 
          className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#111827]">User Profile</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              status === "Active" 
                ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-[#F29440]/20 to-[#F29440]/5 relative">
              <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-[#F29440] to-[#E88935]">
                  <span className="text-4xl font-bold text-white">{user.name.charAt(0)}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-8 px-8">
              <h2 className="text-2xl font-bold text-[#111827]">{user.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-[#4B5563]">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              <div className="mt-8 pt-8 border-t border-[#E5E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="text-sm font-medium text-[#111827] capitalize">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Joined</span>
                  <span className="text-sm font-medium text-[#111827]">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email Verified</span>
                  <span className={`text-sm font-medium ${user.email_verified ? "text-emerald-600" : "text-amber-600"}`}>
                    {user.email_verified ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-4">User Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-sm font-semibold text-[#111827]">{user.name}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm font-semibold text-[#111827]">{user.email}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                <p className="text-sm font-mono font-medium text-[#111827] break-all">{user.id}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Account Role</p>
                <p className="text-sm font-semibold text-[#111827] capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
