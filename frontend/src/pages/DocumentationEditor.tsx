import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { documentationAPI } from "../services/api";
import {
  Plus,
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import TipTapEditor from "../components/TipTapEditor";
import type { DocumentationSection, DocumentationPage } from "../types";

const DocumentationEditor: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionSlug, setNewSectionSlug] = useState("");
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [pagePublished, setPagePublished] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Fetch sections
  const { data: sectionsData } = useQuery({
    queryKey: ["documentation-sections", productId],
    queryFn: () =>
      productId ? documentationAPI.getSectionsByProduct(productId) : null,
    enabled: !!productId,
  });

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: (data: any) =>
      productId
        ? documentationAPI.createSection(productId, data)
        : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documentation-sections", productId],
      });
      setNewSectionTitle("");
      setNewSectionSlug("");
      setShowSectionForm(false);
      toast.success("Section created!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create section");
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) =>
      productId
        ? documentationAPI.deleteSection(productId, sectionId)
        : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documentation-sections", productId],
      });
      toast.success("Section deleted!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete section");
    },
  });

  // Create/Update page mutation
  const savePageMutation = useMutation({
    mutationFn: (data: any) =>
      activeSectionId
        ? editingPageId
          ? documentationAPI.updatePage(activeSectionId, editingPageId, data)
          : documentationAPI.createPage(activeSectionId, data)
        : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documentation-sections", productId],
      });
      setEditingPageId(null);
      setPageTitle("");
      setPageSlug("");
      setPageContent("");
      setPagePublished(true);
      setActiveSectionId(null);
      toast.success(
        editingPageId ? "Page updated!" : "Page created!"
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to save page");
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: ({ sectionId, pageId }: any) =>
      documentationAPI.deletePage(sectionId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documentation-sections", productId],
      });
      toast.success("Page deleted!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete page");
    },
  });

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !newSectionSlug.trim()) {
      toast.error("Section title and slug are required");
      return;
    }
    createSectionMutation.mutate({
      title: newSectionTitle,
      slug: newSectionSlug,
    });
  };

  const handleGenerateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pageSlug.trim() || !pageContent.trim()) {
      toast.error("Page title, slug, and content are required");
      return;
    }
    savePageMutation.mutate({
      title: pageTitle,
      slug: pageSlug,
      content: pageContent,
      published: pagePublished,
    });
  };

  const handleEditPage = (section: any, page: any) => {
    setActiveSectionId(section.id);
    setEditingPageId(page.id);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageContent(page.content);
    setPagePublished(page.published ?? true);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections = sectionsData?.data?.sections || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/documentation")}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            Documentation Editor
          </h1>
          <p className="text-gray-600">Manage sections and pages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Sections & Pages */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Sections</h2>
                <button
                  onClick={() => setShowSectionForm(true)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {showSectionForm && (
                <form onSubmit={handleCreateSection} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => {
                      setNewSectionTitle(e.target.value);
                      setNewSectionSlug(handleGenerateSlug(e.target.value));
                    }}
                    placeholder="Section title"
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  />
                  <input
                    type="text"
                    value={newSectionSlug}
                    onChange={(e) => setNewSectionSlug(e.target.value)}
                    placeholder="slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSectionForm(false)}
                      className="flex-1 text-gray-700 py-1 rounded text-sm hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {sections.map((section: DocumentationSection) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-2 p-3 hover:bg-gray-100 rounded-lg text-left"
                    >
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium text-sm flex-1">
                        {section.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSectionMutation.mutate(section.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="ml-4 space-y-1">
                        {section.pages?.map((page: DocumentationPage) => (
                          <button
                            key={page.id}
                            onClick={() => handleEditPage(section, page)}
                            className="w-full flex items-center justify-between p-2 text-sm hover:bg-gray-100 rounded"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span className={page.published ? "text-gray-700" : "text-gray-400"}>
                                {page.title}
                              </span>
                              {!page.published && (
                                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                  Draft
                                </span>
                              )}
                            </div>
                            <Trash2
                              className="h-4 w-4 text-red-600 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePageMutation.mutate({
                                  sectionId: section.id,
                                  pageId: page.id,
                                });
                              }}
                            />
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setActiveSectionId(section.id);
                            setEditingPageId(null);
                            setPageTitle("");
                            setPageSlug("");
                            setPageContent("");
                            setPagePublished(true);
                          }}
                          className="w-full flex items-center gap-2 p-2 text-sm text-primary-600 hover:bg-primary-50 rounded"
                        >
                          <Plus className="h-4 w-4" />
                          <span>New Page</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2">
            {activeSectionId ? (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6">
                  {editingPageId ? "Edit Page" : "New Page"}
                </h2>
                <form onSubmit={handleSavePage} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => {
                        setPageTitle(e.target.value);
                        if (!editingPageId) {
                          setPageSlug(handleGenerateSlug(e.target.value));
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <TipTapEditor
                      value={pageContent}
                      onChange={setPageContent}
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pagePublished}
                        onChange={(e) => setPagePublished(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Publish this page
                      </span>
                    </label>
                    <span className="text-xs text-gray-500">
                      (Only published pages are visible to the public)
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savePageMutation.isPending}
                      className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50"
                    >
                      {savePageMutation.isPending
                        ? "Saving..."
                        : editingPageId
                          ? "Update Page"
                          : "Create Page"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSectionId(null);
                        setEditingPageId(null);
                        setPageTitle("");
                        setPageSlug("");
                        setPageContent("");
                        setPagePublished(true);
                      }}
                      className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600">
                  Select a section and click "New Page" to start creating
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationEditor;
