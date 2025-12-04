import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function AlumniPage() {
  const [step, setStep] = useState("login"); // login | edit
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState(null);

  const [loginData, setLoginData] = useState({
    nis: "",
    birth_date: "",
  });

  const [form, setForm] = useState({});

  // ================================
  // LOAD DATA SISWA
  // ================================
  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) {
      const list = JSON.parse(saved);
      setStudents(list);
    }
  }, []);

  // ================================
  // LOGIN ALUMNI
  // ================================
  function handleLogin() {
    const found = students.find(
      (s) =>
        s.nis === loginData.nis &&
        s.birth_date === loginData.birth_date
    );

    if (!found) {
      alert("Data tidak ditemukan! Periksa kembali NIS & tanggal lahir.");
      return;
    }

    // Simpan role alumni + nama
    localStorage.setItem("logged_in", `alumni_${found.nis}`);
    localStorage.setItem("alumni_name", found.name);

    setAlumni(found);
    setForm(found);
    setStep("edit");
  }

  // ================================
  // UPDATE DATA ALUMNI
  // ================================
  function handleSave() {
    const updatedList = students.map((s) =>
      s.nis === alumni.nis ? form : s
    );

    setStudents(updatedList);
    localStorage.setItem("students_data", JSON.stringify(updatedList));

    alert("Data alumni berhasil diperbarui!");
  }

  // ================================
  // LOGOUT
  // ================================
  function handleLogout() {
    localStorage.removeItem("logged_in");
    localStorage.removeItem("alumni_name");
    setStep("login");
    setAlumni(null);
  }

  // ================================
  // LOGIN VIEW
  // ================================
  if (step === "login") {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />

        <div className="max-w-lg mx-auto mt-20 bg-white p-8 shadow-lg rounded-xl">
          <h2 className="text-2xl font-bold text-center mb-6">Login Alumni</h2>

          <p className="text-gray-600 text-center mb-6">
            Masukkan NIS dan Tanggal Lahir Anda
          </p>

          <input
            className="w-full p-3 border rounded mb-4"
            placeholder="NIS"
            value={loginData.nis}
            onChange={(e) =>
              setLoginData({ ...loginData, nis: e.target.value })
            }
          />

          <input
            type="date"
            className="w-full p-3 border rounded mb-6"
            value={loginData.birth_date}
            onChange={(e) =>
              setLoginData({ ...loginData, birth_date: e.target.value })
            }
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // EDIT VIEW (SETELAH LOGIN)
  // ================================
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />

      <div className="max-w-3xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">

        <h2 className="text-2xl font-bold text-center mb-6">
          Profil Alumni — {alumni?.name} <span className="text-blue-600">[ALUMNI]</span>
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <input
            className="p-3 border rounded bg-gray-100"
            value={form.nis}
            disabled
          />

          <input
            className="p-3 border rounded bg-gray-100"
            value={form.nisn}
            disabled
          />

          <input
            className="p-3 border rounded"
            placeholder="Nama"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            className="p-3 border rounded"
            value={form.gender || ""}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <input
            className="p-3 border rounded"
            placeholder="Kelas Terakhir"
            value={form.kelas || ""}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
          />

          <input
            className="p-3 border rounded"
            placeholder="Tempat Lahir"
            value={form.birth_place || ""}
            onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
          />

          <input
            type="date"
            className="p-3 border rounded"
            value={form.birth_date || ""}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          />

          <input
            className="p-3 border rounded"
            placeholder="Nama Orang Tua"
            value={form.parent_name || ""}
            onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
          />

          <input
            className="p-3 border rounded"
            placeholder="No. Telepon"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="p-3 border rounded"
            placeholder="Email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Simpan Perubahan
        </button>

        <button
          onClick={handleLogout}
          className="mt-3 w-full bg-gray-300 py-3 rounded-lg hover:bg-gray-400 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
