import { useState, useEffect } from 'react';
import { Users, UserPlus, Check, X, Crown, LogOut, User, Power, PowerOff } from 'lucide-react';
import useFamily from '../hooks/useFamily';

export default function Family() {
  const {
    loading, family, pendingInvites, sentInvites, members, isOwner, modeActive,
    createFamily, inviteMember, cancelInvite, acceptInvite, rejectInvite, leaveFamily,
    activateMode, deactivateMode,
  } = useFamily();

  const [newName, setNewName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteOk, setInviteOk] = useState('');

  const [localMode, setLocalMode] = useState(modeActive);
  useEffect(() => { setLocalMode(modeActive); }, [modeActive]);

  const toggleMode = () => {
    const next = !localMode;
    setLocalMode(next);
    (next ? activateMode() : deactivateMode()).catch(() => setLocalMode(!next));
  };

  if (!loading && pendingInvites.length > 0 && !family) {
    const inv = pendingInvites[0];
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-4xl">Família</h1>
        <div className="bg-white rounded-[28px] p-6 shadow-sm text-center flex flex-col gap-4">
          <Users size={40} className="mx-auto text-gray-400" />
          <p className="font-bold text-lg">Você foi convidado!</p>
          <p className="text-gray-500 text-sm"><b>{inv.fromName}</b> te convidou para a família <b>{inv.familyName}</b>.</p>
          <div className="flex gap-2">
            <button onClick={() => acceptInvite(inv).catch((e) => alert(e.message))} className="flex-1 bg-black text-white rounded-full py-3 font-semibold flex items-center justify-center gap-2"><Check size={16} /> Aceitar</button>
            <button onClick={rejectInvite} className="flex-1 bg-[#f2f2f2] rounded-full py-3 font-semibold flex items-center justify-center gap-2"><X size={16} /> Recusar</button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !family) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-4xl">Família</h1>
        <div className="bg-white rounded-[28px] p-6 shadow-sm flex flex-col gap-4">
          <Users size={40} className="mx-auto text-gray-400" />
          <p className="font-bold text-center">Você ainda não tem um perfil família</p>
          <p className="text-gray-500 text-sm text-center">Crie um painel compartilhado para lançar gastos em conjunto.</p>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome da família (ex: Família Silva)" className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent-from)]" />
          <button onClick={() => createFamily(newName.trim() || 'Minha família')} className="bg-black text-white rounded-full py-3 font-semibold">Criar família</button>
        </div>
      </div>
    );
  }

  if (loading || !family) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const submitInvite = async () => {
    setInviteError(''); setInviteOk('');
    if (!inviteEmail.trim()) { setInviteError('Digite um email.'); return; }
    setInviteBusy(true);
    try {
      await inviteMember(inviteEmail.trim());
      setInviteOk('Convite enviado!');
      setInviteEmail('');
    } catch (e) {
      setInviteError(e.message || 'Não deu certo.');
    } finally { setInviteBusy(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl">{family.name}</h1>

      <button
        onClick={toggleMode}
        style={{
          backgroundColor: localMode ? '#000000' : '#ffffff',
          border: localMode ? 'none' : '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px',
          borderRadius: '28px',
          width: '100%',
          textAlign: 'left',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: localMode ? 'rgba(255, 255, 255, 0.2)' : 'var(--accent-soft)',
          color: localMode ? '#ffffff' : 'var(--accent-text)',
        }}>
          {localMode ? <PowerOff size={22} /> : <Power size={22} />}
        </span>
        
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontWeight: 'bold', fontSize: '18px', color: localMode ? '#ffffff' : '#000000', margin: 0 }}>
            {localMode ? 'Desativar modo família' : 'Ativar modo família'}
          </p>
          <p style={{ fontSize: '14px', color: localMode ? '#d1d5db' : '#9ca3af', margin: 0, marginTop: '4px' }}>
            {localMode ? 'Tudo que você vê agora é compartilhado. Toque para voltar ao pessoal.' : 'Ao ativar, limites, cartões, mascote e gráficos passam a ser da família.'}
          </p>
        </div>
      </button>

      <div className="bg-white rounded-[28px] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-gray-600 font-semibold mb-3">
          <Users size={18} /> Membros ({members.length})
        </div>
        <div className="flex flex-col divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.uid} className="flex items-center gap-3 py-3">
              <span className="w-10 h-10 rounded-full bg-[#f2f2f2] flex items-center justify-center"><User size={18} /></span>
              <div className="flex-1 min-w-0">
                {/* NOME VEM DIRETO DO BANCO */}
                <p className="font-semibold truncate">{m.name}</p>
                <p className="text-gray-400 text-xs">{m.role === 'owner' ? 'Dono' : 'Membro'}</p>
              </div>
              {m.role === 'owner' && <Crown size={16} className="text-yellow-500" />}
            </div>
          ))}
        </div>

        {sentInvites.length > 0 && (
          <div className="border-t border-gray-100 mt-3 pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">Convites pendentes</p>
            {sentInvites.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate">{i.id}</span>
                <button onClick={() => cancelInvite(i.id)} className="text-rose-600 text-xs font-semibold">Cancelar</button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 mt-3 pt-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Convidar por email</p>
          <div className="flex gap-2">
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@exemplo.com" type="email" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[var(--accent-from)]" />
            <button disabled={inviteBusy} onClick={submitInvite} className="bg-black text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 flex items-center gap-1"><UserPlus size={14} /> Enviar</button>
          </div>
          {inviteError && <p className="text-rose-600 text-xs mt-1">{inviteError}</p>}
          {inviteOk && <p className="text-violet-600 text-xs mt-1">{inviteOk}</p>}
        </div>
      </div>

      <button onClick={() => window.confirm('Sair da família?') && leaveFamily()} className="flex items-center justify-center gap-2 bg-white rounded-full py-4 font-semibold shadow-sm text-rose-600">
        <LogOut size={18} /> Sair da família
      </button>
    </div>
  );
}