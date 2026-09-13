import React from 'react';
import { 
  X, 
  LogOut, 
  User, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Clock, 
  SlidersHorizontal, 
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

export const UserProfileModal: React.FC = () => {
  const { 
    currentUser, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    logout, 
    switchRolePreview,
    users
  } = useApp();

  if (!isProfileModalOpen || !currentUser) return null;

  const isInternal = currentUser.userType === 'INTERNAL' || currentUser.email.includes('conciliadorcontabil.com.br');
  const isAdmin = currentUser.role === 'ADMIN';

  const roleLabel = {
    ADMIN: '👑 Superadministrador / Admin',
    REVIEWER: '✍️ Editor & Revisor',
    OPERATOR: isInternal ? '👷 Operador Interno' : '👤 Cliente / Usuário Externo',
  }[currentUser.role];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRolePreview(e.target.value as UserRole);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={() => setIsProfileModalOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div 
          style={{ 
            height: '6px', 
            width: '100%', 
            background: isInternal 
              ? 'linear-gradient(90deg, #5cb780, #38bdf8, #6c63ff)' 
              : 'linear-gradient(90deg, #38bdf8, #6c63ff, #f59e0b)' 
          }} 
        />

        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-sidebar)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="var(--color-primary)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                Perfil da Conta
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                Conciliador Contábil • Central de Acesso
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Avatar & Display Name Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
            }}
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid var(--color-primary)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #5cb780 0%, #6c63ff 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(92, 183, 128, 0.3)',
                }}
              >
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  {currentUser.displayName}
                </h4>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: isInternal ? 'rgba(92, 183, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: isInternal ? '#5cb780' : '#38bdf8',
                    border: `1px solid ${isInternal ? 'rgba(92, 183, 128, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                    textTransform: 'uppercase',
                  }}
                >
                  {isInternal ? 'Colaborador Interno' : 'Usuário Externo'}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Mail size={13} />
                <span style={{ wordBreak: 'break-all' }}>{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>
                Nível de Acesso
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {roleLabel}
              </span>
            </div>

            <div
              style={{
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>
                Status da Conta
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                  {currentUser.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Simulator for Admin */}
          {isAdmin && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                background: 'rgba(108, 99, 255, 0.08)',
                border: '1px solid rgba(108, 99, 255, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SlidersHorizontal size={14} color="#6c63ff" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Simulador de Permissão (Admin)
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                  Testar visão de equipe
                </span>
              </div>

              <select
                value={currentUser.role}
                onChange={handleRoleChange}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="ADMIN">👑 Administrador (Acesso Total)</option>
                <option value="REVIEWER">✍️ Editor & Revisor (Fila Editorial)</option>
                <option value="OPERATOR">👷 Operador Comum (Leitura e Redação)</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              <LogOut size={16} />
              <span>Sair da Conta (Encerrar Sessão)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
