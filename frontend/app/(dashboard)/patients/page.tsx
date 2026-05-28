"use client";
import { Users } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Patients</h1>
      <p className="text-gray-500 mb-8">View and manage patient records.</p>
      <div className="card p-16 flex flex-col items-center justify-center text-gray-400">
        <Users size={48} className="mb-4 opacity-30" />
        <p className="font-medium">Patients module coming soon</p>
      </div>
    </div>
  );
}
