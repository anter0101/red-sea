import { useTranslations } from 'next-intl';

import BranchCard from '@/features/branches/components/branch-card';
import type { IBranch } from '@/features/branches/types';

const BranchesList = ({ branches }: { branches: IBranch[] | undefined }) => {
  const t = useTranslations('branches');
  return (
    <div>
      {branches?.length === 0 ? (
        <div className="flex items-center justify-center">
          <p className="text-center p-4">{t('no-branches')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {branches?.map((item) => (
            <BranchCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchesList;
