'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Table } from '@/components/common/ui/table';
import { Pagination } from '@/components/common/ui/pagination';
import {
  Employee,
  GetEmployeesResponse,
  RoleAndSexDict,
} from '@/types/common/common.type';
import { LIMIT_ROW } from '@/types/common/common';
import { ApiResponse } from '@/types/department/api-response.interface';
import EmployeeOverview from '@/components/employee/EmployeeOverview';
import CreateUserForm from '@/components/employee/AddEmployee';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { CreateUserInterface } from '@/types/employee/createUser.interface';
import EmployeeHeader from '@/components/employee/EmployeeHeader';
import { isAxiosError } from 'axios';
import { EmployeeQueryParams } from '@/types/employee/users.interface';
import { fetchUserPermissions } from '@/api/user-permission';
import { PermissionEnum } from '@/enums/permission.enum';
import { getDecodedToken } from '@/lib/getDecodedToken';
import EmployeeFilter from '@/components/employee/EmployeeFilter';
import { UserStatus } from '@/enums/user-status.enum';
import qs from 'qs';
import Search from '@/components/common/ui/searchBar';

export default function EmployeesList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [roleData, setRoleData] = useState<RoleAndSexDict>();
  const [totalStaff, setTotalStaff] = useState<number>(0);
  const [totalFilteredUsers, setTotalFilteredUsers] = useState<number>(
    0 | totalStaff,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [filter, setFilter] = useState<{
    type: 'ROLE' | 'SEX';
    value: string | null;
  } | null>(null);

  const handleFilter = (newFilter: {
    type: 'ROLE' | 'SEX';
    value: string | null;
  }) => {
    setFilter(newFilter);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', '1');
    router.push(`?${newSearchParams.toString()}`);
  };
  const [keyword, setKeyword] = useState('');

  const handleSearch = (value: string) => {
    setKeyword(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', '1');
    router.push(`?${newSearchParams.toString()}`);
  };

  const [filters, setFilters] = useState<{
    departmentIds: number[];
    status: UserStatus[];
  }>({ departmentIds: [], status: [] });

  const fetchData = useCallback(async () => {
    try {
      const decoded = getDecodedToken();
      const userId = decoded?.userId;
      if (userId) {
        try {
          const permissions = await fetchUserPermissions(userId);
          setUserPermissions(permissions);
          console.log('permission employee', permissions);
        } catch {
          toast.error(t('common.failToFetchPermissions'));
        }
      }

      const params: EmployeeQueryParams = {
        limit: LIMIT_ROW,
        page: pageParam,
      };

      if (keyword) params.keyword = keyword;

      if (filters.departmentIds.length > 0) {
        params.departmentIds = filters.departmentIds;
      }

      if (filters.status.length > 0) {
        params.status = filters.status;
      }

      if (filter?.type === 'ROLE') {
        if (filter.value === 'ADMIN') params.role = 1;
        else if (filter.value === 'STAFF') params.role = 2;
      }

      if (filter?.type === 'SEX') {
        if (filter.value === 'MALE') params.sex = 1;
        else if (filter.value === 'FEMALE') params.sex = 2;
      }

      const res: { data: ApiResponse<GetEmployeesResponse> } = await axios.get(
        '/users',
        {
          params,
          paramsSerializer: (params) =>
            qs.stringify(params, { arrayFormat: 'comma' }),
        },
      );

      const {
        employees: users,
        totalPages,
        totalUsers,
        roleData,
        totalFilteredUsers,
      } = res.data.data;

      setRoleData(roleData);
      setEmployees(users);
      setTotalPages(totalPages || 1);
      setTotalStaff(totalUsers);
      setTotalFilteredUsers(totalFilteredUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pageParam, keyword, filter, filters.departmentIds, filters.status]);

  const handleCreateUser = async (data: CreateUserInterface) => {
    try {
      const response = await axios.post('/users/create-user', data);

      if (response.status !== 201) {
        throw new Error('Failed to create user');
      }

      toast.success(t('employee.createSuccess'));
      setShowCreateForm(false);

      await fetchData();
    } catch (error) {
      if (isAxiosError(error)) {
        const errData = error.response?.data;

        if (errData?.errors) {
          throw errData.errors;
        }

        throw { general: errData?.message || 'Failed to create user' };
      } else {
        throw { general: 'Unexpected error occurred' };
      }
    }
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', page.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const canCreateEmployee = userPermissions.includes(
    PermissionEnum.CREATE_EMPLOYEE,
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-6">
      <EmployeeHeader
        onAddEmployee={() => setShowCreateForm(true)}
        canCreateEmployee={canCreateEmployee}
      />
      <EmployeeOverview
        roleAndSexData={roleData}
        totalStaff={totalStaff}
        onFilter={handleFilter}
      />
      <div className="flex items-center mt-8">
        <Search onSearch={handleSearch} note={1} />
        <EmployeeFilter
          onFilterChange={(f) => {
            setFilters(f);
            // chỉ reset về page 1
            const newSearchParams = new URLSearchParams(
              searchParams.toString(),
            );
            newSearchParams.set('page', '1');
            router.push(`?${newSearchParams.toString()}`);
          }}
        />
      </div>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <Table employees={employees} />
      )}
      {totalFilteredUsers > 0 ? (
        <Pagination
          totalItems={totalFilteredUsers}
          currentPage={pageParam}
          onChangePage={handlePageChange}
        />
      ) : (
        <div></div>
      )}
      <CreateUserForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}
