import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { postsAPI, tagsAPI } from "../services/api";
import Avatar from "../components/Avatar";
import NewsletterSubscriptionForm from "../components/NewsletterSubscriptionForm";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { formatRelativeTimeFromUtc } from "../lib/dateUtils";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);
  const postsPerPage = 12;

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when tag filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTagSlugs]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "posts",
      {
        published: true,
        page: currentPage,
        search: debouncedSearchTerm,
        tags: selectedTagSlugs,
      },
    ],
    queryFn: () =>
      postsAPI.getAllPosts({
        published: true,
        page: currentPage,
        limit: postsPerPage,
        search: debouncedSearchTerm || undefined,
        tags:
          selectedTagSlugs.length > 0 ? selectedTagSlugs.join(",") : undefined,
      }),
  });

  // Fetch available tags for filtering
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsAPI.getAllTags({ limit: 50 }),
  });

  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];

    const current = pagination.page;
    const total = pagination.totalPages;
    const delta = 2; // Number of pages to show before and after current page

    const pages: (number | string)[] = [];

    // Always show first page
    if (current > delta + 1) {
      pages.push(1);
      if (current > delta + 2) {
        pages.push("...");
      }
    }

    // Show pages around current page
    for (
      let i = Math.max(1, current - delta);
      i <= Math.min(total, current + delta);
      i++
    ) {
      pages.push(i);
    }

    // Always show last page
    if (current < total - delta) {
      if (current < total - delta - 1) {
        pages.push("...");
      }
      pages.push(total);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Search bar skeleton */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Posts grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="bg-white p-6 rounded-b-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
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
            Something went wrong while loading the blog posts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl"
      />
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
          Latest Stories
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover compelling stories, insights, and experiences from our
          community of writers
        </p>
      </div>

      {/* Newsletter Subscription for non-authenticated users */}
      {!isAuthenticated && (
        <div className="max-w-md mx-auto mb-12">
          <NewsletterSubscriptionForm showTitle={true} />
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-lg"
          />
        </div>

        {/* Tag Filter */}
        {tagsData?.data?.tags && tagsData.data.tags.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Filter by tags:
            </h3>
            <div className="flex flex-wrap gap-2">
              {tagsData.data.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (selectedTagSlugs.includes(tag.slug)) {
                      setSelectedTagSlugs(
                        selectedTagSlugs.filter((slug) => slug !== tag.slug)
                      );
                    } else {
                      setSelectedTagSlugs([...selectedTagSlugs, tag.slug]);
                    }
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    selectedTagSlugs.includes(tag.slug)
                      ? "text-white border-transparent shadow-sm"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor: selectedTagSlugs.includes(tag.slug)
                      ? tag.color || "#3B82F6"
                      : "transparent",
                    borderColor: selectedTagSlugs.includes(tag.slug)
                      ? tag.color || "#3B82F6"
                      : undefined,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {selectedTagSlugs.length > 0 && (
              <button
                onClick={() => setSelectedTagSlugs([])}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {(debouncedSearchTerm || selectedTagSlugs.length > 0) && (
          <p className="mt-2 text-sm text-gray-600">
            {pagination?.totalCount || 0} result
            {(pagination?.totalCount || 0) !== 1 ? "s" : ""}{" "}
            {debouncedSearchTerm && `for "${debouncedSearchTerm}"`}
            {selectedTagSlugs.length > 0 && (
              <>
                {debouncedSearchTerm ? " " : ""}
                with tag{selectedTagSlugs.length > 1 ? "s" : ""}:{" "}
                {selectedTagSlugs.join(", ")}
              </>
            )}
          </p>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {debouncedSearchTerm || selectedTagSlugs.length > 0
              ? "No stories found"
              : "No stories yet"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {debouncedSearchTerm || selectedTagSlugs.length > 0
              ? `We couldn't find any stories matching your ${debouncedSearchTerm ? "search" : ""}${debouncedSearchTerm && selectedTagSlugs.length > 0 ? " and " : ""}${selectedTagSlugs.length > 0 ? "tag filter" : ""}. Try adjusting your filters.`
              : "Be the first to share your story and inspire others in our community!"}
          </p>
          {!debouncedSearchTerm && selectedTagSlugs.length === 0 && (
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Writing
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {post.coverImage ? (
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary-300" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <Avatar
                      src={post.author.avatar}
                      alt={`${
                        post.author.firstName && post.author.lastName
                          ? `${post.author.firstName} ${post.author.lastName}`
                          : post.author.username
                      } avatar`}
                      size="sm"
                    />
                    <span className="font-medium">
                      {post.author.firstName && post.author.lastName
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : post.author.username}
                    </span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatRelativeTimeFromUtc(
                          post.publishedAt || post.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map((postTag) => (
                        <button
                          key={postTag.tag.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!selectedTagSlugs.includes(postTag.tag.slug)) {
                              setSelectedTagSlugs([
                                ...selectedTagSlugs,
                                postTag.tag.slug,
                              ]);
                            }
                          }}
                          className="inline-block px-2 py-1 text-xs font-medium rounded-full border transition-colors hover:bg-gray-50"
                          style={{
                            backgroundColor: postTag.tag.color
                              ? `${postTag.tag.color}15`
                              : "#F3F4F6",
                            borderColor: postTag.tag.color || "#D1D5DB",
                            color: postTag.tag.color || "#6B7280",
                          }}
                        >
                          {postTag.tag.name}
                        </button>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs text-gray-500">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    to={`/post/${post.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center group/link"
                  >
                    <span>Read Story</span>
                    <svg
                      className="h-4 w-4 ml-2 group-hover/link:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                  pagination.hasPrevPage
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          page === currentPage
                            ? "bg-primary-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                  pagination.hasNextPage
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}

          {/* Results info */}
          {pagination && (
            <div className="text-center mt-6 text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} stories
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
