import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { UserProfile, Article, Category, ToolItem, UserRole, ArticleStatus, UserPerformance } from '../types';
import { INITIAL_USERS, INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_TOOLS } from '../data/initialSeed';
import { getSavedFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConfigured, type FirebaseConfig } from '../services/firebase';
import { subscribeAuthState, logoutUser, isCorporateEmailValid, registerWithEmailPassword } from '../services/authService';
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
  // Usuário Atual & Simulação de Perfil
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRolePreview: (role: UserRole) => void;
  isRealFirebaseAuth: boolean;
  logout: () => Promise<void>;
  
  // Modal de Autenticação
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

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

  // Configuração do Firebase
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
  // Inicializa com dados do localStorage ou dados padrão
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('conciliador_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Fulvio é o superadministrador padrão
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return users.find((u) => u.email.includes('fulvio')) || users[0];
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('conciliador_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [tools, setTools] = useState<ToolItem[]>(() => {
    const saved = localStorage.getItem('conciliador_tools');
    return saved ? JSON.parse(saved) : INITIAL_TOOLS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Estados de Modais
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRealFirebaseAuth, setIsRealFirebaseAuth] = useState(false);

  // Tema Dark/Light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('conciliador_theme') as 'dark' | 'light') || 'dark';
  });

  // Firebase Config
  const [firebaseConfig] = useState<FirebaseConfig | null>(getSavedFirebaseConfig);

  // ----------------------------------------------------
  // Sincronização em Tempo Real com Firebase Firestore
  // ----------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // 1. Ouvinte de Autenticação Firebase
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
    localStorage.setItem('conciliador_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('conciliador_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('conciliador_tools', JSON.stringify(tools));
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
    // Volta para o perfil inicial
    setCurrentUser(users.find((u) => u.email.includes('fulvio')) || users[0]);
  };

  // Simulação de Perfil para o Fulvio testar como Revisor ou Operador
  const switchRolePreview = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role && u.status === 'ACTIVE') || {
      ...currentUser,
      role,
    };
    setCurrentUser(targetUser);
  };

  // RBAC: Fulvio altera o papel de um usuário
  const updateUserRole = (uid: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const updated = { ...u, role: newRole };
          if (u.uid === currentUser.uid) {
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

  // Validação estrita de domínio corporativo: apenas @conciliadorcontabil.com.br
  const addNewUser = async (email: string, displayName: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isCorporateEmailValid(cleanEmail)) {
      return {
        success: false,
        error: 'Acesso restrito! O e-mail precisa pertencer ao domínio @conciliadorcontabil.com.br',
      };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

    if (isFirebaseConfigured && password) {
      try {
        const res = await registerWithEmailPassword(cleanEmail, password, displayName);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erro ao registrar no Firebase.' };
      }
    }

    const newUser: UserProfile = {
      uid: `usr-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      role: 'OPERATOR', // Novo usuário sempre começa como Operador comum
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  // Criação de Artigo pelo Operador: entra compulsoriamente como PENDENTE
  const createArticle = (title: string, categoryId: string, contentHtml: string, tags: string[]) => {
    const cat = categories.find((c) => c.id === categoryId);
    const newArt: Article = {
      id: `art-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      categoryId,
      categoryName: cat?.title || 'Geral',
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorEmail: currentUser.email,
      currentStatus: 'PENDING', // Fila de revisão imediata
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

  // Edição de artigo: quando o autor edita artigo em ajuste, retorna para PENDENTE
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
      currentStatus: 'PENDING', // Reenvia para fila de revisão
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

  // Julgamento editorial (Revisor / Admin)
  const submitReview = (
    articleId: string,
    action: 'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT',
    feedback: string,
    commentMessages: string[] = []
  ) => {
    const newStatus: ArticleStatus =
      action === 'APPROVE' ? 'APPROVED' : action === 'REQUEST_ADJUSTMENT' ? 'IN_ADJUSTMENT' : 'REJECTED';

    if (action === 'APPROVE') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5cb780', '#6c63ff', '#ffffff'],
        });
      } catch {
        // Confetti fallback
      }
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      reviewerId: currentUser.uid,
      reviewerName: currentUser.displayName,
      action,
      generalFeedback: feedback,
      comments: commentMessages.map((msg, i) => ({
        id: `c-${Date.now()}-${i}`,
        authorName: currentUser.displayName,
        authorRole: currentUser.role,
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

  // Cálculo de Métricas e Desempenho por Usuário
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
        switchRolePreview,
        isRealFirebaseAuth,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
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
