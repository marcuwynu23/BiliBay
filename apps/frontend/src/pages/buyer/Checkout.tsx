import {useCallback, useMemo, useRef, useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

type LatLng = {lat: number; lng: number};

type CartItem = {
  _id: string;
  quantity: number;
  variant?: string;
  product?: {_id: string; title: string; price: number};
};

type Cart = {
  items: CartItem[];
  total: number;
};

function LeafletLocationPicker({
  center,
  value,
  onPick,
}: {
  center: LatLng;
  value: LatLng | null;
  onPick: (pos: LatLng) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pinIcon = useMemo(
    () =>
      L.divIcon({
        className: "custom-location-pin",
        html: `
          <div style="position: relative; width: 22px; height: 22px;">
            <div style="width:22px;height:22px;border-radius:9999px;background:#ef4444;border:2px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.25);"></div>
            <div style="position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid #ef4444;"></div>
          </div>
        `,
        iconSize: [22, 31],
        iconAnchor: [11, 31],
      }),
    [],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: value ? 16 : 6,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onPick({lat: e.latlng.lat, lng: e.latlng.lng});
    });

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lng], value ? 16 : 6, {animate: false});
  }, [center.lat, center.lng, value]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!value) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      markerRef.current = L.marker([value.lat, value.lng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current.on("dragend", () => {
        const latlng = markerRef.current?.getLatLng();
        if (!latlng) return;
        onPick({lat: latlng.lat, lng: latlng.lng});
      });
    } else {
      markerRef.current.setLatLng([value.lat, value.lng]);
    }
  }, [value, onPick, pinIcon]);

  return <div ref={containerRef} className="h-full w-full" />;
}

export default function Checkout() {
  const {user, token} = useAuthStore();
  const navigate = useNavigate();
  const {alert, confirm} = usePromptStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Philippines",
    location: undefined as LatLng | undefined,
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">(
    "cod",
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [locating, setLocating] = useState(false);

  const defaultCenter = useMemo<LatLng>(() => ({lat: 14.5995, lng: 120.9842}), []); // Manila
  const pickedLocation = shippingAddress.location ?? null;
  const mapCenter = pickedLocation ?? defaultCenter;

  const fetchCart = useCallback(async () => {
    try {
      const data = (await api.get("/buyer/cart", token)) as Cart;
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
  }, [navigate, token]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await api.get("/buyer/users/me", token);
      if (profile.defaultShippingAddress) {
        setShippingAddress(profile.defaultShippingAddress);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user || user.role !== "buyer") {
      navigate("/login");
      return;
    }

    fetchCart();
    fetchUserProfile();
  }, [fetchCart, fetchUserProfile, navigate, token, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      await alert({
        title: "Location not supported",
        message: "Your browser doesn't support location services.",
        type: "error",
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {lat: pos.coords.latitude, lng: pos.coords.longitude};
        setShippingAddress((prev) => ({...prev, location: next}));
        setLocating(false);
      },
      async (err) => {
        setLocating(false);
        await alert({
          title: "Couldn't get your location",
          message: err.message || "Please allow location permission, or pick on the map.",
          type: "error",
        });
      },
      {enableHighAccuracy: true, timeout: 10000},
    );
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

          const orderItems = (cart?.items ?? []).flatMap((item: CartItem) => {
            if (!item.product?._id) return [];
            return [
              {
                productId: item.product._id,
                quantity: item.quantity,
                variant: item.variant,
              },
            ];
          });

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
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to place order";
          await alert({
            title: "Error",
            message,
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
        <div className="w-full px-4 py-12">
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
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 md:py-12 pb-safe-nav">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Complete your order details
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                    <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Shipping Address
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all text-sm sm:text-base"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          street: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Province
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                        value={shippingAddress.province}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            province: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                      value={shippingAddress.zipCode}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          zipCode: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="pt-2 sm:pt-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                          Pin Location (Map)
                        </label>
                        <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
                          Click on the map to drop a pin for delivery.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={locating}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-xs sm:text-sm font-medium hover:border-[#98b964] hover:text-[#5e7142] disabled:opacity-60 transition-colors"
                      >
                        {locating ? "Locating..." : "Use my location"}
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <div className="h-[260px] w-full">
                        <LeafletLocationPicker
                          center={mapCenter}
                          value={pickedLocation}
                          onPick={(pos) =>
                            setShippingAddress((prev) => ({...prev, location: pos}))
                          }
                        />
                      </div>

                      <div className="p-3 bg-white border-t border-gray-200">
                        {pickedLocation ? (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                            <span className="text-gray-700">
                              <span className="font-semibold">Lat:</span>{" "}
                              {pickedLocation.lat.toFixed(6)}
                            </span>
                            <span className="text-gray-700">
                              <span className="font-semibold">Lng:</span>{" "}
                              {pickedLocation.lng.toFixed(6)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setShippingAddress((prev) => ({
                                  ...prev,
                                  location: undefined,
                                }))
                              }
                              className="ml-auto text-red-600 hover:text-red-700 font-medium"
                            >
                              Clear pin
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-600">
                            No pin selected yet.
                          </p>
                        )}
                      </div>
                    </div>
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
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Payment Method
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Choose how you want to pay
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#98b964] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "cod")
                      }
                      className="mr-3 w-4 h-4 text-[#98b964] focus:ring-[#98b964]"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm sm:text-base text-gray-900">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Pay when you receive your order
                      </p>
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
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "bank_transfer")
                      }
                      className="mr-3 w-4 h-4 text-[#98b964] focus:ring-[#98b964]"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm sm:text-base text-gray-900">
                        Bank Transfer
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Transfer funds directly to our account
                      </p>
                    </div>
                    {paymentMethod === "bank_transfer" && (
                      <CheckCircleIcon className="h-6 w-6 text-[#98b964]" />
                    )}
                  </label>

                  {paymentMethod === "bank_transfer" && (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Payment Reference
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                          placeholder="Transaction reference number"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Upload Receipt
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
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
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <TruckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#98b964]" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    Order Summary
                  </h2>
                </div>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {cart?.items?.map((item: CartItem) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-start text-xs sm:text-sm p-2.5 sm:p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product?.title}
                        </p>
                        <p className="text-gray-600">× {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900 flex-shrink-0">
                        ₱{((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      ₱{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                    <span>Shipping:</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₱${shippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 sm:pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-[#98b964]">
                        ₱{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 sm:mt-6 flex items-center justify-center gap-2 bg-[#98b964] text-white py-3.5 sm:py-3 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-base sm:text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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
