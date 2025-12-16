import {useState, useEffect} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";
import {api} from "~/utils/api";
import {
  ClipboardDocumentListIcon,
  CalendarIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function SellerOrders() {
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
      const data = await api.get("/seller/orders", token);
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = (orderId: string, status: string, trackingNumber?: string, orderNumber?: string) => {
    const statusMessages: Record<string, string> = {
      processing: "mark this order as processing",
      shipped: "mark this order as shipped",
      delivered: "mark this order as delivered",
    };

    const message = statusMessages[status] 
      ? `Are you sure you want to ${statusMessages[status]}${orderNumber ? ` (Order #${orderNumber})` : ""}?`
      : `Are you sure you want to update the order status to "${status}"?`;

    confirm({
      title: "Update Order Status",
      message,
      onConfirm: async () => {
        try {
          await api.put(
            `/seller/orders/${orderId}/status`,
            {status, trackingNumber},
            token
          );
          await alert({
            title: "Success",
            message: "Order status updated successfully!",
            type: "success",
          });
          fetchOrders();
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to update order status",
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
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-12 max-w-7xl pb-safe">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#98b964]" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Orders</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Manage and process customer orders</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
            <ClipboardDocumentListIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm sm:text-base text-gray-600">Orders from customers will appear here</p>
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
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                        <ClipboardDocumentListIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 break-words">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col md:items-end gap-2 sm:gap-3">
                      <p className="font-bold text-xl sm:text-2xl text-[#98b964]">₱{order.totalAmount}</p>
                      <span
                        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-100 pt-4 sm:pt-6 mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">Order Items</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {order.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start sm:items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-gray-50"
                        >
                          <img
                            src={item.product?.images?.[0] || "/placeholder.png"}
                            alt={item.product?.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{item.product?.title}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Quantity: {item.quantity} × ₱{item.price.toFixed(2)}
                            </p>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">
                              Subtotal: ₱{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="border-t border-gray-100 pt-4 sm:pt-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Update Order Status</h4>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <select
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all font-medium touch-manipulation"
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value, undefined, order.orderNumber)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      {order.status === "shipped" && (
                        <input
                          type="text"
                          placeholder="Enter tracking number"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                          onBlur={(e) =>
                            e.target.value &&
                            updateOrderStatus(
                              order._id,
                              order.status,
                              e.target.value,
                              order.orderNumber
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

