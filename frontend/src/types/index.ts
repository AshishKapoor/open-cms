export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface PostTag {
  id: string;
  postId: string;
  tagId: string;
  tag: Tag;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    isAdmin: boolean;
  };
  tags?: PostTag[];
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface PostResponse {
  success: boolean;
  data: {
    post: Post;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  recaptchaToken?: string;
}

export interface LoginData {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  tagIds?: string[];
  createdAt?: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tagIds?: string[];
}

export interface CreateTagData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTagData {
  name?: string;
  description?: string;
  color?: string;
}

export interface UpdateProfileData {
  avatar?: string;
  bio?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    subscriber: NewsletterSubscriber;
  };
}

export interface NewsletterSubscribersResponse {
  success: boolean;
  data: {
    subscribers: NewsletterSubscriber[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface TagsResponse {
  success: boolean;
  data: {
    tags: Tag[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface TagResponse {
  success: boolean;
  data: {
    tag: Tag;
  };
}

export interface PostsByTagResponse {
  success: boolean;
  data: {
    tag: Tag;
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Documentation Types
export interface DocumentationPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  sidebarPosition: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  sectionId: string;
}

export interface DocumentationSection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  sidebarPosition: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  productId: string;
  pages?: DocumentationPage[];
}

export interface DocumentationProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  published: boolean;
  sidebarPosition: number;
  createdAt: string;
  updatedAt: string;
  sections?: DocumentationSection[];
}

export interface CreateDocumentationProductData {
  name: string;
  slug: string;
  description?: string;
  published?: boolean;
}

export interface UpdateDocumentationProductData {
  name?: string;
  slug?: string;
  description?: string;
  published?: boolean;
}

export interface CreateDocumentationSectionData {
  title: string;
  slug: string;
  description?: string;
  published?: boolean;
}

export interface UpdateDocumentationSectionData {
  title?: string;
  slug?: string;
  description?: string;
  published?: boolean;
}

export interface CreateDocumentationPageData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published?: boolean;
}

export interface UpdateDocumentationPageData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  published?: boolean;
}

export interface DocumentationProductResponse {
  success: boolean;
  data: {
    product: DocumentationProduct;
  };
}

export interface DocumentationProductsResponse {
  success: boolean;
  data: {
    products: DocumentationProduct[];
  };
}

export interface DocumentationSectionResponse {
  success: boolean;
  data: {
    section: DocumentationSection;
  };
}

export interface DocumentationSectionsResponse {
  success: boolean;
  data: {
    sections: DocumentationSection[];
  };
}

export interface DocumentationPageResponse {
  success: boolean;
  data: {
    page: DocumentationPage;
  };
}

export interface DocumentationPagesResponse {
  success: boolean;
  data: {
    pages: DocumentationPage[];
  };
}
