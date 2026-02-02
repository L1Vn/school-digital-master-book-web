export default function AlumniCard({ alumni, isPublic = false }) {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 hover:shadow-md transition-all">
      {/* Header - Name and Graduation */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900">{alumni.name}</h3>

          {/* NIS, NISN, dan NIM */}
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-700 font-medium">
              NIS:{" "}
              <span className="text-gray-900 font-bold">
                {alumni.nis || "-"}
              </span>
            </p>
            <p className="text-sm text-gray-700 font-medium">
              NISN:{" "}
              <span className="text-gray-900 font-bold">
                {alumni.nisn || "-"}
              </span>
            </p>
            <p className="text-sm text-gray-700 font-medium">
              NIM:{" "}
              <span className="text-blue-600 font-bold">
                {alumni.nim || "-"}
              </span>
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-bold shadow-sm">
          {alumni.graduation_year}
        </span>
      </div>

      {/* Education Info */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Kelas</p>
            <p className="font-bold text-gray-900">
              {alumni.class_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Jurusan</p>
            <p className="font-bold text-gray-900">{alumni.major || "-"}</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="space-y-3 text-sm">
        {/* Job */}
        {alumni.job_title && (
          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
            <span className="text-xl">💼</span>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{alumni.job_title}</p>
              {alumni.job_company && (
                <p className="text-gray-700 font-medium">
                  {alumni.job_company}
                </p>
              )}
              {alumni.job_start && (
                <p className="text-xs text-gray-600 font-medium mt-1">
                  {alumni.job_start}{" "}
                  {alumni.job_end ? `- ${alumni.job_end}` : "- Sekarang"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* University */}
        {alumni.university_name && (
          <div className="flex items-start gap-2 bg-purple-50 p-3 rounded-lg">
            <span className="text-xl">🎓</span>
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                {alumni.university_name}
              </p>
              {alumni.university_major && (
                <p className="text-gray-700 font-medium">
                  {alumni.university_major}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        {(alumni.phone || alumni.email) && (
          <div className="flex flex-wrap gap-3 pt-3 mt-3 border-t border-gray-200">
            {alumni.phone && (
              <a
                href={`tel:${alumni.phone}`}
                className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
                title="Telepon"
              >
                📞 {alumni.phone}
              </a>
            )}
            {alumni.email && (
              <a
                href={`mailto:${alumni.email}`}
                className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
                title="Email"
              >
                ✉️ {alumni.email}
              </a>
            )}
          </div>
        )}

        {/* Social Media */}
        {(alumni.instagram || alumni.linkedin || alumni.facebook) && (
          <div className="flex gap-4 pt-3 mt-3 border-t border-gray-200">
            {alumni.instagram && (
              <a
                href={`https://instagram.com/${alumni.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:scale-110 transition-transform"
                title="Instagram"
              >
                📷
              </a>
            )}
            {alumni.linkedin && (
              <a
                href={alumni.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:scale-110 transition-transform"
                title="LinkedIn"
              >
                💼
              </a>
            )}
            {alumni.facebook && (
              <a
                href={alumni.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:scale-110 transition-transform"
                title="Facebook"
              >
                👤
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
