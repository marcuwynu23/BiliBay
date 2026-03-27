import {useEffect, useState} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";

export default function CourierOrders() {
  const {token} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [deliverers, setDeliverers] = useState<any[]>([]);
  const [selectedDelivererByOrder, setSelectedDelivererByOrder] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const getCourierStatusDescription = (order: any) => {
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

  const fetchOrders = async () => {
    try {
      const data = await api.get("/courier/orders", token);
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch courier orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliverers = async () => {
    try {
      const data = await api.get("/courier/orders/deliverers", token);
      setDeliverers(data);
    } catch (err) {
      console.error("Failed to fetch deliverers:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchDeliverers();
    }
  }, [token]);

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
          await api.put(`/courier/orders/${orderId}/ship`, {delivererId}, token);
          await alert({
            title: "Success",
            message: "Order shipped and handed off to local deliverer.",
            type: "success",
          });
          fetchOrders();
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to mark as shipped",
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
        <h1 className="text-xl font-bold text-gray-900 mb-4">Courier Orders</h1>
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
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                      Status: {order.status} | Buyer: {order.buyer?.firstName}{" "}
                      {order.buyer?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                      {getCourierStatusDescription(order)}
                    </p>
                    {order.status !== "shipped" && order.status !== "delivered" && (
                      <div className="mt-2">
                        <select
                          value={selectedDelivererByOrder[order._id] || ""}
                          onChange={(e) =>
                            setSelectedDelivererByOrder((prev) => ({
                              ...prev,
                              [order._id]: e.target.value,
                            }))
                          }
                          className="w-full sm:w-[320px] px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        >
                          <option value="">Select local deliverer</option>
                          {deliverers.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.firstName} {d.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {order.status !== "shipped" && order.status !== "delivered" && (
                    <button
                      type="button"
                      onClick={() => markShipped(order._id, order.orderNumber)}
                      className="px-3 py-2 text-sm rounded-lg bg-[#98b964] text-white"
                    >
                      Mark Shipped
                    </button>
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

