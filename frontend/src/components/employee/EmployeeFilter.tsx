import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Funnel } from 'lucide-react';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/department/api-response.interface';
import { DepListData } from '@/types/department/department.interface';
import { toast } from 'react-toastify';
import { UserStatus } from '@/enums/user-status.enum';
import { statusKeyMap } from '@/lib/utils';

export default function EmployeeFilter({
  onFilterChange,
}: {
  onFilterChange: (filters: {
    departmentIds: number[];
    status: UserStatus[];
  }) => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [depList, setDepList] = useState<DepListData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<UserStatus[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get<ApiResponse<DepListData>>(
        `${process.env.NEXT_PUBLIC_API_URL}/departments?page=1`,
      );
      setDepList(res.data.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(t('department.failToFetch'));
      toast.error(t('department.failToFetch'));
    }
  };

  const toggleDepartment = (id: number) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const toggleStatus = (status: UserStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    onFilterChange({
      departmentIds: selectedDepartments,
      status: selectedStatuses,
    });
  }, [selectedDepartments, selectedStatuses]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border b border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition"
      >
        <Funnel className="w-4 h-4 text-gray-600" />
        <span className="font-medium">{t('common.filter')}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] bg-white border rounded-xl shadow-lg p-4 z-50">
          {/* filter by department */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {t('department.departmentName')}
            </p>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {depList &&
              Array.isArray(depList.items) &&
              depList.items.length > 0 ? (
                depList.items.map((dep) => (
                  <label
                    key={dep.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dep.id)}
                      onChange={() => toggleDepartment(dep.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>{dep.departmentName}</span>
                  </label>
                ))
              ) : (
                <span className="text-sm text-gray-500">
                  {t('common.noData')}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <hr className="my-2" />

          {/* filter by status */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {t('common.status')}
            </p>
            <div className="flex flex-col gap-2">
              {[
                UserStatus.ACTIVE,
                UserStatus.INACTIVE,
                UserStatus.SUSPENDED,
              ].map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>
                    {t(`employee.statusTypes.${statusKeyMap[status]}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
