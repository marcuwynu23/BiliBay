import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Page, Select} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {Card} from "@bilibay/ui";
import {api} from "~/utils/api";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import webShoppingIllustration from "~/assets/illustrations/web-shopping.svg";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const {alert, confirm} = usePromptStore();

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
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 md:py-12 pb-safe-nav">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">Products</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Discover amazing products from local sellers</p>
        </div>

        {/* Filters Accordion */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8 overflow-hidden">
          {/* Accordion Header */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors touch-manipulation"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h2>
            </div>
            {filtersOpen ? (
              <ChevronUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            )}
          </button>
          
          {/* Accordion Content */}
          {filtersOpen && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent text-base sm:text-sm touch-manipulation"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            {/* Category Select */}
            <div className="relative z-10">
              <Select
                options={[
                  { value: "", label: "All Categories" },
                  ...categories.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  })),
                ]}
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                placeholder="All Categories"
                backgroundColor="bg-white"
                borderColor="border-gray-300"
                textColor="text-gray-900"
                iconColor="text-gray-500"
                focusRingColor="focus:ring-[#98b964]"
                optionHoverColor="hover:bg-gray-100"
                optionSelectedColor="bg-[#98b964]/10"
                className="w-full"
                selectClassName="px-3 sm:px-4 py-3 sm:py-2.5"
                optionClassName=""
              />
            </div>
            {/* Sort Select */}
            <div className="relative z-10">
              <Select
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "price_low", label: "Price: Low to High" },
                  { value: "price_high", label: "Price: High to Low" },
                  { value: "popularity", label: "Popularity" },
                ]}
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                placeholder="Sort by"
                backgroundColor="bg-white"
                borderColor="border-gray-300"
                textColor="text-gray-900"
                iconColor="text-gray-500"
                focusRingColor="focus:ring-[#98b964]"
                optionHoverColor="hover:bg-gray-100"
                optionSelectedColor="bg-[#98b964]/10"
                className="w-full"
                selectClassName="px-3 sm:px-4 py-3 sm:py-2.5"
                optionClassName=""
              />
            </div>
            {/* In Stock Checkbox */}
            <label className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors touch-manipulation min-h-[48px] sm:min-h-0">
              <input
                type="checkbox"
                checked={filters.inStock === "true"}
                onChange={(e) =>
                  setFilters({...filters, inStock: e.target.checked ? "true" : ""})
                }
                className="mr-2 w-4 h-4 sm:w-4 sm:h-4 text-[#98b964] focus:ring-[#98b964] rounded"
              />
              <span className="text-sm sm:text-sm font-medium text-gray-700 whitespace-nowrap">In Stock Only</span>
            </label>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
            <img
              src={webShoppingIllustration}
              alt="No products found"
              className="h-48 sm:h-64 mx-auto mb-4 sm:mb-6"
            />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <Card
                key={product._id}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"
              >
                <div
                  className="cursor-pointer flex-1 flex flex-col"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.title}
                      className="h-48 sm:h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-900 line-clamp-2 group-hover:text-[#98b964] transition-colors">
                      {product.title}
                    </h3>
                    {product.category && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                        {product.category.name}
                      </p>
                    )}
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-2 sm:mb-3 mt-auto">
                      <p className="font-bold text-xl sm:text-2xl text-[#98b964]">₱{product.price.toFixed(2)}</p>
                      {product.stock > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                          {product.stock} left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {product.stock > 0 && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <button
                      onClick={(e) => handleAddToCart(e, product._id, product.title, product.price)}
                      className="w-full bg-[#98b964] text-white px-4 py-3 sm:py-2.5 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[48px] text-sm sm:text-sm"
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

