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

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveView }) => {
  const {
    currentUser,
    theme,
    toggleTheme,
    setIsSearchOpen,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
  } = useApp();

  const isInternal = currentUser?.userType === 'INTERNAL' || currentUser?.email.includes('conciliadorcontabil.com.br');

  return (
    <header
      style={{
        height: '68px',
        background: 'var(--bg-sidebar)',
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
      {/* Brand Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img
          src="/conciliador-logo.png"
          alt="Conciliador Contábil"
          style={{ height: '36px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
          onClick={() => {
            if (currentUser && isInternal) {
              setActiveView('kb');
            } else if (currentUser && !isInternal) {
              setActiveView('external-portal');
            } else {
              setActiveView('landing');
            }
          }}
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
              {currentUser ? (isInternal ? 'INTERNO' : 'PORTAL CLIENTE') : 'INSTITUCIONAL'}
            </span>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Conciliador Contábil</span>
        </div>
      </div>

      {/* Global Search Bar trigger */}
      <div style={{ flex: 1, maxWidth: '440px', margin: '0 24px' }}>
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={16} color="var(--color-primary)" />
            <span>Buscar manuais, regras, layouts, erros...</span>
          </div>
          <kbd
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-subtle)',
            }}
          >
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Actions & User State */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* User State: If logged in, show Profile Trigger; If NOT logged in, show "Entrar" button */}
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
                {currentUser.role === 'ADMIN'
                  ? '👑 Administrador'
                  : currentUser.role === 'REVIEWER'
                  ? '✍️ Revisor'
                  : isInternal
                  ? '👷 Operador'
                  : '👤 Cliente'}
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
