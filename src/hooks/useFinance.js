import { useEffect, useMemo, useState } from 'react';
import {
  collection, doc, onSnapshot, setDoc, addDoc, deleteDoc,
  writeBatch, increment,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { defaultCategories } from '../store';
import { todayISO } from '../utils/format';
import { monthKey, pad, fixedAt, deactivate, reactivate } from '../utils/fixeds';
import { fileToDataUrl } from '../utils/image';

// Rendimentos somam no saldo da conta escolhida? (mude para false se não quiser)
const INVESTMENT_AFFECTS_BALANCE = true;

const defaults = {
  followCursor: true,
  hideSaved: false,
  hideTotalBalance: false,
  showAllAccounts: false,
  totalLimit: null,
  totalLimits: null,
  shortcuts: null,
  navItems: null,
  mascotPack: 'skunk',
  themeColor: 'purple',
  familyMode: false,
  familyId: null,
  monthlyIncome: 0,
  monthlyHours: 0,
  investmentTypes: null,
};

const COLS = ['accounts', 'transactions', 'investments', 'categories', 'fixeds', 'cards', 'mascots'];

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const sum = (arr, fn) => arr.reduce((s, x) => s + (Number(fn(x)) || 0), 0);
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(String(b.name));

// limite da categoria vale do mês em que foi definido pra frente (não retroativo)
const limitFor = (c, key) => {
  const h = c.limits || {};
  const ks = Object.keys(h).filter((k) => k <= key).sort();
  return ks.length ? Number(h[ks[ks.length - 1]]) || 0 : Number(c.limit) || 0;
};

// limite total do mês: vale do mês em que foi definido pra frente (não retroativo)
// null = usar a soma das categorias
const totalLimitFor = (s, key) => {
  const h = s.totalLimits || {};
  const ks = Object.keys(h).filter((k) => k <= key).sort();
  if (ks.length) {
    const v = h[ks[ks.length - 1]];
    return v == null ? null : Number(v) || 0;
  }
  return s.totalLimit != null ? Number(s.totalLimit) || 0 : null; // valor antigo, sem mês
};

const invAmt = (i) => Number(i?.amount ?? i?.value ?? 0) || 0;
const invAcc = (i) => i?.accountId ?? i?.account ?? null;
const invPeriod = (i) => {
  if (i.year != null && i.month != null) return { y: i.year, m: i.month };
  const d = i.createdAt ? new Date(i.createdAt) : new Date();
  return { y: d.getFullYear(), m: d.getMonth() };
};

// ---------- faturas de cartão ----------
const clampDay = (y, m, d) => Math.min(d, new Date(y, m + 1, 0).getDate());

// data de fechamento do ciclo em que uma compra (YYYY-MM-DD) cai
const closeDateFor = (card, dateStr) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const cd = Number(card.closingDay) || 1;
  let mm = m - 1;
  let yy = y;
  if (d > clampDay(yy, mm, cd)) {
    mm += 1;
    if (mm > 11) { mm = 0; yy += 1; }
  }
  return new Date(yy, mm, clampDay(yy, mm, cd));
};

const dueDateFor = (card, close) => {
  const dd = Number(card.dueDay) || 1;
  let mm = close.getMonth();
  let yy = close.getFullYear();
  if (dd <= (Number(card.closingDay) || 1)) {
    mm += 1;
    if (mm > 11) { mm = 0; yy += 1; }
  }
  return new Date(yy, mm, clampDay(yy, mm, dd));
};

const invoiceFor = (card, close, transactions, start) => {
  const items = transactions
    .filter((t) => t.cardId === card.id && t.type === 'expense' && t.date && closeDateFor(card, t.date).getTime() === close.getTime())
    .sort((x, y) => String(y.date).localeCompare(String(x.date)));
  const total = items.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  return { card, close, due: dueDateFor(card, close), items, total, closed: close < start };
};

const startOfToday = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

export default function useFinance() {
  const { user } = useAuth();
  const uid = user?.uid;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [data, setData] = useState({
    accounts: [], transactions: [], investments: [], categories: [], fixeds: [], cards: [], mascots: [],
  });
  const [settings, setSettings] = useState(defaults);
  const [ready, setReady] = useState({});

  const key = monthKey(year, month);

  const familyMode = !!settings.familyMode && !!settings.familyId;
  const baseRoot = familyMode ? 'families' : 'users';
  const baseId = familyMode ? settings.familyId : uid;

  const col = (n) => collection(db, baseRoot, baseId, n);
  const dref = (n, id) => doc(db, baseRoot, baseId, n, id);

  const hourlyRate = settings.monthlyHours > 0
    ? settings.monthlyIncome / settings.monthlyHours
    : 0;

  const totalLimit = totalLimitFor(settings, key);

  useEffect(() => {
    if (!uid || !baseId) return;
    setReady({});
    const mark = (k) => setReady((r) => ({ ...r, [k]: true }));

    const sub = (name) =>
      onSnapshot(
        collection(db, baseRoot, baseId, name),
        (snap) => {
          setData((d) => ({ ...d, [name]: snap.docs.map((x) => ({ id: x.id, ...x.data() })) }));
          mark(name);
        },
        (err) => { console.error(name, err); mark(name); }
      );

    const unsubs = COLS.map(sub);

    unsubs.push(
      onSnapshot(doc(db, baseRoot, baseId), async (snap) => {
        const d = snap.data() || {};
        setSettings((prev) => ({
          ...defaults, ...d,
          familyMode: prev.familyMode,
          familyId: prev.familyId,
          monthlyIncome: familyMode ? prev.monthlyIncome : (d.monthlyIncome || 0),
          monthlyHours: familyMode ? prev.monthlyHours : (d.monthlyHours || 0),
        }));
        mark('user');
        if (!d.seeded && !familyMode) {
          const b = writeBatch(db);
          defaultCategories.forEach(({ id, ...rest }) => b.set(doc(db, 'users', uid, 'categories', id), rest));
          b.set(doc(db, 'users', uid), { seeded: true }, { merge: true });
          try { await b.commit(); } catch (e) { console.error(e); }
        }
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [uid, baseRoot, baseId, familyMode]);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const d = snap.data() || {};
      setSettings((prev) => ({
        ...prev,
        familyMode: !!d.familyMode,
        familyId: d.familyId || null,
        monthlyIncome: d.monthlyIncome || 0,
        monthlyHours: d.monthlyHours || 0,
      }));
    });
    return unsub;
  }, [uid]);

  const loading = !!uid && ![...COLS, 'user'].every((k) => ready[k]);

  const accounts = useMemo(() => [...data.accounts].sort(byOrder), [data.accounts]);
  const categories = useMemo(
    () => data.categories.map((c) => ({ ...c, limit: limitFor(c, key) })).sort(byOrder),
    [data.categories, key]
  );
  const cards = useMemo(() => [...data.cards].sort(byOrder), [data.cards]);
  const customMascots = useMemo(
    () => Object.fromEntries(data.mascots.map((m) => [m.id, m.src])),
    [data.mascots]
  );

  const activeFixeds = useMemo(
    () => data.fixeds.map((f) => fixedAt(f, key)).filter(Boolean).sort((a, b) => (a.day || 1) - (b.day || 1)),
    [data.fixeds, key]
  );

  // fixos desativados neste mês (já existiam, mas não valem para o mês exibido)
  const inactiveFixeds = useMemo(
    () => data.fixeds
      .filter((f) => !fixedAt(f, key))
      .map((f) => {
        const vs = [...(f.versions || [])].sort((x, y) => String(x.from).localeCompare(String(y.from)));
        if (!vs.length || String(vs[0].from) > key) return null; // ainda não começou
        const v = [...vs].reverse().find((x) => String(x.from) <= key) || vs[vs.length - 1];
        return { ...v, id: f.id };
      })
      .filter(Boolean),
    [data.fixeds, key]
  );

  const monthTransactions = useMemo(
    () => data.transactions
      .filter((t) => t.month === month && t.year === year)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.createdAt || 0) - (a.createdAt || 0)),
    [data.transactions, month, year]
  );

  const monthInvestments = useMemo(
    () => data.investments.filter((i) => {
      const p = invPeriod(i);
      return p.y === year && p.m === month;
    }),
    [data.investments, month, year]
  );

  const yearSaved = useMemo(
    () => sum(data.investments.filter((i) => invPeriod(i).y === year), invAmt),
    [data.investments, year]
  );

  const yearByMonth = useMemo(() => {
    const arr = Array(12).fill(0);
    data.investments.forEach((i) => {
      const p = invPeriod(i);
      if (p.y === year) arr[p.m] += invAmt(i);
    });
    return arr;
  }, [data.investments, year]);

  // uma fatura por cartão: a que fecha no mês exibido
  const invoices = useMemo(() => {
    const start = startOfToday();
    return cards.map((card) => {
      const close = new Date(year, month, clampDay(year, month, Number(card.closingDay) || 1));
      return invoiceFor(card, close, data.transactions, start);
    });
  }, [cards, data.transactions, month, year]);

  // fatura aberta de cada cartão (a que ainda vai fechar), só se tiver compras
  const openInvoices = useMemo(() => {
    const start = startOfToday();
    const todayStr = todayISO();
    return cards
      .map((card) => invoiceFor(card, closeDateFor(card, todayStr), data.transactions, start))
      .filter((inv) => inv.total > 0);
  }, [cards, data.transactions]);

  const calc = useMemo(() => {
    const eff = (t) => (Number(t.amount) || 0) - (t.receivable ? Number(t.receivableAmount) || 0 : 0);

    const dailyExp = monthTransactions.filter((t) => t.type === 'expense' && !t.fixedId);
    const dailySpent = sum(dailyExp, eff);
    const dailyHours = hourlyRate > 0 ? dailySpent / hourlyRate : 0;

    const categorySpent = {};
    const addCat = (id, v) => { const k = id || '_none'; categorySpent[k] = (categorySpent[k] || 0) + v; };
    dailyExp.forEach((t) => addCat(t.categoryId, eff(t)));

    const fixedExp = activeFixeds.filter((f) => f.type !== 'income');
    fixedExp.forEach((f) => addCat(f.categoryId, Number(f.amount) || 0));

    const fixedExpenseTotal = sum(fixedExp, (f) => f.amount);
    const fixedIncomeTotal = sum(activeFixeds.filter((f) => f.type === 'income'), (f) => f.amount);

    const spent = dailySpent + fixedExpenseTotal;
    const hoursSpent = hourlyRate > 0 ? spent / hourlyRate : 0;

    const categoriesLimit = sum(categories, (c) => c.limit);
    const limit = totalLimit != null ? totalLimit : categoriesLimit;

    const paidFixed = {};
    data.transactions.forEach((t) => {
      if (!t.fixedId) return;
      const k = t.fixedKey != null ? t.fixedKey : monthKey(t.year, t.month);
      if (k === key) paidFixed[t.fixedId] = t;
    });

    const extraIncome = sum(
      monthTransactions.filter((t) => t.type === 'income' && !t.fixedId && !t.reimbursementOf),
      (t) => t.amount
    );
    const income = extraIncome + fixedIncomeTotal;
    const sobra = income - fixedExpenseTotal - dailySpent;

    return { dailySpent, dailyHours, spent, hoursSpent, limit, categoriesLimit, categorySpent, paidFixed, fixedIncomeTotal, fixedExpenseTotal, income, sobra };
  }, [monthTransactions, data.transactions, key, categories, activeFixeds, totalLimit, hourlyRate]);

  const remaining = calc.limit - calc.spent;
  const percent = calc.limit > 0 ? Math.min(100, (calc.spent / calc.limit) * 100) : calc.spent > 0 ? 100 : 0;
  const totalBalance = sum(accounts, (a) => a.balance);
  const totalSaved = sum(monthInvestments, invAmt);

  const anyCategoryOver = categories.some(
    (c) => Number(c.limit) > 0 && (calc.categorySpent[c.id] || 0) > Number(c.limit)
  );
  const mascotState =
    remaining < 0 ? 'sad' : anyCategoryOver ? 'angry' : calc.spent > 0 && percent <= 50 ? 'happy' : 'normal';

  const state = {
    ...settings,
    totalLimit, // já resolvido para o mês exibido
    hourlyRate,
    customMascots,
    currentMonth: month,
    currentYear: year,
    monthKey: key,
    accounts,
    categories,
    cards,
    fixeds: activeFixeds,
    inactiveFixeds,
    yearByMonth,
    transactions: data.transactions,
    monthTransactions,
    investments: data.investments,
    monthInvestments,
    yearSaved,
    invoices,
    openInvoices,
    limit: calc.limit,
    categoriesLimit: calc.categoriesLimit,
    spent: calc.spent,
    dailySpent: calc.dailySpent,
    dailyHours: calc.dailyHours,
    hoursSpent: calc.hoursSpent,
    income: calc.income,
    sobra: calc.sobra,
    fixedIncomeTotal: calc.fixedIncomeTotal,
    fixedExpenseTotal: calc.fixedExpenseTotal,
    categorySpent: calc.categorySpent,
    paidFixed: calc.paidFixed,
  };

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const update = (patch) => {
    const personalKeys = ['familyMode', 'familyId', 'monthlyIncome', 'monthlyHours'];
    const personal = {};
    const shared = {};
    Object.entries(patch).forEach(([k, v]) => {
      if (personalKeys.includes(k)) personal[k] = v;
      else shared[k] = v;
    });
    if (Object.keys(personal).length) setDoc(doc(db, 'users', uid), clean(personal), { merge: true });
    if (Object.keys(shared).length) setDoc(doc(db, baseRoot, baseId), clean(shared), { merge: true });
  };

  const addTransaction = async (type, d) => {
    const total = Number(d.amount) || 0;
    if (total <= 0) return;

    const n = Math.max(1, Math.min(60, Number(d.installments) || 1));
    const [y0, m0, d0] = (d.date || todayISO()).split('-').map(Number);
    const isCard = cards.some((c) => c.id === d.accountId);
    const isAcc = accounts.some((a) => a.id === d.accountId);
    const today = todayISO();
    const groupId = n > 1 ? `g${Date.now()}` : null;
    const base = Math.floor((total / n) * 100) / 100;
    const fixedInst = n > 1 ? Math.round((Number(d.installmentAmount) || 0) * 100) / 100 : 0;
    const recvTotal = type === 'expense' && d.receivable ? Math.min(total, Number(d.receivableAmount) || total) : 0;
    const b = writeBatch(db);

    for (let i = 0; i < n; i++) {
      const amt = fixedInst > 0 ? fixedInst : i === n - 1 ? Math.round((total - base * (n - 1)) * 100) / 100 : base;
      const dim = new Date(y0, m0 - 1 + i + 1, 0).getDate();
      const dt = new Date(y0, m0 - 1 + i, Math.min(d0, dim));
      const date = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
      const applied = !isAcc || date <= today;

      b.set(doc(col('transactions')), {
        type,
        amount: amt,
        categoryId: d.categoryId || null,
        accountId: isAcc ? d.accountId : null,
        cardId: isCard ? d.accountId : null,
        note: d.note || '',
        method: d.method || (isCard ? 'credit' : null),
        date,
        month: dt.getMonth(),
        year: dt.getFullYear(),
        fixedId: d.fixedId || null,
        fixedKey: d.fixedKey ?? null,
        late: !!d.late,
        dueDate: d.dueDate || null,
        installment: n > 1 ? { n: i + 1, of: n } : null,
        groupId,
        receivable: recvTotal > 0,
        receivableAmount: recvTotal > 0 ? Math.round((recvTotal / n) * 100) / 100 : 0,
        received: false,
        applied,
        createdAt: Date.now() + i,
        authorUid: familyMode ? uid : null,
        scope: d.scope || 'family',
      });
      if (isAcc && applied) {
        b.update(dref('accounts', d.accountId), { balance: increment(type === 'expense' ? -amt : amt) });
      }
    }
    await b.commit();
  };

  const deleteTransaction = async (t) => {
    const b = writeBatch(db);
    b.delete(dref('transactions', t.id));
    if (t.accountId && t.applied !== false && accounts.some((a) => a.id === t.accountId)) {
      b.update(dref('accounts', t.accountId), { balance: increment(t.type === 'expense' ? t.amount : -t.amount) });
    }
    await b.commit();
  };

  // ---------- rendimentos ----------
  const saveInvestment = async (d, id) => {
    const amount = Number(d.amount ?? d.value) || 0;
    const accountId = invAcc(d);
    const payload = clean({
      ...d,
      amount,
      accountId: accountId || null,
      month: d.month ?? month,
      year: d.year ?? year,
    });
    delete payload.id;
    const b = writeBatch(db);
    const hasAcc = (aid) => aid && accounts.some((a) => a.id === aid);

    if (id) {
      const old = data.investments.find((x) => x.id === id);
      b.set(dref('investments', id), payload, { merge: true });
      if (INVESTMENT_AFFECTS_BALANCE && old && hasAcc(invAcc(old))) {
        b.update(dref('accounts', invAcc(old)), { balance: increment(-invAmt(old)) });
      }
      if (INVESTMENT_AFFECTS_BALANCE && hasAcc(accountId)) {
        b.update(dref('accounts', accountId), { balance: increment(amount) });
      }
    } else {
      b.set(doc(col('investments')), { ...payload, createdAt: Date.now() });
      if (INVESTMENT_AFFECTS_BALANCE && hasAcc(accountId)) {
        b.update(dref('accounts', accountId), { balance: increment(amount) });
      }
    }
    await b.commit();
  };

  const deleteInvestment = async (invOrId) => {
    const id = typeof invOrId === 'string' ? invOrId : invOrId?.id;
    const inv = data.investments.find((x) => x.id === id);
    if (!id) return;
    const b = writeBatch(db);
    b.delete(dref('investments', id));
    if (INVESTMENT_AFFECTS_BALANCE && inv && invAcc(inv) && accounts.some((a) => a.id === invAcc(inv))) {
      b.update(dref('accounts', invAcc(inv)), { balance: increment(-invAmt(inv)) });
    }
    await b.commit();
  };

  const saveAccount = async (d, id) => {
    const payload = clean({ ...d, balance: d.balance !== undefined ? Number(d.balance) || 0 : undefined });
    delete payload.id;
    if (id) return setDoc(dref('accounts', id), payload, { merge: true });
    return addDoc(col('accounts'), { ...payload, order: accounts.length });
  };
  const deleteAccount = (id) => deleteDoc(dref('accounts', id));
  const moveAccount = async (id, dir) => {
    const list = [...accounts];
    const i = list.findIndex((a) => a.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const b = writeBatch(db);
    list.forEach((a, idx) => b.update(dref('accounts', a.id), { order: idx }));
    await b.commit();
  };

  const saveCard = async (d, id) => {
    const payload = {
      name: d.name,
      closingDay: Math.min(31, Math.max(1, Number(d.closingDay) || 1)),
      dueDay: Math.min(31, Math.max(1, Number(d.dueDay) || 1)),
      limit: Number(d.limit) || 0,
      color: d.color || '#000000',
      bank: d.bank || null,
      brand: d.brand || null,
    };
    if (id) return setDoc(dref('cards', id), payload, { merge: true });
    return addDoc(col('cards'), { ...payload, order: cards.length });
  };
  const deleteCard = (id) => deleteDoc(dref('cards', id));

  const saveCategory = async (d, id) => {
    const payload = { name: d.name, icon: d.icon || 'Tag', limit: Number(d.limit) || 0 };
    if (id) {
      const { limit, ...rest } = payload;
      return setDoc(dref('categories', id), { ...rest, limits: { [key]: limit } }, { merge: true });
    }
    return addDoc(col('categories'), { ...payload, order: categories.length });
  };
  const deleteCategory = (id) => deleteDoc(dref('categories', id));
  const updateLimit = (id, value) =>
    setDoc(dref('categories', id), { limits: { [key]: Number(value) || 0 } }, { merge: true });

  // limite total: vale deste mês em diante. null = voltar a usar a soma das categorias
  const updateTotalLimit = (value) =>
    update({ totalLimits: { [key]: value === null ? null : Number(value) || 0 } });

  const saveFixed = async (d, id) => {
    // limite da categoria definido pelo fixo: vale deste mês em diante (não retroativo)
    if (d.categoryId && d.categoryLimit != null) {
      await setDoc(
        dref('categories', d.categoryId),
        { limits: { [key]: Number(d.categoryLimit) || 0 } },
        { merge: true }
      );
    }

    const v = {
      name: d.name,
      amount: Number(d.amount) || 0,
      type: d.type === 'income' ? 'income' : 'expense',
      day: Math.min(31, Math.max(1, Number(d.day) || 1)),
      categoryId: d.categoryId || null,
      accountId: d.accountId || null,
      note: d.note || '',
    };
    if (!id) {
      return addDoc(col('fixeds'), {
        ranges: [{ from: key, to: null }], skipped: [], versions: [{ from: key, ...v }], createdAt: Date.now(),
      });
    }
    const f = data.fixeds.find((x) => x.id === id);
    const versions = (f?.versions || []).filter((x) => x.from < key).concat({ from: key, ...v });
    return setDoc(dref('fixeds', id), { versions }, { merge: true });
  };
  const deactivateFixed = (id, scope) => {
    const f = data.fixeds.find((x) => x.id === id);
    if (f) return setDoc(dref('fixeds', id), deactivate(f, key, scope), { merge: true });
  };
  const reactivateFixed = (id) => {
    const f = data.fixeds.find((x) => x.id === id);
    if (f) return setDoc(dref('fixeds', id), reactivate(f, key), { merge: true });
  };
  const deleteFixed = (id) => {
    if (!id) return;
    return deleteDoc(dref('fixeds', id));
  };
  const toggleFixedPaid = async (f, paidDate) => {
    const paid = calc.paidFixed[f.id];
    if (paid) return deleteTransaction(paid);
    const dim = new Date(year, month + 1, 0).getDate();
    const dueDate = `${year}-${pad(month + 1)}-${pad(Math.min(f.day || 1, dim))}`;
    const date = paidDate || dueDate;
    return addTransaction(f.type, {
      amount: f.amount,
      accountId: f.accountId,
      categoryId: f.categoryId,
      note: f.name,
      date,
      fixedId: f.id,
      fixedKey: key,
      late: date > dueDate,
      dueDate,
    });
  };

  const setMascotPack = (pack) => update({ mascotPack: pack });
  const saveMascot = async (mood, file) => {
    const src = await fileToDataUrl(file);
    await setDoc(dref('mascots', mood), { src });
  };
  const removeMascot = (mood) => deleteDoc(dref('mascots', mood));

  return {
    loading, state, percent, remaining,
    totalAvailable: calc.limit, mascotState, totalBalance, totalSaved,
    changeMonth, update,
    addTransaction, deleteTransaction, markReceived: () => { },
    saveAccount, deleteAccount, moveAccount,
    saveCard, deleteCard,
    saveCategory, deleteCategory, updateLimit, updateTotalLimit,
    saveFixed, deactivateFixed, reactivateFixed, deleteFixed, toggleFixedPaid,
    saveInvestment, deleteInvestment,
    setMascotPack, saveMascot, removeMascot,
    familyMode,
  };
}