import React, { useState } from 'react';
import { Lock, Mail, User, AlertCircle, CheckCircle2, X, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { loginWithEmailPassword, registerWithEmailPassword, CORPORATE_DOMAIN } from '../../services/authService';
import type { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
        }, 1200);
      } else {
        const { user } = await registerWithEmailPassword(email, password, displayName);
        setSuccessMsg(`Conta criada com sucesso! Perfil inicial: ${user.role}.`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      let msg = err.message || 'Ocorreu um erro ao processar a autenticação.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha incorretos. Verifique suas credenciais.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail corporativo já está cadastrado. Alterne para a aba "Entrar".';
      } else if (err.code === 'auth/weak-password') {
        msg = 'A senha deve ter no mínimo 6 caracteres.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all"
        style={{ background: 'var(--color-surface, #1e2226)' }}
      >
        {/* Header Decorator */}
        <div className="h-2 w-full bg-gradient-to-r from-[#5cb780] via-[#6c63ff] to-[#5cb780]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Logo & Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#5cb780]/15 text-[#5cb780] border border-[#5cb780]/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {mode === 'LOGIN' ? 'Acesso ao Portal Interno' : 'Novo Cadastro Corporativo'}
              </h2>
              <p className="text-xs text-gray-400">
                Conciliador Contábil • Base de Conhecimento
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 mb-6 rounded-xl bg-black/30 border border-white/5">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'LOGIN'
                  ? 'bg-[#5cb780] text-black shadow-lg shadow-[#5cb780]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Entrar (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'REGISTER'
                  ? 'bg-[#5cb780] text-black shadow-lg shadow-[#5cb780]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Policy Banner */}
          <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 text-xs text-gray-300">
            <Sparkles className="w-4 h-4 text-[#5cb780] shrink-0 mt-0.5" />
            <span>
              Restrito a e-mails corporativos: <strong className="text-[#5cb780]">{CORPORATE_DOMAIN}</strong>. Novos cadastros iniciam como Operador comum.
            </span>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#5cb780]/15 border border-[#5cb780]/30 flex items-start gap-2.5 text-xs text-[#5cb780]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Fúlvio Tanure"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#5cb780] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@conciliadorcontabil.com.br"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#5cb780] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#5cb780] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#5cb780] hover:bg-[#4ea370] active:scale-[0.99] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5cb780]/20 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'LOGIN' ? 'Entrar com E-mail e Senha' : 'Concluir Cadastro'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
