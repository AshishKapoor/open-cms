import axios from "axios";
import type {
  AuthResponse,
  PostsResponse,
  PostResponse,
  RegisterData,
  LoginData,
  CreatePostData,
  UpdatePostData,
  UpdateProfileData,
  User,
  NewsletterSubscriptionResponse,
  NewsletterSubscribersResponse,
  TagsResponse,
  TagResponse,
  PostsByTagResponse,
  CreateTagData,
  UpdateTagData,
  DocumentationProductsResponse,
  DocumentationProductResponse,
  DocumentationSectionsResponse,
  DocumentationSectionResponse,
  DocumentationPagesResponse,
  DocumentationPageResponse,
  CreateDocumentationProductData,
  UpdateDocumentationProductData,
  CreateDocumentationSectionData,
  UpdateDocumentationSectionData,
  CreateDocumentationPageData,
  UpdateDocumentationPageData,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://blog.sannty.in";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // console.log("🔑 API Request Debug:");
    // console.log("- URL:", config.url);
    // console.log("- Method:", config.method);
    // console.log("- Token exists:", !!token);
    // console.log(
    //   "- Token preview:",
    //   token ? token.substring(0, 20) + "..." : "none"
    // );
    // console.log("- Request data:", config.data);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      "✅ API Response Success:",
      response.status,
      response.config.url
    );
    return response;
  },
  (error) => {
    // console.error("❌ API Response Error:");
    // console.error("- Status:", error.response?.status);
    // console.error("- URL:", error.config?.url);
    // console.error("- Error data:", error.response?.data);
    // console.error("- Full error:", error);

    if (error.response?.status === 401) {
      // Remove invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if needed
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  me: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileData
  ): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.put("/api/auth/profile", data);
    return response.data;
  },
};

// User Management API (Admin only)
export const userAPI = {
  getAllUsers: async (): Promise<{
    success: boolean;
    data: { users: User[] };
  }> => {
    const response = await api.get("/api/auth/users");
    return response.data;
  },

  updateUserAdminStatus: async (
    userId: string,
    isAdmin: boolean
  ): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.patch(`/api/auth/users/${userId}/admin`, {
      isAdmin,
    });
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  getAllPosts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    author?: string;
    tags?: string;
    published?: boolean;
  }): Promise<PostsResponse> => {
    const response = await api.get("/api/posts", { params });
    return response.data;
  },

  getPostById: async (id: string): Promise<PostResponse> => {
    const response = await api.get(`/api/posts/${id}`);
    return response.data;
  },

  getPostBySlug: async (slug: string): Promise<PostResponse> => {
    const response = await api.get(`/api/posts/slug/${slug}`);
    return response.data;
  },

  getMyPosts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PostsResponse> => {
    const response = await api.get("/api/posts/my", { params });
    return response.data;
  },

  createPost: async (data: CreatePostData): Promise<PostResponse> => {
    const response = await api.post("/api/posts", data);
    return response.data;
  },

  updatePost: async (
    id: string,
    data: UpdatePostData
  ): Promise<PostResponse> => {
    const response = await api.put(`/api/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/posts/${id}`);
    return response.data;
  },
};

// Newsletter API
export const newsletterAPI = {
  subscribe: async (email: string): Promise<NewsletterSubscriptionResponse> => {
    const response = await api.post("/api/newsletter/subscribe", { email });
    return response.data;
  },

  unsubscribe: async (
    email: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.post("/api/newsletter/unsubscribe", { email });
    return response.data;
  },

  getSubscribers: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<NewsletterSubscribersResponse> => {
    const response = await api.get("/api/newsletter/subscribers", { params });
    return response.data;
  },

  exportSubscribers: async (): Promise<Blob> => {
    const response = await api.get("/api/newsletter/export", {
      responseType: "blob",
    });
    return response.data;
  },
};

// Tags API
export const tagsAPI = {
  getAllTags: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    includePostCount?: boolean;
  }): Promise<TagsResponse> => {
    const response = await api.get("/api/tags", { params });
    return response.data;
  },

  getTagById: async (id: string): Promise<TagResponse> => {
    const response = await api.get(`/api/tags/${id}`);
    return response.data;
  },

  getTagBySlug: async (slug: string): Promise<TagResponse> => {
    const response = await api.get(`/api/tags/slug/${slug}`);
    return response.data;
  },

  getPostsByTag: async (
    slug: string,
    params?: {
      page?: number;
      limit?: number;
      published?: boolean;
    }
  ): Promise<PostsByTagResponse> => {
    const response = await api.get(`/api/tags/slug/${slug}/posts`, { params });
    return response.data;
  },

  createTag: async (data: CreateTagData): Promise<TagResponse> => {
    const response = await api.post("/api/tags", data);
    return response.data;
  },

  updateTag: async (id: string, data: UpdateTagData): Promise<TagResponse> => {
    const response = await api.put(`/api/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/tags/${id}`);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<{ success: boolean; imageUrl: string; message: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/api/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },
};

// Documentation API
export const documentationAPI = {
  // Products
  getAllProducts: async (): Promise<DocumentationProductsResponse> => {
    const response = await api.get("/api/documentation/products");
    return response.data;
  },

  getProductBySlug: async (slug: string): Promise<DocumentationProductResponse> => {
    const response = await api.get(`/api/documentation/products/${slug}`);
    return response.data;
  },

  createProduct: async (data: CreateDocumentationProductData): Promise<DocumentationProductResponse> => {
    const response = await api.post("/api/documentation/products", data);
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateDocumentationProductData): Promise<DocumentationProductResponse> => {
    const response = await api.put(`/api/documentation/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/documentation/products/${id}`);
    return response.data;
  },

  // Sections
  getSectionsByProduct: async (productId: string): Promise<DocumentationSectionsResponse> => {
    const response = await api.get(
      `/api/documentation/products/${productId}/sections`
    );
    return response.data;
  },

  createSection: async (productId: string, data: CreateDocumentationSectionData): Promise<DocumentationSectionResponse> => {
    const response = await api.post(
      `/api/documentation/products/${productId}/sections`,
      data
    );
    return response.data;
  },

  updateSection: async (
    productId: string,
    sectionId: string,
    data: UpdateDocumentationSectionData
  ): Promise<DocumentationSectionResponse> => {
    const response = await api.put(
      `/api/documentation/products/${productId}/sections/${sectionId}`,
      data
    );
    return response.data;
  },

  deleteSection: async (productId: string, sectionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(
      `/api/documentation/products/${productId}/sections/${sectionId}`
    );
    return response.data;
  },

  reorderSections: async (productId: string, items: Array<{ id: string; sidebarPosition: number }>): Promise<DocumentationSectionsResponse> => {
    const response = await api.post(
      `/api/documentation/products/${productId}/sections/reorder`,
      { items }
    );
    return response.data;
  },

  // Pages
  getPagesBySection: async (sectionId: string): Promise<DocumentationPagesResponse> => {
    const response = await api.get(
      `/api/documentation/sections/${sectionId}/pages`
    );
    return response.data;
  },

  getPageBySlug: async (sectionId: string, slug: string): Promise<DocumentationPageResponse> => {
    const response = await api.get(
      `/api/documentation/sections/${sectionId}/pages/${slug}`
    );
    return response.data;
  },

  createPage: async (sectionId: string, data: CreateDocumentationPageData): Promise<DocumentationPageResponse> => {
    const response = await api.post(
      `/api/documentation/sections/${sectionId}/pages`,
      data
    );
    return response.data;
  },

  updatePage: async (
    sectionId: string,
    pageId: string,
    data: UpdateDocumentationPageData
  ): Promise<DocumentationPageResponse> => {
    const response = await api.put(
      `/api/documentation/sections/${sectionId}/pages/${pageId}`,
      data
    );
    return response.data;
  },

  deletePage: async (sectionId: string, pageId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(
      `/api/documentation/sections/${sectionId}/pages/${pageId}`
    );
    return response.data;
  },

  reorderPages: async (sectionId: string, items: Array<{ id: string; sidebarPosition: number }>): Promise<DocumentationPagesResponse> => {
    const response = await api.post(
      `/api/documentation/sections/${sectionId}/pages/reorder`,
      { items }
    );
    return response.data;
  },
};

export default api;
