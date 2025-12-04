export default function SearchAddBar({ query, setQuery, onAdd }) {
  return (
    <div className="mt-6 bg-white p-4 rounded-2xl shadow-soft flex items-center gap-4">
      <input
        autoFocus
        onInput={(e) => setQuery(e.target.value)}
        value={query}
        placeholder="Cari siswa (Nomor Induk, nama, atau kelas)..."
        className="
          flex-1 px-4 py-3 
          rounded-lg border border-gray-200 
          focus:outline-none focus:ring-2 focus:ring-primary
        "
      />

      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-lg bg-primary text-white font-medium shadow"
      >
        + Tambah Siswa
      </button>
    </div>
  );
}
