import React, { useState, useCallback } from 'react';

type PageType = 'home' | 'services' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment';

interface DocumentUploadPageProps {
  onNavigate: (page: PageType) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function DocumentUploadPage({ onNavigate }: DocumentUploadPageProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const requiredDocuments = [
    {
      name: 'Form 16',
      description: 'TDS certificate from your employer',
      required: true,
      uploaded: false
    },
    {
      name: 'PAN Card',
      description: 'Copy of your PAN card',
      required: true,
      uploaded: false
    },
    {
      name: 'Aadhaar Card',
      description: 'Copy of your Aadhaar card',
      required: true,
      uploaded: false
    },
    {
      name: 'Bank Statement',
      description: 'Last 3 months bank statements',
      required: true,
      uploaded: false
    },
    {
      name: 'Investment Proofs',
      description: '80C, 80D investment certificates',
      required: false,
      uploaded: false
    },
    {
      name: 'Interest Certificates',
      description: 'FD, Savings account interest certificates',
      required: false,
      uploaded: false
    }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file. Please upload only images.`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Please upload files smaller than 5MB.`);
        return;
      }

      const fileId = Math.random().toString(36).substring(2);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadProgress: 0,
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === fileId) {
            const newProgress = Math.min(f.uploadProgress + 10, 100);
            return {
              ...f,
              uploadProgress: newProgress,
              status: newProgress === 100 ? 'completed' : 'uploading'
            };
          }
          return f;
        }));
      }, 200);

      // Clear interval when upload is complete
      setTimeout(() => {
        clearInterval(uploadInterval);
      }, 2000);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1F2937] dark:text-white mb-4">
            Upload Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#00C897]">Documents</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Securely upload your documents for ITR filing. All files are encrypted and stored safely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-[#007AFF] bg-[#007AFF]/5'
                  : 'border-gray-300 hover:border-[#007AFF] hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1F2937] dark:text-white mb-2">
                Drag and drop your files here
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                or click to browse and select files from your device
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-[#007AFF] text-white font-medium rounded-lg hover:bg-[#0056CC] transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Files
              </label>
              <p className="text-sm text-gray-500 mt-4">
                Supported formats: JPG, PNG, PDF • Maximum size: 5MB per file
              </p>
            </div>

            {/* File Guidelines */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6">Upload Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#007AFF]">✅ Do's</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Upload clear, high-quality images
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Ensure all text is readable
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Upload original documents
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Keep file sizes under 5MB
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600">❌ Don'ts</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Don't upload blurry images
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Avoid partial document images
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Don't upload edited documents
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Avoid files over 5MB
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1F2937] dark:text-white truncate">{file.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#007AFF]">Uploading...</span>
                              <span className="text-[#007AFF]">{file.uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-[#007AFF] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {file.status === 'completed' && (
                          <div className="flex items-center mt-2 text-sm text-[#00C897]">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Upload completed
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Required Documents Checklist */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6">Document Checklist</h3>
              <div className="space-y-4">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-5 h-5 rounded border-2 mr-3 mt-1 flex items-center justify-center ${
                      doc.uploaded 
                        ? 'bg-[#00C897] border-[#00C897]' 
                        : doc.required 
                        ? 'border-[#007AFF]' 
                        : 'border-gray-300'
                    }`}>
                      {doc.uploaded && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-[#1F2937] dark:text-white">{doc.name}</p>
                        {doc.required && (
                          <span className="ml-2 text-red-500 text-sm">*</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-4">🔒 Your Data is Safe</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  256-bit SSL encryption
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure cloud storage
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  GDPR compliant
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#00C897] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Auto-delete after processing
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-4">Next Steps</h3>
              <div className="space-y-4">
                <button
                  onClick={() => onNavigate('payment')}
                  className="w-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  disabled={uploadedFiles.length === 0}
                >
                  Continue to Payment
                </button>
                <button
                  onClick={() => onNavigate('services')}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Services
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
