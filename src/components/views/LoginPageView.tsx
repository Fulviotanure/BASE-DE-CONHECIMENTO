import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginPageViewProps {
  onAccessExternalPortal?: () => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = () => {
  const {
    loginWithGoogleAuth,
    loginWithEmail,
    registerClientAccount,
    theme,
    toggleTheme,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Carrega e-mail salvo se o usuário optou por lembrar login
  useEffect(() => {
    const savedEmail = localStorage.getItem('conciliador_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberLogin(true);
    }
  }, []);

  // Submissão do Formulário Flutuante
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('A senha deve conter ao menos 6 caracteres.');
      return;
    }

    if (rememberLogin) {
      localStorage.setItem('conciliador_saved_email', cleanEmail);
    } else {
      localStorage.removeItem('conciliador_saved_email');
    }

    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const res = await loginWithEmail(cleanEmail, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao realizar login.');
          setLoading(false);
          return;
        }
        setSuccessMsg(`Bem-vindo, ${res.user?.displayName}!`);
        setTimeout(() => setIsModalOpen(false), 600);
      } else {
        if (!displayName.trim()) {
          setErrorMsg('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }

        const res = await registerClientAccount(cleanEmail, displayName, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao cadastrar conta.');
          setLoading(false);
          return;
        }

        setSuccessMsg(`Conta criada com sucesso! Bem-vindo, ${res.user?.displayName}.`);
        setTimeout(() => setIsModalOpen(false), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await loginWithGoogleAuth();
      if (!res.success) {
        setErrorMsg(res.error || 'Erro na autenticação com o Google.');
      } else {
        setSuccessMsg(`Bem-vindo, ${res.user?.displayName}!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar ao Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
      className="animate-fade-in"
    >
      {/* Camada de Overlay Suave para Contraste Premium */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(10, 17, 24, 0.72) 0%, rgba(6, 11, 16, 0.92) 100%)',
          zIndex: 1,
        }}
      />

      {/* Barra de Topo Minimalista */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={theme === 'light' ? '/logo-light.svg' : '/conciliador-logo.png'}
            alt="Conciliador Contábil"
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              paddingLeft: '14px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff' }}>
              Base de Conhecimento
            </span>
            <span style={{ fontSize: '0.70rem', color: '#5cb780', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Conciliador Contábil
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#38bdf8" />}
          </button>
        </div>
      </header>

      {/* Card Central de Login Minimalista */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          margin: 'auto 0',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1px solid rgba(92, 183, 128, 0.3)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 32px rgba(92, 183, 128, 0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Filete luminoso de destaque no topo */}
          <div
            style={{
              height: '4px',
              width: '100%',
              background: 'linear-gradient(90deg, #5cb780 0%, #27db88 50%, #38bdf8 100%)',
            }}
          />

          <div style={{ padding: '36px 32px' }}>
            {/* Logo & Título Minimalistas */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img
                src={theme === 'light' ? '/logo-light.svg' : '/conciliador-logo.png'}
                alt="Conciliador Contábil"
                style={{ height: '48px', width: 'auto', objectFit: 'contain', margin: '0 auto 16px auto', display: 'block' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Base de Conhecimento
              </h1>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: 0 }}>
                Conciliador Contábil
              </p>
            </div>

            {/* Mensagens de Feedback */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  marginBottom: '18px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  fontSize: '0.82rem',
                  marginBottom: '18px',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Botão Oficial: Continuar com o Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '13px 18px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                color: '#0f172a',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
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

            {/* Divisor Visual */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '22px 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
              <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ou
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
            </div>

            {/* Botão Entrar (Abre Janela Flutuante) */}
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorMsg('');
                setSuccessMsg('');
                setIsModalOpen(true);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #5cb780 0%, #3ca066 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(92, 183, 128, 0.35)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <LogIn size={17} />
              <span>Entrar</span>
            </button>

          </div>
        </div>
      </main>

      {/* Rodapé Minimalista */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '16px 36px',
          textAlign: 'center',
          fontSize: '0.76rem',
          color: '#64748b',
        }}
      >
        © {new Date().getFullYear()} Conciliador Contábil • Plataforma de Gestão de Conhecimento
      </footer>

      {/* JANELA FLUTUANTE DE LOGIN / CRIAR CONTA */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--bg-card, #0f172a)',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header do Modal */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMsg('');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: mode === 'LOGIN' ? '#5cb780' : 'transparent',
                    color: mode === 'LOGIN' ? '#ffffff' : '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setErrorMsg('');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: mode === 'REGISTER' ? '#38bdf8' : 'transparent',
                    color: mode === 'REGISTER' ? '#0f172a' : '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Criar Conta
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo do Formulário */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10b981',
                    fontSize: '0.82rem',
                    marginBottom: '16px',
                  }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mode === 'REGISTER' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                      Nome Completo:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        required
                        placeholder="Seu nome"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    E-mail:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Senha:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 38px 10px 38px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Opção de Salvar Login (Flegar) */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    userSelect: 'none',
                    margin: '4px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberLogin}
                    onChange={(e) => setRememberLogin(e.target.checked)}
                    style={{
                      cursor: 'pointer',
                      accentColor: '#5cb780',
                      width: '16px',
                      height: '16px',
                    }}
                  />
                  <span>Salvar login neste dispositivo</span>
                </label>

                {/* Botão de Ação */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: mode === 'LOGIN' ? '#5cb780' : '#38bdf8',
                    color: mode === 'LOGIN' ? '#ffffff' : '#0f172a',
                    border: 'none',
                    fontSize: '0.90rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '8px',
                  }}
                >
                  {loading
                    ? 'Processando...'
                    : mode === 'LOGIN'
                    ? 'Entrar no Sistema'
                    : 'Criar Conta de Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
