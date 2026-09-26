import type { IAccountTableRow } from '../api/get-all';

export type AccountTreeNode = IAccountTableRow & {
  children: AccountTreeNode[];
};

/** Nest flat account rows into a forest using parentAccountId. */
export function buildAccountTree(accounts: IAccountTableRow[]): AccountTreeNode[] {
  const byId = new Map<number, AccountTreeNode>();

  for (const account of accounts) {
    byId.set(account.id, { ...account, children: [] });
  }

  const roots: AccountTreeNode[] = [];

  for (const node of byId.values()) {
    const parentId = node.parentAccountId;
    if (parentId != null && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: AccountTreeNode[]) => {
    nodes.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    for (const n of nodes) sortNodes(n.children);
  };
  sortNodes(roots);

  return roots;
}
