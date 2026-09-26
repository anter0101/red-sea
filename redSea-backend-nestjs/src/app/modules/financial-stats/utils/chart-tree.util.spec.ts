import { Account } from '../../account/account.entity';
import {
  accountById,
  accountsSubsetSorted,
  expandIdsWithAncestors,
  groupByParentId,
  parentKeyOf,
} from './chart-tree.util';

describe('chart-tree.util', () => {
  const p = (id: number, code: string, parentId?: number): Account =>
    ({
      id,
      code,
      parentAccount: parentId != null ? ({ id: parentId } as Account) : undefined,
    }) as Account;

  it('parentKeyOf maps null parent to root', () => {
    expect(parentKeyOf(p(1, 'A'))).toBe('root');
    expect(parentKeyOf(p(2, 'B', 1))).toBe(1);
  });

  it('groupByParentId groups and sorts children by code', () => {
    const accounts = [p(3, 'z', 1), p(2, 'a', 1), p(1, 'root')];
    const m = groupByParentId(accounts);
    expect(m.get('root')!.map((a) => a.id)).toEqual([1]);
    expect(m.get(1)!.map((a) => a.id)).toEqual([2, 3]);
  });

  it('accountById builds id map', () => {
    const m = accountById([p(1, 'A'), p(2, 'B', 1)]);
    expect(m.get(1)?.code).toBe('A');
    expect(m.get(2)?.parentAccount?.id).toBe(1);
  });

  it('expandIdsWithAncestors walks parents', () => {
    const accounts = [p(1, 'R'), p(2, 'C', 1), p(3, 'L', 2)];
    const byId = accountById(accounts);
    const ids = expandIdsWithAncestors(byId, [3]);
    expect([...ids].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('accountsSubsetSorted filters and orders by code', () => {
    const accounts = [p(10, 'b'), p(11, 'a'), p(12, 'c')];
    expect(accountsSubsetSorted(accounts, new Set([11, 12])).map((a) => a.id)).toEqual([11, 12]);
  });
});
