import { DepartmentPermissionEnum } from '@/enums/department-permission.enum';
import { UserDepartmentPermissionGroup } from '@/types/employee/userWithPermissions.interface';
import { Building } from 'lucide-react';
import { TFunction } from 'i18next';

export const getUserDepartmentPermissionGroups = (
  t: TFunction,
): UserDepartmentPermissionGroup[] => {
  return [
    {
      title: t('departmentPermissionGroup.management'),
      icon: <Building size={18} className="text-blue-600" />,
      permissions: [
        {
          id: DepartmentPermissionEnum.VIEW_ONLY,
          name: t('departmentPermissions.viewOnly.name'),
          description: t('departmentPermissions.viewOnly.description'),
        },
        {
          id: DepartmentPermissionEnum.UPDATE_PERMISSION_IN_DEPARTMENT,
          name: t('departmentPermissions.updatePermission.name'),
          description: t('departmentPermissions.updatePermission.description'),
        },
        {
          id: DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
          name: t('departmentPermissions.viewAllEmployee.name'),
          description: t('departmentPermissions.viewAllEmployee.description'),
        },
        {
          id: DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
          name: t('departmentPermissions.inviteEmployee.name'),
          description: t('departmentPermissions.inviteEmployee.description'),
        },
        {
          id: DepartmentPermissionEnum.UPDATE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
          name: t('departmentPermissions.updateEmployee.name'),
          description: t('departmentPermissions.updateEmployee.description'),
        },
        {
          id: DepartmentPermissionEnum.DELETE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
          name: t('departmentPermissions.deleteEmployee.name'),
          description: t('departmentPermissions.deleteEmployee.description'),
        },
        {
          id: DepartmentPermissionEnum.UPDATE_DEPARTMENT,
          name: t('departmentPermissions.updateDepartment.name'),
          description: t('departmentPermissions.updateDepartment.description'),
        },
        {
          id: DepartmentPermissionEnum.DELETE_DEPARTMENT,
          name: t('departmentPermissions.deleteDepartment.name'),
          description: t('departmentPermissions.deleteDepartment.description'),
        },
      ],
    },
  ];
};
