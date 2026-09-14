import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot, 
  query, 
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Article, UserProfile, ToolItem, Category, UserRole } from '../types';
import { INITIAL_CATEGORIES, INITIAL_ARTICLES, INITIAL_TOOLS, INITIAL_USERS } from '../data/initialSeed';

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
// Usuários (Painel RBAC do Fulvio & Persistência no Servidor)
// ----------------------------------------------------
export function subscribeUsers(onData: (users: UserProfile[]) => void): () => void {
  if (!db) return () => {};

  // Consulta todos os usuários e ordena localmente para evitar documentos filtrados por ausência de índice
  const q = query(collection(db, 'users'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      })) as UserProfile[];

      items.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      onData(items);
    },
    (err) => {
      console.warn('Erro ao escutar coleção users do Firestore:', err);
    }
  );
}

export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', user.uid);
  await setDoc(
    docRef,
    {
      ...user,
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateUserRoleInFirestore(uid: string, newRole: UserRole): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', uid);
  await setDoc(
    docRef,
    {
      role: newRole,
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function toggleUserStatusInFirestore(uid: string, newStatus: 'ACTIVE' | 'INACTIVE'): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', uid);
  await setDoc(
    docRef,
    {
      status: newStatus,
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteUserFromFirestore(uid: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', uid);
  await deleteDoc(docRef);
}

export async function recordUserLoginInFirestore(uid: string, updates: Partial<UserProfile> = {}): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', uid);
  await setDoc(
    docRef,
    {
      ...updates,
      lastLoginAt: new Date().toISOString(),
      serverLastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function syncInitialUsersToFirestore(): Promise<{ seeded: boolean; count: number }> {
  if (!db) return { seeded: false, count: 0 };

  try {
    const seedStatusRef = doc(db, 'system', 'seed_status');
    const seedStatusDoc = await getDoc(seedStatusRef);

    if (seedStatusDoc.exists() && seedStatusDoc.data()?.usersSeeded) {
      return { seeded: false, count: 0 };
    }

    const existingUsersSnap = await getDocs(collection(db, 'users'));
    const existingEmails = new Set(
      existingUsersSnap.docs.map((d) => (d.data().email || '').toLowerCase())
    );

    let count = 0;
    for (const u of INITIAL_USERS) {
      const cleanEmail = u.email.toLowerCase();
      if (!existingEmails.has(cleanEmail)) {
        const userRef = doc(db, 'users', u.uid);
        await setDoc(userRef, {
          ...u,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
        count++;
      }
    }

    await setDoc(
      seedStatusRef,
      {
        usersSeeded: true,
        seededAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`✅ Sincronização inicial de colaboradores no Firestore concluída: ${count} adicionados.`);
    return { seeded: true, count };
  } catch (err) {
    console.warn('Erro ao sincronizar usuários iniciais no Firestore:', err);
    return { seeded: false, count: 0 };
  }
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
