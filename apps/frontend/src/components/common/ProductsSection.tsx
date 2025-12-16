import {useNavigate} from "react-router-dom";
import {Card} from "@bilibay/ui";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";
import {api} from "~/utils/api";
import {ShoppingCartIcon, SparklesIcon} from "@heroicons/react/24/outline";

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  stock: number;
}

interface ProductsSectionProps {
  products: Product[];
}

export default function ProductsSection({products}: ProductsSectionProps) {
  const navigate = useNavigate();
  const {token, user} = useAuthStore();
  const {alert, confirm} = useDialogStore();

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
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <SparklesIcon className="h-8 w-8 text-[#98b964]" />
          <h2 className="text-4xl font-bold text-gray-900">
            Featured Products
          </h2>
        </div>
        <p className="text-gray-600">
          Discover our handpicked selection of amazing products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products available
          </h3>
          <p className="text-gray-600">
            Check back soon for new featured products
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1 group-hover:text-[#98b964] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-2xl text-[#98b964]">
                      ₱{product.price?.toFixed(2)}
                    </p>
                    {product.stock > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.stock} left
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {product.stock > 0 && (
                <div className="px-5 pb-5">
                  <button
                    onClick={(e) =>
                      handleAddToCart(
                        e,
                        product._id,
                        product.title,
                        product.price
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 bg-[#98b964] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
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
