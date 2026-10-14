import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  LogOut, 
  User, 
  Mail, 
  Clock, 
  SlidersHorizontal, 
  CheckCircle2, 
  Sparkles,
  Camera,
  Trash2,
  Trophy,
  BookOpen,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isInternalUser, isExternalUser, isCorporateEmailValid, isSuperAdminUser } from '../../services/authService';
import { UserRankBadge } from '../gamification/UserRankBadge';
import type { UserRole } from '../../types';

// Utilitário de compressão e redimensionamento leve de avatar (evita estouro de cota e travamentos)
function compressAvatarImage(file: File, maxSize = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Falha ao processar arquivo de imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

export const UserProfileModal: React.FC = () => {
  const { 
    currentUser, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    logout, 
    switchRolePreview,
    isPermanentSuperAdmin,
    updateUserPhoto,
    pullGooglePhoto,
    getUserEngagementStats,
    getUserGamification,
    setSelectedArticle,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFeedback, setPhotoFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  React.useEffect(() => {
    if (isProfileModalOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const isInternal = isInternalUser(currentUser);
  const canSimulate = isPermanentSuperAdmin || currentUser.role === 'SUPER_ADMIN';

  const roleLabel = {
    SUPER_ADMIN: isSuperAdminUser(currentUser.email) ? '👑 Super Administrador (Fixo)' : '👑 Super Administrador',
    ADMIN: '🛡️ Administrador',
    REVIEWER: '✍️ Editor & Revisor',
    OPERATOR: '👷 Operador Interno',
    READER: '👤 Leitor (Cliente Externo)',
  }[currentUser.role] || currentUser.role;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRolePreview(e.target.value as UserRole);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Upload e compressão automática de imagem (resolução otimizada ~25KB para nunca travar)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setPhotoFeedback({ type: 'error', text: 'A imagem deve ter no máximo 12MB.' });
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const compressedDataUrl = await compressAvatarImage(file, 256, 0.85);
      await updateUserPhoto(compressedDataUrl);
      setPhotoFeedback({ type: 'success', text: 'Foto de perfil atualizada com sucesso!' });
      setTimeout(() => setPhotoFeedback(null), 4000);
    } catch (err: any) {
      console.error('Erro ao atualizar foto:', err);
      setPhotoFeedback({ type: 'error', text: 'Não foi possível carregar a imagem selecionada.' });
      setTimeout(() => setPhotoFeedback(null), 4000);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remover foto personalizada
  const handleRemovePhoto = async () => {
    await updateUserPhoto('');
    setPhotoFeedback({ type: 'info', text: 'Foto personalizada removida. Avatar padrão ativado.' });
    setTimeout(() => setPhotoFeedback(null), 4000);
  };

  // Gamificação e Engajamento de Likes/Deslikes
  const gamification = getUserGamification(currentUser.email);
  const stats = getUserEngagementStats(currentUser.email);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onClick={() => setIsProfileModalOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: 'min(92vh, 850px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(92, 183, 128, 0.18)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faixa decorativa superior com gradiente festivo */}
        <div 
          style={{ 
            height: '6px', 
            width: '100%', 
            flexShrink: 0,
            background: isInternal 
              ? 'linear-gradient(90deg, #5cb780, #38bdf8, #6c63ff, #f59e0b)' 
              : 'linear-gradient(90deg, #38bdf8, #6c63ff, #f59e0b)' 
          }} 
        />

        {/* Barra de Título */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-sidebar)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(92, 183, 128, 0.15)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                Perfil da Conta & Central do Usuário
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Conciliador Contábil • Painel de Identidade, Gamificação e Engajamento
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
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            title="Fechar (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback de alteração de foto */}
        {photoFeedback && (
          <div
            style={{
              padding: '10px 20px',
              background: photoFeedback.type === 'success' 
                ? 'rgba(16, 185, 129, 0.15)' 
                : photoFeedback.type === 'error' 
                ? 'rgba(239, 68, 68, 0.15)' 
                : 'rgba(56, 189, 248, 0.15)',
              borderBottom: `1px solid ${
                photoFeedback.type === 'success' ? '#10b981' : photoFeedback.type === 'error' ? '#ef4444' : '#38bdf8'
              }`,
              color: photoFeedback.type === 'success' ? '#10b981' : photoFeedback.type === 'error' ? '#ef4444' : '#38bdf8',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{photoFeedback.text}</span>
            <button
              type="button"
              onClick={() => setPhotoFeedback(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Oculto de Arquivo de Foto */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/png, image/jpeg, image/jpg, image/webp" 
          onChange={handleFileSelect} 
        />

        {/* Corpo do Modal em Grid Duplo Responsivo */}
        <div 
          style={{ 
            padding: '22px 24px', 
            overflowY: 'auto', 
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* ========================================================================= */}
          {/* COLUNA ESQUERDA: Identidade, Foto, Papel & Simulador                      */}
          {/* ========================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Card de Avatar & Foto */}
            <div
              style={{
                padding: '20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              {/* Foto de Perfil Interativa - Clique direto na imagem para alterar */}
              <div style={{ position: 'relative', width: '104px', height: '104px', margin: '0 auto 10px auto' }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  title="Clique na foto para escolher uma nova imagem"
                  style={{
                    position: 'relative',
                    width: '104px',
                    height: '104px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    border: '3px solid var(--color-primary)',
                    boxShadow: '0 6px 20px rgba(92, 183, 128, 0.35)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #5cb780 0%, #6c63ff 100%)',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Camada indicativa de clique/troca de foto */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.45)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      color: '#ffffff',
                      opacity: isUploadingPhoto ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isUploadingPhoto) e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      if (!isUploadingPhoto) e.currentTarget.style.opacity = '0';
                    }}
                  >
                    <Camera size={22} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                      {isUploadingPhoto ? 'Salvando...' : 'Trocar foto'}
                    </span>
                  </div>
                </div>

                {/* Ícone flutuante de câmera no canto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Trocar foto de perfil"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '30px',
                    height: '30px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    border: '2px solid var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
                  }}
                >
                  <Camera size={15} />
                </button>
              </div>

              {/* Dica de clique na foto & Opção de remover */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
                  Clique na foto para alterar
                </span>
                {currentUser.photoURL && (
                  <div style={{ marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'underline',
                        padding: '2px 6px',
                      }}
                      title="Restaurar avatar padrão"
                    >
                      <Trash2 size={11} />
                      Remover foto
                    </button>
                  </div>
                )}
              </div>

              {/* Nome e Badge de Tipo */}
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                {currentUser.displayName}
              </h4>

              <div style={{ marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: isInternal ? 'rgba(92, 183, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: isInternal ? '#5cb780' : '#38bdf8',
                    border: `1px solid ${isInternal ? 'rgba(92, 183, 128, 0.35)' : 'rgba(56, 189, 248, 0.35)'}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isInternal ? 'Colaborador Interno' : 'Usuário Externo'}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <Mail size={13} />
                <span style={{ wordBreak: 'break-all' }}>{currentUser.email}</span>
              </div>
            </div>

            {/* Informações de Nível de Acesso e Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div
                style={{
                  padding: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>
                  Nível de Acesso
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.2, display: 'block' }}>
                  {roleLabel}
                </span>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>
                  Status da Conta
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
                    {currentUser.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulador de Permissão (Disponível estritamente para o Super Administrador Fixo) */}
            {canSimulate && (
              <div
                style={{
                  padding: '14px',
                  background: 'rgba(92, 183, 128, 0.08)',
                  border: '1px solid rgba(92, 183, 128, 0.28)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SlidersHorizontal size={14} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Simulador de Cargo (Super Admin)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.66rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    Controle Fixo
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
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="SUPER_ADMIN">👑 Super Administrador (Acesso Irrestrito)</option>
                  <option value="ADMIN">🛡️ Administrador (Gestão de Usuários & Equipe)</option>
                  <option value="REVIEWER">✍️ Revisor / Editor (Fila Editorial)</option>
                  <option value="OPERATOR">👷 Operador Interno (Leitura e Redação)</option>
                  <option value="READER">👤 Leitor / Usuário (Cliente Externo)</option>
                </select>
              </div>
            )}

            {/* Botão de Logout */}
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
                fontSize: '0.86rem',
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

          {/* ========================================================================= */}
          {/* COLUNA DIREITA: Gamificação, Parabéns, Likes/Deslikes e Artigos           */}
          {/* ========================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Bloco 1: Patente, Nível & Mensagem de Parabéns (Apenas Usuários Internos) */}
            {isInternal && (
              <div>
                <UserRankBadge user={currentUser} email={currentUser.email} size="lg" showProgress={true} />

                {/* Banner de Parabéns Pelo Status & Pontuação Conquistada */}
                <div
                  style={{
                    marginTop: '10px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(92, 183, 128, 0.12), rgba(108, 99, 255, 0.12))',
                    border: '1px solid rgba(92, 183, 128, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <Sparkles size={22} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--text-main)' }}>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '0.86rem' }}>
                      🎉 Parabéns pela sua dedicação, {currentUser.displayName}!
                    </strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                      Você já acumulou <strong>{gamification.points} pontos</strong> de conhecimento e atingiu a patente <strong>{gamification.rank.title} {gamification.rank.badge}</strong>!
                      {gamification.nextRank 
                        ? ` Faltam ${gamification.pointsToNextRank} pts e ${gamification.articlesToNextRank} artigo(s) aprovado(s) para a próxima patente (${gamification.nextRank.title}).`
                        : ' 👑 Você conquistou o nível máximo de Titã de Toda Sabedoria e continua acumulando pontos infinitamente!'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bloco 2: Painel Bidirecional de Likes & Deslikes */}
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={16} color="#f59e0b" />
                <span>Engajamento & Avaliações da Comunidade</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {/* 1. Likes e Deslikes Recebidos (Para seus artigos) */}
                <div 
                  style={{ 
                    padding: '16px', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.03em' }}>
                    Recebidos nos seus Artigos
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>👍</span>
                      <div>
                        <strong style={{ fontSize: '1.25rem', color: '#10b981', display: 'block', lineHeight: 1, fontWeight: 900 }}>
                          {stats.receivedLikes}
                        </strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Likes</span>
                      </div>
                    </div>

                    <div style={{ height: '28px', width: '1px', background: 'var(--border-subtle)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>👎</span>
                      <div>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1, fontWeight: 900 }}>
                          {stats.receivedDislikes}
                        </strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Deslikes</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4 }}>
                    {stats.receivedLikes > 0 
                      ? `👏 Parabéns! Seu conteúdo já recebeu ${stats.receivedLikes} curtida(s) de reconhecimento da equipe.`
                      : 'Seus artigos ainda não receberam curtidas. Publique manuais de qualidade para ganhar likes!'}
                  </div>
                </div>

                {/* 2. Likes e Deslikes Dados por Você */}
                <div 
                  style={{ 
                    padding: '16px', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.03em' }}>
                    Dados por Você
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>👍</span>
                      <div>
                        <strong style={{ fontSize: '1.25rem', color: '#38bdf8', display: 'block', lineHeight: 1, fontWeight: 900 }}>
                          {stats.givenLikes}
                        </strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Likes</span>
                      </div>
                    </div>

                    <div style={{ height: '28px', width: '1px', background: 'var(--border-subtle)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>👎</span>
                      <div>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1, fontWeight: 900 }}>
                          {stats.givenDislikes}
                        </strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Deslikes</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4 }}>
                    {stats.givenLikes > 0 
                      ? `Você já curtiu e incentivou ${stats.givenLikes} manual(is) de outros colegas na base!` 
                      : 'Curta manuais que te ajudaram durante as rotinas para prestigiar os autores!'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: Histórico de Artigos Escritos por Você & Pontuação Conquistada */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} color="var(--color-primary)" />
                  <span>Manuais de sua Autoria ({stats.authoredArticles.length})</span>
                </div>

                {stats.authoredArticles.length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    🎉 {stats.authoredArticles.filter(a => a.currentStatus === 'APPROVED').length} publicados
                  </span>
                )}
              </div>

              {stats.authoredArticles.length === 0 ? (
                <div 
                  style={{ 
                    padding: '24px', 
                    textAlign: 'center', 
                    background: 'var(--bg-card)', 
                    border: '1px dashed var(--border-subtle)', 
                    borderRadius: 'var(--radius-md)' 
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>
                    {isInternal 
                      ? 'Você ainda não redigiu nenhum manual. Crie seu primeiro artigo para somar +100 pontos de conhecimento e subir de patente no ranking corporativo!'
                      : 'Como leitor, você tem acesso irrestrito para consultar todos os artigos e tutoriais da base!'}
                  </span>
                </div>
              ) : (
                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    maxHeight: '250px', 
                    overflowY: 'auto', 
                    paddingRight: '4px' 
                  }}
                >
                  {stats.authoredArticles.map((art) => {
                    const isApproved = art.currentStatus === 'APPROVED';
                    const isPending = art.currentStatus === 'PENDING';
                    const isInAdjustment = art.currentStatus === 'IN_ADJUSTMENT';

                    return (
                      <div
                        key={art.id}
                        style={{
                          padding: '12px 14px',
                          background: 'var(--bg-card)',
                          border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'border 0.2s ease',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span 
                              style={{ 
                                fontSize: '0.84rem', 
                                fontWeight: 700, 
                                color: 'var(--text-main)', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }}
                            >
                              {art.title}
                            </span>
                            <span 
                              style={{ 
                                fontSize: '0.66rem', 
                                color: 'var(--text-subtle)', 
                                padding: '1px 6px', 
                                background: 'var(--bg-surface)', 
                                borderRadius: 'var(--radius-xs)', 
                                flexShrink: 0 
                              }}
                            >
                              {art.categoryName || 'Geral'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
                            {isApproved && (
                              <span style={{ color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={13} />
                                🎉 Parabéns! Artigo Aprovado (+100 pts)
                              </span>
                            )}
                            {isPending && (
                              <span style={{ color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={13} />
                                Em Análise (+50 pts)
                              </span>
                            )}
                            {isInAdjustment && (
                              <span style={{ color: '#ec4899', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={13} />
                                Em Ajustes (+20 pts)
                              </span>
                            )}

                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                              👍 {art.likesCount || 0} curtidas
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              👁️ {art.viewCount || 0} visualizações
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedArticle(art);
                            setIsProfileModalOpen(false);
                          }}
                          style={{ fontSize: '0.74rem', padding: '5px 10px', flexShrink: 0, fontWeight: 700 }}
                        >
                          Abrir
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
