import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { postsAPI } from "../services/api";
import Avatar from "../components/Avatar";
import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatRelativeTimeFromUtc,
  formatDateInUserTimezone,
} from "../lib/dateUtils";

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => postsAPI.getPostBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data?.post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const post = data.data.post;

  // Redirect if post is not published (unless user is the author)
  if (!post.published) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to posts</span>
            </Link>
          </div>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar
                    src={post.author.avatar}
                    alt={`${
                      post.author.firstName && post.author.lastName
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : post.author.username
                    } avatar`}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {post.author.firstName && post.author.lastName
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : post.author.username}
                    </p>
                    {post.author.bio && (
                      <p className="text-sm text-gray-600">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {formatRelativeTimeFromUtc(
                    post.publishedAt || post.createdAt
                  )}
                </span>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <article className="prose prose-lg prose-gray max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{ backgroundColor: "transparent", color: "inherit" }}
            />
          </article>

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-start space-x-4">
              <Avatar
                src={post.author.avatar}
                alt={`${
                  post.author.firstName && post.author.lastName
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : post.author.username
                } avatar`}
                size="xl"
                className="flex-shrink-0"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {post.author.firstName && post.author.lastName
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : post.author.username}
                </h3>
                {post.author.bio && (
                  <p className="text-gray-600">{post.author.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link to="/" className="btn-outline flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>More posts</span>
              </Link>

              <div className="text-sm text-gray-600">
                Published on{" "}
                {formatDateInUserTimezone(
                  post.publishedAt || post.createdAt,
                  "MMMM dd, yyyy"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
