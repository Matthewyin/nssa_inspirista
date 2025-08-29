'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background">
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
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left text-sm text-muted-foreground">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
