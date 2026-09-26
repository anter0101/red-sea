import type { TreeExportNode } from './types';

export function flattenTreeRows<TRow>(
  nodes: TreeExportNode<TRow>[],
  depth = 0,
): Array<{ row: TRow; depth: number }> {
  const result: Array<{ row: TRow; depth: number }> = [];

  for (const node of nodes) {
    result.push({ row: node.row, depth });
    if (node.children?.length) {
      result.push(...flattenTreeRows(node.children, depth + 1));
    }
  }

  return result;
}
