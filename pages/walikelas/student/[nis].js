import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/templates/DashboardLayout";
import Loading from "../../../components/atoms/Loading";
import Card from "../../../components/atoms/Card";
import Button from "../../../components/atoms/Button";
import Input from "../../../components/atoms/Input";
import Select from "../../../components/atoms/Select";
import Badge from "../../../components/atoms/Badge";
import * as api from "../../../lib/api";
import toast from "react-hot-toast";

export default function WaliStudentDetailPage() {
  const router = useRouter();
  const { nis } = router.query;

  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [gradeSummaries, setGradeSummaries] = useState([]);

  // Grade Input State
  const [inputData, setInputData] = useState({
    subject_id: "",
    semester: "Ganjil 2024/2025",
    score: "",
  });
  const [saving, setSaving] = useState(false);

  const SEMESTER_OPTIONS = [
    { value: "Ganjil 2023/2024", label: "Ganjil 2023/2024" },
    { value: "Genap 2023/2024", label: "Genap 2023/2024" },
    { value: "Ganjil 2024/2025", label: "Ganjil 2024/2025" },
    { value: "Genap 2024/2025", label: "Genap 2024/2025" },
    { value: "Ganjil 2025/2026", label: "Ganjil 2025/2026" },
    { value: "Genap 2025/2026", label: "Genap 2025/2026" },
  ];

  useEffect(() => {
    if (nis) {
      loadData();
    }
  }, [nis]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentRes, subjectsRes] = await Promise.all([
        api.getClassStudent(nis),
        api.getSubjects(),
      ]);

      setStudent(studentRes.data);
      setGrades(studentRes.data.grades || []);
      setSubjects(subjectsRes.data.data || subjectsRes.data || []);
      
      // Calculate or fetch summaries if available in student data
      // Assuming studentRes include relational data
      
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data siswa");
      if (error.response?.status === 404) {
        router.push("/walikelas");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  const calculateGradeStatus = (score) => {
      const numScore = parseFloat(score);
      if (numScore >= 90) return { label: 'A', color: 'success' };
      if (numScore >= 80) return { label: 'B', color: 'primary' };
      if (numScore >= 70) return { label: 'C', color: 'warning' };
      return { label: 'D', color: 'danger' };
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!inputData.subject_id || !inputData.score) {
      toast.error("Mohon lengkapi data nilai");
      return;
    }

    if (inputData.score < 0 || inputData.score > 100) {
        toast.error("Nilai harus antara 0 - 100");
        return;
    }

    try {
      setSaving(true);
      await api.storeClassGrade({
        student_id: student.id, // Or NIS depending on backend
        nis: student.nis, // Send NIS just in case backend expects it or id
        subject_id: inputData.subject_id,
        semester: inputData.semester,
        score: parseFloat(inputData.score),
      });

      toast.success("Nilai berhasil disimpan");
      
      // Reset form (keep semester)
      setInputData(prev => ({ ...prev, subject_id: "", score: "" }));
      
      // Reload data
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  // Group grades by semester
  const gradesBySemester = grades.reduce((acc, grade) => {
      const sem = grade.semester;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(grade);
      return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" onClick={() => router.push("/walikelas")} className="mb-4">
            ← Kembali ke Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profil Siswa (Sidebar Kiri) */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                    {student?.name?.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{student?.name}</h2>
                  <p className="text-gray-500">{student?.nis} / {student?.nisn}</p>
                  <p className="mt-2 text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full">
                    Kelas {student?.rombel_absen || "-"}
                  </p>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                   <div>
                       <label className="text-xs text-gray-400 uppercase font-bold">Jenis Kelamin</label>
                       <p className="font-medium">{student?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                   </div>
                   <div>
                       <label className="text-xs text-gray-400 uppercase font-bold">Tempat, Tgl Lahir</label>
                       <p className="font-medium">{student?.birth_place}, {student?.birth_date}</p>
                   </div>
                   <div>
                       <label className="text-xs text-gray-400 uppercase font-bold">Alamat</label>
                       <p className="font-medium text-sm">{student?.address || "-"}</p>
                   </div>
                   <div>
                       <label className="text-xs text-gray-400 uppercase font-bold">Nama Ayah</label>
                       <p className="font-medium">{student?.father_name || "-"}</p>
                   </div>
                </div>
              </Card>

              {/* Form Input Nilai */}
              <Card title="📝 Input Nilai Siswa">
                  <form onSubmit={handleSaveGrade} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                          <Select 
                              name="semester" 
                              value={inputData.semester} 
                              onChange={handleInputChange} 
                              options={SEMESTER_OPTIONS}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                          <select 
                             name="subject_id"
                             value={inputData.subject_id}
                             onChange={handleInputChange}
                             className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                             required
                          >
                              <option value="">Pilih Mapel...</option>
                              {subjects.map(sub => (
                                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nilai (0-100)</label>
                          <Input 
                              type="number" 
                              name="score" 
                              value={inputData.score} 
                              onChange={handleInputChange}
                              min="0"
                              max="100"
                              placeholder="0"
                              required 
                          />
                      </div>
                      <Button variant="primary" type="submit" className="w-full" loading={saving}>
                          Simpan Nilai
                      </Button>
                  </form>
              </Card>
            </div>

            {/* Rekam Akademik (Konten Kanan) */}
            <div className="lg:col-span-2 space-y-6">
                 <h2 className="text-2xl font-bold text-gray-800">Riwayat Akademik</h2>
                 
                 {Object.keys(gradesBySemester).length === 0 ? (
                     <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                         <p className="text-gray-500">Belum ada data nilai untuk siswa ini.</p>
                     </div>
                 ) : (
                     Object.entries(gradesBySemester).map(([semester, semesterGrades]) => {
                         // Calculate Semester Stats
                         const totalScore = semesterGrades.reduce((sum, g) => sum + parseFloat(g.score), 0);
                         const avgScore = (totalScore / semesterGrades.length).toFixed(2);
                         
                         return (
                             <Card key={semester} className="overflow-hidden">
                                 <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                     <h3 className="font-bold text-lg text-primary-700">{semester}</h3>
                                     <div className="flex gap-3 text-sm">
                                         <span className="bg-gray-100 px-3 py-1 rounded-full">Total: <b>{totalScore}</b></span>
                                         <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Rata-rata: <b>{avgScore}</b></span>
                                     </div>
                                 </div>
                                 
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-sm text-left">
                                         <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                             <tr>
                                                 <th className="px-4 py-3">Mata Pelajaran</th>
                                                 <th className="px-4 py-3 text-center">Nilai</th>
                                                 <th className="px-4 py-3 text-center">Grade</th>
                                                 <th className="px-4 py-3 text-right">Diupdate Oleh</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-100">
                                             {semesterGrades.map(grade => {
                                                 const status = calculateGradeStatus(grade.score);
                                                 return (
                                                     <tr key={grade.id} className="hover:bg-gray-50">
                                                         <td className="px-4 py-3 font-medium text-gray-900">
                                                             {grade.subject?.name || "-"}
                                                         </td>
                                                         <td className="px-4 py-3 text-center font-bold">
                                                             {grade.score}
                                                         </td>
                                                         <td className="px-4 py-3 text-center">
                                                             <Badge variant={status.color} size="sm">{status.label}</Badge>
                                                         </td>
                                                         <td className="px-4 py-3 text-right text-xs text-gray-500">
                                                             {grade.updater?.name || "-"}
                                                             <br/>
                                                             <span className="text-[10px]">{new Date(grade.updated_at || grade.created_at).toLocaleDateString()}</span>
                                                         </td>
                                                     </tr>
                                                 )
                                             })}
                                         </tbody>
                                     </table>
                                 </div>
                             </Card>
                         )
                     })
                 )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
