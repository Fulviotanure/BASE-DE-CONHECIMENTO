import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Database,
  ShieldCheck,
  UserCheck,
  Sparkles,
  SlidersHorizontal,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveView }) => {
  const {
    currentUser,
    switchRolePreview,
    theme,
    toggleTheme,
    setIsSearchOpen,
    isFirebaseConfigured,
    setIsConfigModalOpen,
    setIsAuthModalOpen,
    isRealFirebaseAuth,
    logout,
  } = useApp();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRolePreview(e.target.value as UserRole);
  };

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
          onClick={() => setActiveView('kb')}
          onError={(e) => {
            // Fallback text if image not loaded
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Base de Conhecimento
            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', fontWeight: 700 }}>
              INTERNO
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Firebase Status Badge */}
        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          title={isFirebaseConfigured ? 'Firebase Conectado' : 'Clique para configurar chaves do Firebase'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            color: isFirebaseConfigured ? '#10b981' : '#f59e0b',
            border: `1px solid ${isFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            cursor: 'pointer',
          }}
        >
          <Database size={13} />
          <span>{isFirebaseConfigured ? 'Firebase Ativo' : 'Firebase Local'}</span>
        </button>

        {/* Role Simulator Switcher (Para o Fulvio testar permissões) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <SlidersHorizontal size={14} color="var(--color-secondary)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Perfil:</span>
          <select
            value={currentUser.role}
            onChange={handleRoleChange}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ADMIN" style={{ background: '#1e2227' }}>👑 Admin (Fulvio)</option>
            <option value="REVIEWER" style={{ background: '#1e2227' }}>✍️ Editor / Revisor</option>
            <option value="OPERATOR" style={{ background: '#1e2227' }}>👷 Operador (Comum)</option>
          </select>
        </div>

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
          }}
        >
          {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6c63ff" />}
        </button>

        {/* User Info Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '6px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #5cb780 0%, #6c63ff 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(92, 183, 128, 0.3)',
            }}
          >
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {currentUser.displayName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {currentUser.role === 'ADMIN' ? 'Superadministrador' : currentUser.role === 'REVIEWER' ? 'Editor / Revisor' : 'Operador'}
            </span>
          </div>

          {/* Botão Entrar ou Sair */}
          {isRealFirebaseAuth ? (
            <button
              type="button"
              onClick={logout}
              title="Encerrar Sessão Firebase"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} />
              <span>Sair</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              title="Acessar com E-mail e Senha Corporativos"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 11px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: '#1a1d20',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(92, 183, 128, 0.25)',
              }}
            >
              <LogIn size={13} />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
