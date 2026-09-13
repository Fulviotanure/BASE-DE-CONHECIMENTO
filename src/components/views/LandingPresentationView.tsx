import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Sliders, 
  FileDown, 
  Scale, 
  FileUp, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Lock, 
  CheckCircle2,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LandingPresentationViewProps {
  onAccessExternalPortal: () => void;
}

export const LandingPresentationView: React.FC<LandingPresentationViewProps> = ({ 
  onAccessExternalPortal 
}) => {
  const { loginWithGoogleAuth, setIsAuthModalOpen } = useApp();

  const handleGoogleLogin = async () => {
    await loginWithGoogleAuth();
  };

  return (
    <div 
      style={{ 
        minHeight: 'calc(100vh - 68px)', 
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        padding: '40px 24px 80px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className="animate-fade-in"
    >
      {/* Hero Header */}
      <div style={{ maxWidth: '960px', textAlign: 'center', marginBottom: '48px' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary-subtle)',
            border: '1px solid rgba(92, 183, 128, 0.3)',
            color: 'var(--color-primary)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          <Sparkles size={14} />
          <span>Plataforma de Inteligência Contábil & Base de Conhecimento</span>
        </div>

        <h1 
          style={{ 
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', 
            fontWeight: 800, 
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 18px 0',
            color: 'var(--text-main)',
          }}
        >
          Documentação, Automação & Suporte <br />
          <span 
            style={{ 
              background: 'linear-gradient(135deg, #5cb780 0%, #38bdf8 50%, #6c63ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Conciliador Contábil
          </span>
        </h1>

        <p 
          style={{ 
            fontSize: '1.08rem', 
            color: 'var(--text-muted)', 
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
          Central unificada com manuais operacionais, parametrização de regras automáticas,
          confronto de extratos multiformato e canal oficial de escalonamento técnico.
        </p>
      </div>

      {/* Two Portal Access Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 460px))', 
          gap: '24px', 
          width: '100%', 
          maxWidth: '960px',
          marginBottom: '56px',
        }}
      >
        {/* Internal Portal Card */}
        <div 
          style={{
            background: 'var(--bg-surface)',
            border: '2px solid rgba(92, 183, 128, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              background: 'linear-gradient(90deg, #5cb780, #38bdf8)' 
            }} 
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)',
                }}
              >
                <ShieldCheck size={24} />
              </div>

              <span 
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(92, 183, 128, 0.15)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(92, 183, 128, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                Equipe Interna
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
              Portal do Colaborador
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Acesso exclusivo para a equipe com e-mail corporativo <code>@conciliadorcontabil.com.br</code>.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Base interna de manuais operacionais e regras',
                'Fila editorial de aprovação e revisão técnica',
                'Central de softwares, robôs e layouts de ERP',
                'Painel de governança e métricas de conversão',
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="var(--color-primary)" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                color: '#1f2937',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Google official SVG logo */}
              <svg width="20" height="20" viewBox="0 0 24 24">
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
              <span>Entrar com Conta Google</span>
            </button>

            {/* Email/Password Option for Internal */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '6px',
                textDecoration: 'underline',
              }}
            >
              Ou entrar com e-mail corporativo e senha
            </button>
          </div>
        </div>

        {/* External Portal Card */}
        <div 
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              background: 'linear-gradient(90deg, #38bdf8, #6c63ff)' 
            }} 
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Globe size={24} />
              </div>

              <span 
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                Clientes & Público
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
              Portal do Cliente & Suporte
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Acesso livre para escritórios clientes, operadores e usuários comuns.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Tutoriais de exportação e envio de extratos (OFX, PDF)',
                'Modelos de planilhas de pré-conciliação para download',
                'Manuais de integração dos principais ERPs contábeis',
                'Canal direto de suporte e abertura de chamados técnicos',
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="#38bdf8" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={onAccessExternalPortal}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #38bdf8, #6c63ff)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Explorar Portal do Cliente</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '6px',
                textDecoration: 'underline',
              }}
            >
              Cadastrar ou entrar como cliente com e-mail e senha
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pillars Grid */}
      <div style={{ width: '100%', maxWidth: '960px' }}>
        <h2 
          style={{ 
            fontSize: '1.35rem', 
            fontWeight: 700, 
            textAlign: 'center', 
            margin: '0 0 28px 0',
            color: 'var(--text-main)',
          }}
        >
          Pilares Operacionais da Plataforma
        </h2>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '16px' 
          }}
        >
          {[
            {
              icon: FileDown,
              title: 'Importação Universal',
              desc: 'OFX bancário, PDFs com OCR contábil, planilhas Excel e sincronização Open Finance direta.',
              color: '#5cb780',
            },
            {
              icon: Sliders,
              title: 'Regras & Automação',
              desc: 'Identificação inteligente de históricos padrão para eliminar lançamentos em transitórias.',
              color: '#38bdf8',
            },
            {
              icon: Scale,
              title: 'Confronto em Lote',
              desc: 'Baixas de partidas dobradas, liquidações parciais de boletos e conferência de saldos em segundos.',
              color: '#6c63ff',
            },
            {
              icon: FileUp,
              title: 'Exportação p/ ERPs',
              desc: 'Geração de lotes formatados para Domínio Sistemas, Alterdata, Fortes, Questor e Prosoft.',
              color: '#f59e0b',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                style={{
                  padding: '20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = feat.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div 
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '8px', 
                    background: `${feat.color}20`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: feat.color,
                    marginBottom: '14px',
                  }}
                >
                  <Icon size={20} />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
