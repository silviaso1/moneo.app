import { months } from '../store';
import { moneyShort, todayISO } from './format';

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

export default function buildMessages({ state, remaining, daysLeft, isCurrent, totalSaved }) {
  const list = [];
  const add = (p, t) => list.push({ p, t });

  const { categories, categorySpent, limit, spent, fixeds, paidFixed, openInvoices, monthTransactions, sobra, income } = state;
  const name = months[state.currentMonth].toLowerCase();
  const today = new Date();
  const day = today.getDate();
  const todayStr = todayISO();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const catName = (id) => categories.find((c) => c.id === id)?.name || 'Sem categoria';

  if (categories.length === 0) {
    add(60, 'Cria suas categorias em Ajustes que eu fico bem mais esperto.');
  }

  if (remaining < 0) {
    add(100, `Estourou o limite de ${name} em ${moneyShort(-remaining)}. Vou fingir que não vi. Mentira, vi sim.`);
  }

  categories.forEach((c) => {
    const v = categorySpent[c.id] || 0;
    const l = Number(c.limit) || 0;
    if (l <= 0) return;
    if (v > l) {
      add(95, `${c.name} estourou: ${moneyShort(v)} de ${moneyShort(l)}. Eu avisei. Tá, não avisei, mas pensei.`);
    } else if (pct(v, l) >= 80) {
      add(80, `${c.name} já tá em ${pct(v, l)}% do limite. Eu vi, viu.`);
    }
  });

  if (sobra < 0) {
    add(85, `A conta de ${name} tá no vermelho: sobra ${moneyShort(sobra)} contando fixos e dia a dia.`);
  }

  if (spent === 0) {
    add(isCurrent ? 60 : 20, `Nada gasto em ${name} ainda. Limite cheio: ${moneyShort(limit)}. Respira antes de abrir o iFood.`);
  } else {
    const top = categories
      .map((c) => ({ c, v: categorySpent[c.id] || 0 }))
      .sort((a, b) => b.v - a.v)[0];
    if (top && top.v > 0) {
      add(40, `Seu maior gasto em ${name} é ${top.c.name}: ${moneyShort(top.v)}, ${pct(top.v, spent)}% de tudo que você gastou.`);
    }
  }

  if (isCurrent && limit > 0 && spent > 0) {
    const elapsed = day / new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
    const usage = spent / limit;
    if (usage > elapsed + 0.05 && remaining >= 0) {
      add(78, `Você já usou ${Math.round(usage * 100)}% do limite e o mês só tá em ${Math.round(elapsed * 100)}%. Acelerou, hein.`);
    } else if (remaining >= 0) {
      add(35, `Tá no ritmo: ${Math.round(usage * 100)}% do limite usado com ${Math.round(elapsed * 100)}% do mês passado.`);
    }
  }

  if (isCurrent && remaining > 0 && daysLeft > 0) {
    add(50, `Dá pra gastar ${moneyShort(remaining / daysLeft)} por dia até o fim do mês.`);
  }

  if (isCurrent) {
    const todays = monthTransactions.filter((t) => t.type === 'expense' && !t.fixedId && t.date === todayStr);
    if (todays.length > 0) {
      const sum = todays.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const big = [...todays].sort((a, b) => b.amount - a.amount)[0];
      add(70, `Hoje você anotou ${todays.length} gasto${todays.length > 1 ? 's' : ''}: ${moneyShort(sum)}. O maior foi ${big.note || catName(big.categoryId)} (${moneyShort(big.amount)}).`);
    } else {
      add(30, 'Nada anotado hoje. Ou não gastou, ou tá escondendo.');
    }
  }

  const pending = fixeds.filter((f) => f.type !== 'income' && !paidFixed[f.id]);
  if (isCurrent) {
    pending.filter((f) => (f.day || 1) < day).slice(0, 3).forEach((f) => {
      add(90, `${f.name} era dia ${f.day} e ainda não foi marcado como pago.`);
    });
    pending.filter((f) => (f.day || 1) >= day && (f.day || 1) - day <= 3).slice(0, 3).forEach((f) => {
      add(75, `${f.name} vence ${f.day === day ? 'hoje' : `dia ${f.day}`}: ${moneyShort(f.amount)}.`);
    });
  } else if (pending.length > 0) {
    add(45, `Faltam ${pending.length} fixo${pending.length > 1 ? 's' : ''} pra marcar como pago em ${name}.`);
  }

  (openInvoices || []).forEach((inv) => {
    if (inv.total <= 0 || inv.closed) return;
    const days = Math.ceil((inv.close - startToday) / 86400000);
    if (days <= 5) {
      add(72, `A fatura do cartão ${inv.card.name} fecha em ${days <= 0 ? 'poucas horas' : `${days} dia${days > 1 ? 's' : ''}`}: ${moneyShort(inv.total)}.`);
    } else {
      add(33, `Fatura aberta do cartão ${inv.card.name}: ${moneyShort(inv.total)}.`);
    }
  });

  const toReceive = state.transactions
    .filter((t) => t.receivable && !t.received)
    .reduce((s, t) => s + (Number(t.receivableAmount) || 0), 0);
  if (toReceive > 0) {
    add(55, `Tem ${moneyShort(toReceive)} pra voltar pra você. Cobra aí, sem dó.`);
  }

  if (totalSaved > 0) {
    add(25, `Rendeu ${moneyShort(totalSaved)} em ${name}. O Skunk aprova.`);
  }

  if (income > 0) {
    add(20, `Entrou ${moneyShort(income)} em ${name} entre salário e receitas.`);
  }

  if (list.length === 0) {
    add(1, 'Tudo calmo por aqui. Anota um gasto que eu começo a opinar.');
  }

  return list.sort((a, b) => b.p - a.p).slice(0, 7).map((m) => m.t);
}