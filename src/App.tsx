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
import { ModuleManagementView } from './components/views/ModuleManagementView';
import { ArticleEditorView } from './components/views/ArticleEditorView';
import { LoginPageView } from './components/views/LoginPageView';
import { SearchSpotlightModal } from './components/search/SearchSpotlightModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { CelebrationModal } from './components/gamification/CelebrationModal';
import { CustomDialogModal } from './components/layout/CustomDialogModal';
import { AiAssistantBot } from './components/ai/AiAssistantBot';
import { isInternalUser, isExternalUser, isCorporateEmailValid } from './services/authService';
import type { Article } from './types';

const MainApp: React.FC = () => {
  const { 
    currentUser, 
    setSelectedArticle, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    setCurrentUser 
  } = useApp();

  const isCorporate = Boolean(currentUser?.email && isCorporateEmailValid(currentUser.email));
  const isInternal = isInternalUser(currentUser);
  const isExternal = isExternalUser(currentUser);

  // Define a view inicial: sempre 'kb' se logado (unificado para leitores e colaboradores internos)
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
      // Leitores e clientes externos NUNCA acessam telas administrativas, de edição ou ferramentas
      if (isExternal && (activeView === 'dashboard' || activeView === 'queue' || activeView === 'users' || activeView === 'my-articles' || activeView === 'tools' || activeView === 'editor')) {
        setActiveView('kb');
      } else if (activeView === 'landing' || activeView === 'external-portal') {
        setActiveView('kb');
      }
    }
  }, [currentUser, isExternal, activeView]);

  const [isEditorialQueueMode, setIsEditorialQueueMode] = useState(false);

  const handleOpenNewArticle = () => {
    setPreviousView(activeView);
    setEditingArticle(null);
    setIsProposalMode(false);
    setIsEditorialQueueMode(false);
    setActiveView('editor');
  };

  const handleEditArticle = (art: Article) => {
    setPreviousView(activeView);
    setEditingArticle(art);
    setIsProposalMode(false);
    setIsEditorialQueueMode(false);
    setActiveView('editor');
  };

  const handleEditFromEditorialQueue = (art: Article) => {
    setPreviousView('queue');
    setEditingArticle(art);
    setIsProposalMode(false);
    setIsEditorialQueueMode(true);
    setActiveView('editor');
  };

  const handleProposeArticleEdit = (art: Article) => {
    setPreviousView(activeView);
    setEditingArticle(art);
    setIsProposalMode(true);
    setIsEditorialQueueMode(false);
    setActiveView('editor');
  };

  const handleViewArticle = (art: Article) => {
    setSelectedArticle(art);
    setActiveView('kb');
  };

  const isLanding = activeView === 'landing' || !currentUser;

  return (
    <div className="app-container">
      {/* Sidebar Navigation - unificada para leitores e colaboradores internos */}
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

          {/* Base de Conhecimento Oficial:
              Unificada para colaboradores e leitores.
              A página do leitor é a mesma página inicial, sem menus de configuração.
          */}
          {(activeView === 'kb' || activeView === 'external-portal') && (
            <KnowledgeBaseView 
              onOpenNewArticle={handleOpenNewArticle} 
              onProposeEdit={handleProposeArticleEdit}
              onEditArticle={handleEditArticle}
              onOpenModuleManagement={() => setActiveView('modules')}
            />
          )}
          {activeView === 'my-articles' && isInternal && (
            <MyArticlesView
              onOpenNewArticle={handleOpenNewArticle}
              onEditArticle={handleEditArticle}
              onViewArticle={handleViewArticle}
            />
          )}
          {activeView === 'queue' && isInternal && (
            <EditorialQueueView onEditArticle={handleEditFromEditorialQueue} />
          )}
          {activeView === 'tools' && isInternal && <ToolsHubView />}
          {(activeView === 'dashboard' || activeView === 'dashboard-articles' || activeView === 'dashboard-users') && isInternal && (
            <DashboardView 
              onSelectArticle={handleViewArticle}
              initialTab={activeView === 'dashboard-users' ? 'users' : 'articles'}
              onTabChange={(tab) => setActiveView(tab === 'users' ? 'dashboard-users' : 'dashboard-articles')}
            />
          )}
          {activeView === 'users' && isInternal && <UserManagementView />}
          {activeView === 'modules' && isInternal && (
            <ModuleManagementView onNavigateToKnowledgeBase={() => setActiveView('kb')} />
          )}
          {activeView === 'editor' && (
            <ArticleEditorView
              editingArticle={editingArticle}
              isProposalMode={isProposalMode}
              isEditorialQueueMode={isEditorialQueueMode}
              onClose={() => {
                setActiveView(previousView || (isInternal ? 'kb' : 'my-articles'));
                setIsEditorialQueueMode(false);
              }}
            />
          )}
        </main>
      </div>

      {/* Search Modal (Ctrl + K) */}
      <SearchSpotlightModal
        onSelectArticle={(art) => {
          setSelectedArticle(art);
          setActiveView('kb');
        }}
        onSelectTool={() => {
          if (isInternal) {
            setActiveView('tools');
          }
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

      {/* Celebration Modal (Parabéns + Gamificação + Confetes) */}
      <CelebrationModal />

      {/* Janelas de Diálogo Amigáveis do Sistema (Alerts & Confirmações customizadas) */}
      <CustomDialogModal />

      {/* Robô Assistente de IA - ConciliBot (Canto Inferior Direito) */}
      {!isLanding && (
        <AiAssistantBot onSelectArticle={handleViewArticle} />
      )}
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
