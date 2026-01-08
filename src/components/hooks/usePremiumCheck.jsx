import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Limites do plano gratuito
const FREE_LIMITS = {
  accounts: 2,
  cards: 2,
  customCategories: 5,
  goals: 3
};

export function usePremiumCheck() {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(() => {
    // Verifica localStorage primeiro
    const storedPremium = localStorage.getItem('premium_status');
    if (storedPremium) {
      try {
        const data = JSON.parse(storedPremium);
        if (data.trialMode && data.trialEndsAt) {
          const trialEnd = new Date(data.trialEndsAt);
          return trialEnd > new Date(); // Se ainda está no período de teste
        }
      } catch (error) {
        console.error('Error parsing premium status:', error);
      }
    }
    return false;
  });

  useEffect(() => {
    checkPremium();
  }, []);

  const checkPremium = async () => {
    try {
      // Verifica localStorage primeiro
      const storedPremium = localStorage.getItem('premium_status');
      if (storedPremium) {
        try {
          const data = JSON.parse(storedPremium);
          if (data.trialMode && data.trialEndsAt) {
            const trialEnd = new Date(data.trialEndsAt);
            if (trialEnd > new Date()) {
              setIsPremium(true);
              return;
            } else {
              // Teste expirou
              localStorage.removeItem('premium_status');
              localStorage.removeItem('trial_activated');
            }
          }
        } catch (error) {
          console.error('Error parsing premium status:', error);
        }
      }

      const userData = await base44.auth.me();
      
      if (!userData) {
        setUser(null);
        setIsPremium(false);
        return;
      }
      
      setUser(userData);
      
      // Verifica se está em trial válido
      if (userData?.trial_ends_at && new Date(userData.trial_ends_at) > new Date()) {
        setIsPremium(true);
        return;
      }
      
      // Verifica se tem premium ativo
      if (userData?.is_premium && userData?.premium_expires_at && new Date(userData.premium_expires_at) > new Date()) {
        setIsPremium(true);
        return;
      }
      
      setIsPremium(false);
    } catch (error) {
      console.error('Error checking premium:', error);
      setIsPremium(false);
    }
  };

  const checkLimit = async (resource) => {
    if (isPremium) {
      return { allowed: true, current: 0, limit: Infinity };
    }

    try {
      const userData = await base44.auth.me();
      
      if (!userData || !userData?.email) {
        return { allowed: false, current: 0, limit: 0 };
      }
      
      let current = 0;

      if (resource === 'accounts') {
        const accounts = await base44.entities.Account.filter({ created_by: userData.email });
        current = accounts?.length || 0;
      } else if (resource === 'cards') {
        const cards = await base44.entities.Card.filter({ created_by: userData.email });
        current = cards?.length || 0;
      } else if (resource === 'goals') {
        const goals = await base44.entities.Goal.filter({ created_by: userData.email });
        current = goals?.length || 0;
      } else if (resource === 'customCategories') {
        const categories = await base44.entities.Category.filter({ 
          created_by: userData.email,
          is_system: false 
        });
        current = categories?.length || 0;
      }

      const limit = FREE_LIMITS[resource] || Infinity;
      
      return {
        allowed: current < limit,
        current,
        limit
      };
    } catch (error) {
      console.error('Error checking limit:', error);
      return { allowed: false, current: 0, limit: 0 };
    }
  };

  return {
    user,
    isPremium,
    checkLimit,
    refreshPremium: checkPremium
  };
}