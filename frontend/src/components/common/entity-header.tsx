import React from 'react';

import { Button } from '../ui/button';

type EntityHeaderProps = {
  name: string;
  onDelete?: () => void;
};

export default function EntityHeader({ name, onDelete }: EntityHeaderProps) {
  return (
    <section className="flex items-center justify-between">
      <h1 className="titleStyle">{name}</h1>
      <div className="flex items-center gap-2">
        {onDelete && (
          <Button className="bg-destructive hover:bg-destructive/80" onClick={onDelete}>
            مسح الحساب
          </Button>
        )}
      </div>
    </section>
  );
}
