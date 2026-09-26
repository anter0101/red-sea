export interface IQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  totalCount: number;
}
