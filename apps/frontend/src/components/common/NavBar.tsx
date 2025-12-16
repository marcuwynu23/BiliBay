import {Link, useNavigate, useLocation} from "react-router-dom";
import {useState, useEffect} from "react";
import {
  HomeIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";

export const NavBar = () => {
  const {user, token, logout} = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const {confirm} = usePromptStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

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
        {getDashboardLink() && (
          <Link
            to={getDashboardLink()!}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-medium rounded-lg touch-manipulation min-h-[48px]"
          >
            <UserIcon className="h-5 w-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>
        )}
        <div className="border-t border-gray-200 my-2"></div>
        <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 font-medium">
          {user.name}
        </div>
      </>
    ) : (
      <>
        <div className="border-t border-gray-200 my-2"></div>
        <Link
          to="/forgot-password"
          onClick={() => setMobileMenuOpen(false)}
          className="block w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#98b964] hover:text-[#5e7142] transition-colors font-medium text-center"
        >
          Forgot Password?
        </Link>
        <div className="mt-4 space-y-2">
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-medium rounded-lg touch-manipulation min-h-[48px] text-center"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base bg-[#98b964] text-white rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-center"
          >
            Sign Up
          </Link>
        </div>
      </>
    );

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <img
                  src="/bilibay-logo-rectangle-light.svg"
                  alt="BiliBay Logo"
                  className="h-10 md:h-15 sm:h-8 transition-opacity group-hover:opacity-80"
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
                      <span>Dashboard</span>
                    </Link>
                  )}

               
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
              className="lg:hidden p-2.5 text-gray-600 hover:text-[#98b964] rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center z-50 relative"
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
      </nav>

      {/* Mobile menu overlay and panel - rendered outside nav for proper z-index */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            onTouchEnd={(e) => {
              // Only close if touch started and ended on overlay (not on menu)
              if (e.target === e.currentTarget) {
                setMobileMenuOpen(false);
              }
            }}
          />
          
          {/* Menu Panel */}
          <div 
            className="fixed inset-y-0 right-0 w-[280px] sm:w-80 max-w-[90vw] bg-white shadow-2xl z-[70] animate-slide-in-right overflow-hidden flex flex-col touch-manipulation"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 flex-shrink-0 pt-safe">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 active:text-gray-900 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            {/* Mobile menu content */}
            <div className="flex-1 px-2 sm:px-4 py-3 sm:py-4 space-y-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch flex flex-col">
              <div className="flex-1">
                {navigationLinks}
              </div>
            </div>

            {/* Logout button at bottom - only for logged in users */}
            {user && token && (
              <div className="flex-shrink-0 border-t border-gray-200 px-2 sm:px-4 py-4 pb-safe flex justify-center">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center space-x-2 px-6 py-3 sm:py-3.5 text-sm sm:text-base text-gray-700 hover:text-[#98b964] hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 font-medium rounded-lg touch-manipulation min-h-[48px]"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-lg">
        <div className="flex items-center justify-around h-16">
          {/* Home Button */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[64px] transition-colors touch-manipulation ${
              location.pathname === "/"
                ? "text-[#98b964]"
                : "text-gray-600 hover:text-[#98b964]"
            }`}
          >
            <HomeIcon className="h-6 w-6" />
          </Link>

          {/* Products Button */}
          <Link
            to="/products"
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[64px] transition-colors touch-manipulation ${
              location.pathname === "/products"
                ? "text-[#98b964]"
                : "text-gray-600 hover:text-[#98b964]"
            }`}
          >
            <ShoppingBagIcon className="h-6 w-6" />
          </Link>

          {/* Third Button - Cart for buyers, Orders for sellers */}
          {user && user.role === "buyer" ? (
            <Link
              to="/buyer/cart"
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[64px] transition-colors touch-manipulation ${
                location.pathname === "/buyer/cart"
                  ? "text-[#98b964]"
                  : "text-gray-600 hover:text-[#98b964]"
              }`}
            >
              <ShoppingCartIcon className="h-6 w-6" />
            </Link>
          ) : user && user.role === "seller" ? (
            <Link
              to="/seller/orders"
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[64px] transition-colors touch-manipulation ${
                location.pathname === "/seller/orders"
                  ? "text-[#98b964]"
                  : "text-gray-600 hover:text-[#98b964]"
              }`}
            >
              <ClipboardDocumentListIcon className="h-6 w-6" />
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[64px] text-gray-300 cursor-not-allowed">
              <ShoppingCartIcon className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
