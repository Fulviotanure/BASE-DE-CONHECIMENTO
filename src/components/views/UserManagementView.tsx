import React, { useState, useMemo } from 'react';
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
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserProfile, UserRole } from '../../types';

export const UserManagementView: React.FC = () => {
  const { users, articles, updateUserRole, toggleUserStatus, addNewUser, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'COLABORADORES' | 'USUARIOS'>('COLABORADORES');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<UserProfile | null>(null);

  // Form de cadastro
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Separação em Colaboradores (internos) e Usuários (externos)
  const { colaboradoresList, usuariosList } = useMemo(() => {
    const colab: UserProfile[] = [];
    const usu: UserProfile[] = [];

    users.forEach((u) => {
      // Regra estrita: Apenas emails que terminam com @conciliadorcontabil.com.br são colaboradores internos.
      // Qualquer outro domínio (ex: @gmail.com, parceiros, etc.) é classificado como Cliente/Usuário Externo.
      const isInternal = Boolean(
        u.email && u.email.trim().toLowerCase().endsWith('@conciliadorcontabil.com.br')
      );

      if (isInternal) {
        colab.push(u);
      } else {
        usu.push(u);
      }
    });

    return { colaboradoresList: colab, usuariosList: usu };
  }, [users]);

  // Função de Ordenação solicitada:
  // 1. Fulvio (fulvio@conciliadorcontabil.com.br) sempre no topo absoluto
  // 2. Por hierarquia de cargo: Administradores -> Revisores -> Operadores -> Leitores
  // 3. Ordem alfabética por nome dentro do mesmo cargo
  const sortUsers = (list: UserProfile[]): UserProfile[] => {
    return [...list].sort((a, b) => {
      const aIsFulvio = a.email.toLowerCase() === 'fulvio@conciliadorcontabil.com.br';
      const bIsFulvio = b.email.toLowerCase() === 'fulvio@conciliadorcontabil.com.br';
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

    const res = await addNewUser(newEmail, newDisplayName);
    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao adicionar usuário.');
      return;
    }

    setSuccessMsg(
      activeTab === 'COLABORADORES'
        ? 'Colaborador adicionado com sucesso com perfil inicial de Operador!'
        : 'Usuário externo adicionado com sucesso com perfil inicial de Leitor!'
    );
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
            Gestão de Usuários & Permissões (RBAC)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Painel de governança, controle de acesso e atribuição de cargos.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
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
                  const isFulvio = u.email.toLowerCase() === 'fulvio@conciliadorcontabil.com.br';
                  const isInternal = u.userType === 'INTERNAL' && u.email.toLowerCase().endsWith('@conciliadorcontabil.com.br');
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
                              background: isFulvio
                                ? 'linear-gradient(135deg, #5cb780 0%, #6c63ff 100%)'
                                : u.role === 'ADMIN'
                                ? 'linear-gradient(135deg, #5cb780 0%, #38bdf8 100%)'
                                : u.role === 'REVIEWER'
                                ? 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)'
                                : 'var(--bg-surface)',
                              border: `1px solid ${isFulvio ? '#5cb780' : 'var(--border-subtle)'}`,
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
                            {u.displayName.charAt(0).toUpperCase()}
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
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{u.displayName}</span>
                              {isFulvio && (
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
                                  SUPERADMIN
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{u.email}</div>
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
                          <option value="OPERATOR" style={{ background: '#1e2227', color: '#fff' }}>
                            👷 Operador
                          </option>
                          <option value="REVIEWER" style={{ background: '#1e2227', color: '#6c63ff' }}>
                            ✍️ Revisor / Editor
                          </option>
                          <option value="ADMIN" style={{ background: '#1e2227', color: '#5cb780' }}>
                            🛡️ Administrador
                          </option>
                          <option value="READER" style={{ background: '#1e2227', color: '#38bdf8' }}>
                            👤 Leitor (Apenas Leitura)
                          </option>
                          {isFulvio && (
                            <option value="SUPER_ADMIN" style={{ background: '#1e2227', color: '#f59e0b' }}>
                              👑 Super Administrador
                            </option>
                          )}
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
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => toggleUserStatus(u.uid)}
                              style={{ fontSize: '0.76rem' }}
                            >
                              {u.status === 'ACTIVE' ? 'Desativar' : 'Reativar'}
                            </button>
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

      {/* Modal: Perfil do Usuário (Detalhado) */}
      {selectedUserForProfile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 105,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedUserForProfile(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Faixa superior estilizada */}
            <div
              style={{
                height: '6px',
                width: '100%',
                background: selectedUserForProfile.email.toLowerCase() === 'fulvio@conciliadorcontabil.com.br'
                  ? 'linear-gradient(90deg, #5cb780, #6c63ff, #f59e0b)'
                  : 'linear-gradient(90deg, #5cb780, #38bdf8)',
              }}
            />

            {/* Cabeçalho do Modal */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-sidebar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                  Perfil do Usuário
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForProfile(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo do Perfil */}
            <div style={{ padding: '24px' }}>
              {/* Card com Avatar e Nome */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedUserForProfile.email.toLowerCase() === 'fulvio@conciliadorcontabil.com.br'
                      ? 'linear-gradient(135deg, #5cb780 0%, #6c63ff 100%)'
                      : 'linear-gradient(135deg, #38bdf8 0%, #5cb780 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--border-subtle)',
                  }}
                >
                  {selectedUserForProfile.displayName.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedUserForProfile.displayName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                    {selectedUserForProfile.email}
                  </div>
                </div>
              </div>

              {/* Grid de Informações Detalhadas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {/* Cargo */}
                <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Cargo Atual:
                  </span>
                  <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>
                    {selectedUserForProfile.role === 'SUPER_ADMIN'
                      ? '👑 Super Administrador'
                      : selectedUserForProfile.role === 'ADMIN'
                      ? '🛡️ Administrador'
                      : selectedUserForProfile.role === 'REVIEWER'
                      ? '✍️ Revisor / Editor'
                      : selectedUserForProfile.role === 'READER'
                      ? '👤 Leitor'
                      : '👷 Operador'}
                  </strong>
                </div>

                {/* Situação */}
                <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Situação de Acesso:
                  </span>
                  {(() => {
                    const sit = getUserSituation(selectedUserForProfile);
                    return (
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: sit.color }}>
                        {sit.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Status da Conta */}
                <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Status da Conta:
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: selectedUserForProfile.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                    {selectedUserForProfile.status === 'ACTIVE' ? '✅ Ativa' : '❌ Desativada'}
                  </strong>
                </div>
              </div>

              {/* Informações de Login e Contribuições */}
              <div style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    Último Acesso:
                  </span>
                  <strong style={{ color: 'var(--text-main)' }}>
                    {selectedUserForProfile.lastLoginAt
                      ? new Date(selectedUserForProfile.lastLoginAt).toLocaleString('pt-BR')
                      : 'Ainda não realizou login'}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} />
                    Manuais / Artigos Criados:
                  </span>
                  <strong style={{ color: 'var(--color-primary)' }}>
                    {articles.filter((a) => a.authorEmail.toLowerCase() === selectedUserForProfile.email.toLowerCase()).length} publicações
                  </strong>
                </div>
              </div>

              {/* Ação de Fechar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedUserForProfile(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Novo Colaborador ou Usuário */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
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
              }}
            >
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
                {activeTab === 'COLABORADORES' ? 'Cadastrar Colaborador do Conciliador' : 'Cadastrar Usuário Externo (Cliente)'}
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-subtle)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                {activeTab === 'COLABORADORES' ? (
                  <span>
                    ℹ️ Novos colaboradores iniciam com o cargo de <strong>Operador</strong>. Você poderá promovê-los para Administrador ou Revisor diretamente na tabela.
                  </span>
                ) : (
                  <span>
                    ℹ️ Clientes externos ingressam como <strong>Leitores</strong>, com visualização restrita a manuais públicos/externos.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
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
        </div>
      )}
    </div>
  );
};
