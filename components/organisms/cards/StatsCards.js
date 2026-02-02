export default function StatsCards({ students, icon, label, value, color }) {
  // Komponen Card untuk satu statistik
  const Card = ({ title, value, icon, colorClass }) => {
    // Cek apakah colorClass menggunakan gradient (mengandung text-white)
    const isGradient = colorClass?.includes("text-white");
    const textColorClass = isGradient ? "text-white" : "text-gray-900";
    const labelColorClass = isGradient ? "text-white/90" : "text-gray-600";

    return (
      <div
        className={`${colorClass || "bg-white"} rounded-2xl p-6 shadow-lg w-full hover:shadow-xl transition-shadow`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${labelColorClass}`}>{title}</p>
            <p className={`text-4xl font-bold mt-2 ${textColorClass}`}>
              {value}
            </p>
          </div>
          <div
            className={`${isGradient ? "bg-white/20" : "bg-gray-100"} p-4 rounded-xl`}
          >
            <div className="text-3xl">{icon}</div>
          </div>
        </div>
      </div>
    );
  };

  // If `students` array provided, render aggregate three-card view
  if (Array.isArray(students)) {
    const total = students.length;
    const male = students.filter(
      (s) => s.gender === "Laki-laki" || s.gender === "L",
    ).length;
    const female = students.filter(
      (s) => s.gender === "Perempuan" || s.gender === "P",
    ).length;

    return (
      <div className="flex gap-4">
        <div className="w-1/3">
          <Card title="Total Siswa" value={total} icon="📘" />
        </div>
        <div className="w-1/3">
          <Card title="Laki-laki" value={male} icon="👦" />
        </div>
        <div className="w-1/3">
          <Card title="Perempuan" value={female} icon="👧" />
        </div>
      </div>
    );
  }

  // Otherwise render a single card using provided props
  return (
    <Card title={label} value={value ?? 0} icon={icon} colorClass={color} />
  );
}
