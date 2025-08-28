import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppNav } from '@/components/app-nav';
import { AppHeader } from '@/components/app-header';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/hooks/use-language';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Inspirista',
  description: 'Capture your thoughts, ideas, and inspiration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
            <LanguageProvider>
              <SidebarProvider>
                <Sidebar>
                  <AppNav />
                </Sidebar>
                <SidebarInset>
                  <div className="flex flex-col h-screen">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-secondary/30">
                      {children}
                    </main>
                  </div>
                </SidebarInset>
              </SidebarProvider>
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
