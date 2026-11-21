import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const errors = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Não achei uma conta com esse e-mail.',
  'auth/invalid-email': 'Esse e-mail não parece válido.',
  'auth/email-already-in-use': 'Esse e-mail já tem conta. Tente entrar.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão. Confira sua internet.',
  'auth/account-exists-with-different-credential': 'Já existe uma conta com esse e-mail usando outro método.',
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
);

export default function LoginScreen({ onBack }) {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Estados do Modal de Esqueci a Senha
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotInfo, setForgotInfo] = useState('');

  const isLogin = mode === 'login';
  const input =
    'login-focus w-full bg-[#f2f2f2] border border-transparent rounded-2xl pl-12 pr-5 py-4 outline-none text-[16px] focus:bg-white focus:border-black transition';

  const wrap = async (fn) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await fn();
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setError(errors[e.code] || 'Não deu certo. Tente de novo.');
      }
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (!isLogin) {
      if (password.length < 6) {
        setError('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirm) {
        setError('As senhas não são iguais.');
        return;
      }
    }
    wrap(() => (isLogin ? login(email.trim(), password) : register(name.trim(), email.trim(), password)));
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Digite seu e-mail primeiro.');
      return;
    }
    setForgotBusy(true);
    setForgotError('');
    setForgotInfo('');
    try {
      await resetPassword(forgotEmail.trim());
      setForgotInfo('Mandei um link pra redefinir a senha no seu e-mail.');
    } catch (err) {
      setForgotError(errors[err.code] || 'Não deu certo. Tente de novo.');
    } finally {
      setForgotBusy(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setInfo('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-5 py-10 relative overflow-hidden bg-[#f2f2f2] text-[#111] selection:bg-[#C4B5FD] selection:text-black">
      {/* Brilho roxo, igual ao da Home */}
      <div className="absolute top-[-15%] right-[-10%] w-[70%] h-[80%] bg-gradient-to-bl from-[#C4B5FD] via-[#DDD6FE] to-transparent rounded-full blur-[110px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[45%] h-[50%] bg-gradient-to-tr from-white to-transparent rounded-full blur-[90px] pointer-events-none" />

      {/* Botão de voltar para a Home */}
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="absolute top-6 left-6 z-20 w-11 h-11 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white transition shadow-sm text-black"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        <h1 className="text-7xl font-black tracking-tighter leading-none text-center mb-3">moneo.</h1>
        <p className="text-gray-600 text-center mb-8 max-w-xs">
          {isLogin ? 'Entra aí que o pingu tá te esperando.' : 'Cria sua conta e comece a anotar em dois toques.'}
        </p>

        <div className="w-full rounded-[28px] p-5 sm:p-6 flex flex-col gap-4 shadow-xl" style={{ background: '#ffffff' }}>
          <div className="flex bg-[#f2f2f2] rounded-2xl p-1">
            {[['login', 'Entrar'], ['register', 'Criar conta']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => switchMode(id)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${mode === id ? 'bg-black text-white shadow' : 'text-gray-500 hover:text-black'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => wrap(loginWithGoogle)}
            className="w-full bg-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-3 border border-gray-200 hover:border-black transition disabled:opacity-50"
          >
            <GoogleIcon /> {isLogin ? 'Entrar com Google' : 'Criar conta com Google'}
          </button>

          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex-1 border-t border-gray-200" />
            ou com e-mail
            <span className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {!isLogin && (
              <div className="relative">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" autoComplete="name" className={input} />
              </div>
            )}
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" autoComplete="email" className={input} />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder="Senha"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className={`${input} pr-12`}
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!isLogin && (
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type={show ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  className={input}
                />
              </div>
            )}

            {isLogin && (
              <button type="button" onClick={() => setForgotOpen(true)} className="text-xs font-bold text-gray-500 hover:text-black text-right -mt-1 transition">
                Esqueci a senha
              </button>
            )}

            {error && <p className="text-sm font-semibold text-rose-600 text-center">{error}</p>}
            {info && <p className="text-sm font-semibold text-center text-[#7C3AED]">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-black text-white rounded-2xl h-[56px] font-bold hover:bg-[#222] transition disabled:opacity-50 mt-1"
            >
              {busy ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <div className="w-full flex items-center gap-4 mt-6">
          <span className="flex-1 h-px bg-gray-300" />
          <p className="text-gray-500 text-sm text-center whitespace-nowrap">
            {isLogin ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button type="button" onClick={() => switchMode(isLogin ? 'register' : 'login')} className="font-bold text-black">
              {isLogin ? 'Criar agora' : 'Entrar'}
            </button>
          </p>
          <span className="flex-1 h-px bg-gray-300" />
        </div>
      </div>

      {/* MODAL DE ESQUECI A SENHA */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4"
          onClick={(e) => e.target === e.currentTarget && setForgotOpen(false)}
        >
          <div className="w-full max-w-md rounded-[28px] p-6 shadow-2xl relative" style={{ background: '#ffffff', opacity: 1 }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black tracking-tight">Redefinir senha</h3>
              <button
                onClick={() => setForgotOpen(false)}
                aria-label="Fechar"
                className="bg-[#f2f2f2] w-9 h-9 rounded-full flex justify-center items-center text-black hover:bg-black hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitForgot} className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Digite seu e-mail cadastrado que enviaremos um link para você criar uma nova senha.
              </p>

              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-[#f2f2f2] border border-transparent rounded-2xl pl-12 pr-5 py-4 outline-none focus:bg-white focus:border-black transition"
                />
              </div>

              {forgotError && <p className="text-sm font-semibold text-rose-600 text-center">{forgotError}</p>}
              {forgotInfo && <p className="text-sm font-semibold text-[#7C3AED] text-center">{forgotInfo}</p>}

              <button
                type="submit"
                disabled={forgotBusy}
                className="w-full bg-black text-white rounded-2xl h-[56px] font-bold hover:bg-[#222] transition disabled:opacity-50"
              >
                {forgotBusy ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}