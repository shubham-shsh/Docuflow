import api from "./api";

export const createDocument = (formData) =>
  api.post("/documents/create", formData);

export const getMyDocuments = () =>
  api.get("/documents/my-documents");

export const getSingleDocument = async (docId) => {
  const res = await api.get(`/documents/view/${docId}`); // Use your view endpoint
  return res.data; // Return complete document object
};



export const deleteDocument = (docId) =>
  api.delete(`/documents/delete/${docId}`);

export const shareDocument = (docId, data) =>
  api.post(`/documents/share/${docId}`, data);

export const getSharedWithMe = () =>
  api.get("/documents/shared-me");

export const getSingleSharedWithMe = (docId) =>
  api.get(`/documents/share-me/${docId}`);
