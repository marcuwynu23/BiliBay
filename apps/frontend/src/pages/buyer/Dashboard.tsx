import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {Link} from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  UserIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function BuyerDashboard() {
  const dashboardCards = [
    {
      title: "My Orders",
      description: "View and manage your orders",
      icon: ClipboardDocumentListIcon,
      link: "/buyer/orders",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Shopping Cart",
      description: "View items in your cart",
      icon: ShoppingCartIcon,
      link: "/buyer/cart",
      color: "from-[#98b964] to-[#5e7142]",
      bgColor: "bg-green-50",
    },
    {
      title: "My Profile",
      description: "Manage your account settings",
      icon: UserIcon,
      link: "/buyer/profile",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Browse Products",
      description: "Shop for new products",
      icon: ShoppingBagIcon,
      link: "/products",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 md:py-12 pb-safe-nav">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your shopping experience
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.link}
                to={card.link}
                className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
            
                {/* Content */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-[#98b964] transition-colors">
                  {card.title}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  {card.description}
                </p>

                {/* Arrow Indicator */}
                <div className="flex items-center text-[#98b964] font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                  <span>Explore</span>
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#98b964]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Link>
            );
          })}
        </div>

        {/* Minimalist Illustration Section */}
        <div className="mt-8 sm:mt-16 bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Start Shopping
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Discover amazing products from local sellers and support
                Filipino businesses.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-[#98b964] text-white rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base"
              >
                <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Browse Products
              </Link>
            </div>
            {/* Minimalist SVG Illustration */}
            <div className="flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 hidden md:block">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Shopping bag */}
                <path
                  d="M50 70 L50 160 Q50 170 60 170 L140 170 Q150 170 150 160 L150 70 Z"
                  fill="none"
                  stroke="#98b964"
                  strokeWidth="3"
                  className="opacity-30"
                />
                <path
                  d="M70 70 L70 50 Q70 40 80 40 L120 40 Q130 40 130 50 L130 70"
                  fill="none"
                  stroke="#98b964"
                  strokeWidth="3"
                  className="opacity-30"
                />
                {/* Products */}
                <circle cx="80" cy="110" r="15" fill="#98b964" opacity="0.2" />
                <circle cx="120" cy="110" r="15" fill="#98b964" opacity="0.2" />
                <circle cx="100" cy="140" r="15" fill="#98b964" opacity="0.2" />
                {/* Decorative lines */}
                <line
                  x1="30"
                  y1="50"
                  x2="50"
                  y2="50"
                  stroke="#98b964"
                  strokeWidth="2"
                  opacity="0.2"
                />
                <line
                  x1="150"
                  y1="50"
                  x2="170"
                  y2="50"
                  stroke="#98b964"
                  strokeWidth="2"
                  opacity="0.2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
