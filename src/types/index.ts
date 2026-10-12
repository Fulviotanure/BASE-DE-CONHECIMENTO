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

export interface Subcategory {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  orderIndex: number;
  articleCount?: number;
  subcategories?: Subcategory[];
  accessLevel?: 'INTERNAL' | 'ALL';
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
  subcategoryId?: string;
  subcategoryName?: string;
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

export type NotificationType =
  | 'ARTICLE_SUBMITTED'
  | 'ARTICLE_NEEDS_ADJUSTMENT'
  | 'ARTICLE_APPROVED'
  | 'RANK_UP'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId?: string;
  userEmail?: string;
  type: NotificationType;
  title: string;
  message: string;
  articleId?: string;
  articleTitle?: string;
  read: boolean;
  createdAt: string;
  pointsGained?: number;
  authorName?: string;
}

export type EmailType =
  | 'ARTICLE_SUBMITTED'
  | 'ARTICLE_NEEDS_ADJUSTMENT'
  | 'ARTICLE_APPROVED'
  | 'RANK_UP';

export interface SentEmail {
  id: string;
  to: string;
  toName: string;
  subject: string;
  htmlBody: string;
  type: EmailType;
  sentAt: string;
  status: 'SENT' | 'SIMULATED';
  articleTitle?: string;
}

export interface UserRankInfo {
  id: string;
  title: string;
  badge: string;
  level: number;
  minPoints: number;
  nextRankPoints: number | null;
  color: string;
  gradient: string;
}

export interface UserGamification {
  points: number;
  rank: UserRankInfo;
  articlesCount: number;
  publishedCount: number;
  adjustmentsCount: number;
  reviewsCount: number;
  progressPercentage: number;
}

