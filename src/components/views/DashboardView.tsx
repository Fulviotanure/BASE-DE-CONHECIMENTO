import React from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { articles, getUserPerformances, currentUser } = useApp();

  const isCorporate = Boolean(currentUser?.email?.toLowerCase().endsWith('@conciliadorcontabil.com.br'));
  const isExternal = currentUser?.role === 'READER' || currentUser?.userType === 'EXTERNAL' || !isCorporate;

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

  const total = articles.length;
  const pending = articles.filter((a) => a.currentStatus === 'PENDING').length;
  const inAdjustment = articles.filter((a) => a.currentStatus === 'IN_ADJUSTMENT').length;
  const approved = articles.filter((a) => a.currentStatus === 'APPROVED').length;
  const rejected = articles.filter((a) => a.currentStatus === 'REJECTED').length;

  const globalConversionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Garante estritamente apenas colaboradores da equipe interna
  const performances = getUserPerformances().filter((p) =>
    p.userEmail.toLowerCase().endsWith('@conciliadorcontabil.com.br')
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Painel de Gestão & Auditoria
        </span>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '4px 0 6px 0' }}>
          Dashboard Analítico & Produtividade
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Indicadores em tempo real da volumetria editorial e tabela de desempenho individual por operador da Conciliador Contábil.
        </p>
      </div>

      {/* Global KPIs Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Total de Inputs</span>
            <FileText size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Artigos gerados na base</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--status-pending)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Fila de Revisão</span>
            <Clock size={18} color="var(--status-pending)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-pending)' }}>{pending}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Aguardando parecer do editor</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--status-adjust)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Em Ajuste</span>
            <RotateCcw size={18} color="var(--status-adjust)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-adjust)' }}>{inAdjustment}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Devolvidos com notas técnicas</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--status-approved)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Aprovados</span>
            <CheckCircle2 size={18} color="var(--status-approved)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-approved)' }}>{approved}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Publicados na base oficial</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Taxa de Conversão</span>
            <TrendingUp size={18} color="var(--color-secondary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
            {globalConversionRate}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Aprovação direta vs total</span>
        </div>
      </div>

      {/* Tabela de Desempenho por Usuário */}
      <div className="card" style={{ padding: '24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--color-primary)" />
              <span>Desempenho Editorial por Colaborador</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              Métricas individuais de submissão, taxa de aprovação e retrabalho editorial
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
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
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
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
    </div>
  );
};
