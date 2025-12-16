import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";
import {api} from "~/utils/api";
import {
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function Checkout() {
  const {user, token} = useAuthStore();
  const navigate = useNavigate();
  const {alert, confirm} = useDialogStore();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Philippines",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    if (!token || !user || user.role !== "buyer") {
      navigate("/login");
      return;
    }

    fetchCart();
    fetchUserProfile();
  }, [token, user]);

  const fetchCart = async () => {
    try {
      const data = await api.get("/buyer/cart", token);
      setCart(data);
      if (!data.items || data.items.length === 0) {
        navigate("/buyer/cart");
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      navigate("/buyer/cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profile = await api.get("/buyer/users/me", token);
      if (profile.defaultShippingAddress) {
        setShippingAddress(profile.defaultShippingAddress);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile) return null;

    try {
      const formData = new FormData();
      formData.append("receipt", receiptFile);
      const data = await api.upload("/buyer/upload/receipt", formData, token);
      return data.receiptUrl;
    } catch (err) {
      console.error("Failed to upload receipt:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = (cart?.total || 0) + ((cart?.total || 0) >= 50 ? 0 : 10);

    confirm({
      title: "Confirm Order",
      message: `Are you sure you want to place this order for ₱${total.toFixed(2)}?`,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          let receiptUrl = null;
          if (paymentMethod === "bank_transfer" && receiptFile) {
            receiptUrl = await uploadReceipt();
          }

          const orderItems = cart.items.map((item: any) => ({
            productId: item.product._id,
            quantity: item.quantity,
            variant: item.variant,
          }));

          const orderData = {
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentReference: paymentReference || undefined,
            receiptImage: receiptUrl || undefined,
          };

          await api.post("/buyer/orders", orderData, token);
          await alert({
            title: "Success",
            message: "Order placed successfully!",
            type: "success",
          });
          navigate("/buyer/orders");
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to place order",
            type: "error",
          });
        } finally {
          setSubmitting(false);
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
            <p className="mt-4 text-gray-600">Loading checkout...</p>
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
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order details</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                    <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress({...shippingAddress, street: e.target.value})
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({...shippingAddress, city: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Province
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                        value={shippingAddress.province}
                        onChange={(e) =>
                          setShippingAddress({...shippingAddress, province: e.target.value})
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                      value={shippingAddress.zipCode}
                      onChange={(e) =>
                        setShippingAddress({...shippingAddress, zipCode: e.target.value})
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <CreditCardIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                    <p className="text-sm text-gray-600">Choose how you want to pay</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#98b964] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                      className="mr-3 w-4 h-4 text-[#98b964] focus:ring-[#98b964]"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                    {paymentMethod === "cod" && (
                      <CheckCircleIcon className="h-6 w-6 text-[#98b964]" />
                    )}
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#98b964] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value as "bank_transfer")}
                      className="mr-3 w-4 h-4 text-[#98b964] focus:ring-[#98b964]"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Bank Transfer</span>
                      <p className="text-sm text-gray-600">Transfer funds directly to our account</p>
                    </div>
                    {paymentMethod === "bank_transfer" && (
                      <CheckCircleIcon className="h-6 w-6 text-[#98b964]" />
                    )}
                  </label>

                  {paymentMethod === "bank_transfer" && (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Reference
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                          placeholder="Transaction reference number"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Upload Receipt
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
              <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TruckIcon className="h-6 w-6 text-[#98b964]" />
                  <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                </div>
                <div className="space-y-3 mb-6">
                  {cart?.items?.map((item: any) => (
                    <div key={item._id} className="flex justify-between items-start text-sm p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product?.title}</p>
                        <p className="text-gray-600">× {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₱{(item.product?.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
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
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-[#98b964]">₱{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-[#98b964] text-white py-3 rounded-lg font-medium hover:bg-[#5e7142] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Page>
  );
}

