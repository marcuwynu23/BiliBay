import {useState, useEffect, type ComponentType} from "react";
import {Page, Select} from "@bilibay/ui";
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
  Squares2X2Icon,
  ClockIcon,
  ArrowPathIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import deliveriesIllustration from "~/assets/illustrations/deliveries.svg";

type SellerTabConfig = {
  value: string;
  label: string;
  count: number;
  icon: ComponentType<{className?: string}>;
};

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

  const statusTabs: SellerTabConfig[] = [
    { value: "all", label: "All", count: statusCounts.all, icon: Squares2X2Icon },
    { value: "pending", label: "Pending", count: statusCounts.pending, icon: ClockIcon },
    { value: "processing", label: "Processing", count: statusCounts.processing, icon: ArrowPathIcon },
    { value: "shipped", label: "Shipped", count: statusCounts.shipped, icon: TruckIcon },
    { value: "delivered", label: "Delivered", count: statusCounts.delivered, icon: CheckCircleIcon },
    { value: "cancelled", label: "Cancelled", count: statusCounts.cancelled, icon: XCircleIcon },
  ];

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
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
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <div className="flex overflow-x-auto scrollbar-hide">
                <div className="flex min-w-full sm:min-w-0">
                {statusTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveStatusTab(tab.value)}
                      aria-label={tab.label}
                      title={tab.label}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium transition-all duration-200 text-xs sm:text-sm border-b-2 min-w-[60px] sm:min-w-0 whitespace-nowrap touch-manipulation ${
                      activeStatusTab === tab.value
                        ? "border-[#98b964] text-[#98b964] bg-[#98b964]/5"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <TabIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.count > 0 && (
                        <span
                          className={`hidden sm:inline-flex px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                          activeStatusTab === tab.value
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
                </div>
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
              <div className="space-y-6">
                {filteredOrders.map((order) => {
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Header with gradient accent */}
                  <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
                  
                  {/* Compact Header */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900 break-words">
                            Order #{order.orderNumber}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
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
                      <div className="flex flex-row md:flex-col md:items-end gap-2 sm:gap-3">
                        <p className="font-bold text-xl sm:text-2xl text-[#98b964]">₱{order.totalAmount?.toFixed(2)}</p>
                        <span
                          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 -mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
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
                    <div className="mb-4 border-t border-gray-100 pt-4 sm:pt-6">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">Items</p>
                      <div className="space-y-2 sm:space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg bg-gray-50"
                          >
                            <img
                              src={item.product?.images?.[0] || "/placeholder.png"}
                              alt={item.product?.title}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
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
                    <div className="pt-4 sm:pt-6 border-t border-gray-100">
                      {order.status === "processing" && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1.5">Shipping Courier</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Select
                              value={selectedHandlerByOrder[order._id] || ""}
                              onChange={(e) =>
                                setSelectedHandlerByOrder((prev) => ({
                                  ...prev,
                                  [order._id]: e.target.value,
                                }))
                              }
                              options={handlers.map((handler) => ({
                                value: handler._id,
                                label: `${handler.firstName} ${handler.lastName} (${handler.role})`,
                              }))}
                              placeholder="Select shipping courier"
                              containerClassName="flex-1"
                              backgroundColor="bg-white"
                              borderColor="border-gray-300"
                              textColor="text-gray-900"
                              iconColor="text-gray-500"
                              focusRingColor="focus:ring-[#98b964]/40"
                              optionHoverColor="hover:bg-gray-100"
                              optionSelectedColor="bg-[#98b964]/15"
                              selectClassName="py-2.5 sm:py-2.5 px-3 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => assignHandler(order._id, order.orderNumber)}
                              disabled={!selectedHandlerByOrder[order._id]}
                              className="w-full sm:w-auto px-4 py-2.5 text-sm rounded-lg bg-[#98b964] text-white disabled:opacity-60"
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

