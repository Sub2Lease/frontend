import { useState, useRef } from "react";
import { IMAGE_ENDPOINTS } from "../constants";
import { useRefreshLocalUser } from "@/hooks/useRefreshLocalUser";

export default function ImageUpload({ id, to, callback }: { id: string; to: keyof typeof IMAGE_ENDPOINTS; callback?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshLocalUser = useRefreshLocalUser(id);

  const url = IMAGE_ENDPOINTS[to](id);

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // trigger file picker
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      upload(e.target.files[0]);
    }
  };

  const upload = async (file: File) => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      await refreshLocalUser();
      if (callback) callback();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleButtonClick}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 text-[14px]"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  );
}