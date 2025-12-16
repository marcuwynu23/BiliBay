import {useState, useEffect, useMemo} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {
  ClipboardDocumentListIcon,
  XCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import deliveriesIllustration from "~/assets/illustrations/deliveries.svg";

type OrderStatus = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export default function Orders() {
  const {token} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");

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

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  const tabs: {id: OrderStatus; label: string; count: number}[] = [
    {id: "all", label: "All", count: orders.length},
    {id: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length},
    {id: "processing", label: "Processing", count: orders.filter((o) => o.status === "processing").length},
    {id: "shipped", label: "Shipped", count: orders.filter((o) => o.status === "shipped").length},
    {id: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length},
    {id: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length},
  ];

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">View and manage your order history</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <div className="flex overflow-x-auto scrollbar-hide">
                <div className="flex min-w-full sm:min-w-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 min-w-[120px] sm:min-w-0 ${
                        activeTab === tab.id
                          ? "border-[#98b964] text-[#98b964] bg-[#98b964]/5"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              activeTab === tab.id
                                ? "bg-[#98b964] text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
                <img
                  src={deliveriesIllustration}
                  alt="No orders"
                  className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === "all" ? "No orders yet" : `No ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} orders`}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {activeTab === "all"
                    ? "Start shopping to see your orders here"
                    : `You don't have any ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} orders at the moment`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
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
                    <div className="flex flex-row md:flex-col md:items-end gap-2 sm:gap-3">
                      <p className="font-bold text-xl sm:text-2xl text-[#98b964]">
                        ₱{order.totalAmount}
                      </p>
                      <span
                        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-100 pt-4 sm:pt-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">
                      Order Items
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {order.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <img
                            src={
                              item.product?.images?.[0] || "/placeholder.png"
                            }
                            alt={item.product?.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                              {item.product?.title}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Quantity: {item.quantity} × ₱
                              {item.price.toFixed(2)}
                            </p>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">
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
                    <div className="border-t border-gray-100 pt-4 sm:pt-6 mt-4 sm:mt-6">
                      <button
                        onClick={() =>
                          cancelOrder(order._id, order.orderNumber)
                        }
                        className="flex items-center justify-center gap-2 border border-[#98b964] text-[#98b964] px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-[#98b964] hover:text-white transition-all duration-200 font-medium text-sm sm:text-base w-full sm:w-auto"
                      >
                        <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
