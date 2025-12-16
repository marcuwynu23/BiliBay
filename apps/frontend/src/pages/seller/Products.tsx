import { useState, useEffect } from "react";
import { Page } from "@bilibay/ui";
import { NavBar } from "~/components/common/NavBar";
import { useAuthStore } from "~/stores/common/authStore";
import { useDialogStore } from "~/stores/common/dialogStore";
import { api } from "~/utils/api";
import {
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SellerProducts() {
  const {token} = useAuthStore();
  const {alert, confirm} = useDialogStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    status: "draft",
    images: [] as string[],
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
    }
  }, [token]);

  const fetchProducts = async () => {
    try {
      const data = await api.get("/seller/products", token);
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get("/buyer/products/categories");
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const data = await api.upload("/seller/upload/products", formData, token);
      setFormData({...formData, images: [...formData.images, ...data.images]});
    } catch (err: any) {
      await alert({
        title: "Error",
        message: err.message || "Failed to upload images",
        type: "error",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(
          `/seller/products/${editingProduct._id}`,
          formData,
          token
        );
        await alert({
          title: "Success",
          message: "Product updated successfully!",
          type: "success",
        });
      } else {
        await api.post("/seller/products", formData, token);
        await alert({
          title: "Success",
          message: "Product created successfully!",
          type: "success",
        });
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        status: "draft",
        images: [],
      });
      fetchProducts();
    } catch (err: any) {
      await alert({
        title: "Error",
        message: err.message || "Failed to save product",
        type: "error",
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category?._id || "",
      stock: product.stock.toString(),
      status: product.status,
      images: product.images || [],
    });
    setShowForm(true);
  };

  const handleDelete = (productId: string, productTitle: string) => {
    confirm({
      title: "Delete Product",
      message: `Are you sure you want to delete "${productTitle}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/seller/products/${productId}`, token);
          await alert({
            title: "Success",
            message: "Product deleted successfully!",
            type: "success",
          });
          fetchProducts();
        } catch (err: any) {
          await alert({
            title: "Error",
            message: err.message || "Failed to delete product",
            type: "error",
          });
        }
      },
    });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showForm) {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
          title: "",
          description: "",
          price: "",
          category: "",
          stock: "",
          status: "draft",
          images: [],
        });
      }
    };

    if (showForm) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showForm]);

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CubeIcon className="h-8 w-8 text-[#98b964]" />
              <h1 className="text-4xl font-bold text-gray-900">My Products</h1>
            </div>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingProduct(null);
              setFormData({
                title: "",
                description: "",
                price: "",
                category: "",
                stock: "",
                status: "draft",
                images: [],
              });
            }}
            className="flex items-center gap-2 bg-[#98b964] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowForm(false);
                setEditingProduct(null);
                setFormData({
                  title: "",
                  description: "",
                  price: "",
                  category: "",
                  stock: "",
                  status: "draft",
                  images: [],
                });
              }
            }}
          >
            <div
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingProduct ? "Update product information" : "Create a new product listing"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormData({
                      title: "",
                      description: "",
                      price: "",
                      category: "",
                      stock: "",
                      status: "draft",
                      images: [],
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({...formData, title: e.target.value})
                    }
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({...formData, description: e.target.value})
                    }
                    placeholder="Enter product description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₱) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({...formData, price: e.target.value})
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({...formData, stock: e.target.value})
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({...formData, category: e.target.value})
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({...formData, status: e.target.value})
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="available">Available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all"
                    disabled={uploadingImages}
                  />
                  {uploadingImages && (
                    <p className="text-sm text-gray-500 mt-2">Uploading images...</p>
                  )}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-28 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#98b964] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setFormData({
                        title: "",
                        description: "",
                        price: "",
                        category: "",
                        stock: "",
                        status: "draft",
                        images: [],
                      });
                    }}
                    className="flex-1 border border-[#98b964] text-[#98b964] px-6 py-3 rounded-lg font-medium hover:bg-[#98b964] hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#98b964] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <CubeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Start building your catalog by adding your first product</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-[#98b964] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5e7142] transition-all duration-200 shadow-sm hover:shadow"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                {/* Gradient accent */}
                <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
                <div className="p-5">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-2xl font-bold text-[#98b964] mb-3">₱{product.price}</p>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-600">
                      <span className="font-semibold">Stock:</span> {product.stock}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 border border-[#98b964] text-[#98b964] px-4 py-2.5 rounded-lg hover:bg-[#98b964] hover:text-white transition-all duration-200 font-medium"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="flex-1 flex items-center justify-center gap-2 border border-red-500 text-red-500 px-4 py-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 font-medium"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
