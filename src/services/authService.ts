import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, UserRole } from '../types';

export const CORPORATE_DOMAIN = '@conciliadorcontabil.com.br';

export function isCorporateEmailValid(email: string): boolean {
  const clean = email.trim().toLowerCase();
  // Permite domínio corporativo oficial ou exceção para o superadmin Fulvio
  return clean.endsWith(CORPORATE_DOMAIN) || clean.includes('fulvio');
}

export async function registerWithEmailPassword(
  email: string, 
  pass: string, 
  displayName: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!isCorporateEmailValid(cleanEmail)) {
    throw new Error(`Acesso restrito: utilize seu e-mail corporativo com domínio ${CORPORATE_DOMAIN}`);
  }

  if (!auth || !db) {
    throw new Error('Firebase não inicializado. Configure as credenciais do projeto no painel.');
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const formattedName = displayName.trim() || cleanEmail.split('@')[0];

  await updateProfile(cred.user, {
    displayName: formattedName,
  });

  // Fulvio é automaticamente ADMIN inicial, todos os outros começam como OPERATOR
  const initialRole: UserRole = cleanEmail.includes('fulvio') ? 'ADMIN' : 'OPERATOR';

  const userProfile: UserProfile = {
    uid: cred.user.uid,
    email: cleanEmail,
    displayName: formattedName,
    role: initialRole,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  // Grava perfil no Firestore na coleção users/{uid}
  const userRef = doc(db, 'users', cred.user.uid);
  await setDoc(userRef, {
    ...userProfile,
    serverCreatedAt: serverTimestamp(),
    serverLastLoginAt: serverTimestamp(),
  });

  return { user: userProfile };
}

export async function loginWithEmailPassword(
  email: string, 
  pass: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!isCorporateEmailValid(cleanEmail)) {
    throw new Error(`Acesso restrito: apenas contas corporativas (${CORPORATE_DOMAIN}) podem acessar.`);
  }

  if (!auth || !db) {
    throw new Error('Firebase não inicializado. Configure as credenciais do projeto.');
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const userRef = doc(db, 'users', cred.user.uid);
  const userDoc = await getDoc(userRef);

  let profile: UserProfile;

  if (userDoc.exists()) {
    profile = userDoc.data() as UserProfile;
    // Atualiza último login
    await updateDoc(userRef, {
      lastLoginAt: new Date().toISOString(),
      serverLastLoginAt: serverTimestamp(),
    });
  } else {
    // Cria doc caso ainda não exista no Firestore
    const initialRole: UserRole = cleanEmail.includes('fulvio') ? 'ADMIN' : 'OPERATOR';
    profile = {
      uid: cred.user.uid,
      email: cleanEmail,
      displayName: cred.user.displayName || cleanEmail.split('@')[0],
      role: initialRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await setDoc(userRef, {
      ...profile,
      serverCreatedAt: serverTimestamp(),
      serverLastLoginAt: serverTimestamp(),
    });
  }

  if (profile.status === 'INACTIVE') {
    await firebaseSignOut(auth);
    throw new Error('Este usuário foi inativado pelo administrador Fulvio. Contate o suporte interno.');
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

    if (db) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          onUserChanged(firebaseUser, snapshot.data() as UserProfile);
          return;
        }
      } catch (err) {
        console.warn('Erro ao carregar perfil do Firestore:', err);
      }
    }

    // Perfil fallback baseado no firebaseUser
    const fallbackRole: UserRole = firebaseUser.email?.toLowerCase().includes('fulvio') ? 'ADMIN' : 'OPERATOR';
    const fallbackProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
      role: fallbackRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    onUserChanged(firebaseUser, fallbackProfile);
  });
}
