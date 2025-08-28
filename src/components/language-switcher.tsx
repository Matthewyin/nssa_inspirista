'use client'

import { useLanguage } from '@/hooks/use-language'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="language-select" className="px-2 text-xs font-medium text-sidebar-foreground/70">{t('languageSwitcher.label')}</Label>
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'zh')}>
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder={t('languageSwitcher.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="zh">中文 (Chinese)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
