import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";
import {api} from "~/utils/api";
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Cart() {
  const {token} = useAuthStore();
  const navigate = useNavigate();
  const {alert, confirm} = useDialogStore();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      navigate("/login");
    }
  }, [token]);

  const fetchCart = async () => {
    try {
      const data = await api.get("/buyer/cart", token);
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1 || !itemId) return;
    try {
      await api.put(`/buyer/cart/${itemId}`, {quantity}, token);
      fetchCart();
    } catch (err: any) {
      await alert({
        title: "Error",
        message: err.message || "Failed to update quantity",
        type: "error",
      });
    }
  };

  const removeItem = (itemId: string, productTitle: string) => {
    if (!itemId) return;
    confirm({
      title: "Remove Item",
      message: `Are you sure you want to remove "${productTitle}" from your cart?`,
      onConfirm: async () => {
        try {
          await api.delete(`/buyer/cart/${itemId}`, token);
          fetchCart();
          await alert({
            title: "Success",
            message: "Item removed from cart",
            type: "success",
          });
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to remove item",
            type: "error",
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <NavBar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </Page>
    );
  }

  const subtotal = cart?.total || 0;
  const shippingFee = subtotal >= 50 ? 0 : 10;
  const total = subtotal + shippingFee;

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-12 max-w-7xl pb-safe">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <ShoppingCartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#98b964]" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Shopping Cart
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Review your items before checkout
          </p>
        </div>

        {!cart || cart.items?.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
            <ShoppingCartIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Start adding products to your cart
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-[#98b964] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base"
            >
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cart.items.map((item: any, index: number) => (
                <div
                  key={item._id || `cart-item-${index}`}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Gradient accent */}
                  <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <img
                        src={item.product?.images?.[0] || "/placeholder.png"}
                        alt={item.product?.title}
                        className="w-full sm:w-28 sm:h-28 h-48 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 break-words">
                          {item.product?.title}
                        </h3>
                        <p className="text-xl sm:text-2xl font-bold text-[#98b964] mb-3 sm:mb-4">
                          ₱{item.product?.price?.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-2.5 sm:p-2 text-[#98b964] hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#98b964] transition-all rounded-l-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="min-w-[3rem] text-center font-semibold text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              disabled={
                                item.quantity >= (item.product?.stock || 0)
                              }
                              className="p-2.5 sm:p-2 text-[#98b964] hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#98b964] transition-all rounded-r-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              removeItem(
                                item._id,
                                item.product?.title || "this item"
                              )
                            }
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 active:text-red-800 font-medium transition-colors touch-manipulation min-h-[44px] px-2"
                          >
                            <TrashIcon className="h-5 w-5" />
                            <span className="text-sm sm:text-base">Remove</span>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          Subtotal:{" "}
                          <span className="font-semibold text-gray-900">
                            ₱{(item.product?.price * item.quantity).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                {/* Gradient accent */}
                <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Order Summary
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">
                        ₱{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping:</span>
                      <span className="font-semibold">
                        {shippingFee === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₱${shippingFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          Total:
                        </span>
                        <span className="text-2xl font-bold text-[#98b964]">
                          ₱{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full flex items-center justify-center gap-2 bg-[#98b964] text-white py-4 sm:py-3 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-base sm:text-sm"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
