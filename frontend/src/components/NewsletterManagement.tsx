import React, { useState, useEffect, useCallback } from "react";
import { Mail, Download, Users, Clock } from "lucide-react";
import { newsletterAPI } from "../services/api";
import type { NewsletterSubscriber } from "../types";
import toast from "react-hot-toast";

interface NewsletterManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterManagement: React.FC<NewsletterManagementProps> = ({
  isOpen,
  onClose,
}) => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await newsletterAPI.getSubscribers({ page, limit: 50 });
      setSubscribers(response.data.subscribers);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      toast.error("Failed to fetch newsletter subscribers");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (isOpen) {
      fetchSubscribers();
    }
  }, [isOpen, fetchSubscribers]);

  const handleExportSubscribers = async () => {
    try {
      setExporting(true);
      const blob = await newsletterAPI.exportSubscribers();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Newsletter subscribers exported successfully!");
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast.error("Failed to export subscribers");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6" />
              <h2 className="text-xl font-bold">Newsletter Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Total Subscribers
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {pagination.total}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Active Subscriptions
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {subscribers.filter((s) => s.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        This Page
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {subscribers.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subscriber List
                </h3>
                <button
                  onClick={handleExportSubscribers}
                  disabled={exporting}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{exporting ? "Exporting..." : "Export to Excel"}</span>
                </button>
              </div>

              {/* Subscribers List */}
              <div className="space-y-3">
                {subscribers.map((subscriber, index) => (
                  <div
                    key={subscriber.id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {subscriber.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            Subscribed on {formatDate(subscriber.subscribedAt)}{" "}
                            at {formatTime(subscriber.subscribedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">
                          #{(page - 1) * pagination.limit + index + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            subscriber.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {subscriber.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {subscribers.length === 0 && (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No newsletter subscribers found
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Showing {(page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} subscribers
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterManagement;
