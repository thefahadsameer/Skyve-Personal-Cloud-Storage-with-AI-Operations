import { useEffect, useState } from "react";
import api from "../api";

export default function FileList({ refreshSignal }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/files");
      setFiles(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  // auto-refresh every 5s to pick up AI tags from worker
  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [refreshSignal]);

  const del = async (id) => {
    if (!confirm("Delete this file?")) return;
    await api.delete(`/files/${id}`);
    load();
  };

  const rename = async (id, current) => {
    const newName = prompt("New name (with extension):", current);
    if (!newName || newName === current) return;
    await api.patch(`/files/${id}`, { newName });
    load();
  };

  if (loading) return <p className="text-sm opacity-70">Loading files…</p>;
  if (err) return <p className="text-red-500 text-sm">{err}</p>;
  if (!files.length) return <p className="text-sm opacity-70">No files yet.</p>;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Size</th>
            <th className="py-2 pr-4">Uploaded</th>
            <th className="py-2 pr-4">AI Tags</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f._id} className="border-b last:border-b-0">
              <td className="py-2 pr-4">{f.fileName}</td>
              <td className="py-2 pr-4">{f.mimeType}</td>
              <td className="py-2 pr-4">{(f.fileSize / 1024).toFixed(1)} KB</td>
              <td className="py-2 pr-4">
                {new Date(f.uploadDate).toLocaleString()}
              </td>
              <td className="py-2 pr-4">
                {Array.isArray(f.ai_tags) && f.ai_tags.length
                  ? f.ai_tags.join(", ")
                  : "—"}
              </td>
              <td className="py-2 pr-4 flex gap-2">
                {f.publicUrl && (
                  <a
                    className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-800"
                    href={f.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                )}
                <button
                  onClick={() => rename(f._id, f.fileName)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700"
                >
                  Rename
                </button>
                <button
                  onClick={() => del(f._id)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
