'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (loading || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <div className="bg-primary p-3 rounded-lg inline-block">
                    <Star className="text-primary-foreground h-8 w-8" />
                </div>
            </div>
          <CardTitle className="text-3xl font-bold">Welcome to Inspirista</CardTitle>
          <CardDescription>Sign in to capture your thoughts, ideas, and inspiration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
