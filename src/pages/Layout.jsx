
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  PieChart,
  Target,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Search,
  Crown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PremiumBadge from '@/components/premium/PremiumBadge';
import { cn } from "@/lib/utils";
import SearchModal from '@/components/search/SearchModal';
import NotificationsModal from '@/components/notifications/NotificationsModal';

const navigation = [
  { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
  { name: 'Contas', href: 'Accounts', icon: Wallet },
  { name: 'Cartões', href: 'Cards', icon: CreditCard },
  { name: 'Transações', href: 'Transactions', icon: ArrowLeftRight },
  { name: 'Planejamento', href: 'Budget', icon: PieChart },
  { name: 'Relatórios', href: 'Reports', icon: FileText },
  { name: 'Metas', href: 'Goals', icon: Target },
  { name: 'Configurações', href: 'Settings', icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Bom dia', emoji: '☀️' };
    if (hour < 18) return { text: 'Boa tarde', emoji: '🌤️' };
    return { text: 'Boa noite', emoji: '🌙' };
  };

  const greeting = getGreeting();
  const userName = user?.name || 'Usuário';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  // Pages without layout
  if (['Login', 'Register', 'Onboarding'].includes(currentPageName)) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: #00D68F;
          --primary-dark: #00B578;
          --primary-light: #33E0A5;
          --secondary: #6C40D9;
          --secondary-dark: #5432B8;
          --secondary-light: #8A5FE6;
          --success: #00D68F;
          --danger: #FF5252;
          --warning: #FFC107;
          --info: #2196F3;
        }
      `}</style>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D68F] to-[#00B578] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MoneyNow</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" data-tour="nav">
            {navigation.map((item) => {
              const isActive = currentPageName === item.href;
              const tourId = {
                'Dashboard': 'dashboard-link',
                'Accounts': 'accounts-link',
                'Cards': 'cards-link',
                'Transactions': 'transactions-link',
                'Budget': 'budget-link',
                'Reports': 'reports-link',
                'Goals': 'goals-link',
                'Settings': 'settings-link'
              }[item.href];
              
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  data-tour={tourId}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-[#00D68F]/10 to-[#00D68F]/5 text-[#00B578]" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-[#00D68F]" : "text-gray-400"
                  )} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D68F]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Premium CTA */}
          {false && !user?.is_premium && (
            <div className="p-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6C40D9] to-[#5432B8] text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <span className="font-semibold text-sm">Premium</span>
                </div>
                <p className="text-xs text-white/80 mb-3">
                  Desbloqueie recursos ilimitados
                </p>
                <Link to={createPageUrl('Premium')}>
                  <Button size="sm" className="w-full bg-white text-[#6C40D9] hover:bg-white/90">
                    Conhecer planos
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* User section */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10 border-2 border-[#00D68F]/20">
                <AvatarFallback className="bg-gradient-to-br from-[#00D68F] to-[#00B578] text-white font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  {user?.is_premium && <PremiumBadge size="xs" />}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {greeting.text}, {user?.name?.split(' ')[0] || 'Usuário'}! {greeting.emoji}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500 hover:text-gray-700"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5252] rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-[#00D68F] to-[#00B578] text-white text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Settings')} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Minha conta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Settings')} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = currentPageName === item.href;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                  isActive ? "text-[#00D68F]" : "text-gray-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
