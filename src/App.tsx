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

  const isCorporate = Boolean(currentUser?.email?.toLowerCase().endsWith('@conciliadorcontabil.com.br'));
  const isExternal = currentUser?.role === 'READER' || currentUser?.userType === 'EXTERNAL' || !isCorporate;
  const isInternal = !isExternal && isCorporate;

  // Define a view inicial: sempre 'kb' se logado (unificado para cliente, leitor e interno)
  const [activeView, setActiveView] = useState<string>(() => {
    if (!currentUser) return 'landing';
    return 'kb';
  });

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isProposalMode, setIsProposalMode] = useState(false);
  const [previousView, setPreviousView] = useState<string>('kb');

  // Sincroniza a visão ativa quando o usuário faz login ou logout ou altera papel
  useEffect(() => {
    if (!currentUser) {
      setActiveView('landing');
    } else {
      // Clientes e leitores externos NUNCA podem acessar Ferramentas, Dashboard, Fila, Usuários ou Edição interna
      if (isExternal && (activeView === 'dashboard' || activeView === 'queue' || activeView === 'users' || activeView === 'my-articles' || activeView === 'tools' || activeView === 'editor')) {
        setActiveView('kb');
      } else if (activeView === 'landing' || activeView === 'external-portal') {
        setActiveView('kb');
      }
    }
  }, [currentUser, isExternal, activeView]);

  const handleOpenNewArticle = () => {
    setPreviousView(activeView);
    setEditingArticle(null);
    setIsProposalMode(false);
    setActiveView('editor');
  };

  const handleEditArticle = (art: Article) => {
    setPreviousView(activeView);
    setEditingArticle(art);
    setIsProposalMode(false);
    setActiveView('editor');
  };

  const handleProposeArticleEdit = (art: Article) => {
    setPreviousView(activeView);
    setEditingArticle(art);
    setIsProposalMode(true);
    setActiveView('editor');
  };

  const handleViewArticle = (art: Article) => {
    setSelectedArticle(art);
    setActiveView('kb');
  };

  const isLanding = activeView === 'landing' || !currentUser;

  return (
    <div className="app-container">
      {/* Sidebar Navigation - unificada para leitores, clientes e colaboradores internos */}
      {!isLanding && (
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
              onAccessExternalPortal={() => setActiveView('kb')} 
            />
          )}

          {/* Base de Conhecimento:
              - Para CLIENTES e VISITANTES (isExternal): renderiza o portal moderno ExternalPortalView (com background, busca elegante, cards e leitura expandida)
              - Para COLABORADORES INTERNOS (isInternal): renderiza KnowledgeBaseView
          */}
          {(activeView === 'kb' || activeView === 'external-portal') && (
            isExternal ? (
              <ExternalPortalView 
                onSelectArticle={(art) => setSelectedArticle(art)}
              />
            ) : (
              <KnowledgeBaseView 
                onOpenNewArticle={handleOpenNewArticle} 
                onProposeEdit={handleProposeArticleEdit}
                onEditArticle={handleEditArticle}
              />
            )
          )}
          {activeView === 'my-articles' && isInternal && (
            <MyArticlesView
              onOpenNewArticle={handleOpenNewArticle}
              onEditArticle={handleEditArticle}
              onViewArticle={handleViewArticle}
            />
          )}
          {activeView === 'queue' && isInternal && (
            <EditorialQueueView onEditArticle={handleEditArticle} />
          )}
          {activeView === 'tools' && isInternal && <ToolsHubView />}
          {activeView === 'dashboard' && isInternal && <DashboardView />}
          {activeView === 'users' && isInternal && <UserManagementView />}
          {activeView === 'editor' && (
            <ArticleEditorView
              editingArticle={editingArticle}
              isProposalMode={isProposalMode}
              onClose={() => setActiveView(previousView || (isInternal ? 'kb' : 'my-articles'))}
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
