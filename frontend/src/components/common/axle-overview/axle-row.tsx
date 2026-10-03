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
  /** Wider columns with a checkbox and tire serial. Used by the print sheet. */
  annotated?: boolean;
  /** Flat print drawing: no card, no hub, a single axle line. */
  plain?: boolean;
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
    annotated = false,
    plain = false,
  },
  ref,
) {
  const positionSet = new Set(positions);

  return (
    <div
      ref={ref}
      data-axle-index={axleIndex}
      className={
        plain
          ? 'space-y-1 py-1'
          : `space-y-3 rounded-xl px-2 py-3 transition-colors ${
              isActive ? 'bg-primary/5 ring-1 ring-primary/30' : ''
            }`
      }
    >
      <h3 className={`text-center font-semibold ${plain ? 'text-xs text-black' : 'text-sm text-foreground'}`}>{title}</h3>

      <div
        className={`flex justify-center gap-2 sm:gap-3 ${plain ? 'items-start' : 'items-center'}`}
        dir="ltr"
      >
        {PHYSICAL_SLOT_ORDER.map((position) => {
          if (!positionSet.has(position)) {
            return (
              <div
                key={`${axleIndex}-spacer-${position}`}
                className={annotated ? 'h-8 w-36 shrink-0' : 'h-16 w-9 shrink-0'}
                aria-hidden
              />
            );
          }

          const state = getSlotState(axleIndex, position);
          const isSelected =
            Boolean(state.selected) ||
            (selected?.axleIndex === axleIndex && selected.positionKey === position);
          if (!annotated) {
            return (
              <TireSlot
                key={`${axleIndex}-${position}`}
                label={getPositionLabel(position)}
                selected={isSelected}
                filled={state.filled}
                hasError={state.hasError}
                disabled={state.disabled}
                onClick={() => {
                  if (state.disabled) return;
                  onSelect({ axleIndex, positionKey: position });
                }}
              />
            );
          }

          return (
            <div
              key={`${axleIndex}-${position}`}
              className="flex w-36 shrink-0 flex-col items-center gap-0.5"
            >
              <div className="flex items-center gap-1">
                {state.showCheckbox ? (
                  <span className="inline-block h-3 w-3 shrink-0 border border-black bg-white" />
                ) : null}
                <span
                  className={`inline-block h-8 w-4 shrink-0 rounded-full border border-black ${
                    state.filled ? 'bg-black' : 'bg-white'
                  }`}
                  title={getPositionLabel(position)}
                />
              </div>
              <TireSerial serial={state.lines?.[0]} />
            </div>
          );
        })}
      </div>

      <div
        className={`mx-auto flex items-center ${plain ? 'h-px w-full max-w-xl bg-black' : 'h-2 w-[min(100%,18rem)]'}`}
        dir="ltr"
        aria-hidden
      >
        {plain ? null : (
          <>
            <div className="h-1.5 flex-1 rounded-full bg-slate-400" />
            <div className="mx-1 h-3 w-3 shrink-0 rounded-full border-2 border-slate-500 bg-slate-200" />
            <div className="h-1.5 flex-1 rounded-full bg-slate-400" />
          </>
        )}
      </div>
    </div>
  );
});

function TireSerial({ serial }: { serial?: string }) {
  if (!serial) return null;
  return <p className="w-full break-all text-center text-[9px] leading-tight text-black">{serial}</p>;
}

export default AxleRow;
