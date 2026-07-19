import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';

export default function IndexPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  return <Navigate to={user ? '/home' : '/login'} replace />;
}
