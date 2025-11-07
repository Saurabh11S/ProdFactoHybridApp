import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

interface ServiceDocumentUploadProps {
  serviceId: string;
  serviceName: string;
  onClose: () => void;
}

interface RequiredDocument {
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
}

interface UserDocument {
  _id: string;
  title: string;
  description?: string;
  documentType: 'required' | 'additional';
  documentUrl: string;
  createdAt: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function ServiceDocumentUpload({ serviceId, serviceName, onClose }: ServiceDocumentUploadProps) {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);

  // Get required documents based on service type
  const getRequiredDocumentsForService = (serviceName: string): RequiredDocument[] => {
    const serviceType = serviceName.toLowerCase();
    
    if (serviceType.includes('itr')) {
      return [
        { name: 'Form 16', description: 'TDS certificate from your employer', required: true, uploaded: false },
        { name: 'PAN Card', description: 'Copy of your PAN card', required: true, uploaded: false },
        { name: 'Aadhaar Card', description: 'Copy of your Aadhaar card', required: true, uploaded: false },
        { name: 'Bank Statement', description: 'Last 3 months bank statements', required: true, uploaded: false },
        { name: 'Investment Proofs', description: '80C, 80D investment certificates', required: false, uploaded: false },
        { name: 'Interest Certificates', description: 'FD, Savings account interest certificates', required: false, uploaded: false },
        { name: 'Rent Receipts', description: 'House rent receipts (if applicable)', required: false, uploaded: false }
      ];
    } else if (serviceType.includes('gst')) {
      return [
        { name: 'PAN Card', description: 'Copy of PAN card', required: true, uploaded: false },
        { name: 'Aadhaar Card', description: 'Copy of Aadhaar card', required: true, uploaded: false },
        { name: 'Bank Account Details', description: 'Bank account statement or cancelled cheque', required: true, uploaded: false },
        { name: 'Business Address Proof', description: 'Electricity bill, rent agreement, or property documents', required: true, uploaded: false },
        { name: 'Business Registration', description: 'Partnership deed, MOA, AOA, or LLP agreement', required: true, uploaded: false },
        { name: 'Digital Signature', description: 'DSC certificate (if available)', required: false, uploaded: false }
      ];
    } else if (serviceType.includes('company') || serviceType.includes('llp') || serviceType.includes('partnership')) {
      return [
        { name: 'PAN Card', description: 'PAN card of all directors/partners', required: true, uploaded: false },
        { name: 'Aadhaar Card', description: 'Aadhaar card of all directors/partners', required: true, uploaded: false },
        { name: 'Address Proof', description: 'Address proof of all directors/partners', required: true, uploaded: false },
        { name: 'Business Address', description: 'Registered office address proof', required: true, uploaded: false },
        { name: 'Digital Signature', description: 'DSC of authorized signatory', required: true, uploaded: false },
        { name: 'MOA/AOA', description: 'Memorandum and Articles of Association', required: false, uploaded: false }
      ];
    } else if (serviceType.includes('trademark')) {
      return [
        { name: 'Trademark Logo', description: 'High-resolution logo/design file', required: true, uploaded: false },
        { name: 'PAN Card', description: 'PAN card of applicant', required: true, uploaded: false },
        { name: 'Address Proof', description: 'Address proof of applicant', required: true, uploaded: false },
        { name: 'Business Registration', description: 'Company/LLP registration certificate', required: false, uploaded: false },
        { name: 'Power of Attorney', description: 'POA if filed through attorney', required: false, uploaded: false }
      ];
    } else if (serviceType.includes('lut')) {
      return [
        { name: 'GST Registration Certificate', description: 'GST registration certificate', required: true, uploaded: false },
        { name: 'PAN Card', description: 'PAN card copy', required: true, uploaded: false },
        { name: 'Bank Account Details', description: 'Bank account statement', required: true, uploaded: false },
        { name: 'Export Documents', description: 'Previous export invoices (if any)', required: false, uploaded: false },
        { name: 'Business Address Proof', description: 'Address proof of business', required: true, uploaded: false }
      ];
    } else {
      // Default documents for other services
      return [
        { name: 'PAN Card', description: 'Copy of PAN card', required: true, uploaded: false },
        { name: 'Aadhaar Card', description: 'Copy of Aadhaar card', required: true, uploaded: false },
        { name: 'Address Proof', description: 'Address proof document', required: true, uploaded: false },
        { name: 'Business Documents', description: 'Relevant business documents', required: false, uploaded: false }
      ];
    }
  };

  // Helper function to match documents to required documents
  const matchDocumentToRequired = (docTitle: string, requiredName: string): boolean => {
    const docTitleLower = docTitle.toLowerCase().trim();
    const requiredNameLower = requiredName.toLowerCase().trim();
    
    // Exact match
    if (docTitleLower === requiredNameLower) return true;
    
    // Check if document title contains required name or vice versa
    if (docTitleLower.includes(requiredNameLower) || requiredNameLower.includes(docTitleLower)) return true;
    
    // Check for common variations
    const variations: { [key: string]: string[] } = {
      'form 16': ['form16', 'form-16', 'form_16'],
      'pan card': ['pan', 'pan-card', 'pan_card', 'pancard'],
      'aadhaar card': ['aadhaar', 'aadhar', 'aadhaar-card', 'aadhar-card'],
      'bank statement': ['bank', 'statement', 'bank-statement', 'bank_statement'],
      'investment proofs': ['investment', '80c', '80d', 'investment-proof'],
      'interest certificates': ['interest', 'fd', 'savings', 'interest-certificate'],
      'rent receipts': ['rent', 'rent-receipt', 'rent_receipt', 'house rent']
    };
    
    // Check variations
    for (const [key, variants] of Object.entries(variations)) {
      if (requiredNameLower.includes(key) || key.includes(requiredNameLower)) {
        if (variants.some(variant => docTitleLower.includes(variant) || variant.includes(docTitleLower))) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Update required documents based on current documents
  const updateRequiredDocumentsStatus = useCallback((currentDocs: UserDocument[]) => {
    setRequiredDocuments(prev => prev.map(reqDoc => {
      const isUploaded = currentDocs.some((doc: UserDocument) => 
        matchDocumentToRequired(doc.title, reqDoc.name)
      );
      return { ...reqDoc, uploaded: isUploaded };
    }));
  }, []);

  // Initialize required documents and fetch existing documents
  useEffect(() => {
    const initializeDocuments = async () => {
      try {
        // Initialize required documents based on service type
        const requiredDocs = getRequiredDocumentsForService(serviceName);
        setRequiredDocuments(requiredDocs);

        // Fetch existing documents for this service
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${API_BASE_URL}/document/service/${serviceId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const existingDocs = response.data.data.userDocuments || [];
        setDocuments(existingDocs);

        // Update required documents to show which ones are uploaded
        const updatedRequiredDocs = requiredDocs.map(reqDoc => {
          const isUploaded = existingDocs.some((doc: UserDocument) => 
            matchDocumentToRequired(doc.title, reqDoc.name)
          );
          return { ...reqDoc, uploaded: isUploaded };
        });
        setRequiredDocuments(updatedRequiredDocs);

      } catch (error: any) {
        // Still initialize required documents even if fetch fails
        const requiredDocs = getRequiredDocumentsForService(serviceName);
        setRequiredDocuments(requiredDocs);
      } finally {
        setLoading(false);
      }
    };

    initializeDocuments();
  }, [serviceId, serviceName]);

  // Update required documents status whenever documents change
  useEffect(() => {
    updateRequiredDocumentsStatus(documents);
  }, [documents, updateRequiredDocumentsStatus]);

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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        alert(`❌ Invalid File Type\n\n"${file.name}" is not a supported file type.\n\n✅ Supported formats: JPG, JPEG, PNG, PDF, DOC, DOCX\n\nPlease select a valid file and try again.`);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`❌ File Too Large\n\n"${file.name}" is ${fileSizeMB} MB.\n\n✅ Maximum allowed size: 10 MB per file\n\nPlease compress or select a smaller file and try again.`);
        return;
      }

      // Validate file name (check for special characters that might cause issues)
      if (file.name.length > 255) {
        alert(`❌ File Name Too Long\n\n"${file.name}" has a very long name.\n\n✅ Please rename the file to be shorter (max 255 characters) and try again.`);
        return;
      }

      const fileId = Math.random().toString(36).substring(2);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadProgress: 0,
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, newFile]);
      uploadFile(newFile);
    });
  };

  const uploadFile = async (fileData: UploadedFile) => {
    try {
      console.log('🚀 Starting upload for:', fileData.name);
      setUploading(true);
      
      const formData = new FormData();
      formData.append('document', fileData.file);
      formData.append('documentType', 'additional');
      formData.append('title', fileData.name);
      formData.append('description', `Uploaded for ${serviceName}`);

      const token = localStorage.getItem('authToken');
      console.log('📤 Uploading to:', `${API_BASE_URL}/document/upload/${serviceId}`);
      console.log('🔑 Token exists:', !!token);
      
      const response = await axios.post(
        `${API_BASE_URL}/document/upload/${serviceId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            console.log(`📊 Upload progress: ${progress}%`);
            setUploadedFiles(prev => prev.map(f => 
              f.id === fileData.id 
                ? { ...f, uploadProgress: progress, status: progress === 100 ? 'completed' : 'uploading' }
                : f
            ));
          }
        }
      );

      console.log('✅ Upload response:', response.data);

      // Add the uploaded document to the documents list
      if (response.data.data.userDocument) {
        const newDocument = response.data.data.userDocument;
        setDocuments(prev => {
          const updated = [...prev, newDocument];
          // Update required documents status after adding new document
          updateRequiredDocumentsStatus(updated);
          return updated;
        });
      }

      // Remove from uploaded files after successful upload
      setTimeout(() => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileData.id));
      }, 1000);

    } catch (error: any) {
      console.error('❌ Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error' }
          : f
      ));
      
      let errorMessage = 'Unknown error';
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again to continue uploading.';
        // Optionally redirect to login or refresh token
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Please upload files smaller than 10MB.';
      } else if (error.response?.status === 415) {
        errorMessage = 'Invalid file type. Please upload JPG, PNG, PDF, DOC, or DOCX files only.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Failed to upload ${fileData.name}: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${API_BASE_URL}/document/remove/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setDocuments(prev => {
        const updated = prev.filter(doc => doc._id !== documentId);
        // Update required documents status after removing document
        updateRequiredDocumentsStatus(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error removing document:', error);
      alert('Failed to remove document. Please try again.');
    }
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
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (type === 'application/pdf') {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007AFF] to-[#00C897] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Upload Documents</h2>
              <p className="text-white/80">{serviceName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Required Documents Checklist */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-[#1F2937] dark:text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 text-[#007AFF] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Required Documents
                </h3>
                <div className="space-y-3">
                  {requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-600">
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
                          {doc.uploaded && (
                            <span className="ml-2 text-[#00C897] text-xs bg-[#00C897]/10 px-2 py-1 rounded-full">
                              ✓ Uploaded
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-bold text-[#007AFF]">
                      {(() => {
                        const uploadedCount = requiredDocuments.filter(doc => doc.uploaded).length;
                        const totalCount = requiredDocuments.length;
                        return `${uploadedCount} / ${totalCount}`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#00C897] to-[#007AFF] h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(() => {
                          const uploadedCount = requiredDocuments.filter(doc => doc.uploaded).length;
                          const totalCount = requiredDocuments.length;
                          return totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Upload Area */}
            <div className="space-y-6">
              {/* Upload Guidelines */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Upload Guidelines & Requirements
                    </h3>
                    <div className="space-y-2.5 text-sm text-blue-800 dark:text-blue-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Supported File Formats:</span>
                          <span className="ml-1">JPG, JPEG, PNG, PDF, DOC, DOCX</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Maximum File Size:</span>
                          <span className="ml-1">10 MB per file</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">File Quality:</span>
                          <span className="ml-1">Ensure documents are clear, readable, and not corrupted</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Multiple Files:</span>
                          <span className="ml-1">You can upload multiple files at once</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">File Naming:</span>
                          <span className="ml-1">Use descriptive names (e.g., "Bank_Statement_Jan_2024.pdf")</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-[#007AFF] bg-[#007AFF]/5'
                    : 'border-gray-300 hover:border-[#007AFF] hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
                  Drag and drop your files here
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse and select files from your device
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    uploading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-[#007AFF] text-white hover:bg-[#0056CC]'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {uploading ? 'Uploading...' : 'Choose Files'}
                </label>
              </div>

              {/* Uploading Files */}
              {uploadedFiles.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-4">
                    Uploading Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="mr-4">
                          {getFileIcon(file.type)}
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

                          {file.status === 'error' && (
                            <div className="flex items-center mt-2 text-sm text-red-500">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Upload failed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Documents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-4">
                  Uploaded Documents ({documents.length})
                </h3>
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc._id} className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="mr-4">
                          {getFileIcon(doc.documentUrl)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1F2937] dark:text-white">{doc.title}</p>
                          {doc.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                          <button
                            onClick={() => removeDocument(doc._id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
