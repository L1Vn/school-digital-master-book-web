import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiArrowLeft } from "react-icons/hi2";

const API_URL = "http://localhost:8000";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AUTO CEK LOGIN
  // Gunakan hook useAuth
  const { login, isAuthenticated, user } = useAuth();
  // Redirect jika sudah login
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectByRole(user);
    }
  }, [isAuthenticated, user]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(form.email, form.password);

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  }

  // REDIRECT BERDASARKAN ROLE
  function redirectByRole(user) {
    switch (user.role) {
      case "admin":
        router.replace("/admin");
        break;

      case "guru":
        router.replace("/guru");
        break;

      case "wali_kelas":
        router.replace("/walikelas");
        break;

      case "alumni":
        router.replace("/alumni/profile");
        break;

      default:
        setError("Role tidak dikenali");
    }
  }

  // UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white w-full max-w-4xl relative z-10 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Logo & Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-primary/5 to-accent/10 p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <Image
            src="/jejakedu.png"
            alt="JejakEdu Logo"
            width={300}
            height={300}
            className="object-contain drop-shadow-sm mb-6 hover:scale-105 transition-transform duration-300"
          />
          <p className="text-gray-500 mt-4 text-center text-sm font-medium leading-relaxed max-w-xs">
            Sistem Informasi Manajemen Data Siswa, Rapor dan Alumni Berbasis Digital.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900">Selamat Datang</h3>
            <p className="text-gray-500 text-sm mt-1">Silakan masuk ke akun Anda</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <HiEnvelope className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  placeholder="Masukkan email Anda"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all duration-200"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <HiLockClosed className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all duration-200"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <HiEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-white font-semibold py-4 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm text-gray-500 hover:text-primary font-semibold transition-colors"
            >
              <HiArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
              Kembali ke halaman publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
