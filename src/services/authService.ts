import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, UserRole, UserType } from '../types';

export const CORPORATE_DOMAIN = '@conciliadorcontabil.com.br';
export const CORPORATE_DOMAINS = ['@conciliadorcontabil.com.br', '@conciliador.com.br'];

export function isCorporateEmailValid(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return CORPORATE_DOMAINS.some((domain) => clean.endsWith(domain)) || clean.includes('@conciliador');
}

export function determineUserType(email: string, role?: UserRole): UserType {
  if (role && role !== 'READER') return 'INTERNAL';
  return isCorporateEmailValid(email) ? 'INTERNAL' : 'EXTERNAL';
}

export const MOCK_ADMIN_USER: UserProfile = {
  uid: 'usr-fulvio',
  email: 'fulvio@conciliadorcontabil.com.br',
  displayName: 'Fulvio Tanure',
  role: 'SUPER_ADMIN',
  userType: 'INTERNAL',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: new Date().toISOString(),
};

export const MOCK_READER_USER: UserProfile = {
  uid: 'usr-leitor-teste',
  email: 'leitor.teste@empresa.com.br',
  displayName: 'Cliente / Leitor (Teste Local)',
  role: 'READER',
  userType: 'EXTERNAL',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: new Date().toISOString(),
};

export function isSuperAdminUser(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'fulvio@conciliadorcontabil.com.br';
}

export function isAdminUser(email: string): boolean {
  const clean = email.trim().toLowerCase();
  return isSuperAdminUser(clean);
}

export function determineInitialRole(email: string): UserRole {
  const clean = email.trim().toLowerCase();
  if (isSuperAdminUser(clean)) return 'SUPER_ADMIN';
  if (isCorporateEmailValid(clean)) return 'OPERATOR';
  return 'READER';
}

/**
 * Helpers para gerenciar papéis pré-atribuídos pelo Administrador e lista de usuários excluídos.
 */
const PRE_ASSIGNED_KEY = 'conciliador_pre_assigned_roles';
const DELETED_USERS_KEY = 'conciliador_deleted_user_emails';

export function getLocalPreAssignedRole(email: string): UserRole | null {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const map = localStorage.getItem(PRE_ASSIGNED_KEY);
    if (map) {
      const parsed = JSON.parse(map);
      if (parsed && parsed[cleanEmail]) return parsed[cleanEmail];
    }
    const savedUsers = localStorage.getItem('conciliador_users_v7');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      if (Array.isArray(parsed)) {
        const found = parsed.find((u: any) => u.email?.trim().toLowerCase() === cleanEmail);
        if (found && found.role) return found.role;
      }
    }
  } catch {}
  return null;
}

export function setLocalPreAssignedRole(email: string, role: UserRole): void {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const map = localStorage.getItem(PRE_ASSIGNED_KEY);
    const parsed = map ? JSON.parse(map) : {};
    parsed[cleanEmail] = role;
    localStorage.setItem(PRE_ASSIGNED_KEY, JSON.stringify(parsed));
  } catch {}
}

export function removeLocalPreAssignedRole(email: string): void {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const map = localStorage.getItem(PRE_ASSIGNED_KEY);
    if (map) {
      const parsed = JSON.parse(map);
      delete parsed[cleanEmail];
      localStorage.setItem(PRE_ASSIGNED_KEY, JSON.stringify(parsed));
    }
  } catch {}
}

export function getDeletedUserEmails(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.map((e: string) => e.trim().toLowerCase()));
    }
  } catch {}
  return new Set();
}

export function addDeletedUserEmail(email: string): void {
  try {
    const clean = email.trim().toLowerCase();
    const set = getDeletedUserEmails();
    set.add(clean);
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function removeDeletedUserEmail(email: string): void {
  try {
    const clean = email.trim().toLowerCase();
    const set = getDeletedUserEmails();
    set.delete(clean);
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export const DELETED_CATEGORIES_KEY = 'conciliador_deleted_categories_v2';

export function getDeletedCategoryIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.map((id: string) => id.trim()));
    }
  } catch {}
  return new Set();
}

export function addDeletedCategoryId(id: string): void {
  try {
    const clean = id.trim();
    const set = getDeletedCategoryIds();
    set.add(clean);
    localStorage.setItem(DELETED_CATEGORIES_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function removeDeletedCategoryId(id: string): void {
  try {
    const clean = id.trim();
    const set = getDeletedCategoryIds();
    set.delete(clean);
    localStorage.setItem(DELETED_CATEGORIES_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

/**
 * Determina de forma infalível se um usuário pertence à equipe interna
 * (Super Admin, Administrador, Revisor, Operador ou e-mail corporativo Conciliador).
 */
export function isInternalUser(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  // 1. Se o papel atual for READER ou o tipo for EXTERNAL, trata estritamente como LEITOR/CLIENTE externo
  if (user.role === 'READER' || user.userType === 'EXTERNAL') {
    return false;
  }
  // 2. Cargos administrativos e operacionais são sempre INTERNOS
  if (
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ADMIN' ||
    user.role === 'REVIEWER' ||
    user.role === 'OPERATOR'
  ) {
    return true;
  }
  // 3. Qualquer e-mail corporativo do Conciliador (desde que não seja READER) é INTERNO
  if (user.email && isCorporateEmailValid(user.email)) {
    return true;
  }
  // 4. Usuários marcados como INTERNAL sem ser READER
  if (user.userType === 'INTERNAL') {
    return true;
  }
  return false;
}

/**
 * Determina se o usuário é externo (apenas leitores e clientes que não possuem cargos internos).
 */
export function isExternalUser(user: UserProfile | null | undefined): boolean {
  if (!user) return true;
  if (user.role === 'READER' || user.userType === 'EXTERNAL') {
    return true;
  }
  return !isInternalUser(user);
}

/**
 * Autenticação via Conta do Google (Google OAuth)
 * Identifica automaticamente se é colaborador interno (@conciliadorcontabil.com.br / @conciliador.com.br)
 * ou usuário externo/cliente, e preserva rigorosamente a decisão de cargo pré-atribuída pelo Administrador.
 * Garante desduplicação imediata de registros para o mesmo e-mail.
 */
export async function loginWithGoogle(): Promise<{ user: UserProfile; error?: string }> {
  if (!auth) {
    throw new Error('Serviço de autenticação não inicializado. Verifique as credenciais de nuvem.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const firebaseUser = cred.user;
  const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();

  // Bloqueio se o usuário foi expressamente excluído pela administração
  if (getDeletedUserEmails().has(cleanEmail)) {
    await firebaseSignOut(auth);
    throw new Error('Este perfil de usuário foi excluído pela administração.');
  }

  const isCorp = isCorporateEmailValid(cleanEmail);
  const defaultUserType: UserType = determineUserType(cleanEmail);
  const initialDefaultRole: UserRole = determineInitialRole(cleanEmail);

  let profile: UserProfile;

  if (db) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      // Busca TODOS os documentos existentes com este e-mail no Firestore para preservar dados e desduplicar
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQuery);

      let preAssignedRole: UserRole | null = getLocalPreAssignedRole(cleanEmail);
      let existingCreatedAt: string = new Date().toISOString();
      let existingDisplayName: string = firebaseUser.displayName || cleanEmail.split('@')[0];
      const legacyDocIdsToDelete: string[] = [];

      for (const d of emailSnap.docs) {
        if (d.id !== firebaseUser.uid) {
          legacyDocIdsToDelete.push(d.id);
        }
        const data = d.data() as UserProfile;
        if (data.role && !preAssignedRole) {
          preAssignedRole = data.role;
        }
        if (data.createdAt) existingCreatedAt = data.createdAt;
        if (data.displayName && !firebaseUser.displayName) existingDisplayName = data.displayName;
      }

      if (userDoc.exists()) {
        const currentData = userDoc.data() as UserProfile;
        if (currentData.role) {
          preAssignedRole = currentData.role;
        }
        if (currentData.createdAt) existingCreatedAt = currentData.createdAt;
        if (currentData.displayName) existingDisplayName = currentData.displayName;
      }

      // Regra de Ouro: Mantém estritamente o cargo pré-atribuído pelo Administrador
      let finalRole: UserRole;
      if (isSuperAdminUser(cleanEmail)) {
        finalRole = 'SUPER_ADMIN';
      } else if (preAssignedRole) {
        finalRole = preAssignedRole;
      } else {
        finalRole = initialDefaultRole;
      }

      const finalUserType: UserType = (finalRole !== 'READER' || isCorp) ? 'INTERNAL' : defaultUserType;

      profile = {
        uid: firebaseUser.uid,
        email: cleanEmail,
        displayName: firebaseUser.displayName || existingDisplayName,
        photoURL: firebaseUser.photoURL || undefined,
        role: finalRole,
        userType: finalUserType,
        status: 'ACTIVE',
        createdAt: existingCreatedAt,
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(
        userRef,
        {
          ...profile,
          serverCreatedAt: serverTimestamp(),
          serverLastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );

      // NUNCA DUPLICAR: remove todos os documentos legados com este e-mail
      for (const oldId of legacyDocIdsToDelete) {
        await deleteDoc(doc(db, 'users', oldId)).catch(() => {});
      }
    } catch (err: any) {
      if (err.message?.includes('excluído')) throw err;
      console.warn('Erro ao sincronizar perfil Google com Firestore:', err);
      const preRole = getLocalPreAssignedRole(cleanEmail);
      profile = {
        uid: firebaseUser.uid,
        email: cleanEmail,
        displayName: firebaseUser.displayName || cleanEmail.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
        role: isSuperAdminUser(cleanEmail) ? 'SUPER_ADMIN' : (preRole || initialDefaultRole),
        userType: defaultUserType,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }
  } else {
    const preRole = getLocalPreAssignedRole(cleanEmail);
    profile = {
      uid: firebaseUser.uid,
      email: cleanEmail,
      displayName: firebaseUser.displayName || cleanEmail.split('@')[0],
      photoURL: firebaseUser.photoURL || undefined,
      role: isSuperAdminUser(cleanEmail) ? 'SUPER_ADMIN' : (preRole || initialDefaultRole),
      userType: defaultUserType,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  if (profile.status === 'INACTIVE') {
    await firebaseSignOut(auth);
    throw new Error('Este usuário foi inativado pela administração. Contate o suporte interno.');
  }

  return { user: profile };
}

/**
 * Cadastro de usuário via E-mail e Senha.
 * Suporta colaboradores internos (@conciliadorcontabil.com.br)
 * e usuários externos/clientes (qualquer provedor).
 * Preserva o cargo previamente atribuído e impede duplicações.
 */
export async function registerWithEmailPassword(
  email: string, 
  pass: string, 
  displayName: string,
  forceUserType?: UserType
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (getDeletedUserEmails().has(cleanEmail)) {
    throw new Error('Este perfil de usuário foi excluído pela administração.');
  }

  const userType: UserType = forceUserType || determineUserType(cleanEmail);

  if (!auth || !db) {
    throw new Error('Serviço de autenticação não inicializado. Verifique as credenciais de nuvem.');
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const formattedName = displayName.trim() || cleanEmail.split('@')[0];

  await updateProfile(cred.user, {
    displayName: formattedName,
  });

  // Busca TODOS os documentos existentes com este e-mail no Firestore para preservar dados e desduplicar
  const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
  const emailSnap = await getDocs(emailQuery);

  let preAssignedRole: UserRole | null = getLocalPreAssignedRole(cleanEmail);
  const legacyDocIdsToDelete: string[] = [];
  let existingCreatedAt: string = new Date().toISOString();

  for (const d of emailSnap.docs) {
    if (d.id !== cred.user.uid) {
      legacyDocIdsToDelete.push(d.id);
    }
    const matchData = d.data() as UserProfile;
    if (matchData.role && !preAssignedRole) preAssignedRole = matchData.role;
    if (matchData.createdAt) existingCreatedAt = matchData.createdAt;
  }

  let finalRole: UserRole;
  if (isSuperAdminUser(cleanEmail)) {
    finalRole = 'SUPER_ADMIN';
  } else if (preAssignedRole) {
    finalRole = preAssignedRole;
  } else {
    finalRole = determineInitialRole(cleanEmail);
  }

  const finalUserType: UserType = (finalRole !== 'READER' || isCorporateEmailValid(cleanEmail)) ? 'INTERNAL' : userType;

  const userProfile: UserProfile = {
    uid: cred.user.uid,
    email: cleanEmail,
    displayName: formattedName,
    role: finalRole,
    userType: finalUserType,
    status: 'ACTIVE',
    createdAt: existingCreatedAt,
    lastLoginAt: new Date().toISOString(),
  };

  const userRef = doc(db, 'users', cred.user.uid);
  await setDoc(userRef, {
    ...userProfile,
    serverCreatedAt: serverTimestamp(),
    serverLastLoginAt: serverTimestamp(),
  });

  // NUNCA DUPLICAR: remove documentos legados com este e-mail
  for (const oldId of legacyDocIdsToDelete) {
    await deleteDoc(doc(db, 'users', oldId)).catch(() => {});
  }

  return { user: userProfile };
}

/**
 * Login de usuário via E-mail e Senha
 * Preserva estritamente cargos pré-atribuídos e elimina duplicatas.
 */
export async function loginWithEmailPassword(
  email: string, 
  pass: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (getDeletedUserEmails().has(cleanEmail)) {
    throw new Error('Este perfil de usuário foi excluído pela administração.');
  }

  if (!auth || !db) {
    throw new Error('Serviço de autenticação não inicializado. Verifique as credenciais de nuvem.');
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const userRef = doc(db, 'users', cred.user.uid);
  const userDoc = await getDoc(userRef);

  let profile: UserProfile;
  const isCorp = isCorporateEmailValid(cleanEmail);
  const defaultUserType: UserType = determineUserType(cleanEmail);

  // Busca TODOS os documentos existentes com este e-mail no Firestore para preservar dados e desduplicar
  const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
  const emailSnap = await getDocs(emailQuery);

  let preAssignedRole: UserRole | null = getLocalPreAssignedRole(cleanEmail);
  let existingCreatedAt: string = new Date().toISOString();
  let existingDisplayName: string = cred.user.displayName || cleanEmail.split('@')[0];
  const legacyDocIdsToDelete: string[] = [];

  for (const d of emailSnap.docs) {
    if (d.id !== cred.user.uid) {
      legacyDocIdsToDelete.push(d.id);
    }
    const data = d.data() as UserProfile;
    if (data.role && !preAssignedRole) {
      preAssignedRole = data.role;
    }
    if (data.createdAt) existingCreatedAt = data.createdAt;
    if (data.displayName && !cred.user.displayName) existingDisplayName = data.displayName;
  }

  if (userDoc.exists()) {
    const currentData = userDoc.data() as UserProfile;
    if (currentData.role) {
      preAssignedRole = currentData.role;
    }
    if (currentData.createdAt) existingCreatedAt = currentData.createdAt;
    if (currentData.displayName) existingDisplayName = currentData.displayName;
  }

  let finalRole: UserRole;
  if (isSuperAdminUser(cleanEmail)) {
    finalRole = 'SUPER_ADMIN';
  } else if (preAssignedRole) {
    finalRole = preAssignedRole;
  } else {
    finalRole = determineInitialRole(cleanEmail);
  }

  const finalUserType: UserType = (finalRole !== 'READER' || isCorp) ? 'INTERNAL' : defaultUserType;

  profile = {
    uid: cred.user.uid,
    email: cleanEmail,
    displayName: cred.user.displayName || existingDisplayName,
    photoURL: cred.user.photoURL || undefined,
    role: finalRole,
    userType: finalUserType,
    status: 'ACTIVE',
    createdAt: existingCreatedAt,
    lastLoginAt: new Date().toISOString(),
  };

  await setDoc(
    userRef,
    {
      ...profile,
      serverLastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );

  // NUNCA DUPLICAR: remove documentos legados com este e-mail
  for (const oldId of legacyDocIdsToDelete) {
    await deleteDoc(doc(db, 'users', oldId)).catch(() => {});
  }

  if (profile.status === 'INACTIVE') {
    await firebaseSignOut(auth);
    throw new Error('Este usuário foi inativado pela administração. Contate o suporte interno.');
  }

  return { user: profile };
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeAuthState(
  onUserChanged: (user: User | null, profile: UserProfile | null) => void
): () => void {
  if (!auth) {
    onUserChanged(null, null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      onUserChanged(null, null);
      return;
    }

    const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
    const isCorp = isCorporateEmailValid(cleanEmail);
    const defaultUserType: UserType = determineUserType(cleanEmail);
    const calculatedRole: UserRole = determineInitialRole(cleanEmail);
    const preRole = getLocalPreAssignedRole(cleanEmail);

    if (db) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const profile = snapshot.data() as UserProfile;
          let role = profile.role || preRole || calculatedRole;
          if (isSuperAdminUser(cleanEmail)) role = 'SUPER_ADMIN';

          const userType: UserType = (role !== 'READER' || isCorp) ? 'INTERNAL' : 'EXTERNAL';
          onUserChanged(firebaseUser, {
            ...profile,
            role,
            userType,
          });
          return;
        } else {
          // Busca por e-mail caso o documento ainda use UID legado
          const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const emailSnap = await getDocs(emailQuery);
          if (!emailSnap.empty) {
            const profile = emailSnap.docs[0].data() as UserProfile;
            let role = profile.role || preRole || calculatedRole;
            if (isSuperAdminUser(cleanEmail)) role = 'SUPER_ADMIN';

            const userType: UserType = (role !== 'READER' || isCorp) ? 'INTERNAL' : 'EXTERNAL';
            onUserChanged(firebaseUser, {
              ...profile,
              uid: firebaseUser.uid,
              role,
              userType,
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar perfil do Firestore:', err);
      }
    }

    const fallbackRole = isSuperAdminUser(cleanEmail) ? 'SUPER_ADMIN' : (preRole || calculatedRole);
    const fallbackUserType: UserType = (fallbackRole !== 'READER' || isCorp) ? 'INTERNAL' : defaultUserType;

    const fallbackProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: cleanEmail,
      displayName: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Usuário',
      photoURL: firebaseUser.photoURL || undefined,
      role: fallbackRole,
      userType: fallbackUserType,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    onUserChanged(firebaseUser, fallbackProfile);
  });
}
