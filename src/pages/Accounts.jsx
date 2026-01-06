import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Plus,
  Eye,
  EyeOff,
  Filter,
  MoreVertical,
  Wallet,
  PiggyBank,
  Building2,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AccountCard from '@/components/dashboard/AccountCard';
import AccountModal from '@/components/modals/AccountModal';
import EmptyState from '@/components/ui/EmptyState';
import PremiumRequiredModal from '@/components/premium/PremiumRequiredModal';
import { usePremiumCheck } from '@/components/hooks/usePremiumCheck';
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

const iconMap = {
  wallet: Wallet,
  'piggy-bank': PiggyBank,
  building: Building2,
  'trending-up': TrendingUp
};

export default function Accounts() {
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });
  const [premiumModal, setPremiumModal] = useState({ open: false, title: '', message: '' });
  const { isPremium, checkLimit } = usePremiumCheck();

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
    setSelectedAccount(null);
    setModalOpen(true);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      // CRÍTICO: Filtrar por created_by para isolar dados entre usuários
      const data = await base44.entities.Account.filter({ created_by: user.email });
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.account) return;
    try {
      await base44.entities.Account.delete(deleteDialog.account.id);
      setDeleteDialog({ open: false, account: null });
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalBalance = accounts
    .filter(a => a.include_in_total !== false && a.is_active !== false)
    .reduce((sum, a) => sum + (a.current_balance || 0), 0);

  const typeLabels = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    cash: 'Dinheiro',
    investment: 'Investimento'
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Minhas contas</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={handleAddAccount}
            className="bg-[#00D68F] hover:bg-[#00B578]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova conta
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#00D68F]/10 to-[#00D68F]/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Saldo total</p>
              <p className="text-3xl font-bold text-gray-900">
                {showBalance ? formatCurrency(totalBalance) : '••••••'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Saldo previsto</p>
              <p className="text-xl font-semibold text-gray-700">
                {showBalance ? formatCurrency(totalBalance) : '••••••'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* New Account Card */}
          <Card 
            className="border-2 border-dashed border-gray-200 hover:border-[#00D68F] cursor-pointer transition-colors group"
            onClick={handleAddAccount}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-40">
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-[#00D68F]/10 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#00D68F] transition-colors" />
              </div>
              <p className="text-gray-500 group-hover:text-[#00D68F] font-medium transition-colors">
                Nova conta
              </p>
            </CardContent>
          </Card>

          {/* Account Cards */}
          {accounts.map((account) => {
            const Icon = iconMap[account.icon] || Wallet;
            return (
              <Card 
                key={account.id} 
                className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div 
                  className="h-1"
                  style={{ backgroundColor: account.color }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: account.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.name}</h3>
                        <p className="text-xs text-gray-500">{typeLabels[account.type]}</p>
                      </div>
                    </div>
                    {account.bank && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                        {account.bank}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Saldo atual</p>
                      <p className={`text-xl font-bold ${account.current_balance >= 0 ? 'text-gray-900' : 'text-[#FF5252]'}`}>
                        {showBalance ? formatCurrency(account.current_balance) : '••••••'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Saldo previsto</p>
                      <p className="text-sm font-medium text-gray-600">
                        {showBalance ? formatCurrency(account.current_balance) : '••••••'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedAccount(account);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteDialog({ open: true, account })}
                    >
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <EmptyState 
              icon={Wallet}
              message="Você ainda não possui contas cadastradas"
              hint="Adicione sua primeira conta para começar a controlar suas finanças"
              action={
                <Button 
                  onClick={handleAddAccount}
                  className="bg-[#00D68F] hover:bg-[#00B578]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar conta
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Account Modal */}
      <AccountModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        onSuccess={loadAccounts}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, account: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta "{deleteDialog.account?.name}"? 
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