import {useEffect, useMemo, useRef, useState} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {MapPinIcon, PlusIcon, TrashIcon} from "@heroicons/react/24/outline";

type Location = {lat: number; lng: number};
type AddressItem = {
  street: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
  location?: Location;
};

const normalizeAddress = (raw: Partial<AddressItem>): AddressItem => ({
  street: String(raw.street ?? "").trim(),
  city: String(raw.city ?? "").trim(),
  province: String(raw.province ?? "").trim(),
  zipCode: String(raw.zipCode ?? "").trim(),
  country: String(raw.country ?? "Philippines").trim() || "Philippines",
  location:
    raw.location &&
    Number.isFinite(Number(raw.location.lat)) &&
    Number.isFinite(Number(raw.location.lng))
      ? {
          lat: Number(raw.location.lat),
          lng: Number(raw.location.lng),
        }
      : undefined,
});

function AddressMapPicker({
  center,
  value,
  onPick,
}: {
  center: Location;
  value?: Location;
  onPick: (pos: Location) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pinIcon = useMemo(
    () =>
      L.divIcon({
        className: "custom-address-pin",
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

const emptyAddress: AddressItem = {
  street: "",
  city: "",
  province: "",
  zipCode: "",
  country: "Philippines",
};

export default function Address() {
  const {token} = useAuthStore();
  const {alert} = usePromptStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [form, setForm] = useState<AddressItem>(emptyAddress);
  const defaultCenter = useMemo<Location>(() => ({lat: 14.5995, lng: 120.9842}), []);
  const mapCenter = form.location ?? defaultCenter;

  const fetchProfileAddresses = async () => {
    const profile = await api.get("/buyer/users/me", token);
    const fromList = Array.isArray(profile.shippingAddresses)
      ? profile.shippingAddresses.map((a: Partial<AddressItem>) => normalizeAddress(a))
      : [];
    // Backward compatibility for accounts that only had one default address.
    if (fromList.length === 0 && profile.defaultShippingAddress) {
      return [normalizeAddress(profile.defaultShippingAddress)];
    }
    return fromList;
  };

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      try {
        const next = await fetchProfileAddresses();
        setAddresses(next);
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  const persistAddresses = async (nextAddresses: AddressItem[]) => {
    if (!token) return;
    setSaving(true);
    try {
      const cleaned = nextAddresses
        .map((a) => normalizeAddress(a))
        .filter((a) => a.street && a.city && a.province && a.zipCode);

      const response = await api.put(
        "/buyer/users/me",
        {
          shippingAddresses: cleaned,
          defaultShippingAddress: cleaned[0],
        },
        token,
      );

      const returned = Array.isArray(response?.shippingAddresses)
        ? response.shippingAddresses.map((a: Partial<AddressItem>) =>
            normalizeAddress(a),
          )
        : cleaned;

      setAddresses(returned);
      await alert({
        title: "Saved",
        message: "Address saved successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save address";
      await alert({
        title: "Error",
        message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const canAdd = useMemo(() => {
    return (
      form.street.trim() &&
      form.city.trim() &&
      form.province.trim() &&
      form.zipCode.trim()
    );
  }, [form]);

  const addAddress = async () => {
    if (!canAdd) return;
    const next = normalizeAddress(form);
    const updated = [...addresses, next];
    setAddresses(updated);
    setForm(emptyAddress);
    await persistAddresses(updated);
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      await alert({
        title: "Location not supported",
        message: "Your browser does not support geolocation.",
        type: "error",
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          location: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        }));
        setLocating(false);
      },
      async (err) => {
        setLocating(false);
        await alert({
          title: "Couldn't get your location",
          message: err.message || "Please allow permission or pick on map.",
          type: "error",
        });
      },
      {enableHighAccuracy: true, timeout: 10000},
    );
  };

  const removeAddress = async (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    await persistAddresses(updated);
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Addresses
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Add multiple delivery addresses for your account.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600">Loading addresses...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">
              <h2 className="font-bold text-lg text-gray-900">Add Address</h2>
              <input
                placeholder="Street"
                value={form.street}
                onChange={(e) => setForm((p) => ({...p, street: e.target.value}))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({...p, city: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                />
                <input
                  placeholder="Province"
                  value={form.province}
                  onChange={(e) => setForm((p) => ({...p, province: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="ZIP Code"
                  value={form.zipCode}
                  onChange={(e) => setForm((p) => ({...p, zipCode: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                />
                <input
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setForm((p) => ({...p, country: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Latitude (optional)"
                  value={form.location?.lat ?? ""}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setForm((p) => ({...p, location: undefined}));
                      return;
                    }
                    const lat = Number(e.target.value);
                    if (Number.isNaN(lat)) return;
                    setForm((p) => ({
                      ...p,
                      location: {lat, lng: p.location?.lng ?? 0},
                    }));
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                />
                <input
                  placeholder="Longitude (optional)"
                  value={form.location?.lng ?? ""}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setForm((p) => ({...p, location: undefined}));
                      return;
                    }
                    const lng = Number(e.target.value);
                    if (Number.isNaN(lng)) return;
                    setForm((p) => ({
                      ...p,
                      location: {lat: p.location?.lat ?? 0, lng},
                    }));
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Pin location on map
                  </p>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 hover:border-[#98b964] disabled:opacity-60"
                  >
                    {locating ? "Locating..." : "Use my location"}
                  </button>
                </div>
                <div className="h-[240px] w-full overflow-hidden rounded-xl border border-gray-200">
                  <AddressMapPicker
                    center={mapCenter}
                    value={form.location}
                    onPick={(pos) => setForm((prev) => ({...prev, location: pos}))}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addAddress}
                disabled={!canAdd}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#98b964] text-white py-2.5 rounded-lg disabled:opacity-60"
              >
                <PlusIcon className="h-4 w-4" />
                Add Address
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-900">Saved Addresses</h2>
                {saving && (
                  <span className="text-xs text-gray-600">Saving...</span>
                )}
              </div>

              <div className="space-y-3">
                {addresses.length === 0 && (
                  <p className="text-sm text-gray-600">No saved addresses yet.</p>
                )}
                {addresses.map((addr, idx) => (
                  <div key={`${addr.street}-${idx}`} className="p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {addr.street}, {addr.city}, {addr.province} {addr.zipCode}
                        </p>
                        <p className="text-xs text-gray-600">{addr.country || "Philippines"}</p>
                        {addr.location && (
                          <a
                            href={`https://www.google.com/maps?q=${encodeURIComponent(
                              `${addr.location.lat},${addr.location.lng}`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-[#5e7142] underline"
                          >
                            <MapPinIcon className="h-3.5 w-3.5" />
                            Open map
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAddress(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
