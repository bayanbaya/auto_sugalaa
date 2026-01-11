'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 минут миллисекундээр
const SESSION_KEY = 'admin_session';
const LAST_ACTIVITY_KEY = 'admin_last_activity';

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Session шалгах
  const checkAuth = () => {
    // Login хуудас бол шалгалт хийхгүй
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return true;
    }

    const session = sessionStorage.getItem(SESSION_KEY);
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);

    if (!session || !lastActivity) {
      return false;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();

    // 30 минутаас хэтэрсэн эсэх
    if (currentTime - lastActivityTime > SESSION_TIMEOUT) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(LAST_ACTIVITY_KEY);
      return false;
    }

    return true;
  };

  // Activity шинэчлэх
  const updateActivity = () => {
    if (pathname !== '/admin/login') {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  };

  // Анхны auth шалгалт
  useEffect(() => {
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    setIsChecking(false);

    if (!isAuth && pathname !== '/admin/login') {
      router.push('/');
    }
  }, [pathname, router]);

  // Activity tracker
  useEffect(() => {
    if (!isAuthenticated || pathname === '/admin/login') {
      return;
    }

    // Activity шинэчлэх event handlers
    const handleActivity = () => {
      updateActivity();
    };

    // Event listeners нэмэх
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Timeout шалгах interval
    const interval = setInterval(() => {
      if (!checkAuth()) {
        setIsAuthenticated(false);
        router.push('/');
      }
    }, 60000); // 1 минут тутамд шалгах

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(interval);
    };
  }, [isAuthenticated, pathname, router]);

  // Шалгаж байгаа үед loading
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-600">Шалгаж байна...</p>
        </div>
      </div>
    );
  }

  // Login хуудас биш, нэвтрээгүй бол хоосон
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
