import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function GuruPageTemplate({ subject }) {
  const [students, setStudents] = useState([]);
  const [role, setRole] = useState("guest");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [nilai, setNilai] = useState("");

  const semesterAktif = "Ganjil 2024/2025"; // bisa dibuat dinamis nanti

  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) setStudents(JSON.parse(saved));

    const logged = localStorage.getItem("logged_in");
    setRole(logged || "guest");
  }, []);

  // ❌ Cegah guru lain masuk
  if (role !== `guru_${subject}`) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-red-600 font-semibold"
        style={{
          backgroundImage: "url('/bg-gedung.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        Akses ditolak. Anda bukan guru {subject.toUpperCase()}.
      </div>
    );
  }

  // =============================
  // FILTER SISWA — EXCLUDE ALUMNI
  // =============================
  const activeStudents = students.filter(
    (s) => s.status !== "alumni" && s.kelas && s.kelas.trim() !== ""
  );

  // =============================
  // SIMPAN NILAI FORMAT BARU
  // =============================
  function saveNilai() {
    const updated = students.map((s) =>
      s.nis === selectedStudent.nis
        ? {
            ...s,
            nilai: {
              ...s.nilai,
              [subject]: {
                mapel: subject.toUpperCase(),
                semester: semesterAktif,
                nilai: Number(nilai),
              },
            },
          }
        : s
    );

    setStudents(updated);
    localStorage.setItem("students_data", JSON.stringify(updated));
    setSelectedStudent(null);
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg-gedung.jpeg')" }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-sm w-full flex flex-col">
        <Header />

        {/* Konten Utama */}
        <div className="p-6 max-w-6xl mx-auto flex-1">
          <h1 className="text-2xl font-bold mb-4">
            Halaman Guru – Mapel: {subject.toUpperCase()}
          </h1>

          <p className="text-gray-600 mb-4">
            Jumlah siswa aktif di kelas Anda: <b>{activeStudents.length}</b>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeStudents.map((s) => {
              const nilaiMapel = s.nilai?.[subject];

              return (
                <div key={s.nis} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-gray-600">Kelas: {s.kelas}</p>

                  <div className="mt-2 text-sm">
                    {nilaiMapel ? (
                      <>
                        <p>
                          <b>Mapel:</b> {nilaiMapel.mapel}
                        </p>
                        <p>
                          <b>Semester:</b> {nilaiMapel.semester}
                        </p>
                        <p>
                          <b>Nilai:</b> {nilaiMapel.nilai}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">Belum ada nilai</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStudent(s);
                      setNilai(nilaiMapel?.nilai ?? "");
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg w-full"
                  >
                    Edit Nilai
                  </button>
                </div>
              );
            })}

            {activeStudents.length === 0 && (
              <p className="text-center text-gray-600 col-span-full">
                Tidak ada siswa aktif untuk mapel ini.
              </p>
            )}
          </div>
        </div>

        {/* MODAL EDIT NILAI */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-80">
              <h2 className="font-bold text-lg mb-3">
                Edit Nilai – {selectedStudent.name}
              </h2>

              <p className="text-sm text-gray-600 mb-2">
                Semester: <b>{semesterAktif}</b>
              </p>

              <input
                type="number"
                min="0"
                max="100"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Masukkan nilai (0–100)"
              />

              <button
                onClick={saveNilai}
                className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg"
              >
                Simpan
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="mt-2 w-full py-2 bg-gray-300 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
