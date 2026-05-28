"use client";
import { useState } from "react";
import { X, Copy, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { Doctor } from "@/types";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const specializations = [
  "Orthopedic Surgery", "Sports Medicine", "Physical Therapy",
  "Rheumatology", "Neurology", "General Medicine", "Pediatrics", "Other",
];

export default function CreateDoctorModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", mobile: "",
    birthYear: "", specialization: "", clinic: "", status: "ACTIVE", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Doctor | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/doctors", {
        ...form,
        birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
      });
      setCreated(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create doctor");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (created?.temporaryPassword) {
      navigator.clipboard.writeText(created.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (created) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle className="text-green-600" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Doctor Created!</h3>
          <p className="text-gray-500 text-sm text-center mb-6">Share these credentials with the doctor.</p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">ARthoMove ID</span>
              <span className="font-bold text-primary-600 text-sm">{created.arthomoveId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Clinical ID</span>
              <span className="font-semibold text-gray-700 text-sm">{created.clinicalId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Doctor ID</span>
              <span className="font-semibold text-gray-700 text-sm">{created.doctorId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Email</span>
              <span className="font-semibold text-gray-700 text-sm">{created.email}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Temp Password</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-900 text-sm bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                  {created.temporaryPassword}
                </span>
                <button onClick={copyPassword} className="text-gray-400 hover:text-gray-600">
                  {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button onClick={() => onCreated()} className="btn-primary w-full py-3">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Doctor</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Enter doctor identity fields. Username and temporary password are auto-generated.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input name="firstName" value={form.firstName} onChange={handleChange}
                placeholder="Martin" className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input name="lastName" value={form.lastName} onChange={handleChange}
                placeholder="Rao" className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Birth Year
              </label>
              <input name="birthYear" value={form.birthYear} onChange={handleChange}
                placeholder="1985" type="number" min="1900" max="2010" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Temporary Password <span className="text-gray-400">(Auto)</span>
              </label>
              <input value="Doctor#XXXXXXX" disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Mobile Number
              </label>
              <input name="mobile" value={form.mobile} onChange={handleChange}
                placeholder="9876543210" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input name="email" value={form.email} onChange={handleChange}
                placeholder="doctor@clinic.com" type="email" className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Specialization
              </label>
              <select name="specialization" value={form.specialization} onChange={handleChange} className="input-field">
                <option value="">Select specialization</option>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Clinic / Hospital
              </label>
              <input name="clinic" value={form.clinic} onChange={handleChange}
                placeholder="City Medical Center" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Notes
              </label>
              <input name="notes" value={form.notes} onChange={handleChange}
                placeholder="Optional notes..." className="input-field" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary px-8">
              {loading ? "Creating..." : "Create Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
