import {Link, useNavigate} from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";

export const NavBar = () => {
  const {user, token, logout} = useAuthStore();
  const navigate = useNavigate();
  const {confirm} = useDialogStore();

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
                className="h-8 transition-opacity group-hover:opacity-80"
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
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
                <div className="px-3 py-1.5 text-sm text-gray-600 font-medium hidden sm:block">
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
        </div>
      </div>
    </nav>
  );
};
