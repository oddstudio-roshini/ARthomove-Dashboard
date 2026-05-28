"use client";
import { useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import { Doctor } from "@/types";

interface Props {
  doctor: Doctor;
  onClose: () => void;
  onUpdated: () => void;
}

const specializations = [
  "Orthopedic Surgery", "Sports Medicine", "Physical Therapy",
  "Rheumatology", "Neurology", "General Medicine", "Pediatrics", "Other",
];

export default function EditDoctorModal({ doctor, onClose, onUpdated }: Props) {
  const [form, setForm] = useState({
    firstName: doctor.firstName || "",
    lastName: doctor.lastName || "",
    email: doctor.email || "",
    mobile: doctor.mobile || "",
    birthYear: doctor.birthYear?.toString() || "",
    specialization: doctor.specialization || "",
    clinic: doctor.clinic || "",
    status: doctor.status || "ACTIVE",
    notes: doctor.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.put(`/doctors/${doctor.id}`, {
        ...form,
        birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
      });
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Doctor</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {doctor.arthomoveId} · {doctor.clinicalId}
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mobile</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Birth Year</label>
              <input name="birthYear" value={form.birthYear} onChange={handleChange} type="number" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Specialization</label>
              <select name="specialization" value={form.specialization} onChange={handleChange} className="input-field">
                <option value="">Select specialization</option>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Clinic / Hospital</label>
              <input name="clinic" value={form.clinic} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="input-field resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary px-8">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
