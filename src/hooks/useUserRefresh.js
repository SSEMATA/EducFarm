import { useEffect } from 'react';
import api from '../services/api';

/**
 * Hook to refresh user data (including avatar) when the app regains focus
 * This ensures avatar changes made on other devices are visible immediately
 */
export function useRefreshUserOnFocus(setUser) {
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const { data } = await api.get('/users/me/');
        setUser(data);
      } catch (error) {
        // Silent fail - user might be logged out
      }
    };

    // Refresh when window regains focus
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [setUser]);
}

/**
 * Hook to periodically refresh user data (including avatar)
 * Interval in milliseconds, default 30 seconds
 */
export function usePeriodicUserRefresh(setUser, intervalMs = 30000) {
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const { data } = await api.get('/users/me/');
        setUser(data);
      } catch (error) {
        // Silent fail - user might be logged out
      }
    };

    const interval = setInterval(refreshUser, intervalMs);
    
    return () => {
      clearInterval(interval);
    };
  }, [setUser, intervalMs]);
}
