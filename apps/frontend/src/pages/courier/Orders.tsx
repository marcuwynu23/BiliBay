import {useCallback, useEffect, useMemo, useState} from "react";
import {Page, Select} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {CalendarIcon, UserIcon} from "@heroicons/react/24/outline";
import shoppingIllustration from "~/assets/illustrations/online-shopping.svg";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type CourierOrder = {
  _id: string;
  orderNumber: string;
  status: Exclude<OrderStatus, "all">;
  buyer?: {firstName?: string; lastName?: string};
  createdAt?: string;
};

type DeliveryHandler = {
  _id: string;
  firstName?: string;
  lastName?: string;
};

export default function CourierOrders() {
  const {token} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [deliverers, setDeliverers] = useState<DeliveryHandler[]>([]);
  const [selectedDelivererByOrder, setSelectedDelivererByOrder] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

  const getCourierStatusDescription = (order: CourierOrder) => {
    if (order.status === "pending") {
      return "Order is waiting for seller processing before courier handoff.";
    }
    if (order.status === "processing") {
      return "Order is assigned to courier and waiting for handoff to local deliverer.";
    }
    if (order.status === "shipped") {
      return "Courier handoff completed. Order is now with local deliverer.";
    }
    if (order.status === "delivered") {
      return "Order has been delivered to buyer.";
    }
    if (order.status === "cancelled") {
      return "Order was cancelled and is no longer active.";
    }
    return "Order status updated.";
  };

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get("/courier/orders", token);
      setOrders(data as CourierOrder[]);
    } catch (err) {
      console.error("Failed to fetch courier orders:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchDeliverers = useCallback(async () => {
    try {
      const data = await api.get("/courier/orders/deliverers", token);
      setDeliverers(data as DeliveryHandler[]);
    } catch (err) {
      console.error("Failed to fetch deliverers:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchDeliverers();
    }
  }, [token, fetchOrders, fetchDeliverers]);

  const markShipped = (orderId: string, orderNumber: string) => {
    const delivererId = selectedDelivererByOrder[orderId];
    if (!delivererId) {
      alert({
        title: "Select deliverer",
        message: "Please select a local deliverer first.",
        type: "error",
      });
      return;
    }

    confirm({
      title: "Mark as Shipped + Handoff",
      message: `Mark Order #${orderNumber} as shipped and hand off to selected deliverer?`,
      onConfirm: async () => {
        try {
          await api.put(
            `/courier/orders/${orderId}/ship`,
            {delivererId},
            token,
          );
          await alert({
            title: "Success",
            message: "Order shipped and handed off to local deliverer.",
            type: "success",
          });
          fetchOrders();
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to mark as shipped";
          await alert({
            title: "Error",
            message: errorMessage,
            type: "error",
          });
        }
      },
    });
  };

  const courierScopedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "processing" || order.status === "shipped",
    );
  }, [orders]);

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
        <div className="mb-6 sm:mb-10">
          <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">
            Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage assigned shipments and handoff to local distributors.
          </p>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent" />
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
            <img
              src={shoppingIllustration}
              alt="No orders"
              className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6"
            />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No assigned orders
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Orders assigned to your courier account will appear here.
            </p>
          </div>
        ) : (
          <>
            {courierScopedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
                <img
                  src={shoppingIllustration}
                  alt="No orders"
                  className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6 opacity-60"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No courier orders yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Orders ready for courier handoff will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {courierScopedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1" />
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <UserIcon className="h-3.5 w-3.5" />
                            <span>
                              Buyer: {order.buyer?.firstName}{" "}
                              {order.buyer?.lastName}
                            </span>
                          </div>
                          {order.createdAt && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              <span>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200 w-fit">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
                        {getCourierStatusDescription(order)}
                      </p>
                      {order.status === "processing" && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select
                            value={selectedDelivererByOrder[order._id] || ""}
                            onChange={(e) =>
                              setSelectedDelivererByOrder((prev) => ({
                                ...prev,
                                [order._id]: e.target.value,
                              }))
                            }
                            options={deliverers.map((d) => ({
                              value: d._id,
                              label:
                                `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
                            }))}
                            placeholder="Select local deliverer"
                            containerClassName="flex-1"
                            backgroundColor="bg-white"
                            borderColor="border-gray-300"
                            textColor="text-gray-900"
                            iconColor="text-gray-500"
                            focusRingColor="focus:ring-[#98b964]/40"
                            optionHoverColor="hover:bg-gray-100"
                            optionSelectedColor="bg-[#98b964]/15"
                            selectClassName="py-2.5 px-3 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              markShipped(order._id, order.orderNumber)
                            }
                            className="w-full sm:w-auto px-4 py-2.5 text-sm rounded-lg bg-[#98b964] text-white hover:bg-[#5e7142] transition-colors"
                          >
                            Mark Shipped
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
