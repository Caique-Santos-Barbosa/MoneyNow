import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Filter,
  Download,
  Search,
  ArrowLeftRight,
  ChevronDown,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TransactionItem from '@/components/dashboard/TransactionItem';
import TransactionModal from '@/components/modals/TransactionModal';
import EmptyState from '@/components/ui/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function Transactions() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    types: ['income', 'expense', 'transfer'],
    status: ['paid', 'pending'],
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    },
    accounts: [],
    categories: []
  });

  // Modal states
  const [transactionModal, setTransactionModal] = useState({ open: false, type: 'expense', transaction: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, transaction: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      
      // CRÍTICO: Filtrar TODOS os dados por created_by para isolar dados entre usuários
      const [transactionsData, accountsData, cardsData, categoriesData] = await Promise.all([
        base44.entities.Transaction.filter({ created_by: user.email }, '-date', 200),
        base44.entities.Account.filter({ created_by: user.email }),
        base44.entities.Card.filter({ created_by: user.email }),
        base44.entities.Category.list() // Categorias do sistema são compartilhadas
      ]);
      
      setTransactions(transactionsData || []);
      setAccounts(accountsData || []);
      setCards(cardsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.transaction) return;
    try {
      await base44.entities.Transaction.delete(deleteDialog.transaction.id);
      setDeleteDialog({ open: false, transaction: null });
      loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleMarkPaid = async (transaction) => {
    try {
      await base44.entities.Transaction.update(transaction.id, { is_paid: true });
      loadData();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDuplicate = async (transaction) => {
    const { id, created_date, updated_date, created_by, ...data } = transaction;
    try {
      await base44.entities.Transaction.create({
        ...data,
        date: format(new Date(), 'yyyy-MM-dd'),
        is_paid: false
      });
      loadData();
    } catch (error) {
      console.error('Error duplicating transaction:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryById = (id) => categories.find(c => c.id === id);
  const getAccountById = (id) => accounts.find(a => a.id === id);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    // Search
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (!filters.types.includes(t.type)) {
      return false;
    }
    
    // Status filter
    const isPaid = t.is_paid ? 'paid' : 'pending';
    if (!filters.status.includes(isPaid)) {
      return false;
    }
    
    // Date filter
    const transactionDate = new Date(t.date);
    if (filters.dateRange.from && transactionDate < filters.dateRange.from) {
      return false;
    }
    if (filters.dateRange.to && transactionDate > filters.dateRange.to) {
      return false;
    }
    
    return true;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20 rounded-2xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <div className="flex items-center gap-2">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {filters.dateRange.from ? (
                          <>
                            {format(filters.dateRange.from, "dd/MM/yyyy")} - {" "}
                            {filters.dateRange.to ? format(filters.dateRange.to, "dd/MM/yyyy") : "..."}
                          </>
                        ) : (
                          "Selecione o período"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={filters.dateRange}
                        onSelect={(range) => setFilters({ ...filters, dateRange: range || {} })}
                        locale={ptBR}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <div className="space-y-2">
                    {[
                      { value: 'income', label: 'Receitas', color: 'text-[#00D68F]' },
                      { value: 'expense', label: 'Despesas', color: 'text-[#FF5252]' },
                      { value: 'transfer', label: 'Transferências', color: 'text-[#2196F3]' }
                    ].map(type => (
                      <div key={type.value} className="flex items-center gap-2">
                        <Checkbox 
                          checked={filters.types.includes(type.value)}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              types: checked 
                                ? [...filters.types, type.value]
                                : filters.types.filter(t => t !== type.value)
                            });
                          }}
                        />
                        <span className={type.color}>{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="space-y-2">
                    {[
                      { value: 'paid', label: 'Pagas/Recebidas' },
                      { value: 'pending', label: 'Pendentes' }
                    ].map(status => (
                      <div key={status.value} className="flex items-center gap-2">
                        <Checkbox 
                          checked={filters.status.includes(status.value)}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              status: checked 
                                ? [...filters.status, status.value]
                                : filters.status.filter(s => s !== status.value)
                            });
                          }}
                        />
                        <span>{status.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({
                    types: ['income', 'expense', 'transfer'],
                    status: ['paid', 'pending'],
                    dateRange: {
                      from: startOfMonth(new Date()),
                      to: endOfMonth(new Date())
                    },
                    accounts: [],
                    categories: []
                  })}
                >
                  Limpar filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>

          <Button 
            onClick={() => setTransactionModal({ open: true, type: 'expense', transaction: null })}
            className="bg-[#00D68F] hover:bg-[#00B578]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova transação
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Buscar transações..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Receitas</p>
            <p className="text-lg font-bold text-[#00D68F]">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Despesas</p>
            <p className="text-lg font-bold text-[#FF5252]">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Saldo</p>
            <p className={cn(
              "text-lg font-bold",
              balance >= 0 ? "text-[#00D68F]" : "text-[#FF5252]"
            )}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">
                  {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <span className="text-xs text-gray-400">
                  {groupedTransactions[date].length} transação(ões)
                </span>
              </div>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-2">
                  {groupedTransactions[date].map((transaction) => (
                    <TransactionItem 
                      key={transaction.id}
                      transaction={transaction}
                      category={getCategoryById(transaction.category_id)}
                      account={getAccountById(transaction.account_id)}
                      onClick={() => setTransactionModal({ 
                        open: true, 
                        type: transaction.type, 
                        transaction 
                      })}
                      onEdit={() => setTransactionModal({ 
                        open: true, 
                        type: transaction.type, 
                        transaction 
                      })}
                      onDuplicate={() => handleDuplicate(transaction)}
                      onDelete={() => setDeleteDialog({ open: true, transaction })}
                      onMarkPaid={() => handleMarkPaid(transaction)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <EmptyState 
              icon={ArrowLeftRight}
              message="Nenhuma transação encontrada"
              hint="Adicione uma transação ou ajuste os filtros"
              action={
                <Button 
                  onClick={() => setTransactionModal({ open: true, type: 'expense', transaction: null })}
                  className="bg-[#00D68F] hover:bg-[#00B578]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar transação
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={transactionModal.open}
        onClose={() => setTransactionModal({ open: false, type: 'expense', transaction: null })}
        type={transactionModal.type}
        transaction={transactionModal.transaction}
        accounts={accounts}
        cards={cards}
        categories={categories}
        onSuccess={loadData}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, transaction: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}