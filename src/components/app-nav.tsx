
'use client';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarContent } from '@/components/ui/sidebar';
import { LayoutDashboard, Lightbulb, List, Settings, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

export function AppNav() {
  const pathname = usePathname();
  const { t, isClient } = useLanguage();

  const menuItems = [
    { href: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/notes', label: t('nav.notes'), icon: Lightbulb },
    { href: '/checklist', label: t('nav.checklist'), icon: List },
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
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/notes/new">
                    <Plus className="h-4 w-4" />
                </Link>
            </Button>
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
