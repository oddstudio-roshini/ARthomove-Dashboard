"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Activity } from "lucide-react";
import { clearAuth, getUserName, getUserEmail, isLoggedIn, getUserType } from "@/lib/auth";
import api from "@/lib/api";

export default function DoctorPortalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isLoggedIn() || getUserType() !== "DOCTOR") {
      router.replace("/doctor-login");
      return;
    }
    setName(getUserName() || "Doctor");
    setEmail(getUserEmail() || "");
  }, [router]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    clearAuth();
    router.push("/doctor-login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">AR+</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 leading-none">ARthoMove</div>
            <div className="text-gray-400 text-xs">Doctor Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{name.charAt(0)}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{name}</div>
              <div className="text-gray-400 text-xs">{email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {name} 👋</h1>
          <p className="text-gray-500 mt-1">You are logged in to the ARthoMove Doctor Portal.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
              <User className="text-purple-500" size={22} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">My Profile</h3>
            <p className="text-gray-500 text-sm">View and update your doctor profile and credentials.</p>
          </div>
          <div className="card p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Activity className="text-blue-500" size={22} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">My Patients</h3>
            <p className="text-gray-500 text-sm">Access your assigned patients and treatment plans.</p>
          </div>
        </div>

        <div className="mt-8 card p-6">
          <p className="text-center text-gray-400 text-sm">
            Full doctor portal features are coming soon. Contact admin for support.
          </p>
        </div>
      </div>
    </div>
  );
}
