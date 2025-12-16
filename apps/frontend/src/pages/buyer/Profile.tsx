import {useState, useEffect} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {UserIcon, KeyIcon, MapPinIcon} from "@heroicons/react/24/outline";

export default function Profile() {
  const {token} = useAuthStore();
  const {alert} = usePromptStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    phone: "",
    defaultShippingAddress: {
      street: "",
      city: "",
      province: "",
      zipCode: "",
      country: "Philippines",
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "address"
  >("profile");

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const data = await api.get("/buyer/users/me", token);
      setProfile(data);
      setFormData({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : "",
        phone: data.phone || "",
        defaultShippingAddress: data.defaultShippingAddress || {
          street: "",
          city: "",
          province: "",
          zipCode: "",
          country: "Philippines",
        },
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/buyer/users/me", formData, token);
      await alert({
        title: "Success",
        message: "Profile updated successfully!",
        type: "success",
      });
      fetchProfile();
    } catch (err: any) {
      await alert({
        title: "Error",
        message: err.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await alert({
        title: "Error",
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      await alert({
        title: "Error",
        message: "Password must be at least 6 characters",
        type: "error",
      });
      return;
    }

    setSaving(true);

    try {
      await api.post(
        "/buyer/users/me/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token
      );
      await alert({
        title: "Success",
        message: "Password changed successfully!",
        type: "success",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      await alert({
        title: "Error",
        message: err.message || "Failed to change password",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <NavBar />
        <div className="w-full px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 md:py-12 pb-safe">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">Profile</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === "profile"
                  ? "bg-[#98b964] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === "password"
                  ? "bg-[#98b964] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Password</span>
            </button>
            <button
              onClick={() => setActiveTab("address")}
              className={`flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === "address"
                  ? "bg-[#98b964] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Address</span>
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Personal Information
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Update your personal details</p>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({...formData, firstName: e.target.value})
                  }
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Middle Name <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={formData.middleName}
                  onChange={(e) =>
                    setFormData({...formData, middleName: e.target.value})
                  }
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({...formData, lastName: e.target.value})
                  }
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Birthday <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={formData.birthday}
                  onChange={(e) =>
                    setFormData({...formData, birthday: e.target.value})
                  }
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={profile?.email || ""}
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({...formData, phone: e.target.value})
                  }
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#98b964] text-white px-6 py-3.5 sm:py-3 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-base sm:text-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Change Password
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Update your password to keep your account secure
              </p>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Must be at least 6 characters
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#98b964] text-white px-6 py-3.5 sm:py-3 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-base sm:text-sm"
              >
                {saving ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Shipping Address
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your default shipping address
              </p>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={formData.defaultShippingAddress.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultShippingAddress: {
                        ...formData.defaultShippingAddress,
                        street: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                    value={formData.defaultShippingAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultShippingAddress: {
                          ...formData.defaultShippingAddress,
                          city: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Province
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                    value={formData.defaultShippingAddress.province}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultShippingAddress: {
                          ...formData.defaultShippingAddress,
                          province: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                  value={formData.defaultShippingAddress.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultShippingAddress: {
                        ...formData.defaultShippingAddress,
                        zipCode: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#98b964] text-white px-6 py-3.5 sm:py-3 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-base sm:text-sm"
              >
                {saving ? "Saving..." : "Save Address"}
              </button>
            </form>
          </div>
        )}
      </div>
    </Page>
  );
}
