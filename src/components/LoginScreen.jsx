import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginIcon from './LoginIcon';
import PasswordInput from './PasswordInput';
import GoogleButton from './GoogleButton';

export default function LoginScreen() {
  const { login, register, loginGoogle, resetPassword } = useAuth();
  const [sub, setSub] = useState('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    try {
      setError('');
      setLoading(true);
      
      if (action === 'login') await login(email, password);
      if (action === 'register') await register(email, password);
      if (action === 'google') await loginGoogle();
      if (action === 'reset') {
        await resetPassword(email);
        alert('E-mail de recuperação enviado!');
        setSub('main');
      }
    } catch (err) {
      setError('Ocorreu um erro. Verifique os dados e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex justify-center items-center overflow-y-auto">
      <div className="w-full max-w-[400px] flex flex-col items-center p-6 m-auto">
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm w-full text-center">{error}</div>}

        {sub === 'main' && (
          <div className="w-full flex flex-col items-center">
            <LoginIcon />
            <h1 className="text-2xl font-extrabold mb-2 text-center tracking-tight">Entrar na conta</h1>

            <div className="w-full mb-4 relative">
              <label className="block text-[13px] font-semibold text-muted mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full p-4 pr-12 rounded-xl border border-border text-base outline-none transition-colors bg-[#fafafa] focus:border-black focus:bg-white"
              />
            </div>

            <PasswordInput id="login-pass" label="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="flex justify-between w-full mt-4 mb-6">
              <button onClick={() => setSub('forgot')} className="text-[13px] font-semibold text-muted hover:text-black">Esqueceu a senha?</button>
              <button onClick={() => setSub('register')} className="text-[13px] font-semibold text-muted hover:text-black">Criar conta</button>
            </div>

            <button 
              onClick={() => handleAction('login')} 
              disabled={loading}
              className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              Entrar
            </button>

            <div className="flex items-center w-full my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="px-3 text-muted text-[13px] font-medium">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <GoogleButton onClick={() => handleAction('google')} disabled={loading} />
          </div>
        )}

        {sub === 'register' && (
          <div className="w-full flex flex-col items-center">
            <h1 className="text-2xl font-extrabold mb-6 tracking-tight">Criar conta</h1>
            <div className="w-full mb-4">
              <label className="block text-[13px] font-semibold text-muted mb-1.5">Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="w-full p-4 rounded-xl border border-border text-base outline-none bg-[#fafafa] focus:border-black focus:bg-white" />
            </div>
            <div className="w-full mb-4">
              <label className="block text-[13px] font-semibold text-muted mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full p-4 rounded-xl border border-border text-base outline-none bg-[#fafafa] focus:border-black focus:bg-white" />
            </div>
            <PasswordInput id="register-pass" label="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button 
              onClick={() => handleAction('register')} 
              disabled={loading}
              className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold hover:bg-[#333] disabled:opacity-50"
            >
              Criar Conta
            </button>
            <div className="flex justify-center w-full mt-6">
              <button onClick={() => setSub('main')} className="text-[13px] font-semibold text-muted hover:text-black">Já tenho conta. Voltar</button>
            </div>
          </div>
        )}

        {sub === 'forgot' && (
          <div className="w-full flex flex-col items-center">
            <h1 className="text-2xl font-extrabold mb-6 tracking-tight">Recuperar senha</h1>
            <p className="text-muted text-center mb-6 text-sm">Enviaremos um link para redefinir sua senha.</p>
            <div className="w-full mb-4">
              <label className="block text-[13px] font-semibold text-muted mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full p-4 rounded-xl border border-border text-base outline-none bg-[#fafafa] focus:border-black focus:bg-white" />
            </div>
            <button 
              onClick={() => handleAction('reset')} 
              disabled={loading}
              className="w-full p-[18px] rounded-2xl bg-black text-white text-base font-bold hover:bg-[#333] disabled:opacity-50"
            >
              Enviar Link
            </button>
            <div className="flex justify-center w-full mt-6">
              <button onClick={() => setSub('main')} className="text-[13px] font-semibold text-muted hover:text-black">Voltar para o login</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}