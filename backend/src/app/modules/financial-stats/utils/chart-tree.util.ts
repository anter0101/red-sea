import { Account } from '../../account/account.entity';

export type ParentKey = number | 'root';

export function parentKeyOf(a: Account): ParentKey {
  const pid = a.parentAccount?.id;
  return pid == null ? 'root' : pid;
}

/** Children grouped by parent id (string 'root' for null parent). */
export function groupByParentId(accounts: Account[]): Map<ParentKey, Account[]> {
  const m = new Map<ParentKey, Account[]>();
  for (const a of accounts) {
    const k = parentKeyOf(a);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(a);
  }
  for (const list of m.values()) {
    list.sort((x, y) => x.code.localeCompare(y.code));
  }
  return m;
}

export function accountById(accounts: Account[]): Map<number, Account> {
  return new Map(accounts.map((a) => [a.id, a]));
}

/** Include every ancestor id of each seed id (requires parentAccount loaded on traversed nodes). */
export function expandIdsWithAncestors(
  byId: Map<number, Account>,
  seedIds: Iterable<number>,
): Set<number> {
  const out = new Set<number>();
  for (const id of seedIds) {
    let cur: number | undefined = id;
    while (cur != null) {
      if (out.has(cur)) break;
      out.add(cur);
      cur = byId.get(cur)?.parentAccount?.id;
    }
  }
  return out;
}

/** Accounts whose id is in `ids`, sorted by code. */
export function accountsSubsetSorted(all: Account[], ids: Set<number>): Account[] {
  return all.filter((a) => ids.has(a.id)).sort((a, b) => a.code.localeCompare(b.code));
}
