import React, { useState } from 'react';
import {
  Wrench,
  Download,
  ExternalLink,
  Plus,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  Layers,
  FolderArchive,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ToolCategory, ToolItem } from '../../types';

export const ToolsHubView: React.FC = () => {
  const { tools, addTool, currentUser } = useApp();

  const [activeCategory, setActiveCategory] = useState<'ALL' | ToolCategory>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ToolCategory>('SOFTWARES');
  const [resourceType, setResourceType] = useState<'DOWNLOAD_FILE' | 'EXTERNAL_URL'>('DOWNLOAD_FILE');
  const [targetUrl, setTargetUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [versionTag, setVersionTag] = useState('');

  const filteredTools = activeCategory === 'ALL' ? tools : tools.filter((t) => t.category === activeCategory);

  const getToolIcon = (cat: ToolCategory) => {
    switch (cat) {
      case 'SOFTWARES':
        return <Cpu size={24} color="#5cb780" />;
      case 'CONVERSORES':
        return <Wrench size={24} color="#6c63ff" />;
      case 'LAYOUTS_ERP':
        return <FolderArchive size={24} color="#3b82f6" />;
      case 'LINKS_OPERACIONAIS':
        return <Globe size={24} color="#f59e0b" />;
      default:
        return <Wrench size={24} color="#5cb780" />;
    }
  };

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetUrl.trim()) return;

    addTool({
      title: title.trim(),
      description: description.trim(),
      category,
      resourceType,
      targetUrl: targetUrl.trim(),
      fileSize: fileSize.trim() || undefined,
      versionTag: versionTag.trim() || undefined,
      orderIndex: tools.length + 1,
      isActive: true,
    });

    setTitle('');
    setDescription('');
    setTargetUrl('');
    setFileSize('');
    setVersionTag('');
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Hub de Recursos Operacionais
          </span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '4px 0 6px 0' }}>
            Central de Ferramentas & Softwares
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Softwares executáveis, utilitários de conversão, layouts de integração para ERPs contábeis e links operacionais frequentes.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>Cadastrar Ferramenta</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeCategory === 'ALL' ? 'var(--color-primary)' : 'var(--bg-card)',
            color: activeCategory === 'ALL' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${activeCategory === 'ALL' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
          }}
        >
          Todos ({tools.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('SOFTWARES')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeCategory === 'SOFTWARES' ? 'var(--color-primary)' : 'var(--bg-card)',
            color: activeCategory === 'SOFTWARES' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${activeCategory === 'SOFTWARES' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
          }}
        >
          Softwares & Executáveis (.exe)
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('CONVERSORES')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeCategory === 'CONVERSORES' ? 'var(--color-primary)' : 'var(--bg-card)',
            color: activeCategory === 'CONVERSORES' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${activeCategory === 'CONVERSORES' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
          }}
        >
          Conversores OFX / PDF
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('LAYOUTS_ERP')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeCategory === 'LAYOUTS_ERP' ? 'var(--color-primary)' : 'var(--bg-card)',
            color: activeCategory === 'LAYOUTS_ERP' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${activeCategory === 'LAYOUTS_ERP' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
          }}
        >
          Modelos & Layouts ERP
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('LINKS_OPERACIONAIS')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeCategory === 'LINKS_OPERACIONAIS' ? 'var(--color-primary)' : 'var(--bg-card)',
            color: activeCategory === 'LINKS_OPERACIONAIS' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${activeCategory === 'LINKS_OPERACIONAIS' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
          }}
        >
          Links Operacionais
        </button>
      </div>

      {/* Tools Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {getToolIcon(tool.category)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {tool.versionTag && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-surface)',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {tool.versionTag}
                    </span>
                  )}
                  {tool.fileSize && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-subtle)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {tool.fileSize}
                    </span>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                {tool.title}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                {tool.description}
              </p>
            </div>

            <div>
              {tool.resourceType === 'DOWNLOAD_FILE' ? (
                <a
                  href={tool.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '9px 14px', fontSize: '0.85rem' }}
                >
                  <Download size={15} />
                  <span>Baixar Arquivo {tool.fileSize ? `(${tool.fileSize})` : ''}</span>
                </a>
              ) : (
                <a
                  href={tool.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '9px 14px', fontSize: '0.85rem' }}
                >
                  <span>Acessar Portal Externo</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Adicionar Ferramenta (Admin Fulvio) */}
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
              maxWidth: '520px',
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
                Cadastrar Nova Ferramenta ou Software
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-subtle)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTool} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Nome da Ferramenta:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Robô SISPAG Itaú v2.0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  Descrição Curta:
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções breves sobre para que serve e quando utilizar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Categoria:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ToolCategory)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="SOFTWARES" style={{ background: '#1e2227' }}>Softwares & Executáveis (.exe)</option>
                    <option value="CONVERSORES" style={{ background: '#1e2227' }}>Conversores OFX/PDF</option>
                    <option value="LAYOUTS_ERP" style={{ background: '#1e2227' }}>Modelos & Layouts ERP</option>
                    <option value="LINKS_OPERACIONAIS" style={{ background: '#1e2227' }}>Links Operacionais</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Tipo:
                  </label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as 'DOWNLOAD_FILE' | 'EXTERNAL_URL')}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="DOWNLOAD_FILE" style={{ background: '#1e2227' }}>Arquivo para Download</option>
                    <option value="EXTERNAL_URL" style={{ background: '#1e2227' }}>Link Externo</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  URL de Download ou Link Externo:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://pub-47b999e464d143b8a140a73baf6ef575.r2.dev/software.exe"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}
                />
                <div style={{ marginTop: '5px', fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Armazenamento Cloudflare R2</span>
                  <button
                    type="button"
                    onClick={() => setTargetUrl('https://pub-47b999e464d143b8a140a73baf6ef575.r2.dev/')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    Inserir prefixo do Cloudflare R2
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Tamanho (ex: 45 MB):
                  </label>
                  <input
                    type="text"
                    placeholder="45.2 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
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
                    Versão (ex: v2.1):
                  </label>
                  <input
                    type="text"
                    placeholder="v2.1.0"
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
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
                  Salvar Ferramenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
