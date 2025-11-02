import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UploadProps {
  maxFileSize?: string; // Optional file size info for display
  acceptedFormats?: string[]; // Array of accepted file types
}

export function Upload({ maxFileSize, acceptedFormats }: UploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Uploaded files:", acceptedFiles);
    // Add upload handling logic here (e.g., API call)
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats?.reduce(
      (acc, format) => ({ ...acc, [format]: [] }),
      {}
    ),
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-6 rounded-md ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="text-sm font-medium text-[#253483]">
          {isDragActive ? "Drop your files here..." : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-gray-500">
          {`Accepted formats: ${acceptedFormats?.join(", ") || "Any"}`}
        </p>
        {maxFileSize && (
          <p className="text-xs text-gray-500">{`Max file size: ${maxFileSize}`}</p>
        )}
        {/* <Button className="mt-2">Upload File</Button> */}
      </div>
    </div>
  );
}
