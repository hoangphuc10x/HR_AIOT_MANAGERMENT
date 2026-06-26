import { Employee } from '@/types/common/common.type';
import TableBody from './TableBody';
import TableHeader from './TableHeader';

export default function TableView({ employees }: { employees: Employee[] }) {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="overflow-x-auto rounded-xl">
        <table className="table-auto min-w-max w-full border-collapse">
          <TableHeader />
          <TableBody employees={employees} />
        </table>
      </div>
    </div>
  );
}
