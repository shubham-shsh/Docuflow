import React, { useEffect, useState } from "react";
import { getMyDocuments, deleteDocument,getSingleDocument } from "../../services/documentApi.js";
import { logoutUser } from "../../services/userApi.js";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  Eye, 
  Share2, 
  Trash2, 
  LogOut, 
  User, 
  Inbox,
  Calendar,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await getMyDocuments();
        setDocuments(res?.data || []);
      } catch (err) {
        setError(err?.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Filter documents by search term
  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete handlers
  const handleDeleteClick = (id) => {
    setDeletingDocId(id);
    setConfirmText("");
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type 'DELETE' to confirm deletion");
      return;
    }
    
    setDeleteLoading(true);
    try {
      await deleteDocument(deletingDocId);
      setDocuments((prev) => prev.filter((doc) => doc._id !== deletingDocId));
      setShowDeletePopup(false);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to delete document");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      setError("Logout failed, please try again.");
    }
  };

  // const handleView = async (docId) => {
  // try {
  //     const fileUrl = await getSingleDocument(docId);
  //     console.log("File URL:", fileUrl);
  //     if (fileUrl) {
  //       window.open(fileUrl, "_blank"); // ✅ always opens URL
  //     } else {
  //       setError("File URL not found");
  //     }
  //   } catch (err) {
  //     console.error("Error opening document:", err);
  //     setError(err?.message || "You don’t have permission to view this document.");
  //   }
  // };

     const handleView = async (docId) => {
        try {
          // Instead of opening URL directly, navigate to document view page
          navigate(`/documents/view/${docId}`);
        } catch (err) {
          console.error("Error navigating to document:", err);
          setError(err?.message || "Failed to navigate to document.");
        }
      };




  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-50 w-full border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer group ml-4" // ✅ added ml-4 here
              onClick={() => navigate("/")}
            >
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <FileText className="w-7 h-7 text-white" /> {/* ✅ made icon slightly bigger */}
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocuFlow
              </h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-3 mr-4"> {/* ✅ added right margin for breathing space */}
              <button
                onClick={() => navigate("/shared-with-me")}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                <Inbox className="w-4 h-4" />
                <span className="hidden sm:inline">Inbox</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all duration-200 hover:shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Documents</h1>
            <p className="text-gray-600">Manage and organize your uploaded documents</p>
          </div>

          {/* Search and Actions Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Upload Button */}
              <button
                onClick={() => navigate("/create")}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm 
                ? `No documents match "${searchTerm}"`
                : "Start by uploading your first document"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/create")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Your First Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                        onClick={() => handleView(doc._id)}
                      >
                        {doc.title || "Untitled Document"}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(doc._id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="View Document"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/share/${doc._id}`)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                      title="Share Document"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(doc._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Document"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Count */}
        {filteredDocuments.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Showing {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
              </div>
              <p className="text-gray-600">
                This action cannot be undone. To confirm, please type{" "}
                <span className="font-mono font-bold text-red-600">DELETE</span> in the box below.
              </p>
            </div>
            
            <div className="p-6">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-6 transition-all duration-200"
                autoFocus
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeletePopup(false)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading || confirmText !== "DELETE"}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
