import Layout from "./Layout.jsx";

import Accounts from "./Accounts";
import Budget from "./Budget";
import Cards from "./Cards";
import Dashboard from "./Dashboard";
import Goals from "./Goals";
import Premium from "./Premium";
import Reports from "./Reports";
import Settings from "./Settings";
import Transactions from "./Transactions";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const PAGES = {
    Accounts: Accounts,
    Budget: Budget,
    Cards: Cards,
    Dashboard: Dashboard,
    Goals: Goals,
    Premium: Premium,
    Reports: Reports,
    Settings: Settings,
    Transactions: Transactions,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Componente para rotas públicas (redireciona se autenticado)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D68F]"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/Dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    return (
            <Routes>            
            {/* Rotas públicas (auth) */}
            <Route path="/Login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/Register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/ForgotPassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/ResetPassword" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Navigate to="/Dashboard" replace />
                </ProtectedRoute>
            } />
            <Route path="/Accounts" element={
                <ProtectedRoute>
                    <Layout currentPageName="Accounts">
                        <Accounts />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Budget" element={
                <ProtectedRoute>
                    <Layout currentPageName="Budget">
                        <Budget />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Cards" element={
                <ProtectedRoute>
                    <Layout currentPageName="Cards">
                        <Cards />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName="Dashboard">
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Goals" element={
                <ProtectedRoute>
                    <Layout currentPageName="Goals">
                        <Goals />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Premium" element={
                <ProtectedRoute>
                    <Layout currentPageName="Premium">
                        <Premium />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Reports" element={
                <ProtectedRoute>
                    <Layout currentPageName="Reports">
                        <Reports />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Settings" element={
                <ProtectedRoute>
                    <Layout currentPageName="Settings">
                        <Settings />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/Transactions" element={
                <ProtectedRoute>
                    <Layout currentPageName="Transactions">
                        <Transactions />
                    </Layout>
                </ProtectedRoute>
            } />
            
            {/* Rota catch-all - redireciona para Login se não autenticado */}
            <Route path="*" element={
                <ProtectedRoute>
                    <Navigate to="/Dashboard" replace />
                </ProtectedRoute>
            } />
            </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}