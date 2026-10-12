import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Trophy,
  X,
  ExternalLink,
  Trash2,
  Eye,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { AppNotification, SentEmail } from '../../types';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    sentEmails,
    clearSentEmailsList,
    setSelectedArticle,
    articles,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'NOTIFICATIONS' | 'EMAILS'>('NOTIFICATIONS');
  const [selectedEmailForPreview, setSelectedEmailForPreview] = useState<SentEmail | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.articleId) {
      const art = articles.find((a) => a.id === notif.articleId);
      if (art) {
        setSelectedArticle(art);
        setIsOpen(false);
      }
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return 'Agora mesmo';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `há ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `há ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `há ${diffDays} d`;
    } catch {
      return '';
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* Botão de Sino de Notificação */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: isOpen ? 'var(--bg-card-hover)' : 'transparent',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '8px',
          color: unreadNotificationsCount > 0 ? 'var(--text-main)' : 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        title={`Notificações & E-mails (${unreadNotificationsCount} não lidas)`}
      >
        <Bell size={18} />
        {unreadNotificationsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Dropdown Painel de Notificações e E-mails */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '420px',
            maxWidth: '92vw',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '520px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Cabeçalho do Painel */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-sidebar)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('NOTIFICATIONS')}
                style={{
                  background: activeTab === 'NOTIFICATIONS' ? 'var(--bg-card)' : 'transparent',
                  border: `1px solid ${activeTab === 'NOTIFICATIONS' ? 'var(--color-primary)' : 'transparent'}`,
                  color: activeTab === 'NOTIFICATIONS' ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Bell size={14} />
                <span>Notificações</span>
                {unreadNotificationsCount > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      borderRadius: '10px',
                    }}
                  >
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('EMAILS')}
                style={{
                  background: activeTab === 'EMAILS' ? 'var(--bg-card)' : 'transparent',
                  border: `1px solid ${activeTab === 'EMAILS' ? 'var(--color-primary)' : 'transparent'}`,
                  color: activeTab === 'EMAILS' ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Mail size={14} />
                <span>E-mails ({sentEmails.length})</span>
              </button>
            </div>

            {activeTab === 'NOTIFICATIONS' && notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Marcar todas como lidas"
              >
                <Check size={12} />
                <span>Lidas</span>
              </button>
            )}
          </div>

          {/* Conteúdo: Lista de Notificações */}
          {activeTab === 'NOTIFICATIONS' && (
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={28} style={{ opacity: 0.3, margin: '0 auto 10px auto', display: 'block' }} />
                  <span style={{ fontSize: '0.85rem' }}>Nenhuma notificação no momento.</span>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isApproved = notif.type === 'ARTICLE_APPROVED';
                  const isAdjustment = notif.type === 'ARTICLE_NEEDS_ADJUSTMENT';
                  const isSubmitted = notif.type === 'ARTICLE_SUBMITTED';

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: notif.read ? 'transparent' : 'rgba(92, 183, 128, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(92, 183, 128, 0.05)')
                      }
                    >
                      {/* Ícone Indicador */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          background: isApproved
                            ? 'rgba(92, 183, 128, 0.15)'
                            : isAdjustment
                            ? 'rgba(245, 158, 11, 0.15)'
                            : isSubmitted
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'var(--bg-card)',
                          color: isApproved
                            ? '#5cb780'
                            : isAdjustment
                            ? '#f59e0b'
                            : isSubmitted
                            ? '#38bdf8'
                            : 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          flexShrink: 0,
                        }}
                      >
                        {isApproved ? '🎉' : isAdjustment ? '📝' : isSubmitted ? '📬' : '⭐'}
                      </div>

                      {/* Mensagem e Detalhes */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {notif.title}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>

                        <p
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            margin: '4px 0 6px 0',
                            lineHeight: 1.4,
                          }}
                        >
                          {notif.message}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {notif.pointsGained && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: '#5cb780',
                                background: 'rgba(92, 183, 128, 0.12)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              +{notif.pointsGained} pts
                            </span>
                          )}

                          {!notif.read && (
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-primary)',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Conteúdo: Lista de E-mails Disparados */}
          {activeTab === 'EMAILS' && (
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
              {sentEmails.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Mail size={28} style={{ opacity: 0.3, margin: '0 auto 10px auto', display: 'block' }} />
                  <span style={{ fontSize: '0.85rem' }}>Nenhum e-mail disparado até o momento.</span>
                </div>
              ) : (
                sentEmails.map((em) => (
                  <div
                    key={em.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background:
                              em.type === 'ARTICLE_APPROVED'
                                ? 'rgba(92, 183, 128, 0.2)'
                                : em.type === 'ARTICLE_NEEDS_ADJUSTMENT'
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(56, 189, 248, 0.2)',
                            color:
                              em.type === 'ARTICLE_APPROVED'
                                ? '#5cb780'
                                : em.type === 'ARTICLE_NEEDS_ADJUSTMENT'
                                ? '#f59e0b'
                                : '#38bdf8',
                          }}
                        >
                          {em.type === 'ARTICLE_APPROVED'
                            ? '🎉 PARABÉNS'
                            : em.type === 'ARTICLE_NEEDS_ADJUSTMENT'
                            ? '📝 AJUSTES'
                            : '📬 NOVO ARTIGO'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                          Para: {em.toName} ({em.to})
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {em.subject}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {formatRelativeTime(em.sentAt)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEmailForPreview(em)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '4px 8px', flexShrink: 0 }}
                      title="Visualizar HTML do e-mail"
                    >
                      <Eye size={13} />
                      <span>Ver</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Rodapé do Painel com Ações de Limpeza */}
          <div
            style={{
              padding: '10px 16px',
              background: 'var(--bg-sidebar)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--text-subtle)',
            }}
          >
            <span>Conciliador Contábil • Central de Notificações</span>
            {activeTab === 'NOTIFICATIONS' && notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={12} />
                <span>Limpar</span>
              </button>
            )}
            {activeTab === 'EMAILS' && sentEmails.length > 0 && (
              <button
                type="button"
                onClick={clearSentEmailsList}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={12} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Preview Completo do E-mail Formatado */}
      {selectedEmailForPreview &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(5px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              overflowY: 'auto',
            }}
            onClick={() => setSelectedEmailForPreview(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: 'calc(100vh - 40px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Visualizador */}
              <div
                style={{
                  padding: '14px 20px',
                  background: 'var(--bg-sidebar)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} color="var(--color-primary)" />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                      Prévia do E-mail Disparado
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                      Destinatário: {selectedEmailForPreview.toName} ({selectedEmailForPreview.to})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmailForPreview(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Informações de cabeçalho do e-mail */}
              <div
                style={{
                  padding: '12px 20px',
                  background: 'var(--bg-card)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Assunto: </strong>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedEmailForPreview.subject}</span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Data de Disparo: </strong>
                  <span style={{ color: 'var(--text-subtle)' }}>
                    {new Date(selectedEmailForPreview.sentAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Corpo renderizado do e-mail */}
              <div
                style={{
                  padding: '24px',
                  overflowY: 'auto',
                  flex: 1,
                  background: '#090d16',
                }}
                dangerouslySetInnerHTML={{ __html: selectedEmailForPreview.htmlBody }}
              />

              {/* Rodapé com botão de fechar */}
              <div
                style={{
                  padding: '12px 20px',
                  background: 'var(--bg-sidebar)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedEmailForPreview(null)}
                >
                  Fechar Visualização
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
