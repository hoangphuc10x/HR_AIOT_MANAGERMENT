import { PermissionEnum } from '@/enums/permission.enum';
import { RoleEnum } from '@/enums/role.enum';
import { t } from 'i18next';
import {
  Shield,
  UserIcon,
  Building,
  CheckCircle,
  Calendar,
} from 'lucide-react';

export const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return t('employee.active');
    case 2:
      return t('employee.inactive');
    default:
      return t('employee.statusTypes.inactive');
  }
};

export const getRoleText = (roles: RoleEnum[]) => {
  if (!roles || roles.length === 0) {
    return 'UNKNOWN';
  }
  const roleNames = roles.map((role) => {
    switch (role) {
      case RoleEnum.ADMIN:
        return t('employee.roles.ADMIN');
      case RoleEnum.STAFF:
        return t('employee.roles.STAFF');
      default:
        return 'UNKNOWN';
    }
  });
  return roleNames.join(', ');
};

export const getPermissionText = (permissionId: PermissionEnum) => {
  switch (permissionId) {
    case PermissionEnum.SET_PERMISSION:
      return t('permissions.setPermission.name');
    case PermissionEnum.VIEW_ALL_EMPLOYEE:
      return t('permissions.viewAllEmployee.name');
    case PermissionEnum.CREATE_EMPLOYEE:
      return t('permissions.createEmployee.name');
    case PermissionEnum.DELETE_EMPLOYEE:
      return t('permissions.deleteEmployee.name');
    case PermissionEnum.VIEW_ALL_DEPARTMENT:
      return t('permissions.viewAllDepartment.name');
    case PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT:
      return t('permissions.createDepartment.name');
    case PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT:
      return t('permissions.updateDepartment.name');
    case PermissionEnum.CREATE_DEPARTMENT:
      return t('permissions.deleteDepartment.name');
    case PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT:
      return t('permissions.removeEmployee.name');
    case PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT:
      return t('permissions.inviteEmployee.name');
    case PermissionEnum.VIEW_ATTENDANCE_ALL_DEPARTMENT:
      return t('permissions.viewAttendance.name');
    case PermissionEnum.VIEW_LEAVE_REQUEST_ALL_DEPARTMENT:
      return t('permissions.viewLeaveRequest.name');
    case PermissionEnum.APPROVE_LEAVE_REQUEST_ALL_DEPARTMENT:
      return t('permissions.approveLeaveRequest.name');
    case PermissionEnum.REJECT_LEAVE_REQUEST_ALL_DEPARTMENT:
      return t('permissions.rejectLeaveRequest.name');
    default:
      return 'UNKNOWN';
  }
};

export const getPermissionCategory = (permissionId: PermissionEnum) => {
  if ([PermissionEnum.SET_PERMISSION].includes(permissionId)) {
    return {
      category: 'System',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      icon: Shield,
    };
  }
  if (
    [
      PermissionEnum.VIEW_ALL_EMPLOYEE,
      PermissionEnum.CREATE_EMPLOYEE,
      PermissionEnum.DELETE_EMPLOYEE,
    ].includes(permissionId)
  ) {
    return {
      category: 'Employee',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      icon: UserIcon,
    };
  }
  if (
    [
      PermissionEnum.VIEW_ALL_DEPARTMENT,
      PermissionEnum.CREATE_DEPARTMENT,
      PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
      PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
      PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
      PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT,
    ].includes(permissionId)
  ) {
    return {
      category: 'Department',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      icon: Building,
    };
  }
  if ([PermissionEnum.VIEW_ATTENDANCE_ALL_DEPARTMENT].includes(permissionId)) {
    return {
      category: 'Attendance',
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      icon: CheckCircle,
    };
  }
  if (
    [
      PermissionEnum.VIEW_LEAVE_REQUEST_ALL_DEPARTMENT,
      PermissionEnum.APPROVE_LEAVE_REQUEST_ALL_DEPARTMENT,
      PermissionEnum.REJECT_LEAVE_REQUEST_ALL_DEPARTMENT,
    ].includes(permissionId)
  ) {
    return {
      category: 'Leave',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      icon: Calendar,
    };
  }
  return {
    category: 'Other',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: Shield,
  };
};
