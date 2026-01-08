import React, { useState, useEffect } from 'react';
import { StorageManager } from '@/utils/storageManager';
import { createNotification } from '@/utils/notificationManager';
import { toast } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Wallet, PiggyBank, Building2, TrendingUp, Banknote } from 'lucide-react';
import { cn } from "@/lib/utils";

const accountTypes = [
  { value: 'checking', label: 'Conta Corrente', icon: Building2 },
  { value: 'savings', label: 'Poupança', icon: PiggyBank },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'investment', label: 'Investimento', icon: TrendingUp }
];

const colors = [
  '#00D68F', '#00B578', '#6C40D9', '#5432B8', 
  '#2196F3', '#FF5252', '#FFC107', '#9C27B0',
  '#E91E63', '#00BCD4', '#4CAF50', '#FF9800'
];

const icons = ['wallet', 'piggy-bank', 'building', 'trending-up'];

export default function AccountModal({ 
  isOpen, 
  onClose, 
  account,
  onSuccess
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    bank: '',
    initial_balance: '',
    color: '#00D68F',
    icon: 'wallet',
    include_in_total: true,
    is_active: true
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        type: account.type || 'checking',
        bank: account.bank || '',
        initial_balance: account.initial_balance?.toString() || '',
        color: account.color || '#00D68F',
        icon: account.icon || 'wallet',
        include_in_total: account.include_in_total ?? true,
        is_active: account.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        type: 'checking',
        bank: '',
        initial_balance: '',
        color: '#00D68F',
        icon: 'wallet',
        include_in_total: true,
        is_active: true
      });
    }
  }, [account, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error('Campos obrigatórios', 'Preencha nome e tipo da conta');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const initialBalance = parseFloat(formData.initial_balance.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      
      const accountData = {
        name: formData.name,
        type: formData.type,
        bank_name: formData.bank || null,
        bank: formData.bank || null,
        initial_balance: initialBalance,
        current_balance: account ? (account.current_balance || account.balance || initialBalance) : initialBalance,
        balance: account ? (account.current_balance || account.balance || initialBalance) : initialBalance,
        color: formData.color,
        icon: formData.icon,
        include_in_total: formData.include_in_total,
        is_active: formData.is_active
      };
      
      if (account?.id) {
        StorageManager.updateAccount(account.id, accountData);
        toast.success('Conta atualizada!', `${formData.name} foi atualizada com sucesso`);
      } else {
        StorageManager.addAccount(accountData);
        createNotification.transactionAdded('income', 'Conta criada com sucesso');
        toast.success('Conta criada!', `${formData.name} foi adicionada com sucesso`);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Erro ao criar conta', 'Tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/[^\d-]/g, '');
    const number = parseInt(numericValue, 10) / 100;
    if (isNaN(number)) return '';
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar conta' : 'Nova conta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da conta</Label>
            <Input
              id="name"
              placeholder="Ex: Conta Corrente"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de conta</Label>
            <Select 
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4 text-gray-500" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Banco (opcional)</Label>
            <Input
              id="bank"
              placeholder="Ex: Banco do Brasil"
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_balance">Saldo inicial</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <Input
                id="initial_balance"
                className="pl-10"
                placeholder="0,00"
                value={formData.initial_balance}
                onChange={(e) => setFormData({ ...formData, initial_balance: formatCurrencyInput(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all",
                    formData.color === color && "ring-2 ring-offset-2 ring-gray-400"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="include_in_total" className="text-sm font-medium">
                Incluir no saldo total
              </Label>
              <p className="text-xs text-gray-500">
                Esta conta será somada ao saldo geral
              </p>
            </div>
            <Switch
              id="include_in_total"
              checked={formData.include_in_total}
              onCheckedChange={(checked) => setFormData({ ...formData, include_in_total: checked })}
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
              className="flex-1 bg-[#00D68F] hover:bg-[#00B578]"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {account ? 'Salvar' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}