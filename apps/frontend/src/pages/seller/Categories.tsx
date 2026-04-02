import {useCallback, useEffect, useMemo, useState} from "react";
import {Page} from "@bilibay/ui";
import {NavBar} from "~/components/common/NavBar";
import {useAuthStore} from "~/stores/common/authStore";
import {usePromptStore} from "~/stores/common/promptStore";
import {api} from "~/utils/api";
import {TagIcon, PencilIcon, TrashIcon, PlusIcon} from "@heroicons/react/24/outline";

type ProductCategory = {
  _id: string;
  name: string;
  description?: string;
};

type SellerProduct = {
  _id: string;
  title: string;
  category?: {
    _id: string;
    name: string;
  };
};

export default function SellerCategories() {
  const {token} = useAuthStore();
  const {alert, confirm} = usePromptStore();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({name: "", description: ""});

  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const fetchData = useCallback(async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        api.get("/seller/categories", token),
        api.get("/seller/products", token),
      ]);
      setCategories(categoriesData as ProductCategory[]);
      setProducts(productsData as SellerProduct[]);
    } catch (err) {
      console.error("Failed to fetch category data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, SellerProduct[]>();
    products.forEach((product) => {
      const categoryId = product.category?._id;
      if (!categoryId) return;
      const existing = grouped.get(categoryId) || [];
      existing.push(product);
      grouped.set(categoryId, existing);
    });
    return grouped;
  }, [products]);

  const resetForm = () => {
    setEditingCategory(null);
    setForm({name: "", description: ""});
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      await alert({
        title: "Category name required",
        message: "Please enter a category name.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(
          `/seller/categories/${editingCategory._id}`,
          {name: form.name.trim(), description: form.description.trim()},
          token,
        );
      } else {
        await api.post(
          "/seller/categories",
          {name: form.name.trim(), description: form.description.trim()},
          token,
        );
      }
      await fetchData();
      resetForm();
      await alert({
        title: "Success",
        message: editingCategory
          ? "Category updated successfully."
          : "Category added successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      await alert({
        title: "Error",
        message: getErrorMessage(err, "Failed to save category"),
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (category: ProductCategory) => {
    confirm({
      title: "Delete Category",
      message: `Delete "${category.name}"? This cannot be undone if it's used by products.`,
      onConfirm: async () => {
        try {
          await api.delete(`/seller/categories/${category._id}`, token);
          await fetchData();
          if (editingCategory?._id === category._id) {
            resetForm();
          }
          await alert({
            title: "Success",
            message: "Category deleted successfully.",
            type: "success",
          });
        } catch (err: unknown) {
          await alert({
            title: "Error",
            message: getErrorMessage(err, "Failed to delete category"),
            type: "error",
          });
        }
      },
    });
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
        <div className="mb-6 sm:mb-10">
          <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">
            Category Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create and maintain categories used in your product catalog.
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({...prev, name: e.target.value}))}
              placeholder="Category name"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964]"
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({...prev, description: e.target.value}))
              }
              placeholder="Description (optional)"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98b964]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-[#98b964] text-white hover:bg-[#5e7142] disabled:opacity-60"
              >
                <PlusIcon className="h-4 w-4" />
                {editingCategory ? "Update" : "Add"}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
            <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-600">No categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Used by {(productsByCategory.get(category._id) || []).length} product(s)
                    </p>
                    {(productsByCategory.get(category._id) || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(productsByCategory.get(category._id) || [])
                          .slice(0, 5)
                          .map((product) => (
                            <span
                              key={product._id}
                              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {product.title}
                            </span>
                          ))}
                        {(productsByCategory.get(category._id) || []).length > 5 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#98b964]/10 text-[#5e7142] border border-[#98b964]/20">
                            +{(productsByCategory.get(category._id) || []).length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(category);
                        setForm({
                          name: category.name,
                          description: category.description || "",
                        });
                      }}
                      className="p-2 rounded-md border border-gray-200 text-[#5e7142] hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="p-2 rounded-md border border-gray-200 text-red-600 hover:bg-gray-50"
                    >
                      <TrashIcon className="h-4 w-4" />
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
