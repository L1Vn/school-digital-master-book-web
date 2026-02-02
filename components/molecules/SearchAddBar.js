export default function SearchAddBar({ query, setQuery, onAdd }) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari siswa (Nama / NIS / NISN)..."
        className="flex-1 min-w-[250px] px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
      >
        + Tambah Siswa
      </button>
    </div>
  );
}
