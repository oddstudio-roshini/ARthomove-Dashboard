"use client";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500 mb-8">Track recovery progress trends.</p>
      <div className="card p-16 flex flex-col items-center justify-center text-gray-400">
        <BarChart3 size={48} className="mb-4 opacity-30" />
        <p className="font-medium">Analytics module coming soon</p>
      </div>
    </div>
  );
}
