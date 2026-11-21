import { useState } from 'react';
import {
  ChevronRight, ArrowUpRight, Plus, Minus, Utensils, ShoppingCart,
  Car, PartyPopper, Signal, Wifi, BatteryFull, Home as HomeIcon, List, PiggyBank, User, Beer, Shirt,
} from 'lucide-react';
import Mascot from './Mascot';

const PURPLE = '#8B5CF6';
const LILAC = '#C4B5FD';

const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.78 3.54-.68 2.23.23 3.45 1.83 3.86 2.35-2.62 1.6-2.1 5.45.55 6.48-.61 1.56-1.47 3.04-3.03 4.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const AndroidIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993.0001.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.4045-6.02l1.9973-3.4592c.1499-.2596.0604-.5924-.1992-.7423-.2596-.1499-.5924-.0604-.7423.1992l-2.0223 3.5033c-1.3691-.616-2.9008-.9635-4.5148-.9635-1.6141 0-3.1457.3475-4.5147.9635L5.6681 5.1928c-.1499-.2596-.4826-.3491-.7423-.1992-.2596.15-.3491.4827-.1992.7423l1.9973 3.4592C2.5485 10.6565.4117 14.3509.1821 18.6857c-.045.863.6348 1.5955 1.4993 1.5955h20.6372c.8645 0 1.5443-.7325 1.4993-1.5955-.2296-4.3348-2.3664-8.0292-6.483-9.3688z" />
  </svg>
);

const Pingu = ({ className = '' }) => (
  <div className={className}>
    <Mascot mood="normal" pack="pingu" color="#333333" />
  </div>
);

const Step = ({ n, dark = false }) => (
  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${dark ? 'text-black' : 'bg-black text-white'}`} style={dark ? { background: LILAC } : {}}>
    {n}
  </span>
);

const Pill = ({ children }) => (
  <span className="bg-black text-white text-[9px] font-black font-display px-2 py-1 rounded-md tracking-wide">{children}</span>
);

const parseBR = (s) => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0;
const fmtMoney = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTime = (h) => {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return hh === 0 ? `${mm}min` : `${hh}h${String(mm).padStart(2, '0')}`;
};

export default function Home({ onLogin }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const [income, setIncome] = useState('3.500');
  const [hours, setHours] = useState('220');
  const [extra, setExtra] = useState('250');

  const rate = parseBR(hours) ? parseBR(income) / parseBR(hours) : 0;
  const toTime = (v) => (rate ? fmtTime(v / rate) : '—');

  const faqs = [
    { q: 'Quando será o lançamento do moneo?', a: 'Estamos em fase final de testes. O lançamento oficial está previsto para o próximo mês.' },
    { q: 'O moneo será pago?', a: 'O plano básico será gratuito para sempre. Teremos planos premium com recursos avançados no futuro.' },
    { q: 'O moneo é um banco?', a: 'Não. O moneo é uma ferramenta de organização financeira. Nós não movimentamos seu dinheiro.' },
    { q: 'Preciso conectar minha conta bancária?', a: 'Não é obrigatório. Você pode anotar seus gastos manualmente. A conexão serve apenas para facilitar.' },
    { q: 'Funciona no iPhone e no Android?', a: 'Sim! Será um PWA (Aplicativo Web Progressivo), então funcionará perfeitamente em qualquer celular.' },
    { q: 'Como funcionam os comentários do pingu?', a: 'O pingu analisa seus gastos e manda mensagens divertidas e úteis baseadas no seu ritmo.' },
    { q: 'Como vocês cuidam dos meus dados?', a: 'Seus dados são criptografados e armazenados com segurança. Nós não vendemos suas informações para ninguém.' },
  ];

  const txs = [
    { Icon: Utensils, name: 'iFood', cat: 'Delivery', val: '-R$ 38,90' },
    { Icon: ShoppingCart, name: 'Mercado', cat: 'Mercado', val: '-R$ 186,30' },
    { Icon: Car, name: 'Uber', cat: 'Transporte', val: '-R$ 23,10' },
  ];

  const StoreButton = ({ Icon, small, big }) => (
    <button
      onClick={onLogin}
      className="group flex items-center justify-center sm:justify-start gap-3 bg-black text-white w-full sm:w-auto px-5 sm:pr-7 h-[64px] rounded-[20px] hover:bg-[#222] hover:-translate-y-0.5 transition-all shadow-lg"
    >
      <Icon />
      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-medium text-gray-400 mb-1">{small}</span>
        <span className="text-base font-bold tracking-tight">{big}</span>
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-[#111] font-sans selection:bg-[#C4B5FD] selection:text-black overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <div className="bg-white  rounded-2xl px-3 py-2 flex items-center justify-between w-full max-w-[840px] shadow-sm">
          <span className="font-black text-xl tracking-tighter pl-3">moneo.</span>
          <div className="hidden md:flex gap-5 text-xs font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-black transition">Como funciona</a>
            <a href="#recursos" className="hover:text-black transition">Recursos</a>
            <a href="#horas" className="hover:text-black transition">Horas</a>
            <a href="#faq" className="hover:text-black transition">Dúvidas</a>
          </div>
          <button onClick={onLogin} className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#222] transition">Entrar</button>
        </div>
      </nav>

      {/* HERO (centralizado) */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[70%] h-[80%] bg-gradient-to-bl from-[#C4B5FD] via-[#DDD6FE] to-transparent rounded-full blur-[110px] opacity-70 pointer-events-none" />
        <div className="absolute top-[10%] left-[-15%] w-[45%] h-[50%] bg-gradient-to-br from-white to-transparent rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
          <h1 className="text-7xl md:text-[120px] font-black leading-[0.85] tracking-tighter">moneo.</h1>
          <p className="text-lg text-gray-600 max-w-md">
            Dois toques por gasto e você sabe na hora quanto ainda dá pra gastar no mês. <b className="text-black">Sem planilha, sem susto na fatura.</b>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-sm sm:max-w-none sm:w-auto">
            <StoreButton Icon={AppleIcon} small="Baixe agora para" big="iOS" />
            <StoreButton Icon={AndroidIcon} small="Baixe agora para" big="Android" />
          </div>
        </div>

        {/* TELEFONE */}
        <div className="relative flex justify-center shrink-0">
          <div className="relative w-[290px] h-[590px] bg-white rounded-[46px] border-[9px] border-[#111] shadow-2xl">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#111] rounded-full z-20" />

            <div className="w-full h-full rounded-[36px] overflow-hidden flex flex-col px-4 pt-3 relative">
              <div className="flex justify-between items-center text-[10px] font-bold px-2 mb-5">
                <span>9:41</span>
                <span className="flex items-center gap-1"><Signal size={11} /><Wifi size={11} /><BatteryFull size={14} /></span>
              </div>
              <p className="text-xs font-bold ml-1 mb-1">Novembro</p>

              <div className="w-40 h-40 mx-auto relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rotate-[135deg]">
                  <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E4DCFE" /><stop offset="100%" stopColor={PURPLE} /></linearGradient></defs>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="7" strokeDasharray="212 283" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#ring)" strokeWidth="7" strokeDasharray="165 283" strokeLinecap="round" />
                </svg>
                <Pingu className="w-24 h-24" />
              </div>

              <p className="text-center text-[10px] text-gray-500 mt-2">Pode gastar no mês</p>
              <p className="text-center text-4xl font-black tracking-tighter font-display">R$ 612</p>
              <p className="text-center text-[9px] text-gray-500 mt-1 flex items-center justify-center gap-2">R$ 51 por dia <Pill>NO RITMO</Pill></p>

              <div className="bg-[#f2f2f2] rounded-2xl px-3 py-1 mt-4">
                {txs.map(({ Icon, name, cat, val }, i) => (
                  <div key={name} className={`flex items-center justify-between py-2.5 ${i < txs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center"><Icon size={13} /></div>
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold">{name}</p>
                        <p className="text-[9px] text-gray-400">{cat}</p>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold">{val}</p>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-[#f2f2f2] rounded-full h-12 flex items-center justify-around px-3 text-gray-500">
                <HomeIcon size={16} className="text-black" />
                <List size={16} />
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white"><Plus size={18} /></div>
                <PiggyBank size={16} />
                <User size={16} />
              </div>
            </div>

            {/* Notificações flutuantes */}
            <div className="absolute top-24 -right-20 bg-white p-3 rounded-2xl shadow-xl w-44 rotate-[3deg] z-30 hidden sm:block">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-bold">moneo.</p>
                <span className="text-[9px] text-gray-400 ml-auto">agora</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-tight">Bem-vindo. Já vi seu extrato. Brincadeira.</p>
            </div>

            <div className="absolute top-[250px] -left-20 bg-white p-3 rounded-2xl shadow-xl w-44 -rotate-[4deg] z-30 hidden sm:block">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-bold">moneo.</p>
                <span className="text-[9px] text-gray-400 ml-auto">2 min</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-tight">Mercado já tá em 85%. Eu vi, viu.</p>
            </div>

            <div className="absolute bottom-6 -right-12 bg-white p-4 rounded-2xl shadow-xl w-40 rotate-[3deg] z-30 hidden sm:block">
              <p className="text-[10px] text-gray-400">Pode gastar hoje</p>
              <p className="text-3xl font-black font-display tracking-tighter">R$ 51</p>
              <div className="h-1.5 rounded-full mt-1" style={{ background: LILAC }} />
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-6 max-w-[880px] mx-auto">
        <h2 className="text-6xl md:text-[88px] font-black uppercase leading-[0.88] tracking-tighter font-display mb-5">
          Anota em<br />dois toques.
        </h2>
        <p className="text-gray-600 text-sm max-w-sm mb-10">
          Nada de planilha, nada de categoria pra configurar. Você conta o que gastou e o moneo faz a conta do resto.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* 1 */}
          <div className="relative flex">
          <div className="relative flex-1 rounded-[28px] p-3.5 pb-6 bg-gradient-to-br from-[#f7f7f7] via-[#e9e7ee] to-[#e6e6e8] overflow-hidden min-h-[260px]">
            <div className="absolute inset-0 bg-gradient-to-bl from-[#C4B5FD] via-[#DDD6FE]/50 to-transparent opacity-80 pointer-events-none" />
            <div className="relative bg-white rounded-3xl p-4 shadow-lg">
              <div className="flex bg-[#f2f2f2] rounded-full p-1 mb-5">
                <span className="flex-1 text-center py-1.5 bg-white rounded-full text-[11px] font-bold shadow-sm">Gasto</span>
                <span className="flex-1 text-center py-1.5 text-[11px] font-bold text-gray-400">Receita</span>
              </div>
              <p className="text-4xl font-black text-center tracking-tighter font-display mb-5">R$ 38,90</p>
              <div className="flex justify-center gap-2.5">
                <div className="w-9 h-9 bg-[#111] text-white rounded-full flex items-center justify-center"><Utensils size={14} /></div>
                {[ShoppingCart, Car, PartyPopper].map((I, i) => (
                  <div key={i} className="w-9 h-9 bg-[#f2f2f2] text-gray-700 rounded-full flex items-center justify-center"><I size={14} /></div>
                ))}
              </div>
            </div>
            <div className="relative px-2 pt-5">
              <h3 className="font-bold text-sm flex items-center gap-2"><Step n={1} /> Digita o valor</h3>
              <p className="text-xs text-gray-500 mt-2">A categoria já vem sugerida. Salvou, foi.</p>
            </div>
          </div>
            <div className="absolute -top-3 -right-3 z-20 text-black px-3 py-1.5 rounded-xl text-[11px] font-black font-display rotate-6" style={{ background: LILAC }}>2 TOQUES</div>
          </div>

          {/* 2 */}
          <div className="relative rounded-[28px] p-3.5 pb-6 bg-white shadow-sm min-h-[260px]">
            <div className="rounded-3xl p-4 shadow-lg bg-white">
              <p className="text-[11px] text-gray-500 ml-1">Pode gastar no mês</p>
              <p className="text-4xl font-black tracking-tighter font-display mb-4">R$ 612</p>
              <div className="h-1.5 bg-[#f2f2f2] rounded-full relative mb-3">
                <div className="absolute inset-y-0 left-0 w-[60%] bg-black rounded-full" />
                <div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-gray-500 left-[60%]" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500">
                <span>R$ 51 por dia</span><Pill>NO RITMO</Pill>
              </div>
            </div>
            <div className="px-2 pt-5">
              <h3 className="font-bold text-sm flex items-center gap-2"><Step n={2} /> Vê quanto ainda dá</h3>
              <p className="text-xs text-gray-500 mt-2">Quanto sobra no mês e quanto dá por dia, sempre atualizado.</p>
            </div>
            <div className="absolute -top-3 -right-3 z-20 bg-black text-white px-3 py-1.5 rounded-xl text-[11px] font-black font-display -rotate-6">QUANTO DÁ?</div>
          </div>

          {/* 3 */}
          <div className="relative rounded-[28px] p-3.5 pb-6 text-white min-h-[260px]" style={{ background: '#0a0a0a' }}>
            <div className="rounded-2xl bg-[#1c1c1e] p-4 h-[150px]">
              <div className="text-black text-xs rounded-2xl rounded-bl-md px-3 py-2.5 w-fit max-w-[90%] mb-5 font-medium" style={{ background: LILAC }}>
                Bar já tá em 85%. Sextou demais, hein.
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#2c2c2e] rounded-full flex items-center justify-center"><Beer size={13} /></div>
                <div className="flex-1 h-1.5 bg-white/15 rounded-full"><div className="h-full rounded-full w-[85%]" style={{ background: LILAC }} /></div>
                <span className="text-[11px] font-bold" style={{ color: LILAC }}>85%</span>
              </div>
            </div>
            <div className="px-2 pt-5">
              <h3 className="font-bold text-sm flex items-center gap-2"><Step n={3} dark /> Ele avisa antes</h3>
              <p className="text-xs text-gray-400 mt-2">Chegou perto do limite, o pingu fala. Do jeito dele.</p>
            </div>
            <div className="absolute -top-3 -right-3 z-20 text-black px-3 py-1.5 rounded-xl text-[11px] font-black font-display rotate-6" style={{ background: LILAC }}>EITA</div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-20 px-6 max-w-[880px] mx-auto">
        <h2 className="text-6xl md:text-[88px] font-black uppercase leading-[0.88] tracking-tighter font-display mb-10">
          Tudo o que<br />precisa.
        </h2>

        <div className="grid md:grid-cols-[1.35fr_1fr_1fr] gap-4">
          {/* Grande: 612 */}
          <div className="relative flex md:row-span-2">
          <div className="relative flex-1 rounded-[28px] p-4 bg-gradient-to-br from-[#f7f7f7] via-[#e9e7ee] to-[#e6e6e8] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-[#C4B5FD] via-[#DDD6FE]/50 to-transparent opacity-80 pointer-events-none" />
            <div className="relative bg-white rounded-3xl p-5 shadow-lg min-h-[240px] flex flex-col justify-end">
              <Pingu className="absolute top-4 right-6 w-20 h-20" />
              <p className="text-xs text-gray-500">Pode gastar no mês</p>
              <p className="text-[88px] leading-[0.95] font-black tracking-tighter font-display mb-3">R$ 612</p>
              <div className="h-1.5 bg-[#f2f2f2] rounded-full relative mb-2">
                <div className="absolute inset-y-0 left-0 w-[55%] bg-black rounded-full" />
                <div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-gray-500 left-[56%]" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500">
                <span>R$ 51 por dia · faltam 12 dias</span><Pill>NO RITMO</Pill>
              </div>
            </div>
            <div className="relative px-2 pt-5 pb-1">
              <h3 className="font-bold text-lg">Um número, não dez</h3>
              <p className="text-xs text-gray-500 mt-1.5 max-w-xs">Teto do mês, menos o que já foi, menos os fixos que faltam. Dividido pelos dias que restam.</p>
            </div>
          </div>
            <div className="absolute -top-3 -right-3 z-20 text-black px-3 py-1.5 rounded-xl text-[11px] font-black font-display rotate-6" style={{ background: LILAC }}>1 NÚMERO</div>
          </div>

          {/* Ritmo */}
          <div className="bg-white rounded-[24px] p-3 shadow-sm">
            <div className="bg-[#f2f2f2] rounded-2xl p-3">
              <p className="text-[10px] text-gray-500 flex items-center gap-1.5">Já foi <b className="text-2xl text-black font-display tracking-tight">40%</b> <span className="text-[7px] font-black px-1.5 py-0.5 rounded" style={{ background: LILAC }}>ACELERADO</span></p>
              <div className="h-1.5 bg-white rounded-full relative mt-2"><div className="absolute inset-y-0 left-0 w-[40%] bg-black rounded-full" /><div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-gray-500 left-[33%]" /></div>
              <p className="text-[8px] text-gray-400 mt-1 ml-[28%]">hoje</p>
              <p className="text-[8px] text-gray-400 mt-1">do teto, em 33% do mês</p>
            </div>
            <div className="px-1.5 pt-3 pb-1"><h4 className="font-bold text-xs">Ritmo do mês</h4><p className="text-[10px] text-gray-500 mt-1 leading-snug">Compara o que você gastou com quanto do mês já passou.</p></div>
          </div>

          {/* Limites */}
          <div className="bg-white rounded-[24px] p-3 shadow-sm">
            <div className="bg-[#f2f2f2] rounded-2xl p-3 flex flex-col gap-2.5">
              {[[Utensils, 92, LILAC], [Beer, 55, '#000'], [Shirt, 30, '#000']].map(([I, p, c], i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center"><I size={10} /></div>
                  <div className="flex-1 h-1 bg-white rounded-full"><div className="h-full rounded-full" style={{ width: `${p}%`, background: c }} /></div>
                  <span className="text-[9px] font-bold">{p}%</span>
                </div>
              ))}
            </div>
            <div className="px-1.5 pt-3 pb-1"><h4 className="font-bold text-xs">Limite só onde dói</h4><p className="text-[10px] text-gray-500 mt-1 leading-snug">Delivery, bar, compras. Aviso em 80% e em 100%.</p></div>
          </div>

          {/* Fatura */}
          <div className="bg-white rounded-[24px] p-3 shadow-sm">
            <div className="bg-[#f2f2f2] rounded-2xl p-2.5 flex flex-col gap-2">
              <div className="bg-white rounded-lg px-2.5 py-1.5 flex justify-between items-center"><div><p className="text-[9px] font-bold">Dezembro</p><p className="text-[7px] text-gray-400">fatura fecha dia 28</p></div><b className="text-[9px]">R$ 1.240</b></div>
              <div className="bg-white rounded-lg px-2.5 py-1.5 flex justify-between items-center"><div><p className="text-[9px] font-bold">Tênis</p><p className="text-[7px] text-gray-400">parcela 3/10</p></div><b className="text-[9px]">R$ 39,90</b></div>
            </div>
            <div className="px-1.5 pt-3 pb-1"><h4 className="font-bold text-xs">Fatura e parcelas</h4><p className="text-[10px] text-gray-500 mt-1 leading-snug">Comprou em 10x? Cada parcela cai na fatura certa.</p></div>
          </div>

          {/* Fixos */}
          <div className="bg-white rounded-[24px] p-3 shadow-sm">
            <div className="bg-[#f2f2f2] rounded-2xl p-2.5 flex flex-col gap-2">
              <div className="bg-white rounded-lg px-2.5 py-1.5 flex justify-between items-center"><div><p className="text-[9px] font-bold">Aluguel</p><p className="text-[7px] text-gray-400">todo dia 5</p></div><b className="text-[9px]">R$ 1.800</b></div>
              <div className="bg-white rounded-lg px-2.5 py-1.5 flex justify-between items-center"><div><p className="text-[9px] font-bold">Spotify</p><p className="text-[7px] text-gray-400">todo dia 12</p></div><b className="text-[9px]">R$ 21,90</b></div>
            </div>
            <div className="px-1.5 pt-3 pb-1"><h4 className="font-bold text-xs">Fixos uma vez só</h4><p className="text-[10px] text-gray-500 mt-1 leading-snug">Cadastra e eles entram todo mês.</p></div>
          </div>
        </div>
      </section>

      {/* HORAS */}
      <section id="horas" className="py-20 px-6 max-w-[880px] mx-auto">
        <div className="rounded-[28px] p-8 md:p-10 text-white grid md:grid-cols-2 gap-10 items-center" style={{ background: '#0a0a0a' }}>
          <div>
            <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.92] tracking-tighter font-display mb-6">
              Quanto<br />custa<br />
              <span className="text-black px-2 inline-block" style={{ background: LILAC }}>em</span><br />
              <span className="text-black px-2 inline-block" style={{ background: LILAC }}>horas</span><br />
              da sua<br />vida?
            </h2>
            <p className="text-gray-300 text-[11px] max-w-xs leading-relaxed mb-6">
              Coloca quanto você ganha e quantas horas trabalha. Todo gasto aparece também em tempo. R$ 38 parece pouco. Duas horas e meia, nem tanto. No app, todo gasto já aparece assim.
            </p>
            <div className="flex gap-3">
              <label className="bg-[#1c1c1e] rounded-xl px-3 py-2.5 flex-1 block">
                <span className="text-[9px] text-gray-400 block mb-1">Ganho por mês</span>
                <span className="flex items-center gap-2"><span className="text-xs text-gray-500">R$</span>
                  <input value={income} onChange={(e) => setIncome(e.target.value)} inputMode="decimal" className="bg-transparent outline-none font-bold text-sm w-full" /></span>
              </label>
              <label className="bg-[#1c1c1e] rounded-xl px-3 py-2.5 flex-1 block">
                <span className="text-[9px] text-gray-400 block mb-1">Horas por mês</span>
                <span className="flex items-center gap-2">
                  <input value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal" className="bg-transparent outline-none font-bold text-sm w-full" /><span className="text-xs text-gray-500">h</span></span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {[['Café da padaria', 9.5], ['Delivery da sexta', 38.9, true], ['A assinatura que você esqueceu', 44.9]].map(([label, v, hl]) => (
              <div key={label} className={`rounded-2xl px-4 py-3 flex justify-between items-center ${hl ? 'text-black' : 'bg-[#1c1c1e]'}`} style={hl ? { background: LILAC } : {}}>
                <div><p className={`text-[10px] ${hl ? 'opacity-70' : 'text-gray-400'}`}>{label}</p><p className="font-black font-display text-xl">R$ {fmtMoney(v)}</p></div>
                <p className="font-black font-display text-2xl" style={hl ? {} : { color: LILAC }}>{toTime(v)}</p>
              </div>
            ))}
            <div className="border border-dashed border-white/25 rounded-2xl px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-400 mb-1">E aquele gasto?</p>
                <div className="bg-[#1c1c1e] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 w-28">
                  <span className="text-[10px] text-gray-500">R$</span>
                  <input value={extra} onChange={(e) => setExtra(e.target.value)} inputMode="decimal" className="bg-transparent outline-none font-bold text-xs w-full" />
                </div>
              </div>
              <p className="font-black font-display text-2xl" style={{ color: LILAC }}>{toTime(parseBR(extra))}</p>
            </div>
            <button onClick={onLogin} className="mt-1 border border-white/70 text-white px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-2 hover:bg-white hover:text-black transition w-fit">
              <ArrowUpRight size={13} /> Entrar na minha conta
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 max-w-[880px] mx-auto">
        <h2 className="text-6xl md:text-[88px] font-black uppercase leading-[0.88] tracking-tighter font-display mb-10 text-center">
          Perguntas<br />frequentes.
        </h2>
        <div className="flex flex-col gap-2 max-w-[420px] mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold text-left">
                {faq.q}
                {faqOpen === i ? <Minus size={14} /> : <Plus size={14} />}
              </button>
              {faqOpen === i && <div className="px-4 pb-4 text-xs text-gray-500">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0a0a' }} className="text-white pt-8 pb-4 px-8 rounded-[28px] max-w-[832px] mx-4 md:mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
          <div>
            <h3 className="text-sm font-bold mb-4 max-w-[220px] leading-snug">Não tem uma conta?</h3>
            <button onClick={onLogin} className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[11px] hover:bg-gray-200 transition">Crie</button>
          </div>
          <div className="flex gap-14 text-[11px]">
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-3">Produto</p>
              <ul className="flex flex-col gap-2 font-medium">
                <li><a href="#como-funciona">Como funciona</a></li>
                <li><a href="#recursos">Recursos</a></li>
                <li><a href="#horas">Quanto custa em horas</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-3">Ajuda</p>
              <ul className="flex flex-col gap-2 font-medium">
                <li><a href="#faq">Perguntas frequentes</a></li>
                <li><a href="#">Privacidade</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-3 overflow-hidden">
          <span className="text-[22vw] md:text-[170px] font-black tracking-tighter leading-[0.8] -ml-1">moneo.</span>
        </div>
        <div className="border-t border-white/10 mt-2 pt-3 flex flex-col md:flex-row justify-between gap-2 text-[8px] text-gray-500">
          <span>© 2026 moneo.</span>
          <span>O moneo não é um banco e não guarda nem movimenta dinheiro.</span>
        </div>
      </footer>
    </div>
  );
}