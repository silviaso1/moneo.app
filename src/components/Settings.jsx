import { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, ChevronUp, CreditCard, ImagePlus,
  Landmark, LayoutGrid, LogOut, Menu, Plus, Smile, Upload, X, Save,
  Palette, KeyRound, Trash2, ShieldAlert, UserCircle,
} from 'lucide-react';
import { money } from '../utils/format';
import { SHORTCUTS, NAV, safeShortcuts, safeNav, THEME_COLORS } from '../utils/config';
import { mascotPacks, animeCatalog } from '../store';
import { brazilianBanks, getBankLogoUrl } from '../utils/banks';
import { useAuth } from '../contexts/AuthContext';
import MonthBar from './MonthBar';
import CategoryIcon from './CategoryIcon';
import GoogleLink from './GoogleLink';
import Mascot from './Mascot';
import { Switch } from './ui';
import Modal from './Modal';
import { BankLogo, CardBrand } from './CardBadge';

function Section({ icon, title, onNew, children }) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-gray-600 font-semibold">{icon}{title}</span>
        {onNew && <button onClick={onNew} className="flex items-center font-semibold"><Plus size={16} /> Nova</button>}
      </div>
      {children}
    </div>
  );
}

const SLOTS = ['Esquerda 1', 'Esquerda 2', 'Direita 1', 'Direita 2'];
const MOODS = [['normal', 'Normal'], ['happy', 'Feliz'], ['sad', 'Triste'], ['angry', 'Bravo']];
const COLORS = ['#1A1A1A', '#FFA6D0', '#B79CFF', '#FF6B2C', '#7EE0B5', '#70BFFF', '#FFD166', '#FFFFFF'];

export default function Settings({
  state, onChangeMonth,
  onAddAccount, onEditAccount, onDeleteAccount, onMoveAccount,
  onAddCard, onEditCard,
  onAddCategory, onEditCategory,
  onSaveShortcuts, onSaveNav,
  onSelectPack, onSelectMascotColor, onUploadMascot, onRemoveMascot,
  onToggleAnime, onSelectAnimeCharacter,
  onToggleFollow, onToggleSaved,
  onSelectTheme,
  onLogout,
  onUpdateSettings,
}) {
  const [busy, setBusy] = useState(null);
  const [colorDraft, setColorDraft] = useState(state.mascotColor || '#1A1A1A');

  const { user, isGoogleOnly, addEmailPassword, changePassword, deleteAccount, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  const [incomeValue, setIncomeValue] = useState(state.monthlyIncome || '');
  const [hoursValue, setHoursValue] = useState(state.monthlyHours || '');
  const [savingIncome, setSavingIncome] = useState(false);

  const googleOnly = isGoogleOnly();

  const [modalAuth, setModalAuth] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authCurrentPass, setAuthCurrentPass] = useState('');
  const [authNewPass, setAuthNewPass] = useState('');
  const [authPass2, setAuthPass2] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');

  // Estado para confirmar exclusão
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sc = safeShortcuts(state.shortcuts);
  const nav = safeNav(state.navItems);
  const custom = state.customMascots || {};
  const selectedPack = mascotPacks[state.mascotPack] ? state.mascotPack : 'skunk';
  const selectedColor = state.mascotColor || mascotPacks[selectedPack].defaultColor;
  const anime = animeCatalog[state.animeId] || animeCatalog['jujutsu-kaisen'];
  const selectedAnimeCharacter = anime.characters[state.animeCharacter] ? state.animeCharacter : 'gojo';

  useEffect(() => {
    setColorDraft(selectedColor);
    setName(user?.displayName || '');
    setIncomeValue(state.monthlyIncome || '');
    setHoursValue(state.monthlyHours || '');
  }, [selectedColor, user, state.monthlyIncome, state.monthlyHours]);

  const updateColor = (value) => {
    setColorDraft(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) onSelectMascotColor(value.toUpperCase());
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await updateUserProfile({ name: name.trim() });
    } catch (e) {
      alert('Erro ao atualizar nome.');
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveIncome = async () => {
    setSavingIncome(true);
    try {
      await onUpdateSettings({
        monthlyIncome: Number(incomeValue) || 0,
        monthlyHours: Number(hoursValue) || 0,
      });
    } catch (e) {
      alert('Erro ao salvar renda.');
    } finally {
      setSavingIncome(false);
    }
  };

  const moveSc = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= sc.length) return;
    const next = [...sc];
    [next[i], next[j]] = [next[j], next[i]];
    onSaveShortcuts(next);
  };

  const removeSc = (id) => sc.length > 1 && onSaveShortcuts(sc.filter((x) => x !== id));
  const addSc = (id) => onSaveShortcuts([...sc, id]);

  const setSlot = (i, id) => {
    const next = [...nav];
    const j = next.indexOf(id);
    if (j >= 0) next[j] = next[i];
    next[i] = id;
    onSaveNav(next);
  };

  const upload = async (mood, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(mood);
    try {
      await onUploadMascot(mood, file);
    } catch {
      window.alert('Não consegui usar essa imagem. Tente outro PNG.');
    } finally {
      setBusy(null);
    }
  };

  const resetAuthForm = () => {
    setAuthEmail('');
    setAuthCurrentPass('');
    setAuthNewPass('');
    setAuthPass2('');
    setAuthError('');
    setAuthInfo('');
    setAuthBusy(false);
  };

  const closeAuth = () => {
    setModalAuth(null);
    resetAuthForm();
  };

  const submitAddEmail = async () => {
    setAuthError(''); setAuthInfo('');
    if (!authEmail.trim() || authNewPass.length < 6) {
      setAuthError('Preencha email e uma senha de 6+ caracteres.');
      return;
    }
    if (authNewPass !== authPass2) { setAuthError('As senhas não batem.'); return; }
    setAuthBusy(true);
    try {
      await addEmailPassword(authEmail.trim(), authNewPass);
      setAuthInfo('Email e senha adicionados! Agora você pode entrar sem Google.');
    } catch (e) {
      setAuthError(
        e.code === 'auth/email-already-in-use' ? 'Esse email já está em uso.' :
        e.code === 'auth/requires-recent-login' ? 'Faça login de novo e tente rapidinho.' :
        'Não deu certo.'
      );
    } finally { setAuthBusy(false); }
  };

  const submitChangePass = async () => {
    setAuthError(''); setAuthInfo('');
    if (authNewPass.length < 6) { setAuthError('A nova senha precisa ter 6+ caracteres.'); return; }
    if (authNewPass !== authPass2) { setAuthError('As senhas não batem.'); return; }
    setAuthBusy(true);
    try {
      await changePassword(authCurrentPass, authNewPass);
      setAuthInfo('Senha alterada.');
    } catch (e) {
      setAuthError('Senha atual incorreta.');
    } finally { setAuthBusy(false); }
  };

  const submitDelete = async () => {
    setAuthError(''); setAuthInfo('');
    if (!googleOnly && !authCurrentPass) {
      setAuthError('Digite sua senha para confirmar.');
      return;
    }
    setAuthBusy(true);
    try {
      await deleteAccount(authCurrentPass);
    } catch (e) {
      setAuthError(
        e.code === 'auth/wrong-password' ? 'Senha incorreta.' :
        e.code === 'auth/popup-closed-by-user' ? 'Cancelado.' :
        'Não foi possível deletar.'
      );
      setAuthBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl">Ajustes</h1>

      <Section icon={<Landmark size={18} />} title="Contas e cartões" onNew={onAddAccount}>
        <div className="flex flex-col divide-y divide-gray-100">
          {(state.cards || []).map((c) => (
            <button key={c.id} onClick={() => onEditCard(c)} className="flex items-center gap-3 text-left py-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center overflow-hidden">
                <BankLogo name={c.bank} size={24} fallback={<CreditCard size={20} />} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">Cartão {c.name}</p>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <CardBrand brand={c.brand} height={16} />
                  <span className="truncate">Cartão · fecha dia {c.closingDay} · vence dia {c.dueDay}</span>
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
          {(state.accounts || []).map((a, i) => {
            const bank = brazilianBanks.find(b => b.name === a.name);
            const logoUrl = bank ? getBankLogoUrl(bank.ispb) : null;

            return (
              <div key={a.id} className="flex items-center gap-2 py-3">
                <button onClick={() => onEditAccount(a)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                  <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt={a.name} className="w-6 h-6 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                    ) : null}
                    <span className={`w-4 h-4 rounded-full ${logoUrl ? 'hidden' : 'block'}`} style={{ background: a.color || '#000' }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{a.name}</p>
                    <p className="text-gray-400 text-sm">Conta · {money(a.balance)}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
                <div className="flex flex-col">
                  <button disabled={i === 0} onClick={() => onMoveAccount(a.id, -1)} className="disabled:opacity-20"><ChevronUp size={16} /></button>
                  <button disabled={i === (state.accounts || []).length - 1} onClick={() => onMoveAccount(a.id, 1)} className="disabled:opacity-20"><ChevronDown size={16} /></button>
                </div>
                <button onClick={() => setDeleteConfirm({ type: 'account', id: a.id, name: a.name })} className="text-gray-300 hover:text-rose-600 p-1"><Trash2 size={16} /></button>
              </div>
            );
          })}
          {(state.accounts || []).length === 0 && (state.cards || []).length === 0 && <p className="text-gray-400 text-center py-3">Nenhuma conta ainda.</p>}
        </div>
        <button onClick={onAddCard} className="mt-2 w-full border-t border-gray-100 pt-4 flex items-center justify-center gap-1 font-semibold">
          <Plus size={16} /> Novo cartão de crédito
        </button>
      </Section>

      <Section icon={<span className="text-base">▦</span>} title="Categorias" onNew={onAddCategory}>
        <p className="text-gray-400 text-sm mb-1">Gastos</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {(state.categories || []).map((c) => (
            <button key={c.id} onClick={() => onEditCategory(c)} className="flex items-center gap-3 text-left py-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center"><CategoryIcon name={c.icon} /></span>
              <p className="flex-1 font-semibold truncate">{c.name}</p>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Palette size={18} />} title="Tema do app">
        <p className="text-gray-400 text-sm mb-3">Escolha a cor de destaque. O roxo é o padrão.</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(THEME_COLORS).map(([id, t]) => (
            <button key={id} onClick={() => onSelectTheme(id)} className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition ${state.themeColor === id ? 'border-black' : 'border-transparent'}`}>
              <span className="w-12 h-12 rounded-full border-2 border-white shadow" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
              <span className="text-xs font-semibold">{t.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Smile size={18} />} title="Mascote">
        <p className="text-gray-400 text-sm mb-3">Escolha seu personagem e personalize sua experiência.</p>

        <div className="flex items-center justify-between rounded-2xl bg-[#f2f2f2] p-4">
          <div>
            <p className="font-semibold">Tema anime</p>
            <p className="text-gray-400 text-xs mt-1">Use personagens de animes como mascote.</p>
          </div>
          <Switch on={!!state.animeTheme} onClick={onToggleAnime} />
        </div>

        {state.animeTheme ? (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Anime</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(animeCatalog).map(([id, item]) => (
                <button key={id} onClick={() => onSelectAnimeCharacter(anime.characters[selectedAnimeCharacter] ? selectedAnimeCharacter : 'gojo', id)} className={`px-4 py-2 rounded-full text-sm font-semibold border ${state.animeId === id ? 'bg-black text-white border-black' : 'border-gray-200'}`}>
                  {item.name}
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold mt-5 mb-2">Personagem</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(anime.characters).map(([id, character]) => (
                <button key={id} onClick={() => onSelectAnimeCharacter(id, state.animeId)} className={`rounded-2xl p-3 flex flex-col items-center gap-2 border transition ${selectedAnimeCharacter === id ? 'border-black bg-white shadow-sm' : 'border-transparent bg-[#f2f2f2]'}`}>
                  <div className="w-32 h-32"><Mascot mood="normal" pack={`anime-${id}`} /></div>
                  <span className="text-sm font-semibold">{character.name}</span>
                  <span className="text-[10px] text-gray-400 text-center">{character.description}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-[#f2f2f2] p-4">
              <p className="font-semibold text-sm mb-3">Expressões</p>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map(([mood, label]) => (
                  <div key={mood} className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14"><Mascot mood={mood} pack={`anime-${selectedAnimeCharacter}`} /></div>
                    <span className="text-[10px] text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Object.entries(mascotPacks).filter(([, p]) => p.category !== 'anime').map(([id, p]) => (
                <button key={id} onClick={() => onSelectPack(id)} className={`rounded-2xl p-3 flex flex-col items-center gap-2 border transition ${state.mascotPack === id ? 'border-black bg-white shadow-sm' : 'border-transparent bg-[#f2f2f2]'}`}>
                  <div className="w-16 h-16"><Mascot mood="happy" pack={id} color={id === selectedPack ? selectedColor : p.defaultColor} /></div>
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-[10px] text-gray-400 text-center">{p.description}</span>
                </button>
              ))}
              <button disabled={!custom.normal} onClick={() => onSelectPack('custom')} className={`rounded-2xl p-3 flex flex-col items-center justify-center gap-2 border disabled:opacity-40 ${state.mascotPack === 'custom' ? 'border-black bg-white shadow-sm' : 'border-transparent bg-[#f2f2f2]'}`}>
                <div className="w-16 h-16 flex items-center justify-center">{custom.normal ? <Mascot mood="normal" pack="custom" custom={custom} /> : <Upload size={24} className="text-gray-400" />}</div>
                <span className="text-sm font-semibold">Meu mascote</span>
              </button>
            </div>

            {state.mascotPack !== 'custom' && (
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="font-semibold text-sm mb-1">Personalizar cor</p>
                <p className="text-gray-400 text-xs mb-4">Escolha uma cor ou informe o código HEX.</p>
                <div className="flex items-center gap-3">
                  <label className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 cursor-pointer shrink-0">
                    <input type="color" value={selectedColor} onChange={(e) => updateColor(e.target.value)} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                  </label>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Código HEX</label>
                    <input value={colorDraft} onChange={(e) => { const value = e.target.value; setColorDraft(value); if (/^#[0-9A-Fa-f]{6}$/.test(value)) onSelectMascotColor(value.toUpperCase()); }} maxLength={7} placeholder="#1A1A1A" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono outline-none focus:border-black" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {COLORS.map((color) => (<button key={color} onClick={() => updateColor(color)} title={color} className={`w-8 h-8 rounded-full border transition ${selectedColor.toUpperCase() === color ? 'border-black ring-2 ring-offset-2 ring-gray-400' : 'border-gray-200'}`} style={{ backgroundColor: color }} />))}
                </div>
                <button onClick={() => updateColor(mascotPacks[selectedPack].defaultColor)} className="mt-4 text-xs font-semibold text-gray-500 hover:text-black">Restaurar cor original</button>
              </div>
            )}
          </>
        )}

        <div className="border-t border-gray-100 mt-5">
          <p className="text-sm font-semibold text-gray-500 pt-4">Imagens do seu mascote (PNG)</p>
          <div className="flex flex-col divide-y divide-gray-100">
            {MOODS.map(([mood, label]) => (
              <div key={mood} className="flex items-center gap-3 py-3">
                <div className="w-12 h-12 rounded-full bg-[#f2f2f2] flex items-center justify-center overflow-hidden shrink-0">{custom[mood] ? <img src={custom[mood]} alt="" className="w-full h-full object-contain" /> : <ImagePlus size={18} className="text-gray-400" />}</div>
                <p className="flex-1 font-semibold">{label}</p>
                <label className="cursor-pointer text-sm font-semibold bg-[#f2f2f2] rounded-full px-4 py-2">
                  {busy === mood ? 'Enviando...' : custom[mood] ? 'Trocar' : 'Enviar PNG'}
                  <input type="file" accept="image/png,image/*" className="hidden" onChange={(e) => upload(mood, e)} />
                </label>
                {custom[mood] && <button onClick={() => onRemoveMascot(mood)} className="text-gray-400 p-1"><X size={18} /></button>}
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs">O humor sem imagem usa a imagem do Normal. O Normal é obrigatório para ativar.</p>
        </div>
      </Section>

      <Section icon={<LayoutGrid size={18} />} title="Atalhos do início">
        <p className="text-gray-400 text-sm mb-1">Quantos quiser, em grade de 4 por linha. Use as setas para ordenar.</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {sc.map((id, i) => (
            <div key={id} className="flex items-center gap-2 py-3">
              <p className="flex-1 font-semibold">{SHORTCUTS[id]}</p>
              <button disabled={i === 0} onClick={() => moveSc(i, -1)} className="disabled:opacity-20 p-1"><ChevronUp size={18} /></button>
              <button disabled={i === sc.length - 1} onClick={() => moveSc(i, 1)} className="disabled:opacity-20 p-1"><ChevronDown size={18} /></button>
              <button disabled={sc.length === 1} onClick={() => removeSc(id)} className="disabled:opacity-20 text-gray-400 p-1"><X size={18} /></button>
            </div>
          ))}
        </div>
        {Object.keys(SHORTCUTS).some((id) => !sc.includes(id)) && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-500 mb-2">Adicionar</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(SHORTCUTS).filter((id) => !sc.includes(id)).map((id) => (
                <button key={id} onClick={() => addSc(id)} className="px-4 py-2 rounded-full border border-gray-200 font-semibold text-sm flex items-center gap-1">
                  <Plus size={14} /> {SHORTCUTS[id]}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section icon={<Menu size={18} />} title="Barra de navegação">
        <p className="text-gray-400 text-sm mb-1">O botão + fica sempre no meio. Escolha o que aparece em cada lugar.</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {SLOTS.map((label, i) => (
            <div key={label} className="py-3">
              <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(NAV).map((id) => (
                  <button key={id} onClick={() => setSlot(i, id)} className={`px-4 py-2 rounded-full border text-sm font-semibold ${nav[i] === id ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>
                    {NAV[id]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Preferências">
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <span className="font-medium">Mascote segue o cursor</span>
            <Switch on={state.followCursor} onClick={onToggleFollow} />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-medium">Ocultar juros</span>
            <Switch on={state.hideSaved} onClick={onToggleSaved} />
          </div>
        </div>
      </Section>

      <Section icon={<UserCircle size={18} />} title="Meu Perfil">
        <p className="text-gray-400 text-sm mb-3">Este nome aparecerá para sua família.</p>
        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Nome e Sobrenome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João Silva" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition" />
          </div>
          <button disabled={savingName || !name.trim() || name.trim() === user?.displayName} onClick={handleSaveName} className="bg-black text-white rounded-xl px-4 py-3 font-semibold flex items-center gap-2 disabled:opacity-50">
            <Save size={16} /> Salvar
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="font-bold text-gray-700 mb-1">Renda e Horas</p>
          <p className="text-xs text-gray-400 mb-4">Usamos isso para calcular quantas horas da sua vida você gasta em cada compra.</p>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Ganho por mês (R$)</label>
              <input type="number" value={incomeValue} onChange={(e) => setIncomeValue(e.target.value)} placeholder="Ex: 3500" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Horas por mês</label>
              <input type="number" value={hoursValue} onChange={(e) => setHoursValue(e.target.value)} placeholder="Ex: 220" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black" />
            </div>
          </div>
          <button onClick={handleSaveIncome} disabled={savingIncome} className="mt-3 w-full bg-black text-white rounded-xl py-3 font-semibold disabled:opacity-50">
            {savingIncome ? 'Salvando...' : 'Salvar Renda e Horas'}
          </button>
        </div>
      </Section>

      <Section icon={<UserCircle size={18} />} title="Conta e segurança">
        <div className="flex flex-col divide-y divide-gray-100">
          {!googleOnly && (
            <button onClick={() => setModalAuth('change-pass')} className="flex items-center gap-3 py-4 text-left">
              <span className="w-10 h-10 rounded-full bg-[#f2f2f2] flex items-center justify-center"><KeyRound size={18} /></span>
              <div className="flex-1"><p className="font-semibold">Redefinir senha</p><p className="text-gray-400 text-xs">Trocar a senha de acesso</p></div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          )}
          {googleOnly && (
            <button onClick={() => setModalAuth('add-email')} className="flex items-center gap-3 py-4 text-left">
              <span className="w-10 h-10 rounded-full bg-[#f2f2f2] flex items-center justify-center"><KeyRound size={18} /></span>
              <div className="flex-1"><p className="font-semibold">Adicionar email e senha</p><p className="text-gray-400 text-xs">Sua conta só tem Google. Adicione outra forma de entrar.</p></div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          )}
          <button onClick={() => setModalAuth('delete')} className="flex items-center gap-3 py-4 text-left text-rose-600">
            <span className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center"><Trash2 size={18} /></span>
            <div className="flex-1"><p className="font-semibold">Deletar minha conta</p><p className="text-gray-400 text-xs">Apaga tudo permanentemente</p></div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>
      </Section>

      <Section title="Conta Google"><GoogleLink /></Section>

      <button onClick={onLogout} className="flex items-center justify-center gap-2 bg-white rounded-full py-4 font-semibold shadow-sm text-rose-600">
        <LogOut size={18} /> Sair
      </button>

      {/* MODAIS DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirm && (
        <Modal open={true} onClose={() => setDeleteConfirm(null)} title="Confirmar exclusão">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Tem certeza que deseja excluir a conta <b>{deleteConfirm.name}</b>?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-200 text-black rounded-full py-3 font-semibold">Cancelar</button>
              <button onClick={() => { onDeleteAccount(deleteConfirm.id); setDeleteConfirm(null); }} className="flex-1 bg-rose-600 text-white rounded-full py-3 font-semibold">Excluir</button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAIS DE AUTENTICAÇÃO */}
      <Modal open={modalAuth === 'add-email'} onClose={closeAuth} title="Adicionar email e senha">
        <div className="flex flex-col gap-3">
          <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="seu@email.com" type="email" className="border border-gray-200 rounded-xl px-4 py-3 outline-none" />
          <input value={authNewPass} onChange={(e) => setAuthNewPass(e.target.value)} placeholder="Senha (6+ caracteres)" type="password" className="border border-gray-200 rounded-xl px-4 py-3 outline-none" />
          <input value={authPass2} onChange={(e) => setAuthPass2(e.target.value)} placeholder="Repita a senha" type="password" className="border border-gray-200 rounded-xl px-4 py-3 outline-none" />
          {authError && <p className="text-rose-600 text-sm text-center">{authError}</p>}
          {authInfo && <p className="text-violet-600 text-sm text-center">{authInfo}</p>}
          <button disabled={authBusy} onClick={submitAddEmail} className="bg-black text-white rounded-full py-3 font-semibold disabled:opacity-50">{authBusy ? 'Aguarde...' : 'Adicionar'}</button>
        </div>
      </Modal>

      <Modal open={modalAuth === 'change-pass'} onClose={closeAuth} title="Redefinir senha">
        <div className="flex flex-col gap-3">
          <input value={authCurrentPass} onChange={(e) => setAuthCurrentPass(e.target.value)} placeholder="Senha atual" type="password" className="border border-gray-200 rounded-xl px-4 py-3 outline-none" />
          <input value={authNewPass} onChange={(e) => setAuthNewPass(e.target.value)} placeholder="Nova senha" type="password" className="border border-gray-200 rounded-xl px-4 py-3 outline-none" />
          <input value={authPass2} onChange={(e) => setAuthPass2(e.target.value)} placeholder="Repita a nova senha" type="password" className="border border-gray-200 rounded-xl px-4 py-3 outline-none" />
          {authError && <p className="text-rose-600 text-sm text-center">{authError}</p>}
          {authInfo && <p className="text-violet-600 text-sm text-center">{authInfo}</p>}
          <button disabled={authBusy} onClick={submitChangePass} className="bg-black text-white rounded-full py-3 font-semibold disabled:opacity-50">{authBusy ? 'Aguarde...' : 'Salvar'}</button>
        </div>
      </Modal>

      <Modal open={modalAuth === 'delete'} onClose={closeAuth} title="Deletar minha conta">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 bg-rose-50 rounded-2xl p-3">
            <ShieldAlert size={18} className="text-rose-600 mt-0.5 shrink-0" />
            <p className="text-rose-700 text-sm">Isso apaga <b>tudo</b> permanentemente: contas, transações, cartões, investimentos, família... Não dá para desfazer.</p>
          </div>
          {googleOnly ? (
            <p className="text-gray-500 text-sm">Sua conta é só Google. Clique abaixo — vai abrir o popup do Google para confirmar e depois apagamos.</p>
          ) : (
            <input value={authCurrentPass} onChange={(e) => setAuthCurrentPass(e.target.value)} placeholder="Digite sua senha para confirmar" type="password" className="border border-gray-200 rounded-xl px-4 py-3 outline-none" />
          )}
          {authError && <p className="text-rose-600 text-sm text-center">{authError}</p>}
          <button disabled={authBusy} onClick={submitDelete} className="bg-rose-600 text-white rounded-full py-3 font-semibold disabled:opacity-50">{authBusy ? 'Apagando...' : 'Deletar permanentemente'}</button>
        </div>
      </Modal>
    </div>
  );
}