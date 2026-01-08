import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery]);
  
  const performSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    const allResults = [];
    
    // Buscar transações
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const matchingTransactions = transactions
      .filter(t => t.description?.toLowerCase().includes(lowerQuery) || t.notes?.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
      .map(t => ({
        type: 'Transação',
        icon: TrendingUp,
        name: t.description || 'Transação sem descrição',
        value: `R$ ${parseFloat(t.amount || 0).toFixed(2)}`,
        date: t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '',
        action: () => {
          onClose();
          navigate('/transactions', { state: { highlightId: t.id } });
        }
      }));
    
    // Buscar contas
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const matchingAccounts = accounts
      .filter(a => a.name?.toLowerCase().includes(lowerQuery) || a.bank_name?.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(a => ({
        type: 'Conta',
        icon: Wallet,
        name: a.name || 'Conta sem nome',
        value: `R$ ${parseFloat(a.current_balance || a.balance || 0).toFixed(2)}`,
        action: () => {
          onClose();
          navigate('/accounts', { state: { highlightId: a.id } });
        }
      }));
    
    // Buscar cartões
    const cards = JSON.parse(localStorage.getItem('cards') || '[]');
    const matchingCards = cards
      .filter(c => c.name?.toLowerCase().includes(lowerQuery) || c.bank_name?.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(c => ({
        type: 'Cartão',
        icon: CreditCard,
        name: c.name || 'Cartão sem nome',
        value: `Fatura: R$ ${parseFloat(c.current_invoice || c.currentBill || 0).toFixed(2)}`,
        action: () => {
          onClose();
          navigate('/cards', { state: { highlightId: c.id } });
        }
      }));
    
    setResults([...matchingTransactions, ...matchingAccounts, ...matchingCards]);
  };
  
  const handleResultClick = (result) => {
    if (result.action) {
      result.action();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pesquisar</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar transações, contas, cartões..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          
          {searchQuery.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Digite algo para pesquisar...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum resultado encontrado para "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 hover:bg-gray-50 rounded-lg border transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{result.type}</Badge>
                        </div>
                        <div className="font-medium">{result.name}</div>
                        {result.date && (
                          <div className="text-xs text-gray-500 mt-1">{result.date}</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">{result.value}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
