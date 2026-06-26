'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Header } from '@/components/common/ui/Headers';
import { useTranslation } from 'react-i18next';
import { ApiResponse } from '@/types/department/api-response.interface';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { Employee, GetEmployeesResponse } from '@/types/common/common.type';
import { getDecodedToken } from '@/lib/getDecodedToken';

interface AddMembersDepartmentModalProps {
  fetchData?: () => void;
  departmentId?: number;
  isEditMode?: boolean;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedMembers?: React.Dispatch<
    React.SetStateAction<{ id: number; fullName: string }[]>
  >;
  initialSelectedIds?: number[];
  currentHeadId?: number;
  currentDeputyId?: number;
}
export default function AddMembersDepartmentModal({
  fetchData,
  departmentId,
  isEditMode,
  setShowDialog,
  setSelectedMembers,
  initialSelectedIds,
  currentDeputyId,
  currentHeadId,
}: AddMembersDepartmentModalProps) {
  const [lockedIds, setLockedIds] = useState<number[]>([]);
  const [empList, setEmpList] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>(
    initialSelectedIds || [],
  );
  const [didInitialReorder, setDidInitialReorder] = useState(false);

  const [errorAvatars, setErrorAvatars] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (initialSelectedIds) {
      setSelectedIds(initialSelectedIds);
    }
  }, [initialSelectedIds]);

  const handleSelect = (id: number) => {
    setSelectedIds((prevIds) =>
      prevIds.includes(id) ? prevIds.filter((i) => i !== id) : [...prevIds, id],
    );
  };

  const handleInvite = async () => {
    const decode = getDecodedToken();
    const userId = decode?.userId;

    try {
      await axios.patch(`/departments`, {
        userId: userId,
        departmentId: departmentId,
        listOfUserIdToAdd: selectedIds.filter((id) => !lockedIds.includes(id)),
      });
      if (fetchData) {
        fetchData();
      }
      handleClose();
      toast.success('Invite successfully');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Invite fail');
      } else {
        toast.error('fetch fail');
      }
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setSelectedIds([]);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<ApiResponse<GetEmployeesResponse>>(
          `${process.env.NEXT_PUBLIC_API_URL}/users/UserList`,
        );
        if (res && res.data?.data.employees) {
          let list = res.data.data.employees;
          const selectedEmployeeIds = [currentHeadId, currentDeputyId];
          list = list.filter((emp) => !selectedEmployeeIds.includes(emp.id));
          setEmpList(list);
        }
      } catch {
        toast.error(t('department.failToFetchMembers'));
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (didInitialReorder) return;
    if (empList.length === 0) return;

    // Prefer initial pick list from props; if not, use lock list when editing
    const seedIds =
      initialSelectedIds && initialSelectedIds.length > 0
        ? initialSelectedIds
        : lockedIds && lockedIds.length > 0
          ? lockedIds
          : [];

    if (seedIds.length === 0) return;

    setEmpList((prev) => {
      const set = new Set(seedIds);
      const selected = prev.filter((m) => set.has(m.id));
      const unselected = prev.filter((m) => !set.has(m.id));
      return [...selected, ...unselected];
    });

    setDidInitialReorder(true);
  }, [empList, initialSelectedIds, lockedIds, didInitialReorder]);

  const filtered = empList.filter((member) =>
    `${member.fullName} ${member.email} `
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );
  useEffect(() => {
    if (initialSelectedIds && initialSelectedIds.length > 0) {
      setSelectedIds(initialSelectedIds);
    }
  }, [initialSelectedIds]);
  useEffect(() => {
    if (departmentId) {
      setLockedIds(initialSelectedIds || []);
    }
  }, [isEditMode]);
  useEffect(() => {
    if (setSelectedMembers) {
      if (empList.length === 0) return;

      const newSelectedMembers = empList
        .filter((m) => selectedIds.includes(m.id))
        .map((m) => ({ id: m.id, fullName: m.fullName }));

      setSelectedMembers((prev) => {
        if (
          prev.length === newSelectedMembers.length &&
          prev.every((v, i) => v.id === Number(newSelectedMembers[i].id))
        ) {
          return prev;
        }
        return newSelectedMembers;
      });
    }
  }, [selectedIds, empList]);
  return (
    <div
      className={`${departmentId ? 'fixed bg-black/30' : ''} inset-0 flex items-center justify-center z-50`}
    >
      <div className="bg-white rounded-lg shadow-2xl p-6 w-[35vw] h-auto max-h-[85vh] flex flex-col">
        <Header name={t(`department.membersList`)} />

        {/* Search Box */}
        <div className="relative w-full mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t(`department.searchByNameOrEmail`)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table Header */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-7 mb-1 text-sm font-semibold text-gray-500 px-1">
            <p className="col-span-1 text-center">{t(`department.select`)}</p>
            <p className="col-span-4 uppercase pl-11">{t(`employee.name`)}</p>
            <p className="col-span-2">EMAIL</p>
          </div>
        )}

        {/* Member List */}
        <div className="flex-1 overflow-y-auto rounded border border-gray-200">
          <ul className="w-full">
            {filtered.length > 0 ? (
              filtered.map((member, index) => (
                <li
                  key={member.id.toString()}
                  className={`grid grid-cols-7 items-center py-2 px-2 text-sm ${
                    index % 2 === 0 ? 'bg-[#f1f1f1]' : 'bg-white'
                  }`}
                >
                  {/* Checkbox select */}
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      name="selected"
                      checked={selectedIds.includes(member.id)}
                      onChange={() => {
                        if (isEditMode && lockedIds.includes(member.id)) {
                          return;
                        }
                        handleSelect(member.id);
                      }}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                  </div>

                  {/* Avatar + Name */}
                  <div className="col-span-4 flex items-center gap-3">
                    {errorAvatars[member.id.toString()] ? (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                        {member.fullName
                          .trim()
                          .split(' ')
                          .slice(-1)[0]
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    ) : (
                      <Image
                        src={'/images/logo.png'}
                        alt={`${member.fullName}'s avatar`}
                        width={50}
                        height={50}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={() =>
                          setErrorAvatars((prev) => ({
                            ...prev,
                            [member.id.toString()]: true,
                          }))
                        }
                      />
                    )}
                    <span className="text-sm text-gray-800">
                      {member.fullName}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="col-span-2 truncate">{member.email}</div>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">
                {t(`department.noMembersFound`)}
              </li>
            )}
          </ul>
        </div>

        {/* Close Button */}
        <div className="mt-4 flex justify-center gap-2">
          {departmentId && (
            <button
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded"
              onClick={() => handleInvite()}
            >
              {t(`common.add`)}
            </button>
          )}
          <button
            onClick={() => handleClose()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
          >
            {t(`common.close`)}
          </button>
        </div>
      </div>
    </div>
  );
}
