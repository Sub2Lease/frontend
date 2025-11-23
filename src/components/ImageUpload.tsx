import React, { useState } from "react";

export default function ImageUpload({ listingId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadedImage(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`/listings/${listingId}/uploadImage`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedImage(data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Upload Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}