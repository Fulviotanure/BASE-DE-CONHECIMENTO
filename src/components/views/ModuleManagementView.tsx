import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  FileText,
  CheckCircle2,
  Sliders,
  Compass,
  ArrowRight,
  FolderPlus,
  Hash,
  Sparkles,
  Globe,
  Lock,
  Palette,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  CategoryIcon,
  POPULAR_CATEGORY_ICONS,
  ALL_LUCIDE_ICON_NAMES,
  getCategoryThemeColors,
} from '../../utils/categoryIcons';
import type { Category, Subcategory } from '../../types';

interface ModuleManagementViewProps {
  onNavigateToKnowledgeBase?: (categoryId?: string) => void;
}

export const ModuleManagementView: React.FC<ModuleManagementViewProps> = ({ onNavigateToKnowledgeBase }) => {
  const { categories, articles, createCategory, updateCategory, deleteCategory, currentUser, setSelectedCategory } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'EXTERNAL_AND_INTERNAL' | 'INTERNAL_ONLY'>('ALL');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Compass');
  const [formAccessLevel, setFormAccessLevel] = useState<'INTERNAL' | 'ALL'>('ALL');
  const [formOrderIndex, setFormOrderIndex] = useState(1);
  const [formSubcategories, setFormSubcategories] = useState<string[]>([]);
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');
  const [formError, setFormError] = useState('');

  // Icon Picker State (Catálogo Nativo Lucide +4.100 Ícones sem links externos)
  const [iconPickerSearch, setIconPickerSearch] = useState('');
  const [selectedIconCategoryTab, setSelectedIconCategoryTab] = useState<
    'POPULAR' | 'ALL' | 'contabil' | 'dados' | 'regras' | 'suporte'
  >('POPULAR');
  const [iconDisplayLimit, setIconDisplayLimit] = useState(96);

  // Trava scroll do body quando qualquer modal estiver aberto
  useEffect(() => {
    const isAnyModalOpen = Boolean(isFormModalOpen || categoryToDelete);
    if (isAnyModalOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isFormModalOpen, categoryToDelete]);

  // Helpers de Visibilidade
  const isPlaybookCategory = (cat: { id: string; title: string }) =>
    cat.title.toLowerCase().includes('playbook') || cat.id === 'cat-11' || cat.id === 'cat-12';

  const isModuleInternal = (cat: Category) =>
    cat.accessLevel === 'INTERNAL' || isPlaybookCategory(cat);

  const internalModulesCount = useMemo(
    () => categories.filter((c) => isModuleInternal(c)).length,
    [categories]
  );
  const publicModulesCount = useMemo(
    () => categories.filter((c) => !isModuleInternal(c)).length,
    [categories]
  );

  // Abre modal para criar
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormIcon('Layers');
    setFormAccessLevel('ALL');
    setFormOrderIndex(categories.length + 1);
    setFormSubcategories([]);
    setNewSubcategoryInput('');
    setFormError('');
    setIconPickerSearch('');
    setSelectedIconCategoryTab('POPULAR');
    setIconDisplayLimit(96);
    setIsFormModalOpen(true);
  };

  // Abre modal para editar
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormTitle(cat.title);
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setFormIcon(cat.icon || 'Compass');
    setFormAccessLevel(isModuleInternal(cat) ? 'INTERNAL' : 'ALL');
    setFormOrderIndex(cat.orderIndex || 1);
    setFormSubcategories((cat.subcategories || []).map((s) => s.title));
    setNewSubcategoryInput('');
    setFormError('');
    setIconPickerSearch('');
    setSelectedIconCategoryTab('POPULAR');
    setIconDisplayLimit(96);
    setIsFormModalOpen(true);
  };

  // Gerador automático de slug
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingCategory) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(autoSlug);
    }
  };

  // Adiciona subcategoria na lista do form
  const handleAddSubcategory = () => {
    const trimmed = newSubcategoryInput.trim();
    if (trimmed && !formSubcategories.includes(trimmed)) {
      setFormSubcategories([...formSubcategories, trimmed]);
      setNewSubcategoryInput('');
    }
  };

  // Remove subcategoria
  const handleRemoveSubcategory = (index: number) => {
    setFormSubcategories(formSubcategories.filter((_, i) => i !== index));
  };

  // Submissão do formulário
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('O título do módulo é obrigatório.');
      return;
    }

    const cleanSlug = formSlug.trim() || formTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const subcats: Subcategory[] = formSubcategories.map((subTitle, idx) => ({
      id: `sub-${editingCategory ? editingCategory.id : 'new'}-${idx + 1}`,
      categoryId: editingCategory ? editingCategory.id : '',
      title: subTitle,
      slug: subTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
    }));

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        title: formTitle.trim(),
        slug: cleanSlug,
        description: formDescription.trim(),
        icon: formIcon.trim(),
        accessLevel: formAccessLevel,
        orderIndex: Number(formOrderIndex) || 1,
        subcategories: subcats,
      });
    } else {
      await createCategory({
        title: formTitle.trim(),
        slug: cleanSlug,
        description: formDescription.trim(),
        icon: formIcon.trim() || 'Layers',
        accessLevel: formAccessLevel,
        orderIndex: Number(formOrderIndex) || (categories.length + 1),
        subcategories: subcats,
      });
    }

    setIsFormModalOpen(false);
  };

  // Confirmação de exclusão
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    await deleteCategory(categoryToDelete.id);
    setIsDeleting(false);
    setCategoryToDelete(null);
  };

  // Módulos filtrados pela busca e visibilidade
  const filteredCategories = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return categories
      .filter((cat) => {
        const isInternal = isModuleInternal(cat);
        if (visibilityFilter === 'INTERNAL_ONLY' && !isInternal) return false;
        if (visibilityFilter === 'EXTERNAL_AND_INTERNAL' && isInternal) return false;

        if (!q) return true;
        return (
          cat.title.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          (cat.icon && cat.icon.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [categories, searchTerm, visibilityFilter]);

  // Lista dinâmica de ícones pesquisados/filtrados (catálogo nativo sem links)
  const filteredIconList = useMemo(() => {
    const query = iconPickerSearch.trim().toLowerCase();

    // Se estiver em uma aba com lista curada e sem busca
    if (!query && selectedIconCategoryTab !== 'ALL') {
      if (selectedIconCategoryTab === 'POPULAR') {
        return POPULAR_CATEGORY_ICONS.map((opt) => opt.name);
      }
      return POPULAR_CATEGORY_ICONS.filter((opt) => opt.category === selectedIconCategoryTab).map((opt) => opt.name);
    }

    // Se a aba for de categoria temática, filtra nela
    if (selectedIconCategoryTab !== 'ALL' && selectedIconCategoryTab !== 'POPULAR') {
      const catPopular = POPULAR_CATEGORY_ICONS.filter((opt) => opt.category === selectedIconCategoryTab).map((opt) => opt.name);
      if (!query) return catPopular;
      return catPopular.filter((name) => name.toLowerCase().includes(query));
    }

    // Catálogo completo de todos os +4.100 ícones da Lucide
    if (!query) {
      return ALL_LUCIDE_ICON_NAMES;
    }

    return ALL_LUCIDE_ICON_NAMES.filter((name) => name.toLowerCase().includes(query));
  }, [iconPickerSearch, selectedIconCategoryTab]);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        padding: '28px 36px 60px 32px',
        boxSizing: 'border-box',
      }}
      className="animate-fade-in"
    >
      {/* Cabeçalho Principal */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              GOVERNANÇA & ARQUITETURA DE CONTEÚDO
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#6366f1',
                background: 'rgba(99, 102, 241, 0.12)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Super Admin & Administradores
            </span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Layers size={28} color="var(--color-primary)" />
            <span>Gestão de Módulos da Base de Conhecimento</span>
          </h1>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '820px', margin: 0, lineHeight: 1.5 }}>
            Crie novos módulos operacionais, personalize os ícones visuais e remova módulos obsoletos. Cada módulo agrupa
            manuais, guias e regras no menu lateral e na página inicial do sistema.
          </p>
        </div>

        {/* Botão de Ação Primária */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.92rem',
            boxShadow: '0 4px 14px rgba(92, 183, 128, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={18} />
          <span>Criar Novo Módulo</span>
        </button>
      </div>

      {/* Cards de Métricas & Catálogo Nativo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '26px',
        }}
      >
        {/* Card 1: Total de Módulos */}
        <div
          style={{
            padding: '18px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-subtle)',
              border: '1px solid rgba(92, 183, 128, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 600, display: 'block' }}>
              Total de Módulos
            </span>
            <strong style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800 }}>
              {categories.length}
            </strong>
          </div>
        </div>

        {/* Card 2: Módulos Externos & Internos */}
        <div
          style={{
            padding: '18px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              flexShrink: 0,
            }}
          >
            <Globe size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 600, display: 'block' }}>
              Externo & Interno
            </span>
            <strong style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800 }}>
              {publicModulesCount}
            </strong>
          </div>
        </div>

        {/* Card 3: Módulos Apenas Internos */}
        <div
          style={{
            padding: '18px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0,
            }}
          >
            <Lock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 600, display: 'block' }}>
              Apenas Interno
            </span>
            <strong style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800 }}>
              {internalModulesCount}
            </strong>
          </div>
        </div>

        {/* Card 4: Catálogo Nativo Lucide (+4.100 Ícones Nativos) */}
        <div
          style={{
            padding: '18px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(167, 139, 250, 0.12)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa',
              flexShrink: 0,
            }}
          >
            <Palette size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 600, display: 'block' }}>
              Catálogo Nativo Lucide
            </span>
            <strong style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800 }}>
              +4.100 Ícones
            </strong>
          </div>
        </div>
      </div>

      {/* Barra de Filtro, Visibilidade e Busca */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '22px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search
              size={16}
              color="var(--text-subtle)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Buscar módulo por título, descrição ou ícone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            />
          </div>

          {/* Abas de Filtro de Visibilidade */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: 'var(--bg-surface)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {[
              { id: 'ALL', label: `Todos (${categories.length})` },
              { id: 'EXTERNAL_AND_INTERNAL', label: `🌐 Externo & Interno (${publicModulesCount})` },
              { id: 'INTERNAL_ONLY', label: `🔒 Apenas Interno (${internalModulesCount})` },
            ].map((tab) => {
              const isActive = visibilityFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVisibilityFilter(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <span style={{ fontSize: '0.84rem', color: 'var(--text-subtle)' }}>
          Mostrando <strong>{filteredCategories.length}</strong> de {categories.length} módulos
        </span>
      </div>

      {/* Grade de Módulos Cadastrados */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredCategories.map((cat) => {
          const theme = getCategoryThemeColors(cat.icon);
          const articleCount = articles.filter((a) => a.categoryId === cat.id).length;
          const subcategoriesCount = cat.subcategories?.length || 0;

          return (
            <div
              key={cat.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.18s ease',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Topo do Card: Ícone e Ordem */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-md)',
                      background: theme.bg,
                      border: `1.5px solid ${theme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${theme.border}`,
                    }}
                  >
                    <CategoryIcon iconName={cat.icon} size={24} color={theme.color} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--text-subtle)',
                        background: 'var(--bg-card)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}
                      title="Posição de exibição na lista"
                    >
                      #{cat.orderIndex}
                    </span>

                    {/* Badge de Visibilidade */}
                    {isModuleInternal(cat) ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#f59e0b',
                          background: 'rgba(245, 158, 11, 0.12)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Este módulo só aparece internamente (para colaboradores)"
                      >
                        <Lock size={11} />
                        <span>Interno</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.12)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Este módulo aparece tanto externamente quanto internamente"
                      >
                        <Globe size={11} />
                        <span>Externo & Interno</span>
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: theme.color,
                        background: theme.bg,
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {articleCount} manuais
                    </span>
                  </div>
                </div>

                {/* Título & Slug */}
                <h3
                  style={{
                    fontSize: '1.18rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: '0 0 6px 0',
                    lineHeight: 1.3,
                  }}
                >
                  {cat.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <code
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-subtle)',
                      background: 'var(--bg-card)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    slug: {cat.slug}
                  </code>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    • Ícone: <strong>{cat.icon || 'Compass'}</strong>
                  </span>
                </div>

                {/* Descrição */}
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    minHeight: '40px',
                  }}
                >
                  {cat.description || 'Sem descrição cadastrada.'}
                </p>

                {/* Subcategorias */}
                {subcategoriesCount > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-subtle)',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Subcategorias ({subcategoriesCount}):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {cat.subcategories?.slice(0, 4).map((sub) => (
                        <span
                          key={sub.id}
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-card)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {sub.title}
                        </span>
                      ))}
                      {subcategoriesCount > 4 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', alignSelf: 'center' }}>
                          +{subcategoriesCount - 4} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ações do Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(cat)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title="Editar informações do módulo"
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(cat)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title="Apagar este módulo"
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
                  >
                    <Trash2 size={13} />
                    <span>Apagar</span>
                  </button>
                </div>

                {onNavigateToKnowledgeBase && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      onNavigateToKnowledgeBase(cat.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--color-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 6px',
                    }}
                    title="Ver artigos deste módulo na Base"
                  >
                    <span>Ver Manuais</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          MODAL: CRIAR OU EDITAR MÓDULO (COM SELETOR DE ÍCONES E LINK DO LUCIDE)
          ===================================================================== */}
      {isFormModalOpen &&
        createPortal(
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
            onClick={() => setIsFormModalOpen(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: 'min(92vh, 720px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 25px rgba(92, 183, 128, 0.15)',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Faixa decorativa superior */}
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  flexShrink: 0,
                  background: 'linear-gradient(90deg, #5cb780, #38bdf8, #6c63ff)',
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
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-primary-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <FolderPlus size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                      {editingCategory ? 'Editar Módulo' : 'Criar Novo Módulo Operacional'}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      Personalize nome, descrição, ícone e subcategorias
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-subtle)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: 'var(--radius-md)',
                  }}
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Formulário com Scroll Interno */}
              <form
                onSubmit={handleSubmitForm}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
              >
                <div
                  style={{
                    padding: '22px 24px',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  {formError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '0.84rem',
                      }}
                    >
                      {formError}
                    </div>
                  )}

                  {/* Título & Ordem */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          marginBottom: '6px',
                        }}
                      >
                        Título do Módulo: *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Conciliação de Cartões & Adquirentes"
                        value={formTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem',
                          color: 'var(--text-main)',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          marginBottom: '6px',
                        }}
                      >
                        Posição / Ordem:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formOrderIndex}
                        onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem',
                          color: 'var(--text-main)',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                  </div>

                  {/* Slug do Módulo */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      Identificador / Slug (URL amigável):
                    </label>
                    <input
                      type="text"
                      placeholder="conciliacao-cartoes"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '6px',
                      }}
                    >
                      Descrição do Módulo:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explique resumidamente os tópicos e objetivos abordados neste módulo..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Visibilidade do Módulo (Externo e Interno vs Apenas Interno) */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '8px',
                      }}
                    >
                      Visibilidade de Acesso do Módulo:
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                      {/* Opção 1: Externo e Interno */}
                      <div
                        onClick={() => setFormAccessLevel('ALL')}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${formAccessLevel === 'ALL' ? '#38bdf8' : 'var(--border-subtle)'}`,
                          background: formAccessLevel === 'ALL' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: `2px solid ${formAccessLevel === 'ALL' ? '#38bdf8' : 'var(--text-subtle)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                            flexShrink: 0,
                          }}
                        >
                          {formAccessLevel === 'ALL' && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <Globe size={15} color="#38bdf8" />
                            <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
                              Externo e Interno (Público)
                            </strong>
                          </div>
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                            Aparece para todos: clientes externos, leitores e colaboradores internos.
                          </p>
                        </div>
                      </div>

                      {/* Opção 2: Apenas Interno */}
                      <div
                        onClick={() => setFormAccessLevel('INTERNAL')}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${formAccessLevel === 'INTERNAL' ? '#f59e0b' : 'var(--border-subtle)'}`,
                          background: formAccessLevel === 'INTERNAL' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: `2px solid ${formAccessLevel === 'INTERNAL' ? '#f59e0b' : 'var(--text-subtle)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                            flexShrink: 0,
                          }}
                        >
                          {formAccessLevel === 'INTERNAL' && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <Lock size={15} color="#f59e0b" />
                            <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
                              Apenas Interno (Restrito)
                            </strong>
                          </div>
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                            Visível somente para colaboradores internos autenticados (oculto para clientes externos).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      SEÇÃO DE ÍCONES: CATÁLOGO NATIVO LUCIDE (+4.100 ÍCONES)
                      ========================================================= */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Ícone Visual do Módulo:
                        </span>
                        <div
                          style={{
                            padding: '4px 10px',
                            background: 'var(--color-primary-subtle)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: '1px solid rgba(92, 183, 128, 0.3)',
                          }}
                        >
                          <CategoryIcon iconName={formIcon} size={16} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            {formIcon || 'Compass'}
                          </span>
                        </div>
                      </div>

                      {/* Badge Informativo (SEM LINKS EXTERNOS) */}
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: '#818cf8',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Catálogo Nativo: +4.100 Ícones Lucide</span>
                      </span>
                    </div>

                    {/* Campo de Digitação Livre / Nome Exato do Ícone */}
                    <div style={{ marginBottom: '12px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        Nome PascalCase do ícone (digite ou selecione na lista abaixo):
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Ex: Receipt, Landmark, Calculator, Wallet, Layers, Shield..."
                          value={formIcon}
                          onChange={(e) => setFormIcon(e.target.value.trim())}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            fontWeight: 600,
                          }}
                        />
                        <div
                          style={{
                            width: '42px',
                            height: '38px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          title="Pré-visualização do ícone"
                        >
                          <CategoryIcon iconName={formIcon} size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Local de Pesquisa de Ícones em Tempo Real */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ position: 'relative' }}>
                        <Search
                          size={15}
                          color="var(--text-subtle)"
                          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                          type="text"
                          placeholder="Pesquisar entre todos os +4.100 ícones da biblioteca (ex: wallet, bank, user, chart, file)..."
                          value={iconPickerSearch}
                          onChange={(e) => {
                            setIconPickerSearch(e.target.value);
                            setIconDisplayLimit(96);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 34px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.82rem',
                            color: 'var(--text-main)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Filtros por Categorias do Ícone */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '10px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                      }}
                    >
                      {[
                        { key: 'POPULAR', label: '⭐ Recomendados' },
                        { key: 'ALL', label: `📚 Todos (${ALL_LUCIDE_ICON_NAMES.length})` },
                        { key: 'contabil', label: 'Contábil/Financeiro' },
                        { key: 'dados', label: 'Dados & ERP' },
                        { key: 'regras', label: 'Regras & Ajustes' },
                        { key: 'suporte', label: 'Suporte & Docs' },
                      ].map((t) => {
                        const isTabActive = selectedIconCategoryTab === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => {
                              setSelectedIconCategoryTab(t.key as any);
                              setIconDisplayLimit(96);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: isTabActive ? 'var(--color-primary)' : 'var(--bg-surface)',
                              color: isTabActive ? '#ffffff' : 'var(--text-muted)',
                              border: `1px solid ${isTabActive ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.12s ease',
                            }}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Contador de Ícones Encontrados */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                        Exibindo <strong>{Math.min(iconDisplayLimit, filteredIconList.length)}</strong> de{' '}
                        <strong>{filteredIconList.length}</strong> ícones disponíveis
                      </span>
                      {iconPickerSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setIconPickerSearch('');
                            setIconDisplayLimit(96);
                          }}
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-primary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>

                    {/* Grade de Ícones Clicáveis da Lucide */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                        gap: '6px',
                        maxHeight: '160px',
                        overflowY: 'auto',
                        padding: '8px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {filteredIconList.slice(0, iconDisplayLimit).map((iconName) => {
                        const isSelected = formIcon.toLowerCase() === iconName.toLowerCase();
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormIcon(iconName)}
                            style={{
                              width: '100%',
                              aspectRatio: '1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 'var(--radius-sm)',
                              background: isSelected ? 'var(--color-primary-subtle)' : 'var(--bg-card)',
                              border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                              cursor: 'pointer',
                              transition: 'all 0.1s ease',
                              padding: 0,
                            }}
                            title={iconName}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            }}
                          >
                            <CategoryIcon
                              iconName={iconName}
                              size={18}
                              color={isSelected ? 'var(--color-primary)' : 'var(--text-main)'}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Botão de Carregar Mais Ícones */}
                    {filteredIconList.length > iconDisplayLimit && (
                      <div style={{ textAlign: 'center', marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setIconDisplayLimit((prev) => prev + 96)}
                          style={{
                            padding: '4px 14px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          Carregar Mais Ícones (+96)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subcategorias */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '6px',
                      }}
                    >
                      Subcategorias do Módulo:
                    </label>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Ex: Visão Geral, Regras Especiais, Erros Comuns..."
                        value={newSubcategoryInput}
                        onChange={(e) => setNewSubcategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubcategory();
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSubcategory}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-main)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Adicionar
                      </button>
                    </div>

                    {formSubcategories.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {formSubcategories.map((sub, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.78rem',
                              color: 'var(--text-main)',
                            }}
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubcategory(idx)}
                              style={{
                                color: 'var(--text-subtle)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                              }}
                              title="Remover subcategoria"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        Nenhuma subcategoria adicionada ainda.
                      </span>
                    )}
                  </div>
                </div>

                {/* Rodapé Fixo */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    padding: '14px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'var(--bg-sidebar)',
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsFormModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'Salvar Alterações' : 'Criar Módulo'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* =====================================================================
          MODAL: CONFIRMAR EXCLUSÃO DO MÓDULO (COM AVISO DE ARTIGOS VINCULADOS)
          ===================================================================== */}
      {categoryToDelete &&
        createPortal(
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
            onClick={() => !isDeleting && setCategoryToDelete(null)}
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
                      width: '44px',
                      height: '44px',
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
                      Apagar Módulo do Sistema
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      Confirmação de exclusão estrutural
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Você está prestes a excluir permanentemente o módulo{' '}
                  <strong style={{ color: 'var(--text-main)' }}>"{categoryToDelete.title}"</strong> (
                  <code>{categoryToDelete.slug}</code>).
                </p>

                {(() => {
                  const linkedArticles = articles.filter((a) => a.categoryId === categoryToDelete.id);
                  if (linkedArticles.length > 0) {
                    return (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#f59e0b',
                          fontSize: '0.82rem',
                          marginBottom: '20px',
                          lineHeight: 1.4,
                        }}
                      >
                        ⚠️ <strong>Atenção:</strong> Existem <strong>{linkedArticles.length} manuais/artigos</strong> vinculados a este módulo. Ao apagá-lo, esses artigos continuarão na base, mas ficarão sem categoria até serem reatribuídos.
                      </div>
                    );
                  }
                  return (
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
                      ℹ️ Este módulo não possui artigos vinculados no momento. Ele será removido com segurança do menu e da lista da home.
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isDeleting}
                    onClick={() => setCategoryToDelete(null)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
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
                    <span>{isDeleting ? 'Apagando...' : 'Sim, Apagar Módulo'}</span>
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
