import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function ProductDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  const {token, user} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await api.get(`/buyer/products/${id}`);
      setProduct(data);
    } catch (err) {
      console.error("Failed to fetch product:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!token || user?.role !== "buyer") {
      navigate("/login");
      return;
    }

    confirm({
      title: "Add to Cart",
      message: `Add ${quantity} x ${product.title} (₱${(
        product.price * quantity
      ).toFixed(2)}) to your cart?`,
      onConfirm: async () => {
        try {
          await api.post(
            "/buyer/cart",
            {
              productId: id,
              quantity,
            },
            token
          );
          await alert({
            title: "Success",
            message: "Product added to cart successfully!",
            type: "success",
          });
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to add to cart",
            type: "error",
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <NavBar />
        <div className="container-fluid mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </Page>
    );
  }

  if (!product) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <NavBar />
        <div className="container-fluid mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <XCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Product not found
            </h3>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-[#98b964] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Products</span>
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-12 max-w-7xl pb-safe">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-[#98b964] hover:text-[#5e7142] font-medium transition-colors text-sm sm:text-base"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
            <div className="p-4 sm:p-6">
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.title}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
              <div className="p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#98b964]">
                    ₱{product.price?.toFixed(2)}
                  </p>
                  {product.stock > 0 && (
                    <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-semibold">
                      In Stock
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  {product.description}
                </p>

                {product.stock > 0 ? (
                  <>
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <div className="flex items-center gap-4">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">
                          Quantity:
                        </label>
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              setQuantity(Math.max(1, quantity - 1))
                            }
                            disabled={quantity <= 1}
                            className="p-2.5 sm:p-2 text-[#98b964] hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#98b964] transition-all rounded-l-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <span className="text-lg sm:text-xl">−</span>
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 1 && val <= product.stock) {
                                setQuantity(val);
                              }
                            }}
                            className="w-20 px-2 sm:px-4 py-2 text-center border-0 focus:outline-none focus:ring-0 font-semibold text-base sm:text-sm touch-manipulation"
                          />
                          <button
                            onClick={() =>
                              setQuantity(Math.min(product.stock, quantity + 1))
                            }
                            disabled={quantity >= product.stock}
                            className="p-2.5 sm:p-2 text-[#98b964] hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#98b964] transition-all rounded-r-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <span className="text-lg sm:text-xl">+</span>
                          </button>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {product.stock} available
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={addToCart}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#98b964] text-white px-6 py-3.5 sm:py-3 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-base sm:text-sm"
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!token || user?.role !== "buyer") {
                            navigate("/login");
                            return;
                          }
                          confirm({
                            title: "Buy Now",
                            message: `Are you sure you want to buy ${quantity} x ${
                              product.title
                            } for ₱${(product.price * quantity).toFixed(2)}?`,
                            onConfirm: async () => {
                              try {
                                await api.post(
                                  "/buyer/cart",
                                  {
                                    productId: id,
                                    quantity,
                                  },
                                  token
                                );
                                navigate("/checkout");
                              } catch (err: any) {
                                await alert({
                                  title: "Error",
                                  message:
                                    err.message || "Failed to add to cart",
                                  type: "error",
                                });
                              }
                            },
                          });
                        }}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-[#98b964] text-[#98b964] px-6 py-3.5 sm:py-3 rounded-lg font-medium hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] transition-all duration-200 touch-manipulation min-h-[48px] text-base sm:text-sm"
                      >
                        <BoltIcon className="h-5 w-5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 text-red-500 font-semibold">
                      <XCircleIcon className="h-6 w-6" />
                      <span>Out of Stock</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
              <div className="p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Product Details
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Stock Available:</span>
                    <span className="font-semibold text-xs sm:text-sm text-gray-900">
                      {product.stock} units
                    </span>
                  </div>
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Category:</span>
                      <span className="font-semibold text-xs sm:text-sm text-gray-900">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                    <span className="font-semibold text-xs sm:text-sm">
                      {product.status === "available" ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          Available
                        </span>
                      ) : (
                        <span className="text-gray-500">Draft</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
