import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {lazy, Suspense, type ReactNode} from "react";
import {useQuery} from "@tanstack/react-query";
import {useAuthStore} from "~/stores/common/authStore";
import {PromptProvider} from "~/components/common/PromptProvider";

// Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/common/auth/Login"));
const Register = lazy(() => import("./pages/common/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/common/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/common/auth/ResetPassword"));
const Products = lazy(() => import("./pages/buyer/Products"));
const ProductDetail = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/buyer/Cart"));
const Checkout = lazy(() => import("./pages/buyer/Checkout"));
const Orders = lazy(() => import("./pages/buyer/Orders"));
const BuyerDashboard = lazy(() => import("./pages/buyer/Dashboard"));
const Profile = lazy(() => import("./pages/buyer/Profile"));
const Address = lazy(() => import("./pages/buyer/Address"));
const SellerDashboard = lazy(() => import("./pages/seller/Dashboard"));
const SellerProducts = lazy(() => import("./pages/seller/Products"));
const SellerCategories = lazy(() => import("./pages/seller/Categories"));
const SellerOrders = lazy(() => import("./pages/seller/Orders"));
const CourierDashboard = lazy(() => import("./pages/courier/Dashboard"));
const DelivererDashboard = lazy(() => import("./pages/deliverer/Dashboard"));
const CourierOrders = lazy(() => import("./pages/courier/Orders"));
const DelivererOrders = lazy(() => import("./pages/deliverer/Orders"));
const AdminDashboard = lazy(() => import("./pages/seller/Dashboard")); // Will create separate admin pages

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
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

  useQuery({
    queryKey: ["auth", "persisted-check"],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem("auth-storage");
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (!parsed?.state?.token) return null;

        const lastAuthCheck = localStorage.getItem("last-auth-check");
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        const hasRecentCheck =
          !!lastAuthCheck && now - Number.parseInt(lastAuthCheck, 10) <= fiveMinutes;

        if (!hasRecentCheck) {
          await checkAuth();
          localStorage.setItem("last-auth-check", now.toString());
        }
      } catch (e) {
        console.warn("Failed to check persisted auth:", e);
      }
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isScopedLogisticsUser =
    !!user &&
    !!token &&
    (user.role === "courier" || user.role === "deliverer");
  const logisticsDashboardPath =
    user?.role === "courier" ? "/courier/dashboard" : "/deliverer/dashboard";

  return (
    <BrowserRouter>
      <PromptProvider />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#98b964] border-t-transparent" />
              <p className="mt-3 text-sm text-gray-600">Loading page...</p>
            </div>
          </div>
        }
      >
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
        path="/seller/categories"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerCategories />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
