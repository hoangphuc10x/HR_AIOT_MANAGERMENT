'use client';

import { useEffect, useState } from 'react';
import { Eye, MoreVertical, PencilIcon, Trash2 } from 'lucide-react';
import axios from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import { DepartmentDeleteModal } from './departmentDeleteModal';
import { toast } from 'react-toastify';
import { ApiResponse } from '@/types/department/api-response.interface';
import {
  DepListData,
  Department,
  DepartmentQueryParams,
} from '@/types/department/department.interface';
import { DepartmentStatus } from '@/enums/department-status.enum';
import { fetchUserPermissions } from '@/api/user-permission';
import { PermissionEnum } from '@/enums/permission.enum';
import { DepartmentPermissionEnum } from '@/enums/department-permission.enum';
import EditDepartmentModal from './editDepartmentModal';
import { getDecodedToken } from '@/lib/getDecodedToken';
import { Pagination } from '@/components/common/ui/pagination';
import { LIMIT_ROW } from '@/types/common/common';
import { useRouter, useSearchParams } from 'next/navigation';
import Search from '../common/ui/searchBar';
import { useRef } from 'react';

interface DepartmentPermission {
  departmentId: number;
  departmentName: string;
  permissions: number[];
}

export function DepartmentTable({
  filter,
  onSuccess,
}: {
  filter: { type: 'STATUS'; value: string | null } | null;
  onSuccess: () => void;
}) {
  // const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [depList, setDepList] = useState<Department[] | []>([]);
  useState<Department | null>(null);
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [depId, setDepId] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [joinedDepIds, setJoinedDepIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalFilteredDepartments, setTotalFilteredDepartments] =
    useState<number>(0);
  const router = useRouter();
  const [departmentPermissions, setDepartmentPermissions] = useState<
    { departmentId: number; permissions: number[] }[]
  >([]);
  const [limit, setLimit] = useState<number>(0);
  const [keyword, setKeyword] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(null); // close dropdown when clicked out
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', page.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', '1');
    router.push(`?${newSearchParams.toString()}`);
  };

  const fetchData = async () => {
    const decode = getDecodedToken();

    try {
      setLoading(true);
      const params: DepartmentQueryParams = {
        limit: LIMIT_ROW,
        page: pageParam,
      };

      if (keyword) params.keyword = keyword;
      if (filter?.type == 'STATUS') {
        if (filter.value === '1') params.depStatus = 1;
        else if (filter.value === '2') params.depStatus = 2;
      }

      const res: { data: ApiResponse<DepListData> } = await axios.get(
        'departments',
        { params },
      );

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch departments');
      }

      const {
        items: rawDepList,
        total,
        totalFilteredDepartments,
        page,
        limit,
        totalPages,
      } = res.data.data;
      setTotalPages(totalPages);
      setLimit(limit);
      setPage(page);
      setTotalFilteredDepartments(totalFilteredDepartments);
      console.log(rawDepList);
      const userId = decode?.userId;
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      // Get permission as before
      const resPermission = await axios.get<
        ApiResponse<DepartmentPermission[]>
      >(`${process.env.NEXT_PUBLIC_API_URL}/permissions/department/${userId}`);
      if (!resPermission.data.success) {
        throw new Error(
          resPermission.data.message || 'Failed to fetch permissions',
        );
      }
      setDepartmentPermissions(resPermission.data.data);

      // Get list of departmentId that user has joined (new API)
      const resJoined = await axios.get<ApiResponse<number[]>>(
        `${process.env.NEXT_PUBLIC_API_URL}/departments/user-department/${userId}`,
      );
      if (!resJoined.data.success) {
        throw new Error(
          resJoined.data.message || 'Failed to fetch joined departments',
        );
      }

      const joinedDepIds = resJoined.data.data;
      setJoinedDepIds(joinedDepIds);
      console.log('joinedDepIds:', joinedDepIds);

      // Sort: user join department will be prioritized at the top
      if (rawDepList) {
        const sortedItems = [...rawDepList].sort((a, b) => {
          const aJoined = joinedDepIds.includes(a.id);
          const bJoined = joinedDepIds.includes(b.id);

          if (aJoined && !bJoined) return -1;
          if (!aJoined && bJoined) return 1;
          return b.status - a.status;
        });

        setDepList(sortedItems);
        try {
          const permissions = await fetchUserPermissions(userId);
          setUserPermissions(permissions);
          console.log('permission employee', permissions);
        } catch {
          toast.error(t('common.failToFetchPermissions'));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('department.failToFetchPermissions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
      fetchData();
    }
  }, [i18n.isInitialized, pageParam, keyword, filter]);

  useEffect(() => {
    const paramKeyword = searchParams.get('keyword') || '';
    setKeyword(paramKeyword);
  }, [searchParams]);

  // All user permission on department
  const GLOBAL_PERMISSIONS = [
    PermissionEnum.VIEW_ALL_DEPARTMENT,
    PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
    PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT,
    PermissionEnum.CREATE_DEPARTMENT,
    PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
    PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
  ];

  // check permission of this user
  const hasGlobalPermission = userPermissions.some((p) =>
    GLOBAL_PERMISSIONS.includes(p),
  );

  if (!isReady) return null;

  const Badge: React.FC<{ variant: string; children: React.ReactNode }> = ({
    variant,
    children,
  }) => (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        variant === 'success'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {children}
    </span>
  );

  return (
    <div className=" bg-white p-5">
      <div className="flex items-center justify-between py-3 w-full">
        <Search onSearch={handleSearch} note={2} />
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                {t('common.no')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('department.departmentName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('department.headOfDepartment')}
              </th>
              <th className="px-6 py-3 whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                {t('department.numberOfEmployees')}
              </th>
              <th className="px-6 py-3 whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                {t('common.status')}
              </th>
              <th className="px-6 py-3 whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                {t('common.actions')}
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200 text-gray-800">
            {!depList ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  {t('common.loading')}
                </td>
              </tr>
            ) : depList.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-red-500 font-medium"
                >
                  {t('department.noDepartmentFound')}
                </td>
              </tr>
            ) : (
              depList.map((d, i) => {
                const depPerm = departmentPermissions.find(
                  (p) => p.departmentId === d.id,
                );

                const isEnabled =
                  hasGlobalPermission ||
                  !!depPerm ||
                  joinedDepIds.includes(d.id); //light when have in department

                return (
                  <tr
                    key={i}
                    className={`hover:bg-gray-50 transition-colors text-sm ${
                      !isEnabled ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-900">
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 text-left">
                      {d.departmentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-left">
                      {d.depHead}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                      {Number(d.empNumber)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge
                        variant={
                          d.status === DepartmentStatus.ACTIVE
                            ? 'success'
                            : 'destructive'
                        }
                      >
                        {t(`department.status.${d.status}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Eye (VIEW DETAIL) */}
                        <button
                          disabled={
                            !(
                              userPermissions.some((p) =>
                                [
                                  PermissionEnum.VIEW_ALL_DEPARTMENT,
                                  PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
                                  PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT,
                                  PermissionEnum.CREATE_DEPARTMENT,
                                  PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
                                  PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
                                ].includes(p),
                              ) ||
                              departmentPermissions.some(
                                (p) =>
                                  p.departmentId === d.id &&
                                  (p.permissions.includes(
                                    DepartmentPermissionEnum.VIEW_ONLY,
                                  ) ||
                                    p.permissions.includes(
                                      DepartmentPermissionEnum.UPDATE_PERMISSION_IN_DEPARTMENT,
                                    ) ||
                                    p.permissions.includes(
                                      DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                                    ) ||
                                    p.permissions.includes(
                                      DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
                                    ) ||
                                    p.permissions.includes(
                                      DepartmentPermissionEnum.UPDATE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                                    ) ||
                                    p.permissions.includes(
                                      DepartmentPermissionEnum.DELETE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                                    ) ||
                                    p.permissions.includes(
                                      DepartmentPermissionEnum.UPDATE_DEPARTMENT,
                                    ) ||
                                    p.permissions.includes(
                                      DepartmentPermissionEnum.DELETE_DEPARTMENT,
                                    )),
                              )
                            )
                          }
                          onClick={() => {
                            router.push(`/department/${d.id}`);
                          }}
                          className={`flex items-center px-2 py-2 text-sm rounded-full transition-colors ${
                            userPermissions.some((p) =>
                              [
                                PermissionEnum.VIEW_ALL_DEPARTMENT,
                                PermissionEnum.REMOVE_EMPLOYEE_ALL_DEPARTMENT,
                                PermissionEnum.INVITE_EMPLOYEE_ALL_DEPARTMENT,
                                PermissionEnum.CREATE_DEPARTMENT,
                                PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
                                PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
                              ].includes(p),
                            ) ||
                            departmentPermissions.some(
                              (p) =>
                                p.departmentId === d.id &&
                                (p.permissions.includes(
                                  DepartmentPermissionEnum.VIEW_ONLY,
                                ) ||
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.UPDATE_PERMISSION_IN_DEPARTMENT,
                                  ) ||
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.VIEW_ALL_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                                  ) ||
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.INVITE_EMPLOYEE_TO_SPECIFIC_DEPARTMENT,
                                  ) ||
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.UPDATE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                                  ) ||
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.DELETE_EMPLOYEE_IN_SPECIFIC_DEPARTMENT,
                                  ) ||
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.UPDATE_DEPARTMENT,
                                  ) ||
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.DELETE_DEPARTMENT,
                                  )),
                            )
                              ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-100'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Dropdown for Edit / Remove */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowDropdown(
                                showDropdown === d.id ? null : d.id,
                              )
                            }
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showDropdown === d.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                            >
                              {/* Edit Department */}
                              {userPermissions.includes(
                                PermissionEnum.UPDATE_DEPARTMENT_ALL_DEPARTMENT,
                              ) ||
                              departmentPermissions.some(
                                (p) =>
                                  p.departmentId === d.id &&
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.UPDATE_DEPARTMENT,
                                  ),
                              ) ? (
                                <button
                                  onClick={() => {
                                    setShowEdit(true);
                                    setDepId(d.id);
                                    setShowDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <PencilIcon className="w-4 h-4 mr-2" />
                                  {t('common.edit')}
                                </button>
                              ) : (
                                <div className="flex items-center w-full px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                                  <PencilIcon className="w-4 h-4 mr-2" />
                                  {t('common.edit')}
                                </div>
                              )}

                              {/* Remove Department */}
                              {userPermissions.includes(
                                PermissionEnum.DELETE_DEPARTMENT_ALL_DEPARTMENT,
                              ) ||
                              departmentPermissions.some(
                                (p) =>
                                  p.departmentId === d.id &&
                                  p.permissions.includes(
                                    DepartmentPermissionEnum.DELETE_DEPARTMENT,
                                  ),
                              ) ? (
                                <button
                                  onClick={() => {
                                    setShowDeleteModal(true);
                                    setDepId(d.id);
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
                                  {t('common.remove')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {depList.length > 0 && (
        <Pagination
          totalItems={totalFilteredDepartments}
          currentPage={pageParam}
          onChangePage={handlePageChange}
        />
      )}
      {showEdit && (
        <EditDepartmentModal
          dialogShow={showEdit}
          setShowDialog={setShowEdit}
          onSuccess={fetchData}
          departmentId={depId}
          setDepartmentId={setDepId}
          onReload={onSuccess}
        />
      )}
      <DepartmentDeleteModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        departmentId={depId}
        onDelete={fetchData}
        onReload={onSuccess}
      />
    </div>
  );
}
