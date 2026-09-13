export type UserRole = 'OPERATOR' | 'REVIEWER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  orderIndex: number;
  articleCount?: number;
}

export type ArticleStatus = 'PENDING' | 'IN_ADJUSTMENT' | 'APPROVED' | 'REJECTED';

export interface ArticleReviewComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export interface ArticleReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  action: 'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT';
  generalFeedback: string;
  comments: ArticleReviewComment[];
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  currentStatus: ArticleStatus;
  tags: string[];
  viewCount: number;
  contentHtml: string;
  reviews?: ArticleReview[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ToolCategory = 'SOFTWARES' | 'CONVERSORES' | 'LAYOUTS_ERP' | 'LINKS_OPERACIONAIS';

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  resourceType: 'DOWNLOAD_FILE' | 'EXTERNAL_URL';
  targetUrl: string;
  fileSize?: string;
  versionTag?: string;
  orderIndex: number;
  isActive: boolean;
}

export interface UserPerformance {
  userId: string;
  userName: string;
  userEmail: string;
  submittedCount: number;
  approvedCount: number;
  adjustmentCount: number;
  rejectedCount: number;
  conversionRate: number; // Porcentagem de 0 a 100
}
