'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // If on homepage or login page, allow direct rendering
    if (pathname === '/' || pathname === '/login') {
      const localAuth = localStorage.getItem('kx_session_auth');
      setIsAuthenticated(localAuth === 'true');
      return;
    }

    const checkAuth = async () => {
      try {
        const localAuth = localStorage.getItem('kx_session_auth');
        if (localAuth === 'true') {
          setIsAuthenticated(true);
          return;
        }

        // Server verify check
        const res = await fetch('/api/auth/verify');
        const data = await res.json();
        if (data.authenticated) {
          localStorage.setItem('kx_session_auth', 'true');
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace('/login');
        }
      } catch {
        setIsAuthenticated(false);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-bold text-slate-500">Checking Access Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
