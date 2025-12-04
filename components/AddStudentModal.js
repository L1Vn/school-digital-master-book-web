import { useState } from 'react';

export default function AddStudentModal({ open, onClose, onSave, students = [] }) {
  const [form, setForm] = useState({
    nis: "",
    nisn: "",
    name: "",
    gender: "Laki-laki",
    kelas: "",
    birth_place: "",
    birth_date: "",
    parent_name: "",
    address: "",
    phone: "",
    email: "",
    tahun_masuk: new Date().getFullYear(),
    status: "aktif"   // default
  });

  if (!open) return null;

  // Normalisasi kelas → 7-A jadi 7a, 8-B jadi 8b, dll
  function normalizeClass(k) {
    return k.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function handleSave() {
    // CEK NIS Duplicate
    if (students.some((s) => s.nis === form.nis)) {
      return alert("NIS sudah digunakan siswa lain!");
    }

    // CEK NISN Duplicate
    if (students.some((s) => s.nisn === form.nisn)) {
      return alert("NISN sudah digunakan siswa lain!");
    }

    // CEK MINIMAL 3 DIGIT
    if (form.nis.length < 3 || form.nisn.length < 3) {
      return alert("NIS dan NISN minimal 3 digit.");
    }

    // SIMPAN dengan kelas yang sudah dinormalisasi
    onSave({
      ...form,
      kelas: normalizeClass(form.kelas)
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tambah Siswa</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">✖</button>
        </div>

        {/* FORM */}
        <div className="mt-4 grid grid-cols-2 gap-4">

          <input
            placeholder="NIS"
            value={form.nis}
            onChange={(e) => setForm({ ...form, nis: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="NISN"
            value={form.nisn}
            onChange={(e) => setForm({ ...form, nisn: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="Nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded"
          />

          {/* Gender */}
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          {/* Kelas — dibuat dropdown */}
          <select
            value={form.kelas}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Pilih Kelas</option>
            <option value="7a">7-A</option>
            <option value="7b">7-B</option>
            <option value="8a">8-A</option>
            <option value="8b">8-B</option>
            <option value="9a">9-A</option>
            <option value="9b">9-B</option>
          </select>

          <input
            placeholder="Tempat Lahir"
            value={form.birth_place}
            onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="Nama Orang Tua"
            value={form.parent_name}
            onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="No. Telepon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="p-2 border rounded"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="p-2 border rounded"
          />

        </div>

        {/* BUTTONS */}
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md bg-gray-200" onClick={onClose}>
            Batal
          </button>

          <button className="px-4 py-2 rounded-md bg-primary text-white" onClick={handleSave}>
            Simpan
          </button>
        </div>

      </div>
    </div>
  );
}
