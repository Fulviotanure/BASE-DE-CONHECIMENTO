import React from 'react';
import { FileEdit, PlusCircle, Clock, CheckCircle2, RotateCcw, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../types';

interface MyArticlesViewProps {
  onOpenNewArticle: () => void;
  onEditArticle: (article: Article) => void;
  onViewArticle: (article: Article) => void;
}

export const MyArticlesView: React.FC<MyArticlesViewProps> = ({
  onOpenNewArticle,
  onEditArticle,
  onViewArticle,
}) => {
  const { articles, currentUser } = useApp();

  const myArticles = articles.filter(
    (a) => a.authorEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const pendingList = myArticles.filter((a) => a.currentStatus === 'PENDING');
  const adjustList = myArticles.filter((a) => a.currentStatus === 'IN_ADJUSTMENT');
  const approvedList = myArticles.filter((a) => a.currentStatus === 'APPROVED');
  const rejectedList = myArticles.filter((a) => a.currentStatus === 'REJECTED');

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Área do Operador
          </span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '4px 0 6px 0' }}>
            Meus Artigos & Submissões
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Acompanhe o status dos seus inputs no fluxo editorial da Conciliador Contábil.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenNewArticle}
        >
          <PlusCircle size={16} />
          <span>Novo Input</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Aprovados</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{approvedList.length}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Visíveis na base pública</span>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Em Ajuste</span>
            <RotateCcw size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6' }}>{adjustList.length}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Requerem sua atenção</span>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Pendentes</span>
            <Clock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{pendingList.length}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Na fila de triagem</span>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Reprovados</span>
            <XCircle size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{rejectedList.length}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Sugestões não aprovadas</span>
        </div>
      </div>

      {/* Urgent Attention Section: Articles in Adjustment */}
      {adjustList.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertCircle size={18} color="var(--status-adjust)" />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--status-adjust)' }}>
              Artigos Devolvidos para Ajuste ({adjustList.length})
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {adjustList.map((art) => (
              <div
                key={art.id}
                className="card"
                style={{
                  borderLeft: '4px solid var(--status-adjust)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-adjust">Revisão Solicitada</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      Módulo: {art.categoryName}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {art.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Parecer: <em>"{art.reviews?.[0]?.generalFeedback || 'Consulte os apontamentos técnicos'}"</em>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onEditArticle(art)}
                  style={{
                    background: 'var(--status-adjust)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.84rem',
                  }}
                >
                  <FileEdit size={14} />
                  <span>Abrir e Ajustar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All My Submissions List */}
      <div>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '14px' }}>
          Histórico Completo de Submissões
        </h2>

        {myArticles.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileEdit size={36} color="var(--text-subtle)" style={{ margin: '0 auto 12px auto' }} />
            <p>Você ainda não submeteu nenhum artigo ou solução contábil.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenNewArticle}
              style={{ marginTop: '12px' }}
            >
              Criar meu primeiro artigo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myArticles.map((art) => (
              <div
                key={art.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      className={
                        art.currentStatus === 'APPROVED'
                          ? 'badge badge-approved'
                          : art.currentStatus === 'PENDING'
                          ? 'badge badge-pending'
                          : art.currentStatus === 'IN_ADJUSTMENT'
                          ? 'badge badge-adjust'
                          : 'badge badge-rejected'
                      }
                    >
                      {art.currentStatus === 'APPROVED'
                        ? 'Aprovado'
                        : art.currentStatus === 'PENDING'
                        ? 'Em Fila'
                        : art.currentStatus === 'IN_ADJUSTMENT'
                        ? 'Em Ajuste'
                        : 'Reprovado'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      Módulo: {art.categoryName} • Criado em {new Date(art.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {art.title}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {art.currentStatus === 'IN_ADJUSTMENT' ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditArticle(art)}
                    >
                      <FileEdit size={13} />
                      <span>Ajustar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewArticle(art)}
                    >
                      <span>Visualizar</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
