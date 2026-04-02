import {useEffect, useState} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";

type SellerProfileData = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  birthday?: string;
  phone?: string;
};

export default function SellerProfile() {
  const {token} = useAuthStore();
  const {alert} = usePromptStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<SellerProfileData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    try {
      const data = await api.get("/seller/users/me", token);
      setProfile(data as SellerProfileData);
      setFormData({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error("Failed to fetch seller profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/seller/users/me", formData, token);
      await alert({
        title: "Success",
        message: "Profile updated successfully.",
        type: "success",
      });
      fetchProfile();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      await alert({title: "Error", message, type: "error"});
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await alert({
        title: "Error",
        message: "New password and confirmation do not match.",
        type: "error",
      });
      return;
    }
    setSaving(true);
    try {
      await api.post(
        "/seller/users/me/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token,
      );
      setPasswordData({currentPassword: "", newPassword: "", confirmPassword: ""});
      await alert({
        title: "Success",
        message: "Password changed successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password";
      await alert({title: "Error", message, type: "error"});
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Manage your seller account details.
        </p>
        {loading ? (
          <div className="text-center py-16 text-gray-600">Loading profile...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form
              onSubmit={handleProfileUpdate}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4"
            >
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
              <input
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData((p) => ({...p, firstName: e.target.value}))}
              />
              <input
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Middle name"
                value={formData.middleName}
                onChange={(e) => setFormData((p) => ({...p, middleName: e.target.value}))}
              />
              <input
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData((p) => ({...p, lastName: e.target.value}))}
              />
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                value={formData.birthday}
                onChange={(e) => setFormData((p) => ({...p, birthday: e.target.value}))}
              />
              <input
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({...p, phone: e.target.value}))}
              />
              <input
                disabled
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                value={profile?.email || ""}
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-lg bg-[#98b964] text-white hover:bg-[#5e7142] disabled:opacity-60"
              >
                Save Profile
              </button>
            </form>

            <form
              onSubmit={handlePasswordChange}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4"
            >
              <h2 className="font-semibold text-gray-900">Change Password</h2>
              <input
                type="password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Current password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({...p, currentPassword: e.target.value}))
                }
              />
              <input
                type="password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                placeholder="New password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({...p, newPassword: e.target.value}))
                }
              />
              <input
                type="password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({...p, confirmPassword: e.target.value}))
                }
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-lg bg-[#98b964] text-white hover:bg-[#5e7142] disabled:opacity-60"
              >
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>
    </Page>
  );
}
