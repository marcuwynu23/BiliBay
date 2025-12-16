import { useState, useEffect, useRef } from "react";
import { Page, Select } from "@bilibay/ui";
import { Dialog } from "~/components/common/Dialog";
import { NavBar } from "~/components/common/NavBar";
import { useAuthStore } from "~/stores/common/authStore";
import { usePromptStore } from "~/stores/common/promptStore";
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
  const {alert, confirm} = usePromptStore();
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
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      status: "draft",
      images: [],
    });
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file`);
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert({
        title: "File Selection Error",
        message: errors.join("\n"),
        type: "error",
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const uploadSelectedImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) {
      return [];
    }

    if (!token) {
      throw new Error("You must be logged in to upload images");
    }

    setUploadingImages(true);
    try {
      const uploadFormData = new FormData();
      selectedFiles.forEach((file) => {
        uploadFormData.append("images", file);
      });

      console.log("Uploading images:", selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));

      const data = await api.upload("/seller/upload/products", uploadFormData, token);
      
      if (!data || !data.images || !Array.isArray(data.images)) {
        throw new Error("Invalid response from server");
      }

      console.log("Upload successful, received images:", data.images);
      setSelectedFiles([]); // Clear selected files after successful upload
      return data.images;
    } catch (err: any) {
      console.error("Image upload error:", err);
      throw err;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Upload images first if there are selected files
      let uploadedImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          uploadedImageUrls = await uploadSelectedImages();
        } catch (uploadErr: any) {
          await alert({
            title: "Upload Error",
            message: uploadErr.message || "Failed to upload images. Please try again.",
            type: "error",
          });
          setSubmitting(false);
          return; // Stop submission if image upload fails
        }
      }

      // Combine existing images with newly uploaded ones
      const finalFormData = {
        ...formData,
        images: [...formData.images, ...uploadedImageUrls],
      };

      if (editingProduct) {
        await api.put(
          `/seller/products/${editingProduct._id}`,
          finalFormData,
          token
        );
        // Close dialog first, then show success message
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
        await fetchProducts();
        await alert({
          title: "Success",
          message: "Product updated successfully!",
          type: "success",
        });
      } else {
        await api.post("/seller/products", finalFormData, token);
        // Close dialog first, then show success message
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
        await fetchProducts();
        await alert({
          title: "Success",
          message: "Product created successfully!",
          type: "success",
        });
      }
    } catch (err: any) {
      // Show error message but keep dialog open so user can fix issues
      await alert({
        title: "Error",
        message: err.message || "Failed to save product",
        type: "error",
      });
    } finally {
      setSubmitting(false);
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
    setSelectedFiles([]); // Clear any selected files when editing
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

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 md:py-12 pb-safe">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">My Products</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600">Manage your product catalog</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingProduct(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-[#98b964] text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] transition-all duration-200 shadow-sm hover:shadow touch-manipulation min-h-[44px] text-sm sm:text-base"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Product Form Dialog */}
        <Dialog
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
            resetForm();
          }}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          subtitle={editingProduct ? "Update product information" : "Create a new product listing"}
          formId="product-form"
          footer={
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                form="product-form"
                disabled={submitting}
                className="flex-1 bg-[#98b964] text-white px-6 py-4 sm:py-3 rounded-xl sm:rounded-lg font-medium hover:bg-[#5e7142] active:bg-[#4a5a35] transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-sm touch-manipulation min-h-[48px]"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{editingProduct ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                )}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="flex-1 border border-[#98b964] text-[#98b964] px-6 py-4 sm:py-3 rounded-xl sm:rounded-lg font-medium hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm touch-manipulation min-h-[48px]"
              >
                Cancel
              </button>
            </div>
          }
        >
          <form onSubmit={handleSubmit} id="product-form" className="pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
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
                    className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({...formData, description: e.target.value})
                    }
                    placeholder="Enter product description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₱) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
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
                      className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({...formData, stock: e.target.value})
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
       
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-5">
              <div className="relative z-10">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    options={[
                      { value: "", label: "Select Category (Optional)" },
                      ...categories.map((cat) => ({
                        value: cat._id,
                        label: cat.name,
                      })),
                    ]}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({...formData, category: e.target.value})
                    }
                    placeholder="Select Category (Optional)"
                    backgroundColor="bg-white"
                    borderColor="border-gray-300"
                    textColor="text-gray-900"
                    iconColor="text-gray-500"
                    focusRingColor="focus:ring-[#98b964]"
                    optionHoverColor="hover:bg-gray-100"
                    optionSelectedColor="bg-[#98b964]/10"
                    className="w-full"
                    selectClassName="px-4 py-3.5 sm:py-3 text-base sm:text-sm"
                    optionClassName=""
                  />
                  {categories.length === 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      No categories available. Contact admin to create categories.
                    </p>
                  )}
                </div>
                <div className="relative z-10">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    options={[
                      { value: "draft", label: "Draft" },
                      { value: "available", label: "Available" },
                    ]}
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({...formData, status: e.target.value})
                    }
                    placeholder="Select Status"
                    backgroundColor="bg-white"
                    borderColor="border-gray-300"
                    textColor="text-gray-900"
                    iconColor="text-gray-500"
                    focusRingColor="focus:ring-[#98b964]"
                    optionHoverColor="hover:bg-gray-100"
                    optionSelectedColor="bg-[#98b964]/10"
                    className="w-full"
                    selectClassName="px-4 py-3.5 sm:py-3 text-base sm:text-sm"
                    optionClassName=""
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Images
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="w-full px-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964] focus:border-transparent transition-all touch-manipulation"
                    disabled={uploadingImages || submitting}
                  />
                  {uploadingImages && (
                    <p className="text-sm text-gray-500 mt-2">Uploading images...</p>
                  )}
                  
                  {/* Selected files preview (not yet uploaded) */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Selected files (will be uploaded on submit): {selectedFiles.length}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <div className="w-full h-24 sm:h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                              <span className="text-xs text-gray-500 text-center px-2 truncate w-full">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(idx)}
                              disabled={submitting}
                              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 touch-manipulation z-10"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded images preview */}
                  {formData.images.length > 0 && (
                    <div className={`mt-4 space-y-2 ${selectedFiles.length > 0 ? 'mt-6' : ''}`}>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Uploaded images: {formData.images.length}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Product ${idx + 1}`}
                              className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                console.error("Failed to load image:", img);
                                (e.target as HTMLImageElement).src = "/placeholder.png";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              disabled={submitting}
                              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 touch-manipulation z-10"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Dialog>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                {/* Gradient accent */}
                <div className="bg-gradient-to-r from-[#98b964] to-[#5e7142] h-1"></div>
                <div className="p-4 sm:p-5">
                  <div className="relative overflow-hidden rounded-lg mb-3 sm:mb-4">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.title}
                      className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <span
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-1">
                    {product.title}
                  </h3>
                  {product.category && (
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      {product.category.name}
                    </p>
                  )}
                  <p className="text-xl sm:text-2xl font-bold text-[#98b964] mb-2 sm:mb-3">₱{product.price}</p>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm">
                    <span className="text-gray-600">
                      <span className="font-semibold">Stock:</span> {product.stock}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 sm:pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 border border-[#98b964] text-[#98b964] px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-lg hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] transition-all duration-200 font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="flex-1 flex items-center justify-center gap-2 border border-red-500 text-red-500 px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-lg hover:bg-red-500 hover:text-white active:bg-red-600 transition-all duration-200 font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
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
