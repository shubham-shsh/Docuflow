import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'

// Pages
import LandingPage from "./pages/HomePage";
import SignupPage from "./pages/DashBoard/SignupPage";
import Login from "./pages/DashBoard/Login";
import MyDocuments from "./pages/Documents/MyDocuments";
import SharePage from "./pages/Sharing/SharePage";
import SharedWithMe from "./pages/Documents/SharedWithMe";
import Profile from "./pages/Profile/MyProfile";
import UploadDocument from "./pages/Documents/uploadDocument";
import DocumentViewPage from "./pages/Documents/DocumentViewPage";






function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element = {<SignupPage/>}/>
        <Route path="/login" element={<Login />} />   
        <Route path = "/my-documents" element = {<MyDocuments/>}/>
        <Route path="/create" element={<UploadDocument />} />
        <Route path ="/share/:docId" element={<SharePage />} />
        <Route path="/shared-with-me" element={<SharedWithMe />} />
        <Route path = "/profile" element = {<Profile/>} />
        <Route path="/documents/view/:docId" element={<DocumentViewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
