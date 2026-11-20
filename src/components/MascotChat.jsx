import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { money } from '../utils/format';
import { months, animeCatalog, mascotPacks } from '../store';
import Mascot from './Mascot';

// LISTA ESTENDIDA DE CONVERSAS
const QUICK = [
  'Quanto gastei este mês?',
  'E no ano?',
  'Vai cair algo?',
  'Tem algo pendente?',
  'Como está meu limite?',
  'Quais meus juros?',
  'Como estão minhas contas?',
  'Me dá uma dica',
  'Oi, tudo bem?',
  'Conte uma piada',
  'Quem é você?',
];

export default function MascotChat({ state, finance, onDownloadPDF }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const isAnime = state.animeTheme;
  const activePackId = isAnime ? `anime-${state.animeCharacter || 'gojo'}` : state.mascotPack;
  const activeName = isAnime 
    ? (animeCatalog[state.animeId]?.characters[state.animeCharacter]?.name || 'Gojo')
    : (mascotPacks[state.mascotPack]?.name || 'Mascote');

  // Define a mensagem inicial baseada no humor
  useEffect(() => {
    if (messages.length === 0) {
      let greeting = `Oi! Eu sou o ${activeName}. Como posso ajudar com suas finanças?`;
      if (finance.mascotState === 'sad') greeting = `Hmm... as coisas não estão boas hoje. O que você quer saber?`;
      if (finance.mascotState === 'angry') greeting = `Cuidado com os gastos! O que precisa?`;
      if (finance.mascotState === 'happy') greeting = `Tudo ótimo por aqui! Vamos ver os números?`;
      
      setMessages([{ from: 'mascot', text: greeting }]);
    }
  }, [activeName, finance.mascotState, messages.length]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const answerFor = (q) => {
    const t = q.toLowerCase();
    // O pulo do gato: se achar UMA palavra-chave na frase inteira, ele responde.
    const has = (...words) => words.some(w => t.includes(w));

    // 1. SAUDAÇÕES E BRINCADEIRAS
    if (has('oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'eae')) {
      const res = {
        normal: `Oi! Tudo bem? Pronto para organizar as finanças?`,
        happy: `Oii! Tudo ótimo! Tô muito feliz com seus números!`,
        sad: `Oi... tô meio pra baixo com esses gastos, mas vamos lá.`,
        angry: `Oi. Espero que não seja para gastar mais.`
      };
      return res[finance.mascotState] || res.normal;
    }
    
    if (has('quem é você', 'seu nome', 'qual seu nome')) {
      return `Eu sou o ${activeName}. Seu parceiro financeiro.`;
    }
    
    if (has('piada', 'engraçado', 'engracado', 'brincadeira', 'humor')) {
      const jokes = [
        "Por que o cartão de crédito foi ao médico? Porque estava com a fatura estourada!",
        "O que o dinheiro disse para o bolso? Tô indo embora!",
        "Qual é o cúmulo do investidor? Comprar um carro e achar que é uma ação."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // 2. PERSONALIDADE ANIME
    if (isAnime) {
      if (state.animeCharacter === 'gojo') {
        if (has('forte', 'melhor', 'top', 'ganhar', 'win', 'fraco')) return "Nah, I'd win. Eu sou o mais forte. Seus gastos estão sob controle?";
        if (has('aluno', 'ensinar', 'escola', 'satoru')) return "Meus alunos são o futuro. Diferente dos seus gastos que parecem precisar de umas férias.";
      }
      if (state.animeCharacter === 'geto') {
        if (has('mundo', 'humano', 'podre', 'macaco')) return "O mundo dos humanos é podre. Assim como seus gastos supérfluos. Deveríamos eliminar o desperdício.";
        if (has('amigo', 'gojo', 'satoru', 'melhor amigo')) return "Satoru... ele era meu melhor amigo. Agora, foque nos seus números.";
      }
    }

    // 3. FINANÇAS (RESPOSTAS FLEXÍVEIS)
    if (has('mês', 'mes', 'mensal', 'gastei', 'gasto', 'gastando')) {
      const rest = state.limit - state.spent;
      return `Em ${months[state.currentMonth].toLowerCase()} você já gastou ${money(state.spent)}. Seu limite é ${money(state.limit)}. ${rest >= 0 ? `Ainda sobram ${money(rest)}.` : `Você estourou em ${money(Math.abs(rest))}.`}`;
    }
    
    if (has('ano', 'anual', 'guardei', 'juros', 'investimento', 'investi')) {
      return `Neste ano você já guardou ${money(state.yearSaved)}. No mês atual os juros foram de ${money(state.monthInvestments.reduce((s, i) => s + Number(i.amount || 0), 0))}.`;
    }
    
    if (has('cair', 'receber', 'entrar', 'salário', 'salario')) {
      const inc = state.fixeds.filter((f) => f.type === 'income');
      const total = inc.reduce((s, f) => s + Number(f.amount || 0), 0);
      return total > 0 ? `Sim! Você tem ${money(total)} em receitas fixas previstas para este mês: ${inc.map((f) => f.name).join(', ')}.` : 'Não encontrei receitas fixas cadastradas para este mês.';
    }
    
    if (has('pendente', 'pagar', 'fixo', 'conta', 'boleto')) {
      const pend = state.fixeds.filter((f) => f.type !== 'income' && !state.paidFixed[f.id]);
      if (pend.length === 0) return 'Tudo em dia! Nenhum fixo pendente este mês. Bom trabalho!';
      return `Você tem ${pend.length} fixo(s) pendente(s): ${pend.map((f) => f.name).join(', ')}. Total de ${money(pend.reduce((s, f) => s + Number(f.amount || 0), 0))}.`;
    }
    
    if (has('limite', 'orçamento', 'orcamento', 'estourou')) {
      const rest = state.limit - state.spent;
      return `Seu limite total é ${money(state.limit)}. Você já usou ${money(state.spent)}. ${rest >= 0 ? `Sobra ${money(rest)}.` : `Estourou ${money(Math.abs(rest))}.`}`;
    }

    if (has('conta', 'saldo', 'banco')) {
      const total = state.accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
      return `O saldo total nas suas contas é de ${money(total)}. Você tem ${state.accounts.length} conta(s).`;
    }

    if (has('dica', 'conselho', 'ajuda', 'como')) {
      return 'Dica: tente manter os gastos do dia a dia abaixo de 60% do limite. Assim não passa aperto no fim do mês.';
    }

    // 4. FALLBACK (Se não entender nada, tenta pelo menos ser educado)
    return `Hmm, não entendi exatamente, mas se quiser saber sobre gastos, limites, contas ou juros, é só me perguntar!`;
  };

  const send = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setMessages((m) => [...m, { from: 'user', text: q }, { from: 'mascot', text: answerFor(q) }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[75vh] gap-3">
      {/* MASCOTE NO TOPO */}
      <div className="flex flex-col items-center justify-center shrink-0 pt-2 pb-2">
        <div className="w-28 h-28">
          <Mascot mood={finance.mascotState} pack={activePackId} custom={state.customMascots} color={state.mascotColor} />
        </div>
        <p className="text-sm font-bold text-gray-500 mt-2">{activeName}</p>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 pr-1 pb-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === 'user' ? 'self-end bg-black text-white' : 'self-start bg-[var(--accent-soft)] text-[var(--accent-text)]'}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* LISTA DE ATALHOS */}
      <div className="flex flex-wrap gap-1.5 shrink-0">
        {QUICK.map((q) => (
          <button key={q} onClick={() => send(q)} className="text-xs px-2.5 py-1.5 rounded-full bg-[#f2f2f2] text-gray-700 font-medium hover:bg-[var(--accent-soft)] transition">
            {q}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 pt-2 border-t border-gray-100 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Pergunte algo..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[var(--accent-from)]"
        />
        <button onClick={() => send()} className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center" title="Enviar">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}