import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API_URL = "https://school-digital-master-book-api-production.up.railway.app";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // AUTO CEK LOGIN
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function checkLogin() {
      try {
        const res = await fetch(`${API_URL}/api/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Token invalid");

        const user = await res.json();
        redirectByRole(user);
      } catch {
        localStorage.clear();
      }
    }

    checkLogin();
  }, []);

  // =========================
  // HANDLE LOGIN
  // =========================
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Email atau password salah");

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      redirectByRole(data.user);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // REDIRECT BERDASARKAN ROLE
  // =========================
  function redirectByRole(user) {
    switch (user.role) {
      case "admin":
        router.replace("/admin");
        break;

      case "guru":
        router.replace(`/guru/${user.mapel}`);
        break;

      case "walikelas":
        router.replace(`/walikelas/${user.kelas}`);
        break;

      case "alumni":
        router.replace(`/alumni/${user.nisn}`);
        break;

      default:
        setError("Role tidak dikenali");
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#EEF2FF]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login Sistem Akademik
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Masuk sebagai guest?{" "}
          <a href="/" className="text-primary font-semibold hover:underline">
            Lanjutkan tanpa login
          </a>
        </p>
      </div>
    </div>
  );
}