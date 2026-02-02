export default function StudentCard({
  student,
  isPublic = false, // ⬅️ Prop baru untuk membedakan tampilan publik vs admin
  onEdit = () => {},
  onDelete = () => {},
  onMakeAlumni = () => {},
  onUndoAlumni = () => {},
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-soft mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{student?.name}</h3>

            {/* BADGE ALUMNI */}
            {student?.status === "alumni" && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-md font-semibold">
                ALUMNI
              </span>
            )}
          </div>

          {/* NIS dan NISN */}
          <p className="text-gray-700 text-sm font-medium">
            NIS: <span className="text-gray-900">{student?.nis}</span>
          </p>
          <p className="text-gray-700 text-sm font-medium">
            NISN: <span className="text-gray-900">{student?.nisn}</span>
          </p>

          {/* Tampilkan kelas hanya jika siswa aktif */}
          {student?.status !== "alumni" && student?.kelas && (
            <span className="inline-block mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {student?.kelas}
            </span>
          )}

          {/* Tampilkan rombel absen jika ada */}
          {student?.rombel_absen && (
            <p className="text-gray-700 text-sm mt-1">
              Rombel:{" "}
              <span className="text-gray-900 font-medium">
                {student?.rombel_absen}
              </span>
            </p>
          )}
        </div>

        {/* Tombol Aksi Admin - HANYA TAMPIL JIKA BUKAN PUBLIK */}
        {!isPublic && (
          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={() => onEdit(student)}
              className="px-3 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition font-semibold text-sm"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(student)}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold text-sm"
            >
              Hapus
            </button>

            {/* Tombol Jadikan Alumni */}
            {student?.status !== "alumni" && (
              <button
                onClick={() => onMakeAlumni(student)}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition font-semibold text-sm"
              >
                Jadikan Alumni
              </button>
            )}

            {/* Tombol Batalkan Alumni */}
            {student?.status === "alumni" && (
              <button
                onClick={() => onUndoAlumni(student)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold text-sm"
              >
                Batalkan Alumni
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail lainnya */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Jenis Kelamin</p>
            <p className="text-gray-900 font-semibold">
              {student?.gender || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Tempat Lahir</p>
            <p className="text-gray-900 font-semibold">
              {student?.birth_place || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Tanggal Lahir</p>
            <p className="text-gray-900 font-semibold">
              {student?.birth_date || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Agama</p>
            <p className="text-gray-900 font-semibold">
              {student?.religion || "-"}
            </p>
          </div>
        </div>

        {(student?.father_name || student?.parent_name) && (
          <div className="pt-2">
            <p className="text-gray-600 font-medium text-sm">Nama Orang Tua</p>
            <p className="text-gray-900 font-semibold">
              {student?.father_name || student?.parent_name}
            </p>
          </div>
        )}

        {(student?.phone || student?.email) && (
          <div className="pt-2 flex flex-wrap gap-3">
            {student?.phone && (
              <a
                href={`tel:${student.phone}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📞 {student.phone}
              </a>
            )}
            {student?.email && (
              <a
                href={`mailto:${student.email}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ✉️ {student.email}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
