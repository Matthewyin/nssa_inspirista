
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LogOut } from 'lucide-react';

export function AppHeader() {
  const pathname = usePathname();
  const { t, isClient } = useLanguage();
  const { user, logout } = useAuth();

  const getTitle = (pathname: string) => {
    if (pathname.startsWith('/notes/') && pathname !== '/notes/new') {
      return t('titles.editNote');
    }
    if (pathname.startsWith('/reminders/') && pathname !== '/reminders') {
      return t('titles.reminders');
    }
    const titles: { [key: string]: string } = {
        '/': t('titles.dashboard'),
        '/tasks': t('titles.tasks'),
        '/notes': t('titles.myNotes'),
        '/notes/new': t('titles.newNote'),
        '/checklist': t('titles.checklist'),
        '/reminders': t('titles.reminders'),
        '/settings': t('titles.settings'),
    };
    return titles[pathname] || 'Inspirista';
  };
  
  const title = isClient ? getTitle(pathname) : '';

  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-xl font-semibold flex-1">{title}</h1>

      {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <ThemeSwitcher />
                </div>
                <div className="p-2">
                  <LanguageSwitcher />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )}
    </header>
  );
}
