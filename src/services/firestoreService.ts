import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Article, UserProfile, ToolItem, Category, UserRole } from '../types';
import { INITIAL_CATEGORIES, INITIAL_ARTICLES, INITIAL_TOOLS } from '../data/initialSeed';

// ----------------------------------------------------
// Artigos
// ----------------------------------------------------
export function subscribeArticles(onData: (articles: Article[]) => void): () => void {
  if (!db) return () => {};

  const q = query(collection(db, 'articles'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Article[];
      onData(items);
    },
    (err) => {
      console.warn('Erro ao escutar coleção articles do Firestore:', err);
    }
  );
}

export async function saveArticleToFirestore(article: Article): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'articles', article.id);
  await setDoc(docRef, {
    ...article,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function updateArticleInFirestore(
  articleId: string, 
  updates: Partial<Article>
): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'articles', articleId);
  await updateDoc(docRef, {
    ...updates,
    serverUpdatedAt: serverTimestamp(),
  });
}

// ----------------------------------------------------
// Usuários (Painel RBAC do Fulvio)
// ----------------------------------------------------
export function subscribeUsers(onData: (users: UserProfile[]) => void): () => void {
  if (!db) return () => {};

  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      })) as UserProfile[];
      onData(items);
    },
    (err) => {
      console.warn('Erro ao escutar coleção users do Firestore:', err);
    }
  );
}

export async function updateUserRoleInFirestore(uid: string, newRole: UserRole): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    role: newRole,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function toggleUserStatusInFirestore(uid: string, newStatus: 'ACTIVE' | 'INACTIVE'): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    status: newStatus,
    serverUpdatedAt: serverTimestamp(),
  });
}

// ----------------------------------------------------
// Ferramentas & Softwares Operacionais
// ----------------------------------------------------
export function subscribeTools(onData: (tools: ToolItem[]) => void): () => void {
  if (!db) return () => {};

  const colRef = collection(db, 'tools_links');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ToolItem[];
      onData(items);
    },
    (err) => {
      console.warn('Erro ao escutar coleção tools_links do Firestore:', err);
    }
  );
}

export async function saveToolToFirestore(tool: ToolItem): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'tools_links', tool.id);
  await setDoc(docRef, {
    ...tool,
    serverCreatedAt: serverTimestamp(),
  });
}

// ----------------------------------------------------
// Categorias & Seed Inicial do Movidesk no Firestore
// ----------------------------------------------------
export function subscribeCategories(onData: (categories: Category[]) => void): () => void {
  if (!db) return () => {};

  const colRef = collection(db, 'categories');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Category[];
      onData(items);
    },
    (err) => {
      console.warn('Erro ao escutar coleção categories do Firestore:', err);
    }
  );
}

export async function seedFirestoreWithMovideskData(): Promise<{ success: boolean; count: number }> {
  if (!db) throw new Error('Firebase Firestore não está inicializado.');

  // Verifica se já existem artigos
  const existingArticles = await getDocs(collection(db, 'articles'));
  if (!existingArticles.empty) {
    return { success: true, count: existingArticles.size };
  }

  // 1. Grava Categorias
  for (const cat of INITIAL_CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.id), cat);
  }

  // 2. Grava Artigos Iniciais
  for (const art of INITIAL_ARTICLES) {
    await setDoc(doc(db, 'articles', art.id), {
      ...art,
      serverCreatedAt: serverTimestamp(),
    });
  }

  // 3. Grava Ferramentas Iniciais
  for (const tool of INITIAL_TOOLS) {
    await setDoc(doc(db, 'tools_links', tool.id), tool);
  }

  return { success: true, count: INITIAL_ARTICLES.length };
}
