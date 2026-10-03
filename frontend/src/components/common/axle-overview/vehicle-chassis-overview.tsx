'use client';

import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import AxleRow from './axle-row';
import type { SelectedTire, TirePositionKey, TireSlotState } from './types';

type VehicleChassisOverviewProps = {
  variant?: 'truck' | 'trailer';
  axleCount: number;
  getPositionsForAxle: (axleIndex: number) => TirePositionKey[];
  getAxleTitle: (axleIndex: number) => string;
  selected: SelectedTire | null;
  getSlotState: (axleIndex: number, position: TirePositionKey) => TireSlotState;
  getPositionLabel: (position: TirePositionKey) => string;
  onSelect: (selection: SelectedTire) => void;
  /** When user scrolls the diagram, notify which axle is in focus. */
  onVisibleAxleChange?: (axleIndex: number) => void;
  hint?: string;
  /** Show every axle at once. Used by the print sheet so the diagram is not clipped in a scroll box. */
  layout?: 'scroll' | 'full';
  /** Print layout: checkbox and tire serial beside each slot, without the cab decoration. */
  plain?: boolean;
};

export default function VehicleChassisOverview({
  variant = 'truck',
  axleCount,
  getPositionsForAxle,
  getAxleTitle,
  selected,
  getSlotState,
  getPositionLabel,
  onSelect,
  onVisibleAxleChange,
  hint,
  layout = 'scroll',
  plain = false,
}: VehicleChassisOverviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const axleRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const skipScrollSyncRef = useRef(false);
  const lastVisibleRef = useRef<number | null>(null);

  const setAxleRef = useCallback((axleIndex: number, node: HTMLDivElement | null) => {
    if (node) axleRefs.current.set(axleIndex, node);
    else axleRefs.current.delete(axleIndex);
  }, []);

  // Sync side panel when scrolling the chassis
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !onVisibleAxleChange) return;

    const nodes = root.querySelectorAll<HTMLElement>('[data-axle-index]');
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (skipScrollSyncRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const idx = Number((visible[0].target as HTMLElement).dataset.axleIndex);
        if (Number.isNaN(idx) || lastVisibleRef.current === idx) return;

        lastVisibleRef.current = idx;
        onVisibleAxleChange(idx);
      },
      {
        root,
        threshold: [0.35, 0.55, 0.75],
        rootMargin: '-20% 0px -35% 0px',
      },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [axleCount, onVisibleAxleChange]);

  // When selection changes via click, scroll that axle into view inside the panel
  useEffect(() => {
    if (selected == null) return;
    const node = axleRefs.current.get(selected.axleIndex);
    const root = scrollRef.current;
    if (!node || !root) return;

    skipScrollSyncRef.current = true;
    node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    lastVisibleRef.current = selected.axleIndex;

    const timer = window.setTimeout(() => {
      skipScrollSyncRef.current = false;
    }, 400);

    return () => window.clearTimeout(timer);
  }, [selected?.axleIndex]);

  if (plain) {
    return (
      <div className="bg-white text-black" dir="ltr">
        <div className="flex flex-col gap-2">
          {Array.from({ length: axleCount }).map((_, axleIndex) => (
            <AxleRow
              key={`overview-axle-${axleIndex}`}
              ref={(node) => setAxleRef(axleIndex, node)}
              axleIndex={axleIndex}
              title={getAxleTitle(axleIndex)}
              positions={getPositionsForAxle(axleIndex)}
              selected={selected}
              getSlotState={getSlotState}
              getPositionLabel={getPositionLabel}
              onSelect={onSelect}
              annotated
              plain
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-slate-50/80',
        layout === 'full' ? 'h-auto' : 'h-full min-h-0',
      )}
      dir="ltr"
    >
      {hint ? (
        <p className="shrink-0 border-b px-3 py-2 text-center text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}

      <div
        ref={scrollRef}
        className={cn(
          'p-3 sm:p-4',
          layout === 'full' ? 'overflow-visible' : 'min-h-0 flex-1 overflow-y-auto overscroll-contain',
        )}
      >
        <div
          className={cn(
            'relative mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200 px-3 py-4 shadow-sm',
          )}
        >
          {variant === 'truck' ? (
            <div className="relative flex w-[70%] flex-col items-center" aria-hidden>
              <div className="h-6 w-[55%] rounded-t-xl border-2 border-slate-400 bg-slate-300" />
              <div className="h-8 w-full rounded-md border-2 border-slate-400 bg-slate-300" />
              <div className="absolute -bottom-1 left-1/2 h-10 w-1 -translate-x-1/2 bg-slate-400/80" />
            </div>
          ) : (
            <div className="relative flex w-[55%] flex-col items-center" aria-hidden>
              <div className="h-3 w-8 rounded-full border-2 border-slate-400 bg-slate-300" />
              <div className="mt-1 h-5 w-full rounded-md border-2 border-dashed border-slate-400 bg-slate-200" />
              <div className="absolute -bottom-1 left-1/2 h-8 w-1 -translate-x-1/2 bg-slate-400/80" />
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-y-16 left-1/2 w-px -translate-x-1/2 bg-slate-400/50"
            aria-hidden
          />

          <div className="relative z-[1] flex w-full flex-col gap-4">
            {Array.from({ length: axleCount }).map((_, axleIndex) => (
              <AxleRow
                key={`overview-axle-${axleIndex}`}
                ref={(node) => setAxleRef(axleIndex, node)}
                axleIndex={axleIndex}
                title={getAxleTitle(axleIndex)}
                positions={getPositionsForAxle(axleIndex)}
                selected={selected}
                getSlotState={getSlotState}
                getPositionLabel={getPositionLabel}
                onSelect={onSelect}
                isActive={selected?.axleIndex === axleIndex}
              />
            ))}
          </div>

          <div
            className="h-3 w-[80%] rounded-b-lg border-2 border-slate-400 bg-slate-300"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
