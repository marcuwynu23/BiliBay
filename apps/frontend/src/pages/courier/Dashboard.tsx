import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {Link} from "react-router-dom";

export default function CourierDashboard() {
  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Courier Dashboard</h1>
        <p className="text-gray-600">
          Courier account is active. Delivery workflow pages can be added next.
        </p>
        <Link
          to="/courier/orders"
          className="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#98b964] text-white"
        >
          View Assigned Orders
        </Link>
      </div>
    </Page>
  );
}

