export type ExportColumnDef<TRow> = {
  key: keyof TRow | string;
  header: string;
  format?: (value: unknown, row: TRow) => string | number;
  exclude?: boolean;
};

export type TableExportConfig<TApi, TRow, TParams extends Record<string, unknown> = Record<string, unknown>> = {
  endPoint: string;
  params?: TParams;
  columns: ExportColumnDef<TRow>[];
  mapRow: (item: TApi) => TRow;
  fileName: string;
  enabled?: boolean;
  maxRows?: number;
};

export type FetchAllPaginatedOptions<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  T = unknown,
> = {
  endPoint: string;
  params?: TParams;
  pageSize?: number;
  maxRows?: number;
  parseResponse?: (
    data: unknown,
    headers: Record<string, string | number | undefined>,
  ) => { items: T[]; totalCount: number };
};

export type FetchAllPaginatedResult<T> = {
  data: T[];
  totalCount: number;
};

export type TreeExportNode<TRow> = {
  row: TRow;
  children?: TreeExportNode<TRow>[];
};
