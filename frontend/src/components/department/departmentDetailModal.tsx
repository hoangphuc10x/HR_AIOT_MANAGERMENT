import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/department/api-response.interface';
import { Department } from '@/types/department/department.interface';
import { User } from '@/types/employee/users.interface';
import {
  Eye,
  Trash2,
  UserPlus,
  Search,
  Users,
  Building,
  MoreVertical,
  Edit,
  UserMinus,
  ChevronLeft,
} from 'lucide-react';
import { Avatar } from '@/components/common/ui/avatar';
import { Badge } from '@/components/common/ui/badge';
import EmployeeDetail from '@/components/department/EmployeeDetail';
import { DepartmentPermissionEnum } from '@/enums/department-permission.enum';
import RemoveMemberModal from './departmentDeleteUserModal';
import { fetchUserPermissions } from '@/api/user-permission';
import { PermissionEnum } from '@/enums/permission.enum';
import { UserDepartmentPermissionEditModal } from '../permission/UDPEditModal';
import { getDecodedToken } from '@/lib/getDecodedToken';
import AddMembersDepartmentModal from './addMembersDepartmentModal';

interface DepartmentDetailModalProps {
  department: Department;
  index: number;
  onClose: () => void;
  onReload: () => void;
}

interface DepartmentPermissionItem {
  departmentId: number;
  departmentName: string;
  permissions: DepartmentPermissionEnum[];
}

export default function DepartmentDetailModal({
  department,
  index,
  onClose,
  onReload,
}: DepartmentDetailModalProps) {
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [listOfPermissionDepartment, setListOfPermissionDepartment] = useState<
    DepartmentPermissionItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{
    memberId: number;
    departmentId: number;
  } | null>(null);

  const positionMap: Record<number, string> = {
    1: t('department.headDepartment'),
    2: t('department.deputy'),
    3: t('department.staff'),
  };
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !showRemoveModal &&
        !isDetailOpen &&
        !showPermissionModal &&
        !showAddMemberModal
      ) {
        onClose();
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(null); // close dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    onClose,
    showRemoveModal,
    isDetailOpen,
    showPermissionModal,
    showAddMemberModal,
  ]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !showRemoveModal &&
        !isDetailOpen &&
        !showPermissionModal
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose, showRemoveModal, isDetailOpen, showPermissionModal]);

  const decode = getDecodedToken();

  const fetchPermissions = async () => {
    try {
      const userId = decode?.userId;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/permissions/department/${userId}`,
      );
      setListOfPermissionDepartment(res.data.data);
      console.log('permission:', res.data.data);
    } catch (error) {
      toast.error('Failed to load permissions');
      console.error(error);
    }
  };

  const fetchUserPermission = async () => {
    const userId = decode?.userId;
    if (userId) {
      try {
        const permissions = await fetchUserPermissions(userId);
        setUserPermissions(permissions);
        console.log('permission employee', permissions);
      } catch (err) {
        toast.error(t('common.failToFetchPermissions'));
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !i18n.isInitialized) return;

    fetchPermissions();
    fetchUserPermission();
  }, [i18n.isInitialized]);

  const depPermission = listOfPermissionDepartment.find(
    (p) => p.departmentId === department.id,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !i18n.isInitialized) return;

    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        // get employee by department id
        const res = await axios.get<ApiResponse<User[]>>(
          `${process.env.NEXT_PUBLIC_API_URL}/departments/users/${department.id}`,
        );
        setMembers(res.data.data);
        setFilteredMembers(res.data.data);
        console.log('members:', res.data.data);
      } catch (error) {
        toast.error('Failed to load department members');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [i18n.isInitialized, department.id, showAddMemberModal]);

  useEffect(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone.includes(searchTerm),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((member) =>
        statusFilter === 'active' ? member.status === 1 : member.status === 2,
      );
    }

    setFilteredMembers(filtered);
  }, [searchTerm, statusFilter, members]);

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setEmployee(null);
  };

  const handleRemoveMember = () => {
    if (removeTarget?.memberId) {
      setMembers((prev) =>
        prev.filter((member) => member.userId !== removeTarget.memberId),
      );
      setFilteredMembers((prev) =>
        prev.filter((member) => member.userId !== removeTarget.memberId),
      );
      setRemoveTarget(null);
      setShowRemoveModal(false); // close modal after remove
    }
  };

  const getStatusStats = () => {
    const active = members.filter((m) => m.status === 1).length;
    const inactive = members.filter((m) => m.status === 2).length;
    return { active, inactive, total: members.length };
  };

  const stats = getStatusStats();

  const canInviteEmployee = (departmentId: number): boolean => {
    if (
      userPermissions.includes(PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT)
    ) {
      return true;
    }
    const depPerm = listOfPermissionDepartment.find(
      (p) => p.departmentId === departmentId,
    );
    if (
      depPerm &&
      depPerm.permissions.includes(
        DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
      )
    ) {
      return true;
    }
    return false;
  };

  return (
    <div
      className="flex items-center justify-center p-4"
      onClick={(e) => {
        if (
          !showRemoveModal &&
          !isDetailOpen &&
          !showPermissionModal &&
          !showAddMemberModal
        ) {
          onClose();
        }
        e.stopPropagation();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // stop close modal when click to content
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {department.departmentName}
                </h2>
                <p className="text-blue-100 mt-1">
                  {t('department.membersManagement')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">
                {stats.total} {t('department.totalMembers')}
              </span>
            </div>
            <div className="text-sm">
              {stats.active} {t('employee.statusTypes.active')} •{' '}
              {stats.inactive} {t('employee.statusTypes.inactive')}
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('department.searchMembers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {selectedMembers.length > 0 && (
                <button className="flex items-center px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">
                  <UserMinus className="w-4 h-4 mr-2" />
                  {t('department.removeSelected')} ({selectedMembers.length})
                </button>
              )}

              {canInviteEmployee(department.id) && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('department.addEmployee')}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Users className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                {t('department.noMemberFound')}
              </h3>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'This department has no members yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.no')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.employees')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('department.position')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('department.contact')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member, idx) => (
                  <tr
                    key={member.userId ?? idx}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedMembers.includes(member) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Avatar
                          src={member.avatarUrl || ''}
                          alt={member.fullName}
                          fallback={member.fullName.charAt(0)}
                          className="h-10 w-10"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.sex === 1 ? 'Male' : 'Female'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {positionMap[member.position ?? 0] || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {member.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant={member.status === 1 ? 'success' : 'secondary'}
                        className="inline-flex"
                      >
                        {member.status === 1
                          ? t('department.status.1')
                          : t('department.status.2')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        {(userPermissions.includes(
                          PermissionEnum.VIEW_ALL_EMPLOYEE,
                        ) ||
                          depPermission?.permissions.includes(
                            DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                          )) && (
                          <button
                            onClick={() => {
                              setEmployee(member);
                              setIsDetailOpen(true);
                              setShowDropdown(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t('common.viewDetails')}
                          </button>
                        )}

                        {/* Dropdown actions */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowDropdown((prev) =>
                                prev === member.userId ? null : member.userId,
                              )
                            }
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showDropdown === member.userId && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                            >
                              {/* Update Permission */}
                              {userPermissions.includes(
                                PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
                              ) ||
                              depPermission?.permissions.includes(
                                DepartmentPermissionEnum.UPDATE_PERMISSION_IN_DEPARTMENT,
                              ) ? (
                                <button
                                  onClick={() => {
                                    setEmployee(member);
                                    setShowPermissionModal(true);
                                    setShowDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  {t('common.editPermission')}
                                </button>
                              ) : (
                                <div className="flex items-center w-full px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                                  <Edit className="w-4 h-4 mr-2" />
                                  {t('userPermissions.notPermit')}
                                </div>
                              )}

                              {/* Remove Member */}
                              {userPermissions.includes(
                                PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
                              ) ||
                              depPermission?.permissions.includes(
                                DepartmentPermissionEnum.DELETE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                              ) ? (
                                <button
                                  onClick={() => {
                                    setRemoveTarget({
                                      memberId: member.userId,
                                      departmentId: department.id,
                                    });
                                    setShowRemoveModal(true);
                                    setShowDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('common.remove')}
                                </button>
                              ) : (
                                <div className="flex items-center w-full px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('userPermissions.notPermit')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              {t('department.showingMembers', {
                count: filteredMembers.length,
                total: members.length,
              })}
              {selectedMembers.length > 0 && (
                <span className="ml-4 text-blue-600">
                  {t('department.selectedMembers', {
                    count: selectedMembers.length,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {isDetailOpen && employee && (
        <EmployeeDetail
          employee={employee}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && removeTarget && (
        <RemoveMemberModal
          showModal={showRemoveModal}
          setShowModal={setShowRemoveModal}
          memberId={removeTarget.memberId}
          departmentId={removeTarget.departmentId}
          onRemove={handleRemoveMember}
        />
      )}

      {/* User Department Permission Edit Modal */}
      {showPermissionModal && employee && (
        <UserDepartmentPermissionEditModal
          currentDepartmentId={department.id}
          user={employee}
          isOpen={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          onSave={() => {
            fetchPermissions();
            fetchUserPermission();
          }}
        />
      )}

      {showAddMemberModal && (
        <AddMembersDepartmentModal
          setShowDialog={setShowAddMemberModal}
          initialSelectedIds={filteredMembers.map((u) => u.userId)}
          departmentId={department.id}
          isEditMode={true}
          fetchData={() => {
            onReload();
          }}
        />
      )}
    </div>
  );
}
