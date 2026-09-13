import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Sparkles,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article, ArticleStatus } from '../../types';

export const EditorialQueueView: React.FC = () => {
  const { articles, submitReview, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | ArticleStatus>('PENDING');
  const [selectedReviewArticle, setSelectedReviewArticle] = useState<Article | null>(null);

  // Form de Avaliação
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT'>('APPROVE');
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState<string[]>(['']);

  const filteredArticles = articles.filter((a) => {
    if (activeTab === 'ALL') return true;
    return a.currentStatus === activeTab;
  });

  const countPending = articles.filter((a) => a.currentStatus === 'PENDING').length;
  const countAdjust = articles.filter((a) => a.currentStatus === 'IN_ADJUSTMENT').length;
  const countApproved = articles.filter((a) => a.currentStatus === 'APPROVED').length;
  const countRejected = articles.filter((a) => a.currentStatus === 'REJECTED').length;

  const handleOpenReview = (art: Article) => {
    setSelectedReviewArticle(art);
    setReviewAction('APPROVE');
    setGeneralFeedback('');
    setTechnicalNotes(['']);
  };

  const handleAddNoteField = () => {
    setTechnicalNotes((prev) => [...prev, '']);
  };

  const handleNoteChange = (index: number, val: string) => {
    setTechnicalNotes((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveNote = (index: number) => {
    setTechnicalNotes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewArticle) return;

    const validNotes = technicalNotes.map((n) => n.trim()).filter(Boolean);

    submitReview(
      selectedReviewArticle.id,
      reviewAction,
      generalFeedback.trim() ||
        (reviewAction === 'APPROVE'
          ? 'Artigo validado conforme os padrões operacionais da Conciliador Contábil.'
          : 'Ajustes solicitados pela equipe de revisão.'),
      validNotes
    );

    setSelectedReviewArticle(null);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Curadoria Técnica & Governança
        </span>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '4px 0 8px 0' }}>
          Fila de Revisão Editorial
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Avalie inputs técnicos submetidos por operadores, aprove publicações ou devolva com apontamentos técnicos na barra lateral de contexto.
        </p>
      </div>

      {/* Tabs Filter */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'PENDING' ? 'var(--status-pending)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'PENDING' ? 'rgba(245, 158, 11, 0.4)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={16} />
          <span>Pendentes de Revisão ({countPending})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('IN_ADJUSTMENT')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'IN_ADJUSTMENT' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'IN_ADJUSTMENT' ? 'var(--status-adjust)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'IN_ADJUSTMENT' ? 'rgba(59, 130, 246, 0.4)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RotateCcw size={16} />
          <span>Em Ajuste ({countAdjust})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('APPROVED')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'APPROVED' ? 'var(--status-approved)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'APPROVED' ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>Aprovados ({countApproved})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REJECTED')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            color: activeTab === 'REJECTED' ? 'var(--status-rejected)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'REJECTED' ? 'rgba(239, 68, 68, 0.4)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <XCircle size={16} />
          <span>Reprovados ({countRejected})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'ALL' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'ALL' ? 'var(--text-main)' : 'var(--text-subtle)',
            border: `1px solid ${activeTab === 'ALL' ? 'var(--border-subtle)' : 'transparent'}`,
          }}
        >
          Todos ({articles.length})
        </button>
      </div>

      {/* Submissions List */}
      {filteredArticles.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '50px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <CheckSquare size={40} color="var(--color-primary)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>Fila Limpa</h3>
          <p style={{ fontSize: '0.88rem' }}>Nenhum artigo encontrado nesta categoria de revisão no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="card"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    className={
                      art.currentStatus === 'PENDING'
                        ? 'badge badge-pending'
                        : art.currentStatus === 'IN_ADJUSTMENT'
                        ? 'badge badge-adjust'
                        : art.currentStatus === 'APPROVED'
                        ? 'badge badge-approved'
                        : 'badge badge-rejected'
                    }
                  >
                    {art.currentStatus === 'PENDING'
                      ? 'Pendente'
                      : art.currentStatus === 'IN_ADJUSTMENT'
                      ? 'Em Ajuste'
                      : art.currentStatus === 'APPROVED'
                      ? 'Aprovado'
                      : 'Reprovado'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-secondary-subtle)',
                      color: 'var(--color-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {art.categoryName}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {art.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={13} color="var(--color-primary)" />
                    Autor: {art.authorName} ({art.authorEmail})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} />
                    Submetido em {new Date(art.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenReview(art)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                  }}
                >
                  <CheckSquare size={15} />
                  <span>Avaliar Artigo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal / Bancada de Julgamento */}
      {selectedReviewArticle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedReviewArticle(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-sidebar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Bancada de Avaliação Técnica
                </span>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                  {selectedReviewArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewArticle(null)}
                style={{ color: 'var(--text-subtle)', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split between Article Preview and Evaluation Form */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Column: Preview Content */}
              <div
                style={{
                  flex: 1,
                  padding: '24px',
                  overflowY: 'auto',
                  borderRight: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '14px' }}>
                  Autor: <strong>{selectedReviewArticle.authorName}</strong> • Módulo: <strong>{selectedReviewArticle.categoryName}</strong>
                </div>

                <div
                  style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-main)' }}
                  dangerouslySetInnerHTML={{ __html: selectedReviewArticle.contentHtml }}
                />
              </div>

              {/* Right Column: Decision & Notes Form */}
              <div
                style={{
                  width: '380px',
                  padding: '24px',
                  overflowY: 'auto',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Decisão Editorial</h3>

                {/* Decision Radio / Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${reviewAction === 'APPROVE' ? 'var(--status-approved)' : 'var(--border-subtle)'}`,
                      background: reviewAction === 'APPROVE' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="reviewAction"
                      value="APPROVE"
                      checked={reviewAction === 'APPROVE'}
                      onChange={() => setReviewAction('APPROVE')}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Aprovar & Publicar</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Fica visível na base imediatamente</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${reviewAction === 'REQUEST_ADJUSTMENT' ? 'var(--status-adjust)' : 'var(--border-subtle)'}`,
                      background: reviewAction === 'REQUEST_ADJUSTMENT' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="reviewAction"
                      value="REQUEST_ADJUSTMENT"
                      checked={reviewAction === 'REQUEST_ADJUSTMENT'}
                      onChange={() => setReviewAction('REQUEST_ADJUSTMENT')}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>Solicitar Ajustes</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Retorna ao autor com notas na barra lateral</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${reviewAction === 'REJECT' ? 'var(--status-rejected)' : 'var(--border-subtle)'}`,
                      background: reviewAction === 'REJECT' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="reviewAction"
                      value="REJECT"
                      checked={reviewAction === 'REJECT'}
                      onChange={() => setReviewAction('REJECT')}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>Reprovar Sugestão</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Encerra o fluxo com justificativa</div>
                    </div>
                  </label>
                </div>

                {/* General Feedback Text */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Parecer Geral do Revisor:
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      reviewAction === 'APPROVE'
                        ? 'Parabéns, texto aprovado!'
                        : 'Descreva os motivos da solicitação ou parecer geral...'
                    }
                    value={generalFeedback}
                    onChange={(e) => setGeneralFeedback(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>

                {/* Specific Notes for the Sidebar (when requesting changes) */}
                {reviewAction === 'REQUEST_ADJUSTMENT' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Notas para Barra Lateral:
                      </label>
                      <button
                        type="button"
                        onClick={handleAddNoteField}
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontWeight: 600,
                        }}
                      >
                        <Plus size={13} />
                        Adicionar Nota
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {technicalNotes.map((note, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder={`Apontamento #${idx + 1}...`}
                            value={note}
                            onChange={(e) => handleNoteChange(idx, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                            }}
                          />
                          {technicalNotes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveNote(idx)}
                              style={{ color: 'var(--text-subtle)', padding: '0 4px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setSelectedReviewArticle(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={
                      reviewAction === 'APPROVE'
                        ? 'btn btn-primary'
                        : reviewAction === 'REQUEST_ADJUSTMENT'
                        ? 'btn btn-secondary'
                        : 'btn btn-danger'
                    }
                    style={{ flex: 1.4 }}
                    onClick={handleSubmitEvaluation}
                  >
                    Confirmar Decisão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
