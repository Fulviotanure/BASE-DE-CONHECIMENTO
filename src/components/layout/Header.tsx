import React from 'react';
import {
  Search,
  Moon,
  Sun,
  User,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isInternalUser, isExternalUser } from '../../services/authService';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { UserRankBadge } from '../gamification/UserRankBadge';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const {
    currentUser,
    theme,
    toggleTheme,
    setIsSearchOpen,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setSelectedArticle,
  } = useApp();

  const isInternal = isInternalUser(currentUser);
  const isExternal = isExternalUser(currentUser);

  const handleGoHome = () => {
    setSelectedArticle(null);
    if (currentUser) {
      setActiveView('kb');
    } else {
      setActiveView('landing');
    }
  };

  return (
    <header
      style={{
        height: '64px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Logo & Title (Retorna à Página Inicial e Fecha Artigos Abertos) */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', userSelect: 'none' }}
        onClick={handleGoHome}
        title="Retornar à página inicial da Base de Conhecimento"
      >
        <img
          src={theme === 'light' ? '/logo-light.svg' : '/conciliador-logo.png'}
          alt="Conciliador Contábil"
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Base de Conhecimento
            <span 
              style={{ 
                fontSize: '0.68rem', 
                padding: '2px 7px', 
                borderRadius: '4px', 
                background: isInternal ? 'var(--color-primary-subtle)' : 'rgba(56, 189, 248, 0.15)', 
                color: isInternal ? 'var(--color-primary)' : '#38bdf8', 
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {currentUser ? (isInternal ? 'INTERNO' : 'LEITOR') : 'INSTITUCIONAL'}
            </span>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Conciliador Contábil</span>
        </div>
      </div>

      {/* Espaçador central (Barra de pesquisa movida para baixo do título na Base de Conhecimento) */}
      <div style={{ flex: 1 }} />

      {/* Actions & User State */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Rank Badge (Patente & Pontos) */}
        {currentUser && (
          <UserRankBadge email={currentUser.email} size="sm" showPoints={true} />
        )}

        {/* Central de Notificações no App & Histórico de E-mails */}
        {currentUser && <NotificationCenter />}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title="Alternar Tema Claro/Escuro"
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6c63ff" />}
        </button>

        {/* User State */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-primary)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #5cb780 0%, #6c63ff 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(92, 183, 128, 0.3)',
                }}
              >
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {currentUser.displayName}
              </span>
              <span style={{ fontSize: '0.68rem', color: isInternal ? 'var(--color-primary)' : '#38bdf8', fontWeight: 700 }}>
                {currentUser.role === 'SUPER_ADMIN'
                  ? '👑 Super Admin'
                  : currentUser.role === 'ADMIN'
                  ? '🛡️ Administrador'
                  : currentUser.role === 'REVIEWER'
                  ? '✍️ Revisor'
                  : currentUser.role === 'OPERATOR'
                  ? '👷 Operador'
                  : '👤 Leitor / Cliente'}
              </span>
            </div>

            <ChevronDown size={14} color="var(--text-subtle)" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            title="Entrar com Conta Google ou E-mail e Senha"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              color: '#1a1d20',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(92, 183, 128, 0.3)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <LogIn size={15} />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
};
