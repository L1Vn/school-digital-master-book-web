import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import * as api from "../../lib/api";
import DeleteConfirmationModal from "../../components/organisms/modals/DeleteConfirmationModal";
import toast from "react-hot-toast";

export default function AdminGradesPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk siswa yang diexpand
  const [expandedStudents, setExpandedStudents] = useState([]);
  
  // Tab aktif per siswa (format: studentId -> "class-semester")
  const [activeTabPerStudent, setActiveTabPerStudent] = useState({});
  
  // State modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalStudent, setAddModalStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);

  // State form untuk modal
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    semester: "",
    score: "",
  });

  // State filter
  const [filters, setFilters] = useState({
    class: "",
    semester: "",
    search: "",
  });

  const CURRENT_YEAR = new Date().getFullYear();
  const SEMESTER_OPTIONS = [
    `Ganjil ${CURRENT_YEAR - 1}/${CURRENT_YEAR}`,
    `Genap ${CURRENT_YEAR - 1}/${CURRENT_YEAR}`,
    `Ganjil ${CURRENT_YEAR}/${CURRENT_YEAR + 1}`,
    `Genap ${CURRENT_YEAR}/${CURRENT_YEAR + 1}`,
  ];

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [isLoading, isAdmin, user, router]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [gradesRes, studentsRes, subjectsRes] = await Promise.all([
        api.getGrades({ per_page: 10000 }),
        api.getStudents({ per_page: 10000 }),
        api.getSubjects(),
      ]);

      // Parse response paginated dari Laravel
      const gradesData = gradesRes.data?.data
        ? gradesRes.data.data
        : Array.isArray(gradesRes.data)
        ? gradesRes.data
        : [];

      // Parse data siswa - juga paginated
      const studentsData = studentsRes.data?.data
        ? studentsRes.data.data
        : Array.isArray(studentsRes.data)
        ? studentsRes.data
        : [];

      // Parse mata pelajaran
      const subjectsData = Array.isArray(subjectsRes)
        ? subjectsRes
        : subjectsRes.data || [];

      console.log("Loaded data:", {
        grades: gradesData.length,
        students: studentsData.length,
        subjects: subjectsData.length,
      });

      setGrades(gradesData);
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Gagal memuat data");
      toast.error("Gagal memuat data raport");
    } finally {
      setLoading(false);
    }
  };

  // Dapatkan unik kelas dari data siswa
  const classes = useMemo(() => {
    return [
      ...new Set(
        students
          .map((s) => s.rombel_absen?.split("-")[0])
          .filter(Boolean)
          .sort()
      ),
    ];
  }, [students]);

  // Kelompokkan nilai berdasarkan siswa
  const studentGradesMap = useMemo(() => {
    const map = {};
    grades.forEach((grade) => {
      const studentId = grade.student_id;
      if (!map[studentId]) {
        map[studentId] = [];
      }
      map[studentId].push(grade);
    });
    return map;
  }, [grades]);

  // Dapatkan siswa yang memiliki nilai
  const studentsWithGrades = useMemo(() => {
    const studentIds = Object.keys(studentGradesMap);
    return students.filter((s) => studentIds.includes(String(s.nis)));
  }, [students, studentGradesMap]);

  // Filter siswa
  const filteredStudents = useMemo(() => {
    return studentsWithGrades.filter((student) => {
      // Filter by class
      if (filters.class) {
        const studentClass = student.rombel_absen?.split("-")[0];
        if (studentClass !== filters.class) return false;
      }

      // Filter by semester - student must have grades in this semester
      if (filters.semester) {
        const studentGrades = studentGradesMap[student.nis] || [];
        const hasSemester = studentGrades.some(
          (g) => g.semester === filters.semester
        );
        if (!hasSemester) return false;
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchName = student.name?.toLowerCase().includes(searchLower);
        const matchNis = student.nis?.toString().includes(filters.search);
        if (!matchName && !matchNis) return false;
      }

      return true;
    });
  }, [studentsWithGrades, filters, studentGradesMap]);

  // Dapatkan kombinasi unik kelas-semester untuk siswa
  const getStudentSemesters = (studentId) => {
    const studentGrades = studentGradesMap[studentId] || [];
    const student = students.find((s) => s.nis == studentId);
    
    const combinations = new Set();
    studentGrades.forEach((g) => {
      const studentClass = student?.rombel_absen?.split("-")[0] || "N/A";
      combinations.add(`${studentClass}|${g.semester}`);
    });
    
    return Array.from(combinations);
  };

  // Toggle expand/collapse siswa
  const toggleStudentExpansion = async (studentId) => {
    if (expandedStudents.includes(studentId)) {
      // Collapse
      setExpandedStudents(expandedStudents.filter((id) => id !== studentId));
    } else {
      // Expand
      setExpandedStudents([studentId]); // Only one student expanded at a time
      
      // Set tab aktif default
      const semesters = getStudentSemesters(studentId);
      if (semesters.length > 0) {
        setActiveTabPerStudent({
          ...activeTabPerStudent,
          [studentId]: semesters[0],
        });
        
        // Load summary untuk tab pertama
        const [, semester] = semesters[0].split("|");
        await loadSummaryForStudent(studentId, semester?.trim());
      }
    }
  };

  // Load summary dari backend
  const loadSummaryForStudent = async (studentId, semester) => {
    if (!studentId || !semester) return;
    const key = `${studentId}-${semester}`;
    
    // Optimistic loading state could be set here if needed
    setSummaries((prev) => ({
      ...prev,
      [key]: { loading: true }, // Set loading state
    }));
    
    try {
      const response = await api.getGradeSummary(studentId, semester);
      setSummaries((prev) => ({
        ...prev,
        [key]: response.data || { error: "No Data", total_score: 0, average_score: 0, status: "-" },
      }));
    } catch (error) {
      console.error("Failed to load summary:", error);
      setSummaries((prev) => ({
        ...prev,
        [key]: { error: "Failed to load", debugKey: key }, // Set error state with debug info
      }));
      // Only show toast for non-404 errors, as 404 might mean no summary yet
      if (error.response?.status !== 404) {
        toast.error("Gagal memuat ringkasan nilai");
      }
    }
  };

  // Change active tab for student
  const handleTabChange = async (studentId, tab) => {
    setActiveTabPerStudent({
      ...activeTabPerStudent,
      [studentId]: tab,
    });
    
    // Load summary for this tab
    const [, semester] = tab.split("|");
    await loadSummaryForStudent(studentId, semester?.trim());
  };

  // Ambil nilai untuk siswa dan tab spesifik
  const getGradesForStudentTab = (studentId, tab) => {
    const [, semester] = tab.split("|");
    const studentGrades = studentGradesMap[studentId] || [];
    return studentGrades.filter((g) => g.semester === semester);
  };

  // Handle edit grade
  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      student_id: grade.student_id || grade.student?.nis || "",
      subject_id: grade.subject_id,
      semester: grade.semester,
      score: grade.score,
    });
    setShowEditModal(true);
  };

  // Handle delete grade
  const handleDelete = (grade) => {
    setGradeToDelete(grade);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!gradeToDelete) return;

    try {
      await api.deleteGrade(gradeToDelete.id);
      toast.success("Nilai berhasil dihapus");
      
      // Reload data and summary
      await loadData();
      await loadSummaryForStudent(gradeToDelete.student_id, gradeToDelete.semester);
      
      setShowDeleteModal(false);
      setGradeToDelete(null);
    } catch (err) {
      console.error("Error deleting grade:", err);
      toast.error(err.message || "Gagal menghapus nilai");
    }
  };

  // Handle submit modal
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.student_id ||
      !formData.subject_id ||
      !formData.semester ||
      !formData.score
    ) {
      toast.error("Semua field harus diisi");
      return;
    }

    const score = parseFloat(formData.score);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Nilai harus antara 0-100");
      return;
    }

    try {
      const payload = {
        student_id: formData.student_id,
        subject_id: formData.subject_id,
        semester: formData.semester,
        score: score,
      };

      if (editingGrade) {
        await api.updateGrade(editingGrade.id, payload);
        toast.success("Nilai berhasil diperbarui");
      } else {
        await api.createGrade(payload);
        toast.success("Nilai berhasil ditambahkan");
      }

      setShowEditModal(false);
      setShowAddModal(false);
      setFormData({ student_id: "", subject_id: "", semester: "", score: "" });
      setEditingGrade(null);
      setAddModalStudent(null);
      
      // Reload data and summary
      await loadData();
      await loadSummaryForStudent(formData.student_id, formData.semester);
    } catch (err) {
      console.error("Error saving grade:", err);
      toast.error(err.message || "Gagal menyimpan nilai");
    }
  };

  // Handle add grade for specific student
  const handleAddGradeForStudent = (student, semester) => {
    setAddModalStudent(student);
    setFormData({
      student_id: student.nis,
      subject_id: "",
      semester: semester || "",
      score: "",
    });
    setShowAddModal(true);
  };

  if (isLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Raport Siswa</h1>
        <p className="text-gray-600">
          Kelola nilai raport siswa per semester dan mata pelajaran
        </p>
      </div>

      {/* Stats & Filter Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl">
            <p className="text-sm opacity-90">Total Siswa dengan Nilai</p>
            <p className="text-3xl font-bold">{filteredStudents.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Filter */}
          <select
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">🏫 Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={filters.semester}
            onChange={(e) =>
              setFilters({ ...filters, semester: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">📅 Semua Semester</option>
            {SEMESTER_OPTIONS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Cari nama atau NIS..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Reset Filter */}
        {(filters.class || filters.semester || filters.search) && (
          <div className="mt-3">
            <button
              onClick={() =>
                setFilters({ class: "", semester: "", search: "" })
              }
              className="text-sm text-primary hover:text-primary-dark font-semibold"
            >
              🔄 Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Memuat data raport..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {filters.class || filters.semester || filters.search
              ? "Tidak Ada Hasil"
              : "Belum Ada Data Nilai"}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.class || filters.semester || filters.search
              ? "Coba ubah filter untuk melihat nilai lainnya"
              : "Belum ada siswa dengan nilai raport"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => {
            const isExpanded = expandedStudents.includes(student.nis);
            const semesters = getStudentSemesters(student.nis);
            const activeTab = activeTabPerStudent[student.nis] || semesters[0];
            const tabGrades = activeTab
              ? getGradesForStudentTab(student.nis, activeTab)
              : [];
            const [, activeSemester] = activeTab?.split("|") || ["", ""];
            const summaryKey = `${student.nis}-${activeSemester}`;
            const summary = summaries[summaryKey];

            return (
              <div
                key={student.nis}
                className="bg-white rounded-xl shadow-soft overflow-hidden transition-all"
              >
                {/* Student Card Header */}
                <div
                  onClick={() => toggleStudentExpansion(student.nis)}
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl ${
                          student.gender === "L"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-pink-50 text-pink-600"
                        }`}
                      >
                        {student.gender === "L" ? "👨‍🎓" : "👩‍🎓"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {student.nis} • {student.rombel_absen || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                        {semesters.length} Semester
                      </span>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6">
                    {/* Tab Navigation */}
                    {semesters.length > 1 && (
                      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {semesters.map((sem) => (
                          <button
                            key={sem}
                            onClick={() => handleTabChange(student.nis, sem)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                              activeTab === sem
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {sem}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Grades Table */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              Mata Pelajaran
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Nilai
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {tabGrades
                            .filter((grade) =>
                              subjects.find((s) => s.id == grade.subject_id)
                            )
                            .map((grade, index) => {
                              const subject = subjects.find(
                                (s) => s.id == grade.subject_id
                              );
                              const scoreValue = parseFloat(grade.score);
                              const scoreColor =
                                scoreValue >= 80
                                  ? "bg-green-100 text-green-700"
                                  : scoreValue >= 60
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700";

                            return (
                              <tr
                                key={grade.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-semibold text-gray-900">
                                    {subject?.name || "Unknown"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex justify-center">
                                    <span
                                      className={`px-4 py-2 rounded-lg font-bold ${scoreColor}`}
                                    >
                                      {scoreValue}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => handleEdit(grade)}
                                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(grade)}
                                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Section */}
                    {/* Summary Section */}
                    <div className="mb-4">
                      {summary ? (
                        summary.error ? (
                           <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                              <p className="text-red-500 font-medium">Gagal memuat ringkasan.</p>
                              <p className="text-xs text-red-400 mt-1">Key: {summaryKey}</p>
                           </div>
                        ) : (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex justify-between items-center">
                              <span>📊 Ringkasan Nilai</span>
                              <span className="text-xs font-normal text-gray-500 bg-white/50 px-2 py-1 rounded">Sem: {activeSemester}</span>
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Total Nilai</p>
                                <p className="text-2xl font-bold text-indigo-600">{summary.total_score}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Rata-rata</p>
                                <p className="text-2xl font-bold text-indigo-600">{summary.average_score}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">GPA</p>
                                <p className="text-2xl font-bold text-indigo-600">{summary.grade_point_average || "-"}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <p className={`text-lg font-bold ${summary.status === 'Lulus' ? 'text-green-600' : 'text-red-600'}`}>
                                  {summary.status || "-"}
                                </p>
                              </div>
                            </div>
                            {summary.calculated_at && (
                                <p className="text-xs text-gray-500 mt-3">
                                Terakhir dihitung: {new Date(summary.calculated_at).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                        )
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 text-center">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-32 bg-gray-200 rounded"></div>
                            </div>
                            <p className="text-gray-400 text-sm mt-4">Memuat data ringkasan...</p>
                            <small className="text-xs text-gray-300 block mt-2 font-mono">Debug Key: {summaryKey}</small>
                        </div>
                      )}
                    </div>

                    {/* Add Grade Button */}
                    <button
                      onClick={() =>
                        handleAddGradeForStudent(student, activeSemester)
                      }
                      className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">+</span>
                      Tambah Nilai Baru
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Nilai
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Mata Pelajaran */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subject_id}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={true}
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nilai */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nilai (0-100) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({ ...formData, score: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Masukkan nilai"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nilai harus antara 0 sampai 100
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tambah Nilai Baru
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Student Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Siswa</p>
                  <p className="font-bold text-gray-900">
                    {addModalStudent?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addModalStudent?.nis}
                  </p>
                </div>

                {/* Mata Pelajaran */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subject_id}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Pilih Semester</option>
                    {SEMESTER_OPTIONS.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nilai */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nilai (0-100) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({ ...formData, score: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Masukkan nilai"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nilai harus antara 0 sampai 100
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
                >
                  Tambah Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setGradeToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Nilai"
        message={`Apakah Anda yakin ingin menghapus nilai ${
          subjects.find((s) => s.id == gradeToDelete?.subject_id)?.name ||
          "mata pelajaran"
        } untuk siswa ${
          students.find((s) => s.nis == gradeToDelete?.student_id)?.name ||
          "siswa"
        }?`}
      />
    </DashboardLayout>
  );
}
