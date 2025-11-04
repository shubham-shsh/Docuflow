import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogIn, FileText, Lock, Cloud, Users, ArrowRightCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Seamless Document Upload",
      description: "Effortlessly upload and organize all your files in one central location."
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your data is protected with state-of-the-art encryption and security protocols."
    },
    {
      icon: Cloud,
      title: "Access Anywhere",
      description: "Retrieve your documents from any device, at any time, with our cloud-based solution."
    },
    {
      icon: Users,
      title: "Easy Collaboration",
      description: "Share and collaborate on documents with your team in real-time."
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 sm:px-10 lg:px-16 py-4 sm:py-6 bg-white shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-indigo-600">DocuFlow</span>
        </div>
        <div className="space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 text-base font-semibold text-indigo-800 bg-indigo-100 rounded-full hover:bg-indigo-200 transition transform hover:scale-105"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-16 sm:py-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-inner">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
          Maintain all your documents, seamlessly.
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-indigo-100 mb-8 max-w-2xl">
          Upload, manage, and share your important documents securely. Access them anytime, anywhere, on any device.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center space-x-2 px-8 py-4 text-base font-semibold text-purple-700 bg-white rounded-full shadow-lg hover:bg-gray-200 transition transform hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center space-x-2 px-8 py-4 text-base font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-purple-700 transition transform hover:scale-105"
          >
            <span>Login</span>
            <LogIn size={18} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Powerful Features for Your Workflow
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            DocuFlow provides all the tools you need to manage your documents effectively and securely.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 transition-transform transform hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mx-auto mb-4">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-500 bg-white border-t border-gray-200">
        &copy; {new Date().getFullYear()} DocuFlow. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
