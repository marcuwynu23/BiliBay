import {
  HomeIcon,
  ShoppingCartIcon,
  InformationCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export const NavBar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-xl font-light text-[#98b964]">
              <img
                src="/bilibay-logo-rectangle-light.svg"
                alt="BiliBay Logo"
                className="w-30"
              />
            </a>
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-4">
              <a
                href="/"
                className="flex items-center text-gray-600 hover:text-[#98b964] px-3 py-2 rounded-md text-sm font-medium"
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Home
              </a>
              <a
                href="/products"
                className="flex items-center text-gray-600 hover:text-[#98b964] px-3 py-2 rounded-md text-sm font-medium"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-1" />
                Products
              </a>
              <a
                href="/about"
                className="flex items-center text-gray-600 hover:text-[#98b964] px-3 py-2 rounded-md text-sm font-medium"
              >
                <InformationCircleIcon className="h-5 w-5 mr-1" />
                About
              </a>
              <a
                href="/contact"
                className="flex items-center text-gray-600 hover:text-[#98b964] px-3 py-2 rounded-md text-sm font-medium"
              >
                <PhoneIcon className="h-5 w-5 mr-1" />
                Contact
              </a>
            </div>

            {/* Sign In / Sign Up */}
            <div className="ml-6 flex space-x-2">
              <a
                href="/signin"
                className="px-4 py-2 border border-[#98b964] text-[#98b964] rounded-md text-sm font-medium hover:bg-[#98b964] hover:text-white transition"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="px-4 py-2 bg-[#98b964] text-white rounded-md text-sm font-medium hover:bg-green-800 transition"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
