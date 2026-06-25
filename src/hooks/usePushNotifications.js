/**
 * Hook for managing push notifications and badge
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import pushNotificationService from '../services/pushNotificationService';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState({
    initialized: false,
    registered: false,
    subscribed: false,
    permission: 'default',
    loading: false,
    error: null,
  });

  // Initialize push notifications on mount (skip badge until user auth is ready)
  useEffect(() => {
    const initialize = async () => {
      try {
        setStatus((prev) => ({ ...prev, loading: true }));
        // Skip badge init if user not authenticated yet
        const success = await pushNotificationService.init(true);
        const statusInfo = pushNotificationService.getStatus();

        setStatus({
          initialized: success,
          registered: statusInfo.registered,
          subscribed: statusInfo.subscribed,
          permission: statusInfo.permission,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
        setStatus((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    };

    initialize();
  }, []);

  // Initialize badge once user is authenticated
  useEffect(() => {
    if (user && user !== false) {
      // User is authenticated, now init badge with debounce
      const timeoutId = setTimeout(async () => {
        try {
          await pushNotificationService.initBadge();
        } catch (error) {
          console.warn('Failed to initialize badge:', error);
        }
      }, 500); // Debounce to prevent rapid badge checks on user state changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }));
      const permission = await pushNotificationService.requestPermission();
      const statusInfo = pushNotificationService.getStatus();

      setStatus({
        ...statusInfo,
        permission,
        loading: false,
        error: null,
      });

      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request permission:', error);
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      return false;
    }
  }, []);

  // Update badge
  const updateBadge = useCallback(async (count) => {
    try {
      return await pushNotificationService.updateBadge(count);
    } catch (error) {
      console.error('Failed to update badge:', error);
      return false;
    }
  }, []);

  // Clear badge
  const clearBadge = useCallback(async () => {
    try {
      return await pushNotificationService.clearBadge();
    } catch (error) {
      console.error('Failed to clear badge:', error);
      return false;
    }
  }, []);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }));
      await pushNotificationService.unsubscribe();
      const statusInfo = pushNotificationService.getStatus();

      setStatus({
        ...statusInfo,
        subscribed: false,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      return false;
    }
  }, []);

  return {
    ...status,
    requestPermission,
    updateBadge,
    clearBadge,
    unsubscribe,
  };
};

export default usePushNotifications;
