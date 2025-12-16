import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {
  HomeIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";

export const NavBar = () => {
  const {user, token, logout} = useAuthStore();
  const navigate = useNavigate();
  const {confirm} = useDialogStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    confirm({
      title: "Confirm Logout",
      message: "Are you sure you want to logout?",
      onConfirm: () => {
        logout();
        navigate("/");
      },
    });
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case "buyer":
        return "/buyer/dashboard";
      case "seller":
        return "/seller/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return null;
    }
  };

  const navigationLinks =
    user && token ? (
      <>
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          to="/products"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg"
        >
          <ShoppingBagIcon className="h-5 w-5" />
          <span>Products</span>
        </Link>
        {user && user.role === "buyer" && (
          <Link
            to="/buyer/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Cart</span>
          </Link>
        )}
        {getDashboardLink() && (
          <Link
            to={getDashboardLink()!}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg"
          >
            <UserIcon className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
        )}
        <div className="border-t border-gray-200 my-2"></div>
        <div className="px-4 py-2 text-sm text-gray-600 font-medium">
          {user.name}
        </div>
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            handleLogout();
          }}
          className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg w-full text-left"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </>
    ) : (
      <>
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg"
        >
          Home
        </Link>
        <Link
          to="/products"
          onClick={() => setMobileMenuOpen(false)}
          className="px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg"
        >
          Products
        </Link>
        <div className="border-t border-gray-200 my-2"></div>
        <Link
          to="/login"
          onClick={() => setMobileMenuOpen(false)}
          className="px-4 py-3 text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          onClick={() => setMobileMenuOpen(false)}
          className="px-4 py-3 text-base bg-[#98b964] text-white rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow text-center"
        >
          Sign Up
        </Link>
      </>
    );

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <img
                src="/bilibay-logo-rectangle-light.svg"
                alt="BiliBay Logo"
                className="h-7 sm:h-8 transition-opacity group-hover:opacity-80"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {user && token ? (
              <>
                {/* Main Navigation */}
                <Link
                  to="/"
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/products"
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  <span>Products</span>
                </Link>
                {user && user.role === "buyer" && (
                  <Link
                    to="/buyer/cart"
                    className="flex items-center space-x-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium relative"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>Cart</span>
                  </Link>
                )}

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 mx-2" />

                {/* User Actions */}
                {getDashboardLink() && (
                  <Link
                    to={getDashboardLink()!}
                    className="flex items-center space-x-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    <UserIcon className="h-4 w-4" />
                  </Link>
                )}

                {/* User Name - Subtle */}
                <div className="px-3 py-1.5 text-sm text-gray-600 font-medium">
                  {user.name}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Public Navigation */}
                <Link
                  to="/"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Products
                </Link>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 mx-2" />

                {/* Auth Buttons */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-[#98b964] rounded-lg font-medium transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 text-sm bg-[#98b964] text-white rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-1">{navigationLinks}</div>
        </div>
      )}
    </nav>
  );
};
