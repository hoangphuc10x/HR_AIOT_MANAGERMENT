import { Employee } from '@/types/common/common.type';
import TableRow from './TableRow';
import { useTranslation } from 'react-i18next';

export default function TableBody({ employees }: { employees: Employee[] }) {
  const { t } = useTranslation();
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {!employees ? (
        <tr>
          <td colSpan={12} className="py-6 text-center text-gray-500">
            {t('common.loading')}
          </td>
        </tr>
      ) : employees.length === 0 ? (
        <tr>
          <td colSpan={12} className="py-6 text-center text-red-500">
            {t('employee.noEmployeeFound')}
          </td>
        </tr>
      ) : (
        employees.map((user) => (
          <TableRow
            no={user.no}
            key={user.id}
            fullName={user.fullName}
            email={user.email}
            id={user.id}
            phone={user.phone}
            createdAt={user.createdAt}
            roles={user.roles}
            sex={user.sex}
            avatarUrl={user.avatarUrl}
            status={user.status}
            identityNumber={user.identityNumber}
          />
        ))
      )}
    </tbody>
  );
}
