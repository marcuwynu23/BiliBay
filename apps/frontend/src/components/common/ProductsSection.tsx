import {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {Card} from "@bilibay/ui";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {ShoppingCartIcon} from "@heroicons/react/24/outline";
import shoppingIllustration from "~/assets/illustrations/shopping.svg";

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  stock: number;
  category?: {
    _id: string;
    name: string;
  };
}

interface ProductsSectionProps {
  products: Product[];
}

export default function ProductsSection({products}: ProductsSectionProps) {
  const navigate = useNavigate();
  const {token, user} = useAuthStore();
  const {alert, confirm} = usePromptStore();

  // Randomly shuffle products array
  const shuffledProducts = useMemo(() => {
    const shuffled = [...products];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [products]);

  const handleAddToCart = (
    e: React.MouseEvent,
    productId: string,
    productTitle: string,
    productPrice: number
  ) => {
    e.stopPropagation(); // Prevent navigation when clicking button

    if (!token || user?.role !== "buyer") {
      navigate("/login");
      return;
    }

    confirm({
      title: "Add to Cart",
      message: `Add "${productTitle}" (₱${productPrice.toFixed(
        2
      )}) to your cart?`,
      onConfirm: async () => {
        try {
          await api.post(
            "/buyer/cart",
            {
              productId,
              quantity: 1,
            },
            token
          );
          await alert({
            title: "Success",
            message: "Product added to cart successfully!",
            type: "success",
          });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to add to cart";
          await alert({
            title: "Error",
            message: errorMessage,
            type: "error",
          });
        }
      },
    });
  };

  return (
    <section className="w-full px-4 py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <h2 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">
            Featured Products
          </h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Discover our handpicked selection of amazing products
        </p>
      </div>

      {shuffledProducts.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
          <img
            src={shoppingIllustration}
            alt="No products"
            className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6"
          />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No products available
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Check back soon for new featured products
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shuffledProducts.map((product) => (
            <Card
              key={product._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              {/* Gradient accent */}
              <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>

              <div
                className="cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.title}
                    className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-1 group-hover:text-[#98b964] transition-colors">
                    {product.title}
                  </h3>
                  {product.category && (
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      {product.category.name}
                    </p>
                  )}
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-xl sm:text-2xl text-[#98b964]">
                      ₱{product.price?.toFixed(2)}
                    </p>
                    {product.stock > 0 && (
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.stock} left
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {product.stock > 0 && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <button
                    onClick={(e) =>
                      handleAddToCart(
                        e,
                        product._id,
                        product.title,
                        product.price
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 bg-[#98b964] text-white px-4 py-3.5 sm:py-2.5 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-base sm:text-sm"
                  >
                    <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
