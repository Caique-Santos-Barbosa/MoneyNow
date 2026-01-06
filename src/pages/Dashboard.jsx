import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Plus,
  Minus,
  ArrowLeftRight,
  Upload,
  Crown,
  ChevronRight,
  PieChart,
  Target,
  CheckCircle2,
  Circle,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryCard from '@/components/dashboard/SummaryCard';
import QuickActionButton from '@/components/dashboard/QuickActionButton';
import AccountCard from '@/components/dashboard/AccountCard';
import CreditCardItem from '@/components/dashboard/CreditCardItem';
import TransactionItem from '@/components/dashboard/TransactionItem';
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import MonthlyBalanceChart from '@/components/charts/MonthlyBalanceChart';
import EmptyState from '@/components/ui/EmptyState';
import TransactionModal from '@/components/modals/TransactionModal';
import AccountModal from '@/components/modals/AccountModal';
import CardModal from '@/components/modals/CardModal';
import ImportModal from '@/components/modals/ImportModal';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import PremiumRequiredModal from '@/components/premium/PremiumRequiredModal';
import { usePremiumCheck } from '@/components/hooks/usePremiumCheck';

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [premiumModal, setPremiumModal] = useState({ open: false, title: '', message: '' });
  const { isPremium, checkLimit } = usePremiumCheck();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

  // Modals
  const [transactionModal, setTransactionModal] = useState({ open: false, type: 'expense' });
  const [accountModal, setAccountModal] = useState({ open: false, account: null });
  const [cardModal, setCardModal] = useState({ open: false, card: null });
  const [importModal, setImportModal] = useState(false);

  const handleAddAccount = async () => {
    const { allowed, current, limit } = await checkLimit('accounts');
    if (!allowed) {
      setPremiumModal({
        open: true,
        title: 'Limite de contas atingido',
        message: `Você já tem ${current} de ${limit} contas cadastradas. Faça upgrade para Premium e tenha contas ilimitadas!`
      });
      return;
    }
    setAccountModal({ open: true, account: null });
  };

  const handleAddCard = async () => {
    const { allowed, current, limit } = await checkLimit('cards');
    if (!allowed) {
      setPremiumModal({
        open: true,
        title: 'Limite de cartões atingido',
        message: `Você já tem ${current} de ${limit} cartões cadastrados. Faça upgrade para Premium e tenha cartões ilimitados!`
      });
      return;
    }
    setCardModal({ open: true, card: null });
  };

  // Calculate trial days remaining
  const trialDaysLeft = user?.trial_ends_at ? differenceInDays(new Date(user.trial_ends_at), new Date()) : 0;
  const isInTrial = user?.trial_ends_at && trialDaysLeft > 0;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Mostrar onboarding para usuários novos
    if (user && !user.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // CRÍTICO: Filtrar TODOS os dados por created_by para isolar dados entre usuários
      const [accountsData, cardsData, transactionsData, categoriesData] = await Promise.all([
        base44.entities.Account.filter({ created_by: userData.email }),
        base44.entities.Card.filter({ created_by: userData.email }),
        base44.entities.Transaction.filter({ created_by: userData.email }, '-date', 50),
        base44.entities.Category.list() // Categorias do sistema são compartilhadas
      ]);
      
      setAccounts(accountsData || []);
      setCards(cardsData || []);
      setTransactions(transactionsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary data
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= monthStart && date <= monthEnd;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalBalance = accounts
    .filter(a => a.include_in_total !== false)
    .reduce((sum, a) => sum + (a.current_balance || 0), 0);

  const totalInvoices = cards.reduce((sum, c) => sum + (c.current_invoice || 0), 0);

  // Expenses by category
  const expensesByCategory = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === 'expense' && t.category_id === cat.id)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return {
        name: cat.name,
        value: total,
        color: cat.color
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Income by category
  const incomeByCategory = categories
    .filter(cat => cat.type === 'income')
    .map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === 'income' && t.category_id === cat.id)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return {
        name: cat.name,
        value: total,
        color: cat.color
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Monthly balance data for chart
  const monthlyBalanceData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
    });
    
    monthlyBalanceData.push({
      month: format(date, 'MMM', { locale: ptBR }),
      income: monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0),
      expense: monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
    });
  }

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Onboarding progress
  const onboardingSteps = [
    { id: 1, label: 'Preencha as informações iniciais', done: !!user },
    { id: 2, label: 'Cadastre uma conta bancária', done: accounts.length > 0 },
    { id: 3, label: 'Cadastre um cartão de crédito', done: cards.length > 0 },
    { id: 4, label: 'Registre sua primeira transação', done: transactions.length > 0 }
  ];
  const onboardingProgress = (onboardingSteps.filter(s => s.done).length / onboardingSteps.length) * 100;

  const getCategoryById = (id) => categories.find(c => c.id === id);
  const getAccountById = (id) => accounts.find(a => a.id === id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}
      {/* Trial Banner */}
      {isInTrial && (
        <Card className="bg-gradient-to-r from-[#00D68F] to-[#00B578] border-0 text-white overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Você está no teste grátis Premium!</p>
              <p className="text-sm text-white/70">Restam {trialDaysLeft} dias. Aproveite todos os recursos!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Banner */}
      {!user?.is_premium && !isInTrial && (
        <Card className="bg-gradient-to-r from-[#6C40D9] to-[#5432B8] border-0 text-white overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Crown className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Experimente MoneyNow Premium por 7 dias grátis!</p>
              <p className="text-sm text-white/70">Controle ilimitado de cartões e contas.</p>
            </div>
            <Link to={createPageUrl('Premium')}>
              <Button size="sm" className="bg-white text-[#6C40D9] hover:bg-white/90 shrink-0">
                Conhecer planos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Receitas no mês"
          value={totalIncome}
          icon={TrendingUp}
          color="success"
        />
        <SummaryCard 
          title="Despesas no mês"
          value={totalExpenses}
          icon={TrendingDown}
          color="danger"
        />
        <SummaryCard 
          title="Saldo geral"
          value={totalBalance}
          icon={Wallet}
          color="info"
          showToggle
        />
        <SummaryCard 
          title="Faturas abertas"
          value={totalInvoices}
          icon={CreditCard}
          color="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tour="quick-actions">
        <QuickActionButton 
          icon={Minus}
          label="Despesa"
          color="danger"
          onClick={() => setTransactionModal({ open: true, type: 'expense' })}
        />
        <QuickActionButton 
          icon={Plus}
          label="Receita"
          color="success"
          onClick={() => setTransactionModal({ open: true, type: 'income' })}
        />
        <QuickActionButton 
          icon={ArrowLeftRight}
          label="Transferência"
          color="info"
          onClick={() => setTransactionModal({ open: true, type: 'transfer' })}
        />
        <QuickActionButton 
          icon={Upload}
          label="Importar"
          color="secondary"
          onClick={() => setImportModal(true)}
        />
      </div>

      {/* Accounts & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Minhas contas</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              data-tour="add-account-button"
              onClick={handleAddAccount}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.length > 0 ? (
              <>
                {accounts.slice(0, 3).map((account) => (
                  <AccountCard 
                    key={account.id} 
                    account={account}
                    onEdit={() => setAccountModal({ open: true, account })}
                    onDelete={() => {}}
                  />
                ))}
                <Link to={createPageUrl('Accounts')}>
                  <Button variant="ghost" className="w-full text-gray-500">
                    Gerenciar contas
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            ) : (
              <EmptyState 
                icon={Wallet}
                message="Adicione sua primeira conta"
                action={
                  <Button 
                    size="sm"
                    onClick={handleAddAccount}
                    className="bg-[#00D68F] hover:bg-[#00B578]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar conta
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Cards */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Meus cartões</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleAddCard}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {cards.length > 0 ? (
              <>
                {cards.slice(0, 2).map((card) => (
                  <CreditCardItem 
                    key={card.id} 
                    card={card}
                    onEdit={() => setCardModal({ open: true, card })}
                    onDelete={() => {}}
                  />
                ))}
                <Link to={createPageUrl('Cards')}>
                  <Button variant="ghost" className="w-full text-gray-500">
                    Gerenciar cartões
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            ) : (
              <EmptyState 
                icon={CreditCard}
                message="Adicione seu primeiro cartão"
                action={
                  <Button 
                    size="sm"
                    onClick={handleAddCard}
                    className="bg-[#6C40D9] hover:bg-[#5432B8]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar cartão
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ExpensesByCategoryChart data={expensesByCategory} type="donut" />
            ) : (
              <EmptyState 
                icon={PieChart}
                message="Você ainda não possui despesas este mês"
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Receitas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeByCategory.length > 0 ? (
              <ExpensesByCategoryChart data={incomeByCategory} type="donut" />
            ) : (
              <EmptyState 
                icon={PieChart}
                message="Você ainda não possui receitas este mês"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Balance Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Balanço mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBalanceChart data={monthlyBalanceData} />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Transações recentes</CardTitle>
          <Link to={createPageUrl('Transactions')}>
            <Button variant="ghost" size="sm">
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-1">
              {recentTransactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id}
                  transaction={transaction}
                  category={getCategoryById(transaction.category_id)}
                  account={getAccountById(transaction.account_id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={ArrowLeftRight}
              message="Nenhuma transação registrada"
              hint="Comece adicionando suas despesas e receitas"
            />
          )}
        </CardContent>
      </Card>

      {/* Onboarding Progress */}
      {onboardingProgress < 100 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-[#6C40D9]" />
              Primeiros passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Progresso</span>
                <span className="font-medium text-[#6C40D9]">{onboardingProgress.toFixed(0)}%</span>
              </div>
              <Progress value={onboardingProgress} className="h-2" />
            </div>
            <div className="space-y-3">
              {onboardingSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00D68F]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={step.done ? 'text-gray-500 line-through' : 'text-gray-700'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <TransactionModal 
        isOpen={transactionModal.open}
        onClose={() => setTransactionModal({ open: false, type: 'expense' })}
        type={transactionModal.type}
        accounts={accounts}
        cards={cards}
        categories={categories}
        onSuccess={loadData}
      />

      <AccountModal 
        isOpen={accountModal.open}
        onClose={() => setAccountModal({ open: false, account: null })}
        account={accountModal.account}
        onSuccess={loadData}
      />

      <CardModal 
        isOpen={cardModal.open}
        onClose={() => setCardModal({ open: false, card: null })}
        card={cardModal.card}
        onSuccess={loadData}
      />

      <PremiumRequiredModal 
        isOpen={premiumModal.open}
        onClose={() => setPremiumModal({ open: false, title: '', message: '' })}
        title={premiumModal.title}
        message={premiumModal.message}
      />

      <ImportModal 
        isOpen={importModal}
        onClose={() => setImportModal(false)}
        accounts={accounts}
        cards={cards}
        onSuccess={loadData}
      />
    </div>
  );
}