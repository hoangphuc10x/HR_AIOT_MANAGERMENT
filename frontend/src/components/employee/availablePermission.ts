import { PermissionEnum } from '@/enums/permission.enum';

export const availablePermissions = [
  { id: PermissionEnum.SET_PERMISSION, key: 'permissions.setPermission' },
  { id: PermissionEnum.VIEW_ALL_EMPLOYEE, key: 'permissions.viewAllEmployee' },
  { id: PermissionEnum.CREATE_EMPLOYEE, key: 'permissions.createEmployee' },
  { id: PermissionEnum.DELETE_EMPLOYEE, key: 'permissions.deleteEmployee' },
  {
    id: PermissionEnum.VIEW_ALL_DEPARTMENT,
    key: 'permissions.viewAllDepartment',
  },
  { id: PermissionEnum.CREATE_DEPARTMENT, key: 'permissions.createDepartment' },
  {
    id: PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
    key: 'permissions.updateDepartment',
  },
  {
    id: PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
    key: 'permissions.deleteDepartment',
  },
  {
    id: PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
    key: 'permissions.removeEmployee',
  },
  {
    id: PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT,
    key: 'permissions.inviteEmployee',
  },
  {
    id: PermissionEnum.VIEW_ATTENDANCE_ALL_DEPARTMENT,
    key: 'permissions.viewAttendance',
  },
  {
    id: PermissionEnum.VIEW_LEAVE_REQUEST_ALL_DEPARTMENT,
    key: 'permissions.viewLeaveRequest',
  },
  {
    id: PermissionEnum.APPROVE_LEAVE_REQUEST_ALL_DEPARTMENT,
    key: 'permissions.approveLeaveRequest',
  },
  {
    id: PermissionEnum.REJECT_LEAVE_REQUEST_ALL_DEPARTMENT,
    key: 'permissions.rejectLeaveRequest',
  },
];
