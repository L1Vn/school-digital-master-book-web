export default function PublicStudentCard({ s }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-soft mb-4">
      <h3 className="text-lg font-semibold">{s.name}</h3>
      <p className="text-gray-600 text-sm">NIS: {s.nis}</p>
      <p className="mt-2 inline-block bg-lightbg text-primary px-3 py-1 rounded-full text-sm">
        {s.kelas}
      </p>
    </div>
  );
}
