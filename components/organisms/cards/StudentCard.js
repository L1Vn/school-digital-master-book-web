import { 
  HiAcademicCap, 
  HiMapPin, 
  HiBuildingLibrary, 
  HiSparkles, 
  HiUserGroup, 
  HiPhone, 
  HiEnvelope, 
  HiPencil, 
  HiTrash, 
  HiArrowUturnLeft 
} from "react-icons/hi2";

export default function StudentCard({
  student,
  isPublic = false,
  onEdit = () => {},
  onDelete = () => {},
  onMakeAlumni = () => {},
  onUndoAlumni = () => {},
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full relative">
      {/* CARD HEADER (Gradient & Badge) */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 relative overflow-hidden">
        {/* Dekorasi pola SVG */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-15 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-2" title={student?.name}>
              {student?.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                Siswa
              </span>
              {student?.status === "alumni" && (
                <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  ★ ALUMNI
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner flex-shrink-0 ml-3">
            <HiAcademicCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
        <div className="space-y-4">
          
          {/* IDENTITAS POKOK */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">NISN</p>
              <p className="text-sm font-bold text-gray-900">{student?.nisn || "-"}</p>
            </div>
            {/* Hanya tampilkan NIS jika BUKAN publik */}
            {!isPublic && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">NIS</p>
                <p className="text-sm font-bold text-gray-900">{student?.nis || "-"}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Jenis Kelamin</p>
              <p className="text-sm font-semibold text-gray-900">
                {student?.gender_label || (student?.gender === 'L' ? 'Laki-laki' : student?.gender === 'P' ? 'Perempuan' : student?.gender) || "-"}
              </p>
            </div>
            
            {/* Tampilkan kelas hanya jika siswa aktif dan BUKAN publik */}
            {!isPublic && student?.status !== "alumni" && student?.kelas && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Kelas</p>
                <p className="text-sm font-semibold text-primary bg-primary/10 inline-block px-2 py-0.5 rounded-md">
                  {student?.kelas}
                </p>
              </div>
            )}
          </div>

          {/* INFORMASI LAHIR (Tampil untuk publik dan admin) */}
          <div className="flex items-start gap-3">
            <HiMapPin className="text-gray-400 mt-1 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-800 font-medium leading-snug">
                {student?.birth_place || "-"}, {student?.birth_date || "-"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Tempat & Tanggal Lahir</p>
            </div>
          </div>

          {/* DATA TAMBAHAN - HANYA ADMIN */}
          {!isPublic && (
            <>
              {/* Rombel */}
              {student?.classroom && (
                <div className="flex items-start gap-3">
                  <HiBuildingLibrary className="text-gray-400 mt-1 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-snug">
                      {student.classroom.name}-{student.absen_number}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Rombel Absen</p>
                  </div>
                </div>
              )}
              
              {/* Agama */}
              <div className="flex items-start gap-3">
                <HiSparkles className="text-gray-400 mt-1 w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-800 font-medium leading-snug">
                    {student?.religion || "-"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Agama</p>
                </div>
              </div>

              {/* Orang Tua */}
              {(student?.father_name || student?.parent_name) && (
                <div className="flex items-start gap-3">
                  <HiUserGroup className="text-gray-400 mt-1 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-snug">
                      {student?.father_name || student?.parent_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Nama Orang Tua</p>
                  </div>
                </div>
              )}

              {/* Kontak */}
              {(student?.phone || student?.email) && (
                <div className="pt-3 mt-3 border-t border-gray-100 flex flex-wrap gap-4">
                  {student?.phone && (
                    <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 text-primary hover:text-primary-dark transition-colors text-sm font-medium bg-primary/5 px-2.5 py-1 rounded-lg">
                      <HiPhone className="w-4 h-4" /> {student.phone}
                    </a>
                  )}
                  {student?.email && (
                    <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 text-primary hover:text-primary-dark transition-colors text-sm font-medium bg-primary/5 px-2.5 py-1 rounded-lg">
                      <HiEnvelope className="w-4 h-4" /> {student.email}
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS (HANYA ADMIN) */}
      {!isPublic && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 justify-end opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(student)}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold text-sm shadow-sm flex items-center gap-1.5"
          >
            <HiPencil className="w-4 h-4" /> Edit
          </button>

          <button
            onClick={() => onDelete(student)}
            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all font-semibold text-sm shadow-sm flex items-center gap-1.5"
          >
            <HiTrash className="w-4 h-4" /> Hapus
          </button>

          {student?.status !== "alumni" && (
            <button
              onClick={() => onMakeAlumni(student)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-semibold text-sm shadow-sm flex items-center gap-1.5 ml-auto w-full sm:w-auto justify-center mt-2 sm:mt-0"
            >
              <HiAcademicCap className="w-4 h-4" /> Jadikan Alumni
            </button>
          )}

          {student?.status === "alumni" && (
            <button
              onClick={() => onUndoAlumni(student)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all font-semibold text-sm shadow-sm flex items-center gap-1.5 ml-auto w-full sm:w-auto justify-center mt-2 sm:mt-0"
            >
              <HiArrowUturnLeft className="w-4 h-4" /> Batalkan Alumni
            </button>
          )}
        </div>
      )}
    </div>
  );
}
