import { useState } from 'react';
import { GoogleAuthProvider, linkWithPopup, unlink } from 'firebase/auth';

import { auth } from '../services/firebase';

const errors = {
  'auth/credential-already-in-use': 'Esse Google já está vinculado a outra conta.',
  'auth/provider-already-linked': 'O Google já está vinculado.',
  'auth/requires-recent-login': 'Saia e entre de novo para fazer isso.',
};

export default function GoogleLink() {
  const [, force] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const user = auth.currentUser;
  const google = user?.providerData?.find((p) => p.providerId === 'google.com');

  const run = async (fn, okMsg) => {
    setBusy(true);
    setMsg('');
    try {
      await fn();
      setMsg(okMsg);
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setMsg(errors[e.code] || 'Não deu certo. Tente de novo.');
      }
    } finally {
      setBusy(false);
      force((n) => n + 1);
    }
  };

  const link = () => run(() => linkWithPopup(auth.currentUser, new GoogleAuthProvider()), 'Conta Google vinculada.');

  const doUnlink = () => {
    if ((auth.currentUser?.providerData?.length || 0) <= 1) {
      setMsg('Esse é seu único método de login. Vincule outro antes de desvincular.');
      return;
    }
    run(() => unlink(auth.currentUser, 'google.com'), 'Conta Google desvinculada.');
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-500 text-sm">
        {google ? `Vinculado: ${google.email || google.displayName}` : 'Nenhuma conta Google vinculada.'}
      </p>
      <button
        disabled={busy}
        onClick={google ? doUnlink : link}
        className={`rounded-full py-3 font-semibold disabled:opacity-50 ${google ? 'bg-[#f2f2f2]' : 'bg-black text-white'}`}
      >
        {busy ? 'Aguarde...' : google ? 'Desvincular do Google' : 'Vincular ao Google'}
      </button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}