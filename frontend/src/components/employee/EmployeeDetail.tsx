import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@/types/employee/users.interface';
import { Avatar } from '@/components/common/ui/avatar';
import {
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Building,
  Calendar,
  Shield,
  CheckCircle,
  Star,
  IdCard,
  ArrowLeft,
} from 'lucide-react';
import {
  getRoleText,
  getStatusText,
  getPermissionCategory,
  getPermissionText,
} from './profile-function';
import { useRouter } from 'next/navigation';
import { getDecodedToken } from '@/lib/getDecodedToken';

interface EmployeeDetailProps {
  employee: User | null;
  onClose: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  onClose,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const decoded = getDecodedToken();
  const currentUserId = decoded?.userId;

  if (!employee) {
    return null;
  }

  const getSexText = (sex: number) => {
    return sex === 1 ? t('dashboard.male') : t('dashboard.female');
  };

  const handleEdit = (id: number) => {
    router.push(`/employee/profile/edit/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-4 border border-white/20">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('employee.detail')}
              </h1>
              <p className="text-gray-600 mt-1">
                Employee Information & Permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Profile & Basic Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar
                    src={employee.avatarUrl}
                    alt={employee.fullName}
                    fallback={employee.fullName}
                    className="w-32 h-32 text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white mx-auto ring-4 ring-white shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                  {employee.fullName}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                    <Star className="w-4 h-4 mr-1" />
                    {getRoleText(employee.roles)}
                  </span>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                      employee.status === 1
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    }`}
                  >
                    {getStatusText(employee.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {t('common.departments')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {employee.departments?.length || 0}
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-indigo-500" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {t('employee.showPermissions')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {employee.userPermissions?.length || 0}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Contact & Personal Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  {t('employee.contactInfo')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        {t('employee.email')}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <IdCard className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        {t('employee.identityNumber')}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {employee.identityNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        {t('employee.phone')}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {employee.phone}
                      </p>
                    </div>
                  </div>
                  {employee.address && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          {t('employee.address')}
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {employee.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <UserIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  {t('employee.detail')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        {t('employee.sex')}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {getSexText(employee.sex)}
                      </p>
                    </div>
                  </div>
                  {employee.dateOfBirth && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          {t('employee.dateOfBirth')}
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {new Date(employee.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        {t('employee.createdAt')}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Departments Section */}
            {employee.departments && employee.departments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Building className="w-4 h-4 text-indigo-600" />
                  </div>
                  {t('common.departments')} ({employee.departments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employee.departments.map((department, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {department}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions Section */}
            {employee.userPermissions &&
              employee.userPermissions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="w-4 h-4 text-yellow-600" />
                    </div>
                    {t('common.permissions')} ({employee.userPermissions.length}
                    )
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.userPermissions.map((permissionId) => {
                      const permissionInfo =
                        getPermissionCategory(permissionId);
                      const IconComponent = permissionInfo.icon;

                      return (
                        <div
                          key={permissionId}
                          className={`flex items-center space-x-4 p-4 ${permissionInfo.bgColor} rounded-xl border b border-gray-200 hover:shadow-lg transition-all duration-200`}
                        >
                          <div
                            className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm`}
                          >
                            <IconComponent
                              className={`w-5 h-5 ${permissionInfo.textColor}`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className={`text-xs font-medium ${permissionInfo.textColor} uppercase tracking-wider`}
                              >
                                {permissionInfo.category}
                              </p>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-gray-900 font-semibold text-sm leading-tight">
                              {getPermissionText(permissionId)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            {employee.userId === currentUserId && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleEdit(employee.userId)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {t('common.edit')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
