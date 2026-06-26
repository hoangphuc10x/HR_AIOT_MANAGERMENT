import TableView from './TableView';
import { Employee } from '@/types/common/common.type';

export default function Table({ employees }: { employees: Employee[] }) {
  return (
    <div className="mt-4">
      <TableView employees={employees} />
    </div>
  );
}
