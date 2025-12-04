import { useState, useEffect } from "react";

export default function EditStudentModal({ open, onClose, onSave, student, students }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (student) setForm(student);
  }, [student]);

  if (!open) return null;

  function handleSave() {

    // CEK NIS UNIK (kecuali NIS dirinya sendiri)
    if (
      students.some((s) => s.nis === form.nis && s.nis !== student.nis)
    ) {
      return setError("NIS sudah dipakai siswa lain!");
    }

    // CEK NISN UNIK (kecuali NISN dirinya)
    if (
      students.some((s) => s.nisn === form.nisn && s.nisn !== student.nisn)
    ) {
      return setError("NISN sudah dipakai siswa lain!");
    }

    onSave(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Data Siswa</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">✖</button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <input placeholder="NIS" value={form.nis || ""} onChange={(e) => setForm({ ...form, nis: e.target.value })} className="p-2 border rounded"/>

          <input placeholder="NISN" value={form.nisn || ""} onChange={(e) => setForm({ ...form, nisn: e.target.value })} className="p-2 border rounded"/>

          <input placeholder="Nama" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 border rounded"/>

          <select value={form.gender || ""} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="p-2 border rounded">
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <input placeholder="Kelas" value={form.kelas || ""} onChange={(e) => setForm({ ...form, kelas: e.target.value })} className="p-2 border rounded"/>

          <input placeholder="Tempat Lahir" value={form.birth_place || ""} onChange={(e) => setForm({ ...form, birth_place: e.target.value })} className="p-2 border rounded"/>

          <input type="date" value={form.birth_date || ""} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="p-2 border rounded"/>

          <input placeholder="Nama Orang Tua" value={form.parent_name || ""} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className="p-2 border rounded"/>

          <input placeholder="No. Telepon" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="p-2 border rounded"/>

          <input placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-2 border rounded"/>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md bg-gray-200" onClick={onClose}>
            Batal
          </button>

          <button
            className="px-4 py-2 rounded-md bg-primary text-white"
            onClick={handleSave}
          >
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
}
