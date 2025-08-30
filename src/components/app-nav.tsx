
'use client';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarContent } from '@/components/ui/sidebar';
import { LayoutDashboard, Lightbulb, List, CheckSquare, Settings, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppNav() {
  const pathname = usePathname();
  const { t, isClient } = useLanguage();

  const menuItems = [
    { href: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/notes', label: t('nav.notes'), icon: Lightbulb },
    { href: '/checklist', label: t('nav.checklist'), icon: List },
    { href: '/tasks', label: t('nav.tasks'), icon: CheckSquare },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      <SidebarHeader className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-lg">
                    <Star className="text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-sidebar-foreground">Inspirista</h2>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/notes/new" className="flex items-center gap-3 w-full cursor-pointer">
                    <div className="p-1 rounded bg-yellow-100 dark:bg-yellow-900/30">
                      <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span>{t('nav.createInspiration')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/checklist?action=create" className="flex items-center gap-3 w-full cursor-pointer">
                    <div className="p-1 rounded bg-green-100 dark:bg-green-900/30">
                      <List className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{t('nav.createChecklist')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tasks?action=create" className="flex items-center gap-3 w-full cursor-pointer">
                    <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                      <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{t('nav.createTask')}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {isClient && menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
