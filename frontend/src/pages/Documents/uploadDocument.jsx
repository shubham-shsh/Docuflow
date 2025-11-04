import React, { useState } from "react";
import { createDocument } from "../../services/documentApi.js";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

const UploadDocument = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setUploadProgress(0);

    if (!title || !file) {
      setError("Please provide both title and file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("document", file);

    try {
      setLoading(true);
      
      // Simulate progress bar animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const res = await createDocument(formData);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log("Upload success:", res);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        setSuccess(true);
        
        // Show success message briefly, then navigate
        setTimeout(() => {
          navigate("/my-documents");
        }, 1500);
      }, 300);
    } catch (err) {
      setUploadProgress(0);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + droppedFile.name.split('.').pop().toLowerCase();
      
      if (validTypes.includes(fileExtension)) {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please select a valid file type (.pdf, .doc, .docx, .txt)");
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Upload Successful!</h2>
          <p className="text-green-600">Redirecting to your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Upload New Document</h2>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                placeholder="Enter a descriptive title for your document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select File
              </label>
              
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                    ${dragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports PDF, DOC, DOCX, and TXT files
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">{file.name}</p>
                        <p className="text-sm text-green-600">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 hover:bg-green-200 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                </div>
              )}

              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !title || !file}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden
                  ${loading || !title || !file
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  }`}
              >
                {loading ? (
                  <>
                    {/* Progress bar background */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    
                    {/* Content overlay */}
                    <div className="relative z-10 flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Uploading... {Math.round(uploadProgress)}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Upload Tips */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-2">Upload Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Choose a descriptive title to easily find your document later</li>
              <li>• Supported formats: PDF, DOC, DOCX, TXT</li>
              <li>• Maximum file size: 10MB</li>
              <li>• You can drag and drop files directly onto the upload area</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;