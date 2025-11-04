import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File,
  Image,
  Presentation,
  Link,
  Info
} from 'lucide-react';

// Define supported inline file types for browser preview
const supportedInlineMimes = [
  'application/pdf', 
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/svg+xml', 'image/bmp'
];
const supportedInlineExts = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

// Helper function to determine if a file can be viewed inline
const canOpenInBrowser = (mimetype, filename) => {
  if (mimetype && supportedInlineMimes.includes(mimetype.toLowerCase())) {
    return true;
  }
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    if (supportedInlineExts.includes(ext)) {
      return true;
    }
  }
  return false;
};

// Function to map file types to Lucide React icons
const getFileIcon = (mimetype, filename) => {
  if (mimetype) {
    if (mimetype === 'application/pdf') return <FileText className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />;
    if (mimetype.startsWith('image/')) return <Image className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />;
    if (mimetype.includes('word') || mimetype.includes('document')) return <FileText className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />;
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return <Presentation className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />;
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return <FileSpreadsheet className="w-8 h-8 md:w-10 md:h-10 text-green-500" />;
    if (mimetype.includes('zip') || mimetype.includes('rar')) return <FileArchive className="w-8 h-8 md:w-10 md:h-10 text-gray-500" />;
  }
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'pdf') return <FileText className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return <Image className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />;
    if (['doc', 'docx', 'txt'].includes(ext)) return <FileText className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />;
    if (['ppt', 'pptx'].includes(ext)) return <Presentation className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />;
    if (['xls', 'xlsx'].includes(ext)) return <FileSpreadsheet className="w-8 h-8 md:w-10 md:h-10 text-green-500" />;
  }
  return <File className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />;
};

const DocumentViewer = ({ document }) => {
  const navigate = useNavigate();
  const { fileUrl, mimetype, originalName, title, createdAt } = document;
  const filename = originalName || title;

  const getFileExtension = (filename) => {
    return filename ? filename.toLowerCase().split('.').pop() : '';
  };

  const canOpen = canOpenInBrowser(mimetype, filename);
  const fileExt = getFileExtension(filename);

  // Function to get proper download URL
  const getDownloadUrl = (fileUrl, mimetype, fileExt) => {
    if (fileUrl.includes('cloudinary.com')) {
      return fileUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    return fileUrl;
  };

  const renderInlineContent = () => {
    if (mimetype === 'application/pdf' || fileExt === 'pdf') {
      return (
        <div className="w-full">
          <iframe
            src={fileUrl}
            width="100%"
            height="800px"
            title={title}
            className="border-0 rounded-lg shadow-lg"
          />
        </div>
      );
    }

    if (mimetype?.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(fileExt)) {
      return (
        <div className="flex justify-center p-4 sm:p-6">
          <img
            src={fileUrl}
            alt={title}
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ maxHeight: '80vh' }}
            onError={(e) => { e.target.src = 'https://placehold.co/600x400/CCCCCC/000000?text=Image+Unavailable'; }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 font-sans antialiased">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200"
              title="Go Back"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="text-3xl">
                {getFileIcon(mimetype, filename)}
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 break-words max-w-xs sm:max-w-md">
                  {title}
                </h1>
                {filename !== title && (
                  <p className="text-gray-500 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs">
                    Original: {filename}
                  </p>
                )}
              </div>
            </div>
          </div>
          <a
            href={getDownloadUrl(fileUrl, mimetype, fileExt)}
            download={filename}
            className="flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base hidden sm:inline">Download</span>
          </a>
        </header>

        {/* File Info */}
        <section className="bg-white rounded-b-xl p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:divide-x md:divide-gray-200">
            <div className="flex flex-col items-start md:px-4">
              <span className="font-semibold text-gray-700 flex items-center mb-1">
                <Link className="w-4 h-4 mr-2" /> File Type
              </span>
              <p className="text-gray-600 font-medium">{mimetype || `File extension: .${fileExt}` || 'Unknown'}</p>
            </div>
            <div className="flex flex-col items-start md:px-4">
              <span className="font-semibold text-gray-700 flex items-center mb-1">
                <Info className="w-4 h-4 mr-2" /> Uploaded
              </span>
              <p className="text-gray-600 font-medium">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-start md:px-4">
              <span className="font-semibold text-gray-700 flex items-center mb-1">
                <Info className="w-4 h-4 mr-2" /> Preview Status
              </span>
              <p className={`font-medium ${canOpen ? 'text-green-600' : 'text-orange-600'}`}>
                {canOpen ? 'Available' : 'Download to view'}
              </p>
            </div>
          </div>
        </section>

        {/* Content Display */}
        <main className="min-h-[50vh] p-4 sm:p-6">
          {canOpen ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-inner">
              {renderInlineContent()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-100 rounded-lg border border-dashed border-gray-300">
              <div className="text-6xl mb-4 text-gray-400">
                <File />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                Preview not available
              </h3>
              <p className="text-center max-w-md mb-6 text-gray-600">
                This file type ({mimetype || `.${fileExt}` || 'unknown'}) cannot be displayed in the browser.
                Please download it to view the content.
              </p>
              <a
                href={getDownloadUrl(fileUrl, mimetype, fileExt)}
                download={filename}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 shadow-md transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Download {filename}</span>
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocumentViewer;
