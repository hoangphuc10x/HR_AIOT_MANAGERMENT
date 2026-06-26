import { useTranslation } from 'react-i18next';
import { StatBox } from '../common/ui/box';
import { RoleAndSexDict } from '@/types/common/common.type';
import { Users, UserCog, User, UserPlus, UserMinus } from 'lucide-react';

export default function EmployeeOverview({
  roleAndSexData,
  totalStaff,
  onFilter,
}: {
  roleAndSexData?: RoleAndSexDict;
  totalStaff: number;
  onFilter?: (filter: { type: 'ROLE' | 'SEX'; value: string | null }) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      <StatBox
        label={t('employee.totalEmployees').toUpperCase()}
        value={totalStaff}
        color="bg-yellow-100"
        textColor="text-yellow-700"
        icon={<Users className="h-6 w-6 text-yellow-700" />}
        onClick={() => onFilter?.({ type: 'ROLE', value: null })}
      />

      <StatBox
        label={t('common.admin').toUpperCase()}
        value={roleAndSexData?.ADMIN || 0}
        color="bg-red-100"
        textColor="text-red-700"
        icon={<UserCog className="h-6 w-6 text-red-700" />}
        onClick={() => onFilter?.({ type: 'ROLE', value: 'ADMIN' })}
      />

      <StatBox
        label={t('common.staff').toUpperCase()}
        value={roleAndSexData?.STAFF || 0}
        color="bg-green-100"
        textColor="text-green-700"
        icon={<User className="h-6 w-6 text-green-700" />}
        onClick={() => onFilter?.({ type: 'ROLE', value: 'STAFF' })}
      />

      <StatBox
        label={t('employee.male').toUpperCase()}
        value={roleAndSexData?.MALE || 0}
        color="bg-blue-100"
        textColor="text-blue-700"
        icon={<UserPlus className="h-6 w-6 text-blue-700" />}
        onClick={() => onFilter?.({ type: 'SEX', value: 'MALE' })}
      />

      <StatBox
        label={t('employee.female').toUpperCase()}
        value={roleAndSexData?.FEMALE || 0}
        color="bg-pink-100"
        textColor="text-pink-700"
        icon={<UserMinus className="h-6 w-6 text-pink-700" />}
        onClick={() => onFilter?.({ type: 'SEX', value: 'FEMALE' })}
      />
    </div>
  );
}
