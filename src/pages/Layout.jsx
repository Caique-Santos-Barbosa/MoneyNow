
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationManager } from '@/utils/notificationManager';
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
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Carregar contador inicial
    updateUnreadCount();
    
    // Escutar mudanças
    const handleUpdate = () => updateUnreadCount();
    window.addEventListener('notificationsUpdated', handleUpdate);
    
    return () => window.removeEventListener('notificationsUpdated', handleUpdate);
  }, []);

  const updateUnreadCount = () => {
    const count = NotificationManager.getUnreadCount();
    setUnreadCount(count);
  };

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

      {/* Estrutura flex para desktop */}
      <div className="flex h-screen overflow-hidden">
        
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Fixed no mobile, Flex item no desktop */}
        <aside className={cn(
          "w-64 bg-white border-r border-gray-200 flex-shrink-0",
          // Mobile: fixed com transform
          "fixed lg:relative inset-y-0 left-0 z-50",
          "transform transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 flex-shrink-0">
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

            {/* Navigation - Scrollable */}
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

            {/* User section */}
            <div className="p-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border-2 border-[#00D68F]/20">
                  {user?.profile_photo ? (
                    <img 
                      src={user.profile_photo} 
                      alt={user?.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#00D68F] to-[#00B578] text-white font-medium">
                      {userInitials}
                    </AvatarFallback>
                  )}
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

        {/* Main content area - Flex item que cresce */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top header - Fixo no topo */}
          <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex-shrink-0">
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
                {/* Search button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(true)}
                  className="relative"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </Button>

                {/* Notifications button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(true)}
                  className="relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1 font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="h-8 w-8 border-2 border-[#00D68F]/20">
                        {user?.profile_photo ? (
                          <img 
                            src={user.profile_photo} 
                            alt={user?.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-[#00D68F] to-[#00B578] text-white text-sm font-medium">
                            {userInitials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                        {user?.is_premium && <PremiumBadge size="xs" />}
                      </div>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Settings')} className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Minha conta
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Settings')} className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    {!user?.is_premium && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('Premium')} className="flex items-center gap-2 cursor-pointer text-[#6C40D9]">
                            <Crown className="w-4 h-4" />
                            Assinar Premium
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content area - Scrollable */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
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
