import { DataSource, EntityManager } from 'typeorm';

// Generic transactional wrapper to keep controllers/services clean
export async function withTransaction<T>(
  dataSource: DataSource,
  work: (manager: EntityManager) => Promise<T>,
): Promise<T> {
  return dataSource.transaction(async (manager) => {
    return work(manager);
  });
}
