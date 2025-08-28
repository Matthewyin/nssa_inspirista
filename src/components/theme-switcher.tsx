'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { Label } from '@/components/ui/label'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-2">
        <Label className="px-2 text-xs font-medium text-sidebar-foreground/70">{t('themeSwitcher.label')}</Label>
        <div className="grid grid-cols-2 gap-2">
            <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="w-full"
            >
                <Sun className="h-4 w-4 mr-2" />
                {t('themeSwitcher.light')}
            </Button>
            <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="w-full"
            >
                <Moon className="h-4 w-4 mr-2" />
                {t('themeSwitcher.dark')}
            </Button>
        </div>
    </div>
  )
}
