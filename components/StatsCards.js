export default function StatsCards({ students }) {
  const total = students.length;
  const male = students.filter(s => s.gender === 'Laki-laki').length;
  const female = students.filter(s => s.gender === 'Perempuan').length;

  const Card = ({ title, value, icon }) => (
    <div className="bg-white rounded-2xl p-4 shadow-soft w-1/3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold mt-2">{value}</p>
        </div>
        <div className="bg-lightbg p-3 rounded-lg">
          <div className="text-2xl">{icon}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex gap-4">
      <Card title="Total Siswa" value={total} icon="📘" />
      <Card title="Laki-laki" value={male} icon="👦" />
      <Card title="Perempuan" value={female} icon="👧" />
    </div>
  )
}
