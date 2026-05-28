"use client";
import { useEffect, useState } from "react";
import { X, LogIn, LogOut, Monitor, Smartphone } from "lucide-react";
import api from "@/lib/api";
import { Doctor, DoctorLog } from "@/types";
import { format } from "date-fns";

interface Props {
  doctor: Doctor;
  onClose: () => void;
}

export default function DoctorLogsModal({ doctor, onClose }: Props) {
  const [logs, setLogs] = useState<DoctorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/doctors/${doctor.id}/logs`)
      .then(res => setLogs(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [doctor.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity Logs</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {doctor.fullName} · {doctor.arthomoveId}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p>No activity logs yet.</p>
              <p className="text-sm mt-1">Logs appear when the doctor logs in or out.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.action === "LOGIN" ? "bg-green-100" : "bg-gray-200"
                  }`}>
                    {log.action === "LOGIN"
                      ? <LogIn size={16} className="text-green-600" />
                      : <LogOut size={16} className="text-gray-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${log.action === "LOGIN" ? "text-green-700" : "text-gray-700"}`}>
                        {log.action === "LOGIN" ? "Logged In" : "Logged Out"}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        {log.device === "MOBILE" ? <Smartphone size={12} /> : <Monitor size={12} />}
                        <span>{log.device || "UNKNOWN"}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(log.timestamp), "dd MMM yyyy, hh:mm:ss aa")}
                    </div>
                    {log.ipAddress && (
                      <div className="text-xs text-gray-400 mt-0.5">IP: {log.ipAddress}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary w-full py-2.5">Close</button>
        </div>
      </div>
    </div>
  );
}
