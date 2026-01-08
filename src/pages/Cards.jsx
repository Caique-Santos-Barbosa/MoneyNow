import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Plus,
  CreditCard,
  MoreVertical,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreditCardItem from '@/components/dashboard/CreditCardItem';
import CardModal from '@/components/modals/CardModal';
import TransactionModal from '@/components/modals/TransactionModal';
import EmptyState from '@/components/ui/EmptyState';
import PremiumRequiredModal from '@/components/premium/PremiumRequiredModal';
import { usePremiumCheck } from '@/components/hooks/usePremiumCheck';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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

export default function Cards() {
  const navigate = useNavigate();
  const { isPremium, checkLimit } = usePremiumCheck();
  const [premiumModal, setPremiumModal] = useState({ open: false, title: '', message: '' });

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
    setSelectedCard(null);
    setModalOpen(true);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('open');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, card: null });
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [selectedCardForExpense, setSelectedCardForExpense] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      
      if (!user || !user?.email) {
        setCards([]);
        return;
      }
      
      // CRÍTICO: Filtrar por created_by para isolar dados entre usuários
      const data = await base44.entities.Card.filter({ created_by: user.email });
      setCards(data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.card) return;
    try {
      await base44.entities.Card.delete(deleteDialog.card.id);
      setDeleteDialog({ open: false, card: null });
      loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleViewInvoice = (card) => {
    // Navigate to transactions page with card filter
    navigate(`${createPageUrl('Transactions')}?card_id=${card.id}`);
  };

  const handleAddExpense = (card) => {
    setSelectedCardForExpense(card);
    setTransactionModalOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalInvoices = cards.reduce((sum, c) => sum + (c.current_invoice || 0), 0);
  const totalLimit = cards.reduce((sum, c) => sum + (c.limit || 0), 0);
  const availableLimit = totalLimit - totalInvoices;

  // Calculate next invoice due
  const today = new Date();
  const nextDue = cards.reduce((nearest, card) => {
    const dueDate = new Date(today.getFullYear(), today.getMonth(), card.due_day);
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return nearest === null || daysUntil < nearest ? daysUntil : nearest;
  }, null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Cartões de crédito</h1>
        <Button 
          onClick={handleAddCard}
          className="bg-[#6C40D9] hover:bg-[#5432B8]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo cartão
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFC107]/10 rounded-xl">
                <Calendar className="w-5 h-5 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Próxima fatura vence em</p>
                <p className="text-xl font-bold text-gray-900">
                  {nextDue !== null ? `${nextDue} dias` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00D68F]/10 rounded-xl">
                <CreditCard className="w-5 h-5 text-[#00D68F]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Limite disponível</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(availableLimit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF5252]/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-[#FF5252]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total em faturas</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalInvoices)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="open">Faturas abertas</TabsTrigger>
          <TabsTrigger value="closed">Faturas fechadas</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          {cards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Card */}
              <Card 
                className="border-2 border-dashed border-gray-200 hover:border-[#6C40D9] cursor-pointer transition-colors group"
                onClick={handleAddCard}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-56">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-[#6C40D9]/10 flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#6C40D9] transition-colors" />
                  </div>
                  <p className="text-gray-500 group-hover:text-[#6C40D9] font-medium transition-colors">
                    Novo cartão
                  </p>
                </CardContent>
              </Card>

              {/* Card Items */}
              {cards.map((card) => (
                <CreditCardItem 
                  key={card.id}
                  card={card}
                  onEdit={() => {
                    setSelectedCard(card);
                    setModalOpen(true);
                  }}
                  onDelete={() => setDeleteDialog({ open: true, card })}
                  onViewInvoice={() => handleViewInvoice(card)}
                  onAddExpense={() => handleAddExpense(card)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12">
                <EmptyState 
                  icon={CreditCard}
                  message="Você ainda não possui cartões cadastrados"
                  hint="Adicione seu primeiro cartão para começar a controlar suas faturas"
                  action={
                    <Button 
                      onClick={handleAddCard}
                      className="bg-[#6C40D9] hover:bg-[#5432B8]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar cartão
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <EmptyState 
                icon={CreditCard}
                message="Você não possui faturas fechadas no momento"
                hint="Confira seus cartões para saber mais"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Card Modal */}
      <CardModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
        onSuccess={loadCards}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, card: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartão "{deleteDialog.card?.name}"? 
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

      {/* Transaction Modal for Adding Expense */}
      <TransactionModal 
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setSelectedCardForExpense(null);
        }}
        onSuccess={() => {
          loadCards();
          setTransactionModalOpen(false);
          setSelectedCardForExpense(null);
        }}
        initialType="expense"
        preSelectedCard={selectedCardForExpense}
      />
    </div>
  );
}