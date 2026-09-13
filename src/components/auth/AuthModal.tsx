import React, { useState } from 'react';
import { Lock, Mail, User, AlertCircle, CheckCircle2, X, Shield, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { loginWithEmailPassword, registerWithEmailPassword, CORPORATE_DOMAIN } from '../../services/authService';
import { useApp } from '../../context/AppContext';
import type { UserProfile, UserType } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogleAuth, users } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [accountType, setAccountType] = useState<UserType>('INTERNAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await loginWithGoogleAuth();
      if (res.success && res.user) {
        setSuccessMsg(`Bem-vindo, ${res.user.displayName}!`);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Erro ao autenticar com o Google.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const { user } = await loginWithEmailPassword(email, password);
        setSuccessMsg(`Bem-vindo de volta, ${user.displayName}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 1000);
      } else {
        const { user } = await registerWithEmailPassword(email, password, displayName, accountType);
        setSuccessMsg(`Conta criada com sucesso! Acesso: ${user.userType === 'INTERNAL' ? 'Interno' : 'Externo'}.`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      let msg = err.message || 'Ocorreu um erro ao processar a autenticação.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha incorretos. Verifique suas credenciais.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está cadastrado. Alterne para a opção "Entrar".';
      } else if (err.code === 'auth/weak-password') {
        msg = 'A senha deve conter no mínimo 6 caracteres.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decorator */}
        <div 
          style={{ 
            height: '4px', 
            width: '100%', 
            background: 'linear-gradient(90deg, #5cb780, #38bdf8, #6c63ff)' 
          }} 
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        <div style={{ padding: '24px 28px' }}>
          {/* Logo & Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {mode === 'LOGIN' ? 'Acessar a Plataforma' : 'Criar Nova Conta'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', margin: 0 }}>
                Conciliador Contábil • Base de Conhecimento
              </p>
            </div>
          </div>

          {/* Quick Google Sign In */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                color: '#1f2937',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>
          </div>

          {/* Divider */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              margin: '16px 0',
              color: 'var(--text-subtle)',
              fontSize: '0.74rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>ou com e-mail e senha</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Mode Switcher (Login vs Register) */}
          <div 
            style={{ 
              display: 'flex', 
              padding: '3px', 
              background: 'var(--bg-card)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '7px 12px',
                fontSize: '0.8rem',
                fontWeight: mode === 'LOGIN' ? 700 : 500,
                borderRadius: 'var(--radius-sm)',
                background: mode === 'LOGIN' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'LOGIN' ? '#1a1d20' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Entrar (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '7px 12px',
                fontSize: '0.8rem',
                fontWeight: mode === 'REGISTER' ? 700 : 500,
                borderRadius: 'var(--radius-sm)',
                background: mode === 'REGISTER' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'REGISTER' ? '#1a1d20' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Criar Conta
            </button>
          </div>

          {/* Account Type Selector (se estiver registrando) */}
          {mode === 'REGISTER' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '6px' }}>
                Tipo de Acesso:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAccountType('INTERNAL')}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: accountType === 'INTERNAL' ? 'rgba(92, 183, 128, 0.15)' : 'var(--bg-input)',
                    border: `1px solid ${accountType === 'INTERNAL' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                    color: accountType === 'INTERNAL' ? 'var(--color-primary)' : 'var(--text-muted)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Colaborador Interno
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('EXTERNAL')}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: accountType === 'EXTERNAL' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                    border: `1px solid ${accountType === 'EXTERNAL' ? '#38bdf8' : 'var(--border-subtle)'}`,
                    color: accountType === 'EXTERNAL' ? '#38bdf8' : 'var(--text-muted)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cliente Externo
                </button>
              </div>
            </div>
          )}

          {/* Policy Banner */}
          <div 
            style={{
              marginBottom: '16px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-subtle)',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <Sparkles size={14} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              E-mails <strong>{CORPORATE_DOMAIN}</strong> têm acesso completo à área interna. Usuários com outros domínios acessam o Portal do Cliente.
            </span>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div 
              style={{
                marginBottom: '14px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div 
              style={{
                marginBottom: '14px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(92, 183, 128, 0.12)',
                border: '1px solid rgba(92, 183, 128, 0.3)',
                color: 'var(--color-primary)',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'REGISTER' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nome Completo
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Natasha Lorrane ou Rodrigo Moro"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 34px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {accountType === 'INTERNAL' && mode === 'REGISTER' ? 'E-mail Corporativo' : 'E-mail'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    accountType === 'INTERNAL'
                      ? 'usuario@conciliadorcontabil.com.br'
                      : 'cliente@escritorio.com.br'
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '11px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: '#1a1d20',
                fontWeight: 800,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(92, 183, 128, 0.25)',
              }}
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span>{mode === 'LOGIN' ? 'Entrar com E-mail' : 'Concluir Cadastro'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
