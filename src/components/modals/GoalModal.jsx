import React, { useState } from 'react';
import { StorageManager } from '@/utils/storageManager';
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
import { Loader2, Target } from 'lucide-react';

export default function GoalModal({ isOpen, onClose, onSuccess, goal }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: ''
  });
  
  React.useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        target_amount: goal.target_amount?.toString() || '',
        current_amount: goal.current_amount?.toString() || '0',
        deadline: goal.deadline || ''
      });
    } else {
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: ''
      });
    }
  }, [goal, isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_amount) {
      alert('Preencha nome e valor da meta');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const goalData = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        deadline: formData.deadline || null
      };
      
      if (goal?.id) {
        StorageManager.updateGoal(goal.id, goalData);
      } else {
        StorageManager.addGoal(goalData);
        createNotification.goalReached(formData.name, 0);
      }
      
      setFormData({ name: '', target_amount: '', current_amount: '0', deadline: '' });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Erro ao criar meta');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00D68F]" />
            {goal ? 'Editar meta' : 'Nova Meta'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome da meta</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Viagem para Europa"
              required
            />
          </div>
          <div>
            <Label>Valor objetivo (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.target_amount}
              onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
              placeholder="0,00"
              required
            />
          </div>
          <div>
            <Label>Valor atual (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.current_amount}
              onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label>Prazo (opcional)</Label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (goal ? 'Salvar' : 'Criar meta')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

