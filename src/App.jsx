import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import useFinance from './hooks/useFinance';
import LoginScreen from './components/LoginScreen';
import Home from './components/Home';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import Settings from './components/Settings';
import Planejar from './components/Planejar';
import Graphs from './components/Graphs';
import Family from './components/Family';
import Invoices from './components/Invoices';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import InvestmentForm from './components/InvestmentForm';
import AccountForm from './components/AccountForm';
import CategoryForm from './components/CategoryForm';
import FixedForm from './components/FixedForm';
import FixedOffForm from './components/FixedOffForm';
import PayFixedForm from './components/PayFixedForm';
import CardForm from './components/CardForm';
import MascotChat from './components/MascotChat';
import ErrorBoundary from './components/ErrorBoundary';
import { months } from './store';
import { safeNav, safeTheme, THEME_COLORS } from './utils/config';
import { money } from './utils/format';

export default function App() {
  const { user, logout } = useAuth();
  const finance = useFinance();
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [investmentToEdit, setInvestmentToEdit] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [fixedToEdit, setFixedToEdit] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const isPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const [showLogin, setShowLogin] = useState(false);

  if (!user) {
    if (isPWA) {
      return <LoginScreen />;
    }

    if (showLogin) {
      return <LoginScreen onBack={() => setShowLogin(false)} />;
    }

    return <Home onLogin={() => setShowLogin(true)} />;
  }

  if (finance.loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const raw = finance.state || {};
  const st = {
    ...raw,
    accounts: raw.accounts ?? [],
    cards: raw.cards ?? [],
    categories: raw.categories ?? [],
    fixeds: raw.fixeds ?? [],
    inactiveFixeds: raw.inactiveFixeds ?? [],
    transactions: raw.transactions ?? [],
    monthTransactions: raw.monthTransactions ?? [],
    investments: raw.investments ?? [],
    monthInvestments: raw.monthInvestments ?? [],
    yearByMonth: raw.yearByMonth ?? Array(12).fill(0),
    yearSaved: raw.yearSaved ?? 0,
    invoices: raw.invoices ?? [],
    openInvoices: raw.openInvoices ?? [],
    categorySpent: raw.categorySpent ?? {},
    paidFixed: raw.paidFixed ?? {},
    categoriesLimit: raw.categoriesLimit ?? 0,
    hourlyRate: raw.hourlyRate ?? 0,
  };

  const monthLabel = months[st.currentMonth].toLowerCase();
  const themeId = safeTheme(st.themeColor);
  const themeColors = THEME_COLORS[themeId] || THEME_COLORS.purple;

  const dashboardState = st.animeTheme
    ? { ...st, mascotPack: `anime-${st.animeCharacter || 'gojo'}` }
    : st;

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

  const handleOpenCategoryModal = (cat = null) => {
    setCategoryToEdit(cat);
    setModal('modal-category');
  };

  const handleOpenFixedModal = (fx = null) => {
    setFixedToEdit(fx);
    setModal('modal-fixed');
  };

  const handleOpenFixedOff = (fx) => {
    setFixedToEdit(fx);
    setModal('modal-fixed-off');
  };

  const handleOpenCardModal = (card = null) => {
    setCardToEdit(card);
    setModal('modal-card');
  };

  const handleToggleFixed = (f) => {
    if (st.paidFixed[f.id]) {
      finance.toggleFixedPaid(f);
      return;
    }
    setFixedToEdit(f);
    setModal('modal-fixed-pay');
  };

  const closeFixed = () => {
    setModal(null);
    setFixedToEdit(null);
  };

  const txOpen = modal === 'modal-expense' || modal === 'modal-income';

  const askDeleteTransaction = (t) => {
    setDeleteConfirm({ kind: 'transaction', item: t });
  };

  const askDeleteInvestment = (id) => {
    setDeleteConfirm({
      kind: 'investment',
      item: st.investments.find((x) => x.id === id) || { id },
    });
  };

  const askDeleteFixed = (f) => {
    setDeleteConfirm({ kind: 'fixed', item: f });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const { kind, item } = deleteConfirm;

    try {
      if (kind === 'transaction') {
        await finance.deleteTransaction(item);
      } else if (kind === 'investment') {
        await finance.deleteInvestment(item.id);
      } else if (kind === 'fixed') {
        if (typeof finance.deleteFixed !== 'function') {
          console.error('deleteFixed não está disponível no useFinance.');
          return;
        }
        await finance.deleteFixed(item.id);
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const deleteWhat = () => {
    if (!deleteConfirm) return '';

    const { kind, item } = deleteConfirm;

    if (kind === 'transaction') {
      const label = item.note || (item.type === 'income' ? 'receita' : 'gasto');
      return `${label} (${money(item.amount)})`;
    }

    if (kind === 'fixed') {
      return `${item.name} (${money(item.amount)})`;
    }

    const label = item.note || item.name || 'investimento';
    return `${label} (${money(item.amount ?? item.value ?? 0)})`;
  };

  const handleDownloadPDF = (period) => {
    const title = period === 'year'
      ? `Relatório Anual ${st.currentYear}`
      : `Relatório ${months[st.currentMonth]} / ${st.currentYear}`;

    const rows = [
      ['Limite', money(st.limit)],
      ['Gasto', money(st.spent)],
      ['Sobra', money(st.limit - st.spent)],
      ['Receitas fixas', money(st.fixedIncomeTotal)],
      ['Despesas fixas', money(st.fixedExpenseTotal)],
      [
        'Investimentos do mês',
        money(st.monthInvestments.reduce(
          (s, i) => s + Number(i.amount ?? i.value ?? 0),
          0
        )),
      ],
      ['Investimentos no ano', money(st.yearSaved)],
    ];

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Inter, Arial, sans-serif;
              padding: 40px;
              color: #111;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 8px;
            }
            h2 {
              font-size: 16px;
              margin: 24px 0 8px;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
              margin-bottom: 24px;
            }
            th, td {
              padding: 10px;
              border-bottom: 1px solid #eee;
              text-align: left;
            }
            th {
              background: #fafafa;
              font-weight: 600;
            }
            .muted {
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="muted">
            Gerado em ${new Date().toLocaleString('pt-BR')}
          </p>
          <h2>Resumo Financeiro</h2>
          <table>
            ${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  };

  return (
    <div
      className="w-full min-h-screen flex justify-center"
      style={{
        '--accent-from': themeColors.from,
        '--accent-to': themeColors.to,
        '--accent-soft': themeColors.soft,
        '--accent-text': themeColors.text,
        '--accent-rgb': themeColors.rgb,
        '--accent-soft-rgb': themeColors.softRgb,
      }}
    >
      <div className="w-full max-w-[1100px] relative flex flex-col pb-[120px] px-[5%] md:px-[10%]">
        <header className="sticky top-0 z-30 pt-5 pb-2 bg-transparent">
          <Header
            onSettings={() => setTab('settings')}
            showBack={tab !== 'dashboard'}
            onBack={() => setTab('dashboard')}
            familyMode={finance.familyMode}
            onFamily={() => setTab('family')}
            onChat={() => setChatOpen(true)}
            onDownloadPDF={handleDownloadPDF}
          />
        </header>

        <div className="flex flex-col gap-8 flex-1">
          <ErrorBoundary key={tab}>
            {tab === 'dashboard' && (
              <Dashboard
                state={dashboardState}
                percent={finance.percent}
                remaining={finance.remaining}
                totalAvailable={finance.totalAvailable}
                mascotState={finance.mascotState}
                totalBalance={finance.totalBalance}
                totalSaved={finance.totalSaved}
                onChangeMonth={finance.changeMonth}
                onToggleBalance={() => finance.update({
                  hideTotalBalance: !st.hideTotalBalance,
                })}
                onToggleShowAll={() => finance.update({
                  showAllAccounts: !st.showAllAccounts,
                })}
                onTab={setTab}
                onOpenModal={setModal}
                onToggleFixed={handleToggleFixed}
                onNewFixed={() => handleOpenFixedModal(null)}
                onAddInvestment={() => handleOpenInvestmentModal(null)}
              />
            )}

            {tab === 'statement' && (
              <Transactions
                state={st}
                onChangeMonth={finance.changeMonth}
                onDelete={askDeleteTransaction}
                onReceived={finance.markReceived}
              />
            )}

            {tab === 'graphs' && (
              <Graphs state={st} onChangeMonth={finance.changeMonth} />
            )}

            {tab === 'family' && <Family />}

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
                state={st}
                onChangeMonth={finance.changeMonth}
                onAdd={() => handleOpenInvestmentModal(null)}
                onEdit={handleOpenInvestmentModal}
                onDelete={askDeleteInvestment}
              />
            )}

            {tab === 'settings' && (
              <Settings
                state={st}
                onChangeMonth={finance.changeMonth}
                onAddAccount={() => handleOpenAccountModal(null)}
                onEditAccount={handleOpenAccountModal}
                onDeleteAccount={finance.deleteAccount}
                onMoveAccount={finance.moveAccount}
                onAddCard={() => handleOpenCardModal(null)}
                onEditCard={handleOpenCardModal}
                onAddCategory={() => handleOpenCategoryModal(null)}
                onEditCategory={handleOpenCategoryModal}
                onSaveShortcuts={(l) => finance.update({ shortcuts: l })}
                onSaveNav={(l) => finance.update({ navItems: l })}
                onSelectPack={finance.setMascotPack}
                onSelectMascotColor={(color) => finance.update({
                  mascotColor: color,
                })}
                onUploadMascot={finance.saveMascot}
                onRemoveMascot={finance.removeMascot}
                onToggleAnime={() => finance.update({
                  animeTheme: !st.animeTheme,
                })}
                onSelectAnimeCharacter={(character, animeId = st.animeId) => finance.update({
                  animeCharacter: character,
                  animeId,
                })}
                onToggleFollow={() => finance.update({
                  followCursor: !st.followCursor,
                })}
                onToggleSaved={() => finance.update({
                  hideSaved: !st.hideSaved,
                })}
                onSelectTheme={(id) => finance.update({ themeColor: id })}
                onUpdateSettings={finance.update}
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
                onDeleteFixed={askDeleteFixed}
                onLimitChange={finance.updateLimit}
                onTotalLimitChange={finance.updateTotalLimit}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      <BottomNav
        tab={tab}
        onTab={setTab}
        onAdd={() => setModal('modal-expense')}
        items={safeNav(st.navItems)}
      />

      <Modal
        open={txOpen}
        onClose={() => setModal(null)}
        title="Novo lançamento"
      >
        {txOpen && (
          <TransactionForm
            key={modal}
            initialType={modal === 'modal-income' ? 'income' : 'expense'}
            accounts={st.accounts}
            cards={st.cards}
            categories={st.categories}
            remaining={finance.remaining}
            hourlyRate={st.hourlyRate}
            onSubmit={(type, d) => {
              finance.addTransaction(type, d);
              setModal(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Chat"
      >
        {chatOpen && (
          <MascotChat
            state={st}
            finance={finance}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </Modal>

      <Modal
        open={modal === 'modal-investment'}
        onClose={() => {
          setModal(null);
          setInvestmentToEdit(null);
        }}
        title={investmentToEdit ? 'Editar Investimento' : 'Novo Investimento'}
      >
        {modal === 'modal-investment' && (
          <InvestmentForm
            key={investmentToEdit?.id || 'new'}
            accounts={st.accounts}
            investmentToEdit={investmentToEdit}
            investmentTypes={st.investmentTypes}
            onSubmit={(d, id) => {
              finance.saveInvestment(d, id);
              setModal(null);
              setInvestmentToEdit(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={modal === 'modal-account'}
        onClose={() => {
          setModal(null);
          setAccountToEdit(null);
        }}
        title={accountToEdit ? 'Editar Conta' : 'Nova Conta'}
      >
        <AccountForm
          accountToEdit={accountToEdit}
          onSubmit={(d, id) => {
            finance.saveAccount(d, id);
            setModal(null);
            setAccountToEdit(null);
          }}
        />
      </Modal>

      <Modal
        open={modal === 'modal-card'}
        onClose={() => {
          setModal(null);
          setCardToEdit(null);
        }}
        title={cardToEdit ? 'Editar Cartão' : 'Novo Cartão'}
      >
        {modal === 'modal-card' && (
          <CardForm
            cardToEdit={cardToEdit}
            onSubmit={(d, id) => {
              finance.saveCard(d, id);
              setModal(null);
              setCardToEdit(null);
            }}
            onDelete={(id) => {
              finance.deleteCard(id);
              setModal(null);
              setCardToEdit(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={modal === 'modal-category'}
        onClose={() => {
          setModal(null);
          setCategoryToEdit(null);
        }}
        title={categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}
      >
        {modal === 'modal-category' && (
          <CategoryForm
            categoryToEdit={categoryToEdit}
            onSubmit={(d, id) => {
              finance.saveCategory(d, id);
              setModal(null);
              setCategoryToEdit(null);
            }}
            onDelete={(id) => {
              finance.deleteCategory(id);
              setModal(null);
              setCategoryToEdit(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={modal === 'modal-fixed'}
        onClose={closeFixed}
        title={fixedToEdit ? 'Editar Fixo' : 'Novo Fixo'}
      >
        {modal === 'modal-fixed' && (
          <FixedForm
            key={fixedToEdit?.id || 'new'}
            fixedToEdit={fixedToEdit}
            accounts={st.accounts}
            cards={st.cards}
            categories={st.categories}
            monthLabel={monthLabel}
            onSubmit={(d, id) => {
              finance.saveFixed(d, id);
              closeFixed();
            }}
          />
        )}
      </Modal>

      <Modal
        open={modal === 'modal-fixed-off'}
        onClose={closeFixed}
        title="Desativar fixo"
      >
        {modal === 'modal-fixed-off' && (
          <FixedOffForm
            fixed={fixedToEdit}
            monthLabel={monthLabel}
            onChoose={(scope) => {
              finance.deactivateFixed(fixedToEdit.id, scope);
              closeFixed();
            }}
          />
        )}
      </Modal>

      <Modal
        open={modal === 'modal-fixed-pay'}
        onClose={closeFixed}
        title={fixedToEdit?.type === 'income' ? 'Quando recebeu?' : 'Quando pagou?'}
      >
        {modal === 'modal-fixed-pay' && (
          <PayFixedForm
            key={fixedToEdit?.id}
            fixed={fixedToEdit}
            month={st.currentMonth}
            year={st.currentYear}
            onChoose={(date) => {
              finance.toggleFixedPaid(fixedToEdit, date);
              closeFixed();
            }}
          />
        )}
      </Modal>

      {deleteConfirm && (
        <Modal
          open={true}
          onClose={() => setDeleteConfirm(null)}
          title={
            deleteConfirm.kind === 'transaction'
              ? 'Excluir lançamento'
              : deleteConfirm.kind === 'fixed'
                ? 'Excluir fixo'
                : 'Excluir investimento'
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">
              Tem certeza que deseja excluir <b>{deleteWhat()}</b>?
            </p>

            {deleteConfirm.kind === 'transaction' && deleteConfirm.item.installment && (
              <p className="text-gray-400 text-sm">
                Só esta parcela ({deleteConfirm.item.installment.n}/{deleteConfirm.item.installment.of}) será excluída.
              </p>
            )}

            {deleteConfirm.kind === 'fixed' && (
              <p className="text-gray-400 text-sm">
                Este fixo será removido permanentemente e não aparecerá mais nos próximos meses.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-black rounded-full py-3 font-semibold"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 text-white rounded-full py-3 font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}