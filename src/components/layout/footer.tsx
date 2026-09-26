import { REPO_URL } from '@/constants/project';
import { useSupportUrl } from '@/hooks/useUserData';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import type { FC } from 'react';
import { ShieldCheck } from 'lucide-react';

const FooterContent = () => {
  const { t } = useTranslation();
  const { supportUrl } = useSupportUrl();

  return (
    <div className="w-full max-w-7xl space-y-4">
      {supportUrl && (
        <div className="flex justify-center">
          <a href={supportUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-xl transition-all hover:border-primary/40 hover:bg-primary/10">
            <ShieldCheck className="h-4 w-4" />
            {t('userInfo.supportUrl')}
          </a>
        </div>
      )}
      <Separator className="opacity-50" />
      <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row">
        <p className="text-xs text-muted-foreground">
          Developed by <a className="font-medium text-primary hover:text-secondary" href={REPO_URL} target="_blank" rel="noopener noreferrer">ManubisGuard</a> Team
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">Cyber Pulse Subscription</p>
      </div>
    </div>
  );
};

export const Footer: FC = ({ ...props }) => (
  <footer dir="ltr" className="relative w-full px-4 pb-6 pt-4 sm:px-6" {...props}>
    <div className="mx-auto flex justify-center"><FooterContent /></div>
  </footer>
);
