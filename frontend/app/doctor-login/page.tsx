"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Activity } from "lucide-react";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Change password state
  const [mustChange, setMustChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingName, setPendingName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/doctor/login", { email, password });
      const data = res.data.data;
      if (data.mustChangePassword) {
        setPendingToken(data.token);
        setPendingEmail(data.email);
        setPendingName(data.name);
        setCurrentPassword(password);
        setMustChange(true);
      } else {
        setAuth(data.token, data.userType, data.name, data.email);
        router.push("/doctor-portal");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    if (newPassword !== confirmPassword) {
      setChangeError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setChangeError("Password must be at least 8 characters");
      return;
    }
    setChangeLoading(true);
    try {
      // temporarily set the token to make the authenticated call
      localStorage.setItem("token", pendingToken);
      await api.post("/auth/doctor/change-password", {
        currentPassword,
        newPassword,
      });
      setAuth(pendingToken, "DOCTOR", pendingName, pendingEmail);
      router.push("/doctor-portal");
    } catch (err: any) {
      localStorage.removeItem("token");
      setChangeError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangeLoading(false);
    }
  };

  if (mustChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">AR+</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">ARthoMove</div>
                <div className="text-gray-400 text-xs">Doctor Portal</div>
              </div>
            </div>

            <div className="mb-2 inline-flex items-center px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
              <span className="text-amber-600 text-xs font-medium">First Login — Change Password Required</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-1">Set New Password</h2>
            <p className="text-gray-500 text-sm mb-8">
              For security, please set a new password before continuing.
            </p>

            {changeError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {changeError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Current (Temporary) Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="input-field pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={changeLoading} className="btn-primary w-full py-3 text-base">
                {changeLoading ? "Saving..." : "Set Password & Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1B2E] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AR+</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">ARthoMove</div>
              <div className="text-gray-400 text-xs">Doctor Portal</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center mb-8">
              <Activity className="text-primary-400" size={28} />
            </div>
            <h1 className="text-white text-4xl font-bold leading-tight mb-4">
              Doctor<br />Access Portal
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Access your patient data, treatment plans, and exercise library from one place.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              "View assigned patients",
              "Access treatment plans",
              "Exercise library",
              "Secure credential management",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                {feat}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-gray-500 text-xs">© 2024 ARthoMove. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Doctor Sign In</h2>
            <p className="text-gray-500 text-sm mb-8">Sign in to your doctor account</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/login" className="text-sm text-primary-600 hover:underline">
                Admin login →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
