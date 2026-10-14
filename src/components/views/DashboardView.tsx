import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  TrendingUp,
  Award,
  Users,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Heart,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  ExternalLink,
  Flame,
  ChevronRight,
  BookOpen,
  Crown,
  Medal,
  Star,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isInternalUser, isExternalUser, isCorporateEmailValid } from '../../services/authService';
import { calculateUserGamification, USER_RANKS } from '../../services/gamificationService';
import type { Article, UserRankInfo } from '../../types';

interface DashboardViewProps {
  onSelectArticle?: (art: Article) => void;
  initialTab?: 'articles' | 'users';
  onTabChange?: (tab: 'articles' | 'users') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onSelectArticle,
  initialTab = 'articles',
  onTabChange,
}) => {
  const { articles, getUserPerformances, currentUser, categories, setSelectedArticle, users } = useApp();

  const isInternal = isInternalUser(currentUser);
  const isExternal = isExternalUser(currentUser);

  const [activeTab, setActiveTab] = useState<'articles' | 'users'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'articles' | 'users') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Estados de Filtro e Busca da Tabela Geral
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'LIKES' | 'DISLIKES' | 'VIEWS' | 'SATISFACTION' | 'DISAPPROVAL' | 'CODE' | 'RECENT'>('LIKES');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  if (isExternal) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', width: '100%' }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Área Restrita a Colaboradores Internos</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          O Painel de Auditoria e Dashboard Analítico não está disponível para clientes ou usuários externos.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // Métricas Globais
  // ----------------------------------------------------
  const totalArticles = articles.length;
  const pending = articles.filter((a) => a.currentStatus === 'PENDING').length;
  const inAdjustment = articles.filter((a) => a.currentStatus === 'IN_ADJUSTMENT').length;
  const approved = articles.filter((a) => a.currentStatus === 'APPROVED').length;
  const rejected = articles.filter((a) => a.currentStatus === 'REJECTED').length;
  const globalConversionRate = totalArticles > 0 ? Math.round((approved / totalArticles) * 100) : 0;

  // Métricas de Engajamento: Leituras e Likes
  const totalViews = useMemo(() => {
    return articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
  }, [articles]);

  const totalLikes = useMemo(() => {
    return articles.reduce((acc, a) => acc + (a.likesCount || 0), 0);
  }, [articles]);

  const totalDislikes = useMemo(() => {
    return articles.reduce((acc, a) => acc + (a.dislikesCount || 0), 0);
  }, [articles]);

  const satisfactionRate = useMemo(() => {
    const totalVotes = totalLikes + totalDislikes;
    if (totalVotes === 0) return 100;
    return Math.round((totalLikes / totalVotes) * 100);
  }, [totalLikes, totalDislikes]);

  const disapprovalRate = useMemo(() => {
    const totalVotes = totalLikes + totalDislikes;
    if (totalVotes === 0) return 0;
    return Math.round((totalDislikes / totalVotes) * 100);
  }, [totalLikes, totalDislikes]);

  // ----------------------------------------------------
  // Classificações / Rankings Específicos
  // ----------------------------------------------------
  // 1. Classificação dos Artigos Mais Lidos (Top 5)
  const mostReadArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5);
  }, [articles]);

  const maxViews = useMemo(() => {
    return mostReadArticles[0]?.viewCount || 1;
  }, [mostReadArticles]);

  // 2. Classificação dos Artigos com Mais Likes (Top 5)
  const mostLikedArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 5);
  }, [articles]);

  const maxLikes = useMemo(() => {
    return mostLikedArticles[0]?.likesCount || 1;
  }, [mostLikedArticles]);

  // 3. Classificação dos Artigos com Mais Deslikes / Rejeição (Alerta Editorial)
  const mostDislikedArticles = useMemo(() => {
    return [...articles]
      .filter((a) => (a.dislikesCount || 0) > 0)
      .sort((a, b) => (b.dislikesCount || 0) - (a.dislikesCount || 0))
      .slice(0, 5);
  }, [articles]);

  const maxDislikes = useMemo(() => {
    return mostDislikedArticles[0]?.dislikesCount || 1;
  }, [mostDislikedArticles]);

  // ----------------------------------------------------
  // Tabela Analítica Completa com Filtros e Ordenação
  // ----------------------------------------------------
  const filteredAndSortedArticles = useMemo(() => {
    return articles
      .filter((art) => {
        const matchesCategory =
          selectedCategoryFilter === 'ALL' || art.categoryId === selectedCategoryFilter;
        if (!matchesCategory) return false;

        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesCode = (art.code || '').toLowerCase().includes(q);
        const matchesCat = (art.categoryName || '').toLowerCase().includes(q);
        const matchesAuthor = (art.authorName || '').toLowerCase().includes(q);
        return matchesTitle || matchesCode || matchesCat || matchesAuthor;
      })
      .sort((a, b) => {
        if (sortBy === 'LIKES') {
          return (b.likesCount || 0) - (a.likesCount || 0);
        }
        if (sortBy === 'DISLIKES') {
          return (b.dislikesCount || 0) - (a.dislikesCount || 0);
        }
        if (sortBy === 'VIEWS') {
          return (b.viewCount || 0) - (a.viewCount || 0);
        }
        if (sortBy === 'SATISFACTION') {
          const totalA = (a.likesCount || 0) + (a.dislikesCount || 0);
          const rateA = totalA > 0 ? (a.likesCount || 0) / totalA : 0;
          const totalB = (b.likesCount || 0) + (b.dislikesCount || 0);
          const rateB = totalB > 0 ? (b.likesCount || 0) / totalB : 0;
          return rateB - rateA;
        }
        if (sortBy === 'DISAPPROVAL') {
          const totalA = (a.likesCount || 0) + (a.dislikesCount || 0);
          const disA = totalA > 0 ? (a.dislikesCount || 0) / totalA : 0;
          const totalB = (b.likesCount || 0) + (b.dislikesCount || 0);
          const disB = totalB > 0 ? (b.dislikesCount || 0) / totalB : 0;
          return disB - disA;
        }
        if (sortBy === 'CODE') {
          const numA = parseInt((a.code || '').replace(/\D/g, '') || '0', 10);
          const numB = parseInt((b.code || '').replace(/\D/g, '') || '0', 10);
          return numA - numB;
        }
        if (sortBy === 'RECENT') {
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        }
        return 0;
      });
  }, [articles, searchTerm, selectedCategoryFilter, sortBy]);

  // Desempenho individual por colaborador interno (patentes e ranking exclusivos para usuários internos)
  const performances = useMemo(() => {
    return getUserPerformances().filter((p) => {
      const u = users.find((usr) => usr.email.toLowerCase() === p.userEmail.toLowerCase());
      return u ? isInternalUser(u) : isCorporateEmailValid(p.userEmail);
    });
  }, [getUserPerformances, users]);

  // Mapeamento e Classificação Geral de Patentes dos Usuários
  const userRankings = useMemo(() => {
    return performances
      .map((perf) => {
        const gamification = calculateUserGamification(perf.userEmail, articles);
        const userArticles = articles.filter(
          (a) => a.authorEmail && a.authorEmail.trim().toLowerCase() === perf.userEmail.trim().toLowerCase()
        );
        const totalUserLikes = userArticles.reduce((acc, a) => acc + (a.likesCount || 0), 0);
        const totalUserViews = userArticles.reduce((acc, a) => acc + (a.viewCount || 0), 0);

        return {
          ...perf,
          points: gamification.points,
          rank: gamification.rank,
          articlesCount: gamification.articlesCount,
          publishedCount: gamification.publishedCount,
          adjustmentsCount: gamification.adjustmentsCount,
          reviewsCount: gamification.reviewsCount,
          progressPercentage: gamification.progressPercentage,
          totalLikes: totalUserLikes,
          totalViews: totalUserViews,
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.publishedCount !== a.publishedCount) return b.publishedCount - a.publishedCount;
        return b.totalLikes - a.totalLikes;
      });
  }, [performances, articles]);

  const filteredUserRankings = useMemo(() => {
    if (!userSearchTerm.trim()) return userRankings;
    const q = userSearchTerm.toLowerCase();
    return userRankings.filter(
      (u) =>
        u.userName.toLowerCase().includes(q) ||
        u.userEmail.toLowerCase().includes(q) ||
        u.rank.title.toLowerCase().includes(q)
    );
  }, [userRankings, userSearchTerm]);

  // Métricas da Equipe de Usuários
  const totalTeamSubmitted = useMemo(() => {
    return performances.reduce((acc, p) => acc + p.submittedCount, 0);
  }, [performances]);

  const totalTeamApproved = useMemo(() => {
    return performances.reduce((acc, p) => acc + p.approvedCount, 0);
  }, [performances]);

  const avgTeamConversion = useMemo(() => {
    if (performances.length === 0) return 0;
    return Math.round(performances.reduce((acc, p) => acc + p.conversionRate, 0) / performances.length);
  }, [performances]);

  const totalTeamLikes = useMemo(() => {
    return userRankings.reduce((acc, u) => acc + u.totalLikes, 0);
  }, [userRankings]);

  const handleArticleClick = (art: Article) => {
    if (onSelectArticle) {
      onSelectArticle(art);
    } else {
      setSelectedArticle(art);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: '🥇', label: '1º Lugar', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', color: '#f59e0b' };
    if (index === 1) return { icon: '🥈', label: '2º Lugar', bg: 'rgba(156, 163, 175, 0.15)', border: '#9ca3af', color: '#cbd5e1' };
    if (index === 2) return { icon: '🥉', label: '3º Lugar', bg: 'rgba(217, 119, 6, 0.15)', border: '#d97706', color: '#fb923c' };
    return { icon: `#${index + 1}`, label: `${index + 1}º`, bg: 'var(--bg-surface)', border: 'var(--border-subtle)', color: 'var(--text-muted)' };
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1240px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Painel Analítico & Auditoria Corporativa
          </span>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-main)', margin: '4px 0 6px 0', letterSpacing: '-0.02em', fontWeight: 800 }}>
            {activeTab === 'articles' ? 'Dashboard de Artigos, Leituras & Likes' : 'Dashboard de Usuários, Patentes & Produtividade'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '750px', lineHeight: 1.5 }}>
            {activeTab === 'articles'
              ? 'Classificação em tempo real dos manuais mais lidos e mais curtidos pela comunidade, com quantidade exata de likes de cada artigo e auditoria editorial.'
              : 'Classificação oficial das patentes dos colaboradores, pontuação acumulada por contribuição, quantidade de artigos e engajamento da equipe.'}
          </p>
        </div>
      </div>

      {/* Subcategorias da Dashboard */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '28px',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('articles')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'articles' ? 700 : 500,
            cursor: 'pointer',
            background: activeTab === 'articles' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'articles' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} />
          <span>Dashboard de Artigos</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'articles' ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-surface)',
              color: activeTab === 'articles' ? '#ffffff' : 'var(--text-main)',
            }}
          >
            {totalArticles}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'users' ? 700 : 500,
            cursor: 'pointer',
            background: activeTab === 'users' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'users' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          <Users size={16} />
          <span>Dashboard de Usuários & Patentes</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'users' ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-surface)',
              color: activeTab === 'users' ? '#ffffff' : 'var(--text-main)',
            }}
          >
            {userRankings.length}
          </span>
        </button>
      </div>

      {/* ==================================================================
          ABA 1: SUBCATEGORIA DE ARTIGOS
          ================================================================== */}
      {activeTab === 'articles' && (
        <>
          {/* Global KPIs Cards */}
          {/* Global KPIs Cards - 3 em cima e 3 em baixo */}
          <div
            className="kpi-grid-3x2"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {/* LINHA 1 (EM CIMA) - CARD 1: Total de Leituras */}
            <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Leituras Globais</span>
                <Eye size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#38bdf8' }}>
                {totalViews.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Visualizações de manuais</span>
            </div>

            {/* LINHA 1 (EM CIMA) - CARD 2: Total de Likes */}
            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Curtidas (Likes)</span>
                <ThumbsUp size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981' }}>
                {totalLikes.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Avaliações positivas</span>
            </div>

            {/* LINHA 1 (EM CIMA) - CARD 3: Total de Deslikes (Desaprovação) */}
            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Deslikes (Desaprovação)</span>
                <ThumbsDown size={18} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ef4444' }}>
                {totalDislikes.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{disapprovalRate}% taxa de desaprovação</span>
            </div>

            {/* LINHA 2 (EM BAIXO) - CARD 4: Índice de Satisfação */}
            <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Satisfação dos Leitores</span>
                <Heart size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f59e0b' }}>
                {satisfactionRate}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Aprovação nos feedbacks</span>
            </div>

            {/* LINHA 2 (EM BAIXO) - CARD 5: Total de Manuais Publicados */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Artigos Cadastrados</span>
                <FileText size={18} color="var(--color-primary)" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {totalArticles}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{approved} ativos na base oficial</span>
            </div>

            {/* LINHA 2 (EM BAIXO) - CARD 6: Fila Editorial */}
            <div className="card" style={{ borderLeft: '4px solid var(--status-pending)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Fila Editorial</span>
                <Clock size={18} color="var(--status-pending)" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--status-pending)' }}>
                {pending + inAdjustment}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{pending} aguardando / {inAdjustment} em ajuste</span>
            </div>
          </div>

      {/* ==================================================================
          SEÇÃO DE RANKINGS / CLASSIFICAÇÃO DOS ARTIGOS (LADO A LADO)
          ================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {/* CARD 1: CLASSIFICAÇÃO DOS ARTIGOS MAIS LIDOS */}
        <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Eye size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.08rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                  Top Artigos Mais Lidos
                </h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                  Classificação por total de acessos & visualizações
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
              }}
            >
              Ranking de Acessos
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mostReadArticles.map((art, idx) => {
              const rank = getRankBadge(idx);
              const pct = maxViews > 0 ? Math.round(((art.viewCount || 0) / maxViews) * 100) : 0;

              return (
                <div
                  key={art.id}
                  onClick={() => handleArticleClick(art)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card-hover)',
                    border: `1px solid ${idx === 0 ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = idx === 0 ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, marginRight: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: rank.bg,
                          color: rank.color,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {rank.icon}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'var(--bg-surface)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--border-subtle)',
                          flexShrink: 0,
                        }}
                      >
                        {art.code || 'CC-DOC'}
                      </span>
                      <strong
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={art.title}
                      >
                        {art.title}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontWeight: 800, fontSize: '0.86rem' }}>
                        <Eye size={13} />
                        <span>{art.viewCount || 0}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981', fontSize: '0.78rem', fontWeight: 700 }} title="Curtidas conquistadas">
                        <ThumbsUp size={12} />
                        <span>{art.likesCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Proporção Visual */}
                  <div
                    style={{
                      height: '5px',
                      width: '100%',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #38bdf8, #6c63ff)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 2: CLASSIFICAÇÃO DOS ARTIGOS MAIS CURTIDOS (MAIS LIKES) */}
        <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <ThumbsUp size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.08rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                  Top Artigos Mais Curtidos
                </h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                  Classificação por quantidade de likes & aprovação dos leitores
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
              }}
            >
              Ranking de Likes
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mostLikedArticles.map((art, idx) => {
              const rank = getRankBadge(idx);
              const pct = maxLikes > 0 ? Math.round(((art.likesCount || 0) / maxLikes) * 100) : 0;
              const totalVotes = (art.likesCount || 0) + (art.dislikesCount || 0);
              const satisfaction = totalVotes > 0 ? Math.round(((art.likesCount || 0) / totalVotes) * 100) : 100;

              return (
                <div
                  key={art.id}
                  onClick={() => handleArticleClick(art)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card-hover)',
                    border: `1px solid ${idx === 0 ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = idx === 0 ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, marginRight: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: rank.bg,
                          color: rank.color,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {rank.icon}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'var(--bg-surface)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--border-subtle)',
                          flexShrink: 0,
                        }}
                      >
                        {art.code || 'CC-DOC'}
                      </span>
                      <strong
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={art.title}
                      >
                        {art.title}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <ThumbsUp size={12} />
                        <span>{art.likesCount || 0} likes</span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }} title="Taxa de aprovação dos leitores">
                        {satisfaction}% útil
                      </span>
                    </div>
                  </div>

                  {/* Barra de Proporção Visual */}
                  <div
                    style={{
                      height: '5px',
                      width: '100%',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #10b981, #5cb780)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3: CLASSIFICAÇÃO DOS ARTIGOS COM MAIS DESLIKES (ALERTA DE DESAPROVAÇÃO) */}
        <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <ThumbsDown size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.08rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                  Top Artigos com Mais Deslikes
                </h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                  Alerta editorial por quantidade de deslikes & desaprovação
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
              }}
            >
              Alerta de Revisão
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mostDislikedArticles.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nenhum deslike registrado!
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                  Todos os manuais avaliados possuem aprovação positiva dos leitores.
                </span>
              </div>
            ) : (
              mostDislikedArticles.map((art, idx) => {
                const pct = maxDislikes > 0 ? Math.round(((art.dislikesCount || 0) / maxDislikes) * 100) : 0;
                const totalVotes = (art.likesCount || 0) + (art.dislikesCount || 0);
                const disPct = totalVotes > 0 ? Math.round(((art.dislikesCount || 0) / totalVotes) * 100) : 0;

                return (
                  <div
                    key={art.id}
                    onClick={() => handleArticleClick(art)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card-hover)',
                      border: `1px solid ${idx === 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ef4444';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = idx === 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, marginRight: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'var(--bg-surface)',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--border-subtle)',
                            flexShrink: 0,
                          }}
                        >
                          {art.code || 'CC-DOC'}
                        </span>
                        <strong
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={art.title}
                        >
                          {art.title}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          <ThumbsDown size={12} />
                          <span>{art.dislikesCount || 0} deslikes</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 700 }} title="Taxa de desaprovação dos leitores">
                          {disPct}% desaprov.
                        </span>
                      </div>
                    </div>

                    {/* Barra de Proporção Visual */}
                    <div
                      style={{
                        height: '5px',
                        width: '100%',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #ef4444, #f87171)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================
          TABELA GERAL: QUANTIDADE DE LIKES E LEITURAS DE CADA ARTIGO
          ================================================================== */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="var(--color-primary)" />
              <span>Auditoria Geral: Quantidade de Likes & Leituras por Artigo</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              Métricas individuais e ranking completo de satisfação de todos os artigos da Base de Conhecimento
            </span>
          </div>

          {/* Filtros e Ordenação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Campo de Busca Rápida */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Buscar manual ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Filtro por Categoria */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Ordenador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setSortBy('LIKES')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sortBy === 'LIKES' ? '#10b981' : 'transparent',
                  color: sortBy === 'LIKES' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Ordenar por Mais Curtidos (Likes)"
              >
                <ThumbsUp size={12} />
                <span>Mais Likes</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('VIEWS')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sortBy === 'VIEWS' ? '#38bdf8' : 'transparent',
                  color: sortBy === 'VIEWS' ? '#0f172a' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Ordenar por Mais Lidos (Visualizações)"
              >
                <Eye size={12} />
                <span>Mais Lidos</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('SATISFACTION')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sortBy === 'SATISFACTION' ? '#f59e0b' : 'transparent',
                  color: sortBy === 'SATISFACTION' ? '#0f172a' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Ordenar por Taxa de Satisfação (% Aprovação)"
              >
                % Satisfação
              </button>
              <button
                type="button"
                onClick={() => setSortBy('DISLIKES')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sortBy === 'DISLIKES' ? '#ef4444' : 'transparent',
                  color: sortBy === 'DISLIKES' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Ordenar por Mais Deslikes (Desaprovação)"
              >
                <ThumbsDown size={12} />
                <span>Mais Deslikes</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('DISAPPROVAL')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sortBy === 'DISAPPROVAL' ? '#ef4444' : 'transparent',
                  color: sortBy === 'DISAPPROVAL' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Ordenar por Maior Taxa de Desaprovação"
              >
                % Desaprovação
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)', background: 'var(--bg-sidebar)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600, width: '50px', textAlign: 'center' }}>Posição</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Manual / Artigo</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Autor</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Leituras (Acessos)</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Quantidade de Likes</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Deslikes (Desaprovação)</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, minWidth: '160px' }}>Aprovação / Desaprov.</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedArticles.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum artigo encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredAndSortedArticles.map((art, idx) => {
                  const totalVotes = (art.likesCount || 0) + (art.dislikesCount || 0);
                  const approvalPct = totalVotes > 0 ? Math.round(((art.likesCount || 0) / totalVotes) * 100) : 100;
                  const rank = getRankBadge(idx);

                  return (
                    <tr
                      key={art.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Posição / Classificação */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            background: rank.bg,
                            color: rank.color,
                            fontWeight: 800,
                          }}
                        >
                          {rank.icon}
                        </span>
                      </td>

                      {/* Manual / Artigo */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--bg-surface)',
                              color: 'var(--color-primary)',
                              border: '1px solid var(--border-subtle)',
                              flexShrink: 0,
                            }}
                          >
                            {art.code || 'CC-DOC'}
                          </span>
                          <strong
                            style={{
                              color: 'var(--text-main)',
                              cursor: 'pointer',
                              fontSize: '0.88rem',
                            }}
                            onClick={() => handleArticleClick(art)}
                            title="Clique para ler o artigo"
                          >
                            {art.title}
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', marginTop: '2px' }}>
                          Categoria: {art.categoryName || 'Geral'}
                        </span>
                      </td>

                      {/* Autor */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.82rem' }}>
                          {art.authorName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                          {art.authorEmail}
                        </div>
                      </td>

                      {/* Leituras */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#38bdf8', fontWeight: 800 }}>
                          <Eye size={13} />
                          <span>{(art.viewCount || 0).toLocaleString('pt-BR')}</span>
                        </div>
                      </td>

                      {/* Quantidade de Likes (Destaque Principal Solicitado) */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                          }}
                          title={`${art.likesCount || 0} curtidas positivas recebidas`}
                        >
                          <ThumbsUp size={13} />
                          <span>{art.likesCount || 0} likes</span>
                        </div>
                      </td>

                      {/* Deslikes (Métricas de Desaprovação) */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {(art.dislikesCount || 0) > 0 ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                            }}
                            title={`${art.dislikesCount || 0} avaliações negativas recebidas`}
                          >
                            <ThumbsDown size={12} />
                            <span>{art.dislikesCount || 0} deslikes</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                            0
                          </span>
                        )}
                      </td>

                      {/* Taxa de Aprovação / Desaprovação */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              background: 'var(--bg-surface)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div
                              style={{
                                width: `${approvalPct}%`,
                                height: '100%',
                                background:
                                  approvalPct >= 80
                                    ? '#10b981'
                                    : approvalPct >= 50
                                    ? '#f59e0b'
                                    : '#ef4444',
                                borderRadius: 'var(--radius-full)',
                              }}
                            />
                          </div>
                          <div style={{ minWidth: '65px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: approvalPct >= 80 ? '#10b981' : approvalPct >= 50 ? '#f59e0b' : '#ef4444' }}>
                              {approvalPct}%
                            </span>
                            {(art.dislikesCount || 0) > 0 && (
                              <span style={{ fontSize: '0.67rem', color: '#ef4444', display: 'block', fontWeight: 700 }}>
                                {100 - approvalPct}% desap.
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background:
                              art.currentStatus === 'APPROVED'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : art.currentStatus === 'IN_ADJUSTMENT'
                                ? 'rgba(56, 189, 248, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color:
                              art.currentStatus === 'APPROVED'
                                ? '#10b981'
                                : art.currentStatus === 'IN_ADJUSTMENT'
                                ? '#38bdf8'
                                : '#f59e0b',
                          }}
                        >
                          {art.currentStatus === 'APPROVED'
                            ? 'Publicado'
                            : art.currentStatus === 'IN_ADJUSTMENT'
                            ? 'Em Ajuste'
                            : 'Pendente'}
                        </span>
                      </td>

                      {/* Ação */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleArticleClick(art)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '0.76rem' }}
                        >
                          <BookOpen size={12} />
                          <span>Ler</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* ==================================================================
      ABA 2: SUBCATEGORIA DE USUÁRIOS & PATENTES
      ================================================================== */}
  {activeTab === 'users' && (
    <>
      {/* KPIs da Equipe / Usuários */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* Colaboradores Ativos */}
        <div className="card" style={{ borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Colaboradores Ativos</span>
            <Users size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#a855f7' }}>
            {userRankings.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Na equipe interna</span>
        </div>

        {/* Total Submetido */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Artigos Submetidos</span>
            <FileText size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {totalTeamSubmitted}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Pela equipe de redatores</span>
        </div>

        {/* Artigos Aprovados */}
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Artigos Aprovados</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981' }}>
            {totalTeamApproved}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Oficiais na base</span>
        </div>

        {/* Curtidas Conquistadas */}
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Likes Conquistados</span>
            <ThumbsUp size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f59e0b' }}>
            {totalTeamLikes}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Em manuais da equipe</span>
        </div>

        {/* Taxa de Conversão */}
        <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Média de Conversão</span>
            <TrendingUp size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#38bdf8' }}>
            {avgTeamConversion}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Aprovação editorial</span>
        </div>
      </div>

      {/* ==================================================================
          TABELA DE CLASSIFICAÇÃO DAS PATENTES DOS USUÁRIOS
          ================================================================== */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={22} color="#f59e0b" />
              <span>Classificação de Patentes & Gamificação dos Usuários</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              Ranking oficial dos colaboradores apontando classificação por patente, pontos acumulados, quantidade de artigos e likes conquistados
            </span>
          </div>

          {/* Busca Rápida de Usuários */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              placeholder="Buscar colaborador ou patente..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)', background: 'var(--bg-sidebar)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600, width: '90px', textAlign: 'center' }}>Classificação</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Colaborador</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Patente Conquistada</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Pontos Acumulados</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Quantidade de Artigos</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Likes Conquistados</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Conversão Editorial</th>
              </tr>
            </thead>
            <tbody>
              {filteredUserRankings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum colaborador encontrado com os critérios de busca.
                  </td>
                </tr>
              ) : (
                filteredUserRankings.map((user, idx) => {
                  const rank = getRankBadge(idx);
                  const isLeader = idx === 0;
                  const initials = user.userName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={user.userId}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                        background: isLeader ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isLeader ? 'rgba(245, 158, 11, 0.03)' : 'transparent')
                      }
                    >
                      {/* Classificação / Ranking */}
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: rank.bg,
                            color: rank.color,
                            border: `1px solid ${rank.border}`,
                            fontWeight: 800,
                            fontSize: '0.82rem',
                          }}
                        >
                          <span>{rank.icon}</span>
                          <span>{idx + 1}º</span>
                        </span>
                      </td>

                      {/* Colaborador */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-surface)',
                              border: `2px solid ${user.rank.color}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              color: user.rank.color,
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                {user.userName}
                              </strong>
                              {isLeader && (
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    color: '#f59e0b',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                  }}
                                >
                                  ⭐ Líder Geral
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block' }}>
                              {user.userEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Patente Conquistada */}
                      <td style={{ padding: '14px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '5px 12px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-surface)',
                            border: `1.5px solid ${user.rank.color}`,
                            boxShadow: `0 2px 8px ${user.rank.color}20`,
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{user.rank.badge}</span>
                          <div>
                            <div style={{ fontWeight: 800, color: user.rank.color, fontSize: '0.82rem', lineHeight: 1.1 }}>
                              {user.rank.title}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--text-subtle)' }}>
                              Nível {user.rank.level} de 5
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pontos Acumulados & Progresso */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                          <Sparkles size={13} color="#f59e0b" />
                          <strong style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 900 }}>
                            {user.points.toLocaleString('pt-BR')}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>pts</span>
                        </div>
                        <div style={{ width: '130px' }}>
                          <div
                            style={{
                              height: '5px',
                              width: '100%',
                              background: 'var(--bg-surface)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${user.progressPercentage}%`,
                                background: user.rank.gradient,
                                borderRadius: 'var(--radius-full)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.67rem', color: 'var(--text-subtle)', display: 'block', marginTop: '2px' }}>
                            {user.rank.nextRankPoints
                              ? `${user.points} / ${user.rank.nextRankPoints} pts (${user.progressPercentage}%)`
                              : 'Patente Máxima Atingida 👑'}
                          </span>
                        </div>
                      </td>

                      {/* Quantidade de Artigos */}
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                          {user.submittedCount} artigos
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '3px' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              color: '#10b981',
                              fontWeight: 700,
                              background: 'rgba(16, 185, 129, 0.12)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                            title="Artigos publicados oficialmente na base"
                          >
                            ✓ {user.approvedCount} aprovados
                          </span>
                          {user.adjustmentCount > 0 && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: '#38bdf8',
                                fontWeight: 600,
                                background: 'rgba(56, 189, 248, 0.12)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                              title="Artigos atualmente em fase de ajuste"
                            >
                              {user.adjustmentCount} ajuste
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Likes Conquistados */}
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                          }}
                          title={`${user.totalLikes} likes conquistados nos artigos deste colaborador`}
                        >
                          <ThumbsUp size={12} />
                          <span>{user.totalLikes} likes</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block', marginTop: '2px' }}>
                          {user.totalViews.toLocaleString('pt-BR')} leituras
                        </span>
                      </td>

                      {/* Conversão Editorial */}
                      <td style={{ padding: '14px', minWidth: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              background: 'var(--bg-surface)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div
                              style={{
                                width: `${user.conversionRate}%`,
                                height: '100%',
                                background:
                                  user.conversionRate >= 75
                                    ? '#10b981'
                                    : user.conversionRate >= 50
                                    ? '#f59e0b'
                                    : '#ef4444',
                                borderRadius: 'var(--radius-full)',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              minWidth: '35px',
                              textAlign: 'right',
                              color: user.conversionRate >= 75 ? '#10b981' : 'var(--text-main)',
                            }}
                          >
                            {user.conversionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================
          GUIA & RÉGUA DE EVOLUÇÃO DE PATENTES
          ================================================================== */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Medal size={18} color="var(--color-primary)" />
              <span>Hierarquia de Patentes & Critérios de Pontuação</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              Entenda como os colaboradores progridem de patente na Base de Conhecimento através de contribuições ativas
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
              +50 pts Submissão Inicial
            </span>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
              +50 pts Aprovação (Teto 100 pts)
            </span>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 700 }}>
              +20 pts Edição Aprovada
            </span>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700 }}>
              -50 pts Reprovação Inicial
            </span>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', fontWeight: 700 }}>
              +30 pts Revisão Técnica (Redator)
            </span>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
              +10 pts Like / -10 pts Dislike (Teto -50 pts)
            </span>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700 }}>
              🚨 5 Dislikes: Revisão Obrigatória (-30 pts Revisor)
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {USER_RANKS.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-hover)',
                border: `1.5px solid ${r.color}40`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.8rem' }}>{r.badge}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: `${r.color}20`,
                    color: r.color,
                    border: `1px solid ${r.color}50`,
                  }}
                >
                  Nível {r.level}
                </span>
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block', fontWeight: 800 }}>
                  {r.title}
                </strong>
                <span style={{ fontSize: '0.76rem', color: r.color, fontWeight: 700, display: 'block' }}>
                  {r.minPoints} {r.nextRankPoints !== null ? `a ${r.nextRankPoints - 1} pts` : '+ pts (Tier Máximo Ilimitado)'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  Meta: {r.minApprovedArticles} {r.minApprovedArticles === 1 ? 'artigo aprovado' : 'artigos aprovados'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================
          TABELA DE DESEMPENHO EDITORIAL POR COLABORADOR (PRODUTIVIDADE)
          ================================================================== */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <Award size={18} color="var(--color-primary)" />
              <span>Desempenho Editorial por Colaborador</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              Métricas detalhadas de submissão, taxa de aprovação e retrabalho editorial na equipe interna
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)', background: 'var(--bg-sidebar)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Colaborador</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Total Submetido</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Aprovados</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Em Ajuste</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>Reprovados</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Taxa de Conversão</th>
              </tr>
            </thead>
            <tbody>
              {performances.map((perf) => (
                <tr
                  key={perf.userId}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{perf.userName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{perf.userEmail}</div>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center', fontWeight: 700 }}>
                    {perf.submittedCount}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>
                    {perf.approvedCount}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#3b82f6', fontWeight: 700 }}>
                    {perf.adjustmentCount}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>
                    {perf.rejectedCount}
                  </td>
                  <td style={{ padding: '14px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '8px',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div
                          style={{
                            width: `${perf.conversionRate}%`,
                            height: '100%',
                            background:
                              perf.conversionRate >= 75
                                ? 'var(--status-approved)'
                                : perf.conversionRate >= 50
                                ? 'var(--status-pending)'
                                : 'var(--status-rejected)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>
                        {perf.conversionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}
    </div>
  );
};
