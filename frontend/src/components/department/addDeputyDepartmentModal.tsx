'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Header } from '@/components/common/ui/Headers';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ApiResponse } from '@/types/department/api-response.interface';
import { Employee, GetEmployeesResponse } from '@/types/common/common.type';

interface addDeputyDepartmentModalProps {
  setDeputyName: (v: string) => void;
  setShowDialog: (v: boolean) => void;
  setDeputyId: (v: number) => void;
  currentDeputyId: number;
  currentHeadId: number;
  initialSelectedIds: number[];
}

export default function AddDeputyDepartmentModal({
  setShowDialog,
  setDeputyName,
  setDeputyId,
  currentDeputyId,
  currentHeadId,
  initialSelectedIds,
}: addDeputyDepartmentModalProps) {
  const [empList, setEmpList] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number>(currentDeputyId || 0);
  const [errorAvatars, setErrorAvatars] = useState<Record<string, boolean>>({});

  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<ApiResponse<GetEmployeesResponse>>(
          `${process.env.NEXT_PUBLIC_API_URL}/users/UserList`,
        );
        console.log('check res');
        console.log(res.data?.data);
        if (res && res.data?.data.employees) {
          let list: Employee[] = res.data.data.employees;
          const selectedEmployeeIds = [currentHeadId, ...initialSelectedIds];
          list = list.filter((emp) => !selectedEmployeeIds.includes(emp.id));
          console.log(list);
          if (currentDeputyId) {
            const idx = list.findIndex((m) => m.id === currentDeputyId);
            if (idx > -1) {
              const [head] = list.splice(idx, 1);
              list.unshift(head);
            }
          }
          setEmpList(list);
        }
      } catch {
        toast.error(t('department.failToFetchMembers'));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentDeputyId) {
      setSelectedId(currentDeputyId || 0);
    }
  }, [currentDeputyId]);

  const filtered = empList.filter((member) =>
    `${member.fullName} ${member.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (member: Employee) => {
    setDeputyName(member.fullName);
    setDeputyId(member.id);
    setSelectedId(member.id);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <div className="flex gap-5">
      <div className="inset-0 flex items-center justify-center z-50">
        <div
          className={`bg-white rounded-lg shadow-2xl p-6 h-auto max-h-[85vh] flex flex-col w-[35vw]`}
        >
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
            <div className="grid grid-cols-15 mb-1 text-sm font-semibold text-gray-500 px-1">
              <p className="col-span-1 text-center">{t(`department.select`)}</p>
              <p className="col-span-8 uppercase pl-11">{t(`employee.name`)}</p>
              <p className="col-span-4">EMAIL</p>
              {/* <p className="col-span-2 uppercase text-center">
                {t(`department.permissionTitle`)}
              </p> */}
            </div>
          )}

          {/* Member List */}
          <div className="flex-1 overflow-y-auto rounded border border-gray-200">
            <ul className="w-full">
              {filtered.length > 0 ? (
                filtered.map((member, index) => (
                  <li
                    key={member.id}
                    className={`grid grid-cols-15 items-center py-2 px-2 text-sm ${
                      index % 2 === 0 ? 'bg-[#f1f1f1]' : 'bg-white'
                    }`}
                  >
                    {/* Radio select */}
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="radio"
                        name="selected"
                        checked={selectedId === member.id}
                        onChange={() => handleSelect(member)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                    </div>

                    {/* Avatar + Name */}
                    <div className="col-span-8 flex items-center gap-3">
                      {errorAvatars[member.id] ? (
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
                              [member.id]: true,
                            }))
                          }
                        />
                      )}
                      <span className="text-sm text-gray-800">
                        {member.fullName}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="col-span-5 truncate">{member.email}</div>
                  </li>
                ))
              ) : (
                <p>{t(`department.noMembersFound`)}</p>
              )}
            </ul>
          </div>

          {/* Close Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleClose}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
            >
              {t(`common.close`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
