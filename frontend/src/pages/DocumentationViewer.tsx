import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { documentationAPI } from "../services/api";
import { ChevronRight, ChevronLeft, Menu } from "lucide-react";
import DOMPurify from "dompurify";
import type { DocumentationSection, DocumentationPage } from "../types";

const DocumentationViewer: React.FC = () => {
  const { productSlug, pageSlug } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch product documentation
  const { data: productData, isLoading } = useQuery({
    queryKey: ["documentation-product", productSlug],
    queryFn: () =>
      productSlug ? documentationAPI.getProductBySlug(productSlug) : null,
    enabled: !!productSlug,
  });

  const product = productData?.data?.product;
  const sections = product?.sections || [];

  // Find the current page
  let currentPage: DocumentationPage | null = null;
  let currentSection: DocumentationSection | null = null;

  if (sections && pageSlug) {
    for (const section of sections) {
      const page = section.pages?.find((p: DocumentationPage) => p.slug === pageSlug);
      if (page) {
        currentPage = page;
        currentSection = section;
        break;
      }
    }
  } else if (sections.length > 0 && sections[0].pages && sections[0].pages.length > 0) {
    // Default to first page if none selected
    currentPage = sections[0].pages[0];
    currentSection = sections[0];
  }

  useEffect(() => {
    // Only navigate if we have a currentPage but no pageSlug in URL
    if (currentPage && !pageSlug) {
      navigate(`/docs/${productSlug}/${currentPage.slug}`, { replace: true });
    }
  }, [currentPage, pageSlug, productSlug, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading documentation...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Documentation not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"
          } bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 flex-shrink-0`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Documentation
          </p>

          <nav className="space-y-1">
            {sections.map((section: DocumentationSection) => (
              <div key={section.id}>
                <div className="px-3 py-2 text-sm font-semibold text-gray-900">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.pages?.map((page: DocumentationPage) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        navigate(`/docs/${productSlug}/${page.slug}`);
                      }}
                      className={`w-full text-left px-6 py-2 text-sm rounded-lg transition-colors ${currentPage?.id === page.id
                        ? "bg-primary-100 text-primary-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {currentPage?.id === page.id && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span>{page.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg mr-4"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          {currentPage && (
            <div>
              <p className="text-sm text-gray-600">{currentSection?.title}</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentPage.title}
              </h1>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentPage ? (
            <div className="max-w-4xl mx-auto p-8">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentPage.content) }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Select a page to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationViewer;
