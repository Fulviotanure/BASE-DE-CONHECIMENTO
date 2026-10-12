import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Trophy, Award } from 'lucide-react';
import type { UserRankInfo } from '../../types';

interface UserRankBadgeProps {
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
  showProgress?: boolean;
}

export const UserRankBadge: React.FC<UserRankBadgeProps> = ({
  email,
  size = 'md',
  showPoints = true,
  showProgress = false,
}) => {
  const { getUserGamification, currentUser } = useApp();
  const targetEmail = email || currentUser?.email || '';
  const gamification = getUserGamification(targetEmail);
  const { rank, points, progressPercentage } = gamification;

  if (size === 'sm') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-card)',
          border: `1px solid ${rank.color}40`,
          fontSize: '0.72rem',
          fontWeight: 700,
          color: rank.color,
        }}
        title={`Patente: ${rank.title} • ${points} pontos de conhecimento`}
      >
        <span>{rank.badge}</span>
        <span>{rank.title}</span>
        {showPoints && (
          <span style={{ opacity: 0.8, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            ({points} pts)
          </span>
        )}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div
        style={{
          padding: '16px',
          background: 'var(--bg-card)',
          border: `1px solid ${rank.color}40`,
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)',
              background: rank.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: `0 4px 10px ${rank.color}50`,
            }}
          >
            {rank.badge}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
              Patente Corporativa • Nível {rank.level}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: rank.color }}>
              {rank.title}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
              {points}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              pontos
            </span>
          </div>
        </div>

        {showProgress && rank.nextRankPoints !== null && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
              <span>Progresso para a próxima patente</span>
              <span>{progressPercentage}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  background: rank.gradient,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>{rank.minPoints} pts</span>
              <span>Próxima: {rank.nextRankPoints} pts</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default 'md' (usado no Header e cards)
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-card)',
        border: `1px solid ${rank.color}50`,
        cursor: 'default',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}
      title={`Patente: ${rank.title} • ${points} pontos de conhecimento`}
    >
      <span style={{ fontSize: '0.95rem' }}>{rank.badge}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: rank.color }}>
        {rank.title}
      </span>
      {showPoints && (
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            background: `${rank.color}18`,
            color: rank.color,
            padding: '1px 6px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {points} pts
        </span>
      )}
    </div>
  );
};
