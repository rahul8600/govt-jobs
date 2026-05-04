import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  isAdmin: boolean;
  loading: boolean;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAdmin: false,
    loading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAuthState({ isAdmin: data.isAdmin, loading: false });
      } else {
        setAuthState({ isAdmin: false, loading: false });
      }
    } catch {
      setAuthState({ isAdmin: false, loading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAdmin: authState.isAdmin,
    loading: authState.loading,
    refresh: checkAuth,
  };
}
