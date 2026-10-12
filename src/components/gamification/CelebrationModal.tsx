import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Trophy, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CelebrationModal: React.FC = () => {
  const { celebrationModal, closeCelebrationModal } = useApp();

  if (!celebrationModal || !celebrationModal.isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={closeCelebrationModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-surface)',
          border: '2px solid rgba(92, 183, 128, 0.5)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(92, 183, 128, 0.2)',
          overflow: 'hidden',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faixa decorativa superior com gradiente festivo */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #5cb780, #38bdf8, #6c63ff, #f59e0b)' }} />

        <div style={{ padding: '32px 28px' }}>
          {/* Ícone Gigante de Troféu com Confetes */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(92, 183, 128, 0.2), rgba(56, 189, 248, 0.2))',
              border: '2px solid #5cb780',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px rgba(92, 183, 128, 0.3)',
              color: '#5cb780',
              fontSize: '2.5rem',
            }}
          >
            🏆
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {celebrationModal.title || '🎉 Parabéns pelo Artigo!'}
          </h2>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
            {celebrationModal.message}
          </p>

          {celebrationModal.points && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(92, 183, 128, 0.15)',
                border: '1px solid rgba(92, 183, 128, 0.4)',
                color: '#5cb780',
                fontWeight: 800,
                fontSize: '0.95rem',
                marginBottom: '24px',
              }}
            >
              <Sparkles size={16} />
              <span>+{celebrationModal.points} Pontos de Conhecimento Conquistados!</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={closeCelebrationModal}
              style={{
                padding: '10px 28px',
                fontSize: '0.92rem',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(92, 183, 128, 0.35)',
              }}
            >
              Excelente! Continuar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
