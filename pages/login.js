import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  // =========================
  //  AKUN GURU MAPEL
  // =========================
  const guruAccounts = {
    mtk: { username: "guru_mtk", password: "mtk123" },
    ipa: { username: "guru_ipa", password: "ipa123" },
    ips: { username: "guru_ips", password: "ips123" },
    bing: { username: "guru_bing", password: "bing123" },
    bindo: { username: "guru_bindo", password: "bindo123" },
  };

  // =========================
  //  AKUN WALI KELAS
  // =========================
  const waliAccounts = {
    "7a": { username: "wali_7a", password: "7a123" },
    "7b": { username: "wali_7b", password: "7b123" },
    "8a": { username: "wali_8a", password: "8a123" },
    "8b": { username: "wali_8b", password: "8b123" },
    "9a": { username: "wali_9a", password: "9a123" },
    "9b": { username: "wali_9b", password: "9b123" },
  };

  const [role, setRole] = useState("admin");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  // DATA SISWA (untuk alumni)
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) setStudents(JSON.parse(saved));
  }, []);

  // =========================
  //  HANDLE LOGIN
  // =========================
  function handleLogin(e) {
    e.preventDefault();

    // ======== LOGIN ADMIN ========
    if (
      role === "admin" &&
      form.username === "admin" &&
      form.password === "admin123"
    ) {
      localStorage.setItem("logged_in", "admin");
      return router.push("/");
    }

    // ======== LOGIN GURU MAPEL ========
    if (role === "guru") {
      for (const mapel in guruAccounts) {
        const acc = guruAccounts[mapel];
        if (form.username === acc.username && form.password === acc.password) {
          localStorage.setItem("logged_in", `guru_${mapel}`);
          return router.push(`/guru/${mapel}`);
        }
      }
      return setError("Username atau password guru salah!");
    }

    // ======== LOGIN WALI KELAS ========
    if (role === "walikelas") {
      for (const kelas in waliAccounts) {
        const acc = waliAccounts[kelas];
        if (form.username === acc.username && form.password === acc.password) {
          localStorage.setItem("logged_in", `walikelas_${kelas}`);
          return router.push(`/walikelas/${kelas}`);
        }
      }
      return setError("Akun wali kelas salah!");
    }

    // ======== LOGIN ALUMNI ========
    if (role === "alumni") {
      const user = students.find((s) => s.nisn === form.username);

      if (!user) return setError("NISN tidak ditemukan!");

      if (user.birth_date !== form.password)
        return setError("Password salah! Gunakan format YYYY-MM-DD");

      localStorage.setItem("logged_in", `alumni_${user.nisn}`);
      return router.push(`/alumni/${user.nisn}`);
    }

    setError("Username atau password salah!");
  }

  // =========================
  //  RETURN UI LOGIN
  // =========================
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#EEF2FF]">
      <div className="bg-white p-8 rounded-2xl shadow-soft w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Login Sistem</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => setRole("admin")}
            className={`py-2 rounded-lg border ${
              role === "admin" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            Admin
          </button>

          <button
            onClick={() => setRole("guru")}
            className={`py-2 rounded-lg border ${
              role === "guru" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            Guru Mapel
          </button>

          <button
            onClick={() => setRole("walikelas")}
            className={`py-2 rounded-lg border ${
              role === "walikelas" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            Wali Kelas
          </button>

          <button
            onClick={() => setRole("alumni")}
            className={`py-2 rounded-lg border ${
              role === "alumni" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            Alumni
          </button>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={
              role === "alumni"
                ? "Masukkan NISN"
                : "Username"
            }
            className="p-3 border rounded-lg"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type={role === "alumni" ? "text" : "password"}
            placeholder={
              role === "alumni"
                ? "Password = Tanggal Lahir (YYYY-MM-DD)"
                : "Password"
            }
            className="p-3 border rounded-lg"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            className="bg-primary text-white py-3 rounded-lg"
          >
            Login sebagai{" "}
            {role === "admin"
              ? "Admin"
              : role === "guru"
              ? "Guru Mapel"
              : role === "walikelas"
              ? "Wali Kelas"
              : "Alumni"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Masuk sebagai guest?{" "}
          <a href="/" className="text-primary font-semibold">
            Lanjutkan tanpa login
          </a>
        </p>
      </div>
    </div>
  );
}
