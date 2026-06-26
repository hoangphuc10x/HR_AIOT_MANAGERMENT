// common/base.repository.ts
import { Repository, FindManyOptions, ObjectLiteral } from 'typeorm';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  async paginate(
    options: FindManyOptions<T>,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<T>> {
    const [data, total] = await this.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
