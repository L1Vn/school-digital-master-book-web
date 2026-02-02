import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../components/organisms/layout/Header";

function normalizeClass(kelas) {
  return kelas?.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function WaliKelasPage() {
  const router = useRouter();
  const { kelas } = router.query;

  const [students, setStudents] = useState([]);
  const [role, setRole] = useState("guest");

  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) setStudents(JSON.parse(saved));

    const logged = localStorage.getItem("logged_in");
    setRole(logged || "guest");
  }, []);

  // ❌ Cegah akses jika bukan wali kelas
  if (role !== `walikelas_${kelas}`) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-red-600 font-semibold"
        style={{
          backgroundImage: "url('/bg-gedung.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        Akses ditolak. Anda bukan wali kelas {kelas}.
      </div>
    );
  }

  // ==============================
  // FILTER SISWA KELAS INI
  // ==============================
  const kelasStudents = students.filter(
    (s) => normalizeClass(s.kelas) === kelas && s.status !== "alumni"
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg-gedung.jpeg')" }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-sm w-full">
        <Header />

        <div className="p-6 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Halaman Wali Kelas</h1>
          <p className="text-gray-700 mb-6">
            Anda melihat sebagai:{" "}
            <b>{`Wali Kelas ${kelas?.toUpperCase()}`}</b>
          </p>

          <h2 className="text-xl font-semibold mb-4">
            Daftar Siswa Kelas {kelas?.toUpperCase()}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kelasStudents.map((s) => {

              // ============================
              // HITUNG TOTAL & RATA-RATA
              // ============================
              const nilaiMapel = Object.values(s.nilai || {});
              const nilaiNumbers = nilaiMapel.map((x) => x.nilai ?? 0);
              const total = nilaiNumbers.reduce((a, b) => a + b, 0);
              const rata =
                nilaiNumbers.length > 0
                  ? (total / nilaiNumbers.length).toFixed(2)
                  : "-";

              return (
                <div key={s.nis} className="bg-white p-5 rounded-xl shadow">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-600">NIS: {s.nis}</p>
                  <p className="text-sm text-gray-600">NISN: {s.nisn}</p>

                  {/* DATA SISWA */}
                  <p className="mt-3 font-semibold text-gray-800">
                    <u>Data Siswa</u>
                  </p>
                  <ul className="text-sm text-gray-700">
                    <li>Jenis Kelamin: {s.gender}</li>
                    <li>Tempat Lahir: {s.birth_place}</li>
                    <li>Tanggal Lahir: {s.birth_date}</li>
                    <li>Orang Tua: {s.parent_name}</li>
                    <li>Telepon: {s.phone}</li>
                    <li>Email: {s.email}</li>
                  </ul>

                  {/* RAPORT */}
                  <p className="mt-4 font-semibold text-gray-800">
                    <u>Raport / Nilai</u>
                  </p>

                  {nilaiMapel.length > 0 ? (
                    <ul className="text-sm text-gray-700">
                      {Object.entries(s.nilai).map(([mapel, data]) => (
                        <li key={mapel} className="mt-1">
                          <b>{mapel.toUpperCase()}</b>
                          <br />
                          Semester: {data.semester}
                          <br />
                          Nilai: <b>{data.nilai}</b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">
                      Belum ada nilai.
                    </p>
                  )}

                  {/* TOTAL DAN RATA-RATA */}
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm">
                      <b>Jumlah Nilai:</b> {total}
                    </p>
                    <p className="text-sm">
                      <b>Rata-rata Nilai:</b> {rata}
                    </p>
                  </div>
                </div>
              );
            })}

            {kelasStudents.length === 0 && (
              <p className="text-gray-600 col-span-full text-center">
                Tidak ada siswa aktif di kelas ini.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
