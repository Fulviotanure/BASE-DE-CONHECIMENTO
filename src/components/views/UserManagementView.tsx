import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

export const UserManagementView: React.FC = () => {
  const { users, updateUserRole, toggleUserStatus, addNewUser, currentUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await addNewUser(newEmail, newDisplayName);
    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao adicionar usuário.');
      return;
    }

    setSuccessMsg('Colaborador adicionado com sucesso com perfil inicial de Operador!');
    setNewEmail('');
    setNewDisplayName('');
    setTimeout(() => {
      setIsAddModalOpen(false);
      setSuccessMsg('');
    }, 1500);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Controle de Acesso & Governança Corporativa
          </span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '4px 0 6px 0' }}>
            Gestão de Usuários & Permissões (RBAC)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Painel exclusivo do Administrador (<strong>{currentUser?.displayName || 'Administrador'}</strong>) para atribuição de cargos aos colaboradores.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={16} />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Corporate Rule Warning Card */}
      <div
        style={{
          background: 'rgba(92, 183, 128, 0.08)',
          border: '1px solid rgba(92, 183, 128, 0.25)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <ShieldCheck size={28} color="var(--color-primary)" />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          <strong>Governança de Acessos:</strong> Colaboradores com e-mail corporativo{' '}
          <code>@conciliadorcontabil.com.br</code> possuem acesso à área interna. Usuários Rodrigo, Igor e Fulvio
          possuem privilégios de <strong>Administrador</strong>. Novos colaboradores são cadastrados como <strong>Operador</strong>,
          podendo ser promovidos para Revisor ou Administrador.
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: '24px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Colaborador</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tipo de Acesso</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Cargo / Função</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status da Conta</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Data do Cadastro</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Último Acesso</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isFulvio = u.email.toLowerCase().includes('fulvio');
                const isInternal = u.userType === 'INTERNAL' || u.email.endsWith('@conciliadorcontabil.com.br');
                return (
                  <tr
                    key={u.uid}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* User Info */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-full)',
                            background: isFulvio
                              ? 'linear-gradient(135deg, #5cb780 0%, #6c63ff 100%)'
                              : 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: '#ffffff',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                          }}
                        >
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.displayName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Access Type (Interno vs Externo) */}
                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: isInternal ? 'rgba(92, 183, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: isInternal ? '#5cb780' : '#38bdf8',
                          border: `1px solid ${isInternal ? 'rgba(92, 183, 128, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {isInternal ? 'Colaborador Interno' : 'Externo (Cliente)'}
                      </span>
                    </td>

                    {/* Role Dropdown */}
                    <td style={{ padding: '14px' }}>
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
                            u.role === 'ADMIN'
                              ? 'var(--color-primary)'
                              : u.role === 'REVIEWER'
                              ? 'var(--color-secondary)'
                              : 'var(--text-main)',
                          cursor: isFulvio ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="OPERATOR" style={{ background: '#1e2227', color: '#fff' }}>
                          👷 Operador (Usuário Comum)
                        </option>
                        <option value="REVIEWER" style={{ background: '#1e2227', color: '#6c63ff' }}>
                          ✍️ Editor / Revisor
                        </option>
                        <option value="ADMIN" style={{ background: '#1e2227', color: '#5cb780' }}>
                          👑 Administrador
                        </option>
                      </select>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: u.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: 'var(--radius-full)',
                            background: u.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                          }}
                        />
                        {u.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Date Created */}
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Last Login */}
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      {new Date(u.lastLoginAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px', textAlign: 'right' }}>
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adicionar Novo Colaborador */}
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
                Cadastrar Colaborador do Conciliador
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
                  E-mail Corporativo (@conciliadorcontabil.com.br):
                </label>
                <input
                  type="email"
                  required
                  placeholder="nome@conciliadorcontabil.com.br"
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
                ℹ️ Por padrão institucional, novos usuários ingressam com o cargo de <strong>Operador (Usuário Comum)</strong>. Após o cadastro, você poderá alterá-lo diretamente na tabela.
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
                  Cadastrar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
