import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Wallet,
  CreditCard,
  X
} from 'lucide-react';
import { cn } from "@/lib/utils";

const STEPS = {
  UPLOAD: 1,
  SELECT_DESTINATION: 2,
  PREVIEW: 3,
  RESULT: 4
};

export default function ImportModal({ isOpen, onClose, accounts, cards, onSuccess }) {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [importType, setImportType] = useState('account');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [importResult, setImportResult] = useState(null);
  
  const fileInputRef = useRef(null);

  const resetModal = () => {
    setStep(STEPS.UPLOAD);
    setFile(null);
    setError('');
    setImportType('account');
    setSelectedAccount('');
    setSelectedCard('');
    setParsedData([]);
    setImportResult(null);
  };

  const handleFileSelect = async (selectedFile) => {
    setError('');
    
    // Validar formato
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension)) {
      setError('Formato não suportado. Use CSV, XLS ou XLSX');
      return;
    }
    
    // Validar tamanho (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }
    
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      // Upload do arquivo
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      // Extrair dados usando a integração do Base44
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            transactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  description: { type: "string" },
                  amount: { type: "number" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (result.status === 'success' && result.output?.transactions) {
        setParsedData(result.output.transactions);
        setStep(STEPS.SELECT_DESTINATION);
      } else {
        setError(result.details || 'Erro ao processar arquivo');
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const user = await base44.auth.me();
      
      if (!user || !user?.email) {
        setError('Usuário não autenticado');
        return;
      }
      
      const categories = await base44.entities.Category.list();
      
      let imported = 0;
      let duplicates = 0;
      let errors = 0;
      const errorDetails = [];
      
      for (let i = 0; i < parsedData.length; i++) {
        const transaction = parsedData[i];
        
        try {
          // Verificar duplicata
          const existingTransactions = await base44.entities.Transaction.filter({
            created_by: user.email,
            date: transaction.date,
            description: transaction.description
          });
          
          if (existingTransactions.length > 0) {
            duplicates++;
            continue;
          }
          
          // Encontrar categoria
          const transactionType = transaction.type?.toLowerCase() === 'receita' ? 'income' : 'expense';
          const defaultCategory = categories.find(c => c.name === 'Outros' && c.type === transactionType);
          
          // Criar transação
          await base44.entities.Transaction.create({
            type: transactionType,
            amount: Math.abs(transaction.amount),
            description: transaction.description,
            date: transaction.date,
            category_id: defaultCategory?.id,
            account_id: importType === 'account' ? selectedAccount : null,
            card_id: importType === 'card' ? selectedCard : null,
            is_paid: true
          });
          
          imported++;
          
          // Atualizar saldo da conta
          if (importType === 'account' && selectedAccount) {
            const account = accounts.find(a => a.id === selectedAccount);
            if (account) {
              const newBalance = account.current_balance + (
                transactionType === 'income' ? transaction.amount : -transaction.amount
              );
              
              await base44.entities.Account.update(selectedAccount, {
                current_balance: newBalance
              });
            }
          }
          
        } catch (err) {
          errors++;
          errorDetails.push({
            row: i + 1,
            message: err.message
          });
        }
      }
      
      // Salvar histórico
      await base44.entities.ImportHistory.create({
        file_name: file.name,
        file_format: file.name.split('.').pop().toLowerCase(),
        status: errors === parsedData.length ? 'failed' : errors > 0 ? 'partial' : 'completed',
        total_rows: parsedData.length,
        imported_rows: imported,
        duplicate_rows: duplicates,
        error_rows: errors,
        account_id: importType === 'account' ? selectedAccount : null,
        card_id: importType === 'card' ? selectedCard : null,
        errors: errorDetails
      });
      
      setImportResult({
        status: errors === 0 ? 'success' : 'partial',
        imported,
        duplicates,
        errors,
        errorDetails
      });
      
      setStep(STEPS.RESULT);
    } catch (err) {
      setError(err.message || 'Erro ao importar transações');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
    if (importResult?.imported > 0) {
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#6C40D9]" />
            Importar transações
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= s ? "bg-[#6C40D9] text-white" : "bg-gray-100 text-gray-400"
              )}>
                {s}
              </div>
              {s < 4 && (
                <div className={cn(
                  "flex-1 h-1 rounded",
                  step > s ? "bg-[#6C40D9]" : "bg-gray-100"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === STEPS.UPLOAD && (
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                isDragging ? "border-[#6C40D9] bg-[#6C40D9]/5" : "border-gray-200 hover:border-[#6C40D9]/50"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) handleFileSelect(droppedFile);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!file ? (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-1">
                    Arraste o arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos: CSV, XLS, XLSX (máx. 10MB)
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-4 justify-center">
                  <FileText className="w-8 h-8 text-[#6C40D9]" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setError('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 p-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#6C40D9]" />
                <span className="text-sm text-gray-600">Processando arquivo...</span>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">
                💡 Formato esperado do CSV:
              </p>
              <pre className="text-xs text-blue-700 font-mono">
{`Data,Descrição,Valor,Tipo
01/01/2026,Supermercado,-150.00,Despesa
02/01/2026,Salário,5000.00,Receita`}
              </pre>
            </div>
          </div>
        )}

        {/* Step 2: Select Destination */}
        {step === STEPS.SELECT_DESTINATION && (
          <div className="space-y-4">
            <div>
              <Label>Importar para:</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Button
                  variant={importType === 'account' ? 'default' : 'outline'}
                  className={cn(importType === 'account' && "bg-[#00D68F] hover:bg-[#00B578]")}
                  onClick={() => setImportType('account')}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Conta
                </Button>
                <Button
                  variant={importType === 'card' ? 'default' : 'outline'}
                  className={cn(importType === 'card' && "bg-[#6C40D9] hover:bg-[#5432B8]")}
                  onClick={() => setImportType('card')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Cartão
                </Button>
              </div>
            </div>

            {importType === 'account' ? (
              <div>
                <Label>Selecione a conta</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Selecione o cartão</Label>
                <Select value={selectedCard} onValueChange={setSelectedCard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cartão..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cards?.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(STEPS.UPLOAD)}>
                Voltar
              </Button>
              <Button
                className="flex-1 bg-[#6C40D9] hover:bg-[#5432B8]"
                disabled={!selectedAccount && !selectedCard}
                onClick={() => setStep(STEPS.PREVIEW)}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === STEPS.PREVIEW && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total de transações:</span>
                <span className="text-lg font-bold text-[#6C40D9]">{parsedData.length}</span>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Descrição</th>
                    <th className="p-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((t, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{t.date}</td>
                      <td className="p-2">{t.description}</td>
                      <td className={cn(
                        "p-2 text-right font-medium",
                        t.amount >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        R$ {Math.abs(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                  Mostrando 10 de {parsedData.length} transações
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(STEPS.SELECT_DESTINATION)}>
                Voltar
              </Button>
              <Button
                className="flex-1 bg-[#00D68F] hover:bg-[#00B578]"
                onClick={handleImport}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>Importar {parsedData.length} transações</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === STEPS.RESULT && importResult && (
          <div className="space-y-4 text-center">
            {importResult.status === 'success' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Importação concluída!
                </h3>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Importação parcial
                </h3>
              </>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                <p className="text-xs text-green-700">Importadas</p>
              </div>
              {importResult.duplicates > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{importResult.duplicates}</p>
                  <p className="text-xs text-yellow-700">Duplicadas</p>
                </div>
              )}
              {importResult.errors > 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{importResult.errors}</p>
                  <p className="text-xs text-red-700">Erros</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetModal}>
                Importar mais
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Concluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}