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

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // Páginas que não usam Layout (auth pages)
    const isAuthPage = location.pathname === '/Login' || location.pathname === '/Register' || location.pathname === '/login' || location.pathname === '/register';
    
    if (isAuthPage) {
        return (
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        );
    }
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<Dashboard />} />
                <Route path="/Accounts" element={<Accounts />} />
                <Route path="/Budget" element={<Budget />} />
                <Route path="/Cards" element={<Cards />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Goals" element={<Goals />} />
                <Route path="/Premium" element={<Premium />} />
                <Route path="/Reports" element={<Reports />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/Transactions" element={<Transactions />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}