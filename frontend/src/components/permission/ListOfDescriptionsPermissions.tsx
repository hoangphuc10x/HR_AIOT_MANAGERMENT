import { PermissionEnum } from '@/enums/permission.enum';
import { PermissionGroup } from '@/types/employee/userWithPermissions.interface';
import { Shield, Users, Building, UserCheck, Calendar } from 'lucide-react';
import { TFunction } from 'i18next';

export const getPermissionGroups = (t: TFunction): PermissionGroup[] => {
  return [
    {
      title: t('permissionGroup.system'),
      icon: <Shield size={18} className="text-red-600" />,
      permissions: [
        {
          id: PermissionEnum.SET_PERMISSION,
          name: t('permissions.setPermission.name'),
          description: t('permissions.setPermission.description'),
        },
      ],
    },
    {
      title: t('permissionGroup.employee'),
      icon: <Users size={18} className="text-blue-600" />,
      permissions: [
        {
          id: PermissionEnum.VIEW_ALL_EMPLOYEE,
          name: t('permissions.viewAllEmployee.name'),
          description: t('permissions.viewAllEmployee.description'),
        },
        {
          id: PermissionEnum.CREATE_EMPLOYEE,
          name: t('permissions.createEmployee.name'),
          description: t('permissions.createEmployee.description'),
        },
        {
          id: PermissionEnum.DELETE_EMPLOYEE,
          name: t('permissions.deleteEmployee.name'),
          description: t('permissions.deleteEmployee.description'),
        },
      ],
    },
    {
      title: t('permissionGroup.department'),
      icon: <Building size={18} className="text-green-600" />,
      permissions: [
        {
          id: PermissionEnum.VIEW_ALL_DEPARTMENT,
          name: t('permissions.viewAllDepartment.name'),
          description: t('permissions.viewAllDepartment.description'),
        },
        {
          id: PermissionEnum.CREATE_DEPARTMENT,
          name: t('permissions.createDepartment.name'),
          description: t('permissions.createDepartment.description'),
        },
        {
          id: PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
          name: t('permissions.updateDepartment.name'),
          description: t('permissions.updateDepartment.description'),
        },
        {
          id: PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
          name: t('permissions.deleteDepartment.name'),
          description: t('permissions.deleteDepartment.description'),
        },
        {
          id: PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
          name: t('permissions.removeEmployee.name'),
          description: t('permissions.removeEmployee.description'),
        },
        {
          id: PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT,
          name: t('permissions.inviteEmployee.name'),
          description: t('permissions.inviteEmployee.description'),
        },
      ],
    },
    {
      title: t('permissionGroup.attendance'),
      icon: <UserCheck size={18} className="text-purple-600" />,
      permissions: [
        {
          id: PermissionEnum.VIEW_ATTENDANCE_ALL_DEPARTMENT,
          name: t('permissions.viewAttendance.name'),
          description: t('permissions.viewAttendance.description'),
        },
      ],
    },
    {
      title: t('permissionGroup.leave'),
      icon: <Calendar size={18} className="text-orange-600" />,
      permissions: [
        {
          id: PermissionEnum.VIEW_LEAVE_REQUEST_ALL_DEPARTMENT,
          name: t('permissions.viewLeaveRequest.name'),
          description: t('permissions.viewLeaveRequest.description'),
        },
        {
          id: PermissionEnum.APPROVE_LEAVE_REQUEST_ALL_DEPARTMENT,
          name: t('permissions.approveLeaveRequest.name'),
          description: t('permissions.approveLeaveRequest.description'),
        },
        {
          id: PermissionEnum.REJECT_LEAVE_REQUEST_ALL_DEPARTMENT,
          name: t('permissions.rejectLeaveRequest.name'),
          description: t('permissions.rejectLeaveRequest.description'),
        },
      ],
    },
  ];
};
