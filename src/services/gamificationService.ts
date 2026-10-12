import type { Article, UserProfile, UserRankInfo, UserGamification } from '../types';

export const USER_RANKS: UserRankInfo[] = [
  {
    id: 'rank-1',
    title: 'Aspirante do Saber',
    badge: '🌱',
    level: 1,
    minPoints: 0,
    nextRankPoints: 100,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    id: 'rank-2',
    title: 'Redator Bronze',
    badge: '🥉',
    level: 2,
    minPoints: 100,
    nextRankPoints: 300,
    color: '#cd7f32',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
  },
  {
    id: 'rank-3',
    title: 'Escritor Prata',
    badge: '🥈',
    level: 3,
    minPoints: 300,
    nextRankPoints: 600,
    color: '#94a3b8',
    gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
  },
  {
    id: 'rank-4',
    title: 'Mestre do Conteúdo Ouro',
    badge: '🥇',
    level: 4,
    minPoints: 600,
    nextRankPoints: 1000,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    id: 'rank-5',
    title: 'Guardião Lendário',
    badge: '👑',
    level: 5,
    minPoints: 1000,
    nextRankPoints: null,
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #6c63ff, #f59e0b)',
  },
];

export function getUserRank(points: number): UserRankInfo {
  for (let i = USER_RANKS.length - 1; i >= 0; i--) {
    if (points >= USER_RANKS[i].minPoints) {
      return USER_RANKS[i];
    }
  }
  return USER_RANKS[0];
}

/**
 * Calcula os pontos totais e a patente de um usuário com base no histórico de manuais e revisões
 */
export function calculateUserGamification(userEmail: string, articles: Article[]): UserGamification {
  if (!userEmail) {
    return {
      points: 0,
      rank: USER_RANKS[0],
      articlesCount: 0,
      publishedCount: 0,
      adjustmentsCount: 0,
      reviewsCount: 0,
      progressPercentage: 0,
    };
  }

  const clean = userEmail.trim().toLowerCase();
  const userArticles = articles.filter(
    (a) => a.authorEmail && a.authorEmail.trim().toLowerCase() === clean
  );

  const published = userArticles.filter((a) => a.currentStatus === 'APPROVED').length;
  const inAdjustment = userArticles.filter((a) => a.currentStatus === 'IN_ADJUSTMENT').length;
  const pending = userArticles.filter((a) => a.currentStatus === 'PENDING').length;

  // Contagem de revisões realizadas (se for revisor/admin que avaliou artigos de outros)
  let reviewsMade = 0;
  articles.forEach((a) => {
    if (a.authorEmail.toLowerCase() !== clean && a.reviews) {
      a.reviews.forEach((r) => {
        // Se a revisão foi feita por este usuário
        if (r.reviewerName && r.reviewerName.toLowerCase().includes(clean.split('@')[0])) {
          reviewsMade++;
        }
      });
    }
  });

  // Pontuação:
  // - Cada artigo publicado: +100 pontos
  // - Cada artigo submetido em análise: +50 pontos
  // - Cada artigo em ajuste: +20 pontos
  // - Cada revisão de artigo de colega: +30 pontos
  const points = (published * 100) + (pending * 50) + (inAdjustment * 20) + (reviewsMade * 30);
  const rank = getUserRank(points);

  let progressPercentage = 100;
  if (rank.nextRankPoints !== null) {
    const range = rank.nextRankPoints - rank.minPoints;
    const currentInRange = points - rank.minPoints;
    progressPercentage = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
  }

  return {
    points,
    rank,
    articlesCount: userArticles.length,
    publishedCount: published,
    adjustmentsCount: inAdjustment,
    reviewsCount: reviewsMade,
    progressPercentage,
  };
}
