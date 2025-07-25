'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
