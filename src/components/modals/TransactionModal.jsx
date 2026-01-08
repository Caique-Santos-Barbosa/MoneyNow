import React, { useState, useEffect } from 'react';
import { getCategoriesByType, addCustomCategory } from '@/data/defaultCategories';
import { createNotification } from '@/utils/notificationManager';
import { StorageManager } from '@/utils/storageManager';
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
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
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
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '💸', color: '#6b7280' });
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
    // Carregar categorias padrão
    if (type !== 'transfer') {
      setDefaultCategories(getCategoriesByType(type));
    }
    
    // Carregar contas e cartões do localStorage se não foram fornecidos
    if (isOpen) {
      if (!propAccounts) {
        const storedAccounts = StorageManager.getAccounts();
        setAccounts(storedAccounts);
      }
      if (!propCards) {
        const storedCards = StorageManager.getCards();
        setCards(storedCards);
      }
      if (!propCategories) {
        setCategories([]);
      }
    }
  }, [isOpen, type]);

  const loadData = () => {
    try {
      // Carregar do localStorage diretamente
      if (!propAccounts) {
        const accountsData = StorageManager.getAccounts();
        setAccounts(accountsData || []);
      }
      
      if (!propCards) {
        const cardsData = StorageManager.getCards();
        setCards(cardsData || []);
      }
      
      if (!propCategories) {
        // Categories vêm das categorias padrão + personalizadas
        setCategories([]);
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
    
    if (!formData.description || !formData.amount) {
      alert('Preencha descrição e valor');
      return;
    }
    
    if (type !== 'transfer' && !formData.category_id) {
      alert('Selecione uma categoria');
      return;
    }
    
    if (type === 'transfer') {
      if (!formData.account_id || !formData.target_account_id) {
        alert('Selecione conta de origem e destino');
        return;
      }
    } else if (type === 'expense' && !formData.card_id && !formData.account_id) {
      alert('Selecione uma conta ou cartão');
      return;
    } else if (type === 'income' && !formData.account_id) {
      alert('Selecione uma conta');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Converter valor para número
      const amount = parseFloat(formData.amount.replace(/[^\d,.-]/g, '').replace(',', '.'));
      
      // Salvar no localStorage
      const transactionData = {
        type,
        description: formData.description,
        amount: amount,
        date: formData.date.toISOString(),
        category_id: formData.category_id || null,
        account_id: formData.account_id || null,
        card_id: formData.card_id || null,
        target_account_id: formData.target_account_id || null,
        is_paid: formData.is_paid,
        notes: formData.notes || null
      };
      
      if (transaction?.id) {
        StorageManager.updateTransaction(transaction.id, transactionData);
      } else {
        StorageManager.addTransaction(transactionData);
        
        // Criar notificação
        const formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(amount);
        
        createNotification.transactionAdded(type, formattedValue);
      }
      
      // Resetar form
      setFormData({
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
      
      onSuccess?.();
      onClose();
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Erro ao criar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    if (value === 'add_new') {
      setShowNewCategoryModal(true);
    } else {
      setFormData({...formData, category_id: value});
    }
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Digite um nome para a categoria');
      return;
    }
    
    const created = addCustomCategory(type, newCategory);
    setDefaultCategories(getCategoriesByType(type));
    setFormData({...formData, category_id: created.id});
    setShowNewCategoryModal(false);
    setNewCategory({ name: '', icon: '💸', color: '#6b7280' });
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
                  onValueChange={handleCategoryChange}
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
            <Button onClick={handleCreateCategory}>
              Criar categoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}