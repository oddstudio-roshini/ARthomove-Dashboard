"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, UserCog, Users, Building2, Dumbbell,
  BarChart3, Bell, Settings, LogOut, ChevronRight,
} from "lucide-react";
import { clearAuth, getUserName, getUserEmail, isLoggedIn } from "@/lib/auth";
import api from "@/lib/api";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "MAIN" },
  { label: "Doctors", href: "/doctors", icon: UserCog, section: "MANAGEMENT" },
  { label: "Patients", href: "/patients", icon: Users, section: "MANAGEMENT" },
  { label: "Clinics", href: "/clinics", icon: Building2, section: "MANAGEMENT" },
  { label: "Exercise Library", href: "/exercise-library", icon: Dumbbell, section: "MANAGEMENT" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, section: "SYSTEM" },
  { label: "Notifications", href: "/notifications", icon: Bell, section: "SYSTEM" },
  { label: "Settings", href: "/settings", icon: Settings, section: "SYSTEM" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    setUserName(getUserName() || "Admin");
    setUserEmail(getUserEmail() || "");
  }, [router]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    clearAuth();
    router.push("/login");
  };

  const sections = ["MAIN", "MANAGEMENT", "SYSTEM"];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[180px] flex-shrink-0 bg-[#1A1B2E] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">AR+</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">ARthoMove</div>
              <div className="text-gray-400 text-[10px]">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {sections.map((section) => {
            const items = navItems.filter((n) => n.section === section);
            return (
              <div key={section} className="mb-4">
                <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
                  {section}
                </div>
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors group ${
                        active
                          ? "bg-primary-600 text-white"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon size={15} className="flex-shrink-0" />
                      <span className="font-medium text-xs">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 relative">
              <span className="text-white font-bold text-xs">{userName.charAt(0)}</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1A1B2E]" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-xs leading-tight truncate">{userName}</div>
              <div className="text-gray-400 text-[10px] truncate">{userEmail}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-xs transition-colors w-full px-2 py-1.5 hover:bg-white/10 rounded-lg"
          >
            <LogOut size={13} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
