
import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    writeBatch,
    setDoc
} from 'firebase/firestore';

export default function useFinance() {
    const { user } = useAuth();

    const [state, setState] = useState({
        currentMonth: new Date().getMonth(),
        limit: 984,
        transactions: [],
        investments: [],
        accounts: [],
        followCursor: true,
        hideSaved: false,
        hideTotalBalance: false,
        showAllAccounts: false,
    });

    const [loading, setLoading] = useState(true);

    const userDocRef = user ? doc(db, 'users', user.uid) : null;
    const accountsRef = user ? collection(db, 'users', user.uid, 'accounts') : null;
    const transactionsRef = user ? collection(db, 'users', user.uid, 'transactions') : null;
    const investmentsRef = user ? collection(db, 'users', user.uid, 'investments') : null;

    // Configurações do usuário
    useEffect(() => {
        if (!userDocRef) return;

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                setState((s) => ({
                    ...s,
                    limit: data.limit ?? 984,
                    followCursor: data.followCursor ?? true,
                    hideSaved: data.hideSaved ?? false,
                    hideTotalBalance: data.hideTotalBalance ?? false,
                }));
            } else {
                setDoc(userDocRef, {
                    limit: 984,
                    followCursor: true,
                    hideSaved: false,
                    hideTotalBalance: false
                });
            }
        });

        return () => unsubscribe();
    }, [userDocRef]);

    // Contas bancárias
    useEffect(() => {
        if (!accountsRef) return;

        const unsubscribe = onSnapshot(accountsRef, (snapshot) => {
            const accounts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            accounts.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

            setState((s) => ({ ...s, accounts }));
        });

        return () => unsubscribe();
    }, [accountsRef]);

    // Transações
    useEffect(() => {
        if (!transactionsRef) return;

        const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

            setState((s) => ({ ...s, transactions }));
        });

        return () => unsubscribe();
    }, [transactionsRef]);

    // Investimentos
    useEffect(() => {
        if (!investmentsRef) return;

        const unsubscribe = onSnapshot(investmentsRef, (snapshot) => {
            const investments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setState((s) => ({ ...s, investments }));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [investmentsRef]);

    // Atualizar preferências
    const updatePreferences = useCallback(async (patch) => {
        setState((s) => ({ ...s, ...patch }));

        if (userDocRef) {
            await updateDoc(userDocRef, patch);
        }
    }, [userDocRef]);

    // Alterar mês
    const changeMonth = useCallback((dir) => {
        setState((s) => {
            const nm = s.currentMonth + dir;

            if (nm < 0 || nm > 11) return s;

            return { ...s, currentMonth: nm };
        });
    }, []);

    // Dados do mês atual
    const getCurrentMonthData = () => {
        const monthTx = state.transactions.filter(tx => {
            if (!tx.date) return false;

            const [, month] = tx.date.split('/');

            return parseInt(month) - 1 === state.currentMonth;
        });

        const spent = monthTx
            .filter(tx => tx.type === 'expense')
            .reduce((acc, tx) => acc + tx.value, 0);

        const income = monthTx
            .filter(tx => tx.type === 'income')
            .reduce((acc, tx) => acc + tx.value, 0);

        return { spent, income, monthTx };
    };

    const { spent, income } = getCurrentMonthData();

    // Saldo total
    const totalSaved = state.investments.reduce(
        (a, b) => a + (b.value || 0), 0
    );

    const totalBalance = state.accounts.reduce(
        (a, b) => a + (b.balance || 0), 0
    ) + totalSaved;

    // Limite disponível
    const totalAvailable = state.limit + income;

    const percent = totalAvailable > 0
        ? Math.min((spent / totalAvailable) * 100, 100)
        : 0;

    const remaining = Math.max(totalAvailable - spent, 0);

    // Estado da mascote
    const mascotState = useMemo(() => {
        if (percent >= 100) return 'angry';
        if (percent > 80) return 'sad';
        if (percent > 50) return 'normal';
        if (percent < 30 && spent > 0) return 'happy';

        return 'normal';
    }, [percent, spent]);

    // Adicionar transação
    const addTransaction = useCallback(async (type, data) => {
        if (!user) return;

        const isExpense = type === 'expense';
        const value = parseFloat(data.value);

        if (!value || value <= 0) return;

        await addDoc(transactionsRef, {
            type,
            value,
            desc: data.desc || (isExpense ? 'Gasto' : 'Receita'),
            bank: data.bank,
            method: isExpense ? data.method : 'Pix',
            category: isExpense ? data.category : 'Receita',
            date: new Date().toLocaleDateString('pt-BR'),
            createdAt: new Date().toISOString()
        });

        const account = state.accounts.find(a => a.name === data.bank);

        if (account) {
            const accountRef = doc(
                db,
                'users',
                user.uid,
                'accounts',
                account.id
            );

            await updateDoc(accountRef, {
                balance: isExpense
                    ? account.balance - value
                    : account.balance + value
            });
        }
    }, [user, state.accounts, transactionsRef]);

    // Adicionar investimento
    const addInvestment = useCallback(async (data) => {
        if (!user) return;

        const value = parseFloat(data.value);

        if (!value || value <= 0 || !data.day) return;

        await addDoc(investmentsRef, {
            value,
            day: data.day,
            bank: data.bank,
            date: new Date().toLocaleDateString('pt-BR')
        });
    }, [user, investmentsRef]);

    // Excluir investimento
    const deleteInvestment = useCallback(async (id) => {
        if (!user) return;

        await deleteDoc(
            doc(db, 'users', user.uid, 'investments', id)
        );
    }, [user]);

    // Salvar conta
    const saveAccount = useCallback(async (data, accountId = null) => {
        if (!user || !data.name) return;

        const accountData = {
            name: data.name,
            balance: parseFloat(data.balance) || 0,
            color: data.color,
            type: data.type || 'Conta Corrente',
            desc: data.desc || '',
        };

        if (accountId) {
            await updateDoc(
                doc(db, 'users', user.uid, 'accounts', accountId),
                accountData
            );
        } else {
            await addDoc(accountsRef, {
                ...accountData,
                order: state.accounts.length
            });
        }
    }, [user, accountsRef, state.accounts.length]);

    // Excluir conta
    const deleteAccount = useCallback(async (id) => {
        if (!user) return;

        if (state.accounts.length <= 1) {
            alert('Você precisa ter pelo menos uma conta.');
            return;
        }

        await deleteDoc(
            doc(db, 'users', user.uid, 'accounts', id)
        );
    }, [user, state.accounts.length]);

    // Reordenar contas
    const moveAccount = useCallback(async (id, direction) => {
        if (!user) return;

        const idx = state.accounts.findIndex(a => a.id === id);
        const ni = idx + direction;

        if (idx === -1 || ni < 0 || ni >= state.accounts.length) return;

        const newAccounts = [...state.accounts];

        [newAccounts[idx], newAccounts[ni]] = [
            newAccounts[ni],
            newAccounts[idx]
        ];

        const batch = writeBatch(db);

        newAccounts.forEach((acc, index) => {
            batch.update(
                doc(db, 'users', user.uid, 'accounts', acc.id),
                { order: index }
            );
        });

        await batch.commit();
    }, [user, state.accounts]);

    // Atualizar limite
    const updateLimit = useCallback((val) => {
        const n = parseFloat(val);

        if (n > 0) {
            updatePreferences({ limit: n });
        }
    }, [updatePreferences]);

    // Salvar ou editar investimento
    const saveInvestment = useCallback(async (data, investmentId = null) => {
        if (!user) return;

        const value = parseFloat(data.value);

        if (!value || value <= 0 || !data.day) return;

        const invData = {
            value,
            day: data.day,
            bank: data.bank,
            desc: data.desc || '',
            date: new Date().toLocaleDateString('pt-BR')
        };

        if (investmentId) {
            await updateDoc(
                doc(db, 'users', user.uid, 'investments', investmentId),
                invData
            );
        } else {
            await addDoc(investmentsRef, invData);
        }
    }, [user, investmentsRef]);

    return {
        state: {
            ...state,
            spent,
            income,
            totalSaved
        },
        loading,
        update: updatePreferences,
        changeMonth,
        totalBalance,
        totalSaved,
        totalAvailable,
        percent,
        remaining,
        mascotState,
        addTransaction,
        addInvestment,
        deleteInvestment,
        saveAccount,
        deleteAccount,
        moveAccount,
        updateLimit,
        saveInvestment,
    };
}
