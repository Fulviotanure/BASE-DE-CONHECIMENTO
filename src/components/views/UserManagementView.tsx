import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  SlidersHorizontal,
  Globe,
  Search,
  Eye,
  User,
  X,
  FileText,
  Calendar,
  Sparkles,
  Shield,
  Clock,
  Trash2,
  AlertTriangle,
  Trophy,
  Heart,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isInternalUser, isCorporateEmailValid, isSuperAdminUser } from '../../services/authService';
import { UserRankBadge } from '../gamification/UserRankBadge';
import type { UserProfile, UserRole } from '../../types';

export const UserManagementView: React.FC = () => {
  const { 
    users, 
    articles, 
    updateUserRole, 
    toggleUserStatus, 
    deleteUser, 
    addNewUser, 
    currentUser,
    getUserEngagementStats,
    getUserGamification,
    setSelectedArticle,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'COLABORADORES' | 'USUARIOS'>('COLABORADORES');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Travar o scroll do body quando qualquer modal estiver aberto para manter o modal 100% no viewport
  useEffect(() => {
    const isAnyModalOpen = Boolean(selectedUserForProfile || isAddModalOpen || userToDelete);
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedUserForProfile, isAddModalOpen, userToDelete]);

  // Form de cadastro
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('OPERATOR');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Separação em Colaboradores (internos) e Usuários (externos) com desduplicação por e-mail
  const { colaboradoresList, usuariosList } = useMemo(() => {
    const colabMap = new Map<string, UserProfile>();
    const usuMap = new Map<string, UserProfile>();

    users.forEach((u) => {
      const cleanEmail = (u.email || '').trim().toLowerCase();
      if (!cleanEmail) return;

      const isInternal = isCorporateEmailValid(cleanEmail) || isInternalUser(u);
      const targetMap = isInternal ? colabMap : usuMap;

      const existing = targetMap.get(cleanEmail);
      if (!existing) {
        targetMap.set(cleanEmail, u);
      } else {
        // Se houver mais de um registro para o mesmo e-mail (ex: pré-cadastro e login Auth),
        // preserva o registro que já realizou login e preserva o cargo atribuído mais alto
        const existingHasLogin = Boolean(existing.lastLoginAt);
        const currentHasLogin = Boolean(u.lastLoginAt);

        const preferredRole = (existing.role === 'SUPER_ADMIN' || existing.role === 'ADMIN' || existing.role === 'REVIEWER' || existing.role === 'OPERATOR')
          ? existing.role
          : u.role;

        if (currentHasLogin && !existingHasLogin) {
          targetMap.set(cleanEmail, {
            ...u,
            role: preferredRole,
          });
        } else {
          targetMap.set(cleanEmail, {
            ...existing,
            role: preferredRole,
            lastLoginAt: existing.lastLoginAt || u.lastLoginAt,
          });
        }
      }
    });

    return { 
      colaboradoresList: Array.from(colabMap.values()), 
      usuariosList: Array.from(usuMap.values()) 
    };
  }, [users]);

  // Função de Ordenação solicitada:
  // 1. Fulvio (fulvio@conciliadorcontabil.com.br) sempre no topo absoluto
  // 2. Por hierarquia de cargo: Administradores -> Revisores -> Operadores -> Leitores
  // 3. Ordem alfabética por nome dentro do mesmo cargo
  const sortUsers = (list: UserProfile[]): UserProfile[] => {
    return [...list].sort((a, b) => {
      const aIsFulvio = isSuperAdminUser(a.email);
      const bIsFulvio = isSuperAdminUser(b.email);
      if (aIsFulvio && !bIsFulvio) return -1;
      if (!aIsFulvio && bIsFulvio) return 1;

      // Peso do Cargo
      const getRoleWeight = (role: UserRole): number => {
        switch (role) {
          case 'SUPER_ADMIN':
            return 4;
          case 'ADMIN':
            return 3;
          case 'REVIEWER':
            return 2;
          case 'OPERATOR':
            return 1;
          case 'READER':
            return 0;
          default:
            return 0;
        }
      };

      const diff = getRoleWeight(b.role) - getRoleWeight(a.role);
      if (diff !== 0) return diff;

      // Ordem alfabética A-Z por nome
      return a.displayName.localeCompare(b.displayName, 'pt-BR', { sensitivity: 'base' });
    });
  };

  // Lista atual conforme a aba selecionada e filtro de busca
  const currentList = useMemo(() => {
    const base = activeTab === 'COLABORADORES' ? colaboradoresList : usuariosList;
    const sorted = sortUsers(base);

    if (!searchTerm.trim()) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter(
      (u) =>
        u.displayName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [activeTab, colaboradoresList, usuariosList, searchTerm]);

  // Situação do Usuário:
  // - ONLINE: se estiver na sessão ativa atual
  // - JÁ ACESSOU: se já logou ao menos uma vez (lastLoginAt presente)
  // - AGUARDANDO 1º ACESSO: se nunca logou (lastLoginAt nulo/vazio)
  const getUserSituation = (u: UserProfile): { status: 'ONLINE' | 'LOGADO' | 'PENDING'; label: string; bg: string; color: string; border: string } => {
    const isCurrentSession = currentUser && (currentUser.uid === u.uid || currentUser.email.toLowerCase() === u.email.toLowerCase());

    if (isCurrentSession) {
      return {
        status: 'ONLINE',
        label: 'Online (Sessão Atual)',
        bg: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        border: 'rgba(16, 185, 129, 0.35)',
      };
    }

    if (u.lastLoginAt) {
      const formattedDate = (() => {
        try {
          const d = new Date(u.lastLoginAt);
          if (isNaN(d.getTime())) return 'Já acessou';
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const mins = String(d.getMinutes()).padStart(2, '0');
          return `Acessou em ${day}/${month} às ${hours}:${mins}`;
        } catch {
          return 'Já acessou';
        }
      })();

      return {
        status: 'LOGADO',
        label: formattedDate,
        bg: 'rgba(56, 189, 248, 0.15)',
        color: '#38bdf8',
        border: 'rgba(56, 189, 248, 0.35)',
      };
    }

    return {
      status: 'PENDING',
      label: 'Aguardando 1º acesso',
      bg: 'rgba(245, 158, 11, 0.10)',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.30)',
    };
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await addNewUser(newEmail, newDisplayName, undefined, newRole);
    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao adicionar usuário.');
      return;
    }

    const roleLabel =
      newRole === 'SUPER_ADMIN'
        ? 'Super Administrador'
        : newRole === 'ADMIN'
        ? 'Administrador'
        : newRole === 'REVIEWER'
        ? 'Revisor / Editor'
        : newRole === 'OPERATOR'
        ? 'Operador'
        : 'Leitor';

    setSuccessMsg(`Usuário adicionado com sucesso com perfil de ${roleLabel}!`);
    setNewEmail('');
    setNewDisplayName('');
    setTimeout(() => {
      setIsAddModalOpen(false);
      setSuccessMsg('');
    }, 1500);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1240px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Header Superior */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Controle de Acesso & Governança Corporativa
          </span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '4px 0 6px 0', fontWeight: 800 }}>
            Gestão de Usuários & Permissões
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Painel de governança, controle de acesso e atribuição de cargos.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setNewRole(activeTab === 'COLABORADORES' ? 'OPERATOR' : 'READER');
            setNewEmail('');
            setNewDisplayName('');
            setErrorMsg('');
            setSuccessMsg('');
            setIsAddModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <UserPlus size={16} />
          <span>{activeTab === 'COLABORADORES' ? 'Cadastrar Colaborador' : 'Cadastrar Usuário Externo'}</span>
        </button>
      </div>

      {/* Barra Informativa de Perfis de Usuário */}
      <div
        style={{
          background: 'rgba(92, 183, 128, 0.05)',
          border: '1px solid rgba(92, 183, 128, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <User size={18} color="var(--color-primary)" />
          <span>
            <strong>Perfis de Usuário:</strong> Clique em <strong>"Ver Perfil"</strong> na tabela para inspecionar os detalhes, histórico e artigos de qualquer membro. O seu próprio perfil também está disponível no canto superior direito do cabeçalho.
          </span>
        </div>
      </div>

      {/* Seletor de Abas: Colaboradores vs Usuários */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('COLABORADORES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: activeTab === 'COLABORADORES' ? '1px solid var(--color-primary)' : '1px solid transparent',
              background: activeTab === 'COLABORADORES' ? 'rgba(92, 183, 128, 0.15)' : 'transparent',
              color: activeTab === 'COLABORADORES' ? 'var(--color-primary)' : 'var(--text-muted)',
            }}
          >
            <Users size={16} />
            <span>Colaboradores</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: activeTab === 'COLABORADORES' ? 'var(--color-primary)' : 'var(--bg-card)',
                color: activeTab === 'COLABORADORES' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
              }}
            >
              {colaboradoresList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('USUARIOS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: activeTab === 'USUARIOS' ? '1px solid #38bdf8' : '1px solid transparent',
              background: activeTab === 'USUARIOS' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'USUARIOS' ? '#38bdf8' : 'var(--text-muted)',
            }}
          >
            <Globe size={16} />
            <span>Usuários (Clientes)</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: activeTab === 'USUARIOS' ? '#38bdf8' : 'var(--bg-card)',
                color: activeTab === 'USUARIOS' ? '#0f172a' : 'var(--text-muted)',
                fontWeight: 700,
              }}
            >
              {usuariosList.length}
            </span>
          </button>
        </div>

        {/* Campo de Busca Rápida */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder={`Buscar em ${activeTab === 'COLABORADORES' ? 'Colaboradores' : 'Usuários'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.84rem',
              outline: 'none',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>{activeTab === 'COLABORADORES' ? 'Colaborador' : 'Usuário / Cliente'}</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Cargo / Função</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Situação</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status da Conta</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum registro encontrado para o filtro informado.
                  </td>
                </tr>
              ) : (
                currentList.map((u) => {
                  const isFulvio = isSuperAdminUser(u.email);
                  const isInternal = isInternalUser(u);
                  const situation = getUserSituation(u);

                  return (
                    <tr
                      key={u.uid}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isFulvio ? 'rgba(92, 183, 128, 0.03)' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isFulvio ? 'rgba(92, 183, 128, 0.03)' : 'transparent')}
                    >
                      {/* Colaborador / Usuário */}
                      <td style={{ padding: '14px 16px' }}>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                          onClick={() => setSelectedUserForProfile(u)}
                          title="Clique para visualizar o perfil completo"
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-full)',
                              background: (isFulvio || u.role === 'SUPER_ADMIN')
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : u.role === 'ADMIN'
                                ? 'linear-gradient(135deg, #5cb780 0%, #38bdf8 100%)'
                                : u.role === 'REVIEWER'
                                ? 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)'
                                : 'var(--bg-surface)',
                              border: `1px solid ${isFulvio || u.role === 'SUPER_ADMIN' ? '#f59e0b' : 'var(--border-subtle)'}`,
                              color: '#ffffff',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              flexShrink: 0,
                              position: 'relative',
                            }}
                          >
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.displayName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: 'var(--radius-full)',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            ) : (
                              u.displayName.charAt(0).toUpperCase()
                            )}
                            {situation.status === 'ONLINE' && (
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: '-1px',
                                  right: '-1px',
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: 'var(--radius-full)',
                                  background: '#10b981',
                                  border: '2px solid var(--bg-surface)',
                                  zIndex: 2,
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{u.displayName}</span>
                              {(isFulvio || u.role === 'SUPER_ADMIN') && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    color: '#f59e0b',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    padding: '1px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 700,
                                  }}
                                >
                                  {isFulvio ? 'SUPERADMIN' : 'SUPER ADMIN'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                              <span>{u.email}</span>
                              {isInternal && (
                                <UserRankBadge user={u} email={u.email} size="sm" showPoints={true} />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cargo / Função com Dropdown de Atribuição */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={u.role}
                          disabled={isFulvio}
                          onChange={(e) => updateUserRole(u.uid, e.target.value as UserRole)}
                          style={{
                            padding: '6px 10px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color:
                              u.role === 'SUPER_ADMIN'
                                ? '#f59e0b'
                                : u.role === 'ADMIN'
                                ? 'var(--color-primary)'
                                : u.role === 'REVIEWER'
                                ? 'var(--color-secondary)'
                                : u.role === 'READER'
                                ? '#38bdf8'
                                : 'var(--text-main)',
                            cursor: isFulvio ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <option value="SUPER_ADMIN" style={{ background: '#1e2227', color: '#f59e0b' }}>
                            👑 Super Administrador
                          </option>
                          <option value="ADMIN" style={{ background: '#1e2227', color: '#5cb780' }}>
                            🛡️ Administrador
                          </option>
                          <option value="REVIEWER" style={{ background: '#1e2227', color: '#6c63ff' }}>
                            ✍️ Revisor / Editor
                          </option>
                          <option value="OPERATOR" style={{ background: '#1e2227', color: '#fff' }}>
                            👷 Operador
                          </option>
                          <option value="READER" style={{ background: '#1e2227', color: '#38bdf8' }}>
                            👤 Leitor (Apenas Leitura)
                          </option>
                        </select>
                      </td>

                      {/* Situação: Online, Logado ou Offline */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            background: situation.bg,
                            color: situation.color,
                            border: `1px solid ${situation.border}`,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: 'var(--radius-full)',
                              background: situation.color,
                              display: 'inline-block',
                            }}
                          />
                          {situation.label}
                        </span>
                      </td>

                      {/* Status da Conta */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: u.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {u.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedUserForProfile(u)}
                            style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                            title="Ver Perfil do Usuário"
                          >
                            <Eye size={13} />
                            <span>Perfil</span>
                          </button>

                          {!isFulvio && (
                            <>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => toggleUserStatus(u.uid)}
                                style={{ fontSize: '0.76rem' }}
                                title={u.status === 'ACTIVE' ? 'Desativar temporariamente' : 'Reativar conta'}
                              >
                                {u.status === 'ACTIVE' ? 'Desativar' : 'Reativar'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setUserToDelete(u)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                                }}
                                title="Apagar Perfil Definitivamente"
                              >
                                <Trash2 size={13} />
                                <span>Apagar</span>
                              </button>
                            </>
                          )}
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

      {/* Modal: Perfil do Usuário (Detalhado & Igual ao Perfil da Conta) */}
      {selectedUserForProfile && (() => {
        const activeUser = users.find((u) => u.uid === selectedUserForProfile.uid) || selectedUserForProfile;
        const isFulvio = isSuperAdminUser(activeUser.email);
        const isInternal = isInternalUser(activeUser);
        const situation = getUserSituation(activeUser);
        const stats = getUserEngagementStats(activeUser.email);
        const gamification = getUserGamification(activeUser.email);

        return createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.78)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
            onClick={() => setSelectedUserForProfile(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '920px',
                maxHeight: 'min(92vh, 850px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(92, 183, 128, 0.18)',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Faixa decorativa superior com gradiente festivo */}
              <div 
                style={{ 
                  height: '6px', 
                  width: '100%', 
                  flexShrink: 0,
                  background: isInternal 
                    ? 'linear-gradient(90deg, #5cb780, #38bdf8, #6c63ff, #f59e0b)' 
                    : 'linear-gradient(90deg, #38bdf8, #6c63ff, #f59e0b)' 
                }} 
              />

              {/* Barra de Título */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-sidebar)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(92, 183, 128, 0.15)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                      Perfil de {activeUser.displayName}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      Gestão de Usuários • Identidade, Governança, Gamificação e Engajamento
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUserForProfile(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Fechar (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Corpo do Modal em Grid Duplo Responsivo */}
              <div 
                style={{ 
                  padding: '22px 24px', 
                  overflowY: 'auto', 
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(280px, 320px) 1fr',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                {/* COLUNA ESQUERDA: Identidade, Foto, Papel & Governança */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Card de Avatar & Foto */}
                  <div
                    style={{
                      padding: '20px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      textAlign: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ position: 'relative', width: '104px', height: '104px', margin: '0 auto 12px auto' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '104px',
                          height: '104px',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                          border: `3px solid ${activeUser.role === 'SUPER_ADMIN' ? '#f59e0b' : 'var(--color-primary)'}`,
                          boxShadow: activeUser.role === 'SUPER_ADMIN'
                            ? '0 6px 20px rgba(245, 158, 11, 0.35)'
                            : '0 6px 20px rgba(92, 183, 128, 0.35)',
                        }}
                      >
                        {activeUser.photoURL ? (
                          <img
                            src={activeUser.photoURL}
                            alt={activeUser.displayName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: (isFulvio || activeUser.role === 'SUPER_ADMIN')
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #38bdf8 0%, #5cb780 100%)',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '2.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {activeUser.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {situation.status === 'ONLINE' && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: 'var(--radius-full)',
                            background: '#10b981',
                            border: '2.5px solid var(--bg-surface)',
                            zIndex: 3,
                          }}
                          title="Usuário Online"
                        />
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                      {activeUser.displayName}
                    </h4>

                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: isInternal ? 'rgba(92, 183, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: isInternal ? '#5cb780' : '#38bdf8',
                          border: `1px solid ${isInternal ? 'rgba(92, 183, 128, 0.35)' : 'rgba(56, 189, 248, 0.35)'}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {isInternal ? 'Colaborador Interno' : 'Usuário Externo'}
                      </span>
                      {activeUser.role === 'SUPER_ADMIN' && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          👑 Super Admin
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginBottom: '10px',
                      }}
                    >
                      <Mail size={13} />
                      <span style={{ wordBreak: 'break-all' }}>{activeUser.email}</span>
                    </div>
                  </div>

                  {/* Informações de Nível de Acesso e Governança */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div
                      style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>
                        Situação de Acesso
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: situation.color }}>
                        {situation.label}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>
                        Status da Conta
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: activeUser.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                        {activeUser.status === 'ACTIVE' ? '✅ Ativa' : '❌ Desativada'}
                      </span>
                    </div>
                  </div>

                  {/* Controle de Cargo / Atribuição Administrativa */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <SlidersHorizontal size={14} color="var(--color-primary)" />
                      <span>Atribuição de Cargo:</span>
                    </label>

                    <select
                      value={activeUser.role}
                      disabled={isFulvio}
                      onChange={(e) => updateUserRole(activeUser.uid, e.target.value as UserRole)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: activeUser.role === 'SUPER_ADMIN' ? '#f59e0b' : 'var(--text-main)',
                        cursor: isFulvio ? 'not-allowed' : 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="SUPER_ADMIN">👑 Super Administrador</option>
                      <option value="ADMIN">🛡️ Administrador</option>
                      <option value="REVIEWER">✍️ Editor & Revisor</option>
                      <option value="OPERATOR">👷 Operador Interno</option>
                      <option value="READER">👤 Leitor (Cliente Externo)</option>
                    </select>

                    {isFulvio && (
                      <span style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '6px', display: 'block' }}>
                        * O cargo do Super Administrador Fundador é permanente.
                      </span>
                    )}
                  </div>

                  {/* Metadados de Data e Login */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} />
                        Último Acesso:
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {activeUser.lastLoginAt ? new Date(activeUser.lastLoginAt).toLocaleString('pt-BR') : 'Ainda não acessou'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} />
                        Cadastrado em:
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString('pt-BR') : 'Não registrado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* COLUNA DIREITA: Conquistas, Patente, Engajamento e Manuais */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* 1. Conquistas & Patente (Apenas para Colaboradores Internos) */}
                  {isInternal && (
                    <div
                      style={{
                        padding: '18px 20px',
                        background: 'linear-gradient(135deg, rgba(92, 183, 128, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%)',
                        border: '1px solid rgba(92, 183, 128, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Trophy size={18} color="#f59e0b" />
                          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            Conquistas & Patente Corporativa
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                          }}
                        >
                          {gamification.points} Pontos Acumulados
                        </span>
                      </div>

                      <UserRankBadge user={activeUser} email={activeUser.email} size="lg" showProgress={true} showPoints={true} />

                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-card)',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Sparkles size={16} color="#5cb780" style={{ flexShrink: 0 }} />
                        <span>
                          Parabéns pelas contribuições à base de conhecimento da Conciliador! Cada artigo aprovado soma <strong>100 pontos</strong> e acelera a evolução na patente corporativa.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. Dashboard de Likes e Deslikes (Engajamento Bidirecional) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Heart size={16} color="#ef4444" />
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Engajamento & Avaliação de Conteúdo (Likes / Deslikes)
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div
                        style={{
                          padding: '14px 16px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Recebidos nos Artigos do Autor
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.2rem' }}>👍</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{stats.receivedLikes}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>likes</span>
                          </div>
                          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.2rem' }}>👎</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444' }}>{stats.receivedDislikes}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>deslikes</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '14px 16px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Dados pelo Usuário na Plataforma
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.2rem' }}>👍</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{stats.givenLikes}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>curtidas</span>
                          </div>
                          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.2rem' }}>👎</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>{stats.givenDislikes}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>descurtidas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Lista de Manuais de sua Autoria */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={16} color="var(--color-primary)" />
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          Manuais de Autoria do Usuário ({stats.authoredArticles.length})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                        Pontuações & Conquistas por artigo
                      </span>
                    </div>

                    {stats.authoredArticles.length === 0 ? (
                      <div
                        style={{
                          padding: '24px 20px',
                          background: 'var(--bg-card)',
                          border: '1px dashed var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.84rem',
                        }}
                      >
                        <BookOpen size={28} style={{ opacity: 0.35, margin: '0 auto 8px auto', display: 'block' }} />
                        <span>Este usuário ainda não possui manuais ou artigos criados na plataforma.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                        {stats.authoredArticles.map((art) => {
                          const isApproved = art.currentStatus === 'APPROVED';
                          const isPending = art.currentStatus === 'PENDING';
                          return (
                            <div
                              key={art.id}
                              onClick={() => {
                                setSelectedArticle(art);
                                setSelectedUserForProfile(null);
                              }}
                              style={{
                                padding: '12px 14px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                              title="Clique para abrir e visualizar este manual"
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      padding: '1px 6px',
                                      borderRadius: 'var(--radius-sm)',
                                      background: 'rgba(92, 183, 128, 0.15)',
                                      color: 'var(--color-primary)',
                                    }}
                                  >
                                    {art.code || 'CC'}
                                  </span>
                                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {art.title}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>Atualizado em {new Date(art.updatedAt).toLocaleDateString('pt-BR')}</span>
                                  <span>•</span>
                                  <span>👍 {art.likesCount || 0} curtidas</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    background: isApproved
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : isPending
                                      ? 'rgba(245, 158, 11, 0.15)'
                                      : 'rgba(239, 68, 68, 0.15)',
                                    color: isApproved ? '#10b981' : isPending ? '#f59e0b' : '#ef4444',
                                  }}
                                >
                                  {isApproved ? 'Aprovado' : isPending ? 'Em Análise' : 'Ajustes'}
                                </span>

                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: isApproved ? '#10b981' : isPending ? '#f59e0b' : '#6b7280',
                                  }}
                                >
                                  {isApproved ? '+100 pts 🎉' : isPending ? '+50 pts' : '+20 pts'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Barra de Ações Fixa no Rodapé do Modal */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 24px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-sidebar)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!isFulvio && (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleUserStatus(activeUser.uid)}
                        style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                      >
                        {activeUser.status === 'ACTIVE' ? 'Desativar Conta' : 'Reativar Conta'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const target = activeUser;
                          setSelectedUserForProfile(null);
                          setUserToDelete(target);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#ef4444',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Apagar Perfil</span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedUserForProfile(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Modal: Adicionar Novo Colaborador ou Usuário */}
      {isAddModalOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              maxHeight: 'min(90vh, 620px)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-sidebar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                {activeTab === 'COLABORADORES' ? 'Cadastrar Colaborador do Conciliador' : 'Cadastrar Usuário Externo (Cliente)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1 }}>
                {errorMsg && (
                  <div
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontSize: '0.82rem',
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      fontSize: '0.82rem',
                    }}
                  >
                    {successMsg}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Nome Completo:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {activeTab === 'COLABORADORES'
                      ? 'E-mail Corporativo (@conciliadorcontabil.com.br):'
                      : 'E-mail do Cliente / Usuário:'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={
                      activeTab === 'COLABORADORES'
                        ? 'nome@conciliadorcontabil.com.br'
                        : 'cliente@exemplo.com.br'
                    }
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Cargo / Nível de Acesso:
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color:
                        newRole === 'SUPER_ADMIN'
                          ? '#f59e0b'
                          : newRole === 'ADMIN'
                          ? 'var(--color-primary)'
                          : newRole === 'REVIEWER'
                          ? 'var(--color-secondary)'
                          : newRole === 'READER'
                          ? '#38bdf8'
                          : 'var(--text-main)',
                    }}
                  >
                    <option value="SUPER_ADMIN" style={{ background: '#1e2227', color: '#f59e0b' }}>
                      👑 Super Administrador (Acesso Total & Governança)
                    </option>
                    <option value="ADMIN" style={{ background: '#1e2227', color: '#5cb780' }}>
                      🛡️ Administrador (Gestão de Usuários & Conteúdos)
                    </option>
                    <option value="REVIEWER" style={{ background: '#1e2227', color: '#6c63ff' }}>
                      ✍️ Revisor / Editor (Aprovação e Fila Editorial)
                    </option>
                    <option value="OPERATOR" style={{ background: '#1e2227', color: '#fff' }}>
                      👷 Operador Interno (Redação e Leitura Geral)
                    </option>
                    <option value="READER" style={{ background: '#1e2227', color: '#38bdf8' }}>
                      👤 Leitor (Acesso aos Manuais Externos)
                    </option>
                  </select>
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-subtle)',
                    background: 'var(--bg-card)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {newRole === 'SUPER_ADMIN' ? (
                    <span style={{ color: '#f59e0b' }}>
                      👑 <strong>Super Administrador:</strong> Possui acesso irrestrito, permissão para gerenciar todos os usuários, aprovar artigos e configurar os módulos da base.
                    </span>
                  ) : newRole === 'ADMIN' ? (
                    <span style={{ color: 'var(--color-primary)' }}>
                      🛡️ <strong>Administrador:</strong> Acesso à gestão de usuários, gestão de módulos e publicação editorial.
                    </span>
                  ) : activeTab === 'COLABORADORES' ? (
                    <span>
                      ℹ️ Colaboradores com cargo atribuído têm acesso aos manuais internos do Conciliador e ferramentas corporativas.
                    </span>
                  ) : (
                    <span>
                      ℹ️ Clientes externos como <strong>Leitores</strong> possuem visualização restrita a manuais públicos/externos.
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar)', flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {activeTab === 'COLABORADORES' ? 'Cadastrar Colaborador' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação: Apagar Usuário Permanentemente */}
      {userToDelete && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
          onClick={() => !isDeleting && setUserToDelete(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              maxHeight: 'min(90vh, 560px)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #ef4444, #dc2626)', flexShrink: 0 }} />
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '0 0 4px 0', fontWeight: 800 }}>
                    Apagar Perfil de Usuário
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    Ação irreversível de exclusão de dados
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Você está prestes a <strong>excluir permanentemente</strong> o perfil de{' '}
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{userToDelete.displayName}</span> (
                <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>{userToDelete.email}</code>).
              </p>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  marginBottom: '20px',
                  lineHeight: 1.4,
                }}
              >
                ⚠️ Este usuário será totalmente removido da base de dados e não conseguirá mais efetuar login no sistema.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isDeleting}
                  onClick={() => setUserToDelete(null)}
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    await deleteUser(userToDelete.uid, userToDelete.email);
                    setIsDeleting(false);
                    setUserToDelete(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Trash2 size={15} />
                  <span>{isDeleting ? 'Apagando...' : 'Sim, Apagar Perfil'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
