import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { postsAPI } from "../services/api";
import type { CreatePostData } from "../types";
import {
  Save,
  Eye,
  FileText,
  ArrowLeft,
  Minimize2,
  Clock,
  Type,
  Focus,
  Camera,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import TipTapEditor from "../components/TipTapEditor";
import UnsplashPhotoPicker from "../components/UnsplashPhotoPicker";
import ImageUploadDialog from "../components/ImageUploadDialog";
import TagSelector from "../components/TagSelector";
import { useAuth } from "../context/AuthContext";
import { useZenMode } from "../context/ZenModeContext";
import { parseInputDateToUtc, getTimezoneInfo } from "../lib/dateUtils";

const createPostSchema = z.object({
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

type CreatePostFormData = z.infer<typeof createPostSchema>;

const CreatePost: React.FC = () => {
  const [isPreview, setIsPreview] = useState(false);
  const { isZenMode, setZenMode, toggleZenMode } = useZenMode();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isUnsplashPickerOpen, setIsUnsplashPickerOpen] = useState(false);
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"unsplash" | "upload">(
    "unsplash"
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Word count and reading time calculation
  const calculateWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const calculateReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // Check authentication
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to create posts");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      published: true,
      content: "",
    },
  });

  // Register the content field explicitly
  React.useEffect(() => {
    register("content", { required: "Content is required" });
  }, [register]);

  const createMutation = useMutation({
    mutationFn: postsAPI.createPost,
    onSuccess: (data) => {
      const post = data.data.post;
      toast.success(
        post.published
          ? "Post published successfully!"
          : "Draft saved successfully!"
      );
      // Exit zen mode before navigating
      setZenMode(false);
      navigate("/dashboard");
    },
    onError: (error: unknown) => {
      console.error("Create post error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: string;
              details?: { field: string; message: string }[];
            };
            status?: number;
          };
        };
        const status = axiosError.response?.status;
        const message = axiosError.response?.data?.error;
        const details = axiosError.response?.data?.details;

        // console.error("Error status:", status);
        // console.error("Error message:", message);
        // console.error("Error details:", details);

        if (status === 401) {
          toast.error("Authentication required. Please log in again.");
          navigate("/login");
        } else if (status === 400 && details) {
          const fieldErrors = details
            .map(
              (d: { field: string; message: string }) =>
                `${d.field}: ${d.message}`
            )
            .join(", ");
          toast.error(`Validation error: ${fieldErrors}`);
        } else {
          toast.error(message || "Failed to create post");
        }
      } else {
        toast.error("Failed to create post");
      }
    },
  });

  const onSubmit = async (data: CreatePostFormData) => {
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Form data:", data);
    console.log("Auth token:", localStorage.getItem("token"));
    console.log("User authenticated:", isAuthenticated);
    console.log("Content length:", data.content?.length || 0);
    console.log("================================");

    // Check authentication first
    if (!isAuthenticated) {
      toast.error("You must be logged in to create posts");
      navigate("/login");
      return;
    }

    // Basic validation
    if (!data.content || data.content.trim() === "") {
      toast.error("Content is required");
      return;
    }

    if (!data.title || data.title.trim() === "") {
      toast.error("Title is required");
      return;
    }

    // Clean up the data - ensure empty strings become undefined
    const cleanedData: CreatePostData = {
      ...data,
      excerpt: data.excerpt?.trim() || undefined,
      coverImage: data.coverImage?.trim() || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      // Convert local datetime to UTC for server
      createdAt: data.createdAt?.trim()
        ? parseInputDateToUtc(data.createdAt.trim())
        : undefined,
    };

    // console.log("Cleaned data:", cleanedData);
    createMutation.mutate(cleanedData);
  };

  // Auto-save functionality
  const autoSave = useCallback(
    async (data: Partial<CreatePostFormData>) => {
      if (!isAuthenticated || !data.title?.trim() || !data.content?.trim())
        return;

      try {
        // This would be an auto-save API call - for now just simulate
        setLastSaved(new Date());
        // In a real implementation, you'd call an auto-save endpoint here
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    },
    [isAuthenticated]
  );

  // Set up auto-save
  useEffect(() => {
    const subscription = watch((data) => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      const timer = setTimeout(() => {
        // Clean the data before passing to autoSave to ensure correct types
        const cleanedData = {
          ...data,
          tagIds:
            data.tagIds?.filter((id): id is string => typeof id === "string") ||
            undefined,
        };
        autoSave(cleanedData);
      }, 2000); // Auto-save after 2 seconds of inactivity

      setAutoSaveTimer(timer);
    });

    return () => {
      subscription.unsubscribe();
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [watch, autoSave, autoSaveTimer]);

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

  const watchedValues = watch();
  const content = watchedValues.content || "";
  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(wordCount);

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${isZenMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 to-white"
        }`}
    >
      {/* Enhanced Header */}
      {!isZenMode && (
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            {/* Mobile Layout - Stack vertically */}
            <div className="block sm:hidden space-y-3">
              <div className="flex items-center justify-between">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-all duration-200 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={toggleZenMode}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Toggle Zen Mode"
                  >
                    <Focus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className={`p-2 border rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${isPreview
                        ? "bg-primary-50 border-primary-200 text-primary-700"
                        : "border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-xl font-bold text-gray-900">
                Create New Post
              </h1>

              {/* Mobile Stats */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Type className="h-3 w-3" />
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                </div>
                {lastSaved && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>
                      Saved{" "}
                      {lastSaved.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout - Keep existing horizontal layout */}
            <div className="hidden sm:flex items-center justify-between">
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
                  Create New Post
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Writing Stats */}
                <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Type className="h-4 w-4" />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} min read</span>
                  </div>
                  {lastSaved && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Saved {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

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
                    className={`btn-outline btn-sm flex items-center space-x-1 ${isPreview
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
            className="bg-gray-800/90 hover:bg-gray-700 text-white p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg border border-gray-600 backdrop-blur-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Exit Zen Mode (Esc)"
          >
            <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`${isZenMode ? "p-0" : "container mx-auto px-4 sm:px-6 py-4 sm:py-8"}`}
      >
        <div className={`${isZenMode ? "min-h-screen" : "max-w-5xl"} mx-auto`}>
          {!isPreview ? (
            /* Enhanced Editor Form */
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={`space-y-6 sm:space-y-8 ${isZenMode ? "max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-16" : ""
                }`}
            >
              {/* Title - Enhanced */}
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className={`block text-sm font-semibold tracking-wide ${isZenMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  TITLE *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className={`w-full font-bold border-none outline-none bg-transparent placeholder-gray-400 focus:ring-0 ${isZenMode
                      ? "text-white placeholder-gray-500 text-2xl sm:text-3xl lg:text-5xl"
                      : "text-gray-900 text-xl sm:text-2xl lg:text-4xl"
                    } ${errors.title ? "text-red-500" : ""}`}
                  placeholder="Your amazing story starts here..."
                  style={{
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

              {/* Excerpt - Enhanced */}
              {!isZenMode && (
                <div className="space-y-3">
                  <label
                    htmlFor="excerpt"
                    className="block text-sm font-semibold tracking-wide text-gray-700 mb-3"
                  >
                    EXCERPT
                  </label>
                  <textarea
                    {...register("excerpt")}
                    rows={3}
                    className={`w-full text-base sm:text-lg border border-gray-200 rounded-xl px-3 sm:px-4 py-3 sm:py-4 bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none min-h-[88px] ${errors.excerpt ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                    placeholder="A compelling summary that draws readers in..."
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm font-medium">
                      {errors.excerpt.message}
                    </p>
                  )}
                </div>
              )}

              {/* Creation Time - Enhanced */}
              {!isZenMode && (
                <div className="space-y-3">
                  <label
                    htmlFor="createdAt"
                    className="block text-sm font-semibold tracking-wide text-gray-700 mb-3"
                  >
                    CREATION TIME
                  </label>
                  <input
                    {...register("createdAt")}
                    type="datetime-local"
                    className={`w-full text-base sm:text-lg border border-gray-200 rounded-xl px-3 sm:px-4 py-3 sm:py-4 bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[48px] ${errors.createdAt
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                      }`}
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Leave empty to use the current time when creating the post
                    (in your local timezone: {getTimezoneInfo().timeZoneName})
                  </p>
                  {errors.createdAt && (
                    <p className="text-red-500 text-sm font-medium">
                      {errors.createdAt.message}
                    </p>
                  )}
                </div>
              )}

              {/* Cover Image - Enhanced with Unsplash Integration */}
              {!isZenMode && (
                <div className="space-y-3">
                  <label
                    htmlFor="coverImage"
                    className="block text-sm font-semibold tracking-wide text-gray-700 mb-3"
                  >
                    COVER IMAGE
                  </label>

                  {/* Mode Toggle */}
                  <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50 mb-4">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("unsplash")}
                      className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] ${imageInputMode === "unsplash"
                          ? "bg-white text-primary-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <Camera className="h-4 w-4" />
                      <span className="hidden sm:inline">Browse Unsplash</span>
                      <span className="sm:hidden">Unsplash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("upload")}
                      className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] ${imageInputMode === "upload"
                          ? "bg-white text-primary-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="hidden sm:inline">Upload</span>
                      <span className="sm:hidden">Upload</span>
                    </button>

                  </div>

                  {imageInputMode === "unsplash" ? (
                    /* Unsplash Browse Mode */
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsUnsplashPickerOpen(true)}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 sm:px-6 py-6 sm:py-8 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group min-h-[120px] sm:min-h-[140px]"
                      >
                        <div className="text-center">
                          <Camera className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400 group-hover:text-primary-500 mx-auto mb-3 sm:mb-4 transition-colors" />
                          <p className="text-base sm:text-lg font-medium text-gray-600 group-hover:text-primary-600 mb-1 sm:mb-2">
                            Browse Unsplash Photos
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Find the perfect cover image from millions of free
                            photos
                          </p>
                        </div>
                      </button>

                      {watchedValues.coverImage && (
                        <div className="relative group">
                          <img
                            src={watchedValues.coverImage}
                            alt="Selected cover"
                            className="w-full h-32 sm:h-48 object-cover rounded-xl border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM4LjY4NjI5IDE2IDYgMTMuMzEzNyA2IDEwQzYgNi42ODYyOSA4LjY4NjI5IDQgMTIgNEMxNS4zMTM3IDQgMTggNi42ODYyOSAxOCAxMEMxOCAxMy4zMTM3IDE1LjMxMzcgMTYgMTIgMTZaIiBmaWxsPSIjOTM5M0E3Ii8+CjxwYXRoIGQ9Ik0xMiAxNEMxMy42NTY5IDE0IDE1IDEyLjY1NjkgMTUgMTFDMTUgOS4zNDMxNSAxMy42NTY5IDggMTIgOEMxMC4zNDMxIDggOSA5LjM0MzE1IDkgMTFDOSAxMi42NTY5IDEwLjM0MzEgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-xl transition-all duration-200 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setIsUnsplashPickerOpen(true)}
                              className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-gray-50 min-h-[36px]"
                            >
                              Change Photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : imageInputMode === "upload" ? (
                    /* MinIO Upload Mode */
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsImageUploadDialogOpen(true)}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 sm:px-6 py-6 sm:py-8 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group min-h-[120px] sm:min-h-[140px]"
                      >
                        <div className="text-center">
                          <svg className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400 group-hover:text-primary-500 mx-auto mb-3 sm:mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-base sm:text-lg font-medium text-gray-600 group-hover:text-primary-600 mb-1 sm:mb-2">
                            Upload Cover Image
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Click to upload or drag and drop
                          </p>
                        </div>
                      </button>

                      {watchedValues.coverImage && (
                        <div className="relative group">
                          <img
                            src={watchedValues.coverImage}
                            alt="Selected cover"
                            className="w-full h-32 sm:h-48 object-cover rounded-xl border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-xl transition-all duration-200 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setIsImageUploadDialogOpen(true)}
                              className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-gray-50 min-h-[36px]"
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual URL Mode */
                    <input
                      {...register("coverImage")}
                      type="url"
                      className={`w-full text-base sm:text-lg border border-gray-200 rounded-xl px-3 sm:px-4 py-3 sm:py-4 bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[48px] ${errors.coverImage
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                        }`}
                      placeholder="https://images.unsplash.com/your-amazing-cover"
                    />
                  )}

                  {errors.coverImage && (
                    <p className="text-red-500 text-sm font-medium">
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

              {/* Content - Enhanced */}
              <div className="space-y-3">
                <label
                  htmlFor="content"
                  className={`block text-sm font-semibold tracking-wide ${isZenMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {isZenMode ? "" : "CONTENT *"}
                </label>
                <div
                  className={`${errors.content ? "border-red-500 rounded-xl" : ""
                    } ${isZenMode
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
                    value={content}
                    onChange={(value: string) => {
                      setValue("content", value);
                      trigger("content");
                    }}
                    placeholder={
                      isZenMode
                        ? "Let your thoughts flow..."
                        : "Start writing your masterpiece... You can use Markdown for formatting."
                    }
                    height={
                      isZenMode
                        ? typeof window !== "undefined" &&
                          window.innerHeight < 700
                          ? 400
                          : 600
                        : typeof window !== "undefined" &&
                          window.innerWidth < 640
                          ? 300
                          : 500
                    }
                    hideToolbar={isZenMode}
                  />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Actions - Enhanced */}
              <div
                className={`pt-6 sm:pt-8 ${isZenMode
                    ? "border-t border-gray-700"
                    : "border-t border-gray-200"
                  }`}
              >
                {/* Mobile Layout - Stack vertically */}
                <div className="block sm:hidden space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <input
                        {...register("published")}
                        type="checkbox"
                        id="published"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-5 w-5"
                      />
                      <label
                        htmlFor="published"
                        className={`text-sm font-medium ${isZenMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Publish immediately
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    onClick={() => console.log("Mobile submit button clicked")}
                    className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 text-base min-h-[56px] ${createMutation.isPending
                        ? "bg-gray-400 cursor-not-allowed"
                        : watchedValues.published
                          ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                          : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg"
                      }`}
                  >
                    {createMutation.isPending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Save className="h-5 w-5" />
                        <span>
                          {watchedValues.published
                            ? "Publish Post"
                            : "Save Draft"}
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Desktop Layout - Keep horizontal */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-5 w-5"
                        checked={watchedValues.published}
                        onChange={(e) =>
                          setValue("published", e.target.checked)
                        }
                      />
                      <label
                        className={`text-sm font-medium ${isZenMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Publish immediately
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      onClick={() =>
                        console.log("Desktop submit button clicked")
                      }
                      className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:scale-105 ${createMutation.isPending
                          ? "bg-gray-400 cursor-not-allowed"
                          : watchedValues.published
                            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                            : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg"
                        }`}
                    >
                      {createMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>
                            {watchedValues.published
                              ? "Publish Post"
                              : "Save Draft"}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Enhanced Preview */
            <div className="max-w-4xl mx-auto">
              <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 sm:p-6">
                  <div className="flex items-center space-x-2 text-primary-100 text-xs sm:text-sm mb-3 sm:mb-4">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Preview Mode</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                    {watchedValues.title || "Untitled Post"}
                  </h1>

                  {watchedValues.excerpt && (
                    <p className="text-base sm:text-lg lg:text-xl text-primary-100 leading-relaxed mb-4 sm:mb-0">
                      {watchedValues.excerpt}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 sm:space-x-6 mt-4 sm:mt-6 text-primary-100 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <Type className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{wordCount} words</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{readingTime} minute read</span>
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                {watchedValues.coverImage && (
                  <div className="relative h-48 sm:h-64 lg:h-80 bg-gray-100">
                    <img
                      src={watchedValues.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="prose prose-sm sm:prose-lg prose-primary max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          watchedValues.content ||
                          "<p>Start writing your content to see the preview...</p>",
                      }}
                      style={{
                        backgroundColor: "transparent",
                        color: "inherit",
                        fontSize:
                          typeof window !== "undefined" &&
                            window.innerWidth < 640
                            ? "1rem"
                            : "1.125rem",
                        lineHeight: "1.7",
                      }}
                    />
                  </div>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>

      {/* Unsplash Photo Picker Modal */}
      <UnsplashPhotoPicker
        isOpen={isUnsplashPickerOpen}
        onClose={() => setIsUnsplashPickerOpen(false)}
        onPhotoSelect={(photoUrl) => {
          setValue("coverImage", photoUrl);
          // Trigger validation to clear any errors
          trigger("coverImage");
        }}
      />

      {/* Image Upload Dialog for MinIO */}
      <ImageUploadDialog
        isOpen={isImageUploadDialogOpen}
        onClose={() => setIsImageUploadDialogOpen(false)}
        onImageUploaded={(imageUrl) => {
          setValue("coverImage", imageUrl);
          trigger("coverImage");
        }}
      />
    </div>
  );
};

export default CreatePost;
