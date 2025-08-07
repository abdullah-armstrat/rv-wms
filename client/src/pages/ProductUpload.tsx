import { useState } from "react";
import { uploadProducts } from "../api/product";
import { useNavigate } from "react-router-dom";

export default function ProductUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Select a CSV first");
    setLoading(true);
    try {
      const { imported } = await uploadProducts(file);
      setResult(imported);
    } catch (err: any) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Products CSV</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="block"
        />
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
      {result !== null && (
        <p className="mt-4 text-green-600">
          Successfully imported {result} products.
        </p>
      )}
    </div>
  );
}
