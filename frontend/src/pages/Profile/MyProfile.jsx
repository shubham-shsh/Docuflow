import { useState, useEffect } from "react";
import { getCurrentUser, updateAccount, updateAvatar, changePassword } from "../../services/userApi.js";
import Toast from "./Mark.jsx";
import { 
  User, 
  Camera, 
  Edit3, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  FileText,
  ArrowLeft,
  Shield,
  UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [toast, setToast] = useState(null);
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.success) {
          setUser(res.data);
          setFullName(res.data.fullName);
          setAvatarPreview(res.data.avatar);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        showToast(err.message || "Failed to fetch user", "error");
      }
    };
    fetchUser();
  }, []);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await updateAccount({ fullName });
      if (res.success) {
        setUser({ ...user, fullName });
        setIsEditing(false);
        showToast("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error updating profile", "error");
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const res = await updateAvatar(formData);
      if (res.success) {
        setUser({ ...user, avatar: res.data.avatar });
        setAvatarFile(null);
        showToast("Avatar updated successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error updating avatar", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("New passwords do not match!", "error");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast("Password must be at least 6 characters long!", "error");
      return;
    }
    try {
      const res = await changePassword(passwords);
      if (res.success) {
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        showToast("Password changed successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error changing password", "error");
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size must be less than 5MB", "error");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DocuFlow
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">Profile Settings</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === "profile" 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveSection("security")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === "security" 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Security
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === "profile" && (
              <div className="space-y-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-32 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                  <div className="px-8 pb-8 -mt-16 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                      {/* Avatar Section */}
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                          <img
                            src={avatarPreview || "/default-avatar.png"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl font-bold text-gray-900 truncate">
                            {user.fullName || "User"}
                          </h2>
                          {/* White badge around icon */}
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm ml-1 flex-shrink-0">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{user.email}</p>
                        <div className="flex flex-wrap gap-3">
                          {avatarFile && (
                            <button
                              onClick={handleUpdateAvatar}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                            >
                              <Save className="w-4 h-4" />
                              Save Avatar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <form onSubmit={handleUpdateAccount} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-4 py-4 rounded-2xl border-2 transition-all font-medium ${
                            isEditing
                              ? "border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 bg-white"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-medium"
                      />
                      <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Security Settings</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        className="w-full px-4 py-4 pr-12 rounded-2xl border-2 border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all font-medium"
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("old")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full px-4 py-4 pr-12 rounded-2xl border-2 border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all font-medium"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="w-full px-4 py-4 pr-12 rounded-2xl border-2 border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all font-medium"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Tips */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Security Tips</h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• Use at least 8 characters with mixed case, numbers, and symbols</li>
                          <li>• Avoid using personal information in passwords</li>
                          <li>• Don't reuse passwords from other accounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Lock className="w-5 h-5" />
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
