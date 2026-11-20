import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  linkWithCredential,
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      }),
    []
  );

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
      // Salva também no Firestore para garantir
      await setDoc(doc(db, 'users', cred.user.uid), { name }, { merge: true });
      setUser({ ...cred.user, displayName: name });
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
    setUser({ ...result.user });
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
      const provider = new GoogleAuthProvider();
      await reauthenticateWithCredential(user, provider);
    }
    await deleteUser(user);
  };

  // NOVA FUNÇÃO: Atualiza o nome do usuário
  const updateUserProfile = async (name) => {
    if (!user) throw new Error('Sem usuário');
    
    // 1. Atualiza no Firebase Auth
    await updateProfile(user, { displayName: name });
    
    // 2. Atualiza no Firestore (para a família buscar)
    await setDoc(doc(db, 'users', user.uid), { name }, { merge: true });
    
    // 3. Atualiza o estado local instantaneamente
    setUser((prev) => ({ ...prev, displayName: name }));
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithGoogle,
        resetPassword,
        logout,
        isGoogleOnly,
        addEmailPassword,
        changePassword,
        deleteAccount,
        updateUserProfile, // <-- Exportado
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}