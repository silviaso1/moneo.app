import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import useFinance from './hooks/useFinance';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import Settings from './components/Settings';
import Planejar from './components/Planejar';
import Invoices from './components/Invoices';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import InvestmentForm from './components/InvestmentForm';
import AccountForm from './components/AccountForm';
import CategoryForm from './components/CategoryForm';
import FixedForm from './components/FixedForm';
import FixedOffForm from './components/FixedOffForm';
import CardForm from './components/CardForm';
import { months } from './store';
import { safeNav } from './utils/config';

export default function App() {
  const { user, logout } = useAuth();
  const finance = useFinance();
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [investmentToEdit, setInvestmentToEdit] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [fixedToEdit, setFixedToEdit] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);

  if (!user) return <LoginScreen />;

  if (finance.loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const st = finance.state;
  const monthLabel = months[st.currentMonth].toLowerCase();

  const doLogout = () => {
    logout();
    setTab('dashboard');
  };

  const handleOpenAccountModal = (acc = null) => { setAccountToEdit(acc); setModal('modal-account'); };
  const handleOpenInvestmentModal = (inv = null) => { setInvestmentToEdit(inv); setModal('modal-investment'); };
  const handleOpenCategoryModal = (cat = null) => { setCategoryToEdit(cat); setModal('modal-category'); };
  const handleOpenFixedModal = (fx = null) => { setFixedToEdit(fx); setModal('modal-fixed'); };
  const handleOpenFixedOff = (fx) => { setFixedToEdit(fx); setModal('modal-fixed-off'); };
  const handleOpenCardModal = (card = null) => { setCardToEdit(card); setModal('modal-card'); };

  const closeFixed = () => { setModal(null); setFixedToEdit(null); };

  const txOpen = modal === 'modal-expense' || modal === 'modal-income';

  return (
    <div className="w-full min-h-screen  flex justify-center">
      <div className="w-full max-w-[1100px] relative flex flex-col pb-[120px] px-[5%] md:px-[10%]">

        <header className="sticky top-0 z-3 pt-5 pb-2">
          <Header
            onSettings={() => setTab('settings')}
            showBack={tab !== 'dashboard'}
            onBack={() => setTab('dashboard')}
          />
        </header>

        <div className="flex flex-col gap-8 flex-1">
          {tab === 'dashboard' && (
            <Dashboard
              state={st}
              percent={finance.percent}
              remaining={finance.remaining}
              totalAvailable={finance.totalAvailable}
              mascotState={finance.mascotState}
              totalBalance={finance.totalBalance}
              totalSaved={finance.totalSaved}
              onChangeMonth={finance.changeMonth}
              onToggleBalance={() => finance.update({ hideTotalBalance: !st.hideTotalBalance })}
              onToggleShowAll={() => finance.update({ showAllAccounts: !st.showAllAccounts })}
              onTab={setTab}
              onOpenModal={setModal}
              onToggleFixed={finance.toggleFixedPaid}
              onNewFixed={() => handleOpenFixedModal(null)}
              onAddInvestment={() => handleOpenInvestmentModal(null)}
            />
          )}

          {tab === 'statement' && (
            <Transactions
              state={st}
              onChangeMonth={finance.changeMonth}
              onDelete={finance.deleteTransaction}
              onReceived={finance.markReceived}
            />
          )}

          {tab === 'invoices' && (
            <Invoices
              state={st}
              onChangeMonth={finance.changeMonth}
              onNewCard={() => handleOpenCardModal(null)}
              onEditCard={handleOpenCardModal}
            />
          )}

          {tab === 'investments' && (
            <Investments
              investments={st.investments}
              hideSaved={st.hideSaved}
              totalSaved={finance.totalSaved}
              currentMonth={st.currentMonth}
              onAdd={() => handleOpenInvestmentModal(null)}
              onEdit={handleOpenInvestmentModal}
              onDelete={finance.deleteInvestment}
            />
          )}

          {tab === 'settings' && (
            <Settings
              state={st}
              onChangeMonth={finance.changeMonth}
              onAddAccount={() => handleOpenAccountModal(null)}
              onEditAccount={(acc) => handleOpenAccountModal(acc)}
              onDeleteAccount={finance.deleteAccount}
              onMoveAccount={finance.moveAccount}
              onAddCard={() => handleOpenCardModal(null)}
              onEditCard={handleOpenCardModal}
              onAddCategory={() => handleOpenCategoryModal(null)}
              onEditCategory={handleOpenCategoryModal}
              onSaveShortcuts={(l) => finance.update({ shortcuts: l })}
              onSaveNav={(l) => finance.update({ navItems: l })}
              onToggleFollow={() => finance.update({ followCursor: !st.followCursor })}
              onToggleSaved={() => finance.update({ hideSaved: !st.hideSaved })}
              onLogout={doLogout}
            />
          )}

          {tab === 'charts' && (
            <Planejar
              state={st}
              onChangeMonth={finance.changeMonth}
              onNewFixed={() => handleOpenFixedModal(null)}
              onEditFixed={handleOpenFixedModal}
              onOffFixed={handleOpenFixedOff}
              onOnFixed={(f) => finance.reactivateFixed(f.id)}
              onLimitChange={finance.updateLimit}
              onTotalLimitChange={finance.updateTotalLimit}
            />
          )}
        </div>
      </div>

      <BottomNav tab={tab} onTab={setTab} onAdd={() => setModal('modal-expense')} items={safeNav(st.navItems)} />

      <Modal open={txOpen} onClose={() => setModal(null)} title="Novo lançamento">
        {txOpen && (
          <TransactionForm
            key={modal}
            initialType={modal === 'modal-income' ? 'income' : 'expense'}
            accounts={st.accounts}
            cards={st.cards}
            categories={st.categories}
            remaining={finance.remaining}
            onSubmit={(type, d) => { finance.addTransaction(type, d); setModal(null); }}
          />
        )}
      </Modal>

      <Modal open={modal === 'modal-investment'} onClose={() => { setModal(null); setInvestmentToEdit(null); }} title={investmentToEdit ? 'Editar Rendimento' : 'Novo Rendimento'}>
        <InvestmentForm
          accounts={st.accounts}
          investmentToEdit={investmentToEdit}
          onSubmit={(d, id) => { finance.saveInvestment(d, id); setModal(null); setInvestmentToEdit(null); }}
        />
      </Modal>

      <Modal open={modal === 'modal-account'} onClose={() => { setModal(null); setAccountToEdit(null); }} title={accountToEdit ? 'Editar Conta' : 'Nova Conta'}>
        <AccountForm
          accountToEdit={accountToEdit}
          onSubmit={(d, id) => { finance.saveAccount(d, id); setModal(null); setAccountToEdit(null); }}
        />
      </Modal>

      <Modal open={modal === 'modal-card'} onClose={() => { setModal(null); setCardToEdit(null); }} title={cardToEdit ? 'Editar Cartão' : 'Novo Cartão'}>
        {modal === 'modal-card' && (
          <CardForm
            cardToEdit={cardToEdit}
            onSubmit={(d, id) => { finance.saveCard(d, id); setModal(null); setCardToEdit(null); }}
            onDelete={(id) => { finance.deleteCard(id); setModal(null); setCardToEdit(null); }}
          />
        )}
      </Modal>

      <Modal open={modal === 'modal-category'} onClose={() => { setModal(null); setCategoryToEdit(null); }} title={categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}>
        {modal === 'modal-category' && (
          <CategoryForm
            categoryToEdit={categoryToEdit}
            onSubmit={(d, id) => { finance.saveCategory(d, id); setModal(null); setCategoryToEdit(null); }}
            onDelete={(id) => { finance.deleteCategory(id); setModal(null); setCategoryToEdit(null); }}
          />
        )}
      </Modal>

      <Modal open={modal === 'modal-fixed'} onClose={closeFixed} title={fixedToEdit ? 'Editar Fixo' : 'Novo Fixo'}>
        {modal === 'modal-fixed' && (
          <FixedForm
            key={fixedToEdit?.id || 'new'}
            fixedToEdit={fixedToEdit}
            accounts={st.accounts}
            cards={st.cards}
            categories={st.categories}
            monthLabel={monthLabel}
            onSubmit={(d, id) => { finance.saveFixed(d, id); closeFixed(); }}
          />
        )}
      </Modal>

      <Modal open={modal === 'modal-fixed-off'} onClose={closeFixed} title="Desativar fixo">
        {modal === 'modal-fixed-off' && (
          <FixedOffForm
            fixed={fixedToEdit}
            monthLabel={monthLabel}
            onChoose={(scope) => { finance.deactivateFixed(fixedToEdit.id, scope); closeFixed(); }}
          />
        )}
      </Modal>
    </div>
  );
}