import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where,
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Article, UserProfile, ToolItem, Category, UserRole, UserType } from '../types';
import { isCorporateEmailValid } from './authService';
import { INITIAL_CATEGORIES, INITIAL_ARTICLES, INITIAL_TOOLS, INITIAL_USERS } from '../data/initialSeed';

// ----------------------------------------------------
// Artigos
// ----------------------------------------------------
export function subscribeArticles(onData: (articles: Article[]) => void): () => void {
  if (!db) return () => {};

  const colRef = collection(db, 'articles');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Article[];

      items.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

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

// Helper com timeout para evitar que operações assíncronas do Firestore travem a interface
const withFirestoreTimeout = <T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout de operação no Firestore (${timeoutMs}ms)`)), timeoutMs)
    ),
  ]);
};

export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'articles', articleId);
    await withFirestoreTimeout(deleteDoc(docRef), 2000);
  } catch (err) {
    console.warn('Erro ou timeout ao excluir artigo do Firestore:', err);
  }
}

// ----------------------------------------------------
// Usuários (Painel RBAC do Fulvio)
// ----------------------------------------------------
export function subscribeUsers(onData: (users: UserProfile[]) => void): () => void {
  if (!db) return () => {};

  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
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

export async function updateUserRoleInFirestore(
  uid: string, 
  newRole: UserRole, 
  email?: string, 
  fullUserData?: Partial<UserProfile>
): Promise<void> {
  if (!db) return;
  const isInternal = newRole !== 'READER' || (email ? isCorporateEmailValid(email) : false);
  const userType: UserType = isInternal ? 'INTERNAL' : 'EXTERNAL';
  const cleanEmail = email ? email.trim().toLowerCase() : undefined;

  const docRef = doc(db, 'users', uid);
  const dataToSave: any = {
    role: newRole,
    userType,
    serverUpdatedAt: serverTimestamp(),
  };

  if (cleanEmail) {
    dataToSave.email = cleanEmail;
  }
  if (fullUserData?.displayName) {
    dataToSave.displayName = fullUserData.displayName;
  }
  if (fullUserData?.status) {
    dataToSave.status = fullUserData.status;
  }

  await setDoc(docRef, dataToSave, { merge: true }).catch((err) => {
    console.warn('Erro ao atualizar papel no Firestore:', err);
  });

  if (cleanEmail) {
    try {
      // 1. Atualiza papel em outros documentos legados com o mesmo e-mail
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQuery);
      for (const d of emailSnap.docs) {
        if (d.id !== uid) {
          await setDoc(
            doc(db, 'users', d.id),
            {
              role: newRole,
              userType,
              serverUpdatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {});
        }
      }

      // 2. Grava registro perene de cargo pré-atribuído no Firestore
      await setDoc(
        doc(db, 'pre_assigned_roles', cleanEmail),
        {
          email: cleanEmail,
          role: newRole,
          userType,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
    } catch (err) {
      console.warn('Erro ao sincronizar papel do usuário por e-mail no Firestore:', err);
    }
  }
}

export async function toggleUserStatusInFirestore(uid: string, newStatus: 'ACTIVE' | 'INACTIVE'): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    status: newStatus,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function deleteUserFromFirestore(uid: string, email?: string): Promise<void> {
  if (!db) return;
  try {
    const cleanEmail = email?.trim().toLowerCase();

    // Remove o documento principal
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef).catch(() => {});

    // Se fornecido e-mail, remove todas as duplicatas legadas e registra exclusão permanente
    if (cleanEmail) {
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQuery);
      for (const d of emailSnap.docs) {
        await deleteDoc(doc(db, 'users', d.id)).catch(() => {});
      }

      // Remove de pré-atribuições se houver
      await deleteDoc(doc(db, 'pre_assigned_roles', cleanEmail)).catch(() => {});

      // Registra tombstone para nunca ressuscitar
      await setDoc(
        doc(db, 'deleted_users', cleanEmail),
        {
          email: cleanEmail,
          deletedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
    }
  } catch (err) {
    console.warn('Erro ao remover usuário do Firestore:', err);
  }
}

/**
 * Grava usuários iniciais no Firestore se ainda não existirem.
 * Checa por UID, por e-mail corporativo e por exclusão prévia para evitar duplicatas e ressurreição.
 */
export async function seedUsersToFirestore(): Promise<void> {
  if (!db) return;

  try {
    const existingUsers = await getDocs(collection(db, 'users'));
    const existingUids = new Set<string>();
    const existingEmails = new Set<string>();

    existingUsers.docs.forEach((d) => {
      existingUids.add(d.id);
      const data = d.data();
      if (data && data.email) {
        existingEmails.add(data.email.toLowerCase().trim());
      }
    });

    // Lê usuários deletados para não recriá-los
    const deletedSnap = await getDocs(collection(db, 'deleted_users')).catch(() => null);
    const deletedEmails = new Set<string>();
    if (deletedSnap) {
      deletedSnap.docs.forEach((d) => {
        deletedEmails.add(d.id.toLowerCase().trim());
        const data = d.data();
        if (data?.email) deletedEmails.add(data.email.toLowerCase().trim());
      });
    }

    const toSeed = INITIAL_USERS.filter((u) => {
      const emailKey = u.email.toLowerCase().trim();
      return (
        !existingUids.has(u.uid) &&
        !existingEmails.has(emailKey) &&
        !deletedEmails.has(emailKey)
      );
    });

    for (const user of toSeed) {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...user,
          lastLoginAt: user.lastLoginAt || null,
          serverCreatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Erro ao semear usuários no Firestore:', err);
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

export async function saveCategoryToFirestore(category: Category): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'categories', category.id);
  await setDoc(docRef, {
    ...category,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'categories', categoryId);
    await withFirestoreTimeout(deleteDoc(docRef), 2000);
  } catch (err) {
    console.warn('Erro ou timeout ao excluir categoria do Firestore:', err);
  }
}

export async function seedFirestoreWithMovideskData(): Promise<{ success: boolean; count: number }> {
  if (!db) throw new Error('Firebase Firestore não está inicializado.');

  // 1. Grava Categorias
  for (const cat of INITIAL_CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
  }

  // 2. Grava Artigos Iniciais (sem duplicar)
  const existingSnap = await getDocs(collection(db, 'articles'));
  const existingIds = new Set(existingSnap.docs.map((d) => d.id));

  let insertedCount = 0;
  for (const art of INITIAL_ARTICLES) {
    if (!existingIds.has(art.id)) {
      await setDoc(doc(db, 'articles', art.id), {
        ...art,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
      });
      insertedCount++;
    } else {
      // Atualiza categoria ou slug caso tenham sido ajustados (ex: migração para Movimentações)
      await setDoc(
        doc(db, 'articles', art.id),
        {
          categoryId: art.categoryId,
          categoryName: art.categoryName,
          title: art.title,
          slug: art.slug,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  // 3. Grava Ferramentas Iniciais
  for (const tool of INITIAL_TOOLS) {
    await setDoc(doc(db, 'tools_links', tool.id), tool, { merge: true });
  }

  return { success: true, count: insertedCount };
}
