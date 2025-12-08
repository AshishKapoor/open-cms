import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentationAPI } from "../services/api";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { DocumentationProduct } from "../types";

const DocumentationHub: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newProductName, setNewProductName] = useState("");
  const [newProductSlug, setNewProductSlug] = useState("");
  const [productPublished, setProductPublished] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch all products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["documentation-products"],
    queryFn: () => documentationAPI.getAllProducts(),
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: any) => documentationAPI.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documentation-products"],
      });
      setNewProductName("");
      setNewProductSlug("");
      setProductPublished(true);
      setShowCreateForm(false);
      toast.success("Product created successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to create product"
      );
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => documentationAPI.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documentation-products"],
      });
      toast.success("Product deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to delete product"
      );
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      documentationAPI.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documentation-products"],
      });
      toast.success("Product updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to update product"
      );
    },
  });

  const handleTogglePublish = (product: DocumentationProduct) => {
    updateProductMutation.mutate({
      id: product.id,
      data: {
        name: product.name,
        slug: product.slug,
        published: !product.published,
      },
    });
  };

  const handleGenerateSlug = () => {
    if (!newProductName.trim()) {
      toast.error("Enter a product name first");
      return;
    }
    const slug = newProductName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setNewProductSlug(slug);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductSlug.trim()) {
      toast.error("Product name and slug are required");
      return;
    }
    createProductMutation.mutate({
      name: newProductName,
      slug: newProductSlug,
      published: productPublished,
    });
  };

  const products = productsData?.data?.products || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Documentation Management
            </h1>
            <p className="text-gray-600">
              Create and manage product documentation
            </p>
          </div>

          {/* Create Product Form */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all"
              >
                <Plus className="h-5 w-5" />
                <span>New Product</span>
              </button>
            ) : (
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g., CAFM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProductSlug}
                      onChange={(e) => setNewProductSlug(e.target.value)}
                      placeholder="e.g., cafm"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productPublished}
                      onChange={(e) => setProductPublished(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Publish this product
                    </span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createProductMutation.isPending}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Create Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Products List */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No documentation products yet. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {products.map((product: DocumentationProduct) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {product.name}
                      </h2>
                      <p className="text-gray-600 text-sm">{product.slug}</p>
                      {product.description && (
                        <p className="text-gray-700 mt-2">{product.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePublish(product)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${product.published
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        title={product.published ? "Unpublish" : "Publish"}
                      >
                        <span>{product.published ? "Unpublish" : "Publish"}</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/documentation/${product.id}`)
                        }
                        className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Manage</span>
                      </button>
                      {product.published && (
                        <button
                          onClick={() => window.open(`/docs/${product.slug}`, '_blank')}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Docs</span>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          deleteProductMutation.mutate(product.id)
                        }
                        disabled={deleteProductMutation.isPending}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {product.sections?.length || 0} sections
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${product.published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {product.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationHub;
