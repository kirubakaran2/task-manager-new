"use client";

import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Choose a file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) setDownloadUrl(data.url);
    else alert(data.error);
  };

  return (
    <div className="p-4">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="ml-2 bg-blue-600 text-white p-2 rounded">
        Upload
      </button>

      {downloadUrl && (
        <div className="mt-4">
          ✅ File Uploaded: <a href={downloadUrl} download target="_blank" className="text-blue-700 underline">Download Here</a>
        </div>
      )}
    </div>
  );
}
