import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockResults = [
    { type: 'Transação', name: 'Compra no Supermercado', value: 'R$ 150,00', date: '05/01/2026' },
    { type: 'Conta', name: 'Conta Corrente Banco XYZ', value: 'R$ 2.450,00' },
    { type: 'Cartão', name: 'Cartão Visa Gold', value: 'Fatura: R$ 890,00' }
  ];
  
  const filteredResults = searchQuery.length > 0 
    ? mockResults.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
          </div>
          
          {searchQuery.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Digite algo para pesquisar...
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((result, index) => (
                <div key={index} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-500">{result.type}</div>
                      <div className="font-medium">{result.name}</div>
                      {result.date && <div className="text-xs text-gray-500 mt-1">{result.date}</div>}
                    </div>
                    <div className="text-sm font-semibold">{result.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


