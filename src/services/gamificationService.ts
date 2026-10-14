import type { Article, UserRankInfo, UserGamification } from '../types';

/**
 * Hierarquia Oficial de Patentes (10 Níveis)
 * A progressão exige o cumprimento simultâneo do saldo de pontos e da quantidade de artigos aprovados.
 * A lógica de artigos exige +4 artigos aprovados a cada nível a partir do Nível 3.
 * Após atingir o Nível 10 (Titã), o usuário continua acumulando pontos infinitamente dentro do seu tier.
 */
export const USER_RANKS: UserRankInfo[] = [
  {
    id: 'rank-1',
    title: 'Aspirante do Saber',
    badge: '🌱',
    level: 1,
    minPoints: 0,
    nextRankPoints: 100,
    minApprovedArticles: 0,
    nextRankArticles: 1,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    id: 'rank-2',
    title: 'Iniciante do Conhecimento',
    badge: '📘',
    level: 2,
    minPoints: 100,
    nextRankPoints: 200,
    minApprovedArticles: 1,
    nextRankArticles: 2,
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
  },
  {
    id: 'rank-3',
    title: 'Redator Bronze',
    badge: '🥉',
    level: 3,
    minPoints: 200,
    nextRankPoints: 600,
    minApprovedArticles: 2,
    nextRankArticles: 6,
    color: '#cd7f32',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
  },
  {
    id: 'rank-4',
    title: 'Escritor Prata',
    badge: '🥈',
    level: 4,
    minPoints: 600,
    nextRankPoints: 1000,
    minApprovedArticles: 6,
    nextRankArticles: 10,
    color: '#94a3b8',
    gradient: 'linear-gradient(135deg, #cbd5e1, #64748b)',
  },
  {
    id: 'rank-5',
    title: 'Mestre do Conteúdo Ouro',
    badge: '🥇',
    level: 5,
    minPoints: 1000,
    nextRankPoints: 1400,
    minApprovedArticles: 10,
    nextRankArticles: 14,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
  },
  {
    id: 'rank-6',
    title: 'Especialista do Conhecimento Platina',
    badge: '💠',
    level: 6,
    minPoints: 1400,
    nextRankPoints: 1800,
    minApprovedArticles: 14,
    nextRankArticles: 18,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #22d3ee, #0891b2)',
  },
  {
    id: 'rank-7',
    title: 'Visionário da Sabedoria',
    badge: '🔮',
    level: 7,
    minPoints: 1800,
    nextRankPoints: 2200,
    minApprovedArticles: 18,
    nextRankArticles: 22,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
  },
  {
    id: 'rank-8',
    title: 'Guardião Lendário da Sapiência',
    badge: '⚔️',
    level: 8,
    minPoints: 2200,
    nextRankPoints: 2600,
    minApprovedArticles: 22,
    nextRankArticles: 26,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #f472b6, #db2777)',
  },
  {
    id: 'rank-9',
    title: 'Oráculo Mítico da Erudição',
    badge: '🌌',
    level: 9,
    minPoints: 2600,
    nextRankPoints: 3000,
    minApprovedArticles: 26,
    nextRankArticles: 30,
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #facc15, #ca8a04, #9333ea)',
  },
  {
    id: 'rank-10',
    title: 'Titã de Toda Sabedoria',
    badge: '👑',
    level: 10,
    minPoints: 3000,
    nextRankPoints: null,
    minApprovedArticles: 30,
    nextRankArticles: null,
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #fb7185, #e11d48, #7c3aed, #f59e0b)',
  },
];

/**
 * Retorna a patente do usuário exigindo o cumprimento simultâneo de:
 * 1. Saldo de pontos acumulados
 * 2. Quantidade de artigos aprovados
 */
export function getUserRank(points: number, approvedArticlesCount: number = 0): UserRankInfo {
  for (let i = USER_RANKS.length - 1; i >= 0; i--) {
    const rank = USER_RANKS[i];
    if (points >= rank.minPoints && approvedArticlesCount >= rank.minApprovedArticles) {
      return rank;
    }
  }
  return USER_RANKS[0];
}

/**
 * Motor de Pontuação e Gamificação Corporativa:
 * 
 * 1. Operador (Criador de Conteúdo):
 *    - Artigo Submetido: +50 pts (no momento do envio do artigo novo).
 *    - Artigo Aprovado: +50 pts adicionais (atingindo o teto de 100 pts por artigo novo).
 *    - Artigo Editado e Aprovado: +20 pts.
 *    - Artigo Editado e Reprovado: 0 pts (não ganha pontos).
 *    - Artigo Reprovado (Submissão Inicial): -50 pts (autor perde os pontos da submissão, zerando o saldo).
 * 
 * 2. Redator (Revisor e Criador):
 *    - Revisão Técnica: +30 pts fixos por cada artigo de terceiros que for validado e aprovado.
 *    - 5 Deslikes: O revisor que aprovou perde os 30 pontos!
 *    - Criação e Edição do próprio redator: aplica-se exatamente a mesma regra do Operador.
 * 
 * 3. Engajamento e Qualidade (Likes e Dislikes):
 *    - Voto Positivo (Like): +10 pts para o autor do artigo.
 *    - Voto Negativo (Dislike): -10 pts subtraídos da pontuação do autor.
 *    - Teto de Dislike: O dislike só acumula no máximo 50 pontos de penalidade por artigo.
 *    - Proteção Absoluta: O saldo total do usuário nunca gera pontuação negativa (mínimo 0).
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
      nextRank: USER_RANKS[1],
      pointsProgress: 0,
      articlesProgress: 0,
      pointsToNextRank: 100,
      articlesToNextRank: 1,
      likesReceived: 0,
      dislikesReceived: 0,
      dislikesPenalty: 0,
      likesPoints: 0,
      reviewsPoints: 0,
    };
  }

  const clean = userEmail.trim().toLowerCase();
  const userArticles = articles.filter(
    (a) => a.authorEmail && a.authorEmail.trim().toLowerCase() === clean
  );

  const publishedArticles = userArticles.filter((a) => a.currentStatus === 'APPROVED');
  const publishedCount = publishedArticles.length;
  const inAdjustmentCount = userArticles.filter(
    (a) => a.currentStatus === 'IN_ADJUSTMENT' || a.currentStatus === 'NEEDS_REVISION'
  ).length;
  const pendingCount = userArticles.filter((a) => a.currentStatus === 'PENDING').length;

  let creationAndEditPoints = 0;
  let totalLikes = 0;
  let totalDislikes = 0;
  let totalDislikesPenalty = 0;
  let totalLikesPoints = 0;

  userArticles.forEach((art) => {
    const likes = art.likesCount || 0;
    const dislikes = art.dislikesCount || 0;
    totalLikes += likes;
    totalDislikes += dislikes;

    const lPoints = likes * 10;
    totalLikesPoints += lPoints;

    // Regra: O dislike só acumula o máximo de 50 pontos por artigo (5 deslikes * 10 = 50 pts máx)
    const dPenalty = Math.min(50, dislikes * 10);
    totalDislikesPenalty += dPenalty;

    // Pontuação de Autoria / Criação e Edição:
    if (art.currentStatus === 'APPROVED') {
      // Artigo novo aprovado: 100 pts (+50 inicial + 50 aprovação)
      // Artigo editado e aprovado: +20 pts por cada edição aprovada
      const editPoints = (art.editApprovedCount || 0) * 20;
      creationAndEditPoints += 100 + editPoints;
    } else if (art.currentStatus === 'PENDING') {
      // Se for edição em análise de artigo que já foi aprovado: mantém os 100 pts da aprovação base
      if (art.publishedAt || art.approvedByReviewerEmail) {
        creationAndEditPoints += 100;
      } else {
        // Artigo novo submetido aguardando revisão: +50 pts creditados no envio
        creationAndEditPoints += 50;
      }
    } else if (art.currentStatus === 'IN_ADJUSTMENT') {
      if (art.publishedAt || art.approvedByReviewerEmail) {
        creationAndEditPoints += 100;
      } else {
        creationAndEditPoints += 50;
      }
    } else if (art.currentStatus === 'NEEDS_REVISION') {
      // Artigo que estava aprovado e foi temporariamente suspenso por 5 deslikes
      creationAndEditPoints += 100;
    } else if (art.currentStatus === 'REJECTED') {
      // Artigo Reprovado (Submissão Inicial): -50 pts (perde os pontos da submissão inicial, zerando o saldo)
      // Artigo Editado e Reprovado: 0 pts (se era publicado, mantém base; se era inicial, 0 pts)
      if (art.publishedAt || art.approvedByReviewerEmail) {
        creationAndEditPoints += 100;
      } else {
        creationAndEditPoints += 0;
      }
    }
  });

  // Revisões Técnicas realizadas em artigos de terceiros:
  // Redator ganha +30 pts fixos por cada artigo validado e corrigido.
  // 5 Deslikes: O revisor que aprovou perde os 30 pontos daquele artigo!
  let reviewsMade = 0;
  let reviewsPoints = 0;

  articles.forEach((a) => {
    if (a.authorEmail && a.authorEmail.trim().toLowerCase() !== clean) {
      const isApprovedByThisUser =
        (a.approvedByReviewerEmail && a.approvedByReviewerEmail.trim().toLowerCase() === clean) ||
        (a.reviews &&
          a.reviews.some((r) => {
            const revEmailMatch = r.reviewerEmail && r.reviewerEmail.trim().toLowerCase() === clean;
            const revNameMatch =
              r.reviewerName && r.reviewerName.toLowerCase().includes(clean.split('@')[0]);
            return (revEmailMatch || revNameMatch) && r.action === 'APPROVE';
          }));

      if (isApprovedByThisUser) {
        reviewsMade++;
        const dCount = a.dislikesCount || 0;
        // Se o artigo acumulou 5 ou mais deslikes, o revisor perde os 30 pontos
        if (dCount < 5) {
          reviewsPoints += 30;
        }
      }
    }
  });

  // Saldo total com proteção absoluta contra pontuação negativa (nunca abaixo de 0)
  const rawPoints = creationAndEditPoints + totalLikesPoints - totalDislikesPenalty + reviewsPoints;
  const points = Math.max(0, rawPoints);

  // Patente e cálculo da meta simultânea (pontos + artigos aprovados)
  const rank = getUserRank(points, publishedCount);
  const nextRank = rank.level < 10 ? USER_RANKS[rank.level] : null;

  let progressPercentage = 100;
  let pointsProgress = 100;
  let articlesProgress = 100;
  let pointsToNextRank = 0;
  let articlesToNextRank = 0;

  if (nextRank) {
    const pointsSpan = nextRank.minPoints - rank.minPoints;
    const currentPointsInSpan = Math.max(0, points - rank.minPoints);
    pointsProgress =
      pointsSpan > 0
        ? Math.min(100, Math.max(0, Math.round((currentPointsInSpan / pointsSpan) * 100)))
        : 100;
    pointsToNextRank = Math.max(0, nextRank.minPoints - points);

    const articlesSpan = nextRank.minApprovedArticles - rank.minApprovedArticles;
    const currentArticlesInSpan = Math.max(0, publishedCount - rank.minApprovedArticles);
    articlesProgress =
      articlesSpan > 0
        ? Math.min(100, Math.max(0, Math.round((currentArticlesInSpan / articlesSpan) * 100)))
        : 100;
    articlesToNextRank = Math.max(0, nextRank.minApprovedArticles - publishedCount);

    // Média ponderada dos dois requisitos simultâneos
    progressPercentage = Math.round((pointsProgress + articlesProgress) / 2);
  }

  return {
    points,
    rank,
    articlesCount: userArticles.length,
    publishedCount,
    adjustmentsCount: inAdjustmentCount,
    reviewsCount: reviewsMade,
    progressPercentage,
    nextRank,
    pointsProgress,
    articlesProgress,
    pointsToNextRank,
    articlesToNextRank,
    likesReceived: totalLikes,
    dislikesReceived: totalDislikes,
    dislikesPenalty: totalDislikesPenalty,
    likesPoints: totalLikesPoints,
    reviewsPoints,
  };
}
