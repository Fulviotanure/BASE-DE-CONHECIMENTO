import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Clock, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomDialogModal: React.FC = () => {
  const { appDialog, closeDialog, theme } = useApp();
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && appDialog?.isOpen) {
        if (appDialog.onCancel) {
          appDialog.onCancel();
        }
        closeDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appDialog, closeDialog]);

  if (!appDialog || !appDialog.isOpen) return null;

  const {
    title,
    message,
    type = 'info',
    badgeText,
    confirmText = 'OK, Entendido',
    cancelText,
    onConfirm,
    onCancel,
  } = appDialog;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeDialog();
  };

  // Cores e Ícones Dinâmicos com alto contraste adaptativo (Perfeito tanto em Modo Claro quanto em Modo Escuro)
  const getTypeConfig = () => {
    switch (type) {
      case 'review':
        return {
          icon: <Clock size={32} style={{ color: isLight ? '#0284c7' : '#38bdf8' }} />,
          gradient: isLight ? 'linear-gradient(90deg, #0284c7, #4f46e5)' : 'linear-gradient(90deg, #38bdf8, #6366f1)',
          glowBorder: isLight ? '#bae6fd' : 'rgba(56, 189, 248, 0.4)',
          glowShadow: isLight
            ? '0 25px 60px -10px rgba(15, 23, 42, 0.25), 0 8px 24px -5px rgba(15, 23, 42, 0.1)'
            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.2)',
          iconBg: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)',
          iconBorder: isLight ? '#7dd3fc' : 'rgba(56, 189, 248, 0.3)',
          badgeColor: isLight ? '#0369a1' : '#38bdf8',
          badgeBg: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.12)',
          btnGradient: 'linear-gradient(135deg, #0284c7, #2563eb)',
          defaultBadge: 'Revisão Editorial Obrigatória',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={32} style={{ color: isLight ? '#059669' : '#10b981' }} />,
          gradient: isLight ? 'linear-gradient(90deg, #059669, #047857)' : 'linear-gradient(90deg, #10b981, #059669)',
          glowBorder: isLight ? '#a7f3d0' : 'rgba(16, 185, 129, 0.4)',
          glowShadow: isLight
            ? '0 25px 60px -10px rgba(15, 23, 42, 0.25), 0 8px 24px -5px rgba(15, 23, 42, 0.1)'
            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(16, 185, 129, 0.2)',
          iconBg: isLight ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)',
          iconBorder: isLight ? '#6ee7b7' : 'rgba(16, 185, 129, 0.3)',
          badgeColor: isLight ? '#047857' : '#10b981',
          badgeBg: isLight ? '#d1fae5' : 'rgba(16, 185, 129, 0.12)',
          btnGradient: 'linear-gradient(135deg, #10b981, #059669)',
          defaultBadge: 'Sucesso',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={32} style={{ color: isLight ? '#d97706' : '#f59e0b' }} />,
          gradient: isLight ? 'linear-gradient(90deg, #d97706, #b45309)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
          glowBorder: isLight ? '#fde68a' : 'rgba(245, 158, 11, 0.4)',
          glowShadow: isLight
            ? '0 25px 60px -10px rgba(15, 23, 42, 0.25), 0 8px 24px -5px rgba(15, 23, 42, 0.1)'
            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.2)',
          iconBg: isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)',
          iconBorder: isLight ? '#fcd34d' : 'rgba(245, 158, 11, 0.3)',
          badgeColor: isLight ? '#b45309' : '#f59e0b',
          badgeBg: isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.12)',
          btnGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          defaultBadge: 'Atenção',
        };
      case 'error':
        return {
          icon: <AlertCircle size={32} style={{ color: isLight ? '#dc2626' : '#f43f5e' }} />,
          gradient: isLight ? 'linear-gradient(90deg, #dc2626, #b91c1c)' : 'linear-gradient(90deg, #f43f5e, #e11d48)',
          glowBorder: isLight ? '#fecaca' : 'rgba(244, 63, 94, 0.4)',
          glowShadow: isLight
            ? '0 25px 60px -10px rgba(15, 23, 42, 0.25), 0 8px 24px -5px rgba(15, 23, 42, 0.1)'
            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(244, 63, 94, 0.2)',
          iconBg: isLight ? '#fee2e2' : 'rgba(244, 63, 94, 0.15)',
          iconBorder: isLight ? '#fca5a5' : 'rgba(244, 63, 94, 0.3)',
          badgeColor: isLight ? '#b91c1c' : '#f43f5e',
          badgeBg: isLight ? '#fee2e2' : 'rgba(244, 63, 94, 0.12)',
          btnGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
          defaultBadge: 'Erro',
        };
      case 'info':
      default:
        return {
          icon: <Info size={32} style={{ color: isLight ? '#0284c7' : '#38bdf8' }} />,
          gradient: isLight ? 'linear-gradient(90deg, #0284c7, #4f46e5)' : 'linear-gradient(90deg, #38bdf8, #6366f1)',
          glowBorder: isLight ? '#bae6fd' : 'rgba(56, 189, 248, 0.4)',
          glowShadow: isLight
            ? '0 25px 60px -10px rgba(15, 23, 42, 0.25), 0 8px 24px -5px rgba(15, 23, 42, 0.1)'
            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.2)',
          iconBg: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)',
          iconBorder: isLight ? '#7dd3fc' : 'rgba(56, 189, 248, 0.3)',
          badgeColor: isLight ? '#0369a1' : '#38bdf8',
          badgeBg: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.12)',
          btnGradient: 'linear-gradient(135deg, #38bdf8, #2563eb)',
          defaultBadge: 'Informação',
        };
    }
  };

  const config = getTypeConfig();
  const effectiveBadge = badgeText || config.defaultBadge;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: isLight ? '#ffffff' : 'var(--bg-surface, #1e2227)',
          border: isLight ? '1px solid #e2e8f0' : `1px solid ${config.glowBorder}`,
          borderRadius: '16px',
          boxShadow: config.glowShadow,
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faixa decorativa superior com gradiente */}
        <div style={{ height: '5px', width: '100%', background: config.gradient }} />

        {/* Botão de Fechar no topo direito */}
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLight ? '#64748b' : 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isLight ? '#0f172a' : '#fff';
            e.currentTarget.style.background = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isLight ? '#64748b' : 'var(--text-muted, #94a3b8)';
            e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)';
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        <div style={{ padding: '28px 26px 24px 26px' }}>
          {/* Topo com Ícone e Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: config.iconBg,
                border: `1px solid ${config.iconBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: isLight ? '0 4px 12px rgba(0, 0, 0, 0.06)' : `0 8px 20px ${config.iconBg}`,
              }}
            >
              {config.icon}
            </div>

            <div style={{ flex: 1, paddingRight: '28px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: config.badgeColor,
                  background: config.badgeBg,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: `1px solid ${config.iconBorder}`,
                  marginBottom: '6px',
                }}
              >
                {effectiveBadge}
              </span>

              <h3
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: isLight ? '#0f172a' : 'var(--text-main, #f8fafc)',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Mensagem Principal */}
          <div
            style={{
              fontSize: '0.95rem',
              color: isLight ? '#334155' : 'var(--text-muted, #cbd5e1)',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
              margin: '0 0 20px 0',
            }}
          >
            {message}
          </div>

          {/* Aviso especial de governança editorial para artigos (Alto Contraste no Fundo Claro e Escuro) */}
          {type === 'review' && (
            <div
              style={{
                background: isLight ? '#f0f9ff' : 'rgba(56, 189, 248, 0.06)',
                border: isLight ? '1.5px solid #7dd3fc' : '1px solid rgba(56, 189, 248, 0.22)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '22px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                boxShadow: isLight ? '0 2px 8px rgba(2, 132, 199, 0.08)' : 'none',
              }}
            >
              <Sparkles size={20} style={{ color: isLight ? '#0284c7' : '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong
                  style={{
                    color: isLight ? '#0369a1' : '#bae6fd',
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                  }}
                >
                  Fluxo de Revisão e Qualidade:
                </strong>
                <span style={{ color: isLight ? '#0f172a' : '#e0f2fe' }}>
                  O manual já foi encaminhado para a{' '}
                  <strong style={{ color: isLight ? '#0284c7' : '#ffffff', fontWeight: 700 }}>
                    Fila Editorial
                  </strong>
                  . Assim que a revisão for concluída por um editor ou administrador, ele ficará disponível para consulta pública.
                </span>
              </div>
            </div>
          )}

          {/* Ações / Botões */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: cancelText ? 'space-between' : 'flex-end',
              gap: '12px',
              marginTop: '10px',
            }}
          >
            {cancelText && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: isLight ? '#f8fafc' : 'transparent',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: isLight ? '#475569' : 'var(--text-muted, #94a3b8)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isLight ? '#0f172a' : '#fff';
                  e.currentTarget.style.borderColor = isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.background = isLight ? '#f1f5f9' : 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isLight ? '#475569' : 'var(--text-muted, #94a3b8)';
                  e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.background = isLight ? '#f8fafc' : 'transparent';
                }}
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              style={{
                padding: '11px 26px',
                borderRadius: '10px',
                background: config.btnGradient,
                border: 'none',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: isLight
                  ? '0 4px 14px rgba(2, 132, 199, 0.35)'
                  : '0 4px 15px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = isLight
                  ? '0 6px 20px rgba(2, 132, 199, 0.45)'
                  : '0 6px 20px rgba(0, 0, 0, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = isLight
                  ? '0 4px 14px rgba(2, 132, 199, 0.35)'
                  : '0 4px 15px rgba(0, 0, 0, 0.35)';
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
