import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {useEffect} from "react";
import {useAuthStore} from "~/stores/common/authStore";
import {DialogProvider} from "~/components/common/DialogProvider";

// Pages
import Home from "./pages/Home";
import Login from "./pages/common/auth/Login";
import Register from "./pages/common/auth/Register";
import Products from "./pages/buyer/Products";
import ProductDetail from "./pages/Product";
import Cart from "./pages/buyer/Cart";
import Checkout from "./pages/buyer/Checkout";
import Orders from "./pages/buyer/Orders";
import BuyerDashboard from "./pages/buyer/Dashboard";
import Profile from "./pages/buyer/Profile";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import SellerOrders from "./pages/seller/Orders";
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
  const {checkAuth, token} = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  return (
    <BrowserRouter>
      <DialogProvider />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />

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
