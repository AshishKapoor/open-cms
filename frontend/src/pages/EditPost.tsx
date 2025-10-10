import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsAPI } from "../services/api";
import { Save, Eye, FileText, ArrowLeft, Minimize2, Focus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import TipTapEditor from "../components/TipTapEditor";
import TagSelector from "../components/TagSelector";
import { useZenMode } from "../context/ZenModeContext";
import {
  formatDateForInput,
  parseInputDateToUtc,
  getTimezoneInfo,
} from "../lib/dateUtils";

const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional(),
  coverImage: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      "Please enter a valid URL"
    ),
  published: z.boolean().default(false),
  tagIds: z.array(z.string()).optional(),
  createdAt: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Please enter a valid date and time"
    ),
});

type UpdatePostFormData = z.infer<typeof updatePostSchema>;

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isPreview, setIsPreview] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const { isZenMode, setZenMode, toggleZenMode } = useZenMode();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch post data
  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postsAPI.getPostById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<UpdatePostFormData>({
    resolver: zodResolver(updatePostSchema),
  });

  // Reset form when data loads
  React.useEffect(() => {
    if (data?.data?.post) {
      const post = data.data.post;
      reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        coverImage: post.coverImage || "",
        published: post.published,
        createdAt: post.createdAt ? formatDateForInput(post.createdAt) : "",
      });
      // Initialize selected tags
      if (post.tags) {
        setSelectedTagIds(post.tags.map((postTag) => postTag.tag.id));
      }
    }
  }, [data, reset]);

  // Escape key handler for zen mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isZenMode) {
        setZenMode(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZenMode, setZenMode]);

  const updateMutation = useMutation({
    mutationFn: (updateData: UpdatePostFormData) =>
      postsAPI.updatePost(id!, updateData),
    onSuccess: (data) => {
      const post = data.data.post;
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      toast.success(
        post.published
          ? "Post updated and published!"
          : "Draft saved successfully!"
      );
      // Exit zen mode before navigating
      setZenMode(false);
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Failed to update post");
    },
  });

  const onSubmit = (data: UpdatePostFormData) => {
    // Clean up the data - ensure empty strings become undefined
    const cleanedData = {
      ...data,
      excerpt: data.excerpt?.trim() || undefined,
      coverImage: data.coverImage?.trim() || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      // Convert local datetime to UTC for server
      createdAt: data.createdAt?.trim()
        ? parseInputDateToUtc(data.createdAt.trim())
        : undefined,
    };

    updateMutation.mutate(cleanedData);
  };
  const watchedValues = watch();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
            The post you're trying to edit doesn't exist or you don't have
            permission to edit it.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const post = data.data.post;

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isZenMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 to-white"
      }`}
    >
      {/* Enhanced Header */}
      {!isZenMode && (
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-all duration-200 hover:translate-x-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Edit Post
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleZenMode}
                    className="btn-outline btn-sm flex items-center space-x-1"
                    title="Toggle Zen Mode"
                  >
                    <Focus className="h-4 w-4" />
                    <span className="hidden sm:inline">Zen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className={`btn-outline btn-sm flex items-center space-x-1 ${
                      isPreview
                        ? "bg-primary-50 border-primary-200 text-primary-700"
                        : ""
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zen Mode Header */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setZenMode(false)}
            className="bg-gray-800/90 hover:bg-gray-700 text-white p-3 rounded-full transition-all duration-200 shadow-lg border border-gray-600 backdrop-blur-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            title="Exit Zen Mode (Esc)"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isZenMode ? "p-0" : "container mx-auto px-6 py-8"}`}>
        <div className={`${isZenMode ? "min-h-screen" : "max-w-4xl"} mx-auto`}>
          {!isPreview ? (
            /* Editor Form */
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={`space-y-6 ${
                isZenMode ? "max-w-4xl mx-auto px-8 py-16" : ""
              }`}
            >
              {/* Title */}
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className={`block text-sm font-semibold tracking-wide ${
                    isZenMode ? "text-gray-300" : "text-gray-700"
                  } mb-3`}
                >
                  TITLE *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className={`w-full text-4xl font-bold border-none outline-none bg-transparent placeholder-gray-400 focus:ring-0 ${
                    isZenMode
                      ? "text-white placeholder-gray-500"
                      : "text-gray-900"
                  } ${errors.title ? "text-red-500" : ""}`}
                  placeholder="Your amazing story starts here..."
                  style={{
                    fontSize: isZenMode ? "3rem" : "2.5rem",
                    lineHeight: "1.2",
                    fontWeight: "700",
                  }}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              {!isZenMode && (
                <div>
                  <label
                    htmlFor="excerpt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Excerpt (Optional)
                  </label>
                  <textarea
                    {...register("excerpt")}
                    rows={3}
                    className={`textarea ${
                      errors.excerpt
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    placeholder="Write a brief description of your post..."
                  />
                  {errors.excerpt && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.excerpt.message}
                    </p>
                  )}
                </div>
              )}

              {/* Creation Time */}
              {!isZenMode && (
                <div>
                  <label
                    htmlFor="createdAt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Creation Time
                  </label>
                  <input
                    {...register("createdAt")}
                    type="datetime-local"
                    className={`input ${
                      errors.createdAt
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Change the original creation time of this post (in your
                    local timezone: {getTimezoneInfo().timeZoneName})
                  </p>
                  {errors.createdAt && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.createdAt.message}
                    </p>
                  )}
                </div>
              )}

              {/* Cover Image */}
              {!isZenMode && (
                <div>
                  <label
                    htmlFor="coverImage"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Cover Image URL (Optional)
                  </label>
                  <input
                    {...register("coverImage")}
                    type="url"
                    className={`input ${
                      errors.coverImage
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.coverImage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.coverImage.message}
                    </p>
                  )}
                </div>
              )}

              {/* Tags Selector */}
              {!isZenMode && (
                <TagSelector
                  selectedTagIds={selectedTagIds}
                  onTagsChange={setSelectedTagIds}
                />
              )}

              {/* Content */}
              <div className="space-y-3">
                <label
                  htmlFor="content"
                  className={`block text-sm font-semibold tracking-wide ${
                    isZenMode ? "text-gray-300" : "text-gray-700"
                  } mb-3`}
                >
                  {isZenMode ? "" : "CONTENT *"}
                </label>
                <div
                  className={`${
                    errors.content ? "border-red-500 rounded-xl" : ""
                  } ${
                    isZenMode
                      ? ""
                      : "border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  }`}
                  style={{
                    background: isZenMode
                      ? "transparent"
                      : "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                  }}
                >
                  <TipTapEditor
                    value={watch("content") || ""}
                    onChange={(value: string) => setValue("content", value)}
                    placeholder={
                      isZenMode
                        ? "Let your thoughts flow..."
                        : "Write your post content here... You can use rich text formatting."
                    }
                    height={isZenMode ? 600 : 400}
                    hideToolbar={isZenMode}
                    className={
                      isZenMode ? "border-none shadow-none bg-transparent" : ""
                    }
                  />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div
                className={`flex items-center justify-between pt-8 ${
                  isZenMode
                    ? "border-t border-gray-700"
                    : "border-t border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    {...register("published")}
                    type="checkbox"
                    id="published"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-5 w-5"
                  />
                  <label
                    htmlFor="published"
                    className={`text-sm font-medium ${
                      isZenMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Published
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:scale-105 ${
                      updateMutation.isPending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg"
                    }`}
                  >
                    {updateMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Preview */
            <div className="bg-white">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {watchedValues.title || post.title}
                </h1>

                {(watchedValues.excerpt || post.excerpt) && (
                  <p className="text-xl text-gray-600 mb-6">
                    {watchedValues.excerpt || post.excerpt}
                  </p>
                )}

                <div className="flex items-center text-gray-600 text-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>Preview Mode</span>
                </div>
              </div>

              {(watchedValues.coverImage || post.coverImage) && (
                <div className="mb-8">
                  <img
                    src={watchedValues.coverImage || post.coverImage}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      watchedValues.content ||
                      post.content ||
                      "<p>Start writing your content...</p>",
                  }}
                  style={{ backgroundColor: "transparent", color: "inherit" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPost;
