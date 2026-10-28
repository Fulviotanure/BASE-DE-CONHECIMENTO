import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  X,
  RotateCcw,
  Sparkles,
  BookOpen,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  Minimize2,
  ExternalLink,
  Settings,
  Key,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ArrowLeft,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isExternalUser, isInternalUser } from '../../services/authService';
import type { Article } from '../../types';

interface AiAssistantBotProps {
  onSelectArticle: (article: Article) => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestedArticles?: Article[];
  quickReplies?: string[];
  isAiGenerated?: boolean;
}

/**
 * Ilustração SVG do Clips (Clippy 3D Clay) - Modelo em argila/plasticina 3D estilizado,
 * fiel ao design moderno da Microsoft: arame tubular perfeitamente alinhado,
 * olhos esféricos volumosos com pupilas escuras, brilho cativante ("catchlight"),
 * sobrancelhas expressivas e física de olhar suave a 120 FPS via requestAnimationFrame.
 */
const ClippyAvatarSVG: React.FC<{ size?: number; isHappy?: boolean; trackMouse?: boolean }> = ({
  size = 64,
  isHappy = false,
  trackMouse = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const leftPupilRef = useRef<SVGGElement | null>(null);
  const rightPupilRef = useRef<SVGGElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // Rastreamento de alta performance a 120 FPS via Hardware Accelerated Transform (Zero React Re-renders!)
  useEffect(() => {
    if (!trackMouse) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width * 0.49;
      const eyeCenterY = rect.top + rect.height * 0.36;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      // Raio máximo de alcance da pupila (escala do viewBox)
      const maxRadius = 24;
      const factor = Math.min(dist / 80, 1);
      targetX = Math.cos(angle) * maxRadius * factor;
      targetY = Math.sin(angle) * maxRadius * factor;

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(animatePupils);
      }
    };

    const animatePupils = () => {
      // Interpolação suave (LERP) para movimento orgânico e fluido
      currentX += (targetX - currentX) * 0.38;
      currentY += (targetY - currentY) * 0.38;

      const transformStr = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (leftPupilRef.current) leftPupilRef.current.style.transform = transformStr;
      if (rightPupilRef.current) rightPupilRef.current.style.transform = transformStr;

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafIdRef.current = requestAnimationFrame(animatePupils);
      } else {
        rafIdRef.current = null;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [trackMouse]);

  // Ciclo autônomo de piscadas: começa rápido (700ms) e pisca regularmente a cada 2.0s a 3.5s
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const doBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        // 30% de chance de piscada dupla charmosa
        if (Math.random() < 0.3) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => {
              setIsBlinking(false);
              scheduleNext();
            }, 90);
          }, 90);
        } else {
          scheduleNext();
        }
      }, 100);
    };

    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 1500;
      timeoutId = setTimeout(doBlink, delay);
    };

    // Começa a piscar logo após carregar na tela
    timeoutId = setTimeout(doBlink, 700);

    return () => clearTimeout(timeoutId);
  }, []);

  const calculatedWidth = Math.round(size * 0.573);

  return (
    <svg
      ref={svgRef}
      width={calculatedWidth}
      height={size}
      viewBox="240 30 550 960"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.22))',
      }}
    >
      <defs>
        {/* Sombra suave e leve para as esferas dos olhos */}
        <filter id="clayEyeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-3" dy="12" stdDeviation="8" floodColor="rgba(15, 23, 42, 0.32)" />
        </filter>

        {/* Sombra suave e leve para as sobrancelhas de argila */}
        <filter id="clayBrowShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-2" dy="8" stdDeviation="6" floodColor="rgba(15, 23, 42, 0.35)" />
        </filter>

        {/* Gradiente do Arame de Argila 3D (Textura cilíndrica fosca e elegante) */}
        <linearGradient id="clippyClayWire" x1="300" y1="100" x2="700" y2="920" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c0c4cc" />
          <stop offset="25%" stopColor="#a3a8b0" />
          <stop offset="50%" stopColor="#8d939c" />
          <stop offset="75%" stopColor="#7c828b" />
          <stop offset="100%" stopColor="#666b74" />
        </linearGradient>

        {/* Brilho tubular difuso ao longo do arame */}
        <linearGradient id="clippyClaySpecular" x1="280" y1="80" x2="680" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
          <stop offset="35%" stopColor="rgba(255, 255, 255, 0.45)" />
          <stop offset="70%" stopColor="rgba(255, 255, 255, 0.20)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.55)" />
        </linearGradient>

        {/* Gradiente esférico do Olho Esquerdo (Globo ocular de argila branca) */}
        <radialGradient id="clayLeftEye" cx="35%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f5f7f9" />
          <stop offset="82%" stopColor="#dde2e8" />
          <stop offset="100%" stopColor="#b8c0ca" />
        </radialGradient>

        {/* Gradiente esférico do Olho Direito */}
        <radialGradient id="clayRightEye" cx="38%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f5f7f9" />
          <stop offset="82%" stopColor="#dde2e8" />
          <stop offset="100%" stopColor="#b8c0ca" />
        </radialGradient>

        {/* Gradiente da Pupila de argila chocolate escura */}
        <radialGradient id="clayPupil" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#483639" />
          <stop offset="60%" stopColor="#3c292b" />
          <stop offset="100%" stopColor="#281b1d" />
        </radialGradient>

        {/* Gradiente da ponta arredondada esférica do arame */}
        <radialGradient id="clayCap" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#c8ccd4" />
          <stop offset="60%" stopColor="#8d939c" />
          <stop offset="100%" stopColor="#585d64" />
        </radialGradient>
      </defs>

      {/* 1. CORPO DO CLIPS (Arame Tubular Perfeitamente Alinhado e Reto - Sem Deformações) */}
      <path
        d="M 465 470 L 465 690 C 465 755, 585 755, 585 690 L 585 180 C 585 75, 340 75, 340 180 L 340 800 C 340 950, 705 950, 705 800 L 705 530 C 705 490, 725 465, 735 450"
        stroke="url(#clippyClayWire)"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Linha de reflexo / volume 3D no arame */}
      <path
        d="M 465 470 L 465 690 C 465 755, 585 755, 585 690 L 585 180 C 585 75, 340 75, 340 180 L 340 800 C 340 950, 705 950, 705 800 L 705 530 C 705 490, 725 465, 735 450"
        stroke="url(#clippyClaySpecular)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.65"
      />

      {/* Ponteiras esféricas 3D nas extremidades do arame */}
      <circle cx={465} cy={470} r={23.5} fill="url(#clayCap)" />
      <circle cx={735} cy={450} r={23.5} fill="url(#clayCap)" />

      {/* 2. OLHO ESQUERDO (Globo de argila com sombra e pupila com brilho cativante) */}
      <g filter="url(#clayEyeShadow)">
        <g
          style={{
            transformOrigin: '380px 360px',
            transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
            transition: isBlinking ? 'transform 0.07s ease-out' : 'transform 0.10s ease-in',
          }}
        >
          <ellipse cx={380} cy={360} rx={105} ry={110} fill="url(#clayLeftEye)" />
          {/* Pupila Esquerda Gigante (GPU transform + Brilhos) */}
          <g ref={leftPupilRef} style={{ willChange: 'transform' }}>
            <ellipse cx={380} cy={325} rx={64} ry={66} fill="url(#clayPupil)" />
            {/* Brilho principal no olho (Catchlight) */}
            <circle cx={362} cy={308} r={14} fill="#ffffff" />
            {/* Brilho secundário suave */}
            <circle cx={396} cy={340} r={7} fill="#ffffff" opacity={0.75} />
          </g>
        </g>
      </g>

      {/* 3. OLHO DIREITO (Globo de argila sobreposto e pupila com brilho) */}
      <g filter="url(#clayEyeShadow)">
        <g
          style={{
            transformOrigin: '585px 395px',
            transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
            transition: isBlinking ? 'transform 0.07s ease-out' : 'transform 0.10s ease-in',
          }}
        >
          <ellipse cx={585} cy={395} rx={110} ry={114} fill="url(#clayRightEye)" />
          {/* Pupila Direita Gigante (GPU transform + Brilhos) */}
          <g ref={rightPupilRef} style={{ willChange: 'transform' }}>
            <ellipse cx={585} cy={360} rx={78} ry={80} fill="url(#clayPupil)" />
            {/* Brilho principal no olho direito */}
            <circle cx={563} cy={340} r={16.5} fill="#ffffff" />
            {/* Brilho secundário suave */}
            <circle cx={604} cy={378} r={8} fill="#ffffff" opacity={0.75} />
          </g>
        </g>
      </g>

      {/* 4. SOBRANCELHAS DE ARGILA (Formato cápsula/salsicha 3D) */}
      {/* Sobrancelha Esquerda */}
      <g filter="url(#clayBrowShadow)">
        <g
          style={{
            transformOrigin: '380px 160px',
            transform: isBlinking ? 'translateY(18px)' : (isHappy ? 'translateY(-10px) rotate(-3deg)' : 'translateY(0)'),
            transition: 'transform 0.1s ease-out',
          }}
        >
          <path
            d="M 320 168 Q 380 150 440 158"
            stroke="#3c292b"
            strokeWidth="46"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 330 162 Q 380 146 430 154"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>

      {/* Sobrancelha Direita (Inclinada para baixo à direita) */}
      <g filter="url(#clayBrowShadow)">
        <g
          style={{
            transformOrigin: '585px 235px',
            transform: isBlinking ? 'translateY(18px)' : (isHappy ? 'translateY(-12px) rotate(4deg)' : 'translateY(0)'),
            transition: 'transform 0.1s ease-out',
          }}
        >
          <path
            d="M 530 205 Q 585 235 645 272"
            stroke="#3c292b"
            strokeWidth="48"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 538 201 Q 585 230 637 266"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>
    </svg>
  );
};

export interface GeminiModelOption {
  id: string;
  label: string;
}

export interface GeminiModelGroup {
  group: string;
  models: GeminiModelOption[];
}

export const GEMINI_MODEL_GROUPS: GeminiModelGroup[] = [
  {
    group: 'Gemini 3 Series (Geração 3.x • Mais recente)',
    models: [
      { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Nova Geração 3.8 • Alta Velocidade & Inteligência)' },
      { id: 'gemini-3.8-live', label: 'gemini-3.8-live (Interações em Tempo Real Bidirecionais)' },
      { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (Ultra Rápido & Baixa Latência)' },
    ],
  },
  {
    group: 'Gemini 2.5 (Recomendado)',
    models: [
      { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Alta Velocidade & Multimodal)' },
      { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (Raciocínio Profundo & Alta Precisão)' },
      { id: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Ultra Rápido & Menor Latência)' },
    ],
  },
  {
    group: 'Gemini 2.0 (Geração 2.0)',
    models: [
      { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash (Geração 2.0 • Equilíbrio de Performance)' },
      { id: 'gemini-2.0-flash-lite', label: 'gemini-2.0-flash-lite (Geração 2.0 • Econômico & Ágil)' },
    ],
  },
  {
    group: 'Gemini 1.5 (Estável)',
    models: [
      { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash (Estável • Rápido & Cota Gratuita Ampla)' },
      { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro (Contexto 2M Tokens & Raciocínio Extenso)' },
      { id: 'gemini-1.5-flash-8b', label: 'gemini-1.5-flash-8b (Modelo Compacto & Respostas Diretas)' },
    ],
  },
];

export const AiAssistantBot: React.FC<AiAssistantBotProps> = ({ onSelectArticle }) => {
  const { articles, categories, currentUser, theme } = useApp();
  const isDark = theme === 'dark';
  const isExternal = isExternalUser(currentUser);
  const isInternal = isInternalUser(currentUser);
  const isAdmin = isInternal && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN');

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);
  const [isBotHovered, setIsBotHovered] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Painel de Configurações de API de IA
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'local'>(() => {
    return (localStorage.getItem('conciliador_ai_provider') as 'gemini' | 'openai' | 'local') || 'gemini';
  });
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('conciliador_ai_gemini_key') || '';
  });
  const [geminiModel, setGeminiModel] = useState<string>(() => {
    return localStorage.getItem('conciliador_ai_gemini_model') || 'gemini-3.8-flash';
  });
  const [isCustomGemini, setIsCustomGemini] = useState<boolean>(() => {
    const saved = localStorage.getItem('conciliador_ai_gemini_model') || 'gemini-3.8-flash';
    const isPreset = GEMINI_MODEL_GROUPS.some((g) => g.models.some((m) => m.id === saved));
    return !isPreset;
  });
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(() => {
    return localStorage.getItem('conciliador_ai_openai_key') || '';
  });
  const [openaiModel, setOpenaiModel] = useState<string>(() => {
    return localStorage.getItem('conciliador_ai_openai_model') || 'gpt-4o-mini';
  });
  const [showKeyPassword, setShowKeyPassword] = useState<boolean>(false);
  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState<boolean>(false);
  const [testApiStatus, setTestApiStatus] = useState<{ testing: boolean; success?: boolean; message?: string }>({
    testing: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Perguntas rápidas iniciais de sugestão (Patentes e redação exclusivas para equipe interna)
  const defaultQuickReplies = useMemo(() => {
    if (isInternal) {
      return [
        'Como conciliar extrato bancário?',
        'Como criar um novo artigo?',
        'Como funciona o sistema de patentes?',
        'Quais ferramentas estão disponíveis?',
      ];
    }
    return [
      'Como conciliar extrato bancário?',
      'Quais ferramentas estão disponíveis?',
      'Como buscar um manual na base?',
      'O que fazer em caso de dúvidas?',
    ];
  }, [isInternal]);

  // Histórico de mensagens da conversa
  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: `Olá! Eu sou **O Conciliador** 📎, seu assistente inteligente na Base de Conhecimento do Conciliador Contábil!\n\nEstou aqui para tirar dúvidas sobre processos, manuais, regras de conciliação e rotinas da equipe.\n\n**O que posso te ajudar a resolver hoje?**`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: isInternal ? [
          'Como conciliar extrato bancário?',
          'Como criar um novo artigo?',
          'Como funciona o sistema de patentes?',
          'Quais ferramentas estão disponíveis?',
        ] : [
          'Como conciliar extrato bancário?',
          'Quais ferramentas estão disponíveis?',
          'Como buscar um manual na base?',
          'O que fazer em caso de dúvidas?',
        ],
      },
    ];
  });

  // Salvar configurações no localStorage
  const handleSaveSettings = () => {
    const finalGeminiModel = geminiModel.trim() || 'gemini-3.8-flash';
    const finalOpenaiModel = openaiModel.trim() || 'gpt-4o-mini';
    localStorage.setItem('conciliador_ai_provider', aiProvider);
    localStorage.setItem('conciliador_ai_gemini_key', geminiApiKey.trim());
    localStorage.setItem('conciliador_ai_gemini_model', finalGeminiModel);
    localStorage.setItem('conciliador_ai_openai_key', openaiApiKey.trim());
    localStorage.setItem('conciliador_ai_openai_model', finalOpenaiModel);
    setGeminiModel(finalGeminiModel);
    setOpenaiModel(finalOpenaiModel);
    setSettingsSavedFeedback(true);
    setTimeout(() => {
      setSettingsSavedFeedback(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  // Testar Conexão com a API Selecionada
  const testApiConnection = async () => {
    setTestApiStatus({ testing: true });
    try {
      if (aiProvider === 'gemini') {
        const key = geminiApiKey.trim();
        const modelToUse = geminiModel.trim() || 'gemini-3.8-flash';
        if (!key) {
          setTestApiStatus({ testing: false, success: false, message: 'Insira sua Gemini API Key antes de testar.' });
          return;
        }
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Responda apenas: OK' }] }],
              generationConfig: { maxOutputTokens: 10 },
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Erro HTTP ${res.status}`);
        }
        setTestApiStatus({ testing: false, success: true, message: 'Conexão com Gemini bem-sucedida! 🚀' });
      } else if (aiProvider === 'openai') {
        const key = openaiApiKey.trim();
        if (!key) {
          setTestApiStatus({ testing: false, success: false, message: 'Insira sua OpenAI API Key antes de testar.' });
          return;
        }
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: openaiModel,
            messages: [{ role: 'user', content: 'Responda apenas: OK' }],
            max_tokens: 10,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Erro HTTP ${res.status}`);
        }
        setTestApiStatus({ testing: false, success: true, message: 'Conexão com OpenAI bem-sucedida! 🚀' });
      } else {
        setTestApiStatus({ testing: false, success: true, message: 'Motor local integrado sempre pronto e ativo! ⚡' });
      }
    } catch (e: any) {
      setTestApiStatus({ testing: false, success: false, message: `Falha no teste: ${e.message || 'Chave inválida'}` });
    }
  };

  // Filtra artigos disponíveis de acordo com a permissão do usuário
  const getAvailableArticles = (): Article[] => {
    return articles.filter((a) => {
      if (a.currentStatus !== 'APPROVED') return false;
      if (isExternal) {
        if (a.accessLevel === 'INTERNAL') return false;
        const parentCat = categories.find((c) => c.id === a.categoryId);
        if (
          parentCat &&
          (parentCat.accessLevel === 'INTERNAL' ||
            parentCat.title?.toLowerCase().includes('playbook') ||
            parentCat.id === 'cat-11' ||
            parentCat.id === 'cat-12')
        ) {
          return false;
        }
        if (
          a.categoryName?.toLowerCase().includes('playbook') ||
          a.categoryId === 'cat-11' ||
          a.categoryId === 'cat-12'
        ) {
          return false;
        }
      }
      return true;
    });
  };

  // Rolar para a última mensagem com ajuste inteligente para início da resposta
  useEffect(() => {
    if (isOpen && !isSettingsOpen) {
      const isLastBot = messages.length > 0 && messages[messages.length - 1].sender === 'bot';
      if (isLastBot && lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isThinking, isOpen, isSettingsOpen]);

  // Foco no input ao abrir a janela
  useEffect(() => {
    if (isOpen && !isSettingsOpen) {
      setShowSpeechBubble(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isSettingsOpen]);

  // Esconder balão de chamada após 15 segundos se não for clicado
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  // Decodifica todas as entidades HTML (&ccedil;, &atilde;, &eacute;, etc.) para caracteres normais em português
  const decodeHtmlEntities = (text: string): string => {
    if (!text) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      let decoded = doc.body.textContent || '';
      // Segunda passagem caso haja entidades escapadas em dobro (ex: &amp;ccedil;)
      if (decoded.includes('&')) {
        const doc2 = parser.parseFromString(decoded, 'text/html');
        decoded = doc2.body.textContent || decoded;
      }
      return decoded;
    } catch {
      return text;
    }
  };

  // Extrai texto limpo e legível do HTML dos artigos, sem tags e sem entidades HTML
  const cleanHtmlToText = (html: string): string => {
    if (!html) return '';

    // 1. Remove blocos de script e style
    let clean = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*[\/]?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<\/li>/gi, ' ')
      .replace(/<\/h[1-6]>/gi, ' ');

    // 2. Remove todas as tags HTML
    clean = clean.replace(/<[^>]+>/g, ' ');

    // 3. Decodifica todas as entidades HTML via DOMParser
    clean = decodeHtmlEntities(clean);

    // 4. Substituição de segurança para garantir qualquer entidade remanescente
    clean = clean
      .replace(/&ccedil;/gi, 'ç')
      .replace(/&Ccedil;/gi, 'Ç')
      .replace(/&atilde;/gi, 'ã')
      .replace(/&Atilde;/gi, 'Ã')
      .replace(/&otilde;/gi, 'õ')
      .replace(/&Otilde;/gi, 'Õ')
      .replace(/&aacute;/gi, 'á')
      .replace(/&Aacute;/gi, 'Á')
      .replace(/&eacute;/gi, 'é')
      .replace(/&Eacute;/gi, 'É')
      .replace(/&iacute;/gi, 'í')
      .replace(/&Iacute;/gi, 'Í')
      .replace(/&oacute;/gi, 'ó')
      .replace(/&Oacute;/gi, 'Ó')
      .replace(/&uacute;/gi, 'ú')
      .replace(/&Uacute;/gi, 'Ú')
      .replace(/&ecirc;/gi, 'ê')
      .replace(/&Ecirc;/gi, 'Ê')
      .replace(/&ocirc;/gi, 'ô')
      .replace(/&Ocirc;/gi, 'Ô')
      .replace(/&acirc;/gi, 'â')
      .replace(/&Acirc;/gi, 'Â')
      .replace(/&agrave;/gi, 'à')
      .replace(/&Agrave;/gi, 'À')
      .replace(/&uuml;/gi, 'ü')
      .replace(/&Uuml;/gi, 'Ü')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&ordm;/gi, 'º')
      .replace(/&ordf;/gi, 'ª')
      .replace(/&deg;/gi, '°');

    // 5. Normaliza espaços múltiplos
    return clean.replace(/\s+/g, ' ').trim();
  };

  // Processamento com Inteligência Artificial (Gemini / OpenAI ou Motor Local)
  const processUserQuestion = async (query: string): Promise<{ text: string; articles: Article[]; quickReplies?: string[]; isAiGenerated?: boolean }> => {
    const cleanQuery = query.toLowerCase().trim();
    const available = getAvailableArticles();

    // 1. Tratamento para saudações gerais
    if (/^(oi|ola|olá|bom dia|boa tarde|boa noite|e ai|e aí|fala|hello)/i.test(cleanQuery) && cleanQuery.length < 25) {
      return {
        text: `Olá! Que bom falar com você! 😊\n\nEstou pronto para te orientar sobre as rotinas contábeis, importações, cadastros ou validações.\n\nVocê pode me fazer uma pergunta sobre qualquer funcionalidade ou clicar nas opções rápidas abaixo!`,
        articles: [],
        quickReplies: defaultQuickReplies,
      };
    }

    // 2. Tratamento para identidade do robô
    if (cleanQuery.includes('quem é você') || cleanQuery.includes('quem e voce') || cleanQuery.includes('seu nome') || cleanQuery.includes('o que você faz')) {
      return {
        text: `Eu sou **O Conciliador** 📎, assistente inteligente integrado à Base de Conhecimento do Conciliador Contábil!\n\nMinha missão é analisar todos os manuais oficiais da nossa base para responder suas dúvidas com precisão, explicar o passo a passo e indicar os artigos de referência.`,
        articles: [],
        quickReplies: defaultQuickReplies,
      };
    }

    // 3. Tratamento para agradecimentos
    if (/^(obrigado|obrigada|valeu|muito obrigado|agradecido|thanks|perfeito|show|top)/i.test(cleanQuery)) {
      return {
        text: `Por nada! Fico muito feliz em ajudar! 🚀✨\n\nSe surgir qualquer outra dúvida durante suas rotinas, estarei sempre à disposição no cantinho da tela. Bom trabalho!`,
        articles: [],
      };
    }

    // 3.1 Tratamento para Patentes & Gamificação (Regra: Patente é exclusiva para colaboradores internos)
    if (cleanQuery.includes('patente') || cleanQuery.includes('patentes') || cleanQuery.includes('gamifica')) {
      if (!isInternal) {
        return {
          text: `O **Sistema de Patentes e Gamificação** é um recurso interno exclusivo para os colaboradores da equipe da Conciliador Contábil, utilizado para reconhecer a criação e revisão técnica dos manuais.\n\nComo leitor externo, você tem acesso irrestrito para pesquisar, estudar e utilizar todos os artigos e tutoriais da base de conhecimento! 📖✨`,
          articles: [],
          quickReplies: defaultQuickReplies,
        };
      }
      return {
        text: `O **Sistema de Patentes** da Conciliador Contábil reconhece e premia os colaboradores internos pelo engajamento e contribuição na Base de Conhecimento! 🎖️\n\n**Como pontuar:**\n• **+100 pontos** por artigo aprovado e publicado\n• **+50 pontos** por artigo submetido em análise\n• **+30 pontos** por revisão técnica realizada\n• **+20 pontos** por ajuste atendido\n\n**Hierarquia de Patentes:**\n1. 🌱 **Aspirante do Saber** (0 a 99 pts)\n2. 🥉 **Redator Bronze** (100 a 299 pts)\n3. 🥈 **Escritor Prata** (300 a 599 pts)\n4. 🥇 **Mestre do Conteúdo Ouro** (600 a 999 pts)\n5. 👑 **Guardião Lendário** (1.000+ pts)\n\nVocê pode acompanhar sua evolução no topo do cabeçalho ou na aba **Dashboard > Usuários & Patentes**!`,
        articles: [],
        quickReplies: defaultQuickReplies,
      };
    }

    // 4. Busca Semântica Ponderada nos Artigos da Base
    const searchTerms = cleanQuery
      .replace(/[?.,!;:]/g, '')
      .split(' ')
      .filter((w) => w.length > 2 && !['como', 'fazer', 'para', 'onde', 'qual', 'quais', 'esse', 'essa', 'sobre', 'estou', 'está'].includes(w));

    const scoredArticles = available.map((art) => {
      let score = 0;
      const cleanTitle = decodeHtmlEntities(art.title || '');
      const cleanCode = art.code || '';
      const cleanCat = decodeHtmlEntities(art.categoryName || '');
      const cleanContent = cleanHtmlToText(art.contentHtml || '');

      const lowerTitle = cleanTitle.toLowerCase();
      const lowerCode = cleanCode.toLowerCase();
      const lowerCat = cleanCat.toLowerCase();
      const lowerTags = (art.tags || []).join(' ').toLowerCase();
      const lowerContent = cleanContent.toLowerCase();

      // Código exato do manual (ex: CC-101)
      if (lowerCode && cleanQuery.includes(lowerCode)) score += 200;
      if (lowerTitle && cleanQuery.includes(lowerTitle)) score += 120;

      searchTerms.forEach((term) => {
        if (lowerTitle.includes(term)) score += 35;
        if (lowerCode.includes(term)) score += 40;
        if (lowerTags.includes(term)) score += 25;
        if (lowerCat.includes(term)) score += 20;
        if (lowerContent.includes(term)) score += 10;
      });

      return {
        article: art,
        score,
        cleanTitle,
        cleanCat,
        cleanContent,
      };
    });

    scoredArticles.sort((a, b) => b.score - a.score);
    const topMatches = scoredArticles.filter((item) => item.score > 0).slice(0, 3);
    const recommendedArticles = topMatches.map((m) => m.article);

    // Contexto montado a partir dos manuais para a IA
    const contextArticles = (topMatches.length > 0 ? topMatches : scoredArticles.slice(0, 2)).map((m) => {
      return `MANUAL: ${m.cleanTitle} (Código: ${m.article.code || 'CC'})
Categoria: ${m.cleanCat}
Conteúdo/Instruções: ${m.cleanContent.slice(0, 1200)}`;
    }).join('\n\n---\n\n');

    // =========================================================================
    // CASO 1: INTEGRAÇÃO REAL COM GOOGLE GEMINI API
    // =========================================================================
    if (aiProvider === 'gemini' && geminiApiKey.trim()) {
      try {
        const prompt = `Você é O Conciliador, o assistente inteligente oficial da Base de Conhecimento do software Conciliador Contábil.
Sua missão é responder à dúvida do usuário de forma clara, amigável, didática e direta em português brasileiro.
Baseie-se estritamente nas regras e procedimentos descritos nos manuais da equipe fornecidos abaixo.

MANUAIS OFICIAIS DISPONÍVEIS:
${contextArticles}

PERGUNTA DO USUÁRIO:
"${query}"

INSTRUÇÕES OBRIGATÓRIAS:
1. Forneça uma explicação completa e bem estruturada (em tópicos ou passos, se aplicável).
2. Destaque termos e comandos importantes em negrito (**termo**).
3. Seja simpático e profissional.
4. Mencione os nomes dos manuais de referência encontrados.
5. Não corte o texto no meio e não inclua tags HTML brutas.`;

        const modelToUse = geminiModel.trim() || 'gemini-3.8-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${geminiApiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return {
              text: generatedText.trim(),
              articles: recommendedArticles,
              isAiGenerated: true,
              quickReplies: recommendedArticles.length > 0 ? [`Ver mais sobre ${recommendedArticles[0].categoryName}`, 'Fazer outra pergunta'] : defaultQuickReplies,
            };
          }
        }
      } catch (err) {
        console.warn('Falha na chamada Gemini API, acionando motor local:', err);
      }
    }

    // =========================================================================
    // CASO 2: INTEGRAÇÃO REAL COM OPENAI API
    // =========================================================================
    if (aiProvider === 'openai' && openaiApiKey.trim()) {
      try {
        const systemPrompt = `Você é O Conciliador, o assistente inteligente oficial da Base de Conhecimento do software Conciliador Contábil.
Sua missão é responder à dúvida do usuário com base nos manuais fornecidos abaixo, com explicações didáticas, passos práticos e linguagem acolhedora em português brasileiro.
Destaque termos importantes em negrito (**termo**).

MANUAIS DISPONÍVEIS:
${contextArticles}`;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: openaiModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const generatedText = data.choices?.[0]?.message?.content;
          if (generatedText) {
            return {
              text: generatedText.trim(),
              articles: recommendedArticles,
              isAiGenerated: true,
              quickReplies: recommendedArticles.length > 0 ? [`Ver mais sobre ${recommendedArticles[0].categoryName}`, 'Fazer outra pergunta'] : defaultQuickReplies,
            };
          }
        }
      } catch (err) {
        console.warn('Falha na chamada OpenAI API, acionando motor local:', err);
      }
    }

    // =========================================================================
    // CASO 3: MOTOR LOCAL INTEGRADO (SEM API OU FALLBACK)
    // =========================================================================
    if (topMatches.length > 0) {
      const best = topMatches[0];
      const bestArticle = best.article;
      const articleTitle = best.cleanTitle || decodeHtmlEntities(bestArticle.title);
      const articleCategory = best.cleanCat || decodeHtmlEntities(bestArticle.categoryName);

      // Divide em frases reais e formata com inicial maiúscula
      const rawSentences = best.cleanContent
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20 && !s.includes('{') && !s.includes('}'));

      // Pega até 3 frases completas e garante formatação correta em português
      const formattedSentences = rawSentences.slice(0, 3).map((sentence) => {
        const trimmed = sentence.trim();
        if (!trimmed) return '';
        const cap = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        return /[.!?]$/.test(cap) ? cap : `${cap}.`;
      }).filter(Boolean);

      const cleanExcerpt = formattedSentences.join(' ');

      let responseText = `Encontrei a orientação ideal para sua dúvida no manual oficial **${articleTitle}** (${bestArticle.code || 'CC'}) na categoria **${articleCategory || 'Geral'}**!\n\n`;

      if (cleanExcerpt) {
        responseText += `💡 **Resumo do procedimento:**\n"${cleanExcerpt}"\n\n`;
      }

      responseText += `Você pode abrir o manual completo com telas e detalhes clicando no card abaixo:`;

      return {
        text: responseText,
        articles: recommendedArticles,
        isAiGenerated: false,
        quickReplies: [
          `Ver mais sobre ${articleCategory || 'este módulo'}`,
          isInternal ? 'Como criar um novo artigo?' : 'Como buscar outros manuais?',
          'Fazer outra pergunta',
        ],
      };
    }

    // Se nenhum artigo for encontrado
    return {
      text: `Não encontrei um manual específico correspondente a **"${query}"** na base de dados oficial no momento.\n\n💡 **Dicas para encontrar o que precisa:**\n• Tente usar palavras-chave diretas (ex: *"extrato"*, *"banco"*, *"regra"*, *"fornecedor"*, *"ofx"*).\n• Você também pode usar a busca rápida no topo ou pelo atalho **Ctrl + K**.\n• Para rotinas novas, você pode sugerir a criação de um artigo em **"+ Criar Novo Artigo"**!`,
      articles: available.slice(0, 2),
      isAiGenerated: false,
      quickReplies: defaultQuickReplies,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isThinking) return;

    // Adiciona a mensagem do usuário
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
      const response = await processUserQuestion(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        suggestedArticles: response.articles,
        quickReplies: response.quickReplies,
        isAiGenerated: response.isAiGenerated,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Desculpe, ocorreu uma oscilação na consulta aos manuais. Por favor, tente novamente.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Olá novamente! O histórico de conversa foi limpo. 🧹✨\n\nComo posso te ajudar agora com a Base de Conhecimento do Conciliador Contábil?`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: defaultQuickReplies,
      },
    ]);
  };

  const handleArticleClick = (art: Article) => {
    onSelectArticle(art);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const hasConfiguredApi = (aiProvider === 'gemini' && !!geminiApiKey) || (aiProvider === 'openai' && !!openaiApiKey);

  return (
    <>
      {/* ====================================================================
          JANELA DE CONVERSA DO CONCILIBOT (CHAT POPUP)
          ==================================================================== */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '410px',
            maxWidth: 'calc(100vw - 32px)',
            height: '610px',
            maxHeight: 'calc(100vh - 120px)',
            background: isDark ? 'rgba(24, 27, 31, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
            boxShadow: isDark
              ? '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 25px rgba(92, 183, 128, 0.2)'
              : '0 20px 45px rgba(0, 0, 0, 0.15), 0 0 20px rgba(92, 183, 128, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.22s ease-out',
          }}
        >
          {/* CABEÇALHO DO CHAT */}
          <div
            style={{
              padding: '13px 18px',
              background: isDark ? 'rgba(30, 34, 39, 0.9)' : 'rgba(248, 250, 252, 0.95)',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClippyAvatarSVG size={36} isHappy />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 800 }}>
                    O Conciliador
                  </strong>
                  {isAdmin ? (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: hasConfiguredApi ? 'rgba(56, 189, 248, 0.2)' : 'rgba(92, 183, 128, 0.2)',
                        color: hasConfiguredApi ? '#38bdf8' : 'var(--color-primary)',
                        border: `1px solid ${hasConfiguredApi ? 'rgba(56, 189, 248, 0.35)' : 'rgba(92, 183, 128, 0.3)'}`,
                      }}
                      title={hasConfiguredApi ? `Configurado via ${aiProvider.toUpperCase()}` : 'Motor Local Ativo'}
                    >
                      {aiProvider === 'gemini' && geminiApiKey ? 'Gemini IA ✨' : aiProvider === 'openai' && openaiApiKey ? 'OpenAI IA 🤖' : 'Motor Local ⚡'}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: 'rgba(92, 183, 128, 0.2)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(92, 183, 128, 0.3)',
                      }}
                    >
                      Base de Conhecimento
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.70rem', color: 'var(--text-subtle)' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #10b981',
                    }}
                  />
                  <span>Online • Inteligência dos Manuais</span>
                </div>
              </div>
            </div>

            {/* Ações do Topo: Configuração (Engrenagem - apenas Admins), Limpar e Fechar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Botão de Engrenagem de Configuração de API (Visível apenas para Administradores) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  style={{
                    background: isSettingsOpen ? 'rgba(92, 183, 128, 0.2)' : 'transparent',
                    border: isSettingsOpen ? '1px solid rgba(92, 183, 128, 0.4)' : '1px solid transparent',
                    color: isSettingsOpen ? 'var(--color-primary)' : 'var(--text-subtle)',
                    padding: '6px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title={isSettingsOpen ? 'Voltar para o chat' : 'Configurações de API de IA (Admin)'}
                  onMouseEnter={(e) => {
                    if (!isSettingsOpen) e.currentTarget.style.color = 'var(--text-main)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSettingsOpen) e.currentTarget.style.color = 'var(--text-subtle)';
                  }}
                >
                  <Settings size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={handleResetChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                title="Limpar e recomeçar conversa"
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              >
                <RotateCcw size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                title="Fechar chat"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* ================================================================
              PAINEL DE CONFIGURAÇÕES DE API DE IA (ENGRENAGEM - APENAS ADMINS)
              ================================================================ */}
          {isSettingsOpen && isAdmin ? (
            <div
              style={{
                flex: 1,
                padding: '20px 18px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    borderRadius: '6px',
                  }}
                  title="Voltar ao Chat"
                >
                  <ArrowLeft size={16} />
                </button>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                  Configurações de API de IA
                </h3>
              </div>

              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
                Escolha o motor de inteligência artificial desejado. Você pode plugar sua chave de API para respostas geradas por IA avançada ou usar o motor local gratuito.
              </span>

              {/* Seletor de Provedor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Provedor de Inteligência Artificial:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '10px',
                      border: aiProvider === 'gemini' ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                      background: aiProvider === 'gemini' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                      color: aiProvider === 'gemini' ? '#38bdf8' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Google Gemini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('openai')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '10px',
                      border: aiProvider === 'openai' ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      background: aiProvider === 'openai' ? 'rgba(92, 183, 128, 0.15)' : 'var(--bg-surface)',
                      color: aiProvider === 'openai' ? 'var(--color-primary)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Cpu size={16} />
                    <span>OpenAI (GPT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('local')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '10px',
                      border: aiProvider === 'local' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                      background: aiProvider === 'local' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                      color: aiProvider === 'local' ? '#f59e0b' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <BookOpen size={16} />
                    <span>Motor Local</span>
                  </button>
                </div>
              </div>

              {/* Opções específicas para GEMINI */}
              {aiProvider === 'gemini' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                      <span>Gemini API Key:</span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.68rem', color: '#38bdf8', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        Obter chave gratuita <ExternalLink size={10} />
                      </a>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showKeyPassword ? 'text' : 'password'}
                        placeholder="Cole sua chave AIzaSy..."
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 36px 8px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-main)',
                          fontSize: '0.80rem',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyPassword((prev) => !prev)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-subtle)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        {showKeyPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Versão do Modelo Gemini:
                      </label>
                      <a
                        href="https://ai.google.dev/gemini-api/docs/models?hl=pt-br"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.68rem', color: '#38bdf8', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        Modelos Oficiais <ExternalLink size={10} />
                      </a>
                    </div>
                    <select
                      value={isCustomGemini ? 'custom' : geminiModel}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomGemini(true);
                        } else {
                          setIsCustomGemini(false);
                          setGeminiModel(e.target.value);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.80rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {GEMINI_MODEL_GROUPS.map((group) => (
                        <optgroup key={group.group} label={group.group}>
                          {group.models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="Outro">
                        <option value="custom">⚙️ Digitar versão personalizada...</option>
                      </optgroup>
                    </select>

                    {/* Campo para versão personalizada de modelo */}
                    {isCustomGemini && (
                      <div style={{ marginTop: '8px' }}>
                        <input
                          type="text"
                          placeholder="Ex: gemini-3.8-flash, gemini-2.5-flash, etc."
                          value={geminiModel}
                          onChange={(e) => setGeminiModel(e.target.value.trim())}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px dashed #38bdf8',
                            background: isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(56, 189, 248, 0.08)',
                            color: 'var(--text-main)',
                            fontSize: '0.80rem',
                            outline: 'none',
                          }}
                        />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '4px', display: 'block' }}>
                          Informe o identificador do modelo conforme a documentação oficial da API.
                        </span>
                      </div>
                    )}

                    {/* Links para documentação oficial do Google */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                      <a
                        href="https://ai.google.dev/gemini-api/docs/models?hl=pt-br"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.69rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                      >
                        <BookOpen size={11} /> Documentação dos Modelos (ai.google.dev) <ExternalLink size={10} />
                      </a>
                      <a
                        href="https://ai.google.dev/gemini-api/docs?hl=pt-br"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.69rem', color: 'var(--text-subtle)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        Visão Geral da API <ExternalLink size={9} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Opções específicas para OPENAI */}
              {aiProvider === 'openai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                      <span>OpenAI API Key:</span>
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.68rem', color: 'var(--color-primary)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        Obter chave na OpenAI <ExternalLink size={10} />
                      </a>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showKeyPassword ? 'text' : 'password'}
                        placeholder="sk-proj-..."
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 36px 8px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-main)',
                          fontSize: '0.80rem',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyPassword((prev) => !prev)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-subtle)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        {showKeyPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Modelo da OpenAI:
                    </label>
                    <select
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.80rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Econômico e Rápido)</option>
                      <option value="gpt-4o">gpt-4o (Mais Completo)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Opções específicas para MOTOR LOCAL */}
              {aiProvider === 'local' && (
                <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  ⚡ <strong>Modo Local Offline Ativo:</strong>
                  <p style={{ marginTop: '4px', color: 'var(--text-subtle)' }}>
                    O motor local roda direto no navegador, lendo todos os artigos carregados na base oficial sem consumir cotas nem requisições externas.
                  </p>
                </div>
              )}

              {/* Feedback de Teste */}
              {testApiStatus.message && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    background: testApiStatus.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: testApiStatus.success ? '#10b981' : '#ef4444',
                    border: `1px solid ${testApiStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {testApiStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{testApiStatus.message}</span>
                </div>
              )}

              {/* Botões de Ação */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={testApiConnection}
                  disabled={testApiStatus.testing}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: testApiStatus.testing ? 'default' : 'pointer',
                  }}
                >
                  {testApiStatus.testing ? 'Testando...' : 'Testar Conexão'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: settingsSavedFeedback ? '#10b981' : 'var(--color-primary)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {settingsSavedFeedback ? <Check size={14} /> : <Key size={14} />}
                  <span>{settingsSavedFeedback ? 'Salvo com sucesso!' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ================================================================
                  ÁREA DE MENSAGENS COM ROLAGEM E LEITURA CONFORTÁVEL
                  ================================================================ */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {messages.map((msg, index) => {
                  const isBot = msg.sender === 'bot';
                  const isLast = index === messages.length - 1;

                  return (
                    <div
                      key={msg.id}
                      ref={isLast ? lastMessageRef : undefined}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isBot ? 'flex-start' : 'flex-end',
                        animation: 'fadeIn 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          maxWidth: '92%',
                          flexDirection: isBot ? 'row' : 'row-reverse',
                        }}
                      >
                        {isBot && (
                          <div style={{ flexShrink: 0, marginTop: '2px' }}>
                            <ClippyAvatarSVG size={26} trackMouse={false} />
                          </div>
                        )}

                        <div
                          style={{
                            padding: '12px 15px',
                            borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                            background: isBot
                              ? isDark
                                ? 'rgba(30, 34, 39, 0.95)'
                                : '#f1f5f9'
                              : 'linear-gradient(135deg, var(--color-primary), #4ea16f)',
                            color: isBot ? 'var(--text-main)' : '#ffffff',
                            border: isBot
                              ? isDark
                                ? '1px solid rgba(255, 255, 255, 0.08)'
                                : '1px solid rgba(0, 0, 0, 0.06)'
                              : 'none',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            fontSize: '0.84rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {/* Renderização com suporte a negrito e tópicos */}
                          {msg.text.split('\n').map((paragraph, pIdx) => {
                            if (!paragraph.trim()) {
                              return <div key={pIdx} style={{ height: '6px' }} />;
                            }

                            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);

                            return (
                              <div key={pIdx} style={{ marginBottom: '4px' }}>
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong key={partIdx} style={{ color: isBot ? (isDark ? '#5cb780' : '#15803d') : '#ffffff' }}>
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return <span key={partIdx}>{part}</span>;
                                })}
                              </div>
                            );
                          })}

                          {/* CARDS DE ARTIGOS RECOMENDADOS PELO ROBÔ */}
                          {msg.suggestedArticles && msg.suggestedArticles.length > 0 && (
                            <div
                              style={{
                                marginTop: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                paddingTop: '8px',
                                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                📚 Manuais Oficiais Encontrados:
                              </span>

                              {msg.suggestedArticles.map((art) => (
                                <div
                                  key={art.id}
                                  onClick={() => handleArticleClick(art)}
                                  style={{
                                    padding: '9px 11px',
                                    borderRadius: '10px',
                                    background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
                                    border: '1px solid var(--border-subtle)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                      <span
                                        style={{
                                          fontSize: '0.65rem',
                                          fontWeight: 800,
                                          padding: '1px 5px',
                                          borderRadius: '4px',
                                          background: 'rgba(92, 183, 128, 0.15)',
                                          color: 'var(--color-primary)',
                                          border: '1px solid rgba(92, 183, 128, 0.3)',
                                          fontFamily: 'monospace',
                                        }}
                                      >
                                        {art.code || 'CC-MANUAL'}
                                      </span>
                                      <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {decodeHtmlEntities(art.categoryName)}
                                      </span>
                                    </div>
                                    <strong
                                      style={{
                                        fontSize: '0.78rem',
                                        color: 'var(--text-main)',
                                        display: 'block',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                      title={decodeHtmlEntities(art.title)}
                                    >
                                      {decodeHtmlEntities(art.title)}
                                    </strong>
                                  </div>

                                  <button
                                    type="button"
                                    style={{
                                      background: 'var(--color-primary-subtle)',
                                      color: 'var(--color-primary)',
                                      border: 'none',
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.70rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <BookOpen size={12} />
                                    <span>Abrir</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hora da mensagem */}
                      <span
                        style={{
                          fontSize: '0.64rem',
                          color: 'var(--text-subtle)',
                          marginTop: '3px',
                          marginLeft: isBot ? '36px' : '0',
                          marginRight: isBot ? '0' : '4px',
                        }}
                      >
                        {msg.timestamp}
                      </span>

                      {/* Sugestões Rápidas (Chips de atalho) */}
                      {isBot && msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            marginTop: '8px',
                            marginLeft: '34px',
                          }}
                        >
                          {msg.quickReplies.map((reply, rIdx) => (
                            <button
                              key={rIdx}
                              type="button"
                              onClick={() => handleSendMessage(reply)}
                              style={{
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                color: isDark ? 'var(--text-muted)' : '#475569',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '14px',
                                padding: '4px 10px',
                                fontSize: '0.73rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.color = 'var(--color-primary)';
                                e.currentTarget.style.background = isDark ? 'rgba(92, 183, 128, 0.1)' : 'rgba(92, 183, 128, 0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                e.currentTarget.style.color = isDark ? 'var(--text-muted)' : '#475569';
                                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff';
                              }}
                            >
                              <Sparkles size={11} color="var(--color-primary)" />
                              <span>{reply}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* INDICADOR DE DIGITAÇÃO / PESQUISANDO */}
                {isThinking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s ease' }}>
                    <ClippyAvatarSVG size={26} trackMouse={false} />
                    <div
                      style={{
                        padding: '8px 14px',
                        borderRadius: '4px 16px 16px 16px',
                        background: isDark ? 'rgba(30, 34, 39, 0.95)' : '#f1f5f9',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginRight: '4px' }}>
                        {aiProvider !== 'local' && hasConfiguredApi ? 'O Conciliador consultando IA & manuais...' : 'O Conciliador pesquisando nos manuais...'}
                      </span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            animation: 'typingDot 1.4s infinite ease-in-out',
                            animationDelay: '0s',
                          }}
                        />
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            animation: 'typingDot 1.4s infinite ease-in-out',
                            animationDelay: '0.2s',
                          }}
                        />
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            animation: 'typingDot 1.4s infinite ease-in-out',
                            animationDelay: '0.4s',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* RODAPÉ DO CHAT / INPUT DE PERGUNTA */}
              <div
                style={{
                  padding: '12px 16px',
                  background: isDark ? 'rgba(30, 34, 39, 0.95)' : 'rgba(248, 250, 252, 0.98)',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isDark ? 'var(--bg-input)' : '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '4px 6px 4px 12px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Pergunte algo sobre os manuais..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.84rem',
                      outline: 'none',
                      padding: '6px 0',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isThinking}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: inputValue.trim() && !isThinking ? 'var(--color-primary)' : 'transparent',
                      color: inputValue.trim() && !isThinking ? '#ffffff' : 'var(--text-subtle)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inputValue.trim() && !isThinking ? 'pointer' : 'default',
                      transition: 'all 0.18s ease',
                    }}
                    title="Enviar pergunta"
                  >
                    <Send size={15} />
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
                    {hasConfiguredApi
                      ? `O Conciliador conectado via ${aiProvider.toUpperCase()} (${aiProvider === 'gemini' ? geminiModel : openaiModel})`
                      : 'O Conciliador • Alimentado pelos artigos oficiais do Conciliador Contábil'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ====================================================================
          ROBOZINHO FLUTUANTE NO CANTO INFERIOR DIREITO (TRIGGER)
          ==================================================================== */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          userSelect: 'none',
        }}
      >
        {/* BALÃOZINHO DE FALA FLUTUANTE (SPEECH BUBBLE) */}
        {!isOpen && showSpeechBubble && (
          <div
            onClick={() => setIsOpen(true)}
            style={{
              marginBottom: '10px',
              marginRight: '6px',
              padding: '9px 14px',
              borderRadius: '14px 14px 4px 14px',
              background: isDark ? 'rgba(30, 34, 39, 0.95)' : '#ffffff',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 20px rgba(0, 0, 0, 0.12)',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'botBubbleBounce 2.5s ease-in-out infinite',
              position: 'relative',
              maxWidth: '220px',
            }}
          >
            <span>Precisa de ajuda? O Conciliador está aqui! 📎</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeechBubble(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Fechar balão"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* BOTÃO DO CLIPS (FLUTUANDO COM LEVE MOVIMENTO NA TELA) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          onMouseEnter={() => setIsBotHovered(true)}
          onMouseLeave={() => setIsBotHovered(false)}
          className="bot-character-floating"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
          }}
          title={isOpen ? 'Fechar O Conciliador' : 'Abrir O Conciliador - Pergunte sobre os manuais'}
        >
          {/* Avatar SVG do Clips (Clippy) */}
          <ClippyAvatarSVG size={96} isHappy={isBotHovered || isOpen} trackMouse={true} />
        </button>
      </div>
    </>
  );
};
