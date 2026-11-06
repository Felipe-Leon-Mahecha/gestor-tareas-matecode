import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import type { AuthUser } from '../types/auth'
import { auth } from './firebase'

// Adapta el User de Firebase a AuthUser para no filtrar el SDK al resto de la aplicación.
function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  return toAuthUser(user)
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return toAuthUser(user)
}

export async function loginWithGoogle(): Promise<AuthUser> {
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  return toAuthUser(user)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function subscribeToAuthChanges(
  callback: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(user === null ? null : toAuthUser(user))
  })
}
