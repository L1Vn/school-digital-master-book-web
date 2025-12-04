export default function StudentCard({
  s,
  onEdit = () => {},
  onDelete = () => {},
  onMakeAlumni = () => {},
  onUndoAlumni = () => {},   // ⬅️ Tambahan penting
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-soft mb-4">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{s.name}</h3>

            {/* BADGE ALUMNI */}
            {s.status === "alumni" && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-md">
                ALUMNI
              </span>
            )}
          </div>

          {/* NIS dan NISN */}
          <p className="text-gray-600 text-sm">NIS: {s.nis}</p>
          <p className="text-gray-600 text-sm">NISN: {s.nisn}</p>

          {/* Tampilkan kelas hanya jika siswa aktif */}
          {s.status !== "alumni" && (
            <span className="inline-block mt-2 bg-lightbg text-primary px-3 py-1 rounded-full text-sm">
              {s.kelas}
            </span>
          )}
        </div>

        {/* Tombol Aksi Admin */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(s)}
            className="px-3 py-2 bg-yellow-400 text-white rounded-md"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(s)}
            className="px-3 py-2 bg-red-500 text-white rounded-md"
          >
            Hapus
          </button>

          {/* Tombol Jadikan Alumni */}
          {s.status !== "alumni" && (
            <button
              onClick={() => onMakeAlumni(s)}
              className="px-3 py-2 bg-purple-600 text-white rounded-md"
            >
              Jadikan Alumni
            </button>
          )}

          {/* Tombol Batalkan Alumni */}
          {s.status === "alumni" && (
            <button
              onClick={() => onUndoAlumni(s)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              Batalkan Alumni
            </button>
          )}
        </div>
      </div>

      {/* Detail lainnya */}
      <div className="mt-4 text-sm text-gray-600">
        <p>Jenis Kelamin: {s.gender}</p>
        <p>Tempat Lahir: {s.birth_place}</p>
        <p>Tanggal Lahir: {s.birth_date}</p>
        <p>Orang Tua: {s.parent_name}</p>
        <p>Telepon: {s.phone}</p>
        <p>Email: {s.email}</p>
      </div>
    </div>
  );
}
