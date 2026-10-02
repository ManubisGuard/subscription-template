import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, Bell, ChevronRight, RefreshCcw, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUserInfo, useConfigData, useChartData } from '@/hooks/useUserData'
import { useLanguage } from '@/hooks/useLanguage'
import { Layout } from '@/components/layout'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { OnlineBadge } from '@/components/online-badge'
import { TrafficChart } from '@/components/traffic-chart'
import { AppsList } from '@/components/AppsList'
import { formatRelativeExpiry } from '@/lib/dateFormatter'
import { AccountOverview } from '@/components/redesign/AccountOverview'
import { ConnectionCenter } from '@/components/redesign/ConnectionCenter'
import { CyberCard, SectionHeading } from '@/components/redesign/CyberCard'
import type { UsageDataPoint } from '@/types/user'

const isUsageDataSeries = (value: unknown): value is UsageDataPoint[] => Array.isArray(value)
const getChartUsageData = (stats: unknown): UsageDataPoint[] => {
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return []
  return Object.values(stats).find(isUsageDataSeries) ?? []
}
function App() {
  const { t } = useTranslation()
  useLanguage()
  const [timeRange,setTimeRange]=useState('7d')
  const [activePanel,setActivePanel]=useState<'overview'|'connections'|'traffic'|'apps'>('overview')
  const { data,headers,error,isLoading,isValidating,refresh }=useUserInfo()
  const { data: configData }=useConfigData()
  const hasInitialData=typeof window!=='undefined' && Boolean(window.__INITIAL_DATA__?.user)
  const effectiveData=data ?? window.__INITIAL_DATA__?.user
  const links=configData?.links ?? window.__INITIAL_DATA__?.links ?? []
  const {startTime,period}=useMemo(()=>{
    const now=new Date(),start=new Date()
    const hours:{[key:string]:number}={'1h':1,'12h':12,'24h':24,'7d':168,'30d':720,'90d':2160}
    start.setTime(now.getTime()-(hours[timeRange]??168)*3600000)
    return {startTime:start,period:timeRange==='1h'?'minute':['12h','24h'].includes(timeRange)?'hour':'day'}
  },[timeRange])
  const {chartData,chartError}=useChartData(startTime,period,true)
  const status=useMemo(()=>{
    const value=String(effectiveData?.status??'active').toLowerCase()
    return ['active','disabled','limited','expired','on_hold'].includes(value)?value:'active'
  },[effectiveData?.status])
  const announcement=useMemo(()=>{
    const raw=headers?.announce
    if(typeof raw!=='string'||!raw.trim()) return null
    if(raw.startsWith('base64:')){
      try{const binary=atob(raw.slice(7).trim());const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}catch{return raw.slice(7)}
    }
    try{return decodeURIComponent(raw)}catch{return raw}
  },[headers?.announce])
  const announceUrl=typeof headers?.['announce-url']==='string'&&headers['announce-url'].trim()?headers['announce-url']:null
  const nav=[
    ['overview',t('portal.accountIntelligence')],
    ['connections',t('portal.connectionCenter')],
    ['traffic',t('portal.networkAnalytics')],
    ['apps',t('portal.applications')]
  ] as const

  if(isLoading&&!hasInitialData){
    return <Layout><div className="cyber-boot"><div className="cyber-boot-core"><ShieldCheck className="h-8 w-8"/><div><div className="cyber-eyebrow">{t('portal.secureSession')}</div><strong>{t('dashboard.loading')}</strong></div></div><div className="cyber-boot-lines"><span>{t('common.loading')}</span><span>{t('portal.sync')}</span><span>{t('portal.networkChannelReady')}</span></div></div></Layout>
  }

  if(error&&!effectiveData&&!isValidating){
    return <Layout><div className="cyber-error"><div className="cyber-error-icon"><AlertTriangle/></div><div className="cyber-eyebrow">{t('portal.secureSession')}</div><h1>{t('dashboard.error')}</h1><p>{error.message}</p><button className="cyber-action-primary" onClick={refresh}><RefreshCcw className="h-4 w-4"/>{t('portal.sync')}</button></div></Layout>
  }

  if(!effectiveData) return null

  const expiry=useMemo(()=>status==='on_hold'?(effectiveData.on_hold_expire_duration?`${Math.floor(effectiveData.on_hold_expire_duration/86400)} ${t('time.days')}`:t('userInfo.noTimeLimit')):formatRelativeExpiry(effectiveData.expire,t).time,[status,effectiveData.expire,effectiveData.on_hold_expire_duration,t])
  const chartPoints=getChartUsageData(chartData?.stats)

  return <Layout>
    <div className="cyber-shell">
      <div className="cyber-ambient cyber-ambient-a"/><div className="cyber-ambient cyber-ambient-b"/><div className="cyber-grid"/>
      <DashboardTop user={effectiveData.username} onlineAt={effectiveData.online_at} validating={isValidating} refresh={refresh} status={status}/>
      <div className="cyber-layout">
        <aside className="cyber-nav" aria-label={t('portal.controlCenter')}>
          <div className="cyber-nav-label">{t('portal.controlCenter')}</div>
          {nav.map(([id,label])=><button key={id} type="button" aria-current={activePanel===id?'page':undefined} onClick={()=>setActivePanel(id)} className={activePanel===id?'cyber-nav-item cyber-nav-item-active':'cyber-nav-item'}><span>{label}</span><ChevronRight className="h-3.5 w-3.5"/></button>)}
          <div className="cyber-nav-line"/>
          <div className="cyber-nav-state"><span className="cyber-dot status-active"/><div><b>{t('status.'+status)}</b><small>{expiry}</small></div></div>
        </aside>
        <main className="cyber-main">
          <div className="cyber-hero">
            <div><div className="cyber-eyebrow">{t('portal.secureSession')} · {t('portal.sync')}</div><h2>{t('dashboard.title',{username:effectiveData.username})}</h2><p>{t('portal.networkAnalytics')}</p></div>
            <div className="cyber-hero-signal"><span/><span/><span/><span/><span/></div>
          </div>
          {announcement&&<CyberCard accent="amber" className="p-4 sm:p-5"><div className="flex items-start gap-3"><div className="cyber-icon"><Bell className="h-4 w-4"/></div><div className="min-w-0 flex-1"><div className="cyber-eyebrow">{t('portal.systemAlert')}</div><p className="mt-1 whitespace-pre-wrap break-words text-sm">{announcement}</p>{announceUrl&&<a href={announceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">{t('userInfo.viewAnnouncement')}<ArrowUpRight className="h-3.5 w-3.5"/></a>}</div></div></CyberCard>}
          <div key={activePanel} className="cyber-panel-content">
            {activePanel==='overview'&&<><AccountOverview user={effectiveData}/><CyberCard accent="cyan" className="p-5 sm:p-7"><SectionHeading eyebrow={t('portal.subscriptionCenter')} title={t('portal.subscriptionCenter')}/><div className="cyber-subscription"><div className="flex min-w-0 items-center gap-3"><div className="cyber-icon"><Activity className="h-4 w-4"/></div><div className="min-w-0"><div className="cyber-eyebrow">{t('config.subscriptionLink')}</div><div dir="ltr" className="mt-1 max-w-full truncate text-xs text-muted-foreground text-start">{window.location.origin+window.location.pathname.replace(/\\/info$/,'')}</div></div></div><a className="cyber-action-primary shrink-0" href={window.location.origin+window.location.pathname.replace(/\\/info$/,'')} target="_blank" rel="noreferrer">{t('portal.open')}<ArrowUpRight className="h-3.5 w-3.5"/></a></div></CyberCard></>}
            {activePanel==='connections'&&<ConnectionCenter links={links}/>}
            {activePanel==='traffic'&&<section id="traffic"><CyberCard className="p-5 sm:p-7"><SectionHeading eyebrow={t('portal.networkIntelligence')} title={t('portal.networkAnalytics')} meta={chartError?t('usage.error'):undefined}/><TrafficChart data={chartPoints} isLoading={!chartData&&!chartError} error={chartError} timeRange={timeRange} onTimeRangeChange={setTimeRange}/></CyberCard></section>}
            {activePanel==='apps'&&<section id="apps"><CyberCard className="p-5 sm:p-7"><SectionHeading eyebrow={t('portal.applicationCenter')} title={t('portal.applications')}/><AppsList/></CyberCard></section>}
          </div>
          {headers?.['support-url']&&<div className="text-center pb-8"><a href={headers['support-url']} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary">{t('userInfo.supportUrl')}</a></div>}
        </main>
      </div>div>
    </div>
  </Layout>
}

function DashboardTop({user,onlineAt,validating,refresh,status}:{user:string;onlineAt:string|null;validating:boolean;refresh:()=>void;status:string}){
 const {t}=useTranslation()
 return <header className="cyber-top"><div className="flex min-w-0 items-center gap-3"><div className="cyber-brand-mark"><ShieldCheck className="h-5 w-5"/></div><div className="min-w-0"><div className="cyber-eyebrow">{t('brand.name')} · {t('portal.controlCenter')}</div><h1 dir="ltr" className="truncate text-lg sm:text-xl font-semibold text-start">{user}</h1></div><div className="hidden sm:flex items-center gap-2"><OnlineBadge lastOnline={onlineAt} showText/><span className={`cyber-live ${status==='active'?'':'opacity-60'}`}><Activity className="h-3 w-3"/>{t('portal.live')}</span></div></div><div className="flex items-center gap-2"><button className="icon-action" disabled={validating||status==='disabled'} onClick={refresh} title={t('portal.sync')} aria-label={t('portal.sync')}><RefreshCcw className={`h-4 w-4 ${validating?'animate-spin':''}`}/></button><LanguageSwitcher/><ThemeToggle/></div></header>
}
export default App
