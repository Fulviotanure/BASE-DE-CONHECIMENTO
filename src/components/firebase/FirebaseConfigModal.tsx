import React, { useState } from 'react';
import { Flame, X, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FirebaseConfigModal: React.FC = () => {
  const { isConfigModalOpen, setIsConfigModalOpen, firebaseConfig, isFirebaseConfigured, saveFirebaseKeys, resetFirebaseKeys } = useApp();

  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');

  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isConfigModalOpen) return null;

  const handleJsonPaste = (text: string) => {
    setJsonInput(text);
    try {
      // Tenta extrair valores mesmo se vier como `const firebaseConfig = { ... }`
      const cleaned = text.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
      const parsed = JSON.parse(cleaned);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setErrorMsg('');
    } catch {
      // Ignora erro de parse enquanto digita
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMsg('Por favor, informe ao menos a apiKey e o projectId do Firebase.');
      return;
    }

    saveFirebaseKeys({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    });
  };

  return (
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
      onClick={() => setIsConfigModalOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-sidebar)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={22} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>Conexão com o Firebase</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                {isFirebaseConfigured ? 'Projeto Conectado ao Firebase' : 'Executando em Modo Local Sandbox'}
              </span>
            </div>
          </div>
          <button type="button" onClick={() => setIsConfigModalOpen(false)} style={{ color: 'var(--text-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '22px' }}>
          {isFirebaseConfigured ? (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <div style={{ fontWeight: 600, color: '#10b981', fontSize: '0.88rem' }}>
                  Firebase Conectado e Ativo
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Projeto: <strong>{firebaseConfig?.projectId}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={20} color="#f59e0b" style={{ marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                O sistema está operando no <strong>Modo Local Sandbox</strong> com dados e usuários simulados para validação.
                Assim que você criar o projeto no Firebase, cole as credenciais abaixo para sincronizar na nuvem.
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '12px' }}>{errorMsg}</div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Colar Objeto do Console Firebase (opcional):
              </label>
              <textarea
                placeholder='Cole aqui o bloco const firebaseConfig = { ... }'
                rows={2}
                value={jsonInput}
                onChange={(e) => handleJsonPaste(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-subtle)', marginBottom: '3px' }}>
                  apiKey *
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-subtle)', marginBottom: '3px' }}>
                  projectId *
                </label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="conciliador-kb"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-subtle)', marginBottom: '3px' }}>
                  authDomain
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="conciliador-kb.firebaseapp.com"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-subtle)', marginBottom: '3px' }}>
                  storageBucket
                </label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="conciliador-kb.appspot.com"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              {isFirebaseConfigured ? (
                <button
                  type="button"
                  onClick={resetFirebaseKeys}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Voltar para Modo Sandbox Local</span>
                </button>
              ) : (
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                  }}
                >
                  <span>Abrir Console do Firebase</span>
                  <ExternalLink size={13} />
                </a>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsConfigModalOpen(false)}
                >
                  Fechar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar e Conectar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
