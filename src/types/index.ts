export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'REVIEWER' | 'OPERATOR' | 'READER';

export type UserType = 'INTERNAL' | 'EXTERNAL';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  userType?: UserType;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string | null;
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
  authorEmail?: string;
  message: string;
  isResolved?: boolean;
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
  code: string; // Código único de identificação rápida (ex: "CC-101")
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
  likesCount?: number;
  dislikesCount?: number;
  proposalNote?: string;
  contentHtml: string;
  attachments?: { id: string; name: string; size: string; url?: string }[];
  reviews?: ArticleReview[];
  comments?: ArticleReviewComment[]; // Conversa em balões entre Revisor e Criador
  publishedAt?: string;
  accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL';
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
  accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL';
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
