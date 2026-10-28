import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { 
  UserProfile, 
  Article, 
  Category, 
  ToolItem, 
  UserRole, 
  UserType, 
  ArticleStatus, 
  UserPerformance, 
  ArticleReview,
  ArticleReviewComment,
  AppNotification,
  SentEmail,
  UserGamification
} from '../types';
import { sendArticleSubmittedEmail, sendArticleNeedsAdjustmentEmail, sendArticleApprovedEmail, getSentEmails, clearSentEmails } from '../services/emailService';
import { calculateUserGamification } from '../services/gamificationService';
import { sanitizeArticleHtml } from '../utils/sanitizeArticleHtml';
import { INITIAL_USERS, INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_TOOLS } from '../data/initialSeed';
import { getSavedFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConfigured, auth, db, type FirebaseConfig } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  subscribeAuthState, 
  logoutUser, 
  isCorporateEmailValid, 
  registerWithEmailPassword, 
  loginWithEmailPassword,
  loginWithGoogle,
  determineUserType,
  isAdminUser,
  isSuperAdminUser,
  determineInitialRole,
  isInternalUser,
  isExternalUser,
  MOCK_ADMIN_USER,
  MOCK_READER_USER,
  getDeletedUserEmails,
  addDeletedUserEmail,
  removeDeletedUserEmail,
  getDeletedCategoryIds,
  addDeletedCategoryId,
  removeDeletedCategoryId,
  getDeletedArticleIds,
  addDeletedArticleId,
  removeDeletedArticleId,
  getLocalPreAssignedRole,
  setLocalPreAssignedRole,
  removeLocalPreAssignedRole,
} from '../services/authService';
import { 
  subscribeArticles, 
  saveArticleToFirestore, 
  updateArticleInFirestore, 
  deleteArticleFromFirestore,
  subscribeUsers, 
  updateUserRoleInFirestore, 
  toggleUserStatusInFirestore, 
  deleteUserFromFirestore,
  subscribeTools, 
  saveToolToFirestore, 
  subscribeCategories,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  seedFirestoreWithMovideskData,
  seedUsersToFirestore
} from '../services/firestoreService';

export interface AppDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'info' | 'error' | 'review';
  badgeText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AppContextType {
  // Usuário Atual & Autenticação
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isLoggedIn: boolean;
  isPermanentSuperAdmin: boolean;
  switchRolePreview: (role: UserRole) => void;
  isRealFirebaseAuth: boolean;
  logout: () => Promise<void>;
  loginWithGoogleAuth: (customEmail?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  registerClientAccount: (email: string, displayName: string, pass: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  loginAsUser: (user: UserProfile) => void;
  loginAsMockAdmin: () => void;
  loginAsMockReader: () => void;
  
  // Modais de Autenticação e Perfil
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Foto de Perfil & Google OAuth Photo
  updateUserPhoto: (newPhotoURL: string) => Promise<boolean>;
  pullGooglePhoto: () => string | null;

  // Engajamento de Artigos (Likes/Deslikes Dados e Recebidos)
  getUserEngagementStats: (email?: string) => {
    receivedLikes: number;
    receivedDislikes: number;
    givenLikes: number;
    givenDislikes: number;
    authoredArticles: Article[];
  };

  // Usuários (Painel Administrativo)
  users: UserProfile[];
  updateUserRole: (uid: string, newRole: UserRole) => void;
  toggleUserStatus: (uid: string) => void;
  deleteUser: (uid: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  addNewUser: (email: string, displayName: string, password?: string, initialRoleParam?: UserRole) => Promise<{ success: boolean; error?: string }>;

  // Base de Conhecimento
  categories: Category[];
  articles: Article[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (art: Article | null) => void;
  createCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Interações com Artigo (Likes/Dislikes & Proposta de Edição)
  voteArticle: (articleId: string, type: 'like' | 'dislike') => void;
  proposeArticleEdit: (
    articleId: string,
    title: string,
    categoryId: string,
    contentHtml: string,
    tags: string[],
    accessLevel: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    proposalNote: string,
    attachments?: { id: string; name: string; size: string; url?: string }[]
  ) => void;

  // Fluxo Editorial
  createArticle: (
    title: string, 
    categoryId: string, 
    contentHtml: string, 
    tags: string[], 
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    attachments?: { id: string; name: string; size: string; url?: string }[],
    subcategoryId?: string,
    subcategoryName?: string
  ) => void;
  updateArticleContent: (
    articleId: string, 
    title: string, 
    categoryId: string, 
    contentHtml: string, 
    tags: string[], 
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    attachments?: { id: string; name: string; size: string; url?: string }[],
    subcategoryId?: string,
    subcategoryName?: string
  ) => void;
  saveAndApproveArticle: (
    articleId: string,
    title: string,
    categoryId: string,
    contentHtml: string,
    tags: string[],
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    attachments?: { id: string; name: string; size: string; url?: string }[],
    subcategoryId?: string,
    subcategoryName?: string
  ) => void;
  deleteArticle: (articleId: string) => Promise<void>;
  submitReview: (
    articleId: string, 
    action: 'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT', 
    feedback: string, 
    commentMessages?: string[]
  ) => void;
  addArticleComment: (articleId: string, message: string) => void;
  incrementArticleView: (articleId: string) => void;
  
  // Central de Ferramentas
  tools: ToolItem[];
  addTool: (tool: Omit<ToolItem, 'id'>) => void;

  // Métricas
  getUserPerformances: () => UserPerformance[];

  // Busca Global
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Tema
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Configurações de Conexão Cloud
  firebaseConfig: FirebaseConfig | null;
  isFirebaseConfigured: boolean;
  saveFirebaseKeys: (config: FirebaseConfig) => void;
  resetFirebaseKeys: () => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  seedFirebase: () => Promise<{ success: boolean; count: number }>;

  // Notificações e Gamificação
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  sentEmails: SentEmail[];
  refreshSentEmails: () => void;
  clearSentEmailsList: () => void;
  getUserGamification: (email?: string) => UserGamification;
  celebrationModal: { isOpen: boolean; title: string; message: string; points?: number } | null;
  triggerCelebration: (title?: string, message?: string, points?: number) => void;
  closeCelebrationModal: () => void;

  // Janelas e Diálogos Amigáveis (Substitui alerts do navegador)
  appDialog: AppDialogState | null;
  showDialog: (options: Omit<AppDialogState, 'isOpen'>) => void;
  closeDialog: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lista de Usuários reais da Conciliador Contábil (estritamente desduplicada por e-mail e respeitando exclusões)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    // Purga definitiva do perfil de teste antigo solicitado pelo Fulvio
    addDeletedUserEmail('admin.teste@conciliadorcontabil.com.br');
    removeLocalPreAssignedRole('admin.teste@conciliadorcontabil.com.br');
    const deletedEmails = getDeletedUserEmails();
    const saved = localStorage.getItem('conciliador_users_v7');
    const emailMap = new Map<string, UserProfile>();

    if (saved) {
      try {
        const parsed: UserProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
            const k = u.email?.toLowerCase().trim();
            if (k && k !== 'admin.teste@conciliadorcontabil.com.br' && !deletedEmails.has(k) && !emailMap.has(k)) {
              emailMap.set(k, u);
            }
          });
        }
      } catch {}
    }

    INITIAL_USERS.forEach((u) => {
      const k = u.email.toLowerCase().trim();
      if (!deletedEmails.has(k) && !emailMap.has(k)) {
        emailMap.set(k, u);
      }
    });

    const list = Array.from(emailMap.values());
    try {
      localStorage.setItem('conciliador_users_v7', JSON.stringify(list));
    } catch {}
    return list;
  });

  // O usuário começa deslogado (null) a menos que haja sessão salva
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('conciliador_current_user_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const isInternal = (parsed.role && parsed.role !== 'READER') || isCorporateEmailValid(parsed.email);
          return {
            ...parsed,
            userType: isInternal ? 'INTERNAL' : 'EXTERNAL',
          };
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  // Estado fixo de Super Administrador (Contempla conta oficial do Fulvio e Admin Fictício de Teste)
  const isExactSuperAdmin = (email?: string | null) => {
    if (!email) return false;
    return isSuperAdminUser(email);
  };

  const [isPermanentSuperAdmin, setIsPermanentSuperAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem('conciliador_current_user_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return isExactSuperAdmin(parsed.email);
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (isExactSuperAdmin(currentUser?.email)) {
      setIsPermanentSuperAdmin(true);
      localStorage.setItem('conciliador_is_superadmin', 'true');
    } else {
      setIsPermanentSuperAdmin(false);
      localStorage.removeItem('conciliador_is_superadmin');
    }
  }, [currentUser]);

  // Persistência contínua da sessão do usuário
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('conciliador_current_user_v3', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('conciliador_current_user_v3');
    }
  }, [currentUser]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const deletedIds = getDeletedCategoryIds();
    try {
      const saved = localStorage.getItem('conciliador_categories_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const parsedIds = new Set(parsed.map((c: Category) => c.id));
          const missingInitial = INITIAL_CATEGORIES.filter((c) => !parsedIds.has(c.id));
          const combined = [...parsed, ...missingInitial];
          return combined
            .filter((cat: Category) => !deletedIds.has(cat.id))
            .map((cat: Category) => {
              if (!cat.accessLevel) {
                const isPb =
                  cat.title?.toLowerCase().includes('playbook') ||
                  cat.id === 'cat-11' ||
                  cat.id === 'cat-12';
                return { ...cat, accessLevel: (isPb ? 'INTERNAL' : 'ALL') as 'INTERNAL' | 'ALL' };
              }
              return cat;
            })
            .sort((a, b) => a.orderIndex - b.orderIndex);
        }
      }
    } catch {}
    return INITIAL_CATEGORIES.filter((cat) => !deletedIds.has(cat.id));
  });

  useEffect(() => {
    try {
      localStorage.setItem('conciliador_categories_v2', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  const SEED_BASELINE_METRICS: Record<string, { viewCount: number; likesCount: number; dislikesCount: number }> = {
    'CC-101': { viewCount: 384, likesCount: 72, dislikesCount: 2 },
    'CC-102': { viewCount: 310, likesCount: 58, dislikesCount: 1 },
    'CC-103': { viewCount: 265, likesCount: 49, dislikesCount: 3 },
    'CC-104': { viewCount: 228, likesCount: 43, dislikesCount: 1 },
    'CC-105': { viewCount: 195, likesCount: 38, dislikesCount: 2 },
    'CC-106': { viewCount: 168, likesCount: 32, dislikesCount: 0 },
    'CC-107': { viewCount: 142, likesCount: 27, dislikesCount: 1 },
    'CC-108': { viewCount: 124, likesCount: 22, dislikesCount: 0 },
    'CC-109': { viewCount: 108, likesCount: 19, dislikesCount: 1 },
    'CC-110': { viewCount: 95, likesCount: 17, dislikesCount: 0 },
    'CC-111': { viewCount: 84, likesCount: 14, dislikesCount: 1 },
    'CC-112': { viewCount: 76, likesCount: 13, dislikesCount: 0 },
    'CC-113': { viewCount: 68, likesCount: 11, dislikesCount: 0 },
    'CC-114': { viewCount: 62, likesCount: 10, dislikesCount: 1 },
    'CC-115': { viewCount: 55, likesCount: 9, dislikesCount: 0 },
    'CC-116': { viewCount: 49, likesCount: 8, dislikesCount: 0 },
    'CC-117': { viewCount: 44, likesCount: 7, dislikesCount: 0 },
    'CC-118': { viewCount: 38, likesCount: 6, dislikesCount: 0 },
    'CC-119': { viewCount: 32, likesCount: 5, dislikesCount: 0 },
    'CC-120': { viewCount: 27, likesCount: 4, dislikesCount: 0 },
  };

  const [articles, setArticles] = useState<Article[]>(() => {
    const deletedArticleIds = getDeletedArticleIds();
    const saved = localStorage.getItem('conciliador_articles_v10');
    let loaded = INITIAL_ARTICLES;
    if (saved) {
      try {
        const parsed: Article[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const parsedIds = new Set(parsed.map((a: Article) => a.id));
          const missingInitial = INITIAL_ARTICLES.filter((a) => !parsedIds.has(a.id));
          loaded = [...parsed, ...missingInitial];
        }
      } catch {}
    }

    const sanitizedLoaded = loaded.map((art) => ({
      ...art,
      contentHtml: sanitizeArticleHtml(art.contentHtml),
    }));

    const enriched = sanitizedLoaded
      .filter((art) => !deletedArticleIds.has(art.id))
      .map((art) => {
      const base = SEED_BASELINE_METRICS[art.code];
      if (base && (!art.viewCount || art.viewCount === 0) && (!art.likesCount || art.likesCount === 0)) {
        return {
          ...art,
          viewCount: base.viewCount,
          likesCount: base.likesCount,
          dislikesCount: base.dislikesCount,
        };
      }
      return art;
    });

    localStorage.setItem('conciliador_articles_v10', JSON.stringify(enriched));
    return enriched;
  });

  // Persistência local contínua
  useEffect(() => {
    localStorage.setItem('conciliador_users_v7', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('conciliador_articles_v10', JSON.stringify(articles));
  }, [articles]);

  const [tools, setTools] = useState<ToolItem[]>(() => {
    const saved = localStorage.getItem('conciliador_tools_v6');
    return saved ? JSON.parse(saved) : INITIAL_TOOLS;
  });

  useEffect(() => {
    localStorage.setItem('conciliador_tools_v6', JSON.stringify(tools));
  }, [tools]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Estados de Modais
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRealFirebaseAuth, setIsRealFirebaseAuth] = useState(false);

  // Tema Dark/Light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('conciliador_theme') as 'dark' | 'light') || 'dark';
  });

  // Configuração Cloud
  const [firebaseConfig] = useState<FirebaseConfig | null>(getSavedFirebaseConfig);

  // ----------------------------------------------------
  // Notificações In-App & Central de E-mails Disparados
  // ----------------------------------------------------
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('conciliador_notifications_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: 'notif-welcome',
        type: 'SYSTEM',
        title: '👋 Bem-vindo ao Conciliador KB!',
        message: 'Acesse os manuais, procedimentos operacionais e ferramentas na Base de Conhecimento.',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('conciliador_notifications_v1', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => getSentEmails());

  const refreshSentEmails = () => {
    setSentEmails(getSentEmails());
  };

  const clearSentEmailsList = () => {
    clearSentEmails();
    setSentEmails([]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newN: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Gamificação: Pontuação & Patentes
  const getUserGamification = (email?: string): UserGamification => {
    const targetEmail = email || currentUser?.email || '';
    return calculateUserGamification(targetEmail, articles);
  };

  // Celebração de Parabéns com Confetes & Modal
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    points?: number;
  } | null>(null);

  const triggerCelebration = (title?: string, message?: string, points?: number) => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#5cb780', '#6c63ff', '#38bdf8', '#f59e0b'],
    });
    setCelebrationModal({
      isOpen: true,
      title: title || '🎉 Parabéns pelo Artigo!',
      message: message || 'Seu manual foi aprovado e publicado com sucesso!',
      points: points || 100,
    });
  };

  const closeCelebrationModal = () => {
    setCelebrationModal(null);
  };

  // Diálogos e Modais Amigáveis do Sistema (Substitui alerts do navegador)
  const [appDialog, setAppDialog] = useState<AppDialogState | null>(null);

  const showDialog = (options: Omit<AppDialogState, 'isOpen'>) => {
    setAppDialog({
      ...options,
      isOpen: true,
    });
  };

  const closeDialog = () => {
    setAppDialog(null);
  };

  // ----------------------------------------------------
  // Sincronização em Tempo Real com Firestore
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // 1. Ouvinte de Autenticação
    const unsubAuth = subscribeAuthState((firebaseUser, profile) => {
      if (firebaseUser && profile) {
        setCurrentUser((prev) => {
          let localSavedPhoto: string | undefined = undefined;
          try {
            const saved = localStorage.getItem('conciliador_current_user_v3');
            if (saved) localSavedPhoto = JSON.parse(saved).photoURL;
          } catch {}

          const effectiveRole = profile.role || prev?.role || 'READER';
          const isInternal = effectiveRole !== 'READER' || isCorporateEmailValid(profile.email);
          const effectivePhoto = profile.photoURL || prev?.photoURL || localSavedPhoto || firebaseUser.photoURL || undefined;
          return {
            ...profile,
            role: effectiveRole,
            userType: isInternal ? 'INTERNAL' : 'EXTERNAL',
            photoURL: effectivePhoto,
          };
        });
        setIsRealFirebaseAuth(true);
      } else {
        setIsRealFirebaseAuth(false);
      }
    });

    // 2. Ouvinte de Artigos Firestore (com auto-sanitização de links S3 para mídias locais)
    const unsubArticles = subscribeArticles((remoteArticles) => {
      const deletedArticleIds = getDeletedArticleIds();
      const filtered = remoteArticles.filter((a) => !deletedArticleIds.has(a.id));
      let hasFixedS3 = false;
      const sanitized = filtered.map((a) => {
        const cleanedHtml = sanitizeArticleHtml(a.contentHtml);
        const hasChanged = cleanedHtml !== a.contentHtml;
        if (hasChanged) {
          const updatedArt = { ...a, contentHtml: cleanedHtml };
          if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.email === 'fulvio@conciliadorcontabil.com.br') {
            saveArticleToFirestore(updatedArt).catch(() => {});
          }
          return updatedArt;
        }
        return a;
      });

      // Mescla com artigos iniciais que ainda não existam no Firestore para disponibilidade imediata
      const remoteIds = new Set(sanitized.map((a) => a.id));
      const missingInitial = INITIAL_ARTICLES.filter(
        (a) => !remoteIds.has(a.id) && !deletedArticleIds.has(a.id)
      );

      const allCombined = [...sanitized, ...missingInitial];
      setArticles(allCombined);
      localStorage.setItem('conciliador_articles_v10', JSON.stringify(allCombined));

      // Se o usuário logado for administrador, sincroniza os artigos faltantes no Firestore
      if (
        missingInitial.length > 0 &&
        (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.email === 'fulvio@conciliadorcontabil.com.br')
      ) {
        missingInitial.forEach((missingArt) => {
          saveArticleToFirestore(missingArt).catch(() => {});
        });
      }
    });

    // 3. Ouvinte de Usuários Firestore (com normalização, desduplicação por e-mail e respeito a exclusões)
    const unsubUsers = subscribeUsers((remoteUsers) => {
      const deletedEmails = getDeletedUserEmails();

      const normalizedRemoteUsers = remoteUsers
        .filter((u) => !deletedEmails.has((u.email || '').toLowerCase().trim()))
        .map((u) => {
          const isCorp = Boolean(u.email && isCorporateEmailValid(u.email));
          const hasInternalRole = Boolean(u.role && u.role !== 'READER');
          const effectiveUserType: UserType = (isCorp || hasInternalRole) ? 'INTERNAL' : 'EXTERNAL';
          const effectiveRole: UserRole = u.role || (isCorp ? 'OPERATOR' : 'READER');
          return {
            ...u,
            userType: effectiveUserType,
            role: effectiveRole,
          };
        });

      const emailToUserMap = new Map<string, UserProfile>();
      normalizedRemoteUsers.forEach((u) => {
        const emailKey = (u.email || '').toLowerCase().trim();
        if (!emailKey) return;
        const existing = emailToUserMap.get(emailKey);
        if (!existing) {
          emailToUserMap.set(emailKey, u);
        } else {
          // Desduplica registros para o mesmo e-mail, preservando dados de login e cargo atribuído
          const existingHasLogin = Boolean(existing.lastLoginAt);
          const currentHasLogin = Boolean(u.lastLoginAt);

          const preferredRole = (existing.role === 'SUPER_ADMIN' || existing.role === 'ADMIN' || existing.role === 'REVIEWER' || existing.role === 'OPERATOR')
            ? existing.role
            : u.role;

          const isInternal = preferredRole !== 'READER' || isCorporateEmailValid(emailKey);

          if (currentHasLogin && !existingHasLogin) {
            emailToUserMap.set(emailKey, {
              ...u,
              role: preferredRole,
              userType: isInternal ? 'INTERNAL' : 'EXTERNAL',
            });
          } else {
            emailToUserMap.set(emailKey, {
              ...existing,
              role: preferredRole,
              userType: isInternal ? 'INTERNAL' : 'EXTERNAL',
              lastLoginAt: existing.lastLoginAt || u.lastLoginAt,
            });
          }
        }
      });

      INITIAL_USERS.forEach((initU) => {
        const initKey = initU.email.toLowerCase().trim();
        if (!deletedEmails.has(initKey) && !emailToUserMap.has(initKey)) {
          emailToUserMap.set(initKey, initU);
        }
      });

      const allUsers = Array.from(emailToUserMap.values());
      setUsers(allUsers);

      // Sincroniza currentUser caso o usuário logado tenha seu cargo ou dados alterados
      setCurrentUser((curr) => {
        if (!curr) return null;
        const cleanEmail = (curr.email || '').trim().toLowerCase();
        const updated = emailToUserMap.get(cleanEmail) || allUsers.find((u) => u.uid === curr.uid);
        if (updated) {
          const isInternal = updated.role !== 'READER' || isCorporateEmailValid(updated.email);
          const effectiveRole = updated.role || curr.role;
          const effectiveType: UserType = isInternal ? 'INTERNAL' : 'EXTERNAL';
          if (curr.role !== effectiveRole || curr.userType !== effectiveType || (!curr.photoURL && updated.photoURL)) {
            return {
              ...curr,
              ...updated,
              role: effectiveRole,
              userType: effectiveType,
              photoURL: curr.photoURL || updated.photoURL,
            };
          }
        }
        return curr;
      });
    });

    // 4. Ouvinte de Ferramentas Firestore
    const unsubTools = subscribeTools((remoteTools) => {
      if (remoteTools.length > 0) {
        setTools(remoteTools);
      }
    });

    // 5. Ouvinte de Categorias Firestore (com purga definitiva de categorias apagadas)
    const unsubCategories = subscribeCategories((remoteCategories) => {
      const deletedIds = getDeletedCategoryIds();
      const validRemote = remoteCategories.filter((c) => !deletedIds.has(c.id));

      if (remoteCategories.length === 0) {
        const remainingInitial = INITIAL_CATEGORIES.filter((c) => !deletedIds.has(c.id));
        setCategories(remainingInitial);
      } else {
        const existingIds = new Set(validRemote.map((c) => c.id));
        const missingInitial = INITIAL_CATEGORIES.filter(
          (c) => !existingIds.has(c.id) && !deletedIds.has(c.id)
        );
        setCategories([...validRemote, ...missingInitial].sort((a, b) => a.orderIndex - b.orderIndex));
      }
    });

    // 6. Seed de usuários iniciais no Firestore (roda uma vez, não sobrescreve existentes)
    seedUsersToFirestore().catch((e) => console.warn('Seed de usuários falhou:', e));

    return () => {
      unsubAuth();
      unsubArticles();
      unsubUsers();
      unsubTools();
      unsubCategories();
    };
  }, []);

  // Persistência local (fallback offline)
  useEffect(() => {
    try {
      localStorage.setItem('conciliador_users_v3', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('conciliador_current_user_v3', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('conciliador_current_user_v3');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('conciliador_articles_v3', JSON.stringify(articles));
    } catch {}
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem('conciliador_tools_v5', JSON.stringify(tools));
    } catch {}
  }, [tools]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('conciliador_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const logout = async () => {
    await logoutUser();
    setIsRealFirebaseAuth(false);
    setCurrentUser(null);
    setIsPermanentSuperAdmin(false);
    localStorage.removeItem('conciliador_is_superadmin');
    setIsProfileModalOpen(false);
  };

  const loginAsUser = (user: UserProfile) => {
    const isCorp = isCorporateEmailValid(user.email);
    const hasInternalRole = Boolean(user.role && user.role !== 'READER');
    const effectiveUserType: UserType = (hasInternalRole || isCorp) ? 'INTERNAL' : 'EXTERNAL';
    const effectiveRole: UserRole = isCorp && (!user.role || user.role === 'READER') ? 'OPERATOR' : user.role;

    const updatedUser: UserProfile = {
      ...user,
      role: effectiveRole,
      userType: effectiveUserType,
      lastLoginAt: new Date().toISOString(),
    };
    setUsers((prev) =>
      prev.map((u) => (u.uid === user.uid ? updatedUser : u))
    );
    setCurrentUser(updatedUser);
    if (isSuperAdminUser(user.email)) {
      setIsPermanentSuperAdmin(true);
      localStorage.setItem('conciliador_is_superadmin', 'true');
    } else {
      setIsPermanentSuperAdmin(false);
      localStorage.removeItem('conciliador_is_superadmin');
    }
    setIsAuthModalOpen(false);
  };

  const loginAsMockAdmin = () => {
    const mockAdmin: UserProfile = {
      ...MOCK_ADMIN_USER,
      lastLoginAt: new Date().toISOString(),
    };
    setCurrentUser(mockAdmin);
    setIsPermanentSuperAdmin(true);
    localStorage.setItem('conciliador_is_superadmin', 'true');
    localStorage.setItem('conciliador_current_user_v3', JSON.stringify(mockAdmin));
    setIsAuthModalOpen(false);
  };

  const loginAsMockReader = () => {
    const mockReader: UserProfile = {
      ...MOCK_READER_USER,
      lastLoginAt: new Date().toISOString(),
    };
    setCurrentUser(mockReader);
    setIsPermanentSuperAdmin(false);
    localStorage.removeItem('conciliador_is_superadmin');
    localStorage.setItem('conciliador_current_user_v3', JSON.stringify(mockReader));
    setIsAuthModalOpen(false);
  };

  const loginWithGoogleAuth = async (customEmail?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      if (isFirebaseConfigured) {
        const res = await loginWithGoogle();
        setCurrentUser(res.user);
        if (isSuperAdminUser(res.user.email)) {
          setIsPermanentSuperAdmin(true);
          localStorage.setItem('conciliador_is_superadmin', 'true');
        } else {
          setIsPermanentSuperAdmin(false);
          localStorage.removeItem('conciliador_is_superadmin');
        }
        setIsRealFirebaseAuth(true);
        setIsAuthModalOpen(false);
        return { success: true, user: res.user };
      } else {
        const targetEmail = (customEmail || 'fulvio@conciliadorcontabil.com.br').toLowerCase();
        let user = users.find((u) => u.email.toLowerCase() === targetEmail);
        const isCorp = isCorporateEmailValid(targetEmail);
        const isFulvio = isSuperAdminUser(targetEmail);

        if (!user) {
          const preRole = getLocalPreAssignedRole(targetEmail);
          const effectiveRole: UserRole = isFulvio ? 'SUPER_ADMIN' : preRole || (isCorp ? 'OPERATOR' : 'READER');
          const effectiveUserType: UserType = (effectiveRole !== 'READER' || isCorp) ? 'INTERNAL' : 'EXTERNAL';
          user = {
            uid: `usr-google-${Date.now()}`,
            email: targetEmail,
            displayName: isFulvio ? 'Fulvio Tanure' : targetEmail.split('@')[0],
            role: effectiveRole,
            userType: effectiveUserType,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setUsers((prev) => [...prev, user!]);
        } else {
          const hasInternalRole = Boolean(user.role && user.role !== 'READER');
          const effectiveUserType: UserType = (hasInternalRole || isCorp) ? 'INTERNAL' : 'EXTERNAL';
          const effectiveRole = isCorp && (!user.role || user.role === 'READER') ? 'OPERATOR' : user.role;
          user = {
            ...user,
            role: effectiveRole,
            userType: effectiveUserType,
            lastLoginAt: new Date().toISOString(),
          };
          setUsers((prev) => prev.map((u) => (u.uid === user!.uid ? user! : u)));
        }

        setCurrentUser(user);
        if (isFulvio) {
          setIsPermanentSuperAdmin(true);
          localStorage.setItem('conciliador_is_superadmin', 'true');
        } else {
          setIsPermanentSuperAdmin(false);
          localStorage.removeItem('conciliador_is_superadmin');
        }
        setIsAuthModalOpen(false);
        return { success: true, user };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao autenticar com o Google.' };
    }
  };

  const loginWithEmail = async (
    email: string, 
    pass: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isCorp = isCorporateEmailValid(cleanEmail);
    const isMockAdmin = isSuperAdminUser(cleanEmail) || cleanEmail === 'admin' || cleanEmail.startsWith('admin@');
    const isMockReader = cleanEmail === 'leitor' || cleanEmail.startsWith('leitor@') || cleanEmail === 'leitor.teste@empresa.com.br';

    // 1. Bypass imediato para credenciais de teste local
    if (isMockAdmin) {
      loginAsMockAdmin();
      return { success: true, user: MOCK_ADMIN_USER };
    }

    if (isMockReader) {
      loginAsMockReader();
      return { success: true, user: MOCK_READER_USER };
    }

    // 2. Tentativa no Firebase (se configurado) com fallback resiliente para ambiente local
    if (isFirebaseConfigured) {
      try {
        const res = await loginWithEmailPassword(cleanEmail, pass);
        setCurrentUser(res.user);
        if (isSuperAdminUser(res.user.email)) {
          setIsPermanentSuperAdmin(true);
          localStorage.setItem('conciliador_is_superadmin', 'true');
        } else {
          setIsPermanentSuperAdmin(false);
          localStorage.removeItem('conciliador_is_superadmin');
        }
        setIsRealFirebaseAuth(true);
        return { success: true, user: res.user };
      } catch (err: any) {
        // Fallback resiliente para teste local caso o Firebase rejeite o login
        if (isCorp || isSuperAdminUser(cleanEmail)) {
          const preRole = getLocalPreAssignedRole(cleanEmail);
          const fallbackRole: UserRole = isSuperAdminUser(cleanEmail) ? 'SUPER_ADMIN' : (preRole || 'OPERATOR');
          const fallbackUser: UserProfile = {
            uid: `usr-fallback-${Date.now()}`,
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0],
            role: fallbackRole,
            userType: 'INTERNAL',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setCurrentUser(fallbackUser);
          if (fallbackUser.role === 'SUPER_ADMIN') {
            setIsPermanentSuperAdmin(true);
            localStorage.setItem('conciliador_is_superadmin', 'true');
          }
          return { success: true, user: fallbackUser };
        }
        return { success: false, error: err.message || 'Erro ao autenticar.' };
      }
    }

    // 3. Modo Local Puro
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      const isFulvio = isSuperAdminUser(cleanEmail);
      const preRole = getLocalPreAssignedRole(cleanEmail);
      const role: UserRole = isFulvio ? 'SUPER_ADMIN' : (preRole || (isCorp ? 'OPERATOR' : 'READER'));
      const userType: UserType = (role !== 'READER' || isCorp) ? 'INTERNAL' : 'EXTERNAL';
      user = {
        uid: `usr-${Date.now()}`,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        role,
        userType,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, user!]);
    } else {
      const hasInternalRole = Boolean(user.role && user.role !== 'READER');
      const effectiveUserType: UserType = (hasInternalRole || isCorp) ? 'INTERNAL' : 'EXTERNAL';
      const effectiveRole = isCorp && (!user.role || user.role === 'READER') ? 'OPERATOR' : user.role;
      user = {
        ...user,
        role: effectiveRole,
        userType: effectiveUserType,
        lastLoginAt: new Date().toISOString(),
      };
      setUsers((prev) => prev.map((u) => (u.uid === user!.uid ? user! : u)));
    }

    setCurrentUser(user);
    if (isSuperAdminUser(user.email)) {
      setIsPermanentSuperAdmin(true);
      localStorage.setItem('conciliador_is_superadmin', 'true');
    } else {
      setIsPermanentSuperAdmin(false);
      localStorage.removeItem('conciliador_is_superadmin');
    }
    return { success: true, user };
  };

  const registerClientAccount = async (
    email: string,
    displayName: string,
    pass: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isCorp = isCorporateEmailValid(cleanEmail);
    const role: UserRole = isCorp ? 'OPERATOR' : 'READER';
    const userType: UserType = isCorp ? 'INTERNAL' : 'EXTERNAL';

    if (isFirebaseConfigured) {
      try {
        const res = await registerWithEmailPassword(cleanEmail, pass, displayName, userType);
        setCurrentUser(res.user);
        setIsRealFirebaseAuth(true);
        return { success: true, user: res.user };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erro ao criar conta.' };
      }
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

    const newUser: UserProfile = {
      uid: `usr-client-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      role,
      userType,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // Simulação de Perfil para o Super Admin testar a visão de qualquer cargo sem perder o controle
  const switchRolePreview = (role: UserRole) => {
    if (!currentUser) return;
    const isExternalSim = role === 'READER';
    const updated: UserProfile = {
      ...currentUser,
      role,
      userType: isExternalSim ? 'EXTERNAL' : 'INTERNAL',
    };
    setCurrentUser(updated);
    if (isExternalSim) {
      setSelectedArticle(null);
    }
  };

  // Interação: Joinha (Like: +10 pts) e Deslike (-10 pts, teto de 50 pts por artigo) com Gatilho de Qualidade aos 5 deslikes
  const voteArticle = (articleId: string, type: 'like' | 'dislike') => {
    const userCleanEmail = currentUser?.email ? currentUser.email.toLowerCase().trim() : 'anonymous';
    const userVoteHistoryKey = `conciliador_user_votes_${userCleanEmail}`;

    let userVotesMap: Record<string, 'like' | 'dislike'> = {};
    try {
      const stored = localStorage.getItem(userVoteHistoryKey);
      if (stored) userVotesMap = JSON.parse(stored);
    } catch {}

    const articleSpecificKey = `conciliador_vote_${articleId}`;
    const previousVote = userVotesMap[articleId] || localStorage.getItem(articleSpecificKey);

    // Limite configurável de dislikes para disparo automático de Revisão Obrigatória
    const DISLIKE_REVIEW_THRESHOLD = 5;

    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          let likes = art.likesCount || 0;
          let dislikes = art.dislikesCount || 0;
          let currentStatus = art.currentStatus;
          let needsRevisionDueToDislikes = art.needsRevisionDueToDislikes || false;

          if (previousVote === type) {
            // Remove o voto ao clicar novamente
            if (type === 'like') likes = Math.max(0, likes - 1);
            else dislikes = Math.max(0, dislikes - 1);
            delete userVotesMap[articleId];
            localStorage.removeItem(articleSpecificKey);
          } else {
            // Remove voto anterior caso estivesse invertido
            if (previousVote === 'like') likes = Math.max(0, likes - 1);
            if (previousVote === 'dislike') dislikes = Math.max(0, dislikes - 1);

            if (type === 'like') {
              likes += 1;
              confetti({ particleCount: 45, spread: 60, origin: { y: 0.75 } });

              // Notificação imediata de parabéns para quem escreveu o artigo (+10 pts)
              if (art.authorEmail) {
                const voterName = currentUser?.displayName || 'Um usuário da base';
                addNotification({
                  userEmail: art.authorEmail,
                  type: 'SYSTEM',
                  title: '🎉 Parabéns! Novo Like Conquistado!',
                  message: `${voterName} curtiu seu artigo "${art.title}"! (+10 Pontos de Conhecimento adicionados)`,
                  articleId: art.id,
                  articleTitle: art.title,
                  pointsGained: 10,
                  authorName: art.authorName,
                });
              }
            } else {
              dislikes += 1;

              // GATILHO DE REVISÃO OBRIGATÓRIA (5 Deslikes acumulados)
              if (dislikes >= DISLIKE_REVIEW_THRESHOLD && art.currentStatus === 'APPROVED') {
                currentStatus = 'NEEDS_REVISION';
                needsRevisionDueToDislikes = true;

                // 1. Alerta para a fila dos Redatores e Administradores
                addNotification({
                  type: 'ARTICLE_NEEDS_ADJUSTMENT',
                  title: '🚨 Revisão Obrigatória: Artigo com 5 Deslikes',
                  message: `O manual "${art.title}" (${art.code}) acumulou ${dislikes} deslikes e foi suspenso automaticamente para Revisão Obrigatória. Os 30 pontos do revisor foram suspensos.`,
                  articleId: art.id,
                  articleTitle: art.title,
                  userEmail: art.authorEmail,
                });

                // 2. Alerta para o autor do artigo
                if (art.authorEmail) {
                  addNotification({
                    userEmail: art.authorEmail,
                    type: 'ARTICLE_NEEDS_ADJUSTMENT',
                    title: '⚠️ Manual Suspenso para Revisão Obrigatória',
                    message: `Seu manual "${art.title}" (${art.code}) atingiu o limite de 5 deslikes. Ele foi temporariamente ocultado dos leitores e encaminhado para readequação editorial. (Penalidade máxima de -50 pts aplicada).`,
                    articleId: art.id,
                    articleTitle: art.title,
                  });
                }

                // 3. Alerta para o revisor que aprovou o artigo (perda dos 30 pontos)
                if (art.approvedByReviewerEmail && art.approvedByReviewerEmail.toLowerCase() !== art.authorEmail.toLowerCase()) {
                  addNotification({
                    userEmail: art.approvedByReviewerEmail,
                    type: 'ARTICLE_NEEDS_ADJUSTMENT',
                    title: '📉 Pontos de Revisão Técnica Suspensos',
                    message: `O artigo "${art.title}", validado por você, acumulou 5 deslikes. Os +30 pontos concedidos pela revisão técnica foram temporariamente cancelados até nova correção.`,
                    articleId: art.id,
                    articleTitle: art.title,
                  });
                }
              }
            }
            userVotesMap[articleId] = type;
            localStorage.setItem(articleSpecificKey, type);
          }

          try {
            localStorage.setItem(userVoteHistoryKey, JSON.stringify(userVotesMap));
          } catch {}

          const updated: Article = {
            ...art,
            likesCount: likes,
            dislikesCount: dislikes,
            currentStatus,
            needsRevisionDueToDislikes,
          };
          if (selectedArticle?.id === articleId) setSelectedArticle(updated);

          if (isFirebaseConfigured) {
            updateArticleInFirestore(articleId, {
              likesCount: likes,
              dislikesCount: dislikes,
              currentStatus,
              needsRevisionDueToDislikes,
            }).catch((err) =>
              console.warn('Erro ao registrar voto no Firestore:', err)
            );
          }

          return updated;
        }
        return art;
      })
    );
  };

  // Estatísticas de Engajamento Bidirecional de Likes & Deslikes
  const getUserEngagementStats = (email?: string) => {
    const targetEmail = (email || currentUser?.email || '').toLowerCase().trim();
    if (!targetEmail) {
      return {
        receivedLikes: 0,
        receivedDislikes: 0,
        givenLikes: 0,
        givenDislikes: 0,
        authoredArticles: [],
      };
    }

    const authoredArticles = articles.filter(
      (a) => a.authorEmail && a.authorEmail.toLowerCase().trim() === targetEmail
    );

    const receivedLikes = authoredArticles.reduce((acc, a) => acc + (a.likesCount || 0), 0);
    const receivedDislikes = authoredArticles.reduce((acc, a) => acc + (a.dislikesCount || 0), 0);

    let givenLikes = 0;
    let givenDislikes = 0;
    try {
      const s = localStorage.getItem(`conciliador_user_votes_${targetEmail}`);
      if (s) {
        const votes: Record<string, 'like' | 'dislike'> = JSON.parse(s);
        Object.values(votes).forEach((v) => {
          if (v === 'like') givenLikes++;
          if (v === 'dislike') givenDislikes++;
        });
      }
    } catch {}

    return {
      receivedLikes,
      receivedDislikes,
      givenLikes,
      givenDislikes,
      authoredArticles,
    };
  };

  // Atualização de Foto de Perfil & Puxar Foto da Conta Google
  const updateUserPhoto = async (newPhotoURL: string): Promise<boolean> => {
    if (!currentUser) return false;
    const cleanUrl = newPhotoURL.trim();
    const updatedUser: UserProfile = { ...currentUser, photoURL: cleanUrl || undefined };

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('conciliador_current_user_v3', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Erro ao salvar usuário no localStorage:', e);
    }

    setUsers((prev) => {
      const next = prev.map((u) =>
        u.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
          ? { ...u, photoURL: cleanUrl || undefined }
          : u
      );
      try {
        localStorage.setItem('conciliador_users_v7', JSON.stringify(next));
      } catch (e) {
        console.warn('Erro ao salvar usuários no localStorage:', e);
      }
      return next;
    });

    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { photoURL: cleanUrl || null }, { merge: true });

        // Sincroniza em qualquer documento associado a este e-mail
        if (currentUser.email) {
          const emailQuery = query(collection(db, 'users'), where('email', '==', currentUser.email.toLowerCase().trim()));
          const emailSnap = await getDocs(emailQuery);
          for (const docSnap of emailSnap.docs) {
            await setDoc(docSnap.ref, { photoURL: cleanUrl || null }, { merge: true }).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Erro ao atualizar foto no Firestore:', e);
      }
    }

    if (auth?.currentUser && cleanUrl.startsWith('http')) {
      try {
        await updateProfile(auth.currentUser, { photoURL: cleanUrl });
      } catch (e) {
        console.warn('Erro ao atualizar foto no Firebase Auth:', e);
      }
    }

    return true;
  };

  const pullGooglePhoto = (): string | null => {
    if (auth?.currentUser?.photoURL) {
      return auth.currentUser.photoURL;
    }
    const providerGoogle = auth?.currentUser?.providerData?.find(
      (p) => p.photoURL && (p.providerId === 'google.com' || p.providerId.includes('google'))
    );
    if (providerGoogle?.photoURL) {
      return providerGoogle.photoURL;
    }
    return null;
  };

  // Propor Edição (Colaborador Interno propõe alteração e envia para a Fila Editorial)
  const proposeArticleEdit = (
    articleId: string,
    title: string,
    categoryId: string,
    contentHtml: string,
    tags: string[],
    accessLevel: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    proposalNote: string,
    attachments?: { id: string; name: string; size: string; url?: string }[]
  ) => {
    const cat = categories.find((c) => c.id === categoryId);
    const authorName = currentUser?.displayName || 'Colaborador';
    const proposalComment: ArticleReviewComment = {
      id: `comm-prop-${Date.now()}`,
      authorName,
      authorRole: currentUser?.role || 'OPERATOR',
      authorEmail: currentUser?.email,
      message: `[Proposta de Edição enviada por ${authorName}]: ${proposalNote || 'Revisão do conteúdo sugerida.'}`,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };

    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          const currentReviews = art.reviews || [];
          const updated: Article = {
            ...art,
            title,
            categoryId,
            categoryName: cat?.title || art.categoryName,
            contentHtml,
            tags,
            accessLevel,
            proposalNote,
            attachments: attachments || art.attachments,
            currentStatus: 'PENDING', // Vai compulsoriamente para revisão editorial
            updatedAt: new Date().toISOString(),
            reviews: [
              {
                id: `rev-prop-${Date.now()}`,
                reviewerId: currentUser?.uid || 'author',
                reviewerName: authorName,
                action: 'REQUEST_ADJUSTMENT',
                generalFeedback: `Proposta de alteração: ${proposalNote}`,
                comments: [proposalComment],
                createdAt: new Date().toISOString(),
              },
              ...currentReviews,
            ],
          };

          if (selectedArticle?.id === articleId) setSelectedArticle(updated);

          if (isFirebaseConfigured) {
            updateArticleInFirestore(articleId, {
              title,
              categoryId,
              categoryName: cat?.title,
              contentHtml,
              tags,
              accessLevel,
              proposalNote,
              currentStatus: 'PENDING',
              updatedAt: updated.updatedAt,
            }).catch((err) => console.warn('Erro ao salvar proposta:', err));
          }

          return updated;
        }
        return art;
      })
    );

    confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
  };

  // RBAC: Administrador altera o papel de um usuário (mantém a decisão antes ou depois do login)
  const updateUserRole = (uid: string, newRole: UserRole) => {
    let targetEmail: string | undefined;
    let targetUser: UserProfile | undefined;
    const isNowInternal = newRole !== 'READER';

    setUsers((prev) => {
      const found = prev.find((u) => u.uid === uid);
      targetEmail = found?.email?.trim().toLowerCase();
      targetUser = found;

      return prev.map((u) => {
        const matchesUid = u.uid === uid;
        const matchesEmail = Boolean(targetEmail && u.email?.trim().toLowerCase() === targetEmail);

        if (matchesUid || matchesEmail) {
          const effectiveUserType: UserType = isNowInternal
            ? 'INTERNAL'
            : isCorporateEmailValid(u.email)
            ? 'INTERNAL'
            : 'EXTERNAL';

          return { 
            ...u, 
            role: newRole,
            userType: effectiveUserType,
          };
        }
        return u;
      });
    });

    if (targetEmail) {
      // Registra a pré-atribuição de forma indelével localmente
      setLocalPreAssignedRole(targetEmail, newRole);
    }

    setCurrentUser((curr) => {
      if (!curr) return null;
      const matchesUid = curr.uid === uid;
      const matchesEmail = Boolean(targetEmail && curr.email?.trim().toLowerCase() === targetEmail);

      if (matchesUid || matchesEmail) {
        const effectiveUserType: UserType = isNowInternal
          ? 'INTERNAL'
          : isCorporateEmailValid(curr.email)
          ? 'INTERNAL'
          : 'EXTERNAL';

        return {
          ...curr,
          role: newRole,
          userType: effectiveUserType,
        };
      }
      return curr;
    });

    if (isFirebaseConfigured) {
      const fullUpdatedUser = targetUser ? {
        ...targetUser,
        role: newRole,
        userType: (isNowInternal ? 'INTERNAL' : 'EXTERNAL') as UserType,
      } : undefined;
      updateUserRoleInFirestore(uid, newRole, targetEmail, fullUpdatedUser).catch((err) => {
        console.warn('Erro ao atualizar papel no Firestore:', err);
      });
    }
  };

  const toggleUserStatus = (uid: string) => {
    let newStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );

    if (isFirebaseConfigured) {
      toggleUserStatusInFirestore(uid, newStatus).catch((err) => {
        console.warn('Erro ao atualizar status no Firestore:', err);
      });
    }
  };

  // Exclusão definitiva de perfil (não apenas desativar)
  const deleteUser = async (uid: string, email?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email?.trim().toLowerCase();

    // Proteção absoluta: Apenas a conta oficial do Fulvio nunca pode ser excluída
    if (cleanEmail && cleanEmail === 'fulvio@conciliadorcontabil.com.br') {
      return { success: false, error: 'O Super Administrador Fulvio Tanure não pode ser excluído.' };
    }

    // 1. Remove do estado users (garantindo desduplicação por UID e e-mail)
    setUsers((prev) => prev.filter((u) => u.uid !== uid && (cleanEmail ? u.email?.trim().toLowerCase() !== cleanEmail : true)));

    // 2. Registra na lista de exclusão permanente para nunca ressuscitar pelo INITIAL_USERS ou sementes
    if (cleanEmail) {
      addDeletedUserEmail(cleanEmail);
      removeLocalPreAssignedRole(cleanEmail);
    }

    // 3. Se for o usuário conectado na sessão ativa, encerra imediatamente o login
    if (currentUser && (currentUser.uid === uid || (cleanEmail && currentUser.email?.trim().toLowerCase() === cleanEmail))) {
      await logout();
    }

    // 4. Remove do Firestore
    if (isFirebaseConfigured) {
      await deleteUserFromFirestore(uid, cleanEmail).catch((err) => {
        console.warn('Erro ao deletar usuário do Firestore:', err);
      });
    }

    return { success: true };
  };

  // Cadastro de Colaborador no Painel Administrativo (nunca duplica e remove de excluídos caso esteja sendo readicionado)
  const addNewUser = async (email: string, displayName: string, password?: string, initialRoleParam?: UserRole) => {
    const cleanEmail = email.trim().toLowerCase();
    const initialRole: UserRole = initialRoleParam || determineInitialRole(cleanEmail);
    const userType = determineUserType(cleanEmail, initialRole);

    if (users.some((u) => u.email.toLowerCase().trim() === cleanEmail)) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

    // Se o usuário havia sido excluído anteriormente e está sendo recadastrado, desfaz a exclusão
    removeDeletedUserEmail(cleanEmail);

    // Registra a pré-atribuição de forma indelével localmente
    setLocalPreAssignedRole(cleanEmail, initialRole);

    if (isFirebaseConfigured && password) {
      try {
        await registerWithEmailPassword(cleanEmail, password, displayName, userType);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erro ao registrar usuário.' };
      }
    }

    const newUser: UserProfile = {
      uid: `usr-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      role: initialRole,
      userType: userType,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    setUsers((prev) => [...prev.filter((u) => u.email.toLowerCase().trim() !== cleanEmail), newUser]);

    if (isFirebaseConfigured) {
      import('../services/firebase').then(({ db }) => {
        if (!db) return;
        import('firebase/firestore').then(({ doc, setDoc, serverTimestamp }) => {
          setDoc(doc(db, 'users', newUser.uid), {
            ...newUser,
            serverCreatedAt: serverTimestamp(),
          }).catch((err) => console.warn('Erro ao salvar novo colaborador no Firestore:', err));

          setDoc(doc(db, 'pre_assigned_roles', cleanEmail), {
            email: cleanEmail,
            role: initialRole,
            userType,
            serverUpdatedAt: serverTimestamp(),
          }, { merge: true }).catch((err) => console.warn('Erro ao salvar pre_assigned_role no Firestore:', err));
        });
      });
    }

    return { success: true };
  };

  // Criação de Artigo
  const createArticle = (
    title: string, 
    categoryId: string, 
    contentHtml: string, 
    tags: string[], 
    accessLevel: 'INTERNAL' | 'EXTERNAL' | 'ALL' = 'INTERNAL',
    attachments?: { id: string; name: string; size: string; url?: string }[],
    subcategoryId?: string,
    subcategoryName?: string
  ) => {
    const cat = categories.find((c) => c.id === categoryId);

    // Gerar código único no formato CC-XXX para pesquisa rápida
    const existingNumbers = articles
      .map((a) => a.code)
      .filter(Boolean)
      .map((c) => {
        const m = c.match(/CC-(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 100;
    const nextCode = `CC-${maxNum + 1}`;

    const isPrivileged =
      currentUser?.role === 'SUPER_ADMIN' ||
      currentUser?.role === 'ADMIN';

    const subcat = cat?.subcategories?.find((s) => s.id === subcategoryId);

    // Conforme regra do sistema, TODO artigo criado ou editado vai obrigatoriamente para revisão editorial (PENDING)
    const newArt: Article = {
      id: `art-${Date.now()}`,
      code: nextCode,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      categoryId,
      categoryName: cat?.title || 'Geral',
      subcategoryId: subcategoryId || undefined,
      subcategoryName: subcategoryName || subcat?.title || undefined,
      authorId: currentUser?.uid || 'usr-fulvio',
      authorName: currentUser?.displayName || 'Fulvio Tanure',
      authorEmail: currentUser?.email || 'fulvio@conciliadorcontabil.com.br',
      currentStatus: 'PENDING',
      accessLevel,
      tags,
      viewCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      contentHtml,
      attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setArticles((prev) => [newArt, ...prev]);
    setSelectedArticle(newArt);

    sendArticleSubmittedEmail(newArt, newArt.authorName);
    refreshSentEmails();
    addNotification({
      type: 'ARTICLE_SUBMITTED',
      title: '📬 Manual Enviado para a Fila Editorial',
      message: `Seu manual "${newArt.title}" (${newArt.code}) foi submetido para revisão dos editores. (+50 Pontos)`,
      articleId: newArt.id,
      articleTitle: newArt.title,
      userEmail: newArt.authorEmail,
      pointsGained: 50,
    });

    if (isFirebaseConfigured) {
      saveArticleToFirestore(newArt).catch((err) => {
        console.warn('Erro ao salvar artigo no Firestore:', err);
      });
    }
  };

  // Edição de artigo
  const updateArticleContent = (
    articleId: string,
    title: string,
    categoryId: string,
    contentHtml: string,
    tags: string[],
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    attachments?: { id: string; name: string; size: string; url?: string }[],
    subcategoryId?: string,
    subcategoryName?: string
  ) => {
    const cat = categories.find((c) => c.id === categoryId);
    const subcat = cat?.subcategories?.find((s) => s.id === subcategoryId);
    // Conforme regra do sistema, qualquer edição em artigo existente o redireciona para revisão editorial (PENDING)
    const updates: Partial<Article> = {
      title,
      categoryId,
      categoryName: cat?.title,
      subcategoryId: subcategoryId || undefined,
      subcategoryName: subcategoryName || subcat?.title || undefined,
      contentHtml,
      tags,
      currentStatus: 'PENDING',
      isEditedVersion: true,
      updatedAt: new Date().toISOString(),
      ...(accessLevel ? { accessLevel } : {}),
      ...(attachments ? { attachments } : {}),
    };

    setArticles((prev) => {
      const next = prev.map((art) => {
        if (art.id === articleId) {
          const updated: Article = {
            ...art,
            ...updates,
            categoryName: cat?.title || art.categoryName,
          };
          setSelectedArticle(updated);
          return updated;
        }
        return art;
      });
      try {
        localStorage.setItem('conciliador_articles_v10', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Notifica sobre o reenvio da edição para revisão
    const targetArt = articles.find((a) => a.id === articleId);
    if (targetArt) {
      const artToNotify: Article = { ...targetArt, ...updates };
      sendArticleSubmittedEmail(artToNotify, currentUser?.displayName || targetArt.authorName);
      refreshSentEmails();
      addNotification({
        type: 'ARTICLE_SUBMITTED',
        title: '📬 Edição Enviada para Revisão Editorial',
        message: `As alterações no manual "${updates.title || targetArt.title}" (${targetArt.code}) foram enviadas para validação editorial.`,
        articleId: targetArt.id,
        articleTitle: updates.title || targetArt.title,
        userEmail: targetArt.authorEmail,
      });
    }

    if (isFirebaseConfigured) {
      updateArticleInFirestore(articleId, updates).catch((err) => {
        console.warn('Erro ao atualizar artigo no Firestore:', err);
      });
    }
  };

  // Edição e Aprovação Imediata pelo Revisor/Editor dentro da Fila Editorial
  const saveAndApproveArticle = (
    articleId: string,
    title: string,
    categoryId: string,
    contentHtml: string,
    tags: string[],
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    attachments?: { id: string; name: string; size: string; url?: string }[],
    subcategoryId?: string,
    subcategoryName?: string
  ) => {
    const cat = categories.find((c) => c.id === categoryId);
    const subcat = cat?.subcategories?.find((s) => s.id === subcategoryId);
    const targetArt = articles.find((a) => a.id === articleId);
    const isEdit = Boolean(targetArt?.isEditedVersion);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#5cb780', '#6c63ff', '#38bdf8', '#f59e0b'],
    });

    const newReview: ArticleReview = {
      id: `rev-${Date.now()}`,
      reviewerId: currentUser?.uid || 'reviewer',
      reviewerName: currentUser?.displayName || 'Revisor Editorial',
      reviewerEmail: currentUser?.email,
      action: 'APPROVE',
      generalFeedback: 'Artigo revisado, formatado e aprovado com sucesso na Fila Editorial.',
      comments: [],
      createdAt: new Date().toISOString(),
    };

    const decisionComment: ArticleReviewComment = {
      id: `comm-dec-${Date.now()}`,
      authorName: currentUser?.displayName || 'Revisor Editorial',
      authorRole: currentUser?.role || 'REVIEWER',
      authorEmail: currentUser?.email,
      message: '[Decisão Editorial]: Artigo revisado e aprovado com todas as alterações aplicadas diretamente na fila editorial.',
      isResolved: true,
      createdAt: new Date().toISOString(),
    };

    const updates: Partial<Article> = {
      title,
      categoryId,
      categoryName: cat?.title || targetArt?.categoryName,
      subcategoryId: subcategoryId || undefined,
      subcategoryName: subcategoryName || subcat?.title || undefined,
      contentHtml,
      tags,
      currentStatus: 'APPROVED',
      isEditedVersion: false,
      publishedAt: targetArt?.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedByReviewerEmail: currentUser?.email || targetArt?.approvedByReviewerEmail,
      reviews: [newReview, ...(targetArt?.reviews || [])],
      comments: [decisionComment, ...(targetArt?.comments || [])],
      needsRevisionDueToDislikes: false,
      ...(accessLevel ? { accessLevel } : {}),
      ...(attachments ? { attachments } : {}),
    };

    setArticles((prev) => {
      const next = prev.map((art) => {
        if (art.id === articleId) {
          const updated: Article = {
            ...art,
            ...updates,
          };
          setSelectedArticle(updated);
          return updated;
        }
        return art;
      });
      try {
        localStorage.setItem('conciliador_articles_v10', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (targetArt) {
      const artToNotify: Article = { ...targetArt, ...updates };
      sendArticleApprovedEmail(artToNotify, currentUser?.displayName || 'Equipe Editorial');
      refreshSentEmails();

      const authorPointsGained = isEdit ? 20 : 50;
      addNotification({
        type: 'ARTICLE_APPROVED',
        title: isEdit ? '🎉 Edição de Artigo Aprovada!' : '🎉 Parabéns! Novo Manual Publicado!',
        message: `O manual "${title}" foi ajustado e aprovado pela equipe editorial.`,
        articleId: targetArt.id,
        articleTitle: title,
        userEmail: targetArt.authorEmail,
        pointsGained: authorPointsGained,
      });

      triggerCelebration(
        '🎉 Artigo Aprovado & Publicado!',
        `O manual "${title}" foi atualizado e aprovado com sucesso!`,
        authorPointsGained
      );
    }

    if (isFirebaseConfigured) {
      updateArticleInFirestore(articleId, updates).catch((err) => {
        console.warn('Erro ao aprovar artigo no Firestore:', err);
      });
    }
  };

  // Exclusão de artigo (Acesso restrito a Administradores)
  const deleteArticle = async (articleId: string): Promise<void> => {
    const target = articles.find((a) => a.id === articleId);

    // 1. Marca no blacklist definitivo de artigos deletados
    addDeletedArticleId(articleId);

    // 2. Se o artigo excluído estiver selecionado na tela, reseta a seleção
    if (selectedArticle?.id === articleId) {
      setSelectedArticle(null);
    }

    // 3. Remove do estado em memória
    setArticles((prev) => prev.filter((art) => art.id !== articleId));

    // 4. Atualiza imediatamente o localStorage para não reaparecer no refresh
    try {
      const saved = localStorage.getItem('conciliador_articles_v10');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((c: any) => c.id !== articleId);
          localStorage.setItem('conciliador_articles_v10', JSON.stringify(filtered));
        }
      }
    } catch {}

    // 5. Exclui do Firestore em segundo plano se conectado (não bloqueia a interface)
    if (isFirebaseConfigured) {
      deleteArticleFromFirestore(articleId).catch((err) => {
        console.warn('Erro ao excluir artigo do Firestore:', err);
      });
    }

    addNotification({
      type: 'SYSTEM',
      title: '🗑️ Artigo Excluído',
      message: `O artigo "${target?.title || articleId}" foi excluído permanentemente.`,
    });
  };

  // Julgamento editorial
  const submitReview = (
    articleId: string,
    action: 'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT',
    feedback: string,
    commentMessages: string[] = []
  ) => {
    const newStatus: ArticleStatus =
      action === 'APPROVE' ? 'APPROVED' : action === 'REQUEST_ADJUSTMENT' ? 'IN_ADJUSTMENT' : 'REJECTED';

    const targetArticle = articles.find((a) => a.id === articleId);
    const isEdit = Boolean(targetArticle?.isEditedVersion);

    if (action === 'APPROVE') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#5cb780', '#6c63ff', '#38bdf8', '#f59e0b'],
      });

      if (targetArticle) {
        sendArticleApprovedEmail(targetArticle, currentUser?.displayName || 'Equipe Editorial');
        refreshSentEmails();

        // Regra do Operador:
        // Se for Edição Aprovada: +20 pts
        // Se for Artigo Novo Aprovado: +50 pts adicionais (atingindo o teto de 100 pts)
        const authorPointsGained = isEdit ? 20 : 50;
        const authorMessage = isEdit
          ? `Sua edição no manual "${targetArticle.title}" foi aprovada e publicada! (+20 Pontos de Conhecimento)`
          : `Seu manual "${targetArticle.title}" foi aprovado com sucesso! (+50 Pontos adicionais, atingindo 100 pts no artigo)`;

        addNotification({
          type: 'ARTICLE_APPROVED',
          title: isEdit ? '🎉 Edição de Artigo Aprovada!' : '🎉 Parabéns! Novo Manual Publicado!',
          message: authorMessage,
          articleId: targetArticle.id,
          articleTitle: targetArticle.title,
          userEmail: targetArticle.authorEmail,
          pointsGained: authorPointsGained,
        });

        triggerCelebration(
          isEdit ? '🎉 Edição Validada & Aprovada!' : '🎉 Parabéns pelo Artigo Aprovado!',
          authorMessage,
          authorPointsGained
        );

        // Regra do Redator (Revisor):
        // +30 pts fixos por cada artigo de terceiros que for validado e corrigido
        const reviewerEmail = currentUser?.email?.toLowerCase().trim();
        const authorEmail = targetArticle.authorEmail?.toLowerCase().trim();

        if (reviewerEmail && authorEmail && reviewerEmail !== authorEmail) {
          addNotification({
            type: 'SYSTEM',
            title: '📘 Revisão Técnica Concluída!',
            message: `Você validou e corrigiu o artigo "${targetArticle.title}" de um colega. (+30 Pontos de Conhecimento creditados no seu perfil)`,
            articleId: targetArticle.id,
            articleTitle: targetArticle.title,
            userEmail: currentUser.email,
            pointsGained: 30,
          });
        }
      }
    } else if (action === 'REQUEST_ADJUSTMENT') {
      if (targetArticle) {
        sendArticleNeedsAdjustmentEmail(targetArticle, currentUser?.displayName || 'Revisor Editorial', feedback);
        refreshSentEmails();
        addNotification({
          type: 'ARTICLE_NEEDS_ADJUSTMENT',
          title: '📝 Ajustes Solicitados no Manual',
          message: `O revisor ${currentUser?.displayName || 'Editorial'} solicitou ajustes no artigo "${targetArticle.title}": "${feedback}"`,
          articleId: targetArticle.id,
          articleTitle: targetArticle.title,
          userEmail: targetArticle.authorEmail,
        });
      }
    } else if (action === 'REJECT') {
      if (targetArticle) {
        // Regra do Operador:
        // Artigo Reprovado (Submissão Inicial): -50 pts (perde os pontos da submissão inicial, zerando o saldo)
        // Artigo Editado e Reprovado: 0 pts (não ganha pontos)
        if (!isEdit) {
          addNotification({
            type: 'SYSTEM',
            title: '❌ Submissão Inicial Reprovada',
            message: `Seu artigo "${targetArticle.title}" foi reprovado na avaliação inicial pela equipe editorial. (-50 Pontos: saldo da submissão zerado).`,
            articleId: targetArticle.id,
            articleTitle: targetArticle.title,
            userEmail: targetArticle.authorEmail,
            pointsGained: -50,
          });
        } else {
          addNotification({
            type: 'SYSTEM',
            title: '📝 Proposta de Edição Recusada',
            message: `A proposta de edição para o manual "${targetArticle.title}" não foi aprovada pela equipe editorial (0 pts adicionais). A versão anterior continua ativa.`,
            articleId: targetArticle.id,
            articleTitle: targetArticle.title,
            userEmail: targetArticle.authorEmail,
            pointsGained: 0,
          });
        }
      }
    }

    const newReview: ArticleReview = {
      id: `rev-${Date.now()}`,
      reviewerId: currentUser?.uid || 'reviewer',
      reviewerName: currentUser?.displayName || 'Revisor',
      reviewerEmail: currentUser?.email,
      action,
      generalFeedback: feedback,
      comments: commentMessages.map((msg, idx) => ({
        id: `c-${Date.now()}-${idx}`,
        authorName: currentUser?.displayName || 'Revisor',
        authorRole: currentUser?.role || 'REVIEWER',
        message: msg,
        isResolved: false,
        createdAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    };

    setArticles((prev) => {
      const next = prev.map((art) => {
        if (art.id === articleId) {
          const currentComments = art.comments || [];
          const decisionComment: ArticleReviewComment | null = feedback.trim()
            ? {
                id: `comm-dec-${Date.now()}`,
                authorName: currentUser?.displayName || 'Revisor',
                authorRole: currentUser?.role || 'REVIEWER',
                authorEmail: currentUser?.email,
                message: `[Decisão: ${action === 'APPROVE' ? 'Aprovado' : action === 'REQUEST_ADJUSTMENT' ? 'Ajustes Solicitados' : 'Rejeitado'}]: ${feedback.trim()}`,
                isResolved: action === 'APPROVE',
                createdAt: new Date().toISOString(),
              }
            : null;

          const updatedComments = decisionComment ? [...currentComments, decisionComment] : currentComments;

          const editCount = action === 'APPROVE' && isEdit
            ? (art.editApprovedCount || 0) + 1
            : (art.editApprovedCount || 0);

          const updated: Article = {
            ...art,
            currentStatus: newStatus,
            publishedAt: action === 'APPROVE' ? (art.publishedAt || new Date().toISOString()) : art.publishedAt,
            updatedAt: new Date().toISOString(),
            reviews: [newReview, ...(art.reviews || [])],
            comments: updatedComments,
            approvedByReviewerEmail: action === 'APPROVE' ? (currentUser?.email || art.approvedByReviewerEmail) : art.approvedByReviewerEmail,
            isEditedVersion: false,
            editApprovedCount: editCount,
            initialSubmissionRejected: action === 'REJECT' && !isEdit,
            needsRevisionDueToDislikes: action === 'APPROVE' ? false : art.needsRevisionDueToDislikes,
          };

          if (selectedArticle?.id === articleId) {
            setSelectedArticle(updated);
          }

          if (isFirebaseConfigured) {
            updateArticleInFirestore(articleId, {
              title: updated.title,
              contentHtml: updated.contentHtml,
              currentStatus: newStatus,
              publishedAt: updated.publishedAt,
              updatedAt: updated.updatedAt,
              reviews: updated.reviews,
              comments: updated.comments,
              approvedByReviewerEmail: updated.approvedByReviewerEmail,
              isEditedVersion: updated.isEditedVersion,
              editApprovedCount: updated.editApprovedCount,
              initialSubmissionRejected: updated.initialSubmissionRejected,
              needsRevisionDueToDislikes: updated.needsRevisionDueToDislikes,
            }).catch((err) => {
              console.warn('Erro ao atualizar review no Firestore:', err);
            });
          }

          return updated;
        }
        return art;
      });

      try {
        localStorage.setItem('conciliador_articles_v10', JSON.stringify(next));
      } catch {}

      return next;
    });
  };

  // Adiciona mensagem no balão de conversa entre revisor e criador
  const addArticleComment = (articleId: string, message: string) => {
    if (!message.trim()) return;
    const authorName = currentUser?.displayName || 'Usuário';
    const authorRole = currentUser?.role || 'OPERATOR';
    const authorEmail = currentUser?.email;

    const newComment: ArticleReviewComment = {
      id: `comm-${Date.now()}`,
      authorName,
      authorRole,
      authorEmail,
      message: message.trim(),
      isResolved: false,
      createdAt: new Date().toISOString(),
    };

    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          const currentComments = art.comments || [];
          const updated: Article = {
            ...art,
            comments: [...currentComments, newComment],
            updatedAt: new Date().toISOString(),
          };
          if (selectedArticle?.id === articleId) {
            setSelectedArticle(updated);
          }
          if (isFirebaseConfigured) {
            updateArticleInFirestore(articleId, {
              comments: updated.comments,
              updatedAt: updated.updatedAt,
            }).catch(console.warn);
          }
          return updated;
        }
        return art;
      })
    );
  };

  // Incremento de visualizações reais
  const incrementArticleView = (articleId: string) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          const updated = {
            ...art,
            viewCount: (art.viewCount || 0) + 1,
          };
          if (selectedArticle?.id === articleId) {
            setSelectedArticle(updated);
          }
          if (isFirebaseConfigured) {
            updateArticleInFirestore(articleId, { viewCount: updated.viewCount }).catch(console.warn);
          }
          return updated;
        }
        return art;
      })
    );
  };

  const addTool = (toolData: Omit<ToolItem, 'id'>) => {
    const newTool: ToolItem = {
      ...toolData,
      id: `tool-${Date.now()}`,
    };
    setTools((prev) => [...prev, newTool]);

    if (isFirebaseConfigured) {
      saveToolToFirestore(newTool).catch((err) => {
        console.warn('Erro ao salvar ferramenta no Firestore:', err);
      });
    }
  };

  // Métricas de Desempenho Editorial (Estritamente Colaboradores Internos da Conciliador Contábil)
  const getUserPerformances = (): UserPerformance[] => {
    return users
      .filter((u) => isInternalUser(u))
      .map((u) => {
        const userArticles = articles.filter((a) => a.authorEmail.toLowerCase() === u.email.toLowerCase());
        const submittedCount = userArticles.length;
        const approvedCount = userArticles.filter((a) => a.currentStatus === 'APPROVED').length;
        const adjustmentCount = userArticles.filter((a) => a.currentStatus === 'IN_ADJUSTMENT').length;
        const rejectedCount = userArticles.filter((a) => a.currentStatus === 'REJECTED').length;
        const conversionRate = submittedCount > 0 ? Math.round((approvedCount / submittedCount) * 100) : 0;

        return {
          userId: u.uid,
          userName: u.displayName,
          userEmail: u.email,
          submittedCount,
          approvedCount,
          adjustmentCount,
          rejectedCount,
          conversionRate,
        };
      });
  };

  const saveFirebaseKeys = (config: FirebaseConfig) => {
    saveFirebaseConfig(config);
  };

  const resetFirebaseKeys = () => {
    clearFirebaseConfig();
  };

  // Gestão de Módulos / Categorias da Base de Conhecimento
  const createCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const slug = catData.slug || catData.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCategory: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      slug,
      accessLevel: catData.accessLevel || 'ALL',
      articleCount: 0,
      orderIndex: catData.orderIndex || (categories.length + 1),
    };

    removeDeletedCategoryId(newCategory.id);
    setCategories((prev) => [...prev, newCategory]);
    if (isFirebaseConfigured) {
      await saveCategoryToFirestore(newCategory).catch(console.warn);
    }

    addNotification({
      type: 'SYSTEM',
      title: '📁 Novo Módulo Criado',
      message: `O módulo "${newCategory.title}" foi criado com sucesso.`,
    });

    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    removeDeletedCategoryId(id);
    let updatedCat: Category | null = null;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          updatedCat = { ...cat, ...updates };
          return updatedCat;
        }
        return cat;
      })
    );

    if (updatedCat && isFirebaseConfigured) {
      await saveCategoryToFirestore(updatedCat).catch(console.warn);
    }

    if (updates.title) {
      setArticles((prev) =>
        prev.map((art) => (art.categoryId === id ? { ...art, categoryName: updates.title! } : art))
      );
    }

    addNotification({
      type: 'SYSTEM',
      title: '📁 Módulo Atualizado',
      message: `As alterações no módulo foram salvas com sucesso.`,
    });
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const target = categories.find((c) => c.id === id);

    // 1. Marca no blacklist definitivo de categorias deletadas
    addDeletedCategoryId(id);

    // 2. Se a categoria excluída estiver selecionada na tela, reseta a seleção
    if (selectedCategory === id) {
      setSelectedCategory(null);
    }

    // 3. Remove do estado em memória
    setCategories((prev) => prev.filter((cat) => cat.id !== id));

    // 4. Atualiza imediatamente o localStorage para não reaparecer no refresh
    try {
      const saved = localStorage.getItem('conciliador_categories_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((c: any) => c.id !== id);
          localStorage.setItem('conciliador_categories_v2', JSON.stringify(filtered));
        }
      }
    } catch {}

    // 5. Desvincula artigos que pertenciam a este módulo
    setArticles((prev) =>
      prev.map((art) =>
        art.categoryId === id
          ? { ...art, categoryId: '', categoryName: 'Sem Categoria' }
          : art
      )
    );

    // 6. Exclui do Firestore se conectado
    if (isFirebaseConfigured) {
      deleteCategoryFromFirestore(id).catch(console.warn);
    }

    addNotification({
      type: 'SYSTEM',
      title: '🗑️ Módulo Excluído',
      message: `O módulo "${target?.title || id}" foi excluído permanentemente.`,
    });
  };

  const seedFirebase = async () => {
    return await seedFirestoreWithMovideskData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn: Boolean(currentUser),
        isPermanentSuperAdmin,
        switchRolePreview,
        isRealFirebaseAuth,
        logout,
        loginWithGoogleAuth,
        loginWithEmail,
        registerClientAccount,
        loginAsUser,
        loginAsMockAdmin,
        loginAsMockReader,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        users,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        addNewUser,
        categories,
        createCategory,
        updateCategory,
        deleteCategory,
        articles,
        selectedCategory,
        setSelectedCategory,
        selectedArticle,
        setSelectedArticle,
        voteArticle,
        proposeArticleEdit,
        createArticle,
        updateArticleContent,
        saveAndApproveArticle,
        deleteArticle,
        submitReview,
        addArticleComment,
        incrementArticleView,
        tools,
        addTool,
        getUserPerformances,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        theme,
        toggleTheme,
        firebaseConfig,
        isFirebaseConfigured,
        saveFirebaseKeys,
        resetFirebaseKeys,
        isConfigModalOpen,
        setIsConfigModalOpen,
        seedFirebase,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        sentEmails,
        refreshSentEmails,
        clearSentEmailsList,
        getUserGamification,
        celebrationModal,
        triggerCelebration,
        closeCelebrationModal,
        appDialog,
        showDialog,
        closeDialog,
        updateUserPhoto,
        pullGooglePhoto,
        getUserEngagementStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
