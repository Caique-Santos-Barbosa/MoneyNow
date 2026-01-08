import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getCategoriesByType } from '@/data/defaultCategories';
import { createNotification } from '@/utils/notificationManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  type: initialType = 'expense',
  initialType: deprecatedInitialType,
  transaction,
  accounts: propAccounts,
  cards: propCards,
  categories: propCategories,
  onSuccess,
  preSelectedCard
}) {
  const [type, setType] = useState(deprecatedInitialType || initialType);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState(propAccounts || []);
  const [cards, setCards] = useState(propCards || []);
  const [categories, setCategories] = useState(propCategories || []);
  const [defaultCategories, setDefaultCategories] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date(),
    category_id: '',
    account_id: '',
    card_id: '',
    target_account_id: '',
    is_paid: false,
    notes: '',
    tags: []
  });

  // Load data if not provided
  useEffect(() => {
    if (isOpen && (!propAccounts || !propCards || !propCategories)) {
      loadData();
    }
    // Carregar categorias padrão
    if (type !== 'transfer') {
      setDefaultCategories(getCategoriesByType(type));
    }
  }, [isOpen, type]);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      
      if (!user || !user?.email) {
        if (!propAccounts) setAccounts([]);
        if (!propCards) setCards([]);
        if (!propCategories) setCategories([]);
        return;
      }
      
      if (!propAccounts) {
        const accountsData = await base44.entities.Account.filter({ created_by: user.email });
        setAccounts(accountsData || []);
      }
      
      if (!propCards) {
        const cardsData = await base44.entities.Card.filter({ created_by: user.email });
        setCards(cardsData || []);
      }
      
      if (!propCategories) {
        const categoriesData = await base44.entities.Category.list();
        setCategories(categoriesData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount?.toString() || '',
        date: transaction.date ? new Date(transaction.date) : new Date(),
        category_id: transaction.category_id || '',
        account_id: transaction.account_id || '',
        card_id: transaction.card_id || '',
        target_account_id: transaction.target_account_id || '',
        is_paid: transaction.is_paid || false,
        notes: transaction.notes || '',
        tags: transaction.tags || []
      });
      setType(transaction.type || deprecatedInitialType || initialType);
    } else {
      setFormData({
        description: '',
        amount: '',
        date: new Date(),
        category_id: '',
        account_id: '',
        card_id: preSelectedCard?.id || '',
        target_account_id: '',
        is_paid: false,
        notes: '',
        tags: []
      });
      setType(deprecatedInitialType || initialType);
    }
  }, [transaction, initialType, deprecatedInitialType, isOpen, preSelectedCard]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        type,
        description: formData.description,
        amount: parseFloat(formData.amount.replace(/[^\d,.-]/g, '').replace(',', '.')),
        date: format(formData.date, 'yyyy-MM-dd'),
        category_id: formData.category_id || null,
        account_id: type !== 'transfer' ? (formData.account_id || formData.card_id || null) : formData.account_id,
        card_id: type === 'expense' ? formData.card_id || null : null,
        target_account_id: type === 'transfer' ? formData.target_account_id : null,
        is_paid: formData.is_paid,
        notes: formData.notes || null,
        tags: formData.tags
      };

      if (transaction?.id) {
        await base44.entities.Transaction.update(transaction.id, data);
      } else {
        await base44.entities.Transaction.create(data);
        
        // Gerar notificação ao criar transação
        const formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(data.amount);
        
        createNotification.transactionAdded(type, formattedValue);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsLoading(false);
    }
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

  // Combinar categorias padrão com categorias do sistema (se houver)
  const filteredCategories = type === 'transfer' ? [] : [
    ...defaultCategories,
    ...categories.filter(cat => cat.type === type)
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <Tabs value={type} onValueChange={setType} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger 
                value="expense" 
                className="data-[state=active]:bg-[#FF5252] data-[state=active]:text-white"
              >
                Despesa
              </TabsTrigger>
              <TabsTrigger 
                value="income"
                className="data-[state=active]:bg-[#00D68F] data-[state=active]:text-white"
              >
                Receita
              </TabsTrigger>
              <TabsTrigger 
                value="transfer"
                className="data-[state=active]:bg-[#2196F3] data-[state=active]:text-white"
              >
                Transferência
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Compra no supermercado"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                <Input
                  id="amount"
                  className="pl-10"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: formatCurrencyInput(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date: date || new Date() })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {type !== 'transfer' ? (
            <>
              <div className="space-y-2">
                <Label>Conta ou Cartão</Label>
                <Select 
                  value={formData.card_id || formData.account_id}
                  onValueChange={(value) => {
                    const isCard = cards.some(c => c.id === value);
                    if (isCard) {
                      setFormData({ ...formData, card_id: value, account_id: '' });
                    } else {
                      setFormData({ ...formData, account_id: value, card_id: '' });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta ou cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Contas</div>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: account.color }}
                              />
                              {account.name}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {type === 'expense' && cards.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Cartões</div>
                        {cards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: card.color }}
                              />
                              {card.name}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select 
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
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
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Conta de origem</Label>
                <Select 
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: account.color }}
                          />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta de destino</Label>
                <Select 
                  value={formData.target_account_id}
                  onValueChange={(value) => setFormData({ ...formData, target_account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter(a => a.id !== formData.account_id)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: account.color }}
                            />
                            {account.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observação (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione uma observação..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="is_paid" className="text-sm font-medium">
                Marcar como {type === 'income' ? 'recebido' : 'pago'}
              </Label>
              <p className="text-xs text-gray-500">
                {type === 'income' ? 'Já recebeu este valor?' : 'Já pagou esta despesa?'}
              </p>
            </div>
            <Switch
              id="is_paid"
              checked={formData.is_paid}
              onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className={cn(
                "flex-1",
                type === 'expense' && "bg-[#FF5252] hover:bg-[#FF3333]",
                type === 'income' && "bg-[#00D68F] hover:bg-[#00B578]",
                type === 'transfer' && "bg-[#2196F3] hover:bg-[#1976D2]"
              )}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {transaction ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}