import {useState, useEffect} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import deliveriesIllustration from "~/assets/illustrations/deliveries.svg";

export default function SellerOrders() {
  const {token} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState<string>("all");
  const [handlers, setHandlers] = useState<any[]>([]);
  const [selectedHandlerByOrder, setSelectedHandlerByOrder] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchHandlers();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const data = await api.get("/seller/orders", token);
      setOrders(data);
      setSelectedHandlerByOrder((prev) => {
        const next = {...prev};
        data.forEach((order: any) => {
          if (!next[order._id] && order.assignedHandler?._id) {
            next[order._id] = order.assignedHandler._id;
          }
        });
        return next;
      });
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHandlers = async () => {
    try {
      const data = await api.get("/seller/orders/handlers", token);
      setHandlers(data);
    } catch (err) {
      console.error("Failed to fetch handlers:", err);
    }
  };

  const updateOrderStatus = (orderId: string, status: string, trackingNumber?: string, orderNumber?: string) => {
    const statusMessages: Record<string, string> = {
      processing: "mark this order as processing",
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

  const assignHandler = (orderId: string, orderNumber?: string) => {
    const handlerId = selectedHandlerByOrder[orderId];
    if (!handlerId) return;
    confirm({
      title: "Assign Shipping Courier",
      message: `Ship this order${orderNumber ? ` (#${orderNumber})` : ""} by assigning the selected shipping courier?`,
      onConfirm: async () => {
        try {
          await api.put(`/seller/orders/${orderId}/assign-handler`, {handlerId}, token);
          await alert({
            title: "Success",
            message: "Shipping courier assigned successfully.",
            type: "success",
          });
          fetchOrders();
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to assign delivery handler",
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

  const getSellerStatusDescription = (order: any) => {
    if (order.status === "pending") {
      return "New order received. Review and move to processing when preparation starts.";
    }
    if (order.status === "processing") {
      if (!order.assignedHandler) {
        return "Order is being prepared. Assign a courier to continue shipping.";
      }
      return `Order is assigned to ${order.assignedHandler.firstName} ${order.assignedHandler.lastName} (${order.assignedHandler.role}) for shipping.`;
    }
    if (order.status === "shipped") {
      return "Order has been handed off and is currently in transit/local delivery.";
    }
    if (order.status === "delivered") {
      return "Order delivery completed.";
    }
    if (order.status === "cancelled") {
      return "Order has been cancelled.";
    }
    return "Order status updated.";
  };

  // Filter orders by status
  const filteredOrders = activeStatusTab === "all" 
    ? orders 
    : orders.filter(order => order.status === activeStatusTab);

  // Get order counts per status
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const statusTabs = [
    { value: "all", label: "All", count: statusCounts.all },
    { value: "pending", label: "Pending", count: statusCounts.pending },
    { value: "processing", label: "Processing", count: statusCounts.processing },
    { value: "shipped", label: "Shipped", count: statusCounts.shipped },
    { value: "delivered", label: "Delivered", count: statusCounts.delivered },
    { value: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
  ];

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 md:py-12 pb-safe-nav">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">Orders</h1>
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
            <img
              src={deliveriesIllustration}
              alt="No orders"
              className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6"
            />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm sm:text-base text-gray-600">Orders from customers will appear here</p>
          </div>
        ) : (
          <>
            {/* Status Filter Tabs */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-6 p-2">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto -mx-2 px-2 scrollbar-hide">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveStatusTab(tab.value)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm whitespace-nowrap touch-manipulation ${
                      activeStatusTab === tab.value
                        ? "bg-[#98b964] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                          activeStatusTab === tab.value
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
                <img
                  src={deliveriesIllustration}
                  alt="No orders"
                  className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6 opacity-50"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No {activeStatusTab !== "all" ? activeStatusTab : ""} orders
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {activeStatusTab === "all" 
                    ? "Orders from customers will appear here"
                    : `No orders with status "${activeStatusTab}" found`}
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {filteredOrders.map((order) => {
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Header with gradient accent */}
                  <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
                  
                  {/* Compact Header */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                       
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 break-words">
                            Order #{order.orderNumber}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-[#98b964]">₱{order.totalAmount?.toFixed(2)}</p>
                        <span
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                      {getSellerStatusDescription(order)}
                    </p>
                    {/* Customer Information */}
                    {order.buyer && (
                      <div className="mb-4 bg-gray-50 rounded-lg p-3 space-y-2.5">
                        <p className="text-xs font-semibold text-gray-700">Customer Information</p>
                        <div className="flex items-start gap-2">
                          <UserIcon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600">Customer Name</p>
                            <p className="text-sm font-semibold text-gray-900 break-words">
                              {order.buyer.firstName} {order.buyer.middleName ? `${order.buyer.middleName} ` : ""}{order.buyer.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600">Email</p>
                            <p className="text-sm font-medium text-gray-900 break-all">
                              {order.buyer.email}
                            </p>
                          </div>
                        </div>
                        {order.buyer.phone && (
                          <div className="flex items-start gap-2">
                            <PhoneIcon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600">Phone</p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.buyer.phone}
                              </p>
                            </div>
                          </div>
                        )}
                        {order.shippingAddress && (
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600">Shipping Address</p>
                              <p className="text-sm font-medium text-gray-900 break-words">
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zipCode}, {order.shippingAddress.country || "Philippines"}
                              </p>
                              {order.shippingAddress.location?.lat != null &&
                                order.shippingAddress.location?.lng != null && (
                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="text-xs text-gray-700">
                                      <span className="font-semibold">Lat:</span>{" "}
                                      {Number(order.shippingAddress.location.lat).toFixed(6)}
                                    </span>
                                    <span className="text-xs text-gray-700">
                                      <span className="font-semibold">Lng:</span>{" "}
                                      {Number(order.shippingAddress.location.lng).toFixed(6)}
                                    </span>
                                    <a
                                      className="text-xs font-medium text-[#5e7142] hover:text-[#4a5a35] underline underline-offset-2"
                                      href={`https://www.google.com/maps?q=${encodeURIComponent(
                                        `${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`,
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      View on map
                                    </a>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Items */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg bg-gray-50"
                          >
                            <img
                              src={item.product?.images?.[0] || "/placeholder.png"}
                              alt={item.product?.title}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs sm:text-sm text-gray-900 break-words line-clamp-1">
                                {item.product?.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                {item.quantity} × ₱{item.price.toFixed(2)} = ₱{(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-gray-200">
                      {order.status === "processing" && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1.5">Shipping Courier</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={selectedHandlerByOrder[order._id] || ""}
                              onChange={(e) =>
                                setSelectedHandlerByOrder((prev) => ({
                                  ...prev,
                                  [order._id]: e.target.value,
                                }))
                              }
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            >
                              <option value="">Select shipping courier</option>
                              {handlers.map((handler) => (
                                <option key={handler._id} value={handler._id}>
                                  {handler.firstName} {handler.lastName} ({handler.role})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => assignHandler(order._id, order.orderNumber)}
                              disabled={!selectedHandlerByOrder[order._id]}
                              className="px-3 py-2 text-sm rounded-lg bg-[#98b964] text-white disabled:opacity-60"
                            >
                              Ship
                            </button>
                          </div>
                          {order.assignedHandler && (
                            <p className="text-xs text-gray-700 mt-2">
                              Assigned to: {order.assignedHandler.firstName} {order.assignedHandler.lastName} ({order.assignedHandler.role})
                            </p>
                          )}
                        </div>
                      )}

                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              order._id,
                              "processing",
                              undefined,
                              order.orderNumber,
                            )
                          }
                          className="w-full sm:w-auto px-4 py-2.5 text-sm rounded-lg bg-[#98b964] text-white hover:bg-[#5e7142] transition-colors"
                        >
                          To Ship
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}

