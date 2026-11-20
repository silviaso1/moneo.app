import { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection, doc, onSnapshot, setDoc, addDoc, deleteDoc,
  writeBatch, increment, getDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { defaultCategories } from '../store';
import { todayISO } from '../utils/format';
import { monthKey, pad, fixedAt, versionAt, existsAt, deactivate, reactivate } from '../utils/fixeds';
import { buildInvoice, currentKey } from '../utils/invoices';
import { fileToDataUrl } from '../utils/image';

const defaults = {
  followCursor: true,
  hideSaved: false,
  hideTotalBalance: false,
  showAllAccounts: false,
  totalLimit: null,
  shortcuts: null,
  navItems: null,
  mascotPack: 'skunk',
  themeColor: 'purple',
  familyMode: false,
  familyId: null,
};

const COLS = ['accounts', 'transactions', 'investments', 'categories', 'fixeds', 'cards', 'mascots'];

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const sum = (arr, fn) => arr.reduce((s, x) => s + (Number(fn(x)) || 0), 0);
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(String(b.name));

const invAmt = (i) => Number(i?.amount ?? i?.value ?? 0) || 0;
const invAcc = (i) => i?.accountId ?? i?.account ?? null;
const invPeriod = (i) => {
  if (i.year != null && i.month != null) return { y: i.year, m: i.month };
  const d = i.createdAt ? new Date(i.createdAt) : new Date();
  return { y: d.getFullYear(), m: d.getMonth() };
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
  const applying = useRef(new Set());

  const key = monthKey(year, month);

  // Caminho base: família se estiver ativo, senão pessoal
  const familyMode = !!settings.familyMode && !!settings.familyId;
  const baseRoot = familyMode ? 'families' : 'users';
  const baseId = familyMode ? settings.familyId : uid;

  const col = (n) => collection(db, baseRoot, baseId, n);
  const dref = (n, id) => doc(db, baseRoot, baseId, n, id);

  // Assinatura das subcoleções
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

    // Assinatura do doc raiz (settings)
    unsubs.push(
      onSnapshot(doc(db, baseRoot, baseId), async (snap) => {
        const d = snap.data() || {};
        setSettings((prev) => ({
          ...defaults,
          ...d,
          // familyMode/familyId são SEMPRE do user pessoal, não do doc família
          familyMode: prev.familyMode,
          familyId: prev.familyId,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, baseRoot, baseId, familyMode]);

  // Sempre lê do user pessoal: familyMode + familyId (para saber qual modo usar)
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const d = snap.data() || {};
      setSettings((prev) => ({
        ...prev,
        familyMode: !!d.familyMode,
        familyId: d.familyId || null,
      }));
    });
    return unsub;
  }, [uid]);

  const loading = !!uid && ![...COLS, 'user'].every((k) => ready[k]);

  const accounts = useMemo(() => [...data.accounts].sort(byOrder), [data.accounts]);
  const categories = useMemo(() => [...data.categories].sort(byOrder), [data.categories]);
  const cards = useMemo(() => [...data.cards].sort(byOrder), [data.cards]);
  const customMascots = useMemo(
    () => Object.fromEntries(data.mascots.map((m) => [m.id, m.src])),
    [data.mascots]
  );

  useEffect(() => {
    if (!uid || !ready.transactions || !ready.accounts) return;
    const today = todayISO();
    const pending = data.transactions.filter(
      (t) => t.accountId && t.applied === false && t.date <= today && !applying.current.has(t.id)
    );
    if (!pending.length) return;
    const b = writeBatch(db);
    pending.forEach((t) => {
      applying.current.add(t.id);
      b.update(dref('transactions', t.id), { applied: true });
      if (accounts.some((a) => a.id === t.accountId)) {
        b.update(dref('accounts', t.accountId), { balance: increment(t.type === 'expense' ? -t.amount : t.amount) });
      }
    });
    b.commit().catch((e) => {
      console.error(e);
      pending.forEach((t) => applying.current.delete(t.id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.transactions, accounts, ready, uid, baseRoot, baseId]);

  const activeFixeds = useMemo(
    () => data.fixeds.map((f) => fixedAt(f, key)).filter(Boolean).sort((a, b) => (a.day || 1) - (b.day || 1)),
    [data.fixeds, key]
  );
  const inactiveFixeds = useMemo(
    () =>
      data.fixeds
        .filter((f) => !fixedAt(f, key) && existsAt(f, key))
        .map((f) => versionAt(f, key))
        .filter(Boolean),
    [data.fixeds, key]
  );

  const monthTransactions = useMemo(
    () =>
      data.transactions
        .filter((t) => t.month === month && t.year === year)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.createdAt || 0) - (a.createdAt || 0)),
    [data.transactions, month, year]
  );

  const calc = useMemo(() => {
    const eff = (t) => (Number(t.amount) || 0) - (t.receivable ? Number(t.receivableAmount) || 0 : 0);

    const dailyExp = monthTransactions.filter((t) => t.type === 'expense' && !t.fixedId);
    const dailySpent = sum(dailyExp, eff);

    const categorySpent = {};
    const addCat = (id, v) => { const k = id || '_none'; categorySpent[k] = (categorySpent[k] || 0) + v; };
    dailyExp.forEach((t) => addCat(t.categoryId, eff(t)));

    const fixedExp = activeFixeds.filter((f) => f.type !== 'income');
    fixedExp.forEach((f) => addCat(f.categoryId, Number(f.amount) || 0));

    const fixedExpenseTotal = sum(fixedExp, (f) => f.amount);
    const fixedIncomeTotal = sum(activeFixeds.filter((f) => f.type === 'income'), f => f.amount);

    const spent = dailySpent + fixedExpenseTotal;
    const categoriesLimit = sum(categories, (c) => c.limit);
    const limit = settings.totalLimit != null ? Number(settings.totalLimit) || 0 : categoriesLimit;

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

    return { dailySpent, spent, limit, categoriesLimit, categorySpent, paidFixed, fixedIncomeTotal, fixedExpenseTotal, income, sobra };
  }, [monthTransactions, data.transactions, key, categories, activeFixeds, settings.totalLimit]);

  const monthInvestments = useMemo(
    () =>
      data.investments
        .filter((i) => { const p = invPeriod(i); return p.y === year && p.m === month; })
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || (b.createdAt || 0) - (a.createdAt || 0)),
    [data.investments, month, year]
  );
  const yearByMonth = useMemo(() => {
    const arr = Array(12).fill(0);
    data.investments.forEach((i) => { const p = invPeriod(i); if (p.y === year) arr[p.m] += invAmt(i); });
    return arr;
  }, [data.investments, year]);
  const totalSaved = sum(monthInvestments, invAmt);
  const yearSaved = sum(yearByMonth, (x) => x);

  const remaining = calc.limit - calc.spent;
  const percent = calc.limit > 0 ? Math.min(100, (calc.spent / calc.limit) * 100) : calc.spent > 0 ? 100 : 0;
  const totalBalance = sum(accounts, (a) => a.balance);

  const anyCategoryOver = categories.some(
    (c) => Number(c.limit) > 0 && (calc.categorySpent[c.id] || 0) > Number(c.limit)
  );
  const mascotState =
    remaining < 0 ? 'sad' : anyCategoryOver ? 'angry' : calc.spent > 0 && percent <= 50 ? 'happy' : 'normal';

  const invoices = useMemo(() => cards.map((c) => buildInvoice(c, data.transactions, key)), [cards, data.transactions, key]);
  const openInvoices = useMemo(
    () => cards.map((c) => buildInvoice(c, currentKey(c))),
    [cards, data.transactions]
  );

  const state = {
    ...settings,
    customMascots,
    currentMonth: month,
    currentYear: year,
    monthKey: key,
    accounts,
    categories,
    cards,
    invoices,
    openInvoices,
    fixeds: activeFixeds,
    inactiveFixeds,
    investments: data.investments,
    monthInvestments,
    yearByMonth,
    yearSaved,
    transactions: data.transactions,
    monthTransactions,
    limit: calc.limit,
    categoriesLimit: calc.categoriesLimit,
    spent: calc.spent,
    dailySpent: calc.dailySpent,
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

  // update de settings: sempre no user pessoal (para familyMode/familyId)
  // exceto temas/preferências que no modo família devem ir pra família
  const update = (patch) => {
    const personalKeys = ['familyMode', 'familyId'];
    const personal = {};
    const shared = {};
    Object.entries(patch).forEach(([k, v]) => {
      if (personalKeys.includes(k)) personal[k] = v;
      else shared[k] = v;
    });
    // always merge personal keys into user
    if (Object.keys(personal).length) setDoc(doc(db, 'users', uid), clean(personal), { merge: true });
    // rest into current doc (family or user)
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
        // extras para família:
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

  const markReceived = async (t) => {
    const amt = Number(t.receivableAmount) || 0;
    if (amt <= 0) return;
    const acc = accounts.find((a) => a.id === t.accountId)?.id || accounts[0]?.id || null;
    const date = todayISO();
    const [y, m] = date.split('-').map(Number);
    const b = writeBatch(db);
    b.update(dref('transactions', t.id), { received: true });
    b.set(doc(col('transactions')), {
      type: 'income', amount: amt, categoryId: null, accountId: acc, cardId: null,
      note: `Reembolso: ${t.note || 'gasto'}`, date, month: m - 1, year: y,
      fixedId: null, reimbursementOf: t.id, applied: true, createdAt: Date.now(),
      authorUid: familyMode ? uid : null,
    });
    if (acc) b.update(dref('accounts', acc), { balance: increment(amt) });
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
    };
    if (id) return setDoc(dref('cards', id), payload, { merge: true });
    return addDoc(col('cards'), { ...payload, order: cards.length });
  };
  const deleteCard = (id) => deleteDoc(dref('cards', id));

  const saveCategory = async (d, id) => {
    const payload = { name: d.name, icon: d.icon || 'Tag', limit: Number(d.limit) || 0 };
    if (id) return setDoc(dref('categories', id), payload, { merge: true });
    return addDoc(col('categories'), { ...payload, order: categories.length });
  };
  const deleteCategory = (id) => deleteDoc(dref('categories', id));
  const updateLimit = (id, value) => setDoc(dref('categories', id), { limit: Number(value) || 0 }, { merge: true });
  const updateTotalLimit = (value) => update({ totalLimit: value === null ? null : Number(value) || 0 });

  const saveFixed = async (d, id) => {
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

  const saveInvestment = async (d, id) => {
    const payload = clean({ ...d });
    delete payload.id;
    const [y, m] = (payload.date || todayISO()).split('-').map(Number);
    payload.month = m - 1;
    payload.year = y;
    const newAcc = invAcc(payload);
    const newAmt = invAmt(payload);
    const credit = !!newAcc && accounts.some((a) => a.id === newAcc) && newAmt > 0;
    payload.credited = credit;

    const old = id ? data.investments.find((x) => x.id === id) : null;
    const deltas = {};
    if (old?.credited && invAcc(old)) deltas[invAcc(old)] = (deltas[invAcc(old)] || 0) - invAmt(old);
    if (credit) deltas[newAcc] = (deltas[newAcc] || 0) + newAmt;

    const b = writeBatch(db);
    if (id) b.set(dref('investments', id), payload, { merge: true });
    else b.set(doc(col('investments')), { ...payload, createdAt: Date.now() });
    Object.entries(deltas).forEach(([accId, v]) => {
      if (v && accounts.some((a) => a.id === accId)) b.update(dref('accounts', accId), { balance: increment(v) });
    });
    await b.commit();
  };

  const deleteInvestment = async (id) => {
    const old = data.investments.find((x) => x.id === id);
    const b = writeBatch(db);
    b.delete(dref('investments', id));
    const accId = invAcc(old);
    if (old?.credited && accId && accounts.some((a) => a.id === accId)) {
      b.update(dref('accounts', accId), { balance: increment(-invAmt(old)) });
    }
    await b.commit();
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
    addTransaction, deleteTransaction, markReceived,
    saveAccount, deleteAccount, moveAccount,
    saveCard, deleteCard,
    saveCategory, deleteCategory, updateLimit, updateTotalLimit,
    saveFixed, deactivateFixed, reactivateFixed, toggleFixedPaid,
    saveInvestment, deleteInvestment,
    setMascotPack, saveMascot, removeMascot,
    familyMode,
  };
}