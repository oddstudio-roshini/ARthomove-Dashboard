"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Upload, RefreshCw, Download, Search, ChevronDown, Trash2, Users, UserCheck, UserX } from "lucide-react";
import api from "@/lib/api";
import { Doctor, DoctorStats } from "@/types";
import CreateDoctorModal from "@/components/CreateDoctorModal";
import EditDoctorModal from "@/components/EditDoctorModal";
import DoctorLogsModal from "@/components/DoctorLogsModal";
import CSVUploadModal from "@/components/CSVUploadModal";
import { format } from "date-fns";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<DoctorStats>({ totalDoctors: 0, activeDoctors: 0, inactiveDoctors: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [fetchError, setFetchError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // fetchData takes explicit params so it never reads stale state from a closure
  const fetchData = useCallback(async (s = "", st = "ALL") => {
    setLoading(true);
    setFetchError("");
    try {
      const [doctorsRes, statsRes] = await Promise.all([
        api.get("/doctors", {
          params: {
            search: s.trim() || undefined,
            status: st === "ALL" ? undefined : st,
          },
        }),
        api.get("/doctors/stats"),
      ]);
      setDoctors(doctorsRes.data.data ?? []);
      setStats(statsRes.data.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setFetchError(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(search, statusFilter);
  };

  const handleStatusChange = (s: string) => {
    setStatusFilter(s);
    setShowStatusDrop(false);
    fetchData(search, s);
  };

  const handleRefresh = () => {
    setSearch("");
    setStatusFilter("ALL");
    fetchData("", "ALL");
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!confirm(`Delete ${doctor.fullName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/doctors/${doctor.id}`);
      fetchData(search, statusFilter);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDownloadCSV = () => {
    const headers = ["ARTHOMOVE ID", "First Name", "Last Name", "Email", "Mobile", "Clinical ID", "Doctor ID", "Specialization", "Clinic", "Status"];
    const rows = doctors.map(d => [d.arthomoveId, d.firstName, d.lastName, d.email, d.mobile, d.clinicalId, d.doctorId, d.specialization, d.clinic, d.status]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "doctors.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Accounts Control</h1>
          <p className="text-gray-500 text-sm mt-1">Admin controls doctor access and permissions.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <ChevronDown size={16} />
              More
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => { setShowCSV(true); setShowDropdown(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Upload size={15} className="text-gray-500" />
                  Upload CSV
                </button>
                <button
                  onClick={() => { setShowCreate(true); setShowDropdown(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <Plus size={15} className="text-gray-500" />
                  Create Doctor
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            Create Doctor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "TOTAL DOCTORS", value: stats.totalDoctors, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "ACTIVE DOCTORS", value: stats.activeDoctors, icon: UserCheck, color: "text-green-500", bg: "bg-green-50" },
          { label: "INACTIVE DOCTORS", value: stats.inactiveDoctors, icon: UserX, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</span>
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={s.color} size={16} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Directory */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Doctors Directory</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Updated {format(lastUpdated, "hh:mm aa")}</span>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
              <button onClick={handleDownloadCSV} className="p-1.5 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors">
                <Download size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors by name, clinical ID, email..."
                className="input-field pl-10 text-sm py-2.5"
              />
            </form>

            <div className="relative">
              <button
                onClick={() => setShowStatusDrop(!showStatusDrop)}
                className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white hover:bg-gray-50 min-w-[120px] justify-between"
              >
                <span>{statusFilter === "ALL" ? "All Status" : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}</span>
                <ChevronDown size={14} />
              </button>
              {showStatusDrop && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {["ALL", "ACTIVE", "INACTIVE"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 ${statusFilter === s ? "text-primary-600 font-medium" : "text-gray-700"}`}
                    >
                      {s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {fetchError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{fetchError}</div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={40} className="mb-3 opacity-40" />
              <p className="font-medium">No doctors found.</p>
              <button onClick={() => setShowCreate(true)} className="text-primary-600 text-sm mt-2 hover:underline">
                Create your first doctor →
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-6 py-3">Arthomove ID</th>
                  <th className="text-left px-6 py-3">Doctor</th>
                  <th className="text-left px-6 py-3">Clinical ID</th>
                  <th className="text-left px-6 py-3">Doctor ID</th>
                  <th className="text-left px-6 py-3">Mobile</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Last Login</th>
                  <th className="text-left px-6 py-3">Device</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg">
                        {doctor.arthomoveId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{doctor.fullName}</div>
                          <div className="text-gray-400 text-xs">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doctor.clinicalId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doctor.doctorId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doctor.mobile || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        doctor.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {doctor.lastLogin ? format(new Date(doctor.lastLogin), "dd MMM hh:mm aa") : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doctor.lastDevice || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedDoctor(doctor); setShowEdit(true); }}
                          className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setSelectedDoctor(doctor); setShowLogs(true); }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => handleDelete(doctor)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateDoctorModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setSearch("");
            setStatusFilter("ALL");
            fetchData("", "ALL");
          }}
        />
      )}
      {showEdit && selectedDoctor && (
        <EditDoctorModal
          doctor={selectedDoctor}
          onClose={() => { setShowEdit(false); setSelectedDoctor(null); }}
          onUpdated={() => {
            setShowEdit(false);
            setSelectedDoctor(null);
            fetchData(search, statusFilter);
          }}
        />
      )}
      {showLogs && selectedDoctor && (
        <DoctorLogsModal
          doctor={selectedDoctor}
          onClose={() => { setShowLogs(false); setSelectedDoctor(null); }}
        />
      )}
      {showCSV && (
        <CSVUploadModal
          onClose={() => setShowCSV(false)}
          onSuccess={() => {
            // Table refreshes immediately when import completes.
            // Modal stays open so the user can view / download credentials.
            setSearch("");
            setStatusFilter("ALL");
            fetchData("", "ALL");
          }}
        />
      )}
    </div>
  );
}
