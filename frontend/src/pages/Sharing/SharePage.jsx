import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const SharePage = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleShare = async () => {
    if (!email) {
      setErrorMsg("Please enter an email.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.post(`/documents/share/${docId}`, { recieverEmail: email });

      setSuccessMsg(res.message || "Document shared successfully!");
      setEmail("");

      // Redirect after 2 seconds
      setTimeout(() => navigate("/my-documents"), 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to share document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">🔗 Share Document</h1>

        <p className="text-gray-600 text-center mb-6">
          Enter the email of the person you want to share this document with.
        </p>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
        />
        <div className="flex justify-between gap-3">
          <button
            onClick={() => navigate("/my-documents")}
            className="w-1/2 px-4 py-3 border rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="w-1/2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>

        {errorMsg && <p className="text-red-500 text-md mb-4 text-center">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 text-md mb-4 text-center">{successMsg}</p>}
      </div>
    </div>
  );
};

export default SharePage;
