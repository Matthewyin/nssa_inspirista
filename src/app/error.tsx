'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Something went wrong!</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
