import React, { useState } from "react";

const UploadForm = ({ onUpload }: { onUpload: (result: any) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      onUpload(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input type="file" accept="image/*" onChange={handleChange} />
      <button type="submit" disabled={loading || !file} style={{ marginLeft: 8 }}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
};

export default UploadForm;
