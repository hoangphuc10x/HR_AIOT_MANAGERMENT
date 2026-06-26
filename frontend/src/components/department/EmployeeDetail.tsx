import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@/types/employee/users.interface';
import { Avatar } from '@/components/common/ui/avatar';
import {
  X,
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Building,
  Calendar,
} from 'lucide-react';

interface EmployeeDetailProps {
  employee: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !employee) {
    return null;
  }

  const getSexText = (sex: number) => {
    return sex === 1 ? t('dashboard.male') : t('dashboard.female');
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return t('employee.active');
      case 2:
        return t('employee.inactive');
      default:
        return t('employee.statusTypes.inactive');
    }
  };

  const getRoleText = (roles: number[]) => {
    const roleNames = roles.map((role) => {
      switch (role) {
        case 1:
          return t('employee.roles.ADMIN');
        case 2:
          return t('employee.roles.STAFF');
        default:
          return 'UNKNOWN';
      }
    });
    return roleNames.join(', ');
  };

  return (
    <div
      className="absolute bg-black/40 z-50 flex items-center justify-center"
      style={{
        top: '0px',
        left: '0px',
        right: '0',
        bottom: '0',
      }}
      onClick={onClose} // Click into overlay to close
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-6 max-h-[calc(100vh-120px)] overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent event bubbling when clicking on content
      >
        {/* Header */}
        <div className="px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('employee.detail')}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              onClose();
            }}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-8 overflow-y-auto max-h-[calc(100vh-240px)]"
          onClick={(e) => e.stopPropagation()} // Prevent event bubbling for all content
        >
          {/* Profile Section */}
          <div className="flex items-center space-x-6 mb-8 p-6 bg-gray-50 rounded-xl">
            <Avatar
              src={employee.avatarUrl}
              alt={employee.fullName}
              fallback={employee.fullName.charAt(0)}
              className="w-24 h-24 text-xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            />
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {employee.fullName}
              </h3>
              <div className="flex items-center space-x-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getRoleText(employee.roles)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {getStatusText(employee.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Information Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t('employee.email')}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {employee.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t('employee.phone')}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {employee.phone}
                    </p>
                  </div>
                </div>
                {employee.departments && employee.departments.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <Building className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {t('employee.department')}
                      </p>
                      <p className="text-gray-900 font-medium">
                        {employee.departments.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <UserIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t('employee.sex')}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {getSexText(employee.sex)}
                    </p>
                  </div>
                </div>
                {employee.dateOfBirth && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {t('employee.dateOfBirth')}
                      </p>
                      <p className="text-gray-900 font-medium">
                        {new Date(employee.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {t('employee.address')}
                      </p>
                      <p className="text-gray-900 font-medium">
                        {employee.address}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-50 p-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t('employee.createdAt')}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
