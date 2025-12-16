import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {Card} from "@bilibay/ui";
import {api} from "~/utils/api";
import {useAuthStore} from "~/stores/common/authStore";
import {useDialogStore} from "~/stores/common/dialogStore";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
    sortBy: "newest",
  });
  const navigate = useNavigate();
  const {token, user} = useAuthStore();
  const {alert, confirm} = useDialogStore();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await api.get("/buyer/products/categories");
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.inStock) params.append("inStock", filters.inStock);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);

      const data = await api.get(`/buyer/products?${params}`);
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string, productTitle: string, productPrice: number) => {
    e.stopPropagation(); // Prevent navigation when clicking button
    
    if (!token || user?.role !== "buyer") {
      navigate("/login");
      return;
    }

    confirm({
      title: "Add to Cart",
      message: `Add "${productTitle}" (₱${productPrice.toFixed(2)}) to your cart?`,
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

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <ShoppingBagIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#98b964]" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Products</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Discover amazing products from local sellers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent text-sm sm:text-base"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <select
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent text-sm sm:text-base"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent text-sm sm:text-base"
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
            <label className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={filters.inStock === "true"}
                onChange={(e) =>
                  setFilters({...filters, inStock: e.target.checked ? "true" : ""})
                }
                className="mr-2 w-4 h-4 text-[#98b964] focus:ring-[#98b964] rounded"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Card
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
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
                      <p className="font-bold text-2xl text-[#98b964]">₱{product.price}</p>
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
                      onClick={(e) => handleAddToCart(e, product._id, product.title, product.price)}
                      className="w-full bg-[#98b964] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow"
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

