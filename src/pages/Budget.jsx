import React, { useState, useEffect } from 'react';
import { StorageManager } from '@/utils/storageManager';
import { getCategoriesByType, addCustomCategory } from '@/data/defaultCategories';
import { createNotification } from '@/utils/notificationManager';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Scale,
  PiggyBank,
  Edit,
  Trash2,
  HelpCircle,
  Copy
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from '@/components/ui/EmptyState';
import { cn } from "@/lib/utils";

export default function Budget() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetType, setBudgetType] = useState('expense');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '💸', color: '#6b7280' });

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = () => {
    setIsLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      // Carregar orçamentos do localStorage
      const allBudgets = StorageManager.getBudgets();
      const monthBudgets = allBudgets.filter(b => 
        b.month === month && b.year === year
      );
      
      // Carregar categorias padrão de despesas
      const expenseCategories = getCategoriesByType('expense');
      
      // Carregar transações para calcular gastos
      const allTransactions = StorageManager.getTransactions();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const monthTransactions = allTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd && t.type === 'expense';
      });
      
      setBudgets(monthBudgets || []);
      setCategories(expenseCategories || []);
      setTransactions(monthTransactions || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryById = (id) => categories.find(c => c.id === id);

  // Calculate actual amounts from transactions
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= monthStart && date <= monthEnd;
  });

  const getActualAmount = (categoryId, type) => {
    return currentMonthTransactions
      .filter(t => t.category_id === categoryId && t.type === type)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  // Merge budgets with actual amounts
  const budgetsWithActual = budgets.map(budget => {
    const category = getCategoryById(budget.category_id);
    return {
      ...budget,
      category,
      actual_amount: getActualAmount(budget.category_id, category?.type || 'expense')
    };
  });

  const incomeBudgets = budgetsWithActual.filter(b => b.category?.type === 'income');
  const expenseBudgets = budgetsWithActual.filter(b => b.category?.type === 'expense');

  // Summary calculations
  const plannedIncome = incomeBudgets.reduce((sum, b) => sum + (b.planned_amount || 0), 0);
  const plannedExpenses = expenseBudgets.reduce((sum, b) => sum + (b.planned_amount || 0), 0);
  const plannedBalance = plannedIncome - plannedExpenses;
  const savingsPercentage = plannedIncome > 0 ? ((plannedBalance / plannedIncome) * 100) : 0;

  const getProgressColor = (actual, planned, type) => {
    const percentage = planned > 0 ? (actual / planned) * 100 : 0;
    if (type === 'income') {
      return percentage >= 100 ? 'bg-[#00D68F]' : 'bg-[#FFC107]';
    }
    if (percentage >= 100) return 'bg-[#FF5252]';
    if (percentage >= 80) return 'bg-[#FFC107]';
    return 'bg-[#00D68F]';
  };

  const handleSaveBudget = (data) => {
    try {
      if (!data.category_id || !data.planned_amount) {
        alert('Preencha categoria e valor');
        return;
      }
      
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const budgetData = {
        category_id: data.category_id,
        amount: parseFloat(data.planned_amount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
        planned_amount: parseFloat(data.planned_amount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
        month,
        year,
        spent: 0,
        actual_amount: 0,
        alert_threshold: data.alert_threshold || 80
      };
      
      if (selectedBudget?.id) {
        StorageManager.updateBudget(selectedBudget.id, budgetData);
      } else {
        // Verificar se já existe orçamento para esta categoria neste mês
        const existing = budgets.find(b => 
          b.category_id === data.category_id && 
          b.month === month && 
          b.year === year
        );
        
        if (existing) {
          alert('Já existe um orçamento para esta categoria neste mês');
          return;
        }
        
        StorageManager.addBudget(budgetData);
        createNotification.transactionAdded('expense', 'Orçamento criado com sucesso');
      }
      
      setModalOpen(false);
      setSelectedBudget(null);
      loadData();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Erro ao salvar orçamento');
    }
  };

  const handleDeleteBudget = (budgetId) => {
    try {
      StorageManager.deleteBudget(budgetId);
      loadData();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const copyPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    const prevMonthNum = prevMonth.getMonth() + 1;
    const prevYear = prevMonth.getFullYear();
    
    // Carregar orçamentos do mês anterior
    const allBudgets = StorageManager.getBudgets();
    const prevBudgets = allBudgets.filter(b => 
      b.month === prevMonthNum && b.year === prevYear
    );

    if (prevBudgets.length === 0) {
      alert('Não há orçamentos no mês anterior para copiar');
      return;
    }

    const currentMonthNum = currentMonth.getMonth() + 1;
    const currentYear = currentMonth.getFullYear();

    for (const budget of prevBudgets) {
      // Verificar se já existe para esta categoria
      const existing = budgets.find(b => 
        b.category_id === budget.category_id && 
        b.month === currentMonthNum && 
        b.year === currentYear
      );
      
      if (!existing) {
        StorageManager.addBudget({
          category_id: budget.category_id,
          amount: budget.amount || budget.planned_amount,
          planned_amount: budget.amount || budget.planned_amount,
          month: currentMonthNum,
          year: currentYear,
          spent: 0,
          actual_amount: 0,
          alert_threshold: budget.alert_threshold || 80
        });
      }
    }

    loadData();
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Digite um nome para a categoria');
      return;
    }
    
    const created = addCustomCategory('expense', newCategory);
    const expenseCategories = getCategoriesByType('expense');
    setCategories(expenseCategories);
    setShowNewCategoryModal(false);
    setNewCategory({ name: '', icon: '💸', color: '#6b7280' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Planejamento Mensal</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Defina quanto você pretende gastar em cada categoria</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 font-medium text-gray-700 min-w-[140px] text-center">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={copyPreviousMonth}>
                Copiar planejamento do mês anterior
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00D68F]/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-[#00D68F]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Receitas planejadas</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(plannedIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF5252]/10 rounded-xl">
                <TrendingDown className="w-5 h-5 text-[#FF5252]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Gastos planejados</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(plannedExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2196F3]/10 rounded-xl">
                <Scale className="w-5 h-5 text-[#2196F3]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Balanço planejado</p>
                <p className={cn(
                  "text-lg font-bold",
                  plannedBalance >= 0 ? "text-[#00D68F]" : "text-[#FF5252]"
                )}>
                  {formatCurrency(plannedBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6C40D9]/10 rounded-xl">
                <PiggyBank className="w-5 h-5 text-[#6C40D9]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Economia planejada</p>
                <p className="text-lg font-bold text-gray-900">{savingsPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {budgets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <EmptyState 
              icon={Scale}
              message="Nenhum orçamento definido para este mês"
              hint="Crie seu planejamento financeiro mensal"
              action={
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setBudgetType('expense');
                      setSelectedBudget(null);
                      setModalOpen(true);
                    }}
                    className="bg-[#00D68F] hover:bg-[#00B578]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Definir planejamento
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={copyPreviousMonth}
                  >
                    Copiar mês anterior
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Income Budgets */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#00D68F]">
                Receitas planejadas
              </CardTitle>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {
                  setBudgetType('income');
                  setSelectedBudget(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {incomeBudgets.length > 0 ? (
                <div className="space-y-4">
                  {incomeBudgets.map(budget => (
                    <BudgetItem 
                      key={budget.id}
                      budget={budget}
                      type="income"
                      onEdit={() => {
                        setBudgetType('income');
                        setSelectedBudget(budget);
                        setModalOpen(true);
                      }}
                      onDelete={() => handleDeleteBudget(budget.id)}
                      formatCurrency={formatCurrency}
                      getProgressColor={getProgressColor}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma receita planejada
                </p>
              )}
            </CardContent>
          </Card>

          {/* Expense Budgets */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#FF5252]">
                Despesas planejadas
              </CardTitle>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {
                  setBudgetType('expense');
                  setSelectedBudget(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {expenseBudgets.length > 0 ? (
                <div className="space-y-4">
                  {expenseBudgets.map(budget => (
                    <BudgetItem 
                      key={budget.id}
                      budget={budget}
                      type="expense"
                      onEdit={() => {
                        setBudgetType('expense');
                        setSelectedBudget(budget);
                        setModalOpen(true);
                      }}
                      onDelete={() => handleDeleteBudget(budget.id)}
                      formatCurrency={formatCurrency}
                      getProgressColor={getProgressColor}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma despesa planejada
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Budget Modal */}
      <BudgetModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        type={budgetType}
        categories={categories}
        existingBudgets={budgets}
        onSave={handleSaveBudget}
        onCategoryCreated={() => {
          // Recarregar categorias
          const expenseCategories = getCategoriesByType('expense');
          setCategories(expenseCategories);
        }}
      />

      {/* Modal de Nova Categoria (no componente principal para recarregar categorias) */}
      <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da categoria</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Ex: Educação online"
              />
            </div>
            <div>
              <Label>Emoji (ícone)</Label>
              <div className="grid grid-cols-8 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                {['🍔', '🚗', '🏠', '🏥', '📚', '🎮', '🛒', '📄', '🐕', '🎁', '💸', '✈️', '🎬', '🏋️', '💻', '📱', '👕', '⚡', '🎨', '🎵', '📷', '☕', '🍕', '🌟', '💰', '🎓', '🚀', '💼', '🎯', '💡', '🔧', '🏆'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCategory({...newCategory, icon: emoji})}
                    className={cn(
                      "text-2xl p-2 rounded hover:bg-gray-100 transition-colors",
                      newCategory.icon === emoji && "bg-[#00D68F]/10 ring-2 ring-[#00D68F]"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Cor</Label>
              <div className="grid grid-cols-6 gap-2">
                {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6', '#f43f5e', '#a855f7'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({...newCategory, color})}
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all",
                      newCategory.color === color && "ring-2 ring-offset-2 ring-gray-900"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowNewCategoryModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory}>
              Criar categoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BudgetItem({ budget, type, onEdit, onDelete, formatCurrency, getProgressColor }) {
  const percentage = budget.planned_amount > 0 
    ? (budget.actual_amount / budget.planned_amount) * 100 
    : 0;

  return (
    <div className="group p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${budget.category?.color}15` }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: budget.category?.color }}
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{budget.category?.name}</h4>
            <p className="text-xs text-gray-500">
              {formatCurrency(budget.actual_amount)} de {formatCurrency(budget.planned_amount)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold px-2 py-1 rounded-lg",
            percentage >= 100 && type === 'expense' && "bg-[#FF5252]/10 text-[#FF5252]",
            percentage >= 80 && percentage < 100 && type === 'expense' && "bg-[#FFC107]/10 text-[#FFC107]",
            percentage < 80 && type === 'expense' && "bg-[#00D68F]/10 text-[#00D68F]",
            type === 'income' && percentage >= 100 && "bg-[#00D68F]/10 text-[#00D68F]",
            type === 'income' && percentage < 100 && "bg-[#FFC107]/10 text-[#FFC107]"
          )}>
            {percentage.toFixed(0)}%
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="w-4 h-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
            getProgressColor(budget.actual_amount, budget.planned_amount, type)
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {type === 'expense' && percentage >= 80 && (
        <p className={cn(
          "text-xs mt-2",
          percentage >= 100 ? "text-[#FF5252]" : "text-[#FFC107]"
        )}>
          {percentage >= 100 
            ? '⚠️ Orçamento ultrapassado!' 
            : '⚠️ Atenção: você já gastou 80% do orçamento'}
        </p>
      )}
    </div>
  );
}

function BudgetModal({ isOpen, onClose, budget, type, categories, existingBudgets, onSave, onCategoryCreated }) {
  const [formData, setFormData] = useState({
    category_id: '',
    planned_amount: '',
    alert_threshold: 80
  });
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '💸', color: '#6b7280' });

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        planned_amount: budget.planned_amount?.toString() || '',
        alert_threshold: budget.alert_threshold || 80
      });
    } else {
      setFormData({
        category_id: '',
        planned_amount: '',
        alert_threshold: 80
      });
    }
  }, [budget, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      category_id: formData.category_id,
      planned_amount: parseFloat(formData.planned_amount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
      alert_threshold: formData.alert_threshold
    });
  };

  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const number = parseInt(numericValue, 10) / 100;
    if (isNaN(number)) return '';
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Filter out categories that already have budgets
  const availableCategories = categories.filter(cat => 
    budget?.category_id === cat.id || !existingBudgets.some(b => b.category_id === cat.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? 'Editar' : 'Adicionar'} orçamento de {type === 'income' ? 'receita' : 'despesa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select 
              value={formData.category_id}
              onValueChange={(value) => {
                if (value === 'add_new') {
                  setShowNewCategoryModal(true);
                } else {
                  setFormData({ ...formData, category_id: value });
                }
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      {!category.icon && category.color && (
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span>{category.name}</span>
                      {category.custom && (
                        <span className="text-xs text-gray-500">(Personalizada)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                <div className="border-t my-1" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNewCategoryModal(true);
                  }}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 text-[#00D68F] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Criar nova categoria
                </button>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned_amount">Valor planejado</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <Input
                id="planned_amount"
                className="pl-10"
                placeholder="0,00"
                value={formData.planned_amount}
                onChange={(e) => setFormData({ ...formData, planned_amount: formatCurrencyInput(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#00D68F] hover:bg-[#00B578]">
              {budget ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de Nova Categoria */}
      <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da categoria</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Ex: Educação online"
              />
            </div>
            <div>
              <Label>Emoji (ícone)</Label>
              <div className="grid grid-cols-8 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                {['🍔', '🚗', '🏠', '🏥', '📚', '🎮', '🛒', '📄', '🐕', '🎁', '💸', '✈️', '🎬', '🏋️', '💻', '📱', '👕', '⚡', '🎨', '🎵', '📷', '☕', '🍕', '🌟', '💰', '🎓', '🚀', '💼', '🎯', '💡', '🔧', '🏆'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCategory({...newCategory, icon: emoji})}
                    className={cn(
                      "text-2xl p-2 rounded hover:bg-gray-100 transition-colors",
                      newCategory.icon === emoji && "bg-[#00D68F]/10 ring-2 ring-[#00D68F]"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Cor</Label>
              <div className="grid grid-cols-6 gap-2">
                {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6', '#f43f5e', '#a855f7'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({...newCategory, color})}
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all",
                      newCategory.color === color && "ring-2 ring-offset-2 ring-gray-900"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowNewCategoryModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (!newCategory.name.trim()) {
                alert('Digite um nome para a categoria');
                return;
              }
              
              const created = addCustomCategory('expense', newCategory);
              setFormData({...formData, category_id: created.id});
              setShowNewCategoryModal(false);
              setNewCategory({ name: '', icon: '💸', color: '#6b7280' });
              onCategoryCreated?.();
            }}>
              Criar categoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}