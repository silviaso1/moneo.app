import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import useFinance from './hooks/useFinance';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Statement from './components/Statement';
import Investments from './components/Investments';
import Settings from './components/Settings';
import Charts from './components/Charts';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import InvestmentForm from './components/InvestmentForm';
import AccountForm from './components/AccountForm';

export default function App() {
  const { user, logout } = useAuth();
  const finance = useFinance();
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [investmentToEdit, setInvestmentToEdit] = useState(null); // Novo estado

  if (!user) return <LoginScreen />;

  if (finance.loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const doLogout = () => {
    logout();
    setTab('dashboard');
  };

  const handleOpenAccountModal = (acc = null) => {
    setAccountToEdit(acc);
    setModal('modal-account');
  };

  const handleOpenInvestmentModal = (inv = null) => {
    setInvestmentToEdit(inv);
    setModal('modal-investment');
  };

  return (
    <div className="w-full min-h-screen  flex justify-center">
      <div className="w-full max-w-[1100px] relative flex flex-col pb-[120px] px-[5%] md:px-[10%]">
        
        <header className="sticky top-0 z-3 pt-5 pb-2">
          <Header onSettings={() => setTab('settings')} />
        </header>
        
        <div className="flex flex-col gap-8 flex-1">
          {tab === 'dashboard' && (
            <Dashboard
              state={finance.state}
              percent={finance.percent}
              remaining={finance.remaining}
              totalAvailable={finance.totalAvailable}
              mascotState={finance.mascotState}
              totalBalance={finance.totalBalance}
              onChangeMonth={finance.changeMonth}
              onToggleBalance={() => finance.update({ hideTotalBalance: !finance.state.hideTotalBalance })}
              onToggleShowAll={() => finance.update({ showAllAccounts: !finance.state.showAllAccounts })}
              onOpenModal={setModal}
              onTab={setTab}
            />
          )}
          
          {tab === 'statement' && <Statement transactions={finance.state.transactions} />}
          
          {tab === 'investments' && (
            <Investments
              investments={finance.state.investments}
              hideSaved={finance.state.hideSaved}
              totalSaved={finance.totalSaved}
              currentMonth={finance.state.currentMonth}
              onAdd={() => handleOpenInvestmentModal(null)}
              onEdit={handleOpenInvestmentModal}
              onDelete={finance.deleteInvestment}
            />
          )}
          
          {tab === 'settings' && (
            <Settings
              state={finance.state}
              onAddAccount={() => handleOpenAccountModal(null)}
              onEditAccount={(acc) => handleOpenAccountModal(acc)}
              onDeleteAccount={finance.deleteAccount}
              onMoveAccount={finance.moveAccount}
              onLimitChange={finance.updateLimit}
              onToggleFollow={() => finance.update({ followCursor: !finance.state.followCursor })}
              onToggleSaved={() => finance.update({ hideSaved: !finance.state.hideSaved })}
              onLogout={doLogout}
            />
          )}
          
          {tab === 'charts' && (
            <Charts
              transactions={finance.state.transactions}
              currentMonth={finance.state.currentMonth}
              spent={finance.state.spent}
              income={finance.state.income}
              investments={finance.state.investments}
              onAddInvestment={() => handleOpenInvestmentModal(null)}
            />
          )}
        </div>
      </div>

      <BottomNav tab={tab} onTab={setTab} onAdd={() => setModal('modal-expense')} />

      <Modal open={modal === 'modal-expense'} onClose={() => setModal(null)} title="Novo Gasto">
        <ExpenseForm accounts={finance.state.accounts} onSubmit={(d) => { finance.addTransaction('expense', d); setModal(null); }} />
      </Modal>
      
      <Modal open={modal === 'modal-income'} onClose={() => setModal(null)} title="Nova Receita">
        <IncomeForm accounts={finance.state.accounts} onSubmit={(d) => { finance.addTransaction('income', d); setModal(null); }} />
      </Modal>
      
      <Modal open={modal === 'modal-investment'} onClose={() => { setModal(null); setInvestmentToEdit(null); }} title={investmentToEdit ? 'Editar Rendimento' : 'Novo Rendimento'}>
        <InvestmentForm 
          accounts={finance.state.accounts} 
          investmentToEdit={investmentToEdit}
          onSubmit={(d, id) => { 
            finance.saveInvestment(d, id); 
            setModal(null); 
            setInvestmentToEdit(null); 
          }} 
        />
      </Modal>
      
      <Modal open={modal === 'modal-account'} onClose={() => { setModal(null); setAccountToEdit(null); }} title={accountToEdit ? 'Editar Conta' : 'Nova Conta'}>
        <AccountForm 
          accountToEdit={accountToEdit} 
          onSubmit={(d, id) => { 
            finance.saveAccount(d, id); 
            setModal(null); 
            setAccountToEdit(null); 
          }} 
        />
      </Modal>
    </div>
  );
}