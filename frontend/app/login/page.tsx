"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Fingerprint, Activity } from "lucide-react";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", { email, password });
      const { token, userType, name, email: userEmail } = res.data.data;
      setAuth(token, userType, name, userEmail);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!email) { setError("Enter your email first"); return; }
    setPasskeyLoading(true);
    setError("");
    try {
      const optRes = await api.post("/auth/passkey/register/options", { email, userType: "ADMIN" });
      const options = optRes.data.data;
      const challenge = base64UrlToBuffer(options.challenge);
      const userId = base64UrlToBuffer(options.user.id);

      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge,
          user: { ...options.user, id: userId },
          excludeCredentials: (options.excludeCredentials || []).map((c: any) => ({
            ...c,
            id: base64UrlToBuffer(c.id),
          })),
        },
      }) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAttestationResponse;
      const credJson = JSON.stringify({
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          attestationObject: bufferToBase64Url(response.attestationObject),
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      });

      await api.post("/auth/passkey/register/verify", { email, userType: "ADMIN", credential: credJson });
      setError("");
      alert("Passkey registered successfully! You can now sign in with passkey.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register passkey");
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSignInWithPasskey = async () => {
    if (!email) { setError("Enter your email first"); return; }
    setPasskeyLoading(true);
    setError("");
    try {
      const optRes = await api.post("/auth/passkey/authenticate/options", { email });
      const options = optRes.data.data;
      const challenge = base64UrlToBuffer(options.challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge,
          allowCredentials: (options.allowCredentials || []).map((c: any) => ({
            ...c,
            id: base64UrlToBuffer(c.id),
          })),
        },
      }) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAssertionResponse;
      const credJson = JSON.stringify({
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          authenticatorData: bufferToBase64Url(response.authenticatorData),
          signature: bufferToBase64Url(response.signature),
          userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      });

      const verRes = await api.post("/auth/passkey/authenticate/verify", { email, credential: credJson });
      const { token, userType, name, email: userEmail } = verRes.data.data;
      setAuth(token, userType, name, userEmail);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Passkey authentication failed");
    } finally {
      setPasskeyLoading(false);
    }
  };

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
              <div className="text-gray-400 text-xs">Admin Portal</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center mb-8">
              <Activity className="text-primary-400" size={28} />
            </div>
            <h1 className="text-white text-4xl font-bold leading-tight mb-4">
              Doctor Account<br />Management System
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Manage doctor profiles, control access, and monitor activity from a single unified dashboard.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              "Auto-generated secure credentials",
              "Real-time access control",
              "Comprehensive audit trail",
              "Passwordless login with Passkeys",
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
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-8">Sign in to your admin account</p>

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
                    placeholder="admin@arthomove.com"
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

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-gray-400 text-sm">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSignInWithPasskey}
                disabled={passkeyLoading}
                className="w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Fingerprint size={18} className="text-primary-600" />
                {passkeyLoading ? "Authenticating..." : "Sign in with Passkey"}
              </button>

              <button
                type="button"
                onClick={handleRegisterPasskey}
                disabled={passkeyLoading}
                className="w-full bg-primary-600 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                <Fingerprint size={18} />
                {passkeyLoading ? "Processing..." : "Register Passkey"}
              </button>
              <p className="text-center text-xs text-gray-400">Enter your email above to use a passkey</p>
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-xl text-center">
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Default credentials: </span>
                <span className="text-primary-600">admin@arthomove.com / Admin@123</span>
              </span>
            </div>

            <div className="mt-4 text-center">
              <a href="/doctor-login" className="text-sm text-primary-600 hover:underline">
                Doctor login →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
