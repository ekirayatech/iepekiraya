import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const WORKSPACE_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of WORKSPACE_SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'consent',
});

// Flag para indicar si estamos en medio de un flujo de inicio de sesión
let isSigningIn = false;
// Caché en memoria para el token de acceso OAuth (nunca en localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (
  customClientId?: string
): Promise<{ user: User | null; accessToken: string }> => {
  // Si el usuario configuró su propio Client ID de Google Cloud Console para su dominio en Vercel
  const trimmedCustomClientId = (customClientId || '').trim();
  if (
    trimmedCustomClientId &&
    trimmedCustomClientId !== firebaseConfig.oAuthClientId &&
    window.google?.accounts?.oauth2
  ) {
    return new Promise((resolve, reject) => {
      try {
        const tokenClient = window.google!.accounts.oauth2.initTokenClient({
          client_id: trimmedCustomClientId,
          scope: WORKSPACE_SCOPES.join(' '),
          callback: (response) => {
            if (response.error || !response.access_token) {
              reject(
                new Error(
                  `Error OAuth (${response.error || 'sin token'}): Asegúrate de agregar el origen ${window.location.origin} en Google Cloud Console → Credenciales → Orígenes de JavaScript autorizados.`
                )
              );
              return;
            }
            cachedAccessToken = response.access_token;
            resolve({ user: auth.currentUser, accessToken: cachedAccessToken });
          },
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Flujo principal mediante Firebase Auth (GoogleAuthProvider)
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el access_token de Google Workspace desde Firebase Auth.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    const errCode = (error as { code?: string })?.code || '';
    const errMessage = error instanceof Error ? error.message : String(error);
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    if (
      errCode === 'auth/unauthorized-domain' ||
      errMessage.includes('origin_mismatch') ||
      errMessage.includes('unauthorized-domain') ||
      errMessage.includes('OAuth 2.0')
    ) {
      throw new Error(
        `El dominio actual (${currentOrigin}) no está autorizado en OAuth 2.0. Usa la opción "Conexión Directa sin OAuth (Puente Apps Script)" para conectar tu Google Sheet de inmediato sin restricciones de dominio, o autoriza ${currentOrigin} en Google Cloud Console.`
      );
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setInMemoryAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
