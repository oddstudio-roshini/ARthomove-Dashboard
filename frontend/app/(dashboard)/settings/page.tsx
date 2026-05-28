"use client";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Configure portal settings.</p>
      <div className="card p-16 flex flex-col items-center justify-center text-gray-400">
        <Settings size={48} className="mb-4 opacity-30" />
        <p className="font-medium">Settings coming soon</p>
      </div>
    </div>
  );
}
