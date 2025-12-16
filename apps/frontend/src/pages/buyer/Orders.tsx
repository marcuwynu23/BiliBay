import {useState, useEffect} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";
import {api} from "~/utils/api";
import {
  ClipboardDocumentListIcon,
  XCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function Orders() {
  const {token} = useAuthStore();
  const {alert, confirm} = useDialogStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const data = await api.get("/buyer/orders", token);
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = (orderId: string, orderNumber: string) => {
    confirm({
      title: "Cancel Order",
      message: `Are you sure you want to cancel Order #${orderNumber}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.post(
            `/buyer/orders/${orderId}/cancel`,
            {reason: "Cancelled by user"},
            token
          );
          fetchOrders();
          await alert({
            title: "Success",
            message: "Order cancelled successfully",
            type: "success",
          });
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to cancel order",
            type: "error",
          });
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardDocumentListIcon className="h-8 w-8 text-[#98b964]" />
            <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600">View and manage your order history</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Header with gradient accent */}
                <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <p className="font-bold text-2xl text-[#98b964]">
                        ₱{order.totalAmount}
                      </p>
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <img
                            src={
                              item.product?.images?.[0] || "/placeholder.png"
                            }
                            alt={item.product?.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {item.product?.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ₱
                              {item.price.toFixed(2)}
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-1">
                              Subtotal: ₱
                              {(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === "pending" && (
                    <div className="border-t border-gray-100 pt-6 mt-6">
                      <button
                        onClick={() =>
                          cancelOrder(order._id, order.orderNumber)
                        }
                        className="flex items-center gap-2 border border-[#98b964] text-[#98b964] px-6 py-2.5 rounded-lg hover:bg-[#98b964] hover:text-white transition-all duration-200 font-medium"
                      >
                        <XCircleIcon className="h-5 w-5" />
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
