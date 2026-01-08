export const defaultCategories = {
  income: [
    { id: 'salary', name: 'Salário', icon: '💼', color: '#10b981' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6' },
    { id: 'investment', name: 'Investimentos', icon: '📈', color: '#8b5cf6' },
    { id: 'bonus', name: 'Bônus', icon: '🎁', color: '#f59e0b' },
    { id: 'other_income', name: 'Outras Receitas', icon: '💰', color: '#6b7280' }
  ],
  expense: [
    { id: 'food', name: 'Alimentação', icon: '🍔', color: '#ef4444' },
    { id: 'transport', name: 'Transporte', icon: '🚗', color: '#f59e0b' },
    { id: 'housing', name: 'Moradia', icon: '🏠', color: '#8b5cf6' },
    { id: 'health', name: 'Saúde', icon: '🏥', color: '#ec4899' },
    { id: 'education', name: 'Educação', icon: '📚', color: '#3b82f6' },
    { id: 'entertainment', name: 'Lazer', icon: '🎮', color: '#10b981' },
    { id: 'shopping', name: 'Compras', icon: '🛒', color: '#f43f5e' },
    { id: 'bills', name: 'Contas', icon: '📄', color: '#6b7280' },
    { id: 'pets', name: 'Pets', icon: '🐕', color: '#a855f7' },
    { id: 'gifts', name: 'Presentes', icon: '🎁', color: '#ec4899' },
    { id: 'other_expense', name: 'Outras Despesas', icon: '💸', color: '#64748b' }
  ]
};

// Funções helpers
export const getCategoriesByType = (type) => {
  const stored = localStorage.getItem('custom_categories');
  const custom = stored ? JSON.parse(stored) : { income: [], expense: [] };
  
  return [...defaultCategories[type], ...(custom[type] || [])];
};

export const addCustomCategory = (type, category) => {
  const stored = localStorage.getItem('custom_categories');
  const custom = stored ? JSON.parse(stored) : { income: [], expense: [] };
  
  const newCategory = {
    id: `custom_${Date.now()}`,
    ...category,
    custom: true
  };
  
  custom[type] = [...(custom[type] || []), newCategory];
  localStorage.setItem('custom_categories', JSON.stringify(custom));
  
  return newCategory;
};

export const deleteCustomCategory = (type, categoryId) => {
  const stored = localStorage.getItem('custom_categories');
  const custom = stored ? JSON.parse(stored) : { income: [], expense: [] };
  
  custom[type] = (custom[type] || []).filter(c => c.id !== categoryId);
  localStorage.setItem('custom_categories', JSON.stringify(custom));
};

