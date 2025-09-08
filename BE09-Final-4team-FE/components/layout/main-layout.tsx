"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from './sidebar';
import { Header } from './header';
import GlobalAIChat from '@/app/aichat/GlobalAIChat';

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function MainLayout({ children, requireAuth = true, requireAdmin = false }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isAdmin } = useAuth();

  const needsLogin = (requireAuth || requireAdmin) && !isLoggedIn;
  const needsAdminAccess = requireAdmin && !isAdmin;

  useEffect(() => {
    if (needsLogin) {
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }

    if (needsAdminAccess) {
      router.push('/');
      return;
    }
  }, [needsLogin, needsAdminAccess, pathname]);

  if (needsLogin || needsAdminAccess) {
    return null;
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden ml-72">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
      <div>
        <GlobalAIChat />
      </div>
    </>
  );
}
