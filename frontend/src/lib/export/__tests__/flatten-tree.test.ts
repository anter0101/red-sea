import { flattenTreeRows } from '../flatten-tree';

describe('flattenTreeRows', () => {
  it('flattens nested tree nodes in depth-first order', () => {
    const flat = flattenTreeRows([
      {
        row: { id: 1, name: 'Root' },
        children: [
          {
            row: { id: 2, name: 'Child' },
            children: [{ row: { id: 3, name: 'Grandchild' } }],
          },
        ],
      },
    ]);

    expect(flat.map((item) => item.row.name)).toEqual(['Root', 'Child', 'Grandchild']);
    expect(flat.map((item) => item.depth)).toEqual([0, 1, 2]);
  });

  it('returns empty array for empty input', () => {
    expect(flattenTreeRows([])).toEqual([]);
  });
});
