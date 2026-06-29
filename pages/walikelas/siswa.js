import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import Badge from "../../components/atoms/Badge";
import Modal from "../../components/molecules/Modal";
import * as api from "../../lib/api";
import toast from "react-hot-toast";
import { HiUser, HiDocumentText, HiPencil, HiTrash, HiXMark, HiPlus, HiCheck, HiTrophy, HiChartBar } from "react-icons/hi2";

export default function WaliKelasSiswaPage() {
  const { user, isWaliKelas, loading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNIS, setSearchNIS] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'detail' or 'raport'

  // State untuk modal detail siswa
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({});
  const [savingStudent, setSavingStudent] = useState(false);

  // State untuk modal raport
  const [showRaportModal, setShowRaportModal] = useState(false);
  const [studentGrades, setStudentGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // State untuk tabs dan summary
  const [studentSemesters, setStudentSemesters] = useState([]);
  const [activeSemesterTab, setActiveSemesterTab] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // State untuk form input nilai
  const [showAddGradeForm, setShowAddGradeForm] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    subject_id: "",
    academic_year_id: "",
    semester: "",
    score: "",
  });
  const [savingGrade, setSavingGrade] = useState(false);

  // State untuk edit nilai
  const [editingGrade, setEditingGrade] = useState(null);
  const [deletingGradeId, setDeletingGradeId] = useState(null);

  const SEMESTER_OPTIONS = [
    { value: 'odd', label: 'Ganjil' },
    { value: 'even', label: 'Genap' }
  ];

  useEffect(() => {
    if (!authLoading && !isWaliKelas) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [authLoading, isWaliKelas, user, router]);

  useEffect(() => {
    if (isWaliKelas) {
      loadStudents();
      loadSubjects();
      loadAcademicYears();
    }
  }, [isWaliKelas]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.getClassStudents();
      const studentsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setStudents(studentsData);
    } catch (error) {
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await api.getClassSubjects();
      const subjectsData = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];
      setSubjects(subjectsData);
    } catch (error) {
      toast.error("Gagal memuat data mata pelajaran");
    }
  };

  const loadAcademicYears = async () => {
    try {
      const response = await api.getAcademicYears();
      const academicYearsData = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];
      setAcademicYears(academicYearsData);
    } catch (error) {
      toast.error("Gagal memuat data tahun ajaran");
    }
  };

  const loadStudentGrades = async (nis) => {
    try {
      setLoadingGrades(true);

      let gradesData = [];

      try {
        // Gunakan getClassGrades dengan filter student_id
        const gradesResponse = await api.getClassGrades({ student_id: nis });

        if (gradesResponse.success && gradesResponse.data) {
          const data = gradesResponse.data;

          // Handle response paginated
          if (data.data && Array.isArray(data.data)) {
            gradesData = data.data;
          } else if (Array.isArray(data)) {
            gradesData = data;
          }
        }
      } catch (err) {
        toast.error("Gagal memuat data nilai siswa");
      }

      setStudentGrades(gradesData);
      
      // Calculate semesters for tabs
      const combinations = new Set();
      gradesData.forEach((g) => {
        const year = academicYears.find(y => y.id == g.academic_year_id);
        const yearName = year ? year.name : "N/A";
        combinations.add(`${g.academic_year_id}|${g.semester}|${yearName}`);
      });
      const semesters = Array.from(combinations);
      setStudentSemesters(semesters);

      if (semesters.length > 0) {
        const firstTab = semesters[0];
        setActiveSemesterTab(firstTab);
        const [yearId, semester] = firstTab.split("|");
        loadSummaryForStudent(nis, yearId, semester);
      } else {
        setActiveSemesterTab(null);
        setSummaryData(null);
      }
    } catch (error) {
      toast.error("Gagal memuat nilai siswa");
      setStudentGrades([]);
      setStudentSemesters([]);
      setActiveSemesterTab(null);
      setSummaryData(null);
    } finally {
      setLoadingGrades(false);
    }
  };

  const loadSummaryForStudent = async (studentId, yearId, semester) => {
    if (!studentId || !yearId || !semester) return;
    try {
      setLoadingSummary(true);
      const res = await api.getClassSummary(studentId, yearId, semester);
      if (res.success && res.data) {
        setSummaryData(res.data);
      } else {
        setSummaryData(null);
      }
    } catch (err) {
      console.error(err);
      setSummaryData(null);
    } finally {
      setLoadingSummary(false);
    }
  };


  const handleSearch = () => {
    if (!searchNIS.trim()) {
      toast.error("Masukkan Nomor Induk Siswa terlebih dahulu");
      return;
    }

    const student = students.find(
      (s) =>
        s.nis?.toLowerCase() === searchNIS.toLowerCase().trim() ||
        s.nisn?.toLowerCase() === searchNIS.toLowerCase().trim(),
    );

    if (student) {
      setSelectedStudent(student);
      setViewMode(null);
    } else {
      toast.error(
        "Siswa dengan NIS/NISN tersebut tidak ditemukan di kelas ini",
      );
      setSelectedStudent(null);
      setViewMode(null);
    }
  };

  const handleShowDetail = () => {
    setViewMode("detail");
    setShowDetailModal(true);
    setIsEditingStudent(false);
    setStudentForm({
      name: selectedStudent.name || "",
      nisn: selectedStudent.nisn || "",
      gender: selectedStudent.gender || "L",
      birth_place: selectedStudent.birth_place || "",
      birth_date: selectedStudent.birth_date || "",
      religion: selectedStudent.religion || "",
      father_name: selectedStudent.father_name || "",
      address: selectedStudent.address || "",
      ijazah_number: selectedStudent.ijazah_number || "",
      classroom_id: selectedStudent.classroom_id || "",
    });
  };

  const handleShowRaport = async () => {
    setViewMode("raport");
    setShowRaportModal(true);
    setStudentGrades([]); // Reset grades first

    if (selectedStudent?.nis) {
      await loadStudentGrades(selectedStudent.nis);
    } else {
      toast.error("Data siswa tidak lengkap");
    }
  };

  const handleGradeFormChange = (e) => {
    const { name, value } = e.target;

    // Jika semester berubah dan sedang tidak edit, reset subject_id
    if (name === "semester" && !editingGrade) {
      setGradeForm((prev) => ({
        ...prev,
        semester: value,
        subject_id: "", // Reset subject_id agar user pilih ulang
      }));
    } else {
      setGradeForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();

    if (!gradeForm.subject_id || !gradeForm.score) {
      toast.error("Mohon lengkapi data nilai");
      return;
    }

    const score = parseFloat(gradeForm.score);
    if (score < 0 || score > 100) {
      toast.error("Nilai harus antara 0 - 100");
      return;
    }

    try {
      setSavingGrade(true);

      await api.storeClassGrade({
        student_id: selectedStudent.nis,
        subject_id: gradeForm.subject_id,
        academic_year_id: gradeForm.academic_year_id,
        semester: gradeForm.semester,
        score: score,
      });

      toast.success("Nilai berhasil ditambahkan");
      setGradeForm({ subject_id: "", academic_year_id: gradeForm.academic_year_id, semester: gradeForm.semester, score: "" });
      setShowAddGradeForm(false);

      // Reload grades
      if (selectedStudent?.nis) {
        await loadStudentGrades(selectedStudent.nis);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan nilai");
    } finally {
      setSavingGrade(false);
    }
  };

  const handleEditGrade = (grade) => {
    setEditingGrade(grade);
    setGradeForm({
      subject_id: grade.subject_id,
      academic_year_id: grade.academic_year_id,
      semester: grade.semester,
      score: grade.score,
    });
  };

  const handleUpdateGrade = async (e) => {
    e.preventDefault();

    if (!gradeForm.score) {
      toast.error("Mohon masukkan nilai");
      return;
    }

    const score = parseFloat(gradeForm.score);
    if (score < 0 || score > 100) {
      toast.error("Nilai harus antara 0 - 100");
      return;
    }

    try {
      setSavingGrade(true);

      await api.updateClassGrade(editingGrade.id, {
        score: score,
        academic_year_id: gradeForm.academic_year_id,
        semester: gradeForm.semester,
      });

      toast.success("Nilai berhasil diperbarui");
      setEditingGrade(null);
      setGradeForm({ subject_id: "", academic_year_id: gradeForm.academic_year_id, semester: gradeForm.semester, score: "" });

      // Reload grades
      if (selectedStudent?.nis) {
        await loadStudentGrades(selectedStudent.nis);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui nilai");
    } finally {
      setSavingGrade(false);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray-800">Hapus Nilai?</p>
        <p className="text-sm text-gray-600">Yakin ingin menghapus nilai ini?</p>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingGradeId(gradeId);
              try {
                await api.deleteClassGrade(gradeId);
                toast.success("Nilai berhasil dihapus");

                // Reload grades
                if (selectedStudent?.nis) {
                  await loadStudentGrades(selectedStudent.nis);
                }
              } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Gagal menghapus nilai");
              } finally {
                setDeletingGradeId(null);
              }
            }}
            className="px-3 py-1.5 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium"
          >
            Ya, hapus!
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    if (!studentForm.name || !studentForm.nisn) {
      toast.error("Nama dan NISN wajib diisi");
      return;
    }

    try {
      setSavingStudent(true);
      await api.updateClassStudent(selectedStudent.nis, studentForm);

      toast.success("Data siswa berhasil diperbarui");
      setIsEditingStudent(false);

      // Update selected student dengan data baru
      setSelectedStudent((prev) => ({ ...prev, ...studentForm }));

      // Reload students list
      await loadStudents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui data siswa",
      );
    } finally {
      setSavingStudent(false);
    }
  };

  const handleCancelEditStudent = () => {
    setIsEditingStudent(false);
    setStudentForm({
      name: selectedStudent.name || "",
      nisn: selectedStudent.nisn || "",
      gender: selectedStudent.gender || "L",
      birth_place: selectedStudent.birth_place || "",
      birth_date: selectedStudent.birth_date || "",
      religion: selectedStudent.religion || "",
      father_name: selectedStudent.father_name || "",
      address: selectedStudent.address || "",
      ijazah_number: selectedStudent.ijazah_number || "",
      classroom_id: selectedStudent.classroom_id || "",
    });
  };

  // Filter grades by active semester tab
  const filteredGrades = useMemo(() => {
    if (!activeSemesterTab) return studentGrades;
    const [yearId, semester] = activeSemesterTab.split("|");
    return studentGrades.filter(g => g.academic_year_id == yearId && g.semester === semester);
  }, [studentGrades, activeSemesterTab]);


  // Filter subjects yang belum ada nilainya di semester yang dipilih
  const getAvailableSubjects = () => {
    if (!gradeForm.semester || editingGrade) {
      return subjects;
    }

    // Dapatkan subject_id yang sudah ada di semester ini
    const usedSubjectIds = studentGrades
      .filter((grade) => grade.academic_year_id == gradeForm.academic_year_id && grade.semester === gradeForm.semester)
      .map((grade) => grade.subject_id);

    // Filter subjects yang belum digunakan
    return subjects.filter((subject) => !usedSubjectIds.includes(subject.id));
  };

  const availableSubjects = getAvailableSubjects();

  if (authLoading || !isWaliKelas) {
    return <Loading fullScreen />;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Memuat data siswa..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Data Siswa Kelas {user?.class}
            </h1>
            <p className="text-gray-600">
              Cari siswa berdasarkan NIS/NISN untuk melihat detail atau raport
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/walikelas")}>
            ← Kembali ke Dashboard
          </Button>
        </div>

        {/* Search Section */}
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masukkan Nomor Induk Siswa (NIS/NISN)
              </label>
              <div className="flex gap-3">
                <Input
                  value={searchNIS}
                  onChange={(e) => setSearchNIS(e.target.value)}
                  placeholder="Contoh: 20240001"
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="px-8 flex items-center gap-1.5"
                >
                  Cari
                </Button>
              </div>
            </div>

            {/* Info tentang jumlah siswa */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="secondary">
                Total {students.length} siswa di kelas ini
              </Badge>
            </div>
          </div>
        </Card>

        {/* Student Found - Action Selection */}
        {selectedStudent && !viewMode && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedStudent.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-gray-600">
                    NIS: {selectedStudent.nis} | NISN: {selectedStudent.nisn}
                  </p>
                  <Badge variant="primary" className="mt-1">
                    {selectedStudent.class || user?.class}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-blue-200 pt-6">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Pilih tindakan yang ingin Anda lakukan:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleShowDetail}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <HiUser className="w-5 h-5" /> Lihat Data Siswa
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleShowRaport}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <HiDocumentText className="w-5 h-5" /> Lihat & Kelola Raport
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* List All Students */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Daftar Semua Siswa Kelas {user?.class}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.nis}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                onClick={() => {
                  setSelectedStudent(student);
                  setViewMode(null);
                  setSearchNIS(student.nis);
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                    {student.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500">{student.nis}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={student.gender === "L" ? "primary" : "secondary"}
                    size="sm"
                  >
                    {student.gender === "L" ? "L" : "P"}
                  </Badge>
                  <Badge variant="ghost" size="sm">
                    {student.class || "-"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {students.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data siswa di kelas ini
            </div>
          )}
        </Card>
      </div>

      {/* Modal Detail Siswa */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewMode(null);
          setIsEditingStudent(false);
        }}
        title={isEditingStudent ? `Edit Data Siswa` : `Detail Data Siswa`}
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {(isEditingStudent
                    ? studentForm.name
                    : selectedStudent.name
                  )?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isEditingStudent ? studentForm.name : selectedStudent.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedStudent.class || user?.class}
                  </p>
                </div>
              </div>
              {!isEditingStudent && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingStudent(true)}
                  className="flex items-center gap-1.5"
                >
                  <HiPencil className="w-4 h-4" /> Edit Data
                </Button>
              )}
            </div>

            {isEditingStudent ? (
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIS
                    </label>
                    <Input
                      value={selectedStudent.nis}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      NIS tidak dapat diubah
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NISN *
                    </label>
                    <Input
                      name="nisn"
                      value={studentForm.nisn}
                      onChange={handleStudentFormChange}
                      placeholder="NISN"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <Input
                      name="name"
                      value={studentForm.name}
                      onChange={handleStudentFormChange}
                      placeholder="Nama lengkap siswa"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin *
                    </label>
                    <select
                      name="gender"
                      value={studentForm.gender}
                      onChange={handleStudentFormChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempat Lahir
                    </label>
                    <Input
                      name="birth_place"
                      value={studentForm.birth_place}
                      onChange={handleStudentFormChange}
                      placeholder="Kota tempat lahir"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <Input
                      type="date"
                      name="birth_date"
                      value={studentForm.birth_date}
                      onChange={handleStudentFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agama
                    </label>
                    <select
                      name="religion"
                      value={studentForm.religion}
                      onChange={handleStudentFormChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Pilih Agama...</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Ayah
                    </label>
                    <Input
                      name="father_name"
                      value={studentForm.father_name}
                      onChange={handleStudentFormChange}
                      placeholder="Nama ayah kandung"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      name="address"
                      value={studentForm.address}
                      onChange={handleStudentFormChange}
                      rows="3"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Alamat lengkap dengan RT/RW"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Ijazah SMP/MTs
                    </label>
                    <Input
                      name="ijazah_number"
                      value={studentForm.ijazah_number}
                      onChange={handleStudentFormChange}
                      placeholder="Nomor seri ijazah"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={savingStudent}
                    className="flex-1"
                  >
                    Simpan Perubahan
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancelEditStudent}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    NIS
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.nis}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    NISN
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.nisn}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    Jenis Kelamin
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.gender === "L" ? "Laki-laki" : "Perempuan"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    Tempat Lahir
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.birth_place || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    Tanggal Lahir
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.birth_date || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    Agama
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.religion || "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    Nama Ayah
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.father_name || "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    Alamat
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.address || "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase font-bold">
                    No. Ijazah SMP/MTs
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedStudent.ijazah_number || "-"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Raport */}
      <Modal
        isOpen={showRaportModal}
        onClose={() => {
          setShowRaportModal(false);
          setViewMode(null);
          setShowAddGradeForm(false);
          setEditingGrade(null);
          setGradeForm({
            subject_id: "",
            academic_year_id: "",
            semester: "",
            score: "",
          });
        }}
        title={`Raport - ${selectedStudent?.name}`}
        size="xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">
                    {selectedStudent.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    NIS: {selectedStudent.nis} | Kelas:{" "}
                    {selectedStudent.class || user?.class}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setShowAddGradeForm(!showAddGradeForm)}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  {showAddGradeForm ? (
                    <>
                      <HiXMark className="w-4 h-4" /> Batal
                    </>
                  ) : (
                    <>
                      <HiPlus className="w-4 h-4" /> Tambah Nilai
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Form Tambah/Edit Nilai */}
            {(showAddGradeForm || editingGrade) && (
              <Card className="bg-yellow-50">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                  {editingGrade ? (
                    <>
                      <HiPencil className="w-4 h-4" /> Edit Nilai
                    </>
                  ) : (
                    <>
                      <HiPlus className="w-4 h-4" /> Tambah Nilai Baru
                    </>
                  )}
                </h4>
                <form
                  onSubmit={editingGrade ? handleUpdateGrade : handleAddGrade}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Ajaran
                    </label>
                    <select
                      name="academic_year_id"
                      value={gradeForm.academic_year_id}
                      onChange={handleGradeFormChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Tahun Ajaran...</option>
                      {academicYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <select
                      name="semester"
                      value={gradeForm.semester}
                      onChange={handleGradeFormChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Semester...</option>
                      {SEMESTER_OPTIONS.map((sem) => (
                        <option key={sem.value} value={sem.value}>
                          {sem.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      name="subject_id"
                      value={gradeForm.subject_id}
                      onChange={handleGradeFormChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={!!editingGrade}
                    >
                      <option value="">Pilih Mata Pelajaran...</option>
                      {availableSubjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    {!editingGrade && availableSubjects.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Semua mata pelajaran sudah memiliki nilai di semester
                        ini
                      </p>
                    )}
                    {!editingGrade &&
                      availableSubjects.length < subjects.length &&
                      availableSubjects.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          Hanya menampilkan {availableSubjects.length} dari{" "}
                          {subjects.length} mata pelajaran yang belum memiliki
                          nilai
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nilai (0-100)
                    </label>
                    <Input
                      type="number"
                      name="score"
                      value={gradeForm.score}
                      onChange={handleGradeFormChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Masukkan nilai"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                       type="submit"
                       variant="primary"
                       loading={savingGrade}
                       className="flex-1"
                    >
                      {editingGrade ? "Update Nilai" : "Simpan Nilai"}
                    </Button>
                    {editingGrade && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingGrade(null);
                          setGradeForm({
                            subject_id: "",
                            academic_year_id: "",
                            semester: "",
                            score: "",
                          });
                        }}
                      >
                        Batal
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            )}

            {/* Tabs Semester */}
            {studentSemesters.length > 0 && (
              <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar mb-4">
                {studentSemesters.map((semesterStr) => {
                  const [yearId, sem, yearName] = semesterStr.split("|");
                  const isActive = activeSemesterTab === semesterStr;
                  const label = `${yearName} - ${sem === 'odd' ? 'Ganjil' : sem === 'even' ? 'Genap' : sem}`;
                  return (
                    <button
                      key={semesterStr}
                      onClick={() => {
                        setActiveSemesterTab(semesterStr);
                        loadSummaryForStudent(selectedStudent?.nis, yearId, sem);
                      }}
                      className={`whitespace-nowrap py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? "border-blue-600 text-blue-600 bg-blue-50/50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {loadingSummary ? (
              <Loading text="Memuat ringkasan..." />
            ) : summaryData ? (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-6 shadow-sm mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><HiChartBar className="w-5 h-5 text-indigo-600" /> Ringkasan Nilai</span>
                  <div className="flex gap-2">
                    {summaryData.class_name && (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">Kelas: {summaryData.class_name}</span>
                    )}
                    <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">Sem: {summaryData.semester === 'odd' ? 'Ganjil' : summaryData.semester === 'even' ? 'Genap' : summaryData.semester}</span>
                  </div>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Total Nilai</p>
                    <p className="text-2xl font-bold text-indigo-600">{summaryData.total_score}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Rata-rata</p>
                    <p className="text-2xl font-bold text-indigo-600">{summaryData.average_score}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Nilai Tertinggi</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-green-600">{summaryData.highest_score || 0}</p>
                        <p className="text-xs text-gray-400 mb-1 truncate max-w-[80px]" title={summaryData.highest_subject || '-'}>{summaryData.highest_subject || '-'}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Nilai Terendah</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-red-500">{summaryData.lowest_score || 0}</p>
                        <p className="text-xs text-gray-400 mb-1 truncate max-w-[80px]" title={summaryData.lowest_subject || '-'}>{summaryData.lowest_subject || '-'}</p>
                    </div>
                  </div>
              </div>
            ) : null}

            {/* Grades List */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Daftar Nilai</h4>
              {loadingGrades ? (
                <Loading text="Memuat nilai..." />
              ) : filteredGrades.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredGrades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {grade.subject?.name || "Unknown Subject"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {grade.academic_year?.name || ""} {grade.semester === 'odd' ? 'Ganjil' : grade.semester === 'even' ? 'Genap' : grade.semester}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            grade.score >= 90
                              ? "success"
                              : grade.score >= 75
                                ? "primary"
                                : grade.score >= 60
                                  ? "warning"
                                  : "danger"
                          }
                          size="lg"
                        >
                          {grade.score}
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditGrade(grade)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-semibold transition text-sm flex items-center gap-1"
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(grade.id)}
                            disabled={deletingGradeId === grade.id}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition text-sm flex items-center gap-1 disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingGradeId === grade.id ? (
                              <svg className="animate-spin w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <HiTrash className="w-4 h-4" />
                            )} Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  Belum ada nilai untuk siswa ini
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
