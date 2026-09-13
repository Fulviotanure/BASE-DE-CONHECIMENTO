import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { UserProfile, Article, Category, ToolItem, UserRole, UserType, ArticleStatus, UserPerformance } from '../types';
import { INITIAL_USERS, INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_TOOLS } from '../data/initialSeed';
import { getSavedFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConfigured, type FirebaseConfig } from '../services/firebase';
import { 
  subscribeAuthState, 
  logoutUser, 
  isCorporateEmailValid, 
  registerWithEmailPassword, 
  loginWithGoogle,
  determineUserType,
  isAdminUser,
  isSuperAdminUser,
  determineInitialRole
} from '../services/authService';
import { 
  subscribeArticles, 
  saveArticleToFirestore, 
  updateArticleInFirestore, 
  subscribeUsers, 
  updateUserRoleInFirestore, 
  toggleUserStatusInFirestore, 
  subscribeTools, 
  saveToolToFirestore, 
  subscribeCategories,
  seedFirestoreWithMovideskData
} from '../services/firestoreService';

interface AppContextType {
  // Usuário Atual & Autenticação
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isLoggedIn: boolean;
  isPermanentSuperAdmin: boolean;
  switchRolePreview: (role: UserRole) => void;
  isRealFirebaseAuth: boolean;
  logout: () => Promise<void>;
  loginWithGoogleAuth: () => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  loginAsUser: (user: UserProfile) => void;
  
  // Modais de Autenticação e Perfil
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Usuários (Painel Administrativo)
  users: UserProfile[];
  updateUserRole: (uid: string, newRole: UserRole) => void;
  toggleUserStatus: (uid: string) => void;
  addNewUser: (email: string, displayName: string, password?: string) => Promise<{ success: boolean; error?: string }>;

  // Base de Conhecimento
  categories: Category[];
  articles: Article[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (art: Article | null) => void;

  // Interações com Artigo (Likes/Dislikes & Proposta de Edição)
  voteArticle: (articleId: string, type: 'like' | 'dislike') => void;
  proposeArticleEdit: (
    articleId: string,
    title: string,
    categoryId: string,
    contentHtml: string,
    tags: string[],
    accessLevel: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    proposalNote: string
  ) => void;

  // Fluxo Editorial
  createArticle: (
    title: string, 
    categoryId: string, 
    contentHtml: string, 
    tags: string[], 
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL'
  ) => void;
  updateArticleContent: (
    articleId: string, 
    title: string, 
    categoryId: string, 
    contentHtml: string, 
    tags: string[], 
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL'
  ) => void;
  submitReview: (
    articleId: string, 
    action: 'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT', 
    feedback: string, 
    commentMessages?: string[]
  ) => void;
  
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lista de Usuários reais da Conciliador Contábil
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('conciliador_users_v5');
    if (!saved) {
      localStorage.setItem('conciliador_users_v5', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      const parsed: UserProfile[] = JSON.parse(saved);
      // Garante que todos os 33 membros da equipe estejam presentes
      const existingEmails = new Set(parsed.map((u) => u.email.toLowerCase()));
      const missingUsers = INITIAL_USERS.filter((u) => !existingEmails.has(u.email.toLowerCase()));
      const merged = [...parsed, ...missingUsers];
      return merged;
    } catch {
      return INITIAL_USERS;
    }
  });

  // O usuário começa deslogado (null) a menos que haja sessão salva
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('conciliador_current_user_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Estado fixo de Super Administrador (Fulvio permanece com o switcher liberado permanentemente)
  const [isPermanentSuperAdmin, setIsPermanentSuperAdmin] = useState<boolean>(() => {
    const savedAdmin = localStorage.getItem('conciliador_is_superadmin');
    if (savedAdmin === 'true') return true;
    const saved = localStorage.getItem('conciliador_current_user_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.email?.toLowerCase().includes('fulvio');
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (currentUser?.email?.toLowerCase().includes('fulvio')) {
      setIsPermanentSuperAdmin(true);
      localStorage.setItem('conciliador_is_superadmin', 'true');
    }
  }, [currentUser]);

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('conciliador_articles_v5');
    if (!saved) {
      localStorage.setItem('conciliador_articles_v5', JSON.stringify(INITIAL_ARTICLES));
      return INITIAL_ARTICLES;
    }
    try {
      const parsed: Article[] = JSON.parse(saved);
      // Garante que os novos artigos do Fulvio (CC-101 e CC-102) estejam presentes
      const existingIds = new Set(parsed.map((a) => a.id));
      const missingArticles = INITIAL_ARTICLES.filter((a) => !existingIds.has(a.id));
      const combined = [...missingArticles, ...parsed];
      // Garante que cada artigo possua a propriedade code única
      const withCodes = combined.map((a, idx) => ({
        ...a,
        code: a.code || `CC-${101 + idx}`,
      }));
      return withCodes;
    } catch {
      return INITIAL_ARTICLES;
    }
  });

  // Persistência local contínua
  useEffect(() => {
    localStorage.setItem('conciliador_users_v5', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('conciliador_articles_v5', JSON.stringify(articles));
  }, [articles]);

  const [tools, setTools] = useState<ToolItem[]>(() => {
    const saved = localStorage.getItem('conciliador_tools_v3');
    return saved ? JSON.parse(saved) : INITIAL_TOOLS;
  });

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
  // Sincronização em Tempo Real com Firestore
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // 1. Ouvinte de Autenticação
    const unsubAuth = subscribeAuthState((firebaseUser, profile) => {
      if (firebaseUser && profile) {
        setCurrentUser(profile);
        setIsRealFirebaseAuth(true);
      } else {
        setIsRealFirebaseAuth(false);
      }
    });

    // 2. Ouvinte de Artigos Firestore
    const unsubArticles = subscribeArticles((remoteArticles) => {
      if (remoteArticles.length > 0) {
        setArticles(remoteArticles);
      }
    });

    // 3. Ouvinte de Usuários Firestore
    const unsubUsers = subscribeUsers((remoteUsers) => {
      if (remoteUsers.length > 0) {
        setUsers(remoteUsers);
      }
    });

    // 4. Ouvinte de Ferramentas Firestore
    const unsubTools = subscribeTools((remoteTools) => {
      if (remoteTools.length > 0) {
        setTools(remoteTools);
      }
    });

    // 5. Ouvinte de Categorias Firestore
    const unsubCategories = subscribeCategories((remoteCategories) => {
      if (remoteCategories.length > 0) {
        setCategories(remoteCategories);
      }
    });

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
    localStorage.setItem('conciliador_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('conciliador_current_user_v3', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('conciliador_current_user_v3');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('conciliador_articles_v3', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('conciliador_tools_v3', JSON.stringify(tools));
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
    setCurrentUser(user);
    if (user.email.toLowerCase().includes('fulvio')) {
      setIsPermanentSuperAdmin(true);
      localStorage.setItem('conciliador_is_superadmin', 'true');
    }
    setIsAuthModalOpen(false);
  };

  const loginWithGoogleAuth = async (): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      if (isFirebaseConfigured) {
        const res = await loginWithGoogle();
        setCurrentUser(res.user);
        if (res.user.email.toLowerCase().includes('fulvio')) {
          setIsPermanentSuperAdmin(true);
          localStorage.setItem('conciliador_is_superadmin', 'true');
        }
        setIsRealFirebaseAuth(true);
        setIsAuthModalOpen(false);
        return { success: true, user: res.user };
      } else {
        const defaultGoogleUser = users.find((u) => u.email.includes('fulvio')) || users[0];
        setCurrentUser(defaultGoogleUser);
        setIsPermanentSuperAdmin(true);
        localStorage.setItem('conciliador_is_superadmin', 'true');
        setIsAuthModalOpen(false);
        return { success: true, user: defaultGoogleUser };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao autenticar com o Google.' };
    }
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
  };

  // Interação: Joinha (Like) e Deslike
  const voteArticle = (articleId: string, type: 'like' | 'dislike') => {
    const storageKey = `conciliador_vote_${articleId}`;
    const previousVote = localStorage.getItem(storageKey);

    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          let likes = art.likesCount || 0;
          let dislikes = art.dislikesCount || 0;

          if (previousVote === type) {
            // Remove o voto ao clicar novamente
            if (type === 'like') likes = Math.max(0, likes - 1);
            else dislikes = Math.max(0, dislikes - 1);
            localStorage.removeItem(storageKey);
          } else {
            // Remove voto anterior caso estivesse invertido
            if (previousVote === 'like') likes = Math.max(0, likes - 1);
            if (previousVote === 'dislike') dislikes = Math.max(0, dislikes - 1);

            if (type === 'like') {
              likes += 1;
              confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
            } else {
              dislikes += 1;
            }
            localStorage.setItem(storageKey, type);
          }

          const updated = { ...art, likesCount: likes, dislikesCount: dislikes };
          if (selectedArticle?.id === articleId) setSelectedArticle(updated);

          if (isFirebaseConfigured) {
            updateArticleInFirestore(articleId, { likesCount: likes, dislikesCount: dislikes }).catch((err) =>
              console.warn('Erro ao registrar voto no Firestore:', err)
            );
          }

          return updated;
        }
        return art;
      })
    );
  };

  // Propor Edição (Colaborador Interno propõe alteração e envia para a Fila Editorial)
  const proposeArticleEdit = (
    articleId: string,
    title: string,
    categoryId: string,
    contentHtml: string,
    tags: string[],
    accessLevel: 'INTERNAL' | 'EXTERNAL' | 'ALL',
    proposalNote: string
  ) => {
    const cat = categories.find((c) => c.id === categoryId);
    const authorName = currentUser?.displayName || 'Colaborador';
    const proposalComment = {
      id: `c-prop-${Date.now()}`,
      authorName,
      authorRole: currentUser?.role || 'OPERATOR',
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

  // RBAC: Administrador altera o papel de um usuário
  const updateUserRole = (uid: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const updated = { ...u, role: newRole };
          if (currentUser && u.uid === currentUser.uid) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (isFirebaseConfigured) {
      updateUserRoleInFirestore(uid, newRole).catch((err) => {
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

  // Cadastro de Colaborador no Painel Administrativo
  const addNewUser = async (email: string, displayName: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const userType = determineUserType(cleanEmail);
    const initialRole: UserRole = determineInitialRole(cleanEmail);

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

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
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  // Criação de Artigo
  const createArticle = (
    title: string, 
    categoryId: string, 
    contentHtml: string, 
    tags: string[],
    accessLevel: 'INTERNAL' | 'EXTERNAL' | 'ALL' = 'INTERNAL'
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

    const newArt: Article = {
      id: `art-${Date.now()}`,
      code: nextCode,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      categoryId,
      categoryName: cat?.title || 'Geral',
      authorId: currentUser?.uid || 'usr-fulvio',
      authorName: currentUser?.displayName || 'Fulvio Tanure',
      authorEmail: currentUser?.email || 'fulvio@conciliadorcontabil.com.br',
      currentStatus: 'PENDING',
      accessLevel,
      tags,
      viewCount: 1,
      likesCount: 0,
      dislikesCount: 0,
      contentHtml,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setArticles((prev) => [newArt, ...prev]);
    setSelectedArticle(newArt);

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
    accessLevel?: 'INTERNAL' | 'EXTERNAL' | 'ALL'
  ) => {
    const cat = categories.find((c) => c.id === categoryId);
    const updates: Partial<Article> = {
      title,
      categoryId,
      categoryName: cat?.title,
      contentHtml,
      tags,
      currentStatus: 'PENDING',
      updatedAt: new Date().toISOString(),
      ...(accessLevel ? { accessLevel } : {}),
    };

    setArticles((prev) =>
      prev.map((art) => {
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
      })
    );

    if (isFirebaseConfigured) {
      updateArticleInFirestore(articleId, updates).catch((err) => {
        console.warn('Erro ao atualizar artigo no Firestore:', err);
      });
    }
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

    if (action === 'APPROVE') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5cb780', '#6c63ff', '#38bdf8'],
      });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      reviewerId: currentUser?.uid || 'reviewer',
      reviewerName: currentUser?.displayName || 'Revisor',
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

    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          const updated: Article = {
            ...art,
            currentStatus: newStatus,
            publishedAt: action === 'APPROVE' ? new Date().toISOString() : art.publishedAt,
            updatedAt: new Date().toISOString(),
            reviews: [newReview, ...(art.reviews || [])],
          };

          if (selectedArticle?.id === articleId) {
            setSelectedArticle(updated);
          }

          if (isFirebaseConfigured) {
            updateArticleInFirestore(articleId, {
              currentStatus: newStatus,
              publishedAt: updated.publishedAt,
              updatedAt: updated.updatedAt,
              reviews: updated.reviews,
            }).catch((err) => {
              console.warn('Erro ao atualizar review no Firestore:', err);
            });
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

  // Métricas
  const getUserPerformances = (): UserPerformance[] => {
    return users.map((u) => {
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
        loginAsUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        users,
        updateUserRole,
        toggleUserStatus,
        addNewUser,
        categories,
        articles,
        selectedCategory,
        setSelectedCategory,
        selectedArticle,
        setSelectedArticle,
        voteArticle,
        proposeArticleEdit,
        createArticle,
        updateArticleContent,
        submitReview,
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
