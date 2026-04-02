import {useEffect, useState} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {api} from "~/utils/api";

type LogisticsProfile = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export default function DelivererProfile() {
  const {token} = useAuthStore();
  const [profile, setProfile] = useState<LogisticsProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await api.get("/deliverer/users/me", token);
        setProfile(data as LogisticsProfile);
      } finally {
        setLoading(false);
      }
    };
    if (token) run();
  }, [token]);

  const fullName = [profile?.firstName, profile?.middleName, profile?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          View your deliverer account information.
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {loading ? (
            <p className="text-gray-600">Loading profile...</p>
          ) : (
            <>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{fullName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile?.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{profile?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-900">{profile?.role || "deliverer"}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
