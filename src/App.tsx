import React, { useState } from 'react';
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
import { SearchSpotlightModal } from './components/search/SearchSpotlightModal';
import { FirebaseConfigModal } from './components/firebase/FirebaseConfigModal';
import { AuthModal } from './components/auth/AuthModal';
import type { Article } from './types';

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('kb');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const { setSelectedArticle, isAuthModalOpen, setIsAuthModalOpen, setCurrentUser } = useApp();

  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setActiveView('editor');
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticle(art);
    setActiveView('editor');
  };

  const handleViewArticle = (art: Article) => {
    setSelectedArticle(art);
    setActiveView('kb');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewArticle={handleOpenNewArticle}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header activeView={activeView} setActiveView={setActiveView} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeView === 'kb' && <KnowledgeBaseView onOpenNewArticle={handleOpenNewArticle} />}
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
              onClose={() => setActiveView('my-articles')}
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
          setActiveView('tools');
        }}
      />

      {/* Firebase Keys Configuration Modal */}
      <FirebaseConfigModal />

      {/* Corporate Email/Password Authentication Modal */}
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
