'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializeDatabase } from '@/lib/initialData';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';

export default function AppInitializer({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const { loading } = useAuth();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Initialize the database with users
    initializeDatabase();
  }, []);

  // Don't show anything while loading
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If it's a public route, don't wrap with ProtectedRoute
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Otherwise, protect the route
  return <ProtectedRoute>{children}</ProtectedRoute>;
} 