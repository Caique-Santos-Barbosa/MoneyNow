import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import MonthlyBalanceChart from '@/components/charts/MonthlyBalanceChart';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from "@/lib/utils";

export default function Reports() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reportType, setReportType] = useState('expenses-by-category');
  const [chartType, setChartType] = useState('donut');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      
      // CRÍTICO: Filtrar por created_by para isolar dados entre usuários
      const [transactionsData, categoriesData] = await Promise.all([
        base44.entities.Transaction.filter({ created_by: user.email }, '-date', 1000),
        base44.entities.Category.list() // Categorias do sistema são compartilhadas
      ]);
      
      setTransactions(transactionsData || []);
      setCategories(categoriesData || []);
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

  // Filter transactions by current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= monthStart && date <= monthEnd;
  });

  // Calculate data for reports
  const expensesByCategory = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === 'expense' && t.category_id === cat.id)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return {
        name: cat.name,
        value: total,
        color: cat.color,
        count: currentMonthTransactions.filter(t => t.type === 'expense' && t.category_id === cat.id).length
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const incomeByCategory = categories
    .filter(cat => cat.type === 'income')
    .map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === 'income' && t.category_id === cat.id)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return {
        name: cat.name,
        value: total,
        color: cat.color,
        count: currentMonthTransactions.filter(t => t.type === 'income' && t.category_id === cat.id).length
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Monthly balance data
  const monthlyBalanceData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(currentDate, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
    
    monthlyBalanceData.push({
      month: format(date, 'MMM', { locale: ptBR }),
      income: monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0),
      expense: monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
    });
  }

  const totalExpenses = expensesByCategory.reduce((sum, c) => sum + c.value, 0);
  const totalIncome = incomeByCategory.reduce((sum, c) => sum + c.value, 0);
  const topCategory = expensesByCategory[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expenses-by-category">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Despesas por categoria
                </div>
              </SelectItem>
              <SelectItem value="income-by-category">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Receitas por categoria
                </div>
              </SelectItem>
              <SelectItem value="monthly-balance">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Balanço mensal
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-gray-700 min-w-[160px] text-center">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Report Content */}
      {reportType === 'expenses-by-category' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Total de despesas</p>
                <p className="text-2xl font-bold text-[#FF5252]">{formatCurrency(totalExpenses)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Maior gasto</p>
                <p className="text-lg font-bold text-gray-900">{topCategory?.name || '-'}</p>
                {topCategory && (
                  <p className="text-sm text-gray-500">{formatCurrency(topCategory.value)}</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Transações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentMonthTransactions.filter(t => t.type === 'expense').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Despesas por categoria</CardTitle>
              <Tabs value={chartType} onValueChange={setChartType}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="pie">Pizza</TabsTrigger>
                  <TabsTrigger value="donut">Rosca</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <ExpensesByCategoryChart data={expensesByCategory} type={chartType} />
              ) : (
                <EmptyState 
                  icon={PieChart}
                  message="Nenhuma despesa encontrada"
                  hint="Não há despesas registradas neste período"
                />
              )}
            </CardContent>
          </Card>

          {/* Table */}
          {expensesByCategory.length > 0 && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Detalhamento</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                          Categoria
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                          Valor
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                          %
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider p-4">
                          Transações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expensesByCategory.map((cat, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="font-medium text-gray-900">{cat.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium text-gray-900">
                            {formatCurrency(cat.value)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${(cat.value / totalExpenses) * 100}%`,
                                    backgroundColor: cat.color
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-500">
                                {((cat.value / totalExpenses) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right text-gray-500">
                            {cat.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {reportType === 'income-by-category' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Total de receitas</p>
                <p className="text-2xl font-bold text-[#00D68F]">{formatCurrency(totalIncome)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Maior receita</p>
                <p className="text-lg font-bold text-gray-900">{incomeByCategory[0]?.name || '-'}</p>
                {incomeByCategory[0] && (
                  <p className="text-sm text-gray-500">{formatCurrency(incomeByCategory[0].value)}</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Transações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentMonthTransactions.filter(t => t.type === 'income').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
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
                  message="Nenhuma receita encontrada"
                  hint="Não há receitas registradas neste período"
                />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {reportType === 'monthly-balance' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Receitas (6 meses)</p>
                <p className="text-2xl font-bold text-[#00D68F]">
                  {formatCurrency(monthlyBalanceData.reduce((s, d) => s + d.income, 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Despesas (6 meses)</p>
                <p className="text-2xl font-bold text-[#FF5252]">
                  {formatCurrency(monthlyBalanceData.reduce((s, d) => s + d.expense, 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Saldo (6 meses)</p>
                <p className={cn(
                  "text-2xl font-bold",
                  monthlyBalanceData.reduce((s, d) => s + d.income - d.expense, 0) >= 0 
                    ? "text-[#00D68F]" 
                    : "text-[#FF5252]"
                )}>
                  {formatCurrency(monthlyBalanceData.reduce((s, d) => s + d.income - d.expense, 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Balanço dos últimos 6 meses</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyBalanceChart data={monthlyBalanceData} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}