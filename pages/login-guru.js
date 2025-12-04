import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginGuru() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    // Pastikan menulis role "guru"
    if (form.username === "guru" && form.password === "guru123") {
      localStorage.setItem("logged_in", "guru"); // <-- "guru"
      router.push("/"); // kembali ke halaman utama
    } else {
      setError("Username atau password salah!");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#EEF2FF]">
      <div className="bg-white p-8 rounded-2xl shadow-soft w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Login Guru</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="p-3 border rounded-lg"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 border rounded-lg"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            type="submit"
            className="bg-primary text-white py-3 rounded-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Belum login?{" "}
          <a href="/" className="text-primary">
            Lihat sebagai guest
          </a>
        </p>
      </div>
    </div>
  );
}
