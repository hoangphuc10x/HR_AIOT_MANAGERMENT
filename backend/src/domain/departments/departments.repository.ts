import { BaseRepository } from 'src/common/repositories/base.repository';
import { Department } from './entities/department.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartmentsRepository extends BaseRepository<Department> {
  constructor(dataSource: DataSource) {
    super(Department, dataSource.createEntityManager());
  }
}
