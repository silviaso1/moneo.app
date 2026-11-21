import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, sendPasswordResetEmail, updateProfile, updatePassword,
  linkWithCredential, EmailAuthProvider, deleteUser, reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setReady(true);
  }), []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), { name }, { merge: true });
      refresh();
    }
    return cred;
  };

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);

  const isGoogleOnly = () => {
    if (!user) return false;
    const providers = user.providerData.map((p) => p.providerId);
    return providers.includes('google.com') && !providers.includes('password');
  };

  const addEmailPassword = async (email, password) => {
    if (!user) throw new Error('Sem usuário');
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(user, credential);
    refresh();
    return result;
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) throw new Error('Sem usuário');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  const deleteAccount = async (password) => {
    if (!user) throw new Error('Sem usuário');
    const providers = user.providerData.map((p) => p.providerId);
    if (providers.includes('password')) {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } else if (providers.includes('google.com')) {
      // Google não usa reauthenticateWithCredential com o provider: precisa do popup.
      await reauthenticateWithPopup(user, googleProvider);
    }
    await deleteUser(user);
  };

  const updateUserProfile = async (data) => {
    if (!user) throw new Error('Sem usuário');
    if (data.name) await updateProfile(user, { displayName: data.name });
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    refresh();
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{
      user, login, register, loginWithGoogle, resetPassword, logout,
      isGoogleOnly, addEmailPassword, changePassword, deleteAccount, updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}