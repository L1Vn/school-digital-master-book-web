import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import StatsCards from "../components/StatsCards";
import initialStudents from "../data/students";

// Komponen Card untuk Guest/Public
function PublicStudentCard({ s }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="font-semibold">{s.name}</h3>
      <p>NIS: {s.nis}</p>
      {s.nisn && <p>NISN: {s.nisn}</p>}
      {s.kelas && <p>Kelas: {s.kelas}</p>}

      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            s.status === "alumni"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {s.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default function PublicHome() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");

  const bgStyle = { backgroundImage: "url('/bg-gedung.jpeg')" };

  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) setStudents(JSON.parse(saved));
    else {
      const withStatus = initialStudents.map((s) => ({ ...s, status: "siswa" }));
      setStudents(withStatus);
      localStorage.setItem("students_data", JSON.stringify(withStatus));
    }
  }, []);

  const filteredStudents = useMemo(() => {
    const q = query.toLowerCase().trim();
    return students.filter(
      (s) =>
        !q ||
        s.nis.toLowerCase().includes(q) ||
        s.nisn?.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.kelas && s.kelas.toLowerCase().includes(q))
    );
  }, [query, students]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={bgStyle}>
      <div className="min-h-screen bg-white/70 backdrop-blur-sm w-full">
        <Header />

        <div className="w-full px-6 md:px-10 py-10">
          <h1 className="text-3xl font-semibold text-center mb-2">Buku Induk Siswa</h1>
          <p className="text-center text-gray-600 mb-8">Anda melihat sebagai: <b>GUEST</b></p>

          <div className="mb-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari siswa (Nama / NIS / NISN)..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            />
          </div>

          <StatsCards students={students} />

          <h2 className="text-xl font-bold mt-10 mb-5">Siswa Aktif</h2>
          <div className="grid gap-4 w-full">
            {filteredStudents.filter((s) => s.status !== "alumni").map((s) => (
              <PublicStudentCard key={s.nis} s={s} />
            ))}
          </div>

          <h2 className="text-xl font-bold mt-10 mb-5">Alumni</h2>
          <div className="grid gap-4 w-full">
            {filteredStudents.filter((s) => s.status === "alumni").map((s) => (
              <PublicStudentCard key={s.nis} s={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
