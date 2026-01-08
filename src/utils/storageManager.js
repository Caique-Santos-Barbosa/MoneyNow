// Gerenciador centralizado de dados no localStorage
export const StorageManager = {
  // TRANSAÇÕES
  getTransactions() {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  },
  
  addTransaction(transaction) {
    const transactions = this.getTransactions();
    const newTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      ...transaction
    };
    transactions.unshift(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    return newTransaction;
  },
  
  updateTransaction(id, updates) {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      localStorage.setItem('transactions', JSON.stringify(transactions));
      return transactions[index];
    }
    return null;
  },
  
  deleteTransaction(id) {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(filtered));
  },
  
  // CONTAS
  getAccounts() {
    return JSON.parse(localStorage.getItem('accounts') || '[]');
  },
  
  addAccount(account) {
    const accounts = this.getAccounts();
    const newAccount = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      current_balance: 0,
      balance: 0,
      ...account
    };
    accounts.push(newAccount);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    return newAccount;
  },
  
  updateAccount(id, updates) {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates };
      localStorage.setItem('accounts', JSON.stringify(accounts));
      return accounts[index];
    }
    return null;
  },
  
  deleteAccount(id) {
    const accounts = this.getAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    localStorage.setItem('accounts', JSON.stringify(filtered));
  },
  
  // CARTÕES
  getCards() {
    return JSON.parse(localStorage.getItem('cards') || '[]');
  },
  
  addCard(card) {
    const cards = this.getCards();
    const newCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      current_invoice: 0,
      currentBill: 0,
      ...card
    };
    cards.push(newCard);
    localStorage.setItem('cards', JSON.stringify(cards));
    return newCard;
  },
  
  updateCard(id, updates) {
    const cards = this.getCards();
    const index = cards.findIndex(c => c.id === id);
    if (index !== -1) {
      cards[index] = { ...cards[index], ...updates };
      localStorage.setItem('cards', JSON.stringify(cards));
      return cards[index];
    }
    return null;
  },
  
  deleteCard(id) {
    const cards = this.getCards();
    const filtered = cards.filter(c => c.id !== id);
    localStorage.setItem('cards', JSON.stringify(filtered));
  },
  
  // METAS
  getGoals() {
    return JSON.parse(localStorage.getItem('goals') || '[]');
  },
  
  addGoal(goal) {
    const goals = this.getGoals();
    const newGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      current_amount: 0,
      ...goal
    };
    goals.push(newGoal);
    localStorage.setItem('goals', JSON.stringify(goals));
    return newGoal;
  },
  
  updateGoal(id, updates) {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      localStorage.setItem('goals', JSON.stringify(goals));
      return goals[index];
    }
    return null;
  },
  
  deleteGoal(id) {
    const goals = this.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    localStorage.setItem('goals', JSON.stringify(filtered));
  },
  
  // PLANEJAMENTO (Budget)
  getBudgets() {
    return JSON.parse(localStorage.getItem('budgets') || '[]');
  },
  
  addBudget(budget) {
    const budgets = this.getBudgets();
    const newBudget = {
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      spent: 0,
      actual_amount: 0,
      ...budget
    };
    budgets.push(newBudget);
    localStorage.setItem('budgets', JSON.stringify(budgets));
    return newBudget;
  },
  
  updateBudget(id, updates) {
    const budgets = this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      localStorage.setItem('budgets', JSON.stringify(budgets));
      return budgets[index];
    }
    return null;
  },
  
  deleteBudget(id) {
    const budgets = this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    localStorage.setItem('budgets', JSON.stringify(filtered));
  }
};

