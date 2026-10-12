import type { Article, SentEmail, UserProfile, UserRankInfo } from '../types';

const EMAILS_STORAGE_KEY = 'conciliador_sent_emails_v1';

export function getSentEmails(): SentEmail[] {
  try {
    const data = localStorage.getItem(EMAILS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Erro ao carregar e-mails enviados:', err);
  }
  return [];
}

export function saveSentEmail(email: Omit<SentEmail, 'id' | 'sentAt' | 'status'>): SentEmail {
  const newEmail: SentEmail = {
    ...email,
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    sentAt: new Date().toISOString(),
    status: 'SENT',
  };

  try {
    const list = getSentEmails();
    const updated = [newEmail, ...list].slice(0, 50); // Mantém os 50 mais recentes
    localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar e-mail:', err);
  }

  return newEmail;
}

export function clearSentEmails(): void {
  try {
    localStorage.removeItem(EMAILS_STORAGE_KEY);
  } catch {}
}

/**
 * 1. E-mail de Novo Artigo Submetido para Revisão
 */
export function sendArticleSubmittedEmail(article: Article, authorName?: string): SentEmail {
  const author = authorName || article.authorName || 'Colaborador';
  const subject = `📬 [Conciliador KB] Novo manual submetido para revisão: "${article.title}" (${article.code})`;
  
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(90deg, #5cb780, #38bdf8); padding: 4px;"></div>
      <div style="padding: 24px 28px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #ffffff; font-size: 1.25rem; font-weight: 800;">Conciliador Contábil • Fila Editorial</h2>
        </div>
        <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6;">
          Olá, equipe editorial! Um novo manual técnico foi submetido pelo colaborador <strong>${author}</strong> e aguarda sua curadoria:
        </p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <div style="display: inline-block; background: rgba(92, 183, 128, 0.2); color: #5cb780; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.75rem; margin-bottom: 8px;">
            ${article.code}
          </div>
          <h3 style="margin: 4px 0 8px 0; color: #ffffff; font-size: 1.1rem;">${article.title}</h3>
          <p style="margin: 0; font-size: 0.85rem; color: #94a3b8;">
            📁 <strong>Categoria:</strong> ${article.categoryName} ${article.subcategoryName ? `> ${article.subcategoryName}` : ''}<br/>
            ✍️ <strong>Autor:</strong> ${author} (${article.authorEmail})
          </p>
        </div>
        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5;">
          Acesse a <strong>Fila Editorial</strong> no sistema para revisar o conteúdo, aprovar ou solicitar ajustes na conversa em balões.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 0.75rem; color: #64748b; text-align: center;">
          Conciliador Contábil • Base de Conhecimento Corporativa • Suporte Operacional
        </div>
      </div>
    </div>
  `;

  return saveSentEmail({
    to: 'editorial@conciliadorcontabil.com.br',
    toName: 'Equipe Editorial & Revisores',
    subject,
    htmlBody,
    type: 'ARTICLE_SUBMITTED',
    articleTitle: article.title,
  });
}

/**
 * 2. E-mail de Artigo Devolvido com Feedback para Ajustes
 */
export function sendArticleNeedsAdjustmentEmail(
  article: Article,
  reviewerName: string,
  feedback: string
): SentEmail {
  const subject = `📝 [Conciliador KB] Ajustes solicitados no seu manual: "${article.title}" (${article.code})`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(90deg, #f59e0b, #ef4444); padding: 4px;"></div>
      <div style="padding: 24px 28px;">
        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 1.25rem; font-weight: 800;">
          Ajustes Solicitados pela Equipe Editorial
        </h2>
        <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6;">
          Olá, <strong>${article.authorName}</strong>! O revisor <strong>${reviewerName}</strong> analisou o seu artigo <strong>"${article.title}"</strong> (${article.code}) e solicitou alguns ajustes antes da publicação oficial.
        </p>
        <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 4px; padding: 14px 16px; margin: 20px 0;">
          <strong style="color: #fbbf24; font-size: 0.85rem; display: block; margin-bottom: 6px;">
            Mensagem do Revisor (${reviewerName}):
          </strong>
          <p style="margin: 0; font-size: 0.9rem; color: #f8fafc; line-height: 1.5;">
            "${feedback || 'Favor revisar os apontamentos na conversa em balões no editor do artigo.'}"
          </p>
        </div>
        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5;">
          Acesse a seção <strong>Meus Artigos</strong> no Conciliador KB para abrir o editor e responder às notas de revisão. Assim que finalizar, basta salvar para enviar de volta!
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 0.75rem; color: #64748b; text-align: center;">
          Conciliador Contábil • Central de Governança Editorial
        </div>
      </div>
    </div>
  `;

  return saveSentEmail({
    to: article.authorEmail,
    toName: article.authorName,
    subject,
    htmlBody,
    type: 'ARTICLE_NEEDS_ADJUSTMENT',
    articleTitle: article.title,
  });
}

/**
 * 3. E-mail de Artigo Aprovado & Publicado (DANDO PARABÉNS!)
 */
export function sendArticleApprovedEmail(
  article: Article,
  reviewerName: string
): SentEmail {
  const subject = `🎉 PARABÉNS! Seu artigo "${article.title}" foi aprovado e publicado com sucesso!`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid rgba(92, 183, 128, 0.4); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(90deg, #5cb780, #38bdf8, #6c63ff); padding: 6px;"></div>
      <div style="padding: 32px 28px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 8px;">🎉 🏆 👏</div>
        <h1 style="margin: 0 0 8px 0; color: #5cb780; font-size: 1.6rem; font-weight: 900; letter-spacing: -0.02em;">
          PARABÉNS, ${article.authorName.toUpperCase()}!
        </h1>
        <p style="font-size: 1.05rem; color: #e2e8f0; margin: 0 0 24px 0; font-weight: 600;">
          Seu manual foi aprovado com nota máxima e já está disponível para toda a equipe!
        </p>

        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; text-align: left; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="background: rgba(92, 183, 128, 0.2); color: #5cb780; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 0.8rem;">
              ${article.code} • OFICIAL
            </span>
            <span style="color: #94a3b8; font-size: 0.75rem;">
              Validado por ${reviewerName}
            </span>
          </div>
          <h3 style="margin: 0 0 10px 0; color: #ffffff; font-size: 1.15rem; font-weight: 700;">
            ${article.title}
          </h3>
          <p style="margin: 0; font-size: 0.85rem; color: #cbd5e1;">
            📁 <strong>Categoria:</strong> ${article.categoryName} ${article.subcategoryName ? `> ${article.subcategoryName}` : ''}
          </p>
        </div>

        <div style="background: rgba(92, 183, 128, 0.12); border: 1px solid rgba(92, 183, 128, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 24px; text-align: center;">
          <span style="font-size: 1.2rem; font-weight: 800; color: #5cb780; display: block; margin-bottom: 4px;">
            +100 PONTOS DE CONHECIMENTO GANHOS! 🌟
          </span>
          <span style="font-size: 0.82rem; color: #94a3b8;">
            Você está subindo de patente no ranking corporativo da Conciliador Contábil.
          </span>
        </div>

        <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5; margin-bottom: 24px;">
          Obrigado por compartilhar seu conhecimento e fortalecer a excelência operacional de toda a nossa empresa!
        </p>

        <div style="padding-top: 16px; border-top: 1px solid #334155; font-size: 0.75rem; color: #64748b;">
          Conciliador Contábil • Base de Conhecimento Oficial
        </div>
      </div>
    </div>
  `;

  return saveSentEmail({
    to: article.authorEmail,
    toName: article.authorName,
    subject,
    htmlBody,
    type: 'ARTICLE_APPROVED',
    articleTitle: article.title,
  });
}

/**
 * 4. E-mail de Promoção de Patente (Gamificação)
 */
export function sendRankPromotionEmail(
  user: UserProfile,
  newRank: UserRankInfo
): SentEmail {
  const subject = `🎖️ PARABÉNS! Você subiu de patente: ${newRank.badge} ${newRank.title}!`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid rgba(168, 85, 247, 0.4);">
      <div style="background: linear-gradient(90deg, #6c63ff, #a855f7, #f59e0b); padding: 6px;"></div>
      <div style="padding: 32px 28px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 8px;">🎖️ ⭐ 🚀</div>
        <h1 style="margin: 0 0 8px 0; color: #c084fc; font-size: 1.5rem; font-weight: 900;">
          NOVA PATENTE CONQUISTADA!
        </h1>
        <p style="font-size: 1rem; color: #cbd5e1; margin: 0 0 24px 0;">
          Parabéns, <strong>${user.displayName}</strong>! Sua dedicação e criação de manuais elevaram seu status na organização:
        </p>

        <div style="background: #1e293b; border: 2px solid ${newRank.color}; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 24px;">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">${newRank.badge}</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: ${newRank.color};">
            ${newRank.title}
          </div>
          <span style="font-size: 0.8rem; color: #94a3b8;">Nível ${newRank.level} • Mestre em Contabilidade e Regras</span>
        </div>

        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5;">
          Continue produzindo artigos de alta qualidade para alcançar a patente máxima de Guardião Lendário!
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 0.75rem; color: #64748b;">
          Conciliador Contábil • Sistema de Gamificação e Reconhecimento
        </div>
      </div>
    </div>
  `;

  return saveSentEmail({
    to: user.email,
    toName: user.displayName,
    subject,
    htmlBody,
    type: 'RANK_UP',
  });
}
