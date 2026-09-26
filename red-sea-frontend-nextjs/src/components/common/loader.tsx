import { useTranslations } from 'next-intl';

import { Spinner } from '@/components/ui/spinner';

const Loader = ({ message, withMessage = true }: { message?: string; withMessage?: boolean }) => {
  const t = useTranslations('common');
  return (
    <div className="flex items-center justify-center flex-col h-60">
      <Spinner />
      {withMessage && (message || t('loading'))}
    </div>
  );
};

export default Loader;
