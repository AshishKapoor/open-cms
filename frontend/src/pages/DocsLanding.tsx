import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { documentationAPI } from "../services/api";
import { BookOpen } from "lucide-react";

const DocsLanding: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-documentation-products"],
    queryFn: documentationAPI.getAllProducts,
  });

  const products = data?.data?.products?.filter((p) => p.published) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our comprehensive documentation for all products
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading documentation...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No documentation available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product: any) => (
              <Link
                key={product.id}
                to={`/docs/${product.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary-500"
              >
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                      <BookOpen className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h2>
                  </div>
                  {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {product.sections?.length || 0} sections
                    </span>
                    <span className="text-primary-600 font-medium group-hover:underline">
                      Browse →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsLanding;
