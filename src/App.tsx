import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { KnowledgeBaseView } from './components/views/KnowledgeBaseView';
import { MyArticlesView } from './components/views/MyArticlesView';
import { EditorialQueueView } from './components/views/EditorialQueueView';
import { ToolsHubView } from './components/views/ToolsHubView';
import { DashboardView } from './components/views/DashboardView';
import { UserManagementView } from './components/views/UserManagementView';
import { ArticleEditorView } from './components/views/ArticleEditorView';
import { LoginPageView } from './components/views/LoginPageView';
import { ExternalPortalView } from './components/views/ExternalPortalView';
import { SearchSpotlightModal } from './components/search/SearchSpotlightModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import type { Article } from './types';

const MainApp: React.FC = () => {
  const { 
    currentUser, 
    setSelectedArticle, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    setCurrentUser 
  } = useApp();

  const isExternal = currentUser?.role === 'READER' || currentUser?.userType === 'EXTERNAL';
  const isInternal = !isExternal && (currentUser?.userType === 'INTERNAL' || Boolean(currentUser?.email?.includes('conciliadorcontabil.com.br')));

  // Define a view inicial: se não houver usuário, vai para landing page de apresentação
  const [activeView, setActiveView] = useState<string>(() => {
    if (!currentUser) return 'landing';
    return isInternal ? 'kb' : 'external-portal';
  });

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isProposalMode, setIsProposalMode] = useState(false);

  // Sincroniza a visão ativa quando o usuário faz login ou logout
  useEffect(() => {
    if (!currentUser) {
      setActiveView('landing');
    } else {
      if (isInternal && (activeView === 'landing' || activeView === 'external-portal')) {
        setActiveView('kb');
      } else if (!isInternal && activeView === 'landing') {
        setActiveView('external-portal');
      }
    }
  }, [currentUser, isInternal]);

  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setIsProposalMode(false);
    setActiveView('editor');
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticle(art);
    setIsProposalMode(false);
    setActiveView('editor');
  };

  const handleProposeArticleEdit = (art: Article) => {
    setEditingArticle(art);
    setIsProposalMode(true);
    setActiveView('editor');
  };

  const handleViewArticle = (art: Article) => {
    setSelectedArticle(art);
    if (isInternal) {
      setActiveView('kb');
    } else {
      setActiveView('external-portal');
    }
  };

  const isLanding = activeView === 'landing' || !currentUser;

  return (
    <div className="app-container">
      {/* Sidebar Navigation - apenas para colaboradores internos (oculta para clientes e na landing page) */}
      {!isLanding && !isExternal && (
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenNewArticle={handleOpenNewArticle}
        />
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {!isLanding && <Header activeView={activeView} setActiveView={setActiveView} />}

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {/* Tela de Login Inicial Minimalista */}
          {activeView === 'landing' && (
            <LoginPageView 
              onAccessExternalPortal={() => setActiveView('external-portal')} 
            />
          )}

          {/* Portal Externo para Clientes e Visitantes */}
          {activeView === 'external-portal' && (
            <ExternalPortalView 
              onBackToPresentation={() => setActiveView('landing')}
              onSelectArticle={(art) => {
                setSelectedArticle(art);
              }}
            />
          )}

          {/* Visões Internas (Colaboradores) */}
          {activeView === 'kb' && (
            <KnowledgeBaseView 
              onOpenNewArticle={handleOpenNewArticle} 
              onProposeEdit={handleProposeArticleEdit}
            />
          )}
          {activeView === 'my-articles' && (
            <MyArticlesView
              onOpenNewArticle={handleOpenNewArticle}
              onEditArticle={handleEditArticle}
              onViewArticle={handleViewArticle}
            />
          )}
          {activeView === 'queue' && <EditorialQueueView />}
          {activeView === 'tools' && <ToolsHubView />}
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'users' && <UserManagementView />}
          {activeView === 'editor' && (
            <ArticleEditorView
              editingArticle={editingArticle}
              isProposalMode={isProposalMode}
              onClose={() => setActiveView(isInternal ? 'kb' : 'my-articles')}
            />
          )}
        </main>
      </div>

      {/* Search Modal (Ctrl + K) */}
      <SearchSpotlightModal
        onSelectArticle={(art) => {
          setSelectedArticle(art);
          if (isInternal) {
            setActiveView('kb');
          } else {
            setActiveView('external-portal');
          }
        }}
        onSelectTool={() => {
          setActiveView('tools');
        }}
      />

      {/* User Profile Modal (com opção de Sair da Conta) */}
      <UserProfileModal />

      {/* Authentication Modal (Google Account + E-mail e Senha) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
