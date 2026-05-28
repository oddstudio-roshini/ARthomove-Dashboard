"use client";
import { Building2 } from "lucide-react";

export default function ClinicsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Clinics</h1>
      <p className="text-gray-500 mb-8">Manage clinic and hospital profiles.</p>
      <div className="card p-16 flex flex-col items-center justify-center text-gray-400">
        <Building2 size={48} className="mb-4 opacity-30" />
        <p className="font-medium">Clinics module coming soon</p>
      </div>
    </div>
  );
}
