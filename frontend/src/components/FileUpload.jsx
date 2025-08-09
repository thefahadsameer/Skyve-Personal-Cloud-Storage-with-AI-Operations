import { useState } from "react";
import api from "../api";

export default function FileUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setProgress(0);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setFile(null);
      setProgress(0);
      onUploaded?.(res.data.file);
    } catch (e) {
      setError(e?.response?.data?.error || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 border rounded-2xl shadow bg-white/5">
      <div className="flex items-center gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block text-sm"
        />
        <button
          onClick={upload}
          disabled={!file || busy}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
      </div>

      {busy && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-indigo-600 h-2" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </div>
  );
}
