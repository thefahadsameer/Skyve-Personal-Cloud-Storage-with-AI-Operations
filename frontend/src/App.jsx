import { useState } from "react";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import "./index.css";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="max-w-5xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-semibold">Skyve — Personal Cloud</h1>
        <p className="opacity-70 text-sm">
          Upload files, background AI analysis, and quick previews.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-6">
        <FileUpload onUploaded={() => setRefreshKey((k) => k + 1)} />
        <section className="p-4 border rounded-2xl shadow bg-white/5">
          <h2 className="text-lg font-medium mb-2">Your Files</h2>
          <FileList refreshSignal={refreshKey} />
        </section>
      </main>
    </div>
  );
}
