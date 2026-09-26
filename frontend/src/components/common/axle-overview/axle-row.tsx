'use client';

import { forwardRef } from 'react';

import TireSlot from './tire-slot';
import {
  PHYSICAL_SLOT_ORDER,
  type SelectedTire,
  type TirePositionKey,
  type TireSlotState,
} from './types';

type AxleRowProps = {
  axleIndex: number;
  title: string;
  positions: TirePositionKey[];
  selected: SelectedTire | null;
  getSlotState: (axleIndex: number, position: TirePositionKey) => TireSlotState;
  getPositionLabel: (position: TirePositionKey) => string;
  onSelect: (selection: SelectedTire) => void;
  isActive?: boolean;
};

const AxleRow = forwardRef<HTMLDivElement, AxleRowProps>(function AxleRow(
  {
    axleIndex,
    title,
    positions,
    selected,
    getSlotState,
    getPositionLabel,
    onSelect,
    isActive = false,
  },
  ref,
) {
  const positionSet = new Set(positions);

  return (
    <div
      ref={ref}
      data-axle-index={axleIndex}
      className={`space-y-3 rounded-xl px-2 py-3 transition-colors ${
        isActive ? 'bg-primary/5 ring-1 ring-primary/30' : ''
      }`}
    >
      <h3 className="text-sm font-semibold text-center text-foreground">{title}</h3>

      <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
        {PHYSICAL_SLOT_ORDER.map((position) => {
          if (!positionSet.has(position)) {
            return (
              <div
                key={`${axleIndex}-spacer-${position}`}
                className="h-16 w-9 shrink-0"
                aria-hidden
              />
            );
          }

          const state = getSlotState(axleIndex, position);
          const isSelected =
            selected?.axleIndex === axleIndex && selected.positionKey === position;

          return (
            <TireSlot
              key={`${axleIndex}-${position}`}
              label={getPositionLabel(position)}
              selected={isSelected}
              filled={state.filled}
              hasError={state.hasError}
              onClick={() => onSelect({ axleIndex, positionKey: position })}
            />
          );
        })}
      </div>

      <div className="mx-auto flex h-2 w-[min(100%,18rem)] items-center" dir="ltr" aria-hidden>
        <div className="h-1.5 flex-1 rounded-full bg-slate-400" />
        <div className="mx-1 h-3 w-3 shrink-0 rounded-full border-2 border-slate-500 bg-slate-200" />
        <div className="h-1.5 flex-1 rounded-full bg-slate-400" />
      </div>
    </div>
  );
});

export default AxleRow;
