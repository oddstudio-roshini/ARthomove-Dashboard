"use client";
import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Copy, Check } from "lucide-react";
import api from "@/lib/api";
import { Doctor } from "@/types";

interface Props {
  onClose: () => void;
  /** Called as soon as doctors are saved — use this to refresh the table immediately */
  onSuccess: (doctors: Doctor[]) => void;
}

export default function CSVUploadModal({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Doctor[] | null>(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv")) { setError("Only CSV files are supported"); return; }
    setFile(f);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/doctors/upload-csv", formData, {
        headers: { "Content-Type": undefined }, // let browser set multipart boundary
      });
      const doctors: Doctor[] = res.data.data ?? [];
      setResult(doctors);
      onSuccess(doctors); // ← table refreshes immediately, no need to wait for Done
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = (id: number, pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadCredentials = () => {
    if (!result?.length) return;
    const headers = ["Full Name", "Email (Login)", "Doctor ID (Username)", "Arthomove ID", "Clinical ID", "Temp Password"];
    const rows = result.map(d => [
      d.fullName,
      d.email,
      d.doctorId,
      d.arthomoveId,
      d.clinicalId,
      d.temporaryPassword ?? "",
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${c ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctor_credentials_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {result.length} Doctor{result.length !== 1 ? "s" : ""} Imported
                </h3>
                <p className="text-gray-400 text-sm">
                  Credentials auto-generated — share the sheet below or download it.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {result.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <p className="font-medium">No new doctors were imported.</p>
              <p className="text-sm mt-1">All emails in the file may already be registered.</p>
            </div>
          ) : (
            <>
              {/* Credentials table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    ⚠ Share these credentials securely — passwords are shown only once.
                  </p>
                  <button
                    onClick={downloadCredentials}
                    className="flex items-center gap-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors"
                  >
                    <Download size={14} />
                    Download Credentials CSV
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Doctor", "Email / Login", "Doctor ID (Username)", "Arthomove ID", "Temp Password"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{d.fullName}</div>
                            <div className="text-gray-400 text-xs">{d.clinicalId}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{d.email}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                              {d.doctorId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-primary-600 text-xs bg-primary-50 px-2 py-1 rounded-lg">
                              {d.arthomoveId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-1 rounded-lg">
                                {d.temporaryPassword}
                              </span>
                              <button
                                onClick={() => copyPassword(d.id, d.temporaryPassword ?? "")}
                                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                title="Copy password"
                              >
                                {copiedId === d.id
                                  ? <Check size={13} className="text-green-500" />
                                  : <Copy size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <p className="text-xs text-gray-400 text-center mb-3">
                  The table has already been updated. You can close this window safely.
                </p>
                <button onClick={onClose} className="btn-primary w-full py-2.5">
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Upload screen ───────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Import Doctors</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              IDs, usernames &amp; passwords are auto-generated for every row.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Format guide */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs space-y-1.5">
            <p className="font-semibold text-sm">Required CSV columns</p>
            <p className="font-mono bg-white/60 rounded px-2 py-1.5 text-xs leading-relaxed">
              firstName, lastName, email, mobile, birthYear,<br />
              specialization, clinic, status, notes
            </p>
            <p className="text-blue-500">
              Auto-generated per row: <span className="font-semibold">Arthomove ID, Clinical ID, Doctor ID (username), Password</span>
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="text-green-500" size={32} />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">{file.name}</div>
                  <div className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB · Ready to import</div>
                </div>
              </div>
            ) : (
              <>
                <Upload className="text-gray-300 mx-auto mb-3" size={40} />
                <p className="font-medium text-gray-600">Drop your CSV file here</p>
                <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Upload size={15} />
              {loading ? "Importing..." : "Upload & Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
