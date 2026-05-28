"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Shield, BarChart3, UserCog, Users, Building2, Dumbbell } from "lucide-react";
import { getUserName } from "@/lib/auth";
import { format } from "date-fns";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Admin");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setUserName(getUserName() || "Admin");
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const features = [
    { icon: Zap, title: "Real-time updates", desc: "Live patient activity monitoring", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Shield, title: "Secure access", desc: "Role-based permissions enforced", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: BarChart3, title: "Analytics", desc: "Track recovery progress trends", color: "text-pink-500", bg: "bg-pink-50" },
  ];

  const quickAccess = [
    { title: "Doctors", desc: "Manage doctor accounts and access", href: "/doctors", icon: UserCog, color: "text-purple-500", bg: "bg-purple-50", link: "text-purple-600" },
    { title: "Patients", desc: "View and manage patient records", href: "/patients", icon: Users, color: "text-blue-500", bg: "bg-blue-50", link: "text-blue-600" },
    { title: "Clinics", desc: "Manage clinic and hospital profiles", href: "/clinics", icon: Building2, color: "text-green-500", bg: "bg-green-50", link: "text-green-600" },
    { title: "Exercise Library", desc: "Manage exercises and treatment plans", href: "/exercise-library", icon: Dumbbell, color: "text-orange-500", bg: "bg-orange-50", link: "text-orange-600" },
  ];

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-gray-500 text-sm mb-1">{today}</p>
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's an overview of the ARthoMove admin portal.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">System Online</span>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {features.map((f) => (
          <div key={f.title} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <f.icon className={f.color} size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{f.title}</div>
              <div className="text-gray-500 text-xs mt-0.5">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Quick Access</h2>
        <span className="text-sm text-gray-400">{quickAccess.length} sections</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {quickAccess.map((item) => (
          <div key={item.title} className="card p-6 flex flex-col gap-4">
            <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center`}>
              <item.icon className={item.color} size={24} />
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-1">{item.title}</div>
              <div className="text-gray-500 text-sm mb-3">{item.desc}</div>
              <Link href={item.href} className={`${item.link} text-sm font-medium hover:underline`}>
                Open →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
