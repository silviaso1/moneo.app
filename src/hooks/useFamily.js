import { useEffect, useMemo, useState } from 'react';
import {
    collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function useFamily() {
    const { user } = useAuth();
    const uid = user?.uid;
    const email = user?.email?.toLowerCase() || '';

    const [familyId, setFamilyId] = useState(null);
    const [family, setFamily] = useState(null);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [sentInvites, setSentInvites] = useState([]);
    const [modeActive, setModeActive] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Armazena os nomes buscados no banco
    const [fetchedNames, setFetchedNames] = useState({});

    useEffect(() => {
        if (!uid) return;
        const unsub = onSnapshot(doc(db, 'users', uid), (s) => {
            const d = s.data() || {};
            setFamilyId(d.familyId || null);
            setModeActive(!!d.familyMode);
        });
        return unsub;
    }, [uid]);

    useEffect(() => {
        if (!familyId) { setFamily(null); setLoading(false); return; }
        setLoading(true);
        const unsub = onSnapshot(doc(db, 'families', familyId), (s) => {
            setFamily(s.exists() ? { id: s.id, ...s.data() } : null);
            setLoading(false);
        });
        return unsub;
    }, [familyId]);

    useEffect(() => {
        if (!email) return;
        const unsub = onSnapshot(doc(db, 'familyInvites', email), (s) => {
            setPendingInvites(s.exists() && s.data().status === 'pending' ? [{ id: s.id, ...s.data() }] : []);
        });
        return unsub;
    }, [email]);

    useEffect(() => {
        if (!familyId) { setSentInvites([]); return; }
        const unsub = onSnapshot(collection(db, 'familyInvites'), (s) => {
            const all = s.docs.map((d) => ({ id: d.id, ...d.data() }));
            setSentInvites(all.filter((i) => i.familyId === familyId && i.status === 'pending'));
        });
        return unsub;
    }, [familyId]);

    // BUSCA OS NOMES DO BANCO (users) PARA TODOS OS MEMBROS
    useEffect(() => {
        if (!family || !family.members) return;

        const fetchAllNames = async () => {
            const names = {};
            const memberUids = Object.keys(family.members);
            
            // Faz um loop em todos os UIDs da família
            for (const memberUid of memberUids) {
                try {
                    // Busca o documento do usuário na coleção 'users'
                    const userSnap = await getDoc(doc(db, 'users', memberUid));
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        // Puxa o campo 'name' do banco (ou o displayName do Auth como fallback)
                        names[memberUid] = data.name || 'Membro';
                    } else {
                        // Se não achou no banco, tenta o nome que está no objeto members antigo
                        const memberData = family.members[memberUid];
                        names[memberUid] = typeof memberData === 'object' ? memberData.name : 'Membro';
                    }
                } catch (error) {
                    console.error("Erro ao buscar nome:", error);
                    names[memberUid] = 'Membro';
                }
            }
            setFetchedNames(names);
        };

        fetchAllNames();
    }, [family]); // Dispara sempre que a família mudar

    const createFamily = async (name) => {
        if (!uid) return;
        const ref = doc(collection(db, 'families'));
        await setDoc(ref, {
            name: name || 'Minha família',
            ownerId: uid,
            members: { [uid]: { role: 'owner', name: user.displayName || user.email || 'Dono' } },
            createdAt: Date.now(),
        });
        await setDoc(doc(db, 'users', uid), { familyId: ref.id, familyMode: true }, { merge: true });
        setFamilyId(ref.id);
        return ref.id;
    };

    const inviteMember = async (targetEmail) => {
        if (!familyId || !family) return;
        const e = targetEmail.trim().toLowerCase();
        if (!e || e === email) throw new Error('Email inválido.');
        await setDoc(doc(db, 'familyInvites', e), {
            familyId,
            familyName: family.name,
            fromUid: uid,
            fromName: user.displayName || user.email,
            status: 'pending',
            createdAt: Date.now(),
        });
    };

    const cancelInvite = async (targetEmail) => {
        await deleteDoc(doc(db, 'familyInvites', targetEmail.toLowerCase()));
    };
    
    const acceptInvite = async (invite) => {
        if (!uid) return;
        
        const ref = doc(db, 'families', invite.familyId);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) throw new Error('Família não existe mais.');
        
        const data = snap.data();
        const myName = user.displayName || user.email?.split('@')[0] || 'Membro';
        const members = { 
          ...(data.members || {}), 
          [uid]: { role: 'member', name: myName } 
        };
        
        const batch = writeBatch(db);
        batch.update(ref, { members });
        batch.set(doc(db, 'users', uid), { familyId: invite.familyId, familyMode: true }, { merge: true });
        batch.delete(doc(db, 'familyInvites', email));
        
        await batch.commit();
        setFamilyId(invite.familyId);
    };

    const rejectInvite = async () => {
        if (!email) return;
        await deleteDoc(doc(db, 'familyInvites', email));
    };

    const leaveFamily = async () => {
        if (!familyId || !family || !uid) return;
        const members = { ...(family.members || {}) };
        delete members[uid];
        if (Object.keys(members).length === 0) {
            await deleteDoc(doc(db, 'families', familyId));
        } else {
            await setDoc(doc(db, 'families', familyId), { members }, { merge: true });
        }
        await setDoc(doc(db, 'users', uid), { familyId: null, familyMode: false }, { merge: true });
        setFamilyId(null);
    };

    const activateMode = async () => {
        await setDoc(doc(db, 'users', uid), { familyMode: true }, { merge: true });
    };
    const deactivateMode = async () => {
        await setDoc(doc(db, 'users', uid), { familyMode: false }, { merge: true });
    };

    // JUNTA O QUE ESTÁ NO BANCO COM A LISTA DE MEMBROS
    const members = useMemo(() => {
        if (!family) return [];
        return Object.entries(family.members || {}).map(([memberUid, data]) => {
            const role = typeof data === 'string' ? data : data.role;
            
            // Puxa o nome do nosso estado fetchedNames (que veio do banco)
            // Se não tiver, tenta o nome no objeto da família (fallback) ou 'Membro'
            const finalName = fetchedNames[memberUid] || (typeof data === 'object' ? data.name : null) || 'Membro';

            return {
                uid: memberUid,
                role,
                name: finalName,
                isMe: memberUid === uid,
            };
        });
    }, [family, uid, fetchedNames]);

    const isOwner = family?.ownerId === uid;

    return {
        loading,
        familyId,
        family,
        pendingInvites,
        sentInvites,
        members,
        isOwner,
        modeActive,
        createFamily,
        inviteMember,
        cancelInvite,
        acceptInvite,
        rejectInvite,
        leaveFamily,
        activateMode,
        deactivateMode,
    };
}