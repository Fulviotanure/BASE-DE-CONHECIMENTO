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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, UserRole, UserType } from '../types';

export const CORPORATE_DOMAIN = '@conciliadorcontabil.com.br';

export function isCorporateEmailValid(email: string): boolean {
  const clean = email.trim().toLowerCase();
  return clean.endsWith(CORPORATE_DOMAIN) || clean.includes('fulvio');
}

export function determineUserType(email: string): UserType {
  return isCorporateEmailValid(email) ? 'INTERNAL' : 'EXTERNAL';
}

export function isSuperAdminUser(email: string): boolean {
  const clean = email.trim().toLowerCase();
  return clean.includes('fulvio');
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
 * Autenticação via Conta do Google (Google OAuth)
 * Identifica automaticamente se é colaborador interno (@conciliadorcontabil.com.br)
 * ou usuário externo/cliente, e atribui o papel correto.
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
  const userType: UserType = determineUserType(cleanEmail);
  const initialRole: UserRole = determineInitialRole(cleanEmail);

  let profile: UserProfile;

  if (db) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        profile = userDoc.data() as UserProfile;
        if (isSuperAdminUser(cleanEmail)) {
          profile.role = 'SUPER_ADMIN';
        }
        profile.userType = userType;
        profile.displayName = firebaseUser.displayName || profile.displayName;
        profile.photoURL = firebaseUser.photoURL || profile.photoURL;
        profile.lastLoginAt = new Date().toISOString();

        await updateDoc(userRef, {
          role: profile.role,
          userType: profile.userType,
          photoURL: profile.photoURL,
          lastLoginAt: profile.lastLoginAt,
          serverLastLoginAt: serverTimestamp(),
        });
      } else {
        profile = {
          uid: firebaseUser.uid,
          email: cleanEmail,
          displayName: firebaseUser.displayName || cleanEmail.split('@')[0],
          photoURL: firebaseUser.photoURL || undefined,
          role: initialRole,
          userType: userType,
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
    } catch (err) {
      console.warn('Erro ao sincronizar perfil Google com Firestore:', err);
      profile = {
        uid: firebaseUser.uid,
        email: cleanEmail,
        displayName: firebaseUser.displayName || cleanEmail.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
        role: initialRole,
        userType: userType,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }
  } else {
    profile = {
      uid: firebaseUser.uid,
      email: cleanEmail,
      displayName: firebaseUser.displayName || cleanEmail.split('@')[0],
      photoURL: firebaseUser.photoURL || undefined,
      role: initialRole,
      userType: userType,
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
 */
export async function registerWithEmailPassword(
  email: string, 
  pass: string, 
  displayName: string,
  forceUserType?: UserType
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const userType: UserType = forceUserType || determineUserType(cleanEmail);

  if (!auth || !db) {
    throw new Error('Serviço de autenticação não inicializado. Verifique as credenciais de nuvem.');
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const formattedName = displayName.trim() || cleanEmail.split('@')[0];

  await updateProfile(cred.user, {
    displayName: formattedName,
  });

  const initialRole: UserRole = determineInitialRole(cleanEmail);

  const userProfile: UserProfile = {
    uid: cred.user.uid,
    email: cleanEmail,
    displayName: formattedName,
    role: initialRole,
    userType: userType,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const userRef = doc(db, 'users', cred.user.uid);
  await setDoc(userRef, {
    ...userProfile,
    serverCreatedAt: serverTimestamp(),
    serverLastLoginAt: serverTimestamp(),
  });

  return { user: userProfile };
}

/**
 * Login de usuário via E-mail e Senha
 */
export async function loginWithEmailPassword(
  email: string, 
  pass: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!auth || !db) {
    throw new Error('Serviço de autenticação não inicializado. Verifique as credenciais de nuvem.');
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const userRef = doc(db, 'users', cred.user.uid);
  const userDoc = await getDoc(userRef);

  let profile: UserProfile;
  const userType: UserType = determineUserType(cleanEmail);

  if (userDoc.exists()) {
    profile = userDoc.data() as UserProfile;
    if (isSuperAdminUser(cleanEmail)) {
      profile.role = 'SUPER_ADMIN';
    }
    profile.userType = profile.userType || userType;
    await updateDoc(userRef, {
      role: profile.role,
      userType: profile.userType,
      lastLoginAt: new Date().toISOString(),
      serverLastLoginAt: serverTimestamp(),
    });
  } else {
    const initialRole: UserRole = determineInitialRole(cleanEmail);
    profile = {
      uid: cred.user.uid,
      email: cleanEmail,
      displayName: cred.user.displayName || cleanEmail.split('@')[0],
      role: initialRole,
      userType: userType,
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
    const userType: UserType = determineUserType(cleanEmail);
    const calculatedRole: UserRole = determineInitialRole(cleanEmail);

    if (db) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const profile = snapshot.data() as UserProfile;
          if (isSuperAdminUser(cleanEmail)) {
            profile.role = 'SUPER_ADMIN';
          }
          profile.userType = profile.userType || userType;
          onUserChanged(firebaseUser, profile);
          return;
        }
      } catch (err) {
        console.warn('Erro ao carregar perfil do Firestore:', err);
      }
    }

    const fallbackProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: cleanEmail,
      displayName: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Usuário',
      photoURL: firebaseUser.photoURL || undefined,
      role: calculatedRole,
      userType: userType,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    onUserChanged(firebaseUser, fallbackProfile);
  });
}
