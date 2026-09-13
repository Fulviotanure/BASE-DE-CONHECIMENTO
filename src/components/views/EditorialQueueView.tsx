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
  Send,
  X,
  FileText,
  Shield,
  ThumbsUp,
  CornerDownRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article, ArticleStatus, ArticleReviewComment } from '../../types';

export const EditorialQueueView: React.FC = () => {
  const { articles, submitReview, addArticleComment, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | ArticleStatus>('PENDING');
  const [selectedReviewArticle, setSelectedReviewArticle] = useState<Article | null>(null);

  // Form de Avaliação e Decisão
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REQUEST_ADJUSTMENT' | 'REJECT'>('APPROVE');
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [newCommentInput, setNewCommentInput] = useState('');

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
    setNewCommentInput('');
  };

  // Enviar mensagem no balão de conversa
  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedReviewArticle || !newCommentInput.trim()) return;

    addArticleComment(selectedReviewArticle.id, newCommentInput.trim());

    // Atualiza o estado local do modal com o novo balão
    const newBubble: ArticleReviewComment = {
      id: `comm-local-${Date.now()}`,
      authorName: currentUser?.displayName || 'Usuário',
      authorRole: currentUser?.role || 'OPERATOR',
      authorEmail: currentUser?.email,
      message: newCommentInput.trim(),
      isResolved: false,
      createdAt: new Date().toISOString(),
    };

    setSelectedReviewArticle({
      ...selectedReviewArticle,
      comments: [...(selectedReviewArticle.comments || []), newBubble],
    });

    setNewCommentInput('');
  };

  // Confirmar Decisão Editorial
  const handleConfirmDecision = () => {
    if (!selectedReviewArticle) return;

    const feedbackText = generalFeedback.trim() ||
      (reviewAction === 'APPROVE'
        ? 'Artigo aprovado e validado conforme os padrões operacionais da Conciliador Contábil.'
        : reviewAction === 'REQUEST_ADJUSTMENT'
        ? 'Solicitação de ajustes enviada. Favor revisar os apontamentos na conversa em balões.'
        : 'Proposta reprovada pela equipe editorial.');

    submitReview(selectedReviewArticle.id, reviewAction, feedbackText);
    setSelectedReviewArticle(null);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Curadoria Técnica & Governança
        </span>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '4px 0 8px 0', fontWeight: 800 }}>
          Fila de Revisão Editorial
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Avalie manuais e artigos submetidos pelos operadores, aprove publicações ou oriente correções através da conversa em balões.
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
          flexWrap: 'wrap',
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
          <Clock size={15} />
          <span>Pendentes</span>
          <span
            style={{
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.2)',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            {countPending}
          </span>
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
          <RotateCcw size={15} />
          <span>Em Ajuste</span>
          <span
            style={{
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(59, 130, 246, 0.2)',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            {countAdjust}
          </span>
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
          <CheckCircle2 size={15} />
          <span>Aprovados</span>
          <span
            style={{
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.2)',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            {countApproved}
          </span>
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
          <XCircle size={15} />
          <span>Reprovados</span>
          <span
            style={{
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(239, 68, 68, 0.2)',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            {countRejected}
          </span>
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
            background: activeTab === 'ALL' ? 'var(--color-primary-subtle)' : 'transparent',
            color: activeTab === 'ALL' ? 'var(--color-primary)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'ALL' ? 'rgba(92, 183, 128, 0.4)' : 'transparent'}`,
            marginLeft: 'auto',
          }}
        >
          <span>Todos ({articles.length})</span>
        </button>
      </div>

      {/* Lista de Artigos na Fila */}
      {filteredArticles.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📂</div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            Nenhum artigo encontrado nesta fila
          </h3>
          <p style={{ fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto' }}>
            Todos os artigos enviados foram processados. Quando um colaborador criar ou propor uma edição, o manual aparecerá aqui para avaliação.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="card"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                border: '1px solid var(--border-subtle)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(92, 183, 128, 0.15)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(92, 183, 128, 0.3)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {art.code || 'CC-DOC'}
                  </span>
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

                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: '0 0 8px 0', fontWeight: 700 }}>
                  {art.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-subtle)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={13} color="var(--color-primary)" />
                    <strong>Criado por:</strong> {art.authorName || 'Fulvio Tanure'} ({art.authorEmail})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} />
                    <strong>Criado em:</strong> {new Date(art.createdAt).toLocaleDateString('pt-BR')} às {new Date(art.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {art.comments && art.comments.length > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38bdf8', fontWeight: 600 }}>
                      <MessageSquare size={13} />
                      {art.comments.length} {art.comments.length === 1 ? 'mensagem' : 'mensagens'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenReview(art)}
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckSquare size={16} />
                  <span>Avaliar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TELA QUASE CHEIA DE AVALIAÇÃO EDITORIAL (WORKSPAPCE AMPLO) */}
      {selectedReviewArticle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setSelectedReviewArticle(null)}
        >
          <div
            style={{
              width: '98vw',
              height: '96vh',
              maxWidth: '1750px',
              maxHeight: '96vh',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 32px rgba(92, 183, 128, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Superior da Bancada de Avaliação */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-sidebar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(92, 183, 128, 0.15)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(92, 183, 128, 0.3)',
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedReviewArticle.code || 'CC-DOC'}
                </span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                    {selectedReviewArticle.title}
                  </h2>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                    <span><strong>Módulo:</strong> {selectedReviewArticle.categoryName}</span>
                    <span>•</span>
                    <span><strong>Autor:</strong> {selectedReviewArticle.authorName} ({selectedReviewArticle.authorEmail})</span>
                    <span>•</span>
                    <span><strong>Data:</strong> {new Date(selectedReviewArticle.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  className={
                    selectedReviewArticle.currentStatus === 'PENDING'
                      ? 'badge badge-pending'
                      : selectedReviewArticle.currentStatus === 'IN_ADJUSTMENT'
                      ? 'badge badge-adjust'
                      : selectedReviewArticle.currentStatus === 'APPROVED'
                      ? 'badge badge-approved'
                      : 'badge badge-rejected'
                  }
                >
                  {selectedReviewArticle.currentStatus === 'PENDING'
                    ? 'Pendente'
                    : selectedReviewArticle.currentStatus === 'IN_ADJUSTMENT'
                    ? 'Em Ajuste'
                    : selectedReviewArticle.currentStatus === 'APPROVED'
                    ? 'Aprovado'
                    : 'Reprovado'}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedReviewArticle(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                  }}
                  title="Fechar Avaliação"
                >
                  <X size={16} />
                  <span>Fechar</span>
                </button>
              </div>
            </div>

            {/* Corpo Principal: LADO ESQUERDO (Revisão & Balões) vs LADO DIREITO (Conteúdo do Artigo) */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* LADO ESQUERDO: Conversa e Parecer Editorial em Balões */}
              <div
                style={{
                  width: '450px',
                  minWidth: '380px',
                  maxWidth: '520px',
                  borderRight: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Header do Chat / Parecer */}
                <div
                  style={{
                    padding: '14px 18px',
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={17} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Conversa & Revisão do Revisor
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                    Balões em tempo real
                  </span>
                </div>

                {/* Área de Mensagens (Thread de Balões) */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    background: 'var(--bg-surface)',
                  }}
                >
                  {/* Se houver justificativa do autor da edição */}
                  {selectedReviewArticle.proposalNote && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} />
                        <span>Justificativa da Proposta pelo Autor:</span>
                      </div>
                      <div style={{ color: 'var(--text-main)', lineHeight: 1.45 }}>
                        {selectedReviewArticle.proposalNote}
                      </div>
                    </div>
                  )}

                  {/* Exibição dos Balões de Conversa */}
                  {(!selectedReviewArticle.comments || selectedReviewArticle.comments.length === 0) && !selectedReviewArticle.proposalNote ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <MessageSquare size={28} color="var(--text-subtle)" style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.84rem', margin: '0 0 6px 0', color: 'var(--text-main)', fontWeight: 600 }}>
                        Nenhum apontamento enviado ainda
                      </p>
                      <p style={{ fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                        Escreva seu parecer ou observação abaixo. Cada envio criará um balão de conversa, e o criador do manual poderá responder no mesmo formato.
                      </p>
                    </div>
                  ) : (
                    selectedReviewArticle.comments?.map((c) => {
                      const isCreator =
                        c.authorEmail?.toLowerCase() === selectedReviewArticle.authorEmail.toLowerCase() ||
                        c.authorRole === 'OPERATOR';

                      const isReviewerOrAdmin =
                        c.authorRole === 'SUPER_ADMIN' ||
                        c.authorRole === 'ADMIN' ||
                        c.authorRole === 'REVIEWER';

                      return (
                        <div
                          key={c.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isReviewerOrAdmin ? 'flex-end' : 'flex-start',
                            gap: '4px',
                          }}
                        >
                          {/* Identificação do Autor do Balão */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.72rem',
                              color: 'var(--text-subtle)',
                              padding: '0 4px',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: isReviewerOrAdmin ? 'var(--color-primary)' : '#38bdf8' }}>
                              {c.authorName}
                            </span>
                            <span>•</span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: isReviewerOrAdmin ? 'rgba(92, 183, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                color: isReviewerOrAdmin ? 'var(--color-primary)' : '#38bdf8',
                                fontWeight: 700,
                              }}
                            >
                              {c.authorRole === 'SUPER_ADMIN'
                                ? 'Superadmin'
                                : c.authorRole === 'ADMIN'
                                ? 'Admin'
                                : c.authorRole === 'REVIEWER'
                                ? 'Revisor'
                                : 'Criador'}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Balão de Mensagem Estilizado */}
                          <div
                            style={{
                              maxWidth: '92%',
                              padding: '12px 16px',
                              borderRadius: isReviewerOrAdmin
                                ? '16px 16px 4px 16px'
                                : '16px 16px 16px 4px',
                              background: isReviewerOrAdmin
                                ? 'rgba(92, 183, 128, 0.12)'
                                : 'var(--bg-card)',
                              border: `1px solid ${
                                isReviewerOrAdmin
                                  ? 'rgba(92, 183, 128, 0.3)'
                                  : 'var(--border-subtle)'
                              }`,
                              color: 'var(--text-main)',
                              fontSize: '0.85rem',
                              lineHeight: 1.5,
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              wordBreak: 'break-word',
                            }}
                          >
                            {c.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Campo de Envio de Balão de Conversa (Revisor e Criador) */}
                <form
                  onSubmit={handleSendComment}
                  style={{
                    padding: '14px 16px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'var(--bg-sidebar)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Escreva seu comentário em balão:</span>
                    <span style={{ fontSize: '0.70rem', color: 'var(--color-primary)' }}>
                      Como: <strong>{currentUser?.displayName || 'Revisor'}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea
                      rows={2}
                      placeholder="Digite sua mensagem, observação ou resposta..."
                      value={newCommentInput}
                      onChange={(e) => setNewCommentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendComment();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.84rem',
                        color: 'var(--text-main)',
                        resize: 'none',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newCommentInput.trim()}
                      className="btn btn-primary"
                      style={{
                        padding: '0 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        opacity: newCommentInput.trim() ? 1 : 0.5,
                        cursor: newCommentInput.trim() ? 'pointer' : 'not-allowed',
                      }}
                      title="Enviar comentário (Enter)"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* LADO DIREITO: Conteúdo do Artigo Avaliado */}
              <div
                style={{
                  flex: 1,
                  padding: '32px',
                  overflowY: 'auto',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                  {/* Cabeçalho do Conteúdo */}
                  <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: '0 0 10px 0', fontWeight: 800 }}>
                      {selectedReviewArticle.title}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-secondary-subtle)',
                          color: 'var(--color-secondary)',
                          fontWeight: 700,
                        }}
                      >
                        {selectedReviewArticle.categoryName}
                      </span>

                      {selectedReviewArticle.tags?.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Renderização do HTML do Artigo */}
                  <div
                    style={{
                      fontSize: '0.94rem',
                      lineHeight: 1.75,
                      color: 'var(--text-main)',
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedReviewArticle.contentHtml }}
                  />
                </div>
              </div>
            </div>

            {/* BARRA INFERIOR FIXA: SELETOR DE DECISÃO EM CASCATA & CONFIRMAÇÃO */}
            <div
              style={{
                padding: '16px 28px',
                background: 'var(--bg-sidebar)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                flexShrink: 0,
              }}
            >
              {/* Seleção de Decisão em Cascata */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="var(--color-primary)" />
                  Decisão Editorial:
                </span>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Opção 1: Aprovar & Publicar */}
                  <button
                    type="button"
                    onClick={() => setReviewAction('APPROVE')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: reviewAction === 'APPROVE' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                      background: reviewAction === 'APPROVE' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      color: reviewAction === 'APPROVE' ? '#10b981' : 'var(--text-muted)',
                      fontWeight: reviewAction === 'APPROVE' ? 700 : 500,
                    }}
                  >
                    <CheckCircle2 size={16} color={reviewAction === 'APPROVE' ? '#10b981' : 'var(--text-subtle)'} />
                    <span>🟢 Aprovar & Publicar</span>
                  </button>

                  {/* Opção 2: Solicitar Ajustes */}
                  <button
                    type="button"
                    onClick={() => setReviewAction('REQUEST_ADJUSTMENT')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: reviewAction === 'REQUEST_ADJUSTMENT' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                      background: reviewAction === 'REQUEST_ADJUSTMENT' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      color: reviewAction === 'REQUEST_ADJUSTMENT' ? '#f59e0b' : 'var(--text-muted)',
                      fontWeight: reviewAction === 'REQUEST_ADJUSTMENT' ? 700 : 500,
                    }}
                  >
                    <RotateCcw size={16} color={reviewAction === 'REQUEST_ADJUSTMENT' ? '#f59e0b' : 'var(--text-subtle)'} />
                    <span>🟡 Solicitar Ajustes</span>
                  </button>

                  {/* Opção 3: Rejeitar */}
                  <button
                    type="button"
                    onClick={() => setReviewAction('REJECT')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: reviewAction === 'REJECT' ? '2px solid #ef4444' : '1px solid var(--border-subtle)',
                      background: reviewAction === 'REJECT' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      color: reviewAction === 'REJECT' ? '#ef4444' : 'var(--text-muted)',
                      fontWeight: reviewAction === 'REJECT' ? 700 : 500,
                    }}
                  >
                    <XCircle size={16} color={reviewAction === 'REJECT' ? '#ef4444' : 'var(--text-subtle)'} />
                    <span>🔴 Rejeitar</span>
                  </button>
                </div>
              </div>

              {/* Botão de Confirmação da Decisão */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedReviewArticle(null)}
                  style={{ padding: '10px 18px' }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDecision}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.90rem',
                    cursor: 'pointer',
                    color: '#ffffff',
                    background:
                      reviewAction === 'APPROVE'
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : reviewAction === 'REQUEST_ADJUSTMENT'
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow:
                      reviewAction === 'APPROVE'
                        ? '0 4px 14px rgba(16, 185, 129, 0.4)'
                        : reviewAction === 'REQUEST_ADJUSTMENT'
                        ? '0 4px 14px rgba(245, 158, 11, 0.4)'
                        : '0 4px 14px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <CheckSquare size={17} />
                  <span>Confirmar Decisão</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
