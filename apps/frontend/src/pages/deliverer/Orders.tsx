import {useCallback, useEffect, useMemo, useState} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {CalendarIcon, UserIcon, PhotoIcon} from "@heroicons/react/24/outline";
import shoppingIllustration from "~/assets/illustrations/online-shopping.svg";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type DelivererOrder = {
  _id: string;
  orderNumber: string;
  status: Exclude<OrderStatus, "all">;
  buyer?: {firstName?: string; lastName?: string};
  deliveryEvidenceImage?: string;
  createdAt?: string;
};

export default function DelivererOrders() {
  const {token} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [orders, setOrders] = useState<DelivererOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [evidenceByOrder, setEvidenceByOrder] = useState<
    Record<string, File | null>
  >({});

  const getDelivererStatusText = (status: string) => {
    if (status === "shipped") {
      return "At local branch (not yet delivered to buyer)";
    }
    if (status === "delivered") {
      return "Delivered to buyer";
    }
    return status;
  };

  const getDelivererStatusDescription = (status: string) => {
    if (status === "pending") {
      return "Order is still waiting for seller and courier processing.";
    }
    if (status === "processing") {
      return "Order is not yet at local area delivery stage.";
    }
    if (status === "shipped") {
      return "Order has arrived at local branch and is ready for final delivery to buyer.";
    }
    if (status === "delivered") {
      return "Final delivery completed. Evidence is available below.";
    }
    if (status === "cancelled") {
      return "Order was cancelled and delivery is closed.";
    }
    return "Order status updated.";
  };

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get("/deliverer/orders", token);
      setOrders(data as DelivererOrder[]);
    } catch (err) {
      console.error("Failed to fetch deliverer orders:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchOrders();
  }, [fetchOrders, token]);

  const markDelivered = (orderId: string, orderNumber: string) => {
    const evidenceFile = evidenceByOrder[orderId];
    if (!evidenceFile) {
      alert({
        title: "Evidence required",
        message: "Please upload a delivery evidence picture first.",
        type: "error",
      });
      return;
    }

    confirm({
      title: "Confirm Delivered",
      message: `Confirm you already gave Order #${orderNumber} to the buyer?`,
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append("evidence", evidenceFile);
          const uploadData = await api.upload(
            "/deliverer/upload/evidence",
            formData,
            token,
          );
          await api.put(
            `/deliverer/orders/${orderId}/deliver`,
            {deliveryEvidenceImage: uploadData.evidenceUrl},
            token,
          );
          await alert({
            title: "Success",
            message: "Order marked as delivered with evidence.",
            type: "success",
          });
          fetchOrders();
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to confirm delivery";
          await alert({
            title: "Error",
            message,
            type: "error",
          });
        }
      },
    });
  };

  const deliveryScopedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "shipped" || order.status === "delivered",
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
            Complete final delivery and upload proof for each handoff.
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
              Orders assigned to your deliverer account will appear here.
            </p>
          </div>
        ) : (
          <>
            {deliveryScopedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
                <img
                  src={shoppingIllustration}
                  alt="No orders"
                  className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6 opacity-60"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No delivery orders yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Orders ready for final delivery will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {deliveryScopedOrders.map((order) => (
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
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200 w-fit">
                          {getDelivererStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
                        {getDelivererStatusDescription(order.status)}
                      </p>
                      {order.status === "shipped" && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="flex-1 inline-flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
                            <PhotoIcon className="h-4 w-4 text-gray-500" />
                            <span className="truncate">
                              {evidenceByOrder[order._id]?.name ||
                                "Upload delivery evidence"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setEvidenceByOrder((prev) => ({
                                  ...prev,
                                  [order._id]:
                                    e.target.files && e.target.files[0]
                                      ? e.target.files[0]
                                      : null,
                                }))
                              }
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              markDelivered(order._id, order.orderNumber)
                            }
                            className="w-full sm:w-auto px-4 py-2.5 text-sm rounded-lg bg-[#98b964] text-white hover:bg-[#5e7142] transition-colors"
                          >
                            Confirm Given to Buyer
                          </button>
                        </div>
                      )}
                      {order.status === "delivered" && (
                        <span className="text-xs text-green-700 font-medium">
                          Delivered to buyer
                        </span>
                      )}
                      {order.deliveryEvidenceImage && (
                        <a
                          href={order.deliveryEvidenceImage}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-[#5e7142] underline underline-offset-2"
                        >
                          View delivery evidence
                        </a>
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
