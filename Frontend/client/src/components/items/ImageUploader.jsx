import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { RiUploadCloud2Line, RiCloseLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;

export default function ImageUploader({ files, setFiles }) {
  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected.length > 0) {
        toast.error('Some files were rejected. Max 5MB each, images only.');
      }
      const combined = [...files, ...accepted];
      if (combined.length > MAX_FILES) {
        toast.error(`Max ${MAX_FILES} images allowed.`);
        return;
      }
      setFiles(combined.slice(0, MAX_FILES));
    },
    [files, setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <RiUploadCloud2Line className="w-10 h-10 mx-auto text-gray-400 mb-2" />
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop the images here…</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">Drag &amp; drop images, or click to select</p>
            <p className="text-gray-400 text-sm mt-1">Up to {MAX_FILES} images, max {MAX_SIZE_MB}MB each</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {files.map((file, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview ${i}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <RiCloseLine className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
