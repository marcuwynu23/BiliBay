import {useCallback, useEffect, useState} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";

export default function DelivererOrders() {
  const {token} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [orders, setOrders] = useState<
    Array<{
      _id: string;
      orderNumber: string;
      status: string;
      buyer?: {firstName?: string; lastName?: string};
      deliveryEvidenceImage?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [evidenceByOrder, setEvidenceByOrder] = useState<Record<string, File | null>>({});

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
      setOrders(data);
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

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Deliverer Orders</h1>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No assigned orders.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                      Status: {getDelivererStatusText(order.status)} | Buyer: {order.buyer?.firstName}{" "}
                      {order.buyer?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                      {getDelivererStatusDescription(order.status)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {order.status === "shipped" && (
                      <>
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
                          className="text-xs w-full sm:w-auto"
                        />
                        <button
                          type="button"
                          onClick={() => markDelivered(order._id, order.orderNumber)}
                          className="px-3 py-2 text-sm rounded-lg bg-[#98b964] text-white"
                        >
                          Confirm Given to Buyer
                        </button>
                      </>
                    )}
                    {order.status === "delivered" && (
                      <span className="text-xs text-green-700 font-medium">
                        Delivered to buyer
                      </span>
                    )}
                  </div>
                </div>
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
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

