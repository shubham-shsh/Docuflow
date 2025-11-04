import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleDocument } from '../../services/documentApi.js';
import DocumentViewer from './DocumentViewer.jsx';

const DocumentViewPage = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [docId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await getSingleDocument(docId);
      
      if (response) {
        setDocument(response);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError(error?.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-red-600 text-xl mb-4 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          {error}
        </div>
        <button
          onClick={() => navigate('/mydocuments')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to My Documents
        </button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600 text-xl">Document not found</div>
      </div>
    );
  }

  return <DocumentViewer document={document} />;
};

export default DocumentViewPage;
