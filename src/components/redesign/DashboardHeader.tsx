import { Activity,RefreshCcw,ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { OnlineBadge } from '@/components/online-badge'
import type { UserInfo } from '@/types/user'
export function DashboardHeader({user,validating,refresh,status}:{user:UserInfo;validating:boolean;refresh:()=>void;status:string}){const {t}=useTranslation();return <header className="cyber-header"><div className="flex min-w-0 items-center gap-3"><div className="cyber-brand-mark"><ShieldCheck className="h-5 w-5"/></div><div className="min-w-0"><div className="cyber-eyebrow">{t('brand.name')} · {t('brand.tagline')}</div><h1 className="truncate text-xl sm:text-2xl font-semibold tracking-tight">{user.username}</h1></div><div className="hidden sm:flex items-center gap-2 ml-2"><OnlineBadge lastOnline={user.online_at} showText/><span className="cyber-live"><Activity className="h-3 w-3"/>LIVE</span></div></div><div className="flex items-center gap-2"><button className="icon-action" disabled={validating||status==='disabled'} onClick={refresh} title={t('common.loading')} aria-label={t('common.loading')}><RefreshCcw className={`h-4 w-4 ${validating?'animate-spin':''}`}/></button><LanguageSwitcher/><ThemeToggle/></div></header>}
