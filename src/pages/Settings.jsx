import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Bell,
  LayoutDashboard,
  Shield,
  Crown,
  ChevronRight,
  LogOut,
  Trash2,
  Download,
  Sparkles,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { cn } from "@/lib/utils";

export default function Settings() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('preferences');
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  
  // Preferences
  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    currency: 'BRL',
    theme: 'light',
    dateFormat: 'DD/MM/YYYY'
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    notifyNewFeatures: true,
    notifyFinancialAlerts: true,
    notifyPremiumInfo: true,
    notifyPartnerships: false
  });

  const handleLogout = () => {
    logout();
  };

  const handleSavePreferences = async () => {
    // TODO: Implementar endpoint de atualização de preferências no backend
    console.log('Preferências:', preferences);
    alert('Funcionalidade de salvar preferências será implementada em breve');
  };

  const handleSaveNotifications = async () => {
    // TODO: Implementar endpoint de atualização de notificações no backend
    console.log('Notificações:', notifications);
    alert('Funcionalidade de salvar notificações será implementada em breve');
  };

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6 max-w-4xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      {/* User Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-[#00D68F]/20">
                {user?.profile_photo || profilePhoto ? (
                  <img 
                    src={user?.profile_photo || profilePhoto} 
                    alt={user?.name || 'Usuário'} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-[#00D68F] to-[#00B578] text-white text-xl">
                    {userInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                type="file"
                id="profile-photo"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Imagem muito grande. Máximo 2MB');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result;
                      setProfilePhoto(base64);
                      const userData = JSON.parse(localStorage.getItem('user') || '{}');
                      userData.profile_photo = base64;
                      localStorage.setItem('user', JSON.stringify(userData));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label
                htmlFor="profile-photo"
                className="absolute bottom-0 right-0 p-2 bg-[#00D68F] text-white rounded-full cursor-pointer hover:bg-[#00B578] transition-colors shadow-lg"
              >
                <Edit className="w-4 h-4" />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'Usuário'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => document.getElementById('profile-photo').click()}
              >
                Alterar foto
              </Button>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 w-full justify-start overflow-x-auto">
          <TabsTrigger value="preferences" className="gap-2">
            <User className="w-4 h-4" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <Crown className="w-4 h-4" />
            Assinatura
          </TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select 
                    value={preferences.language}
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select 
                    value={preferences.currency}
                    onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aparência</Label>
                  <Select 
                    value={preferences.theme}
                    onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Modo claro</SelectItem>
                      <SelectItem value="dark">Modo escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de data</Label>
                  <Select 
                    value={preferences.dateFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">31/12/2024</SelectItem>
                      <SelectItem value="MM/DD/YYYY">12/31/2024</SelectItem>
                      <SelectItem value="YYYY-MM-DD">2024-12-31</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSavePreferences} className="bg-[#00D68F] hover:bg-[#00B578]">
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">E-mail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Receber notificações</p>
                  <p className="text-sm text-gray-500">Ative para receber e-mails do MoneyNow</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                {[
                  { key: 'notifyNewFeatures', title: 'Novidades do MoneyNow', desc: 'Novas funcionalidades e as melhores dicas' },
                  { key: 'notifyFinancialAlerts', title: 'Alertas financeiros', desc: 'Lembretes sobre datas de vencimento e gastos' },
                  { key: 'notifyPremiumInfo', title: 'Informações sobre o Premium', desc: 'Promoções e novidades dos planos' },
                  { key: 'notifyPartnerships', title: 'Parcerias MoneyNow', desc: 'Cupons e condições especiais' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                      disabled={!notifications.emailNotifications}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveNotifications} className="bg-[#00D68F] hover:bg-[#00B578]">
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Tour do sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Refazer tour de boas-vindas</p>
                  <p className="text-sm text-gray-500">Reveja o passo a passo do sistema</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowOnboarding(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Iniciar tour
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Informações da conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm">Alterar</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Senha</p>
                  <p className="font-medium text-gray-900">••••••••</p>
                </div>
                <Button variant="outline" size="sm">Alterar</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-red-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-600">Zona de perigo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Exportar todos os dados</p>
                  <p className="text-sm text-gray-500">Baixe uma cópia de todos os seus dados</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-600">Excluir conta</p>
                  <p className="text-sm text-gray-500">Esta ação é irreversível</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setDeleteAccountDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          {!user?.is_premium ? (
            <>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-[#6C40D9] to-[#5432B8] text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-yellow-300" />
                    <div>
                      <h3 className="text-xl font-bold">MoneyNow Premium</h3>
                      <p className="text-white/70 text-sm">Desbloqueie todo o potencial</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      'Contas e cartões ilimitados',
                      'Relatórios avançados',
                      'Importação automática via Open Banking',
                      'Alertas inteligentes personalizados',
                      'Suporte prioritário',
                      'Backup automático na nuvem'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-bold">R$ 100</span>
                    <span className="text-white/70 mb-1">/ano</span>
                  </div>
                  <p className="text-sm text-white/70 mb-4">ou 10x de R$ 10,00 sem juros</p>

                  <Link to={createPageUrl('Premium')}>
                    <Button className="w-full bg-white text-[#6C40D9] hover:bg-white/90">
                      Conhecer planos Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Plano atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Plano Gratuito</p>
                        <p className="text-sm text-gray-500">Funcionalidades básicas</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                        Ativo
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#6C40D9]" />
                    Assinatura Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-br from-[#6C40D9]/10 to-transparent border border-[#6C40D9]/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">Premium Anual</p>
                        <p className="text-sm text-gray-500">R$ 100,00/ano</p>
                      </div>
                      <Badge className="bg-[#00D68F]/10 text-[#00D68F] border-[#00D68F]/20">
                        Ativo
                      </Badge>
                    </div>
                    
                    {user?.premium_expires_at && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Válido até:</span>
                          <span className="font-medium">
                            {new Date(user.premium_expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {user?.trial_ends_at && new Date(user.trial_ends_at) > new Date() && (
                          <div className="p-2 bg-[#00D68F]/10 rounded-lg">
                            <p className="text-[#00D68F] text-xs font-medium">
                              🎁 Você está no período de teste grátis
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountDialog} onOpenChange={setDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os seus dados, incluindo transações, 
              contas, cartões e metas serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600">
              Excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}