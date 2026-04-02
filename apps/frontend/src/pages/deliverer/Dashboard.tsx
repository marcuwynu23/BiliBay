import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {Link} from "react-router-dom";
import {ArrowRightIcon, MapPinIcon} from "@heroicons/react/24/outline";
import shoppingIllustration from "~/assets/illustrations/online-shopping.svg";

export default function DelivererDashboard() {
  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#98b964] to-[#5e7142]" />
          <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#98b964]/10 text-[#5e7142] px-3 py-1 text-xs font-semibold mb-3">
                <MapPinIcon className="h-4 w-4" />
                Deliverer Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Deliverer Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-5">
                Handle final-mile delivery, upload proof of handoff, and complete buyer delivery confirmation.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-semibold text-gray-900">Local Deliverer</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Focus</p>
                  <p className="text-sm font-semibold text-gray-900">Final Delivery</p>
                </div>
              </div>
              <Link
                to="/deliverer/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#98b964] hover:bg-[#5e7142] text-white text-sm font-medium transition-colors"
              >
                View Assigned Orders
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/deliverer/profile"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-[#98b964] text-gray-700 hover:text-[#5e7142] text-sm font-medium transition-colors ml-0 sm:ml-2 mt-2 sm:mt-0"
              >
                Profile
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src={shoppingIllustration}
                alt="Deliverer dashboard"
                className="w-full max-w-sm h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

