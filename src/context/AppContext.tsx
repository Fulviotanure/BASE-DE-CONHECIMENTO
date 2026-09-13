import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { UserProfile, Article, Category, ToolItem, UserRole, ArticleStatus, UserPerformance } from '../types';
import { INITIAL_USERS, INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_TOOLS } from '../data/initialSeed';
import { getSavedFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConfigured, type FirebaseConfig } from '../services/firebase';
import { 
  subscribeAuthState, 
  logoutUser, 
  isCorporateEmailValid, 
  registerWithEmailPassword, 
  loginWithGoogle,
  determineUserType,
  isAdminUser
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

  // Fluxo Editorial
  createArticle: (title: string, categoryId: string, contentHtml: string, tags: string[]) => void;
  updateArticleContent: (articleId: string, title: string, categoryId: string, contentHtml: string, tags: string[]) => void;
  submitReview: (articleId: string, action: 'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT', feedback: string, commentMessages?: string[]) => void;
  
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
  // Lista de Usuários reais da Conciliador Contábil (usando chave v2 para forçar atualização)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('conciliador_users_v2');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // O usuário começa deslogado (null) a menos que haja sessão salva
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('conciliador_current_user_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('conciliador_articles_v2');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [tools, setTools] = useState<ToolItem[]>(() => {
    const saved = localStorage.getItem('conciliador_tools_v2');
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
    localStorage.setItem('conciliador_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('conciliador_current_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('conciliador_current_user_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('conciliador_articles_v2', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('conciliador_tools_v2', JSON.stringify(tools));
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
    setIsProfileModalOpen(false);
  };

  const loginAsUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogleAuth = async (): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      if (isFirebaseConfigured) {
        const res = await loginWithGoogle();
        setCurrentUser(res.user);
        setIsRealFirebaseAuth(true);
        setIsAuthModalOpen(false);
        return { success: true, user: res.user };
      } else {
        // Fallback local: Se o projeto estiver sem chaves remotas, simula login corporativo do Rodrigo (Admin)
        const defaultGoogleUser = users.find((u) => u.email.includes('rodrigo')) || users[0];
        setCurrentUser(defaultGoogleUser);
        setIsAuthModalOpen(false);
        return { success: true, user: defaultGoogleUser };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao autenticar com o Google.' };
    }
  };

  // Simulação de Perfil para testes de permissão
  const switchRolePreview = (role: UserRole) => {
    if (!currentUser) return;
    const targetUser = users.find((u) => u.role === role && u.status === 'ACTIVE') || {
      ...currentUser,
      role,
    };
    setCurrentUser(targetUser);
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

  // Cadastro de Colaborador no Painel
  const addNewUser = async (email: string, displayName: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const userType = determineUserType(cleanEmail);
    const initialRole: UserRole = isAdminUser(cleanEmail) ? 'ADMIN' : 'OPERATOR';

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
  const createArticle = (title: string, categoryId: string, contentHtml: string, tags: string[]) => {
    const cat = categories.find((c) => c.id === categoryId);
    const newArt: Article = {
      id: `art-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      categoryId,
      categoryName: cat?.title || 'Geral',
      authorId: currentUser?.uid || 'usr-anonymous',
      authorName: currentUser?.displayName || 'Colaborador',
      authorEmail: currentUser?.email || 'contato@conciliadorcontabil.com.br',
      currentStatus: 'PENDING',
      accessLevel: 'INTERNAL',
      tags,
      viewCount: 1,
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
    tags: string[]
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
