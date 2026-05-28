"use client";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
      <p className="text-gray-500 mb-8">System notifications and alerts.</p>
      <div className="card p-16 flex flex-col items-center justify-center text-gray-400">
        <Bell size={48} className="mb-4 opacity-30" />
        <p className="font-medium">No notifications</p>
      </div>
    </div>
  );
}
