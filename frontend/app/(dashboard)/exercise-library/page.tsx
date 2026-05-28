"use client";
import { Dumbbell } from "lucide-react";

export default function ExerciseLibraryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Exercise Library</h1>
      <p className="text-gray-500 mb-8">Manage exercises and treatment plans.</p>
      <div className="card p-16 flex flex-col items-center justify-center text-gray-400">
        <Dumbbell size={48} className="mb-4 opacity-30" />
        <p className="font-medium">Exercise Library coming soon</p>
      </div>
    </div>
  );
}
