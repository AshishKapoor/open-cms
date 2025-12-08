import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { postsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import NewsletterSubscribersTable from "../components/NewsletterSubscribersTable";
import TagsManagement from "../components/TagsManagement";
import UsersManagement from "./UsersManagement";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  Globe,
  FileText,
  Mail,
  Tag,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatRelativeTimeFromUtc } from "../lib/dateUtils";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  // Get active tab from URL params
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "posts"
  );

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "posts") {
      params.set("tab", activeTab);
    }
    const newSearch = params.toString();
    const currentSearch = location.search.slice(1);
    if (newSearch !== currentSearch) {
      navigate(`/dashboard${newSearch ? `?${newSearch}` : ""}`, {
        replace: true,
      });
    }
  }, [activeTab, navigate, location.search]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-posts", currentPage, postsPerPage],
    queryFn: () =>
      postsAPI.getMyPosts({
        page: currentPage,
        limit: postsPerPage,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: postsAPI.deletePost,
    onSuccess: () => {
      // Invalidate all my-posts queries to update pagination
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });

      // If we're on a page that would be empty after deletion, go to previous page
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Post deleted successfully");
      setDeleteConfirm(null);
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleDelete = (postId: string) => {
    deleteMutation.mutate(postId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Posts
          </h2>
          <p className="text-gray-600">
            Something went wrong while loading your posts.
          </p>
        </div>
      </div>
    );
  }

  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your blog posts and content
            </p>
          </div>
          {user?.isAdmin && activeTab === "posts" && (
            <Link
              to="/create"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      {user?.isAdmin && (
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange("posts")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "posts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Posts</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange("tags")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "tags"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange("newsletter")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "newsletter"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Newsletter</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "posts" ? (
        <>
          {/* Posts Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Posts
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pagination?.totalCount || posts.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {posts.filter((post) => post.published).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {posts.filter((post) => !post.published).length}
                  </p>
                </div>
              </div>
            </div>
            {pagination && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Current Page
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pagination.page} of {pagination.totalPages}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Posts
              </h2>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  {user?.isAdmin
                    ? "Start sharing your thoughts with the world!"
                    : "Only admin users can create posts."}
                </p>
                {user?.isAdmin && (
                  <Link to="/create" className="btn-primary">
                    Create Your First Post
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                              }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </span>
                        </div>

                        {post.excerpt && (
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Created{" "}
                              {formatRelativeTimeFromUtc(post.createdAt)}
                            </span>
                          </div>
                          {post.published && post.publishedAt && (
                            <div className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span>
                                Published{" "}
                                {formatRelativeTimeFromUtc(post.publishedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {post.published && (
                          <Link
                            to={`/post/${post.slug}`}
                            className="btn-ghost btn-sm"
                            title="View post"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          to={`/edit/${post.id}`}
                          className="btn-outline btn-sm"
                          title="Edit post"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(post.id)}
                          className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {posts.length > 0 && pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount} results
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNumber = i + 1;
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 2
                          ) {
                            pageNumber = pagination.totalPages - 4 + i;
                          } else {
                            pageNumber = pagination.page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${pageNumber === pagination.page
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : activeTab === "newsletter" ? (
        /* Newsletter Tab */
        <NewsletterSubscribersTable />
      ) : activeTab === "tags" ? (
        /* Tags Tab */
        <TagsManagement />
      ) : activeTab === "users" ? (
        /* Users Tab */
        <UsersManagement />
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Post
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
