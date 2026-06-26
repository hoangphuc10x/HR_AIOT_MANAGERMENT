'use client';

import { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axios';
import { InputText } from '@/components/common/ui/InputText';
import { Label } from '@/components/common/ui/Label';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import AddMembersDepartmentModal from './addMembersDepartmentModal';
import AddHeadDialog from './addHeadDepartmentModal';
import { ApiResponse } from '@/types/department/api-response.interface';
import AddDeputyDepartmentModal from './addDeputyDepartmentModal';
import AddLevelDepartmentModal from './addLevelDepartmentModal';
import {
  Department,
  Employee,
  UpdateDepartmentPayload,
} from '@/types/department/update-department.interface';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/common/jwt.interface';
import MembersDisplay from './memberDisplay';

interface EditDepartmentModalProps {
  dialogShow: boolean;
  setShowDialog: (v: boolean) => void;
  onSuccess: () => void;
  departmentId: number;
  setDepartmentId: (v: number) => void;
  onReload: () => void;
}

type Level = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
};

export default function EditDepartmentModal({
  dialogShow,
  setShowDialog,
  onSuccess,
  departmentId,
  setDepartmentId,
  onReload,
}: EditDepartmentModalProps) {
  const { t, i18n } = useTranslation();
  const depNameRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const [headId, setHeadId] = useState<number>(0);
  const [deputyId, setDeputyId] = useState<number>(0);
  const [headName, setHeadName] = useState<string>('');
  const [deputyName, setDeputyName] = useState<string>('');
  const [headDialog, setHeadDialog] = useState<boolean>(false);
  const [deputyDialog, setDeputyDialog] = useState<boolean>(false);
  const [membersModal, setMembersModal] = useState<boolean>(false);
  const [levelDialog, setLevelDialog] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [isHeadPermissionOpen, setIsHeadPermissionOpen] =
    useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<
    { id: number; fullName: string }[]
  >([]);
  const [initialDepartment, setInitialDepartment] = useState<Department | null>(
    null,
  );

  const levels: Level[] = [1, 2, 3].map((id) => ({
    id,
    name: t(`department.levels.${id}.name`) as string,
    description: t(`department.levels.${id}.description`) as string,
    permissions: t(`department.levels.${id}.permissions`, {
      returnObjects: true,
    }) as string[],
  }));

  const currentLevel = levels.find((lvl) => lvl.id === selectedLevel);

  const handleUpdate = async () => {
    const token = localStorage.getItem('access_token') || '';
    const decode: JwtPayload = jwtDecode(token);
    const currentUserId = decode.userId;

    if (!initialDepartment) {
      toast.error(t('department.noDepartmentData'));
      return;
    }

    const depName = depNameRef.current?.value || '';
    const status = Number(statusRef.current?.value);

    if (!depName) {
      toast.error(t('department.requiredName'));
      return;
    }

    const payload: UpdateDepartmentPayload = {
      userId: currentUserId,
      departmentId,
    };

    if (depName !== initialDepartment.departmentName) {
      payload.newDepartmentName = depName;
    }

    if (
      headId !==
      initialDepartment.employee.find((e: Employee) => e.position === 1)
        ?.employeeId
    ) {
      payload.newHeadDepartmentId = headId;
    }

    if (
      deputyId !==
      initialDepartment.employee.find((e: Employee) => e.position === 2)
        ?.employeeId
    ) {
      payload.newDeputyDepartmentId = deputyId;
    }

    const oldMembers = initialDepartment.employee
      .filter((e: Employee) => e.position === 3)
      .map((e: Employee) => e.employeeId)
      .sort();
    const newMembers = selectedMembers.map((m) => m.id).sort();

    if (JSON.stringify(oldMembers) !== JSON.stringify(newMembers)) {
      payload.listOfUserIdToAdd = newMembers;
    }

    if (selectedLevel !== initialDepartment.level) {
      payload.level = selectedLevel;
    }

    if (status !== initialDepartment.status) {
      payload.status = status;
    }

    if (Object.keys(payload).length <= 2) {
      toast.info(t('department.noChanges'));
      return;
    }

    try {
      const res = await axios.patch<ApiResponse<{ message: string }>>(
        `${process.env.NEXT_PUBLIC_API_URL}/departments`,
        payload,
      );
      toast.success(res.data.data.message);
      setShowDialog(false);
      setHeadDialog(false);
      setDeputyDialog(false);
      setMembersModal(false);
      setLevelDialog(false);
      setHeadName('');
      setHeadId(0);
      setDeputyName('');
      setDeputyId(0);
      setSelectedMembers([]);
      setDepartmentId(0);
      onSuccess();
      onReload();
    } catch {
      toast.error(t('department.duplicateName'));
    }
  };

  const handleRemoveMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.filter((member) => member.id !== memberId),
    );
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
      try {
        const fetchDepartmentData = async () => {
          const res = await axios.get<ApiResponse<Department>>(
            `/departments/dep_id/${departmentId}`,
          );
          const department = res.data.data;
          setInitialDepartment(department);
          const selectedEmp: { id: number; fullName: string }[] = [];
          for (const emp of department.employee) {
            if (emp.position === 1) {
              setHeadId(Number(emp.employeeId));
              setHeadName(emp.fullName);
            } else if (emp.position === 2) {
              setDeputyId(Number(emp.employeeId));
              setDeputyName(emp.fullName);
            } else if (emp.position === 3) {
              selectedEmp.push({ id: emp.employeeId, fullName: emp.fullName });
            }
          }
          setSelectedMembers(selectedEmp);
          setSelectedLevel(department.level);
          if (depNameRef.current) {
            depNameRef.current.value = department.departmentName;
          }
          if (statusRef.current) {
            statusRef.current.value = department.status.toString();
          }
        };
        fetchDepartmentData();
      } catch (error) {
        toast.error(t('department.fetchError'));
      }
    }
  }, [i18n.isInitialized, departmentId, t]);

  useEffect(() => {
    if (!dialogShow) {
      if (depNameRef.current) depNameRef.current.value = '';
      if (statusRef.current) statusRef.current.value = '';
      setDepartmentId(0);
      setHeadId(0);
      setDeputyId(0);
      setHeadName('');
      setDeputyName('');
      setSelectedMembers([]);
      setHeadDialog(false);
      setLevelDialog(false);
      setDeputyDialog(false);
      setMembersModal(false);
      setIsHeadPermissionOpen(false);
      document.body.style.overflow = '';
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [dialogShow, setDepartmentId]);

  if (!isReady || !dialogShow) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center h-screen p-4">
        <div
          className={`flex ${isHeadPermissionOpen && headDialog ? 'gap-5' : 'gap-10'}`}
        >
          <div
            className={`bg-white text-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 ${
              isHeadPermissionOpen && headDialog
                ? 'w-[35vw]'
                : headDialog || membersModal || deputyDialog || levelDialog
                  ? 'w-[45vw]'
                  : 'w-[55vw]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-t-xl">
              <h2 className="text-xl font-semibold">
                {t('department.updateDepartment')}
              </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* Department Name */}
              <div>
                <h2 className="mb-0">{t('department.departmentName')}</h2>
                <InputText name="departmentName" ref={depNameRef} />
              </div>

              {/* Department Status */}
              <div>
                <h2 className="mb-0">{t('common.status')}</h2>
                <select
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                  name="status"
                  ref={statusRef}
                >
                  <option value="1">{t(`department.status.${1}`)}</option>
                  <option value="2">{t(`department.status.${2}`)}</option>
                </select>
              </div>

              {/* Department Head */}
              <div>
                <h2>{t('department.headOfDepartment')}</h2>
                <div
                  className="mt-1 bg-white border-2 border-gray-300 hover:border-blue-400 px-4 py-3 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => {
                    setHeadDialog(true);
                    setMembersModal(false);
                    setDeputyDialog(false);
                    setLevelDialog(false);
                  }}
                >
                  <span
                    className={headName ? 'text-gray-800' : 'text-gray-500'}
                  >
                    {headName || t('department.selectHead')}
                  </span>
                  <div className="flex items-center gap-2">
                    {headName && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeadName('');
                          setHeadId(0);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    )}
                    <span className="text-blue-600 font-bold">➤</span>
                  </div>
                </div>
              </div>

              {/* Department Deputy */}
              <div>
                <h2>{t('department.deputyOfDepartment')}</h2>
                <div
                  className="mt-1 bg-white border-2 border-gray-300 hover:border-blue-400 px-4 py-3 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => {
                    setDeputyDialog(true);
                    setHeadDialog(false);
                    setMembersModal(false);
                    setLevelDialog(false);
                  }}
                >
                  <span
                    className={deputyName ? 'text-gray-800' : 'text-gray-500'}
                  >
                    {deputyName || t('department.selectDeputy')}
                  </span>
                  <div className="flex items-center gap-2">
                    {deputyName && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeputyName('');
                          setDeputyId(0);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    )}
                    <span className="text-blue-600 font-bold">➤</span>
                  </div>
                </div>
              </div>

              {/* Department Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label name={t('department.members')} />
                  <button
                    onClick={() => {
                      setMembersModal(true);
                      setHeadDialog(false);
                      setDeputyDialog(false);
                      setLevelDialog(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span>+</span>
                    {t('department.addMembers')}
                  </button>
                </div>
                <MembersDisplay
                  selectedMembers={selectedMembers}
                  onClearAll={() => {
                    setSelectedMembers([]);
                    setMembersModal(false);
                  }}
                  onRemoveMember={handleRemoveMember}
                />
              </div>

              {/* Department Level */}
              <div>
                <Label name={t('department.levelOfDepartment')} />
                <div
                  className="mt-1 bg-white border-2 border-gray-300 hover:border-blue-400 px-4 py-3 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => {
                    setLevelDialog(true);
                    setHeadDialog(false);
                    setMembersModal(false);
                    setDeputyDialog(false);
                  }}
                >
                  <span className="text-gray-800 font-medium">
                    {t('department.level')} {selectedLevel} -{' '}
                    {currentLevel?.name}
                  </span>
                  <span className="text-blue-600 font-bold">➤</span>
                </div>

                {/* Display permissions for selected level */}
                {currentLevel && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t('department.permissionsForLevel')}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {currentLevel.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-8 py-6 rounded-b-xl border-t border-gray-200">
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  onClick={() => setShowDialog(false)}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  onClick={handleUpdate}
                >
                  <span>✓</span>
                  {t('common.update')}
                </button>
              </div>
            </div>
          </div>

          {/* Modals */}
          {headDialog && (
            <AddHeadDialog
              setShowDialog={setHeadDialog}
              setHeadId={setHeadId}
              setHeadName={setHeadName}
              currentHeadId={headId}
              currentDeputyId={deputyId}
              initialSelectedIds={selectedMembers.map((m) => m.id)}
            />
          )}
          {deputyDialog && (
            <AddDeputyDepartmentModal
              setShowDialog={setDeputyDialog}
              setDeputyId={setDeputyId}
              setDeputyName={setDeputyName}
              currentDeputyId={deputyId}
              currentHeadId={headId}
              initialSelectedIds={selectedMembers.map((m) => m.id)}
            />
          )}
          {levelDialog && (
            <AddLevelDepartmentModal
              setShowDialog={setLevelDialog}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
            />
          )}
          {membersModal && (
            <AddMembersDepartmentModal
              setShowDialog={setMembersModal}
              setSelectedMembers={setSelectedMembers}
              initialSelectedIds={selectedMembers.map((m) => m.id)}
              currentHeadId={headId}
              currentDeputyId={deputyId}
            />
          )}
        </div>
      </div>
    </>
  );
}
