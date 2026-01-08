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
import { Loader2, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";

const cardBrands = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'other', label: 'Outra' }
];

const colors = [
  '#6C40D9', '#5432B8', '#8A5FE6', '#00D68F', 
  '#2196F3', '#FF5252', '#FFC107', '#9C27B0',
  '#E91E63', '#00BCD4', '#4CAF50', '#FF9800',
  '#1A1A2E', '#16213E', '#0F3460'
];

const days = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1)
}));

export default function CardModal({ 
  isOpen, 
  onClose, 
  card,
  onSuccess
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'visa',
    last_digits: '',
    limit: '',
    closing_day: '1',
    due_day: '10',
    color: '#6C40D9',
    is_active: true
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name || '',
        brand: card.brand || 'visa',
        last_digits: card.last_digits || '',
        limit: card.limit?.toString() || '',
        closing_day: card.closing_day?.toString() || '1',
        due_day: card.due_day?.toString() || '10',
        color: card.color || '#6C40D9',
        is_active: card.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        brand: 'visa',
        last_digits: '',
        limit: '',
        closing_day: '1',
        due_day: '10',
        color: '#6C40D9',
        is_active: true
      });
    }
  }, [card, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Nome obrigatório', 'Preencha o nome do cartão');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const limit = parseFloat(formData.limit.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      
      const cardData = {
        name: formData.name,
        brand: formData.brand,
        last_digits: formData.last_digits,
        limit,
        closing_day: parseInt(formData.closing_day),
        due_day: parseInt(formData.due_day),
        color: formData.color,
        is_active: formData.is_active,
        current_invoice: card?.current_invoice || card?.currentBill || 0,
        currentBill: card?.current_invoice || card?.currentBill || 0
      };
      
      if (card?.id) {
        StorageManager.updateCard(card.id, cardData);
        toast.success('Cartão atualizado!', `${formData.name} foi atualizado com sucesso`);
      } else {
        StorageManager.addCard(cardData);
        createNotification.transactionAdded('expense', 'Cartão criado com sucesso');
        toast.success('Cartão criado!', `${formData.name} foi adicionado com sucesso`);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Erro ao criar cartão', 'Tente novamente');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#6C40D9]" />
            {card ? 'Editar cartão' : 'Novo cartão de crédito'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do cartão</Label>
            <Input
              id="name"
              placeholder="Ex: Cartão Nubank"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bandeira</Label>
              <Select 
                value={formData.brand}
                onValueChange={(value) => setFormData({ ...formData, brand: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardBrands.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_digits">Últimos 4 dígitos</Label>
              <Input
                id="last_digits"
                placeholder="0000"
                maxLength={4}
                value={formData.last_digits}
                onChange={(e) => setFormData({ ...formData, last_digits: e.target.value.replace(/\D/g, '') })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Limite do cartão</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <Input
                id="limit"
                className="pl-10"
                placeholder="0,00"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: formatCurrencyInput(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dia de fechamento</Label>
              <Select 
                value={formData.closing_day}
                onValueChange={(value) => setFormData({ ...formData, closing_day: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      Dia {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dia de vencimento</Label>
              <Select 
                value={formData.due_day}
                onValueChange={(value) => setFormData({ ...formData, due_day: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      Dia {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor do cartão</Label>
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

          {/* Card Preview */}
          <div 
            className="p-4 rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${formData.color} 0%, ${formData.color}dd 100%)` }}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs uppercase tracking-wide opacity-80">
                {cardBrands.find(b => b.value === formData.brand)?.label}
              </span>
              <CreditCard className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-lg tracking-widest mb-2">
              •••• •••• •••• {formData.last_digits || '0000'}
            </p>
            <p className="text-sm opacity-80">{formData.name || 'Nome do cartão'}</p>
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
              className="flex-1 bg-[#6C40D9] hover:bg-[#5432B8]"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {card ? 'Salvar' : 'Criar cartão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}