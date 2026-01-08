import React, { useState, useEffect } from 'react';
import { StorageManager } from '@/utils/storageManager';
import GoalModal from '@/components/modals/GoalModal';
import { format, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Target,
  Trophy,
  Edit,
  Trash2,
  PlusCircle,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Gift,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from '@/components/ui/EmptyState';
import PremiumRequiredModal from '@/components/premium/PremiumRequiredModal';
import { usePremiumCheck } from '@/components/hooks/usePremiumCheck';
import { cn } from "@/lib/utils";

const iconMap = {
  target: Target,
  home: Home,
  car: Car,
  plane: Plane,
  'graduation-cap': GraduationCap,
  heart: Heart,
  gift: Gift,
  briefcase: Briefcase,
  'trending-up': TrendingUp
};

const colors = [
  '#6C40D9', '#00D68F', '#FF5252', '#2196F3',
  '#FFC107', '#9C27B0', '#E91E63', '#00BCD4'
];

const icons = ['target', 'home', 'car', 'plane', 'graduation-cap', 'heart', 'gift', 'briefcase', 'trending-up'];

export default function Goals() {
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, goal: null });
  const [addAmountModal, setAddAmountModal] = useState({ open: false, goal: null });
  const [premiumModal, setPremiumModal] = useState({ open: false, title: '', message: '' });
  const { isPremium, checkLimit } = usePremiumCheck();

  const handleAddGoal = async () => {
    const { allowed, current, limit } = await checkLimit('goals');
    if (!allowed) {
      setPremiumModal({
        open: true,
        title: 'Limite de metas atingido',
        message: `Você já tem ${current} de ${limit} metas cadastradas. Faça upgrade para Premium e tenha metas ilimitadas!`
      });
      return;
    }
    setSelectedGoal(null);
    setModalOpen(true);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    setIsLoading(true);
    try {
      const data = StorageManager.getGoals();
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!deleteDialog.goal) return;
    try {
      StorageManager.deleteGoal(deleteDialog.goal.id);
      setDeleteDialog({ open: false, goal: null });
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const activeGoals = goals.filter(g => !g.is_achieved && g.is_active);
  const achievedGoals = goals.filter(g => g.is_achieved);

  const totalSaved = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Metas financeiras</h1>
        <Button 
          onClick={handleAddGoal}
          className="bg-[#6C40D9] hover:bg-[#5432B8]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova meta
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Metas ativas</p>
            <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total economizado</p>
            <p className="text-2xl font-bold text-[#00D68F]">{formatCurrency(totalSaved)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Metas conquistadas</p>
            <p className="text-2xl font-bold text-[#6C40D9]">{achievedGoals.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="active">Ativas ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="achieved">Conquistadas ({achievedGoals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeGoals.length > 0 || goals.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Goal Card */}
              <Card 
                className="border-2 border-dashed border-gray-200 hover:border-[#6C40D9] cursor-pointer transition-colors group"
                onClick={handleAddGoal}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-64">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-[#6C40D9]/10 flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#6C40D9] transition-colors" />
                  </div>
                  <p className="text-gray-500 group-hover:text-[#6C40D9] font-medium transition-colors">
                    Criar nova meta
                  </p>
                </CardContent>
              </Card>

              {/* Goal Cards */}
              {activeGoals.map((goal) => (
                <GoalCard 
                  key={goal.id}
                  goal={goal}
                  formatCurrency={formatCurrency}
                  onEdit={() => {
                    setSelectedGoal(goal);
                    setModalOpen(true);
                  }}
                  onDelete={() => setDeleteDialog({ open: true, goal })}
                  onAddAmount={() => setAddAmountModal({ open: true, goal })}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12">
                <EmptyState 
                  icon={Target}
                  message="Você ainda não tem metas ativas"
                  hint="Crie sua primeira meta e comece a transformar seus sonhos em realidade!"
                  action={
                    <Button 
                      onClick={handleAddGoal}
                      className="bg-[#6C40D9] hover:bg-[#5432B8]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeira meta
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achieved" className="mt-6">
          {achievedGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievedGoals.map((goal) => (
                <GoalCard 
                  key={goal.id}
                  goal={goal}
                  formatCurrency={formatCurrency}
                  onEdit={() => {
                    setSelectedGoal(goal);
                    setModalOpen(true);
                  }}
                  onDelete={() => setDeleteDialog({ open: true, goal })}
                  achieved
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12">
                <EmptyState 
                  icon={Trophy}
                  message="Nenhuma meta conquistada ainda"
                  hint="Continue economizando e em breve você terá suas conquistas aqui!"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Goal Modal */}
      <GoalModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
        onSuccess={loadGoals}
      />

      {/* Add Amount Modal */}
      <AddAmountModal 
        isOpen={addAmountModal.open}
        onClose={() => setAddAmountModal({ open: false, goal: null })}
        goal={addAmountModal.goal}
        onSuccess={loadGoals}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, goal: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a meta "{deleteDialog.goal?.name}"? 
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

      <PremiumRequiredModal 
        isOpen={premiumModal.open}
        onClose={() => setPremiumModal({ open: false, title: '', message: '' })}
        title={premiumModal.title}
        message={premiumModal.message}
      />
    </div>
  );
}

function GoalCard({ goal, formatCurrency, onEdit, onDelete, onAddAmount, achieved }) {
  const Icon = iconMap[goal.icon] || Target;
  const percentage = goal.target_amount > 0 
    ? (goal.current_amount / goal.target_amount) * 100 
    : 0;
  const remaining = goal.target_amount - goal.current_amount;

  // Calculate monthly estimate
  let monthlyEstimate = null;
  if (goal.deadline && remaining > 0) {
    const monthsLeft = differenceInMonths(new Date(goal.deadline), new Date());
    if (monthsLeft > 0) {
      monthlyEstimate = remaining / monthsLeft;
    }
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div 
        className="h-2"
        style={{ backgroundColor: goal.color }}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${goal.color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color: goal.color }} />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!achieved && (
                <DropdownMenuItem onClick={onAddAmount}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar valor
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{goal.name}</h3>
        {goal.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{goal.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progresso</span>
            <span className="font-semibold" style={{ color: goal.color }}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: goal.color
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatCurrency(goal.current_amount)}</span>
            <span>{formatCurrency(goal.target_amount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Falta</p>
            <p className="font-semibold text-gray-900">{formatCurrency(Math.max(remaining, 0))}</p>
          </div>
          {goal.deadline && (
            <div>
              <p className="text-gray-500 text-xs">Prazo</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(goal.deadline), "dd/MM/yyyy")}
              </p>
            </div>
          )}
        </div>

        {monthlyEstimate && !achieved && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              Economize <span className="font-semibold text-gray-700">{formatCurrency(monthlyEstimate)}</span>/mês para atingir
            </p>
          </div>
        )}

        {achieved && (
          <div className="mt-3 p-3 bg-[#00D68F]/10 rounded-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00D68F]" />
            <span className="text-sm font-medium text-[#00D68F]">Meta conquistada!</span>
          </div>
        )}

        {!achieved && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={onAddAmount}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar valor
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AddAmountModal({ isOpen, onClose, goal, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const number = parseInt(numericValue, 10) / 100;
    if (isNaN(number)) return '';
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goal) return;
    
    setIsLoading(true);
    try {
      const addedAmount = parseFloat(amount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      const newAmount = (goal.current_amount || 0) + addedAmount;
      
      StorageManager.updateGoal(goal.id, {
        current_amount: newAmount,
        is_achieved: newAmount >= goal.target_amount
      });

      setAmount('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding amount:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar valor à meta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <p className="text-sm text-gray-500">
            Meta: <span className="font-medium text-gray-900">{goal?.name}</span>
          </p>

          <div className="space-y-2">
            <Label htmlFor="add_amount">Valor a adicionar</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <Input
                id="add_amount"
                className="pl-10"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-[#00D68F] hover:bg-[#00B578]"
              disabled={isLoading}
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}