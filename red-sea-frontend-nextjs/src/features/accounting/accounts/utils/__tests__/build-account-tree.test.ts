import { buildAccountTree } from '../build-account-tree';
import type { IAccountTableRow } from '../../api/get-all';
import { AccountType, NormalBalance } from '../../enums';

function row(
  partial: Partial<IAccountTableRow> & Pick<IAccountTableRow, 'id' | 'code' | 'name'>,
): IAccountTableRow {
  return {
    type: AccountType.ASSET,
    normalBalance: NormalBalance.DEBIT,
    isLeaf: true,
    parentAccountId: null,
    parentAccountName: '—',
    ...partial,
  };
}

describe('buildAccountTree', () => {
  it('nests children under their parent and sorts by code', () => {
    const roots = buildAccountTree([
      row({ id: 2, code: '1-2', name: 'Child B', parentAccountId: 1, isLeaf: true }),
      row({ id: 1, code: '1', name: 'Root', parentAccountId: null, isLeaf: false }),
      row({ id: 3, code: '1-1', name: 'Child A', parentAccountId: 1, isLeaf: true }),
      row({ id: 4, code: '2', name: 'Other root', parentAccountId: null, isLeaf: true }),
    ]);

    expect(roots.map((r) => r.code)).toEqual(['1', '2']);
    expect(roots[0].children.map((c) => c.code)).toEqual(['1-1', '1-2']);
    expect(roots[1].children).toHaveLength(0);
  });

  it('treats orphan rows as roots when parent is missing from the list', () => {
    const roots = buildAccountTree([
      row({ id: 10, code: '9-1', name: 'Orphan', parentAccountId: 999, isLeaf: true }),
    ]);
    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe(10);
  });
});
