import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {useEffect} from "react";
import {useAuthStore} from "~/stores/common/authStore";
import {PromptProvider} from "~/components/common/PromptProvider";

// Pages
import Home from "./pages/Home";
import Login from "./pages/common/auth/Login";
import Register from "./pages/common/auth/Register";
import ForgotPassword from "./pages/common/auth/ForgotPassword";
import ResetPassword from "./pages/common/auth/ResetPassword";
import Products from "./pages/buyer/Products";
import ProductDetail from "./pages/Product";
import Cart from "./pages/buyer/Cart";
import Checkout from "./pages/buyer/Checkout";
import Orders from "./pages/buyer/Orders";
import BuyerDashboard from "./pages/buyer/Dashboard";
import Profile from "./pages/buyer/Profile";
import Address from "./pages/buyer/Address";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import SellerOrders from "./pages/seller/Orders";
import CourierDashboard from "./pages/courier/Dashboard";
import DelivererDashboard from "./pages/deliverer/Dashboard";
import CourierOrders from "./pages/courier/Orders";
import DelivererOrders from "./pages/deliverer/Orders";
import AdminDashboard from "./pages/seller/Dashboard"; // Will create separate admin pages

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const {user, token} = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const {checkAuth, user, token} = useAuthStore();
  const isScopedLogisticsUser =
    !!user &&
    !!token &&
    (user.role === "courier" || user.role === "deliverer");
  const logisticsDashboardPath =
    user?.role === "courier" ? "/courier/dashboard" : "/deliverer/dashboard";

  // Only check auth on mount if token exists from localStorage
  // This prevents calling checkAuth immediately after login/register
  // Login data will persist unless explicitly logged out
  useEffect(() => {
    // Check if we have persisted auth data from a previous session
    // Only verify token if it was stored before (not from a fresh login)
    const checkPersistedAuth = () => {
      try {
        const stored = localStorage.getItem("auth-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Only check auth if we have a token from a previous session
          // The persist middleware will hydrate the state automatically
          if (parsed?.state?.token) {
            // Check if we've checked auth recently (within last 5 minutes)
            const lastAuthCheck = localStorage.getItem("last-auth-check");
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            // Only check if we haven't checked recently or if it's been more than 5 minutes
            if (!lastAuthCheck || (now - parseInt(lastAuthCheck)) > fiveMinutes) {
              // Small delay to ensure Zustand has hydrated from localStorage
              setTimeout(() => {
                checkAuth().then(() => {
                  // Update last check time on success
                  localStorage.setItem("last-auth-check", now.toString());
                }).catch(() => {
                  // Don't update on error, so we can retry
                });
              }, 500);
            } else {
              // Recently checked, skip this time
              console.log("Skipping auth check - recently verified");
            }
          }
        }
      } catch (e) {
        // If parsing fails, don't clear - might be temporary issue
        console.warn("Failed to check persisted auth:", e);
      }
    };

    checkPersistedAuth();
  }, []); // Empty dependency array - only run on mount

  return (
    <BrowserRouter>
      <PromptProvider />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isScopedLogisticsUser ? (
              <Navigate to={logisticsDashboardPath} replace />
            ) : (
              <Home />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/products"
          element={
            isScopedLogisticsUser ? (
              <Navigate to={logisticsDashboardPath} replace />
            ) : (
              <Products />
            )
          }
        />
        <Route
          path="/product/:id"
          element={
            isScopedLogisticsUser ? (
              <Navigate to={logisticsDashboardPath} replace />
            ) : (
              <ProductDetail />
            )
          }
        />

        {/* Buyer Routes */}
        <Route
          path="/buyer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/cart"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/orders"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/profile"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/addresses"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Address />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />

        {/* Courier Routes */}
        <Route
          path="/courier/dashboard"
          element={
            <ProtectedRoute allowedRoles={["courier"]}>
              <CourierDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courier/orders"
          element={
            <ProtectedRoute allowedRoles={["courier"]}>
              <CourierOrders />
            </ProtectedRoute>
          }
        />

        {/* Deliverer Routes */}
        <Route
          path="/deliverer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["deliverer"]}>
              <DelivererDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deliverer/orders"
          element={
            <ProtectedRoute allowedRoles={["deliverer"]}>
              <DelivererOrders />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
