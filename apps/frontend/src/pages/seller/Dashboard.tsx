import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {Link} from "react-router-dom";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function SellerDashboard() {
  const dashboardCards = [
    {
      title: "My Products",
      description: "Manage your product catalog",
      icon: CubeIcon,
      link: "/seller/products",
      color: "from-[#98b964] to-[#5e7142]",
      bgColor: "bg-green-50",
      illustration: (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <rect x="20" y="30" width="30" height="30" rx="4" fill="#98b964" opacity="0.2" />
          <rect x="60" y="30" width="30" height="30" rx="4" fill="#98b964" opacity="0.2" />
          <rect x="40" y="70" width="30" height="30" rx="4" fill="#98b964" opacity="0.2" />
          <circle cx="35" cy="45" r="3" fill="#98b964" opacity="0.4" />
          <circle cx="75" cy="45" r="3" fill="#98b964" opacity="0.4" />
          <circle cx="55" cy="85" r="3" fill="#98b964" opacity="0.4" />
        </svg>
      ),
    },
    {
      title: "Orders",
      description: "View and process orders",
      icon: ClipboardDocumentListIcon,
      link: "/seller/orders",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      illustration: (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <rect x="25" y="35" width="70" height="50" rx="4" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          <line x1="35" y1="50" x2="85" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          <line x1="35" y1="65" x2="75" y2="65" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          <circle cx="30" cy="35" r="8" fill="#3b82f6" opacity="0.2" />
          <path d="M 50 20 Q 60 10 70 20" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
        </svg>
      ),
    },
  ];

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 md:py-12 pb-safe">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your store and grow your business</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.link}
                to={card.link}
                className="group relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />

                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  {/* Icon Container */}
                  <div className={`${card.bgColor} w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700" />
                  </div>

                  {/* Illustration */}
                  <div className="w-16 h-16 sm:w-24 sm:h-24 opacity-40 group-hover:opacity-60 transition-opacity hidden sm:block">
                    {card.illustration}
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#98b964] transition-colors">
                  {card.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{card.description}</p>

                {/* Arrow Indicator */}
                <div className="flex items-center text-[#98b964] font-medium group-hover:translate-x-1 transition-transform duration-300">
                  <span>Manage</span>
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#98b964]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Link>
            );
          })}
        </div>

        {/* Quick Actions & Illustration Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Ready to grow?</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Add new products to your catalog and start reaching more customers today.
              </p>
              <Link
                to="/seller/products"
                className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-[#98b964] text-white rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Add New Product
              </Link>
            </div>
            {/* Minimalist Store Illustration */}
            <div className="flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 hidden md:block">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Store building */}
                <rect x="40" y="80" width="120" height="100" rx="4" fill="none" stroke="#98b964" strokeWidth="3" opacity="0.3" />
                <polygon points="40,80 100,40 160,80" fill="#98b964" opacity="0.2" />
                {/* Windows */}
                <rect x="60" y="110" width="25" height="25" rx="2" fill="#98b964" opacity="0.15" />
                <rect x="115" y="110" width="25" height="25" rx="2" fill="#98b964" opacity="0.15" />
                <rect x="60" y="150" width="25" height="25" rx="2" fill="#98b964" opacity="0.15" />
                <rect x="115" y="150" width="25" height="25" rx="2" fill="#98b964" opacity="0.15" />
                {/* Door */}
                <rect x="87.5" y="140" width="25" height="40" rx="2" fill="#98b964" opacity="0.2" />
                <circle cx="107" cy="160" r="2" fill="#98b964" opacity="0.4" />
                {/* Products/boxes outside */}
                <rect x="20" y="160" width="15" height="15" rx="2" fill="#98b964" opacity="0.2" />
                <rect x="165" y="160" width="15" height="15" rx="2" fill="#98b964" opacity="0.2" />
                {/* Decorative elements */}
                <circle cx="30" cy="50" r="8" fill="#98b964" opacity="0.1" />
                <circle cx="170" cy="50" r="8" fill="#98b964" opacity="0.1" />
                <path d="M 20 30 Q 30 20 40 30" fill="none" stroke="#98b964" strokeWidth="2" opacity="0.2" />
                <path d="M 160 30 Q 170 20 180 30" fill="none" stroke="#98b964" strokeWidth="2" opacity="0.2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

